"""
ORBIT — Filesystem Tool (fs).
Typed tool interface for filesystem operations inside sandbox:
  fs.write(path, content)
  fs.read(path)
  fs.patch(path, unified_diff)
  fs.list(glob)
"""
from __future__ import annotations

import logging
from typing import Optional

from app.sandbox.provider import SandboxProvider
from app.tools.context import get_current_sandbox

logger = logging.getLogger("orbit.tools.fs")


def _resolve_sandbox(sandbox: Optional[SandboxProvider] = None) -> SandboxProvider:
    sb = sandbox or get_current_sandbox()
    if sb is None:
        raise RuntimeError("No active SandboxProvider bound to tool context.")
    return sb


def write(path: str, content: str, sandbox: Optional[SandboxProvider] = None) -> bool:
    """
    Writes content to path inside the sandbox workspace.
    Creates parent directories as needed.
    """
    sb = _resolve_sandbox(sandbox)
    sb.write_file(path, content)
    logger.debug("fs.write: %s (%d bytes)", path, len(content))
    return True


def read(path: str, sandbox: Optional[SandboxProvider] = None) -> str:
    """
    Reads file content from path inside the sandbox workspace.
    """
    sb = _resolve_sandbox(sandbox)
    content = sb.read_file(path)
    logger.debug("fs.read: %s (%d bytes)", path, len(content))
    return content


def patch(path: str, unified_diff: str, sandbox: Optional[SandboxProvider] = None) -> bool:
    """
    Applies a unified diff patch to a file at path inside sandbox.
    """
    sb = _resolve_sandbox(sandbox)
    result = sb.patch_file(path, unified_diff)
    logger.debug("fs.patch: %s (success=%s)", path, result)
    return result


def list(glob: str = "*", sandbox: Optional[SandboxProvider] = None) -> list[str]:
    """
    Lists files in sandbox matching glob pattern.
    """
    sb = _resolve_sandbox(sandbox)
    files = sb.list_files(glob)
    logger.debug("fs.list: %s (%d files)", glob, len(files))
    return files


# Alias for compatibility with list_files
list_files = list
