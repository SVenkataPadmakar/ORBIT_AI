"""
Unit tests for ORBIT Constitutional Agents 4 and 5:
  Agent 4: prd_generator (claude-3.5-sonnet)
  Agent 5: design (claude-3.5-sonnet)

SUCCESS CRITERIA:
  - openapi.yaml validates against OpenAPI 3.1 spec.
  - schema.sql runs cleanly on a fresh Postgres.
  - Every PRD feature has ≥1 endpoint + ≥1 wireframe.
"""
import os
import re
from unittest.mock import patch

import pytest
import yaml
from openapi_spec_validator import validate as validate_openapi
from sqlalchemy import text

from app.agents.prd_design_agents import (
    design,
    prd_generator,
)
from app.db.session import AsyncSessionLocal
from app.graph.state import OrbitState


def test_prd_generator_structure_and_artifacts() -> None:
    """
    AGENT 4 — prd_generator:
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
    """
    run_id = "run-prd-test-01"
    state = OrbitState(
        run_id=run_id,
        tenant_id="tenant-acme",
        user_id="user-tester",
        idea="AI interview assistant",
        feasibility={"score": 85, "verdict": "GO"},
        problem_md="# Problem\nTechnical screening is fragmented and slow.",
        market_md="# Market\nTAM is $8.4B across enterprise tech hiring.",
    )

    emitted = []

    def mock_emit(*args, **kwargs):
        from app.graph.progress import emit as real_emit
        ev = real_emit(*args, **kwargs)
        emitted.append(ev)
        return ev

    with patch("app.agents.prd_design_agents.emit", side_effect=mock_emit):
        res = prd_generator(state)

    assert "prd_md" in res
    prd_md = res["prd_md"]

    # 1. Verify all 8 industry-level sections are present
    assert "## 1. Overview & Goals" in prd_md
    assert "## 2. Target Users (Personas)" in prd_md
    assert "## 3. MVP Feature List" in prd_md
    assert "## 4. Non-Goals" in prd_md
    assert "## 5. Success Metrics" in prd_md
    assert "## 6. User Stories" in prd_md
    assert "## 7. Technical Constraints" in prd_md
    assert "## 8. Out of Scope for v1" in prd_md

    # 2. Section 3: MVP feature list (≤7, MoSCoW-tagged)
    features = re.findall(r"F-0\d:.*?(?:\[Must-Have\]|\[Should-Have\]|\[Could-Have\]|\[Won't-Have\])", prd_md)
    assert 1 <= len(features) <= 7, f"Expected <= 7 MVP features, found {len(features)}"
    for f in features:
        assert any(tag in f for tag in ["[Must-Have]", "[Should-Have]", "[Could-Have]", "[Won't-Have]"])

    # 3. Section 4: Non-goals (≥3)
    non_goals = re.findall(r"NG-0\d(?:\*\*)?:\s*.*", prd_md)
    assert len(non_goals) >= 3, f"Expected >= 3 non-goals, found {len(non_goals)}"

    # 4. Section 6: User stories (≤10, format: "As X, I want Y, so Z")
    user_stories = re.findall(r"US-0\d(?:\*\*)?:\s*As\s+(?:a|an)\s+.*,\s*I want\s+.*,\s*so(?:\s+that)?\s+.*", prd_md, re.IGNORECASE)
    assert 1 <= len(user_stories) <= 10, f"Expected <= 10 user stories matching format, found {len(user_stories)}"

    # 5. Progress tracking: % = sections_written / 8
    prd_events = [e for e in emitted if e["agent"] == "prd_generator"]
    assert len(prd_events) == 8
    expected_pcts = [int((i / 8) * 100) for i in range(1, 9)]
    actual_pcts = [e["percent"] for e in prd_events]
    assert actual_pcts == expected_pcts
    assert prd_events[-1]["status"] == "done"

    # 6. Artifact persistence
    assert "PRD.md" in res["artifacts"]
    art = res["artifacts"]["PRD.md"]
    assert os.path.exists(art.file_path)
    with open(art.file_path, "r", encoding="utf-8") as f:
        assert "## 1. Overview & Goals" in f.read()


def test_design_agent_generates_all_4_artifacts() -> None:
    """
    AGENT 5 — design:
    Input: PRD.md
    Output: 4 artifacts:
      - architecture.md (C4 container diagram in Mermaid, tech stack, ADRs)
      - schema.sql (3NF Postgres, one table per entity)
      - openapi.yaml (OpenAPI 3.1, every endpoint from PRD features)
      - wireframes.md (ASCII per page, one per MVP feature)
    Progress: % = artifacts_done / 4
    """
    run_id = "run-design-test-01"
    state = OrbitState(
        run_id=run_id,
        tenant_id="tenant-acme",
        user_id="user-tester",
        idea="AI interview assistant",
        prd_md="# PRD\n## 3. MVP Feature List\nF-01 [Must-Have]\nF-02 [Must-Have]",
    )

    emitted = []

    def mock_emit(*args, **kwargs):
        from app.graph.progress import emit as real_emit
        ev = real_emit(*args, **kwargs)
        emitted.append(ev)
        return ev

    with patch("app.agents.prd_design_agents.emit", side_effect=mock_emit):
        res = design(state)

    design_dict = res["design"]

    # 1. All 4 design outputs populated in state
    assert "architecture" in design_dict
    assert "schema_sql" in design_dict
    assert "openapi" in design_dict
    assert "wireframes" in design_dict

    # 2. architecture.md checks (C4 in Mermaid, Tech stack, ADRs)
    arch = design_dict["architecture"]
    assert "graph TB" in arch or "C4Container" in arch
    assert "Technology Stack" in arch or "Tech Stack" in arch
    assert "ADR-001" in arch
    assert "ADR-002" in arch
    assert "ADR-003" in arch
    assert "ADR-004" in arch

    # 3. schema.sql checks
    schema = design_dict["schema_sql"]
    assert "CREATE TABLE IF NOT EXISTS organizations" in schema
    assert "CREATE TABLE IF NOT EXISTS users" in schema
    assert "CREATE TABLE IF NOT EXISTS interview_sessions" in schema
    assert "CREATE TABLE IF NOT EXISTS scorecards" in schema

    # 4. openapi.yaml checks
    openapi_raw = design_dict["openapi"]
    assert "openapi: 3.1.0" in openapi_raw

    # 5. wireframes.md checks
    wireframes = design_dict["wireframes"]
    assert "## Page 1 (F-01)" in wireframes
    assert "## Page 2 (F-02)" in wireframes

    # 6. Progress tracking: % = artifacts_done / 4 (25, 50, 75, 100)
    design_events = [e for e in emitted if e["agent"] == "design"]
    assert len(design_events) == 4
    assert [e["percent"] for e in design_events] == [25, 50, 75, 100]
    assert design_events[-1]["status"] == "done"

    # 7. All 4 artifacts written to artifact store
    for name in ["architecture.md", "schema.sql", "openapi.yaml", "wireframes.md"]:
        assert name in res["artifacts"]
        art = res["artifacts"][name]
        assert os.path.exists(art.file_path)


def test_success_criterion_openapi_validates_against_3_1_spec() -> None:
    """
    SUCCESS CRITERION:
    openapi.yaml validates against OpenAPI 3.1 spec.
    """
    run_id = "run-openapi-val-01"
    state = OrbitState(
        run_id=run_id,
        idea="AI interview assistant",
        prd_md="# PRD\n## 3. MVP Feature List\nF-01 [Must-Have]\nF-02 [Must-Have]",
    )
    res = design(state)

    openapi_raw = res["design"]["openapi"]
    spec_dict = yaml.safe_load(openapi_raw)

    assert spec_dict["openapi"] == "3.1.0"

    # Strict OpenAPI 3.1 schema validation via openapi-spec-validator
    validate_openapi(spec_dict)


@pytest.mark.asyncio
async def test_success_criterion_schema_sql_runs_cleanly_on_fresh_postgres() -> None:
    """
    SUCCESS CRITERION:
    schema.sql runs cleanly on a fresh Postgres.
    Executes in an isolated temporary schema and verifies table creation without errors.
    """
    run_id = "run-schema-sql-val-01"
    state = OrbitState(
        run_id=run_id,
        idea="AI interview assistant",
        prd_md="# PRD\n## 3. MVP Feature List\nF-01 [Must-Have]\nF-02 [Must-Have]",
    )
    with patch("app.services.artifact_storage._save_to_postgres", return_value=None):
        res = design(state)

    schema_sql = res["design"]["schema_sql"]

    # Execute against real Postgres in an isolated sandbox schema
    async with AsyncSessionLocal() as session:
        # Create fresh sandbox schema
        await session.execute(text("CREATE SCHEMA IF NOT EXISTS test_fresh_orbit_sandbox;"))
        await session.execute(text("SET search_path TO test_fresh_orbit_sandbox;"))

        # Run schema.sql
        for statement in schema_sql.split(";"):
            cleaned = statement.strip()
            if cleaned:
                await session.execute(text(cleaned))

        # Verify created tables in fresh schema
        check_res = await session.execute(
            text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'test_fresh_orbit_sandbox' ORDER BY table_name;")
        )
        created_tables = [row[0] for row in check_res.fetchall()]

        # Clean up
        await session.execute(text("DROP SCHEMA test_fresh_orbit_sandbox CASCADE;"))
        await session.commit()

    assert len(created_tables) >= 6, f"Expected >= 6 tables, found: {created_tables}"
    assert "organizations" in created_tables
    assert "users" in created_tables
    assert "interview_sessions" in created_tables
    assert "scorecards" in created_tables
    assert "proctoring_events" in created_tables


def test_success_criterion_every_prd_feature_has_endpoint_and_wireframe() -> None:
    """
    SUCCESS CRITERION:
    Every PRD feature has ≥1 endpoint + ≥1 wireframe.
    """
    run_id = "run-e2e-feat-check-01"
    state = OrbitState(
        run_id=run_id,
        idea="AI interview assistant",
        feasibility={"score": 90, "verdict": "GO"},
        market_md="# Market\nEnterprise hiring TAM is $8.4B.",
        problem_md="# Problem\nTechnical screening is fragmented and slow.",
    )

    # 1. Run prd_generator
    prd_res = prd_generator(state)
    state.prd_md = prd_res["prd_md"]

    # Extract all MVP features (F-01 through F-06)
    prd_features = re.findall(r"(F-0\d)", state.prd_md)
    unique_features = sorted(list(set(prd_features)))
    assert len(unique_features) >= 5, f"Expected at least 5 MVP features, found {unique_features}"

    # 2. Run design agent
    design_res = design(state)
    openapi_raw = design_res["design"]["openapi"]
    wireframes_md = design_res["design"]["wireframes"]

    spec_dict = yaml.safe_load(openapi_raw)
    paths = list(spec_dict.get("paths", {}).keys())

    # Map features to expected endpoints and wireframes
    feature_endpoint_mapping = {
        "F-01": "/interviews/{session_id}/voice/session",
        "F-02": "/interviews/{session_id}/code/execute",
        "F-03": "/interviews/{session_id}/questions/adaptive",
        "F-04": "/interviews/{session_id}/scorecard",
        "F-05": "/interviews/{session_id}/telemetry",
        "F-06": "/interviews/{session_id}/shortlist",
    }

    for feat in unique_features:
        # Check wireframe exists for this feature
        assert f"({feat})" in wireframes_md or f"{feat}:" in wireframes_md, f"Feature {feat} has no wireframe in wireframes.md"

        # Check endpoint exists for this feature
        expected_path = feature_endpoint_mapping.get(feat)
        assert expected_path in paths, f"Feature {feat} endpoint '{expected_path}' missing from openapi.yaml paths: {paths}"
