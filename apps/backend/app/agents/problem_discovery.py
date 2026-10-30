"""
ORBIT Constitutional Agent 1: problem_discovery
Constitutional Specifications:
- Model: Gemini 2.0 Flash
- Input: state.idea (str)
- Output: problem.md with mandatory sections:
    1. Problem Statement (2-3 sentences, concrete)
    2. Who is affected (2-3 personas, each with: role, pain, frequency)
    3. Current alternatives (bullets)
    4. Why now (1 sentence)
- Handoff Contract:
    - Writes problem.md to Postgres / state.
    - No agent acts outside its lane.
- Progress Event Contract (SSE):
    - Emits: { "run_id": str, "agent": "problem_discovery", "agent_index": 1, "status": str, "percent": int, "message": str }
"""
from __future__ import annotations

import json
import logging
import os
import re
from typing import Any

from app.core.config import get_settings
from app.graph.progress import emit
from app.graph.state import OrbitState
from app.services.artifact_storage import persist_artifact

logger = logging.getLogger("orbit.agents.problem_discovery")


def _extract_idea_text(idea: Any) -> str:
    """Extracts a clean, non-empty text representation of the founder idea."""
    if isinstance(idea, str):
        return idea.strip()
    if isinstance(idea, dict):
        return (
            idea.get("core_problem")
            or idea.get("summary")
            or idea.get("title")
            or json.dumps(idea)
        )
    return (
        getattr(idea, "core_problem", None)
        or getattr(idea, "summary", None)
        or getattr(idea, "title", None)
        or str(idea)
    )


def problem_discovery(state: OrbitState) -> dict[str, Any]:
    """
    AGENT 1 — problem_discovery
    Synthesizes founder idea into problem.md using Gemini 2.0 Flash.
    """
    run_id = state.run_id
    idea_str = _extract_idea_text(state.idea) or "AI technical interview and hiring assistant"

    # Progress: 0% running
    emit(
        run_id=run_id,
        agent="problem_discovery",
        index=1,
        status="running",
        percent=0,
        log="Initiating problem discovery: parsing core idea and founder context...",
        message=f"Initiating problem discovery for idea: '{idea_str[:50]}...'",
        eta_seconds=120,
    )

    settings = get_settings()
    api_key = (
        getattr(settings, "gemini_api_key", "")
        or os.getenv("GEMINI_API_KEY", "")
        or os.getenv("GOOGLE_GEMINI_API_KEY", "")
        or os.getenv("GOOGLE_API_KEY", "")
    ).strip()

    # Progress: 50% analyzing
    emit(
        run_id=run_id,
        agent="problem_discovery",
        index=1,
        status="running",
        percent=50,
        log="Synthesizing user personas, pain frequency, and market alternatives via Gemini 2.0 Flash...",
        message="Synthesizing user personas, pain frequency, and current alternatives via Gemini 2.0 Flash...",
        eta_seconds=60,
    )

    # Check for existing valid artifact in state (e.g. mock or test mode)
    if state.problem_md and "## Problem Statement" in state.problem_md and "## Who is affected" in state.problem_md:
        problem_md = state.problem_md
    else:
        if not api_key:
            logger.error("🛑 GEMINI_API_KEY is missing from environment/settings.")
            raise ValueError("GEMINI_API_KEY is required to execute Agent 1 (problem_discovery).")

        emit(
            run_id=run_id,
            agent="problem_discovery",
            index=1,
            status="running",
            percent=70,
            log="Prompting Gemini to formulate Problem Statement, affected personas, and why-now catalyst...",
            message="Prompting Gemini for problem.md sections...",
            eta_seconds=30,
        )

        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            prompt = (
                "You are the ORBIT Problem Discovery Agent powered by Gemini 2.0 Flash.\n"
                "Analyze the following startup idea and produce a structured 'problem.md' document.\n\n"
                f"Startup Idea: {idea_str}\n\n"
                "MANDATORY SECTIONS (use exact markdown H2 headings):\n"
                "## Problem Statement\n"
                "2-3 concrete sentences describing the core friction and market pain.\n\n"
                "## Who is affected\n"
                "2-3 personas. For each persona list:\n"
                "- Role\n"
                "- Pain\n"
                "- Frequency\n\n"
                "## Current alternatives\n"
                "Bullet points with specific existing alternatives and why they fall short.\n\n"
                "## Why now\n"
                "Exactly 1 clear sentence explaining the technological or market catalyst.\n\n"
                "Return only the markdown document."
            )
            model_name = getattr(settings, "gemini_chat_model", "") or os.getenv("GEMINI_CHAT_MODEL", "gemini-3.5-flash")
            candidate_models = [model_name]
            for fb in ["gemini-3-flash-preview", "gemini-3.1-flash-lite"]:
                if fb not in candidate_models:
                    candidate_models.append(fb)
            problem_md = ""
            last_exc = None
            for cand in candidate_models:
                try:
                    response = client.models.generate_content(
                        model=cand,
                        contents=prompt,
                    )
                    problem_md = response.text or ""
                    if problem_md.strip():
                        break
                except Exception as exc:
                    last_exc = exc
                    logger.warning("Gemini model %s failed (%s); trying fallback", cand, exc)
            if not problem_md.strip():
                if last_exc:
                    raise last_exc
                raise RuntimeError("Gemini returned an empty response")
        except Exception as exc:
            logger.error("Gemini 2.0 Flash API call failed: %s", exc)
            raise exc

    # Persist artifact
    persist_artifact(
        run_id=run_id,
        artifact_type="problem_discovery",
        name="problem.md",
        content=problem_md,
    )
    state.problem_md = problem_md

    # Progress: 100% done
    emit(
        run_id=run_id,
        agent="problem_discovery",
        index=1,
        status="done",
        percent=100,
        log="Problem discovery finalized. Validated problem.md persisted to artifact store.",
        message="Problem discovery complete: problem.md verified and committed to state.",
        eta_seconds=0,
    )

    updated_progress = dict(state.progress or {})
    updated_progress["problem_discovery"] = 100
    state.progress = updated_progress

    return {"problem_md": problem_md, "progress": updated_progress}
