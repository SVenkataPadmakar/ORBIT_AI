"""
ORBIT — Constitutional Agents 4 and 5 (Delegation Module):
  Agent 4: prd_generator (Gemini 2.0 Flash) -> PRD.md
  Agent 5: design (Gemini 2.0 Flash) -> architecture.md, schema.sql, openapi.yaml, wireframes.md
"""
from __future__ import annotations

import logging
from typing import Any

from app.graph.progress import emit
from app.graph.state import OrbitState

logger = logging.getLogger("orbit.agents.prd_design")


# ─── AGENT 4: PRD GENERATOR ───────────────────────────────────────────────────

def prd_generator(state: OrbitState) -> dict[str, Any]:
    """
    AGENT 4 — prd_generator
    Delegates to modular Gemini 2.0 Flash implementation in app.agents.prd_generator.
    """
    from unittest.mock import patch as _patch
    from app.agents.prd_generator import prd_generator as _real_prd
    with _patch("app.agents.prd_generator.emit", side_effect=emit):
        return _real_prd(state)


# ─── AGENT 5: DESIGN AGENT ────────────────────────────────────────────────────

def design(state: OrbitState) -> dict[str, Any]:
    """
    AGENT 5 — design
    Delegates to modular Gemini 2.0 Flash implementation in app.agents.design.
    """
    from unittest.mock import patch as _patch
    from app.agents.design import design as _real_design
    with _patch("app.agents.design.emit", side_effect=emit):
        return _real_design(state)
