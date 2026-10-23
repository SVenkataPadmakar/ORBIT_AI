"""
ORBIT — Per-Agent Budget Enforcement for the 7 Constitution Agents:
1. problem_discovery
2. market_analysis
3. feasibility
4. prd_generator
5. design
6. developer
7. risk_analysis
"""
from __future__ import annotations

from datetime import UTC, datetime
from typing import Any, Literal
from pydantic import BaseModel, Field


class BudgetExceededError(Exception):
    """Raised when an agent violates its token, step, or wallclock allotment."""
    def __init__(self, agent_id: str, dimension: str, limit: Any, consumed: Any) -> None:
        super().__init__(
            f"Agent '{agent_id}' exceeded {dimension} budget! Limit: {limit}, Consumed: {consumed}"
        )
        self.agent_id = agent_id
        self.dimension = dimension
        self.limit = limit
        self.consumed = consumed


class AgentBudget(BaseModel):
    """Execution bounds allocated to a specific agent in the pipeline."""
    agent_id: str
    max_tokens: int = 100_000
    used_tokens: int = 0
    max_steps: int = 30
    used_steps: int = 0
    max_wallclock_sec: float = 180.0
    elapsed_wallclock_sec: float = 0.0
    started_at: str | None = None
    exhausted: bool = False
    exhaustion_reason: str | None = None
    escalation_policy: Literal["stop_and_repair", "fail_hard", "escalate_to_human"] = "stop_and_repair"

    def record_usage(self, tokens_delta: int = 0, step_delta: int = 1, wallclock_delta: float = 0.0) -> None:
        """Accumulates resource consumption and evaluates exhaustion limits."""
        if not self.started_at:
            self.started_at = datetime.now(UTC).isoformat()

        self.used_tokens += max(0, tokens_delta)
        self.used_steps += max(0, step_delta)
        self.elapsed_wallclock_sec += max(0.0, wallclock_delta)

        if self.used_tokens > self.max_tokens:
            self.exhausted = True
            self.exhaustion_reason = f"tokens ({self.used_tokens} > {self.max_tokens})"
        elif self.used_steps > self.max_steps:
            self.exhausted = True
            self.exhaustion_reason = f"steps ({self.used_steps} > {self.max_steps})"
        elif self.elapsed_wallclock_sec > self.max_wallclock_sec:
            self.exhausted = True
            self.exhaustion_reason = f"wallclock ({self.elapsed_wallclock_sec:.1f}s > {self.max_wallclock_sec:.1f}s)"


# Non-negotiable per-agent budget allocations for the 7 agents
DEFAULT_AGENT_BUDGETS: dict[str, dict[str, Any]] = {
    "problem_discovery": {"max_tokens": 40_000, "max_steps": 15, "max_wallclock_sec": 60.0},
    "market_analysis": {"max_tokens": 50_000, "max_steps": 20, "max_wallclock_sec": 90.0},
    "feasibility": {"max_tokens": 50_000, "max_steps": 20, "max_wallclock_sec": 90.0},
    "prd_generator": {"max_tokens": 80_000, "max_steps": 25, "max_wallclock_sec": 120.0},
    "design": {"max_tokens": 100_000, "max_steps": 30, "max_wallclock_sec": 150.0},
    "developer": {"max_tokens": 250_000, "max_steps": 60, "max_wallclock_sec": 360.0},
    "risk_analysis": {"max_tokens": 60_000, "max_steps": 20, "max_wallclock_sec": 90.0},
}


class BudgetManager:
    """Manages and enforces budget compliance across the 7 agents."""

    @staticmethod
    def initialize_budgets() -> dict[str, dict[str, Any]]:
        """Produces a serializable initial budget mapping for the 7 agents."""
        return {
            agent_id: AgentBudget(
                agent_id=agent_id,
                max_tokens=cfg["max_tokens"],
                max_steps=cfg["max_steps"],
                max_wallclock_sec=cfg["max_wallclock_sec"],
            ).model_dump()
            for agent_id, cfg in DEFAULT_AGENT_BUDGETS.items()
        }

    @staticmethod
    def check_and_update(
        budgets_dict: dict[str, Any] | None,
        agent_id: str,
        tokens_delta: int = 0,
        step_delta: int = 1,
        wallclock_delta: float = 0.0,
    ) -> tuple[dict[str, Any], bool]:
        """
        Updates budget state for agent.
        Returns: (updated_budgets_dict, is_exhausted)
        """
        budgets = dict(budgets_dict or {})
        current = budgets.get(agent_id)
        if isinstance(current, dict):
            b_model = AgentBudget(**current)
        elif isinstance(current, AgentBudget):
            b_model = current
        else:
            cfg = DEFAULT_AGENT_BUDGETS.get(
                agent_id,
                {"max_tokens": 100_000, "max_steps": 30, "max_wallclock_sec": 180.0},
            )
            b_model = AgentBudget(agent_id=agent_id, **cfg)

        b_model.record_usage(tokens_delta, step_delta, wallclock_delta)
        budgets[agent_id] = b_model.model_dump()
        return budgets, b_model.exhausted
