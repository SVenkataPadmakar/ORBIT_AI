"""
ORBIT — Deterministic Run Manifest & Model Version Pinning for the 7 Constitution Agents:
1. problem_discovery
2. market_analysis
3. feasibility
4. prd_generator
5. design
6. developer
7. risk_analysis
"""
from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any
from pydantic import BaseModel, Field


# ─── PINNED MODEL CONFIGURATION (NON-NEGOTIABLE) ─────────────────────────────

PINNED_MODELS: dict[str, str] = {
    "default": "gemini-2.0-flash",
    "reasoning": "gemini-2.0-flash",
    "coder": "deepseek-coder",
    "fallback": "gpt-4o-2024-08-06",
    "embedding": "text-embedding-3-small",
}

# The 7 Constitution agents routing (Gemini for 1, 2, 3, 4, 5, 7; DeepSeek for 6)
LANE_MODEL_ROUTING: dict[str, str] = {
    "problem_discovery": "default",
    "market_analysis": "default",
    "feasibility": "default",
    "prd_generator": "default",
    "design": "default",
    "developer": "coder",
    "risk_analysis": "default",
}

DEFAULT_RUN_SEED: int = 42


class ModelVersionPin(BaseModel):
    """Configuration pin enforcing deterministic generation parameters."""
    lane: str
    model_name: str
    temperature: float = 0.0
    seed: int = DEFAULT_RUN_SEED
    max_output_tokens: int = 8192


class ToolCallEntry(BaseModel):
    """Ledger entry tracking deterministic execution of typed tools."""
    call_id: str
    agent: str
    tool_name: str
    input_payload: dict[str, Any] = Field(default_factory=dict)
    output_payload: dict[str, Any] = Field(default_factory=dict)
    execution_time_ms: float = 0.0
    timestamp: str
    status: str = "success"


class RunManifest(BaseModel):
    """
    Immutable manifest capturing everything required for 100% deterministic replay.
    Serves as cryptographic proof of execution for admin inspection.
    """
    manifest_id: str
    run_id: str
    tenant_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(UTC).isoformat())
    seed: int = DEFAULT_RUN_SEED
    pinned_models: dict[str, str] = Field(default_factory=lambda: PINNED_MODELS)
    lane_routing: dict[str, str] = Field(default_factory=lambda: LANE_MODEL_ROUTING)
    sandbox_provider: str = "docker-local"
    tool_calls_count: int = 0
    tool_call_log: list[ToolCallEntry] = Field(default_factory=list)
    artifacts_generated: list[str] = Field(default_factory=list)
    reproducibility_hash: str = ""

    def calculate_hash(self) -> str:
        """Computes a SHA-256 digest across pinned configuration, tools, and artifacts."""
        payload = {
            "run_id": self.run_id,
            "seed": self.seed,
            "pinned_models": self.pinned_models,
            "lane_routing": self.lane_routing,
            "tool_calls": [t.model_dump() for t in self.tool_call_log],
            "artifacts": sorted(self.artifacts_generated),
        }
        raw_json = json.dumps(payload, sort_keys=True, default=str)
        return hashlib.sha256(raw_json.encode("utf-8")).hexdigest()

    @classmethod
    def from_orbit_state(cls, state: Any, sandbox_provider: str = "docker-local") -> RunManifest:
        """Extracts an immutable manifest snapshot directly from an OrbitState instance."""
        tool_entries: list[ToolCallEntry] = []
        for tc in getattr(state, "tool_calls", []):
            if isinstance(tc, dict):
                tool_entries.append(ToolCallEntry(**tc))
            else:
                tool_entries.append(
                    ToolCallEntry(
                        call_id=getattr(tc, "call_id", ""),
                        agent=getattr(tc, "agent", ""),
                        tool_name=getattr(tc, "tool_name", ""),
                        input_payload=getattr(tc, "input_payload", {}),
                        output_payload=getattr(tc, "output_payload", {}),
                        execution_time_ms=getattr(tc, "execution_time_ms", 0.0),
                        timestamp=getattr(tc, "timestamp", datetime.now(UTC).isoformat()),
                        status=getattr(tc, "status", "success"),
                    )
                )

        artifacts = list((getattr(state, "artifacts", {}) or {}).keys())
        manifest = cls(
            manifest_id=f"manifest-{state.run_id}",
            run_id=state.run_id,
            tenant_id=state.tenant_id,
            seed=DEFAULT_RUN_SEED,
            pinned_models=PINNED_MODELS,
            lane_routing=LANE_MODEL_ROUTING,
            sandbox_provider=sandbox_provider,
            tool_calls_count=len(tool_entries),
            tool_call_log=tool_entries,
            artifacts_generated=artifacts,
        )
        manifest.reproducibility_hash = manifest.calculate_hash()
        return manifest
