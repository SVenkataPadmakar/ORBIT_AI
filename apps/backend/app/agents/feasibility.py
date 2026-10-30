"""
ORBIT Constitutional Agent 3: feasibility
Constitutional Specifications:
- Model: Google GenAI (Gemini 2.0 Flash / Gemini 3.5 Flash, strict structured JSON output)
- Input: Reads problem.md and market.md from state / Postgres.
- Output: feasibility.json with schema:
    {
      "score": int (0-100),
      "verdict": "go" | "no_go",
      "passed": bool,
      "rubric": {
        "market_size": int (0-30),
        "differentiation": int (0-30),
        "timing": int (0-20),
        "execution_complexity": int (0-20)
      },
      "reasons": list[str],
      "risks": list[str]
    }
- Constitutional Gate:
    - Score >= 80 -> "go", pipeline advances to prd_generator.
    - Score < 80 -> "no_go", pipeline halts with status "stopped_low_feasibility".
- Handoff Contract:
    - Verifies problem.md and market.md exist; if missing/null, raises HandoffContractViolationError.
    - Writes feasibility.json to Postgres / state.
- Progress Event Contract (SSE):
    - Emits: { "run_id": str, "agent": "feasibility", "agent_index": 3, "status": str, "percent": int, "message": str }
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any

from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.core.llm import generate_structured_gemini
from app.graph.progress import emit
from app.graph.state import OrbitState
from app.services.artifact_storage import persist_artifact, require_previous_artifact

logger = logging.getLogger("orbit.agents.feasibility")


class RubricScores(BaseModel):
    market_size: int = Field(..., ge=0, le=30, description="Addressable market size, willingness to pay, budget clarity (0-30)")
    differentiation: int = Field(..., ge=0, le=30, description="Defensibility, moat, 10x value proposition (0-30)")
    timing: int = Field(..., ge=0, le=20, description="Market catalysts, macro timing, why now (0-20)")
    execution_complexity: int = Field(..., ge=0, le=20, description="MVP feasibility within startup timeline (0-20)")


class FeasibilitySchema(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Total feasibility score between 0 and 100")
    verdict: str = Field(..., description="'go' if score >= 80 else 'no_go'")
    passed: bool = Field(..., description="True if score >= 80 else False")
    rubric: RubricScores
    reasons: list[str] = Field(..., min_length=3, description="At least 3 concrete justifications for the score")
    risks: list[str] = Field(..., min_length=3, description="At least 3 critical technical, market, or operational risks")


def feasibility(state: OrbitState) -> dict[str, Any]:
    """
    AGENT 3 — feasibility
    Enforces handoff contract (requires problem.md and market.md), evaluates viability
    using Google GenAI (Gemini) with strict structured JSON output, and determines gate pass/fail.
    """
    run_id = state.run_id

    # Enforce Constitutional Handoff Contract: problem.md and market.md must exist
    problem_text = require_previous_artifact(
        run_id=run_id,
        artifact_type="problem_discovery",
        filename="problem.md",
        fallback_content=state.problem_md,
    )
    market_text = require_previous_artifact(
        run_id=run_id,
        artifact_type="market_analysis",
        filename="market.md",
        fallback_content=state.market_md,
    )

    # Progress: 0% running
    emit(
        run_id=run_id,
        agent="feasibility",
        index=3,
        status="running",
        percent=0,
        log="Verifying upstream artifacts (problem.md, market.md) and preparing 4-axis feasibility rubric...",
        message="Verifying upstream artifacts (problem.md, market.md) and initiating feasibility evaluation...",
        eta_seconds=60,
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

    # Progress: 50% evaluating
    emit(
        run_id=run_id,
        agent="feasibility",
        index=3,
        status="running",
        percent=50,
        log="Evaluating market size (0-30), differentiation (0-30), timing (0-20), and complexity (0-20)...",
        message="Evaluating market size, differentiation, timing, and technical complexity via Gemini structured AI...",
        eta_seconds=30,
    )

    # Check for existing valid artifact in state (e.g. test mode with forced score)
    initial_feas = state.feasibility or {}
    forced_score = initial_feas.get("force_score")

    if forced_score is not None:
        total_score = max(0, min(100, int(forced_score)))
        market_size_pts = min(30, int(total_score * 0.30))
        differentiation_pts = min(30, int(total_score * 0.30))
        timing_pts = min(20, int(total_score * 0.20))
        complexity_pts = max(0, total_score - (market_size_pts + differentiation_pts + timing_pts))
        verdict = "go" if total_score >= 80 else "no_go"
        feasibility_data = {
            "score": total_score,
            "verdict": verdict,
            "passed": total_score >= 80,
            "rubric": {
                "market_size": market_size_pts,
                "differentiation": differentiation_pts,
                "timing": timing_pts,
                "execution_complexity": complexity_pts,
            },
            "reasons": [
                f"Forced evaluation score {total_score}/100 applied for testing.",
                f"Market & differentiation components: {market_size_pts + differentiation_pts} pts.",
                f"Timing & complexity components: {timing_pts + complexity_pts} pts.",
            ],
            "risks": [
                "Testing mode evaluation parameter check.",
                "Verify live production deployment parameters.",
                "Ensure proper model credentials before live launch.",
            ],
        }
    else:
        # Require Gemini API key
        if not gemini_key:
            logger.error("🛑 GEMINI_API_KEY is missing from environment/settings.")
            raise ValueError("GEMINI_API_KEY is required to execute Agent 3 (feasibility).")

        prompt = (
            "Evaluate the startup viability strictly using the problem discovery and market analysis inputs below.\n\n"
            f"### Problem Discovery Input (problem.md):\n{problem_text}\n\n"
            f"### Live Market Analysis Input (market.md):\n{market_text}\n\n"
            "RUBRIC SCORING CRITERIA (0 - 100 Total Points):\n"
            "1. market_size (0 - 30 points): Addressable market size, urgency, customer budget clarity.\n"
            "2. differentiation (0 - 30 points): Defensibility, moat, 10x product improvement over competitors.\n"
            "3. timing (0 - 20 points): Technological and market catalysts ('why now').\n"
            "4. execution_complexity (0 - 20 points): Feasibility of shipping an MVP within a lean startup timeline.\n\n"
            "CONSTITUTIONAL GATE RULE:\n"
            "- If total score >= 80, verdict MUST be 'go' and passed MUST be true.\n"
            "- If total score < 80, verdict MUST be 'no_go' and passed MUST be false.\n"
        )

        try:
            model_name = (
                getattr(settings, "gemini_chat_model", "")
                or os.getenv("GEMINI_CHAT_MODEL")
                or "gemini-2.0-flash"
            )
            raw_data = generate_structured_gemini(
                prompt=prompt,
                output_schema=FeasibilitySchema,
                model=model_name,
                system_prompt=(
                    "You are the ORBIT Feasibility Evaluation Agent powered by Gemini. "
                    "Conduct a rigorous, objective venture evaluation."
                ),
                api_key=gemini_key,
            )

            # Validate against Pydantic schema
            validated = FeasibilitySchema.model_validate(raw_data)
            feasibility_data = validated.model_dump()

            # Recalculate and enforce strict consistency
            rubric = feasibility_data.get("rubric", {})
            market_size = max(0, min(30, int(rubric.get("market_size", 25))))
            diff = max(0, min(30, int(rubric.get("differentiation", 25))))
            timing = max(0, min(20, int(rubric.get("timing", 15))))
            exec_comp = max(0, min(20, int(rubric.get("execution_complexity", 15))))
            rubric["market_size"] = market_size
            rubric["differentiation"] = diff
            rubric["timing"] = timing
            rubric["execution_complexity"] = exec_comp
            feasibility_data["rubric"] = rubric

            # Ensure total score strictly equals the sum of rubric fields
            total_score = market_size + diff + timing + exec_comp
            verdict = "go" if total_score >= 80 else "no_go"
            feasibility_data["score"] = total_score
            feasibility_data["verdict"] = verdict
            feasibility_data["passed"] = total_score >= 80

            # Ensure minimum reasons and risks length
            if len(feasibility_data.get("reasons", [])) < 3:
                feasibility_data.setdefault("reasons", []).append("Strong venture alignment with modern engineering workflows.")
            if len(feasibility_data.get("risks", [])) < 3:
                feasibility_data.setdefault("risks", []).append("Requires competitive differentiation against incumbents.")

        except Exception as exc:
            logger.error("Gemini feasibility evaluation failed: %s", exc)
            raise exc

    total_score = feasibility_data.get("score", 0)
    verdict = feasibility_data.get("verdict", "no_go")

    # Persist artifact
    art_record = persist_artifact(
        run_id=run_id,
        artifact_type="feasibility",
        filename="feasibility.json",
        content=feasibility_data,
        metadata={"model": "gemini", "score": total_score, "verdict": verdict},
    )
    state.feasibility = feasibility_data

    # Progress: 100% done
    emit(
        run_id=run_id,
        agent="feasibility",
        index=3,
        status="done",
        percent=100,
        log=f"Feasibility gate evaluation complete: Score={total_score}/100, Verdict={verdict.upper()}.",
        message=f"Feasibility evaluation complete. Score: {total_score}/100 (Verdict: {verdict.upper()}).",
        eta_seconds=0,
    )

    new_status = "stopped_low_feasibility" if total_score < 80 else "running"

    updated_progress = dict(state.progress or {})
    updated_progress["feasibility"] = 100

    return {
        "feasibility": feasibility_data,
        "status": new_status,
        "progress": updated_progress,
        "artifacts": {art_record.name: art_record},
    }
