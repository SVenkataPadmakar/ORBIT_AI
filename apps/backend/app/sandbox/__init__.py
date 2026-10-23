"""
ORBIT — Sandbox Provider Module.
Provides abstractions for isolated container sandboxes:
  - E2B in prod
  - Local Docker / isolated host environment in dev
"""
from app.sandbox.provider import (
    ExecResult,
    SandboxProvider,
    LocalDockerProvider,
    E2BProvider,
    get_sandbox_provider,
)

__all__ = [
    "ExecResult",
    "SandboxProvider",
    "LocalDockerProvider",
    "E2BProvider",
    "get_sandbox_provider",
]
