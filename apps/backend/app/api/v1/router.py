"""
Aggregates every v1 sub-router. Route modules (auth, projects, agents, ...)
are added here as each is implemented in later phases — this file is the
single place that defines the v1 API surface.
"""
from fastapi import APIRouter

from app.api.v1 import admin, auth, execution, impact, memory, pipeline, projects, stream

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(pipeline.router, tags=["pipeline"])
api_router.include_router(stream.router, prefix="/projects", tags=["stream"])
api_router.include_router(impact.router, prefix="/artifacts", tags=["impact"])
api_router.include_router(execution.router, tags=["execution"])
api_router.include_router(memory.router, tags=["memory"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])

