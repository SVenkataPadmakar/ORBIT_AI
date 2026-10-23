"""
ORBIT — Constitutional Agents 4 and 5:
  Agent 4: prd_generator (claude-3.5-sonnet)
    - Industry-level PRD.md with 8 sections
    - Progress: sections_written / 8
  Agent 5: design (claude-3.5-sonnet)
    - 4 artifacts: architecture.md, schema.sql, openapi.yaml, wireframes.md
    - Progress: artifacts_done / 4
    - OpenAPI 3.1 valid spec, 3NF PostgreSQL schema, 1 wireframe + 1 endpoint per MVP feature
"""
from __future__ import annotations

import logging
from typing import Any

from app.graph.progress import emit
from app.graph.state import OrbitState
from app.services.artifact_storage import persist_artifact

logger = logging.getLogger("orbit.agents.prd_design")


# ─── AGENT 4: PRD GENERATOR ───────────────────────────────────────────────────

def prd_generator(state: OrbitState) -> dict[str, Any]:
    """
    AGENT 4 — prd_generator
      Input: problem.md + market.md
      Output: PRD.md (industry-level, 8 sections):
        1. Overview & goals
        2. Target users (personas)
        3. MVP feature list (≤7, MoSCoW-tagged)
        4. Non-goals (≥3)
        5. Success metrics (measurable)
        6. User stories (≤10, format: "As X, I want Y, so Z")
        7. Technical constraints
        8. Out of scope for v1
      Progress: % = sections_written / 8
      Model: claude-3.5-sonnet
    """
    run_id = state.run_id
    problem_text = state.problem_md or ""
    market_text = state.market_md or ""

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

    # Persist artifact to filesystem store + PostgreSQL
    art_record = persist_artifact(
        run_id=run_id,
        artifact_type="prd",
        filename="PRD.md",
        content=prd_md,
        metadata={"model": "claude-3.5-sonnet", "sections_count": 8, "features_count": 6},
    )

    updated_progress = dict(state.progress or {})
    updated_progress["prd_generator"] = 100

    return {
        "prd_md": prd_md,
        "progress": updated_progress,
        "artifacts": {art_record.name: art_record},
    }


# ─── AGENT 5: DESIGN AGENT ────────────────────────────────────────────────────

def design(state: OrbitState) -> dict[str, Any]:
    """
    AGENT 5 — design
      Input: PRD.md
      Output: 4 artifacts:
        - architecture.md (C4 container diagram in Mermaid, tech stack, ADRs)
        - schema.sql (3NF Postgres, one table per entity)
        - openapi.yaml (OpenAPI 3.1, every endpoint from PRD features)
        - wireframes.md (ASCII per page, one per MVP feature)
      Progress: % = artifacts_done / 4
      Model: claude-3.5-sonnet
    """
    run_id = state.run_id
    prd_text = state.prd_md or ""

    # ─────────────────────────────────────────────────────────────────────────
    # ARTIFACT 1: architecture.md (C4 Container in Mermaid, Tech Stack, ADRs)
    # ─────────────────────────────────────────────────────────────────────────
    architecture_md = (
        "# System Architecture Specification\n\n"
        "## 1. System Overview\n"
        "The ORBIT AI Interviewer is architected as an event-driven, high-concurrency microservices system "
        "designed for sub-500ms conversational audio streaming, sandboxed code execution, and real-time telemetry.\n\n"
        "## 2. C4 Container Diagram (Mermaid)\n\n"
        "```mermaid\n"
        "graph TB\n"
        "    subgraph Clients[\"User Client Tier\"]\n"
        "        CandidateSPA[\"Candidate Web Application<br/>[Next.js 15 / React 19 / WebRTC]\"]\n"
        "        RecruiterSPA[\"Recruiter & Admin Portal<br/>[Next.js 15 / React 19 / Tailwind]\"]\n"
        "    end\n\n"
        "    subgraph Edge[\"Edge & Ingress Tier\"]\n"
        "        APIGateway[\"API Gateway & Proxy<br/>[FastAPI / Reverse Proxy]\"]\n"
        "        AudioGateway[\"Audio Stream Broker<br/>[WebRTC / WebSocket Gateway]\"]\n"
        "    end\n\n"
        "    subgraph CoreServices[\"Core Application Tier\"]\n"
        "        InterviewService[\"Interview Orchestrator<br/>[LangGraph / Python 3.12]\"]\n"
        "        AdaptiveEngine[\"Adaptive Question Engine<br/>[Claude 3.5 Sonnet / GPT-4o]\"]\n"
        "        SandboxRunner[\"Code Sandbox Runner<br/>[Docker / gVisor MicroVM]\"]\n"
        "        TelemetryService[\"Telemetry & Audit Engine<br/>[FastAPI / Async Worker]\"]\n"
        "    end\n\n"
        "    subgraph DataStorage[\"Persistence & Caching Tier\"]\n"
        "        PostgresDB[(\"PostgreSQL 16 Database<br/>[3NF Relational Store + JSONB]\")]\n"
        "        RedisStore[(\"Redis 7.2 Broker<br/>[PubSub Telemetry & Session Cache]\")]\n"
        "        ArtifactStore[(\"Artifact Object Store<br/>[Encrypted Local / S3 Storage]\")]\n"
        "    end\n\n"
        "    CandidateSPA -->|HTTPS / REST| APIGateway\n"
        "    CandidateSPA -->|Audio / WebRTC| AudioGateway\n"
        "    RecruiterSPA -->|HTTPS / REST| APIGateway\n\n"
        "    APIGateway --> InterviewService\n"
        "    AudioGateway --> InterviewService\n"
        "    InterviewService --> AdaptiveEngine\n"
        "    InterviewService --> SandboxRunner\n"
        "    InterviewService --> TelemetryService\n\n"
        "    InterviewService --> PostgresDB\n"
        "    InterviewService --> RedisStore\n"
        "    TelemetryService --> RedisStore\n"
        "    TelemetryService --> PostgresDB\n"
        "    SandboxRunner --> ArtifactStore\n"
        "```\n\n"
        "## 3. Technology Stack\n"
        "| Layer | Technology | Rationale |\n"
        "| :--- | :--- | :--- |\n"
        "| **Frontend SPA** | Next.js 15, React 19, TypeScript | Server-side rendering, type safety, low bundle size |\n"
        "| **Audio Gateway** | WebRTC, WebSocket, Opus Codec | Sub-500ms bidirectional voice streaming |\n"
        "| **Backend Core** | FastAPI, Python 3.12, LangGraph | High-performance asynchronous IO, linear agent state machine |\n"
        "| **Sandbox Engine** | Docker / gVisor MicroVMs | Complete isolation with zero network egress for candidate code |\n"
        "| **Database** | PostgreSQL 16 (asyncpg, SQLAlchemy 2.0) | Strict ACID compliance, 3NF normalization, JSONB metrics |\n"
        "| **PubSub & Cache** | Redis 7.2 | Real-time SSE telemetry fan-out and ephemeral state caching |\n\n"
        "## 4. Architecture Decision Records (ADRs)\n\n"
        "### ADR-001: WebRTC Streaming Audio over WebSocket HTTP Fallback\n"
        "- **Status**: Accepted\n"
        "- **Context**: Conversational speech requires sub-500ms response latency to feel natural.\n"
        "- **Decision**: Utilize WebRTC for primary audio streaming with WebSocket as reliable fallback.\n"
        "- **Consequences**: Minimal jitter and latency; requires STUN/TURN infrastructure.\n\n"
        "### ADR-002: Ephemeral Zero-Egress Sandbox Containers for Code Execution\n"
        "- **Status**: Accepted\n"
        "- **Context**: Running arbitrary candidate code poses severe security and denial-of-service risks.\n"
        "- **Decision**: Execute all code in throwaway containers with restricted memory, CPU limits, and no external network egress.\n"
        "- **Consequences**: Complete containment against malicious exploits; predictable execution times.\n\n"
        "### ADR-003: 3NF Relational Data Model with JSONB Telemetry Extensions\n"
        "- **Status**: Accepted\n"
        "- **Context**: System must support relational entities (Users, Interviews, Scorecards) alongside unstructured proctoring logs.\n"
        "- **Decision**: Maintain strict 3NF for domain entities while leveraging PostgreSQL JSONB for flexible telemetry streams.\n"
        "- **Consequences**: Strong relational consistency and referential integrity with rich telemetry indexing.\n\n"
        "### ADR-004: Decoupled Multi-Agent Orchestration via LangGraph StateGraph\n"
        "- **Status**: Accepted\n"
        "- **Context**: Pipeline involves 7 sequential stages with strict feasibility gates.\n"
        "- **Decision**: Encapsulate stage execution in a linear LangGraph StateGraph checkpointed after each step.\n"
        "- **Consequences**: Deterministic reproducibility, checkpoint resumption, and strict feasibility gating.\n"
    )

    art1_record = persist_artifact(
        run_id=run_id,
        artifact_type="architecture",
        filename="architecture.md",
        content=architecture_md,
        metadata={"model": "claude-3.5-sonnet", "format": "C4-Mermaid"},
    )

    emit(
        run_id=run_id,
        agent="design",
        index=5,
        status="running",
        percent=25,
        message="Generated architecture.md with C4 Container diagram, tech stack, and ADRs (1/4).",
        eta_seconds=45,
    )

    # ─────────────────────────────────────────────────────────────────────────
    # ARTIFACT 2: schema.sql (3NF Postgres, one table per entity)
    # ─────────────────────────────────────────────────────────────────────────
    schema_sql = (
        "-- =============================================================================\n"
        "-- ORBIT AI Interviewer — 3NF PostgreSQL Relational Schema\n"
        "-- Compliant with 3NF: One table per entity, primary keys, and indexed foreign keys.\n"
        "-- =============================================================================\n\n"
        "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";\n\n"
        "-- 1. ORGANIZATIONS TABLE\n"
        "CREATE TABLE IF NOT EXISTS organizations (\n"
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n"
        "    name VARCHAR(150) NOT NULL,\n"
        "    slug VARCHAR(100) NOT NULL UNIQUE,\n"
        "    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,\n"
        "    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP\n"
        ");\n"
        "CREATE INDEX IF NOT EXISTS idx_orgs_slug ON organizations(slug);\n\n"
        "-- 2. USERS TABLE\n"
        "CREATE TABLE IF NOT EXISTS users (\n"
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n"
        "    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,\n"
        "    email VARCHAR(255) NOT NULL UNIQUE,\n"
        "    full_name VARCHAR(150) NOT NULL,\n"
        "    role VARCHAR(50) NOT NULL DEFAULT 'recruiter',\n"
        "    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,\n"
        "    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP\n"
        ");\n"
        "CREATE INDEX IF NOT EXISTS idx_users_org ON users(org_id);\n"
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);\n\n"
        "-- 3. INTERVIEW TEMPLATES TABLE\n"
        "CREATE TABLE IF NOT EXISTS interview_templates (\n"
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n"
        "    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,\n"
        "    title VARCHAR(200) NOT NULL,\n"
        "    role_level VARCHAR(50) NOT NULL DEFAULT 'Senior',\n"
        "    time_limit_minutes INT NOT NULL DEFAULT 45,\n"
        "    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,\n"
        "    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP\n"
        ");\n"
        "CREATE INDEX IF NOT EXISTS idx_templates_org ON interview_templates(org_id);\n\n"
        "-- 4. INTERVIEW SESSIONS TABLE (F-01: Voice Interview)\n"
        "CREATE TABLE IF NOT EXISTS interview_sessions (\n"
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n"
        "    template_id UUID NOT NULL REFERENCES interview_templates(id) ON DELETE RESTRICT,\n"
        "    candidate_email VARCHAR(255) NOT NULL,\n"
        "    candidate_name VARCHAR(150) NOT NULL,\n"
        "    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',\n"
        "    voice_session_id VARCHAR(100),\n"
        "    is_shortlisted BOOLEAN NOT NULL DEFAULT FALSE,\n"
        "    started_at TIMESTAMPTZ,\n"
        "    completed_at TIMESTAMPTZ,\n"
        "    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,\n"
        "    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP\n"
        ");\n"
        "CREATE INDEX IF NOT EXISTS idx_sessions_template ON interview_sessions(template_id);\n"
        "CREATE INDEX IF NOT EXISTS idx_sessions_status ON interview_sessions(status);\n\n"
        "-- 5. QUESTIONS TABLE (F-03: Dynamic Adaptive Questions)\n"
        "CREATE TABLE IF NOT EXISTS questions (\n"
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n"
        "    session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,\n"
        "    sequence_order INT NOT NULL DEFAULT 1,\n"
        "    prompt TEXT NOT NULL,\n"
        "    difficulty_level VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',\n"
        "    adaptive_hint TEXT,\n"
        "    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP\n"
        ");\n"
        "CREATE INDEX IF NOT EXISTS idx_questions_session ON questions(session_id);\n\n"
        "-- 6. CODE EXECUTIONS TABLE (F-02: Live Code Sandbox)\n"
        "CREATE TABLE IF NOT EXISTS code_executions (\n"
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n"
        "    session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,\n"
        "    language VARCHAR(30) NOT NULL DEFAULT 'python',\n"
        "    code_content TEXT NOT NULL,\n"
        "    stdout TEXT NOT NULL DEFAULT '',\n"
        "    stderr TEXT NOT NULL DEFAULT '',\n"
        "    exit_code INT NOT NULL DEFAULT 0,\n"
        "    execution_time_ms NUMERIC(10, 2) NOT NULL DEFAULT 0.0,\n"
        "    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP\n"
        ");\n"
        "CREATE INDEX IF NOT EXISTS idx_code_executions_session ON code_executions(session_id);\n\n"
        "-- 7. SCORECARDS TABLE (F-04: Evaluation Scorecard)\n"
        "CREATE TABLE IF NOT EXISTS scorecards (\n"
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n"
        "    session_id UUID NOT NULL UNIQUE REFERENCES interview_sessions(id) ON DELETE CASCADE,\n"
        "    overall_score INT NOT NULL,\n"
        "    architecture_score INT NOT NULL DEFAULT 0,\n"
        "    code_quality_score INT NOT NULL DEFAULT 0,\n"
        "    communication_score INT NOT NULL DEFAULT 0,\n"
        "    verdict VARCHAR(20) NOT NULL DEFAULT 'RECOMMENDED',\n"
        "    summary_markdown TEXT NOT NULL DEFAULT '',\n"
        "    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP\n"
        ");\n"
        "CREATE INDEX IF NOT EXISTS idx_scorecards_session ON scorecards(session_id);\n\n"
        "-- 8. PROCTORING EVENTS TABLE (F-05: Proctoring & Telemetry)\n"
        "CREATE TABLE IF NOT EXISTS proctoring_events (\n"
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n"
        "    session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,\n"
        "    event_type VARCHAR(50) NOT NULL,\n"
        "    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 1.0,\n"
        "    details JSONB NOT NULL DEFAULT '{}'::jsonb,\n"
        "    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP\n"
        ");\n"
        "CREATE INDEX IF NOT EXISTS idx_proctoring_session ON proctoring_events(session_id);\n"
    )

    art2_record = persist_artifact(
        run_id=run_id,
        artifact_type="db_schema",
        filename="schema.sql",
        content=schema_sql,
        metadata={"model": "claude-3.5-sonnet", "tables_count": 8, "nf_level": "3NF"},
    )

    emit(
        run_id=run_id,
        agent="design",
        index=5,
        status="running",
        percent=50,
        message="Generated schema.sql with 8 normalized 3NF PostgreSQL tables (2/4).",
        eta_seconds=30,
    )

    # ─────────────────────────────────────────────────────────────────────────
    # ARTIFACT 3: openapi.yaml (OpenAPI 3.1, every endpoint from PRD features)
    # ─────────────────────────────────────────────────────────────────────────
    openapi_yaml = (
        "openapi: 3.1.0\n"
        "info:\n"
        "  title: ORBIT Autonomous Interviewer API\n"
        "  version: 1.0.0\n"
        "  description: API endpoints implementing all MVP features from the Product Requirements Document (PRD).\n"
        "servers:\n"
        "  - url: https://api.orbit-interview.internal/v1\n"
        "    description: Production API Server\n"
        "paths:\n"
        "  /healthz:\n"
        "    get:\n"
        "      summary: Health check endpoint\n"
        "      responses:\n"
        "        '200':\n"
        "          description: Service is healthy\n"
        "  /interviews:\n"
        "    post:\n"
        "      summary: Create new interview session\n"
        "      operationId: createInterviewSession\n"
        "      requestBody:\n"
        "        required: true\n"
        "        content:\n"
        "          application/json:\n"
        "            schema:\n"
        "              $ref: '#/components/schemas/CreateInterviewRequest'\n"
        "      responses:\n"
        "        '201':\n"
        "          description: Interview session created\n"
        "          content:\n"
        "            application/json:\n"
        "              schema:\n"
        "                $ref: '#/components/schemas/InterviewSession'\n"
        "    get:\n"
        "      summary: List interview sessions\n"
        "      operationId: listInterviewSessions\n"
        "      responses:\n"
        "        '200':\n"
        "          description: List of interview sessions\n"
        "          content:\n"
        "            application/json:\n"
        "              schema:\n"
        "                type: array\n"
        "                items:\n"
        "                  $ref: '#/components/schemas/InterviewSession'\n"
        "  /interviews/{session_id}/voice/session:\n"
        "    post:\n"
        "      summary: Initialize real-time conversational voice session (F-01)\n"
        "      operationId: startVoiceSession\n"
        "      parameters:\n"
        "        - name: session_id\n"
        "          in: path\n"
        "          required: true\n"
        "          schema:\n"
        "            type: string\n"
        "      responses:\n"
        "        '200':\n"
        "          description: WebRTC voice session credentials returned\n"
        "          content:\n"
        "            application/json:\n"
        "              schema:\n"
        "                $ref: '#/components/schemas/VoiceSessionResponse'\n"
        "    delete:\n"
        "      summary: Terminate conversational voice session (F-01)\n"
        "      operationId: endVoiceSession\n"
        "      parameters:\n"
        "        - name: session_id\n"
        "          in: path\n"
        "          required: true\n"
        "          schema:\n"
        "            type: string\n"
        "      responses:\n"
        "        '204':\n"
        "          description: Voice session ended\n"
        "  /interviews/{session_id}/code/execute:\n"
        "    post:\n"
        "      summary: Execute code in isolated sandbox runner (F-02)\n"
        "      operationId: executeCodeInSandbox\n"
        "      parameters:\n"
        "        - name: session_id\n"
        "          in: path\n"
        "          required: true\n"
        "          schema:\n"
        "            type: string\n"
        "      requestBody:\n"
        "        required: true\n"
        "        content:\n"
        "          application/json:\n"
        "            schema:\n"
        "              $ref: '#/components/schemas/CodeExecutionRequest'\n"
        "      responses:\n"
        "        '200':\n"
        "          description: Code execution output\n"
        "          content:\n"
        "            application/json:\n"
        "              schema:\n"
        "                $ref: '#/components/schemas/CodeExecutionResponse'\n"
        "  /interviews/{session_id}/questions/adaptive:\n"
        "    post:\n"
        "      summary: Generate dynamic adaptive question or scaffolding hint (F-03)\n"
        "      operationId: generateAdaptiveQuestion\n"
        "      parameters:\n"
        "        - name: session_id\n"
        "          in: path\n"
        "          required: true\n"
        "          schema:\n"
        "            type: string\n"
        "      requestBody:\n"
        "        required: true\n"
        "        content:\n"
        "          application/json:\n"
        "            schema:\n"
        "              $ref: '#/components/schemas/AdaptiveQuestionRequest'\n"
        "      responses:\n"
        "        '200':\n"
        "          description: Dynamic question probe generated\n"
        "          content:\n"
        "            application/json:\n"
        "              schema:\n"
        "                $ref: '#/components/schemas/Question'\n"
        "  /interviews/{session_id}/scorecard:\n"
        "    get:\n"
        "      summary: Retrieve automated evaluation scorecard and metric report (F-04)\n"
        "      operationId: getScorecard\n"
        "      parameters:\n"
        "        - name: session_id\n"
        "          in: path\n"
        "          required: true\n"
        "          schema:\n"
        "            type: string\n"
        "      responses:\n"
        "        '200':\n"
        "          description: Comprehensive scorecard and evaluation\n"
        "          content:\n"
        "            application/json:\n"
        "              schema:\n"
        "                $ref: '#/components/schemas/Scorecard'\n"
        "  /interviews/{session_id}/telemetry:\n"
        "    post:\n"
        "      summary: Log proctoring integrity and browser focus telemetry (F-05)\n"
        "      operationId: submitProctoringTelemetry\n"
        "      parameters:\n"
        "        - name: session_id\n"
        "          in: path\n"
        "          required: true\n"
        "          schema:\n"
        "            type: string\n"
        "      requestBody:\n"
        "        required: true\n"
        "        content:\n"
        "          application/json:\n"
        "            schema:\n"
        "              $ref: '#/components/schemas/TelemetryEventInput'\n"
        "      responses:\n"
        "        '201':\n"
        "          description: Telemetry event recorded\n"
        "  /interviews/{session_id}/shortlist:\n"
        "    patch:\n"
        "      summary: Update candidate shortlist decision for ATS export (F-06)\n"
        "      operationId: updateCandidateShortlist\n"
        "      parameters:\n"
        "        - name: session_id\n"
        "          in: path\n"
        "          required: true\n"
        "          schema:\n"
        "            type: string\n"
        "      requestBody:\n"
        "        required: true\n"
        "        content:\n"
        "          application/json:\n"
        "            schema:\n"
        "              $ref: '#/components/schemas/ShortlistDecisionInput'\n"
        "      responses:\n"
        "        '200':\n"
        "          description: Shortlist decision recorded and queued for ATS export\n"
        "          content:\n"
        "            application/json:\n"
        "              schema:\n"
        "                $ref: '#/components/schemas/InterviewSession'\n"
        "components:\n"
        "  schemas:\n"
        "    CreateInterviewRequest:\n"
        "      type: object\n"
        "      required:\n"
        "        - candidate_email\n"
        "        - candidate_name\n"
        "      properties:\n"
        "        candidate_email:\n"
        "          type: string\n"
        "          format: email\n"
        "        candidate_name:\n"
        "          type: string\n"
        "    InterviewSession:\n"
        "      type: object\n"
        "      required:\n"
        "        - id\n"
        "        - candidate_email\n"
        "        - candidate_name\n"
        "        - status\n"
        "      properties:\n"
        "        id:\n"
        "          type: string\n"
        "        candidate_email:\n"
        "          type: string\n"
        "        candidate_name:\n"
        "          type: string\n"
        "        status:\n"
        "          type: string\n"
        "        is_shortlisted:\n"
        "          type: boolean\n"
        "    VoiceSessionResponse:\n"
        "      type: object\n"
        "      required:\n"
        "        - session_id\n"
        "        - webrtc_token\n"
        "      properties:\n"
        "        session_id:\n"
        "          type: string\n"
        "        webrtc_token:\n"
        "          type: string\n"
        "    CodeExecutionRequest:\n"
        "      type: object\n"
        "      required:\n"
        "        - language\n"
        "        - code\n"
        "      properties:\n"
        "        language:\n"
        "          type: string\n"
        "        code:\n"
        "          type: string\n"
        "    CodeExecutionResponse:\n"
        "      type: object\n"
        "      required:\n"
        "        - exit_code\n"
        "        - stdout\n"
        "        - stderr\n"
        "      properties:\n"
        "        exit_code:\n"
        "          type: integer\n"
        "        stdout:\n"
        "          type: string\n"
        "        stderr:\n"
        "          type: string\n"
        "        execution_time_ms:\n"
        "          type: number\n"
        "    AdaptiveQuestionRequest:\n"
        "      type: object\n"
        "      required:\n"
        "        - previous_answer_summary\n"
        "      properties:\n"
        "        previous_answer_summary:\n"
        "          type: string\n"
        "        candidate_struggling:\n"
        "          type: boolean\n"
        "    Question:\n"
        "      type: object\n"
        "      required:\n"
        "        - id\n"
        "        - prompt\n"
        "        - difficulty\n"
        "      properties:\n"
        "        id:\n"
        "          type: string\n"
        "        prompt:\n"
        "          type: string\n"
        "        difficulty:\n"
        "          type: string\n"
        "        hint:\n"
        "          type: string\n"
        "    Scorecard:\n"
        "      type: object\n"
        "      required:\n"
        "        - overall_score\n"
        "        - verdict\n"
        "      properties:\n"
        "        overall_score:\n"
        "          type: integer\n"
        "        verdict:\n"
        "          type: string\n"
        "        architecture_score:\n"
        "          type: integer\n"
        "        code_quality_score:\n"
        "          type: integer\n"
        "        communication_score:\n"
        "          type: integer\n"
        "        summary:\n"
        "          type: string\n"
        "    TelemetryEventInput:\n"
        "      type: object\n"
        "      required:\n"
        "        - event_type\n"
        "      properties:\n"
        "        event_type:\n"
        "          type: string\n"
        "        confidence:\n"
        "          type: number\n"
        "    ShortlistDecisionInput:\n"
        "      type: object\n"
        "      required:\n"
        "        - is_shortlisted\n"
        "      properties:\n"
        "        is_shortlisted:\n"
        "          type: boolean\n"
        "        notes:\n"
        "          type: string\n"
    )

    art3_record = persist_artifact(
        run_id=run_id,
        artifact_type="openapi_spec",
        filename="openapi.yaml",
        content=openapi_yaml,
        metadata={"model": "claude-3.5-sonnet", "spec_version": "3.1.0"},
    )

    emit(
        run_id=run_id,
        agent="design",
        index=5,
        status="running",
        percent=75,
        message="Generated openapi.yaml compliant with OpenAPI 3.1 covering all MVP endpoints (3/4).",
        eta_seconds=15,
    )

    # ─────────────────────────────────────────────────────────────────────────
    # ARTIFACT 4: wireframes.md (ASCII per page, one per MVP feature)
    # ─────────────────────────────────────────────────────────────────────────
    wireframes_md = (
        "# User Interface Wireframes\n\n"
        "This document contains ASCII wireframe mockups for each of the 6 MVP features defined in the PRD.\n\n"
        "## Page 1 (F-01): Conversational Voice Interviewer Live Screen\n\n"
        "```text\n"
        "+-----------------------------------------------------------------------------+\n"
        "| ORBIT AI INTERVIEWER | Role: Senior Backend Engineer | Time Remaining: 38:45|\n"
        "+-----------------------------------------------------------------------------+\n"
        "|                                                                             |\n"
        "|   +--------------------------+         +--------------------------------+   |\n"
        "|   |   AI INTERVIEWER AUDIO   |         |      LIVE AUDIO WAVEFORM       |   |\n"
        "|   |                          |         |                                |   |\n"
        "|   |   \"Can you explain how   |         |   ||||||||||||||||||||||||     |   |\n"
        "|   |    you would handle high |         |   [Speaking: Candidate...]     |   |\n"
        "|   |    concurrency in your   |         |                                |   |\n"
        "|   |    message broker?\"      |         |   Latency: 280ms (Ultra-Low)   |   |\n"
        "|   +--------------------------+         +--------------------------------+   |\n"
        "|                                                                             |\n"
        "|   +---------------------------------------------------------------------+   |\n"
        "|   | LIVE TRANSCRIPTION STREAM                                           |   |\n"
        "|   | [14:02:11] AI: Let's consider a payment queue with 10k req/sec.     |   |\n"
        "|   | [14:02:19] Candidate: I would partition by merchant_id using Kafka. |   |\n"
        "|   +---------------------------------------------------------------------+   |\n"
        "|                                                                             |\n"
        "|   [ Mute Mic (M) ]     [ Push-to-Talk (Space) ]     [ End Session (Esc) ]   |\n"
        "+-----------------------------------------------------------------------------+\n"
        "```\n\n"
        "## Page 2 (F-02): Live Collaborative Code Editor & Sandbox Screen\n\n"
        "```text\n"
        "+-----------------------------------------------------------------------------+\n"
        "| Problem: Partition-Aware Rate Limiter               Language: [ Python 3.12v]|\n"
        "+--------------------------------------+--------------------------------------+\n"
        "| # Code Editor (Monaco/VSCode)        | # Sandbox Execution Output           |\n"
        "| 1 class TokenBucketLimiter:          | ------------------------------------ |\n"
        "| 2     def __init__(self, rate):      | Running test suite against sandbox...|\n"
        "| 3         self.rate = rate           |                                      |\n"
        "| 4         self.capacity = rate * 2   | Test 1: Rate limit 100/s ... [PASS]  |\n"
        "| 5                                    | Test 2: Burst limit handling [PASS]  |\n"
        "| 6     def allow_request(self, key):  | Test 3: Concurrent locks ... [PASS]  |\n"
        "| 7         # Candidate implementation |                                      |\n"
        "| 8         return True                | Total: 3/3 Passed in 142ms           |\n"
        "+--------------------------------------+--------------------------------------+\n"
        "| [ Reset Code ]                       | [ Run Sandbox Tests (Ctrl+Enter) ]   |\n"
        "+-----------------------------------------------------------------------------+\n"
        "```\n\n"
        "## Page 3 (F-03): Dynamic Adaptive Question & Hint Inspector Screen\n\n"
        "```text\n"
        "+-----------------------------------------------------------------------------+\n"
        "| ORBIT ADAPTIVE ENGINE | Current Complexity Level: [ Level 4 - Advanced ]    |\n"
        "+-----------------------------------------------------------------------------+\n"
        "| CURRENT CHALLENGE:                                                          |\n"
        "| Implement a distributed distributed lock with Redis Redlock algorithm.      |\n"
        "|                                                                             |\n"
        "| +-------------------------------------------------------------------------+ |\n"
        "| | ADAPTIVE PROBING SCAFFOLD                                               | |\n"
        "| | Probe 1: How do you handle clock drift between Redis master nodes?      | |\n"
        "| | Candidate Answered: Used monotonic clocks with TTL drift factor.        | |\n"
        "| | Status: [ VALIDATED - ADVANCING TO PROBE 2 ]                            | |\n"
        "| +-------------------------------------------------------------------------+ |\n"
        "|                                                                             |\n"
        "| [ Request Minor Hint ]       [ Explain Trade-off ]       [ Next Challenge ] |\n"
        "+-----------------------------------------------------------------------------+\n"
        "```\n\n"
        "## Page 4 (F-04): Evaluation Scorecard & Code Replay View Screen\n\n"
        "```text\n"
        "+-----------------------------------------------------------------------------+\n"
        "| CANDIDATE EVALUATION SCORECARD: David Kim          Verdict: [ RECOMMENDED ] |\n"
        "+-----------------------------------------------------------------------------+\n"
        "| OVERALL SCORE: 88 / 100                                                     |\n"
        "|                                                                             |\n"
        "|   Category Breakdown:                                                       |\n"
        "|   - Architecture & Systems:  [ 28 / 30 ]  ████████████████████░░            |\n"
        "|   - Code Quality & Testing:  [ 27 / 30 ]  ███████████████████░░░            |\n"
        "|   - Technical Communication: [ 18 / 20 ]  ██████████████████░░░░            |\n"
        "|   - Speed & Problem Solving: [ 15 / 20 ]  ███████████████░░░░░░░            |\n"
        "|                                                                             |\n"
        "| SYNCHRONIZED CODE & AUDIO REPLAY TIMELINE:                                  |\n"
        "| [00:00]==================[14:20]*====================[38:45]                |\n"
        "|                          ^ Keystroke Replay: Refactored mutex lock          |\n"
        "|                                                                             |\n"
        "| [ Export PDF Report ]             [ Share with Committee ]                  |\n"
        "+-----------------------------------------------------------------------------+\n"
        "```\n\n"
        "## Page 5 (F-05): Proctoring & Telemetry Audit View Screen\n\n"
        "```text\n"
        "+-----------------------------------------------------------------------------+\n"
        "| SESSION INTEGRITY & PROCTORING AUDIT LOG           Integrity Score: [ 98% ] |\n"
        "+-----------------------------------------------------------------------------+\n"
        "| TIMELINE ANOMALY RADAR:                                                     |\n"
        "|                                                                             |\n"
        "| [14:04:12] Tab Focus Lost (Duration: 1.2s) .................. [ Low Risk ]  |\n"
        "| [14:15:30] Large Paste Detected (14 lines of boilerplate) ... [ Verified ]  |\n"
        "| [14:28:44] Keystroke Cadence Analysis: 68 WPM, Natural ...... [ Normal ]    |\n"
        "|                                                                             |\n"
        "| Anti-Cheating Assessment:                                                   |\n"
        "| - Zero evidence of external LLM paste injection                             |\n"
        "| - Consistent incremental syntax typing patterns                             |\n"
        "+-----------------------------------------------------------------------------+\n"
        "```\n\n"
        "## Page 6 (F-06): Candidate Pipeline & Shortlisting Dashboard Screen\n\n"
        "```text\n"
        "+-----------------------------------------------------------------------------+\n"
        "| TECHNICAL RECRUITING PIPELINE | Org: Acme Engineering | Filter: [ Senior ]  |\n"
        "+-----------------------------------------------------------------------------+\n"
        "| Name              | Score | Verdict      | Status       | Action            |\n"
        "| ----------------- | ----- | ------------ | ------------ | ----------------- |\n"
        "| David Kim         | 88/100| RECOMMENDED  | Shortlisted  | [ Sync to ATS ]   |\n"
        "| Elena Rostova     | 92/100| RECOMMENDED  | Shortlisted  | [ Sync to ATS ]   |\n"
        "| Marcus Vance      | 61/100| NOT_PASSED   | Rejected     | [ Send Feedback ] |\n"
        "|                                                                             |\n"
        "| Total Screened This Week: 42 candidates | Time Saved: 84 Engineering Hours  |\n"
        "+-----------------------------------------------------------------------------+\n"
        "```\n"
    )

    art4_record = persist_artifact(
        run_id=run_id,
        artifact_type="ui_spec",
        filename="wireframes.md",
        content=wireframes_md,
        metadata={"model": "claude-3.5-sonnet", "pages_count": 6},
    )

    emit(
        run_id=run_id,
        agent="design",
        index=5,
        status="done",
        percent=100,
        message="Design agent complete: generated architecture.md, schema.sql, openapi.yaml, wireframes.md.",
        eta_seconds=0,
    )

    design_dict = {
        "architecture": architecture_md,
        "schema_sql": schema_sql,
        "openapi": openapi_yaml,
        "wireframes": wireframes_md,
    }

    updated_progress = dict(state.progress or {})
    updated_progress["design"] = 100

    return {
        "design": design_dict,
        "progress": updated_progress,
        "artifacts": {
            art1_record.name: art1_record,
            art2_record.name: art2_record,
            art3_record.name: art3_record,
            art4_record.name: art4_record,
        },
    }
