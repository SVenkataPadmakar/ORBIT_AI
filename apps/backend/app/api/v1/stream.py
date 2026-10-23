"""
SSE endpoint for streaming real-time agent updates, multi-agent debates, and consensus scoring to the Frontend.
"""
import json

from fastapi import APIRouter

from app.orchestration.event_bus import agent_event_bus

try:
    from sse_starlette.sse import EventSourceResponse  # type: ignore
except ImportError:
    from starlette.responses import StreamingResponse

    class EventSourceResponse(StreamingResponse):
        def __init__(self, content, *args, **kwargs):
            async def event_generator():
                async for item in content:
                    if isinstance(item, dict):
                        data = json.dumps(item.get("data", {}))
                        event_type = item.get("event", "message")
                        yield f"event: {event_type}\ndata: {data}\n\n"
                    else:
                        yield f"data: {item}\n\n"
            kwargs["media_type"] = "text/event-stream"
            headers = kwargs.setdefault("headers", {})
            headers["Cache-Control"] = "no-cache"
            headers["Connection"] = "keep-alive"
            super().__init__(event_generator(), *args, **kwargs)

router = APIRouter()


@router.get("/{project_id}/stream")
async def stream_project_events(project_id: str) -> EventSourceResponse:
    """
    Stream real-time events for a specific project.
    Events include:
      - 'agent_started': Which of the 15 agents is acting
      - 'evidence_gathered': Grounded research data and tool results
      - 'reflection_made': Socratic critique from Reflection Agent
      - 'verification_completed': Evidence gate audits
      - 'debate_round': Arguments & counter-arguments between opposing agents
      - 'consensus_scored': Agreement score (0-100) and threshold status
      - 'artifact_ready': DDL schemas, OpenAPI specs, PRD, Sprint Backlog
      - 'execution_completed': Complete workflow execution
    """
    return EventSourceResponse(agent_event_bus.subscribe(project_id))
