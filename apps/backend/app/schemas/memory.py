"""
Pydantic schemas for Startup Memory Layer, Vector Search, and Multi-Vault Telemetry.
"""
from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

MemoryVaultType = Literal["all", "decision", "product", "technical", "user", "artifact"]


class MemorySearchResultItem(BaseModel):
    id: str
    text: str
    similarity_score: float = Field(ge=0.0, le=1.0)
    vault_type: Literal["decision", "product", "technical", "user", "artifact"]
    title: str
    category: str
    tags: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class MemorySearchRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    query: str = Field(min_length=1, max_length=1000)
    vault_type: MemoryVaultType = "all"
    top_k: int = Field(default=6, ge=1, le=50)
    min_similarity: float = Field(default=0.0, ge=0.0, le=1.0)


class MemorySearchResponse(BaseModel):
    query: str
    vault_type: str
    results: list[MemorySearchResultItem] = Field(default_factory=list)
    total_found: int
    retrieval_latency_ms: float


class MemoryRecordRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    vault_type: Literal["decision", "product", "technical", "user", "artifact"]
    title: str = Field(min_length=3, max_length=255)
    content: str = Field(min_length=5, max_length=10000)
    category: str = Field(default="general", max_length=100)
    tags: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class MemoryRecordResponse(BaseModel):
    id: str
    project_id: UUID
    vault_type: str
    title: str
    status: str = "indexed"
    indexed_at: datetime


class MemoryStatsResponse(BaseModel):
    project_id: UUID
    total_chunks: int
    vault_distribution: dict[str, int]
    vector_dimensions: int
    embedding_provider: str
    storage_engine: str
    health_status: str = "optimal"


class MemoryReindexResponse(BaseModel):
    project_id: UUID
    chunks_indexed: int
    status: str = "success"
    duration_ms: float
    indexed_at: datetime
