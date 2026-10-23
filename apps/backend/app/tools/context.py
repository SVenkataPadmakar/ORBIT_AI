"""
ORBIT — Tool Execution Context.
Manages active SandboxProvider for typed agent tools.
"""
from __future__ import annotations

from contextlib import contextmanager
from contextvars import ContextVar
from typing import Generator, Optional

from app.sandbox.provider import SandboxProvider

_current_sandbox: ContextVar[Optional[SandboxProvider]] = ContextVar("current_sandbox", default=None)


def get_current_sandbox() -> Optional[SandboxProvider]:
    """Retrieves the active SandboxProvider in the current context."""
    return _current_sandbox.get()


def set_current_sandbox(sandbox: Optional[SandboxProvider]) -> None:
    """Sets the active SandboxProvider."""
    _current_sandbox.set(sandbox)


@contextmanager
def bind_sandbox(sandbox: SandboxProvider) -> Generator[SandboxProvider, None, None]:
    """Context manager binding a sandbox to the current execution thread/task."""
    token = _current_sandbox.set(sandbox)
    try:
        yield sandbox
    finally:
        _current_sandbox.reset(token)
