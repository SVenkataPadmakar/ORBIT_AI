"""
API router for the Change Impact Engine.
"""
from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.api.dependencies import DbSession
from app.services.artifact_service import get_downstream_impact

router = APIRouter()


@router.get("/{artifact_id}/impact")
async def get_impact_analysis(
    artifact_id: UUID,
    db: DbSession,
) -> dict[str, Any]:
    """
    Retrieve the downstream artifacts that will be invalidated if the given artifact is modified.
    """
    try:
        impacted_ids = await get_downstream_impact(db, artifact_id)
        return {"artifact_id": artifact_id, "impacted_downstream_ids": impacted_ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

