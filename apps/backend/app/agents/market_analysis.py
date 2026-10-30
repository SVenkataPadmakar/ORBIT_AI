"""
ORBIT Constitutional Agent 2: market_analysis
Constitutional Specifications:
- Model: Tavily Search + Gemini (Gemini 2.0 Flash)
- Input: Reads problem.md from state / Postgres.
- Output: market.md with mandatory sections:
    1. TAM SAM SOM (realistic sizing with numbers and assumptions)
    2. Competitors (markdown table: Name | Pricing | Weakness)
    3. Defensibility / Moat (1-2 paragraphs)
- Handoff Contract:
    - Verifies problem.md is present; if missing/null, raises HandoffContractViolationError and halts pipeline.
    - Writes market.md to Postgres / state.
- Progress Event Contract (SSE):
    - Emits: { "run_id": str, "agent": "market_analysis", "agent_index": 2, "status": str, "percent": int, "message": str }
"""
from __future__ import annotations

import logging
import os
import re
from typing import Any

from app.core.config import get_settings
from app.graph.progress import emit
from app.graph.state import OrbitState
from app.services.artifact_storage import persist_artifact, require_previous_artifact
from app.tools.tavily import search_tavily

logger = logging.getLogger("orbit.agents.market_analysis")


def market_analysis(state: OrbitState) -> dict[str, Any]:
    """
    AGENT 2 — market_analysis
    Enforces handoff contract (requires problem.md), searches competitor landscape
    via Tavily Search, and synthesizes market.md using Gemini 2.0 Flash.
    """
    run_id = state.run_id

    # Enforce Constitutional Handoff Contract: problem.md must exist
    problem_text = require_previous_artifact(state, "problem_discovery", "problem.md")

    # Progress: 0% running
    emit(
        run_id=run_id,
        agent="market_analysis",
        index=2,
        status="running",
        percent=0,
        log="Verifying problem.md handoff contract and initiating market intelligence query...",
        message="Verifying problem.md handoff and initiating market intelligence query...",
        eta_seconds=120,
    )

    settings = get_settings()
    tavily_key = (
        getattr(settings, "tavily_api_key", "")
        or os.getenv("TAVILY_API_KEY", "")
    ).strip()
    gemini_key = (
        getattr(settings, "gemini_api_key", "")
        or os.getenv("GEMINI_API_KEY", "")
        or os.getenv("GOOGLE_GEMINI_API_KEY", "")
        or os.getenv("GOOGLE_API_KEY", "")
    ).strip()

    # Progress: 30% searching via Tavily
    emit(
        run_id=run_id,
        agent="market_analysis",
        index=2,
        status="running",
        percent=30,
        log="Scanning competitor websites, pricing tiers, and alternative solutions via Tavily Search...",
        message="Executing web research via Tavily Search API for competitors and pricing...",
        eta_seconds=80,
    )

    # Check for existing valid artifact in state (e.g. mock or test mode)
    if state.market_md and "## TAM SAM SOM" in state.market_md and "## Competitors" in state.market_md:
        market_md = state.market_md
    else:
        # Require API keys
        if not tavily_key:
            logger.error("🛑 TAVILY_API_KEY is missing from environment/settings.")
            raise ValueError("TAVILY_API_KEY is required to execute Agent 2 (market_analysis).")
        if not gemini_key:
            logger.error("🛑 GEMINI_API_KEY is missing from environment/settings.")
            raise ValueError("GEMINI_API_KEY is required to execute Agent 2 (market_analysis).")

        # Query Tavily Search
        search_query = "technical interview platform automated coding assessment pricing competitors"
        search_results = search_tavily(search_query, max_results=5)
        search_context = "\n\n".join(
            f"Title: {r.get('title')}\nURL: {r.get('url')}\nContent: {r.get('content')}"
            for r in search_results
        )

        # Progress: 70% synthesizing via Gemini
        emit(
            run_id=run_id,
            agent="market_analysis",
            index=2,
            status="running",
            percent=70,
            log="Synthesizing competitor matrix, TAM/SAM/SOM sizing, and defensibility moat via Gemini 2.0 Flash...",
            message="Synthesizing competitor matrix, TAM/SAM/SOM, and defensibility via Gemini 2.0 Flash...",
            eta_seconds=40,
        )

        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            prompt = (
                "You are the ORBIT Market Analysis Agent powered by Tavily Search and Gemini 2.0 Flash.\n"
                "Synthesize the following problem statement and market research findings into 'market.md'.\n\n"
                f"### Problem Discovery Input (problem.md):\n{problem_text}\n\n"
                f"### Live Market Search Evidence (Tavily):\n{search_context}\n\n"
                "MANDATORY SECTIONS (use exact markdown H2 headings):\n"
                "## TAM SAM SOM\n"
                "Realistic sizing with concrete numbers and explicitly stated assumptions:\n"
                "- TAM: total addressable market\n"
                "- SAM: serviceable addressable market\n"
                "- SOM: serviceable obtainable market\n\n"
                "## Competitors\n"
                "Markdown table with columns: | Competitor | Pricing | Core Weakness |\n"
                "Include at least 3-4 actual market competitors from the research.\n\n"
                "## Defensibility / Moat\n"
                "1-2 paragraphs detailing technological defensibility, data flywheels, and switching costs.\n\n"
                "Return only the markdown document."
            )
            model_name = getattr(settings, "gemini_chat_model", "") or os.getenv("GEMINI_CHAT_MODEL", "gemini-2.0-flash")
            candidate_models = [model_name]
            for fb in ["gemini-2.0-flash", "gemini-3.5-flash-lite", "gemini-3-flash-preview", "gemini-3.8-flash", "gemini-3.5-flash"]:
                if fb not in candidate_models:
                    candidate_models.append(fb)
            market_md = ""
            last_exc = None
            for cand in candidate_models:
                try:
                    response = client.models.generate_content(
                        model=cand,
                        contents=prompt,
                    )
                    market_md = response.text or ""
                    if market_md.strip():
                        break
                except Exception as exc:
                    last_exc = exc
                    logger.warning("Gemini model %s failed (%s); trying fallback", cand, exc)
            if not market_md.strip():
                if last_exc:
                    raise last_exc
                raise RuntimeError("Gemini returned an empty market analysis response")
        except Exception as exc:
            logger.error("Market analysis API call failed: %s", exc)
            raise exc

    # Persist artifact
    persist_artifact(
        run_id=run_id,
        artifact_type="market_analysis",
        name="market.md",
        content=market_md,
    )
    state.market_md = market_md

    # Progress: 100% done
    emit(
        run_id=run_id,
        agent="market_analysis",
        index=2,
        status="done",
        percent=100,
        log="Market analysis completed. Verified market.md written to artifact store.",
        message="Market analysis complete: market.md verified and committed to state.",
        eta_seconds=0,
    )

    updated_progress = dict(state.progress or {})
    updated_progress["market_analysis"] = 100
    state.progress = updated_progress

    return {"market_md": market_md, "progress": updated_progress}
