"""
Startup Memory Layer REST API endpoints for ChromaDB vector search,
multi-vault inspection, and automatic indexing.
"""
import time
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.api.dependencies import CurrentUser, DbSession
from app.core.errors import NotFoundError
from app.repositories.project_repository import ProjectRepository
from app.schemas.cofounder_intelligence import CofounderMemoryState
from app.schemas.memory import (
    MemoryRecordRequest,
    MemoryRecordResponse,
    MemoryReindexResponse,
    MemorySearchRequest,
    MemorySearchResponse,
    MemoryStatsResponse,
)
from app.services.cofounder_service import CofounderService
from app.services.memory_service import MemoryService

router = APIRouter(prefix="/projects/{project_id}/memory", tags=["memory"])


@router.get("", response_model=CofounderMemoryState)
async def get_project_memory_state(
    project_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> CofounderMemoryState:
    """Retrieve synthesized 4-layer startup memory state for a project."""
    service = CofounderService(db)
    try:
        return await service.get_memory(project_id, current_user.id)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e


@router.post("/search", response_model=MemorySearchResponse)
async def search_startup_memory(
    project_id: UUID,
    request: MemorySearchRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> MemorySearchResponse:
    """Execute semantic vector similarity search across all project memory vaults."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_owned_by(project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    memory_service = MemoryService(db)
    return await memory_service.semantic_search(project_id, request)


@router.post("/index", response_model=MemoryReindexResponse)
async def reindex_project_memory(
    project_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> MemoryReindexResponse:
    """Trigger complete re-indexing of all project artifacts, decisions, and specs into ChromaDB."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_owned_by(project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    start_time = time.perf_counter()
    memory_service = MemoryService(db)
    count = await memory_service.index_all_project_artifacts(project_id)
    duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return MemoryReindexResponse(
        project_id=project_id,
        chunks_indexed=count,
        status="success",
        duration_ms=duration_ms,
        indexed_at=datetime.now(UTC),
    )


@router.post("/record", response_model=MemoryRecordResponse)
async def record_memory_item(
    project_id: UUID,
    request: MemoryRecordRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> MemoryRecordResponse:
    """Record a new decision, product spec, technical rule, or user directive into the memory layer."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_owned_by(project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    memory_service = MemoryService(db)
    return await memory_service.record_memory_item(project_id, request, user_id=current_user.id)


@router.get("/stats", response_model=MemoryStatsResponse)
async def get_memory_stats(
    project_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> MemoryStatsResponse:
    """Get vector store statistics, chunk distribution, and index health for the project."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_owned_by(project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    memory_service = MemoryService(db)
    return await memory_service.get_memory_statistics(project_id)


@router.delete("/{memory_id}")
async def delete_memory_item(
    project_id: UUID,
    memory_id: str,
    current_user: CurrentUser,
    db: DbSession,
) -> dict[str, Any]:
    """Remove a specific memory item from the vector index."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_owned_by(project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    memory_service = MemoryService(db)
    success = memory_service.delete_memory_item(project_id, memory_id)
    return {"status": "deleted" if success else "failed", "memory_id": memory_id}
