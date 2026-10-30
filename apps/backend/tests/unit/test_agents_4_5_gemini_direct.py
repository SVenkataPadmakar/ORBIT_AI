import os
import re
import pytest
import yaml
from openapi_spec_validator import validate as validate_openapi

from app.graph.state import OrbitState
from app.agents.prd_generator import prd_generator, PRDSchema
from app.agents.design import design, DesignSchema


def test_agent_4_prd_generator_gemini_direct():
    state = OrbitState(
        run_id="run-direct-prd-gemini-test",
        tenant_id="tenant-acme",
        user_id="user-tester",
        idea="AI technical interview assistant with live pair programming",
        feasibility={"score": 85, "verdict": "GO"},
        problem_md="# Problem\nTechnical screening is fragmented and slow.",
        market_md="# Market\nTAM is $8.4B across enterprise tech hiring.",
    )

    res = prd_generator(state)
    assert "prd_md" in res
    prd_md = res["prd_md"]

    # 1. Check all 8 sections
    for i, title in enumerate([
        "## 1. Overview & Goals",
        "## 2. Target Users (Personas)",
        "## 3. MVP Feature List",
        "## 4. Non-Goals",
        "## 5. Success Metrics",
        "## 6. User Stories",
        "## 7. Technical Constraints",
        "## 8. Out of Scope for v1",
    ], start=1):
        assert title in prd_md

    # 2. Check MoSCoW features
    features = re.findall(r"F-0\d:.*?(?:\[Must-Have\]|\[Should-Have\]|\[Could-Have\]|\[Won't-Have\])", prd_md)
    assert 1 <= len(features) <= 7

    # 3. Check Non-goals >= 3
    non_goals = re.findall(r"NG-0\d(?:\*\*)?:\s*.*", prd_md)
    assert len(non_goals) >= 3

    # 4. Check user stories <= 10 with "As X, I want Y, so Z"
    user_stories = re.findall(r"US-0\d(?:\*\*)?:\s*As\s+(?:a|an)\s+.*,\s*I want\s+.*,\s*so(?:\s+that)?\s+.*", prd_md, re.IGNORECASE)
    assert 1 <= len(user_stories) <= 10

    # 5. Check progress and artifact
    assert res["progress"]["prd_generator"] == 100
    assert "PRD.md" in res["artifacts"]
    assert os.path.exists(res["artifacts"]["PRD.md"].file_path)


def test_agent_5_design_gemini_direct():
    state = OrbitState(
        run_id="run-direct-design-gemini-test",
        tenant_id="tenant-acme",
        user_id="user-tester",
        idea="AI technical interview assistant",
        prd_md="# PRD\n## 3. MVP Feature List\nF-01 [Must-Have]\nF-02 [Must-Have]",
    )

    res = design(state)
    assert "design" in res
    d = res["design"]

    # 1. Check all 4 outputs
    assert "architecture" in d
    assert "schema_sql" in d
    assert "openapi" in d
    assert "wireframes" in d

    # 2. Check architecture: Mermaid C4 diagram and ADRs
    assert "graph TB" in d["architecture"] or "C4Container" in d["architecture"]
    for adr in ["ADR-001", "ADR-002", "ADR-003", "ADR-004"]:
        assert adr in d["architecture"]

    # 3. Check schema SQL tables
    for tbl in ["organizations", "users", "interview_sessions", "scorecards", "proctoring_events"]:
        assert tbl in d["schema_sql"]

    # 4. Check openapi 3.1 validation
    spec_dict = yaml.safe_load(d["openapi"])
    assert spec_dict["openapi"] == "3.1.0"
    validate_openapi(spec_dict)

    # 5. Check wireframes
    assert "## Page 1 (F-01)" in d["wireframes"]
    assert "## Page 2 (F-02)" in d["wireframes"]

    # 6. Check progress and artifacts
    assert res["progress"]["design"] == 100
    for name in ["architecture.md", "schema.sql", "openapi.yaml", "wireframes.md"]:
        assert name in res["artifacts"]
        assert os.path.exists(res["artifacts"][name].file_path)

