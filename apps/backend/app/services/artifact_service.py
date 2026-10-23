"""
Service for managing Artifacts and their Dependency Graph in the AI Founder OS.
"""
import uuid
from typing import Any

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.artifact import Artifact, ArtifactDependency, ArtifactVersion


async def create_artifact(
    session: AsyncSession,
    project_id: uuid.UUID,
    artifact_type: str,
    content: dict[str, Any],
    created_by_id: uuid.UUID | None = None,
    dependencies: list[uuid.UUID] | None = None,
) -> Artifact:
    """Create a new artifact with its initial version."""
    artifact = Artifact(
        project_id=project_id,
        type=artifact_type,
        status="DRAFT",
        version=1,
        content=content,
        created_by_id=created_by_id,
    )
    session.add(artifact)
    await session.flush()

    version = ArtifactVersion(
        artifact_id=artifact.id,
        version=1,
        content=content,
        created_by_id=created_by_id,
    )
    session.add(version)

    if dependencies:
        for dep_id in dependencies:
            dep = ArtifactDependency(source_artifact_id=dep_id, target_artifact_id=artifact.id)
            session.add(dep)
            
    await session.commit()
    return artifact


async def update_artifact_version(
    session: AsyncSession,
    artifact_id: uuid.UUID,
    new_content: dict[str, Any],
    created_by_id: uuid.UUID | None = None,
) -> Artifact:
    """Create a new version for an existing artifact."""
    result = await session.execute(
        select(Artifact).where(Artifact.id == artifact_id).options(selectinload(Artifact.versions))
    )
    artifact = result.scalar_one_or_none()
    if not artifact:
        raise ValueError("Artifact not found")

    new_version_num = artifact.version + 1
    artifact.version = new_version_num
    artifact.content = new_content
    artifact.status = "PROPOSED" # Needs approval usually
    
    version = ArtifactVersion(
        artifact_id=artifact.id,
        version=new_version_num,
        content=new_content,
        created_by_id=created_by_id,
    )
    session.add(version)
    await session.commit()
    return artifact


async def get_artifact(session: AsyncSession, artifact_id: uuid.UUID) -> Artifact | None:
    result = await session.execute(select(Artifact).where(Artifact.id == artifact_id))
    return result.scalar_one_or_none()


async def get_downstream_impact(session: AsyncSession, artifact_id: uuid.UUID) -> list[uuid.UUID]:
    """
    Traverse the artifact dependency DAG using a Recursive CTE to find 
    all downstream artifacts affected by a change to `artifact_id`.
    """
    query = text(
        """
        WITH RECURSIVE impact_graph AS (
            -- Base case: find immediate dependents
            SELECT target_artifact_id, source_artifact_id, 1 AS depth
            FROM artifact_dependencies
            WHERE source_artifact_id = :start_id
            
            UNION ALL
            
            -- Recursive step: find dependents of dependents
            SELECT ad.target_artifact_id, ad.source_artifact_id, ig.depth + 1
            FROM artifact_dependencies ad
            INNER JOIN impact_graph ig ON ad.source_artifact_id = ig.target_artifact_id
        )
        SELECT target_artifact_id FROM impact_graph
        """
    )
    result = await session.execute(query, {"start_id": artifact_id})
    return [row[0] for row in result.all()]


async def flag_downstream_outdated(session: AsyncSession, artifact_id: uuid.UUID) -> list[uuid.UUID]:
    """Flag all downstream artifacts as OUTDATED."""
    impacted_ids = await get_downstream_impact(session, artifact_id)
    if not impacted_ids:
        return []
    
    # Batch update
    await session.execute(
        text("UPDATE artifacts SET status = 'OUTDATED' WHERE id = ANY(:ids)"),
        {"ids": impacted_ids}
    )
    await session.commit()
    return impacted_ids
