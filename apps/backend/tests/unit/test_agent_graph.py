"""
Unit tests for the 15-Agent LangGraph Multi-Agent Orchestration Engine,
Tools, Debate Consensus Routing, and Event Bus.
"""
import pytest
from app.agents.agent_tools import (
    AgentTools,
    CompetitorBenchmarkInput,
    DDLSchemaValidationInput,
    MarketSizeInput,
    UnitEconomicsInput,
)
from app.agents.specialist_agents import SpecialistAgents
from app.orchestration.agent_graph import check_consensus, run_agent_workflow
from app.orchestration.event_bus import agent_event_bus


@pytest.mark.asyncio
async def test_agent_tools_execution() -> None:
    """Verify tool calling calculations and validations."""
    # 1. Market Size
    market_res = AgentTools.estimate_market_size(
        MarketSizeInput(
            total_potential_customers=200_000,
            annual_contract_value_usd=1_200.0,
            serviceable_percentage=0.20,
            obtainable_percentage=0.05,
        )
    )
    assert market_res.tam_usd == 240_000_000.0
    assert market_res.sam_usd == 48_000_000.0
    assert market_res.som_usd == 2_400_000.0
    assert "$240.0M" in market_res.tam_formatted or "$240M" in market_res.tam_formatted

    # 2. Competitor Benchmark
    comp_res = AgentTools.benchmark_competitors(
        CompetitorBenchmarkInput(
            competitors=["Competitor A", "Competitor B"],
            primary_differentiator="Proprietary AI Context Memory",
        )
    )
    assert comp_res.moat_score >= 80
    assert len(comp_res.direct_competitors) == 2

    # 3. DDL Validation
    sql = "CREATE TABLE users (id UUID PRIMARY KEY, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ);"
    ddl_res = AgentTools.validate_ddl_schema(DDLSchemaValidationInput(schema_sql=sql))
    assert ddl_res.is_valid
    assert "users" in ddl_res.tables_detected
    assert ddl_res.has_uuid_primary_keys
    assert ddl_res.has_timestamps

    # 4. Unit Economics
    econ_res = AgentTools.calculate_unit_economics(
        UnitEconomicsInput(
            monthly_arpu_usd=100.0,
            monthly_churn_rate_pct=2.0,
            customer_acquisition_cost_usd=500.0,
            monthly_burn_fixed_usd=10_000.0,
            initial_cash_usd=100_000.0,
        )
    )
    assert econ_res.customer_ltv_usd == 5000.0
    assert econ_res.ltv_to_cac_ratio == 10.0
    assert econ_res.runway_months == 10.0


@pytest.mark.asyncio
async def test_specialist_agents_all_fifteen() -> None:
    """Verify all 15 specialized agents produce structured output."""
    ctx = {
        "name": "NovaForge",
        "idea_description": "AI Autonomous Dev Platform",
        "target_audience": "Software Founders",
        "industry": "Developer Tools",
    }

    # 1. Problem Discovery
    prob = await SpecialistAgents.run_problem_discovery(ctx)
    assert prob.agent_key == "problem_discovery"
    assert len(prob.core_pain_points) > 0

    # 2. Market Research
    market = await SpecialistAgents.run_market_research(ctx)
    assert market.agent_key == "market_research"
    assert market.tam_usd > 0

    # 3. Competitor Analysis
    comp = await SpecialistAgents.run_competitor_analysis(ctx)
    assert comp.agent_key == "competitor_analysis"
    assert comp.moat_score > 0

    # 4. Product Strategy
    prd = await SpecialistAgents.run_product_strategy(ctx, {})
    assert prd.agent_key == "product_strategy"
    assert len(prd.personas) >= 2

    # 5. UI/UX Architect
    uiux = await SpecialistAgents.run_uiux_architect(ctx, prd)
    assert uiux.agent_key == "uiux_architect"
    assert len(uiux.page_flow_hierarchy) >= 4

    # 6. Technical Architect
    tech = await SpecialistAgents.run_technical_architect(ctx)
    assert tech.agent_key == "technical_architect"
    assert len(tech.stack) >= 4

    # 7. Database Architect
    db = await SpecialistAgents.run_database_architect(ctx)
    assert db.agent_key == "database_architect"
    assert "CREATE TABLE" in db.ddl_schema_sql

    # 8. API Architect
    api = await SpecialistAgents.run_api_architect(ctx)
    assert api.agent_key == "api_architect"
    assert len(api.endpoints) >= 4

    # 9. Sprint Planner
    sprint = await SpecialistAgents.run_sprint_planner(ctx, prd)
    assert sprint.agent_key == "sprint_planner"
    assert len(sprint.tasks) >= 3

    # 10. Launch Agent
    launch = await SpecialistAgents.run_launch_agent(ctx)
    assert launch.agent_key == "launch_agent"
    assert len(launch.distribution_channels) >= 3

    # 11. Growth Agent
    growth = await SpecialistAgents.run_growth_agent(ctx)
    assert growth.agent_key == "growth_agent"
    assert growth.unit_economics["ltv_to_cac_ratio"] > 0

    # 12. Investor Readiness
    investor = await SpecialistAgents.run_investor_readiness(ctx, market, growth)
    assert investor.agent_key == "investor_readiness"
    assert investor.overall_readiness_score > 70

    # 13. Reflection Agent
    refl = await SpecialistAgents.run_reflection(ctx, prd, tech)
    assert refl.agent_key == "reflection_agent"
    assert len(refl.counter_factual_critiques) >= 2

    # 14. Verification Agent
    verif = await SpecialistAgents.run_verification(ctx, refl)
    assert verif.agent_key == "verification_agent"
    assert verif.cross_artifact_consistency_score >= 80

    # 15. Risk Agent
    risk = await SpecialistAgents.run_risk(ctx, tech, growth)
    assert risk.agent_key == "risk_agent"
    assert len(risk.high_risks) >= 2


@pytest.mark.asyncio
async def test_langgraph_full_workflow_execution() -> None:
    """Verify complete LangGraph multi-agent execution with consensus threshold routing."""
    res = await run_agent_workflow(
        project_id="test-proj-suite",
        project_name="QuantumSync AI",
        context={"industry": "AI Infrastructure", "target_audience": "ML Engineers"},
    )

    assert res["project_name"] == "QuantumSync AI"
    assert res["consensus_score"] >= 75
    assert res["consensus_status"] == "Consensus Reached"
    assert len(res["debate_rounds"]) >= 3
    assert "prd" in res["strategy_artifacts"]
    assert "database" in res["strategy_artifacts"]
    assert "sprint" in res["execution_artifacts"]
    assert "investor_readiness" in res["execution_artifacts"]


def test_consensus_conditional_routing() -> None:
    """Verify conditional edge routing logic."""
    # Under-threshold score routes back to debate_node
    low_state = {"consensus_score": 60, "current_debate_round": 1}
    assert check_consensus(low_state) == "debate_node"

    # Reaching threshold routes to execution_node
    high_state = {"consensus_score": 85, "current_debate_round": 1}
    assert check_consensus(high_state) == "execution_node"

    # Max debate rounds reached routes to execution_node
    max_state = {"consensus_score": 70, "current_debate_round": 3}
    assert check_consensus(max_state) == "execution_node"


@pytest.mark.asyncio
async def test_event_bus_pub_sub() -> None:
    """Verify real-time event bus publish and queue buffering."""
    pid = "test-event-bus-project"
    await agent_event_bus.publish(pid, "agent_started", {"agent": "Test Agent", "step": 1})
    recent = agent_event_bus.get_recent_events(pid)
    assert len(recent) >= 1
    assert recent[-1]["event"] == "agent_started"
    assert recent[-1]["data"]["agent"] == "Test Agent"
