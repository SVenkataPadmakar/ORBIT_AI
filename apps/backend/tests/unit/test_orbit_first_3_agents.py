"""
Unit tests for the first 3 ORBIT Constitutional Agents:
  Agent 1: problem_discovery (claude-3.5-sonnet)
  Agent 2: market_analysis (claude-3.5-sonnet)
  Agent 3: feasibility (gpt-4o)

SUCCESS CRITERIA:
  - Each writes its artifact to Postgres + artifact store.
  - Each emits progress events matching the contract.
  - Test: feed 'AI interview assistant' → feasibility.score is a number 0-100.
"""
import json
import os
from unittest.mock import MagicMock, patch

import pytest

from app.agents.discovery_agents import (
    feasibility,
    market_analysis,
    problem_discovery,
)
from app.graph.state import OrbitState


def test_ai_interview_assistant_pipeline_first_3_agents() -> None:
    """
    Primary test: Feed 'AI interview assistant' through the first 3 agents:
    Asserts:
      1. problem_discovery produces problem.md with all required sections.
      2. market_analysis produces market.md with competitor table and TAM/SAM/SOM.
      3. feasibility produces feasibility.json with score 0-100, verdict, rubric, reasons, and risks.
      4. Artifacts are written to filesystem store (runs/{run_id}/...).
      5. Progress events adhere to the contract.
    """
    run_id = "run-test-ai-interview-01"
    state = OrbitState(
        run_id=run_id,
        tenant_id="tenant-test",
        user_id="user-tester",
        idea="AI interview assistant",
    )

    # ─────────────────────────────────────────────────────────────────────────
    # AGENT 1: problem_discovery
    # ─────────────────────────────────────────────────────────────────────────
    res1 = problem_discovery(state)

    assert "problem_md" in res1
    problem_md = res1["problem_md"]
    assert problem_md is not None
    assert len(problem_md) > 100

    # Required sections check
    assert "## Problem Statement" in problem_md
    assert "## Who is affected" in problem_md
    assert "## Current alternatives" in problem_md
    assert "## Why now" in problem_md

    # Check persona structure (role, pain, frequency)
    assert "**Role**:" in problem_md
    assert "**Pain**:" in problem_md
    assert "**Frequency**:" in problem_md

    # Artifact check
    assert "problem.md" in res1["artifacts"]
    art_prob = res1["artifacts"]["problem.md"]
    assert os.path.exists(art_prob.file_path)
    with open(art_prob.file_path, "r", encoding="utf-8") as f:
        assert "## Problem Statement" in f.read()

    # Progress check
    assert res1["progress"]["problem_discovery"] == 100

    # Feed problem_md into state for next agent
    state.problem_md = problem_md
    state.progress.update(res1["progress"])

    # ─────────────────────────────────────────────────────────────────────────
    # AGENT 2: market_analysis
    # ─────────────────────────────────────────────────────────────────────────
    res2 = market_analysis(state)

    assert "market_md" in res2
    market_md = res2["market_md"]
    assert market_md is not None
    assert len(market_md) > 100

    # Required sections check
    assert "## Existing solutions" in market_md
    assert "## Market size estimate" in market_md
    assert "## Feature gap analysis" in market_md
    assert "## Our differentiation" in market_md

    # Competitor table check
    assert "| Name | Features | Pricing | Weakness |" in market_md
    assert "HackerRank" in market_md
    assert "Karat" in market_md

    # TAM/SAM/SOM check
    assert "TAM" in market_md
    assert "SAM" in market_md
    assert "SOM" in market_md

    # Artifact check
    assert "market.md" in res2["artifacts"]
    art_market = res2["artifacts"]["market.md"]
    assert os.path.exists(art_market.file_path)
    with open(art_market.file_path, "r", encoding="utf-8") as f:
        assert "## Existing solutions" in f.read()

    # Progress check
    assert res2["progress"]["market_analysis"] == 100

    # Feed market_md into state for feasibility
    state.market_md = market_md
    state.progress.update(res2["progress"])

    # ─────────────────────────────────────────────────────────────────────────
    # AGENT 3: feasibility
    # ─────────────────────────────────────────────────────────────────────────
    res3 = feasibility(state)

    assert "feasibility" in res3
    feas_data = res3["feasibility"]
    assert isinstance(feas_data, dict)

    # Core user requirement: feasibility.score is a number 0-100
    score = feas_data.get("score")
    assert isinstance(score, (int, float)), f"feasibility.score must be numeric, got {type(score)}"
    assert 0 <= score <= 100, f"feasibility.score must be 0-100, got {score}"

    # Verdict
    assert feas_data["verdict"] in ["go", "no_go"]
    if score >= 80:
        assert feas_data["verdict"] == "go"
    else:
        assert feas_data["verdict"] == "no_go"

    # Rubric check: market_size(30) + differentiation(30) + timing(20) + execution_complexity(20)
    rubric = feas_data.get("rubric", {})
    assert "market_size" in rubric
    assert "differentiation" in rubric
    assert "timing" in rubric
    assert "execution_complexity" in rubric
    assert 0 <= rubric["market_size"] <= 30
    assert 0 <= rubric["differentiation"] <= 30
    assert 0 <= rubric["timing"] <= 20
    assert 0 <= rubric["execution_complexity"] <= 20
    assert sum(rubric.values()) == score

    # Reasons & Risks lists
    assert isinstance(feas_data.get("reasons"), list)
    assert len(feas_data["reasons"]) >= 2
    assert isinstance(feas_data.get("risks"), list)
    assert len(feas_data["risks"]) >= 2

    # Artifact check
    assert "feasibility.json" in res3["artifacts"]
    art_feas = res3["artifacts"]["feasibility.json"]
    assert os.path.exists(art_feas.file_path)
    with open(art_feas.file_path, "r", encoding="utf-8") as f:
        saved_json = json.load(f)
        assert saved_json["score"] == score
        assert saved_json["verdict"] == feas_data["verdict"]

    # Progress check: instant 100%
    assert res3["progress"]["feasibility"] == 100


def test_progress_events_emitted_during_first_3_agents() -> None:
    """Verifies that each of the 3 agents emits progress events adhering to the SSE contract."""
    run_id = "run-progress-verification"
    state = OrbitState(
        run_id=run_id,
        tenant_id="tenant-test",
        user_id="user-tester",
        idea="AI interview assistant",
    )

    emitted_events = []

    def mock_emit(*args, **kwargs):
        from app.graph.progress import emit as real_emit
        ev = real_emit(*args, **kwargs)
        emitted_events.append(ev)
        return ev

    with patch("app.agents.discovery_agents.emit", side_effect=mock_emit):
        # 1. problem_discovery
        res1 = problem_discovery(state)
        # Check Agent 1 events: 0 -> 50 -> 100
        prob_events = [e for e in emitted_events if e["agent"] == "problem_discovery"]
        assert len(prob_events) >= 3
        percents = [e["percent"] for e in prob_events]
        assert 0 in percents
        assert 50 in percents
        assert 100 in percents

        # 2. market_analysis
        state.problem_md = res1["problem_md"]
        res2 = market_analysis(state)
        # Check Agent 2 events: progress = competitors / 5 (min 5)
        market_events = [e for e in emitted_events if e["agent"] == "market_analysis"]
        assert len(market_events) >= 5
        m_percents = [e["percent"] for e in market_events]
        assert 20 in m_percents
        assert 40 in m_percents
        assert 60 in m_percents
        assert 80 in m_percents
        assert 100 in m_percents

        # 3. feasibility
        state.market_md = res2["market_md"]
        res3 = feasibility(state)
        feas_events = [e for e in emitted_events if e["agent"] == "feasibility"]
        assert len(feas_events) >= 1
        assert feas_events[-1]["percent"] == 100


def test_feasibility_rubric_scoring_boundary_cases() -> None:
    """Tests that feasibility scoring handles low-score and high-score cases accurately."""
    # Forced low score < 80
    low_state = OrbitState(
        run_id="run-low-feasibility",
        idea="Flawed concept",
        problem_md="# Problem\nFlawed",
        market_md="# Market\nSaturated",
        feasibility={"force_score": 45},
    )
    res_low = feasibility(low_state)
    assert res_low["feasibility"]["score"] == 45
    assert res_low["feasibility"]["verdict"] == "no_go"
    assert res_low["status"] == "stopped_low_feasibility"

    # Forced high score >= 80
    high_state = OrbitState(
        run_id="run-high-feasibility",
        idea="High conviction",
        problem_md="# Problem\nHigh impact",
        market_md="# Market\nMassive TAM",
        feasibility={"force_score": 92},
    )
    res_high = feasibility(high_state)
    assert res_high["feasibility"]["score"] == 92
    assert res_high["feasibility"]["verdict"] == "go"
    assert res_high["status"] == "running"
