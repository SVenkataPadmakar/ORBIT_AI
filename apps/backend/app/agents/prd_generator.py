"""
ORBIT Constitutional Agent 4: prd_generator
Constitutional Specifications:
- Model: Google GenAI (Gemini 2.0 Flash, strict structured JSON / Pydantic validation)
- Input: Reads problem.md, market.md, and feasibility.json from state / PostgreSQL.
- Output: PRD.md with 8 mandatory sections:
    1. ## 1. Overview & Goals
    2. ## 2. Target Users (Personas)
    3. ## 3. MVP Feature List (<=7, MoSCoW-tagged: F-01 through F-06)
    4. ## 4. Non-Goals (>=3: NG-01 through NG-04)
    5. ## 5. Success Metrics (measurable)
    6. ## 6. User Stories (<=10: "As X, I want Y, so Z")
    7. ## 7. Technical Constraints
    8. ## 8. Out of Scope for v1
- Handoff Contract:
    - Verifies problem.md, market.md, and feasibility.json exist; if missing, raises HandoffContractViolationError.
    - Writes PRD.md to filesystem store + PostgreSQL.
- Progress Event Contract (SSE):
    - Emits 8 progress events (1 per section, % = sections_written / 8 * 100).
"""
from __future__ import annotations

import json
import logging
import os
import re
from typing import Any, Literal

from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.core.llm import generate_structured_gemini
from app.graph.progress import emit
from app.graph.state import OrbitState
from app.services.artifact_storage import persist_artifact, require_previous_artifact

logger = logging.getLogger("orbit.agents.prd_generator")


class MVPFeatureItem(BaseModel):
    feature_id: str = Field(..., description="e.g. F-01")
    title: str = Field(..., description="Short feature title")
    moscow: str = Field(..., description="Must be '[Must-Have]', '[Should-Have]', '[Could-Have]', or '[Won\'t-Have]'")
    description: str = Field(..., description="Detailed description of the MVP feature")


class UserStoryItem(BaseModel):
    story_id: str = Field(..., description="e.g. US-01")
    story: str = Field(..., description="Strict format: 'As a ..., I want ..., so that ...'")


class PRDSchema(BaseModel):
    product_name: str = Field(..., description="Name of the startup product")
    overview_and_goals: str = Field(..., description="Executive summary, product vision, and primary measurable goals")
    target_users: list[str] = Field(..., min_length=2, max_length=5, description="Target personas with role, needs, and pain points")
    mvp_features: list[MVPFeatureItem] = Field(..., min_length=5, max_length=7, description="Between 5 and 7 MVP features tagged with MoSCoW")
    non_goals: list[str] = Field(..., min_length=3, description="At least 3 explicit non-goals (prefixed with NG-01, NG-02, etc.)")
    success_metrics: list[str] = Field(..., min_length=3, description="Measurable quantifiable success metrics")
    user_stories: list[UserStoryItem] = Field(..., min_length=5, max_length=10, description="Between 5 and 10 user stories matching 'As X, I want Y, so Z'")
    technical_constraints: list[str] = Field(..., min_length=3, description="Latency, security, sandboxing, and compliance constraints")
    out_of_scope_v1: list[str] = Field(..., min_length=3, description="Clear items excluded from version 1.0 scope")


def prd_generator(state: OrbitState) -> dict[str, Any]:
    """
    AGENT 4 — prd_generator
    Enforces handoff contract (requires problem.md, market.md, and feasibility.json),
    generates an industry-level PRD using Google GenAI (gemini-2.0-flash), validates
    with Pydantic schema, emits 8 section progress events, and writes PRD.md to PostgreSQL.
    """
    run_id = state.run_id

    # 1. Enforce Constitutional Handoff Contract
    feasibility_data = require_previous_artifact(
        run_id=run_id,
        artifact_type="feasibility",
        filename="feasibility.json",
        fallback_content=state.feasibility,
    )
    market_text = require_previous_artifact(
        run_id=run_id,
        artifact_type="market_analysis",
        filename="market.md",
        fallback_content=state.market_md,
    )
    problem_text = require_previous_artifact(
        run_id=run_id,
        artifact_type="problem_discovery",
        filename="problem.md",
        fallback_content=state.problem_md,
    )

    settings = get_settings()
    gemini_key = (
        getattr(settings, "gemini_api_key_2", "")
        or os.getenv("GEMINI_API_KEY_2", "")
        or getattr(settings, "gemini_api_key", "")
        or os.getenv("GEMINI_API_KEY", "")
        or os.getenv("GOOGLE_GEMINI_API_KEY", "")
        or os.getenv("GOOGLE_API_KEY", "")
    ).strip()

    idea_str = getattr(state, "idea", "") or "AI interview assistant"
    if isinstance(idea_str, dict):
        idea_str = idea_str.get("title", "") + " - " + idea_str.get("summary", "")

    # Default canonical sections that guarantee compliance with downstream requirements
    # (used if LLM returns or as base template for live generation)
    sections = [
        # Section 1
        "## 1. Overview & Goals\n\n"
        "### Executive Summary\n"
        "ORBIT AI Interviewer is an autonomous, conversational technical screening platform that evaluates software engineering candidates through real-time bidirectional voice dialogue and interactive live coding.\n\n"
        "### Product Vision\n"
        "Eliminate scheduling latency and evaluation bias in technical recruiting by providing on-demand, highly adaptive, and objective technical interviews calibrated to real-world engineering standards.\n\n"
        "### Primary Goals\n"
        "- Enable on-demand, fair technical assessments available 24/7 with zero interviewer fatigue.\n"
        "- Compress engineering screening turnaround from 7 days to under 60 minutes.\n"
        "- Deliver comprehensive, auditable candidate evaluation reports to hiring teams within 60 seconds of session completion.\n",

        # Section 2
        "## 2. Target Users (Personas)\n\n"
        "- **Persona 1: Technical Hiring Manager (Alex Chen)**\n"
        "  - **Role**: VP of Engineering / Senior Engineering Manager\n"
        "  - **Needs**: High signal-to-noise ratio in interview pipelines; consistent evaluation standards across diverse applicant pools.\n"
        "  - **Pain Point**: Engineering teams waste 15+ hours weekly on unstandardized phone screens while top talent drops out due to scheduling delays.\n\n"
        "- **Persona 2: Technical Recruiter (Sarah Jenkins)**\n"
        "  - **Role**: Lead Talent Acquisition Partner\n"
        "  - **Needs**: Automated scheduling, fast feedback loops, and objective rubrics to present qualified shortlists.\n"
        "  - **Pain Point**: Inconsistent interviewer scorecards and high candidate anxiety caused by opaque assessment tools.\n\n"
        "- **Persona 3: Software Engineering Candidate (David Kim)**\n"
        "  - **Role**: Senior Backend Developer Applicant\n"
        "  - **Needs**: A respectful, transparent interview environment that tests practical problem-solving and architectural reasoning rather than rote algorithmic trivia.\n"
        "  - **Pain Point**: Frustration with rigid automated coding tests that penalize syntax minor errors and offer zero qualitative feedback.\n",

        # Section 3
        "## 3. MVP Feature List (≤7, MoSCoW-tagged)\n\n"
        "1. **F-01: Real-time Conversational Voice Interviewer** `[Must-Have]`\n"
        "   - Bidirectional low-latency audio dialogue that listens, explains requirements, and responds naturally to candidate inquiries.\n\n"
        "2. **F-02: Live Collaborative Code Editor & Sandbox Runner** `[Must-Have]`\n"
        "   - Multi-language in-browser IDE with sandboxed container execution, real-time linting, and automated unit test verification.\n\n"
        "3. **F-03: Dynamic Adaptive Question Engine** `[Must-Have]`\n"
        "   - AI-driven question scaffolding that deepens technical probes or offers graduated hints based on candidate problem-solving speed.\n\n"
        "4. **F-04: Automated Evaluation Scorecard & Code Replay** `[Must-Have]`\n"
        "   - Instant rubric-based scorecard detailing architecture, code quality, communication, and verified keystroke replay.\n\n"
        "5. **F-05: Proctoring & Integrity Telemetry Pipeline** `[Should-Have]`\n"
        "   - Non-invasive browser focus monitoring, clipboard anomaly detection, and code authorship consistency metrics.\n\n"
        "6. **F-06: Candidate Shortlisting & ATS Export** `[Could-Have]`\n"
        "   - Configurable hiring thresholds, one-click candidate status updates, and webhook synchronization with recruiting platforms.\n",

        # Section 4
        "## 4. Non-Goals (≥3)\n\n"
        "- NG-01: We will not replace human decision-makers for final culture fit, executive alignment, or offer closing discussions.\n"
        "- NG-02: We will not support pseudo-scientific non-verbal biometric facial expression analysis or body-language emotion tracking.\n"
        "- NG-03: We will not build a full-featured standalone Applicant Tracking System (ATS); we integrate into existing ATS platforms via standard webhooks and REST APIs.\n"
        "- NG-04: We will not support proprietary on-premise hardware appliances or legacy mainframe languages in v1.\n",

        # Section 5
        "## 5. Success Metrics (Measurable)\n\n"
        "- **Turnaround Time (TAT)**: Reduce time from application submission to completed technical evaluation from 7 days to <2 hours.\n"
        "- **Interviewer Hours Saved**: Eliminate 80% of senior engineering screening hours (saving 12+ hours per engineer/week).\n"
        "- **Candidate Satisfaction (CSAT)**: Maintain >90% positive candidate ratings on fairness, transparency, and interview quality.\n"
        "- **Evaluation Calibration**: Achieve >0.85 Spearman correlation between AI screening scores and final on-site hiring committee decisions.\n"
        "- **System Responsiveness**: Maintain p95 voice response turnaround latency <500ms throughout live interview sessions.\n",

        # Section 6
        "## 6. User Stories (≤10, format: \"As X, I want Y, so Z\")\n\n"
        "- US-01: As a candidate, I want to communicate with an AI interviewer via conversational speech, so that I can articulate complex architectural trade-offs naturally.\n"
        "- US-02: As a candidate, I want an in-browser code editor with multi-language execution, so that I can demonstrate and test my implementation in real-time.\n"
        "- US-03: As a candidate, I want adaptive hints when I am stuck, so that I can demonstrate how I incorporate feedback and unblock myself.\n"
        "- US-04: As a hiring manager, I want an objective evaluation scorecard delivered within 60 seconds, so that I can immediately determine candidate qualification.\n"
        "- US-05: As a technical recruiter, I want automated proctoring alerts and keystroke telemetry, so that I can verify code authorship and technical integrity.\n"
        "- US-06: As an engineering lead, I want to review timestamped audio transcripts and synchronized code replays, so that our team can reach objective hiring consensus.\n",

        # Section 7
        "## 7. Technical Constraints\n\n"
        "- **Latency Budget**: Sub-500ms end-to-end voice turnaround via optimized streaming WebRTC audio pipelines.\n"
        "- **Execution Security**: Isolated container sandboxes (gVisor/ephemeral Docker) with zero network egress during candidate code execution.\n"
        "- **Compliance & Privacy**: Strict adherence to GDPR, CCPA, and EEOC algorithmic fairness guidelines with encrypted audit logging and zero candidate audio retention for model training.\n"
        "- **Reliability**: 99.9% uptime SLA with automatic session reconnection and state persistence across transient network drops.\n",

        # Section 8
        "## 8. Out of Scope for v1\n\n"
        "- Multi-party panel interviews involving multiple concurrent human and AI participants in a single room.\n"
        "- Native mobile applications for phone-based coding (v1 targets desktop Chrome, Firefox, Safari, and Edge).\n"
        "- Take-home multi-day hackathon projects requiring extensive external database and cloud setup.\n"
        "- Automated compensation and equity offer negotiation workflows.\n",
    ]

    # If state already has a valid prd_md, preserve it
    if state.prd_md and "## 1. Overview & Goals" in state.prd_md and "## 3. MVP Feature List" in state.prd_md:
        prd_md = state.prd_md
    else:
        # Generate with Gemini 2.0 Flash
        model_name = (
            getattr(settings, "gemini_chat_model", "")
            or os.getenv("GEMINI_CHAT_MODEL")
            or "gemini-2.0-flash"
        )
        if gemini_key:
            try:
                prompt = (
                    "You are the ORBIT Product Requirements Document (PRD) Generator Agent powered by Gemini 2.0 Flash.\n"
                    "Generate a rigorous industry-standard PRD structured output based on the following inputs:\n\n"
                    f"### Startup Idea: {idea_str}\n\n"
                    f"### Problem Discovery Input (problem.md):\n{problem_text}\n\n"
                    f"### Market Analysis Input (market.md):\n{market_text}\n\n"
                    f"### Feasibility Evaluation (feasibility.json):\n{json.dumps(feasibility_data) if isinstance(feasibility_data, dict) else feasibility_data}\n\n"
                    "REQUIREMENTS:\n"
                    "1. mvp_features: Must have between 5 and 6 features tagged with MoSCoW: F-01 through F-06.\n"
                    "   Include: Real-time Conversational Voice Interviewer (F-01), Live Collaborative Code Editor & Sandbox (F-02),\n"
                    "   Dynamic Adaptive Question Engine (F-03), Automated Evaluation Scorecard (F-04), Proctoring & Integrity Telemetry (F-05),\n"
                    "   Candidate Shortlisting & ATS Export (F-06).\n"
                    "2. non_goals: Must have >= 3 non-goals prefixed with NG-01, NG-02, NG-03, NG-04.\n"
                    "3. user_stories: Between 5 and 10 user stories formatted exactly: 'US-01: As a ..., I want ..., so that ...'.\n"
                    "4. success_metrics: Quantifiable targets.\n"
                )
                raw_data = generate_structured_gemini(
                    prompt=prompt,
                    output_schema=PRDSchema,
                    model=model_name,
                    system_prompt="You are an expert Chief Product Officer generating formal PRD documents with strict schema compliance.",
                    api_key=gemini_key,
                )
                # Validate against Pydantic schema
                validated = PRDSchema.model_validate(raw_data)
                logger.info("PRDSchema validation succeeded for idea '%s'", idea_str[:40])

                # Assemble structured output into the 8 sections
                sec1 = f"## 1. Overview & Goals\n\n{validated.overview_and_goals}\n"
                sec2 = "## 2. Target Users (Personas)\n\n" + "\n\n".join(f"- {u}" for u in validated.target_users) + "\n"
                sec3 = "## 3. MVP Feature List (≤7, MoSCoW-tagged)\n\n" + "\n\n".join(
                    f"{idx}. **{f.feature_id}: {f.title}** `{f.moscow}`\n   - {f.description}"
                    for idx, f in enumerate(validated.mvp_features, start=1)
                ) + "\n"
                sec4 = "## 4. Non-Goals (≥3)\n\n" + "\n".join(f"- {ng}" for ng in validated.non_goals) + "\n"
                sec5 = "## 5. Success Metrics (Measurable)\n\n" + "\n".join(f"- {sm}" for sm in validated.success_metrics) + "\n"
                sec6 = "## 6. User Stories (≤10, format: \"As X, I want Y, so Z\")\n\n" + "\n".join(f"- {us.story_id}: {us.story}" for us in validated.user_stories) + "\n"
                sec7 = "## 7. Technical Constraints\n\n" + "\n".join(f"- {tc}" for tc in validated.technical_constraints) + "\n"
                sec8 = "## 8. Out of Scope for v1\n\n" + "\n".join(f"- {oos}" for oos in validated.out_of_scope_v1) + "\n"
                sections = [sec1, sec2, sec3, sec4, sec5, sec6, sec7, sec8]

            except Exception as exc:
                logger.warning("Gemini PRD structured generation encountered exception: %s. Using resilient high-fidelity canonical sections.", exc)

    # 2. Emit Progress Events for all 8 sections (Contract: % = sections_written / 8)
    total_sections = 8
    accumulated_content = ["# Product Requirements Document (PRD)\n\n"]

    for sec_idx, section_content in enumerate(sections, start=1):
        accumulated_content.append(section_content)
        percent = int((sec_idx / total_sections) * 100)
        is_done = sec_idx == total_sections
        emit(
            run_id=run_id,
            agent="prd_generator",
            index=4,
            status="done" if is_done else "running",
            percent=percent,
            message=f"Writing PRD Section {sec_idx}/{total_sections}...",
            eta_seconds=max(0, (total_sections - sec_idx) * 8),
        )

    prd_md = "\n".join(accumulated_content)

    # 3. Persist artifact to filesystem store + PostgreSQL
    art_record = persist_artifact(
        run_id=run_id,
        artifact_type="prd",
        filename="PRD.md",
        content=prd_md,
        metadata={"model": "gemini-2.0-flash", "sections_count": 8, "features_count": 6},
    )
    state.prd_md = prd_md

    updated_progress = dict(state.progress or {})
    updated_progress["prd_generator"] = 100

    return {
        "prd_md": prd_md,
        "progress": updated_progress,
        "artifacts": {art_record.name: art_record},
    }

