import json
import os
import pytest
from app.graph.state import OrbitState
from app.agents.feasibility import feasibility, FeasibilitySchema


def test_agent_3_feasibility_gemini_direct():
    state = OrbitState(
        run_id="run-direct-feas-gemini-test",
        idea="Real-time AI voice interviewer and pair-programmer for tech recruiting",
        problem_md=(
            "## Problem Statement\n"
            "Engineering teams lose 15+ hours weekly per senior engineer on repetitive, low-signal initial coding screens.\n\n"
            "## Who is affected\n"
            "- **Role**: Engineering Manager\n"
            "  - **Pain**: Severe developer fatigue\n"
            "  - **Frequency**: Daily\n"
            "- **Role**: Candidate\n"
            "  - **Pain**: Opaque LeetCode evaluations\n"
            "  - **Frequency**: Multiple per job search\n\n"
            "## Current alternatives\n"
            "- Static LeetCode automated quizzes\n"
            "- Expensive human agency interview services ($500/call)\n\n"
            "## Why now\n"
            "Sub-second bidirectional conversational audio models and sandboxed WebAssembly environments are now mature."
        ),
        market_md=(
            "## Market size estimate\n"
            "TAM: $12B global technical recruitment market\n"
            "SAM: $3.2B technical assessment segment\n"
            "SOM: $450M automated voice-interactive interview software\n\n"
            "## Existing solutions\n"
            "| Competitor | Pricing | Core Weakness |\n"
            "| Karat | $500/interview | Expensive human interviewers, cannot scale |\n"
            "| HackerRank | $300/mo | Static quiz style, zero conversational adaptability |\n"
            "| CodeSignal | $450/mo | Rote memorization testing without pair-programming context |\n\n"
            "## Defensibility / Moat\n"
            "Proprietary real-time voice latency tuning (<400ms) with interactive live code pairing creates high switching costs."
        ),
    )

    res = feasibility(state)
    assert "feasibility" in res
    feas = res["feasibility"]

    # 1. Schema Validation
    validated = FeasibilitySchema.model_validate(feas)
    assert validated.score == feas["score"]

    # 2. Score and Verdict
    assert 0 <= feas["score"] <= 100
    if feas["score"] >= 80:
        assert feas["verdict"] == "go"
        assert feas["passed"] is True
        assert res["status"] == "running"
    else:
        assert feas["verdict"] == "no_go"
        assert feas["passed"] is False
        assert res["status"] == "stopped_low_feasibility"

    # 3. Rubric consistency
    rubric = feas["rubric"]
    assert 0 <= rubric["market_size"] <= 30
    assert 0 <= rubric["differentiation"] <= 30
    assert 0 <= rubric["timing"] <= 20
    assert 0 <= rubric["execution_complexity"] <= 20
    assert sum(rubric.values()) == feas["score"]

    # 4. Reasons & Risks
    assert len(feas["reasons"]) >= 2
    assert len(feas["risks"]) >= 2

    # 5. Progress & Artifacts
    assert res["progress"]["feasibility"] == 100
    assert "feasibility.json" in res["artifacts"]
    art = res["artifacts"]["feasibility.json"]
    assert os.path.exists(art.file_path)

