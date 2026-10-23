"""
ORBIT — Shell, Package Manager, and HTTP Probe Tools.
Typed tool interface for command execution, package installation, and HTTP probing:
  shell.exec(cmd, timeout)
  pkg.install(manager, deps)
  http.probe(url, expect_status)
"""
from __future__ import annotations

import logging
from typing import Optional, Sequence
import urllib.error
import urllib.request

from app.sandbox.provider import ExecResult, SandboxProvider
from app.tools.context import get_current_sandbox

logger = logging.getLogger("orbit.tools.shell")


def _resolve_sandbox(sandbox: Optional[SandboxProvider] = None) -> SandboxProvider:
    sb = sandbox or get_current_sandbox()
    if sb is None:
        raise RuntimeError("No active SandboxProvider bound to tool context.")
    return sb


def exec(
    cmd: str,
    timeout: int = 60,
    cwd: str = "/workspace",
    sandbox: Optional[SandboxProvider] = None,
) -> ExecResult:
    """
    Executes a shell command inside the sandbox.
    """
    sb = _resolve_sandbox(sandbox)
    logger.info("shell.exec: '%s' (timeout=%ds, cwd=%s)", cmd, timeout, cwd)
    res = sb.exec(cmd, timeout=timeout, cwd=cwd)
    logger.debug("shell.exec result code=%d, stdout_len=%d", res.exit_code, len(res.stdout))
    return res


def install(
    manager: str,
    deps: Sequence[str] | str,
    cwd: str = "/workspace",
    sandbox: Optional[SandboxProvider] = None,
) -> ExecResult:
    """
    Installs packages using the specified package manager:
      - pnpm, npm, yarn
      - pip, poetry
    """
    dep_str = " ".join(deps) if isinstance(deps, (list, tuple)) else str(deps)
    mgr = manager.lower().strip()

    if mgr == "pnpm":
        cmd = f"pnpm add {dep_str}"
    elif mgr == "npm":
        cmd = f"npm install {dep_str}"
    elif mgr == "yarn":
        cmd = f"yarn add {dep_str}"
    elif mgr == "pip":
        cmd = f"pip install {dep_str}"
    elif mgr == "poetry":
        cmd = f"poetry add {dep_str}"
    else:
        cmd = f"{manager} install {dep_str}"

    logger.info("pkg.install: %s via %s", dep_str, mgr)
    return exec(cmd, timeout=120, cwd=cwd, sandbox=sandbox)


def probe(url: str, expect_status: int = 200, timeout: float = 5.0) -> bool:
    """
    Probes an HTTP endpoint and checks whether the response matches expect_status.
    """
    logger.info("http.probe: %s (expecting %d)", url, expect_status)
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "ORBIT-Probe/1.0", "Accept": "*/*"}
        )
        with urllib.request.urlopen(req, timeout=timeout) as response:
            status = response.getcode()
            logger.info("http.probe response status: %d", status)
            return status == expect_status
    except urllib.error.HTTPError as exc:
        logger.info("http.probe HTTPError status: %d (expected %d)", exc.code, expect_status)
        return exc.code == expect_status
    except Exception as exc:
        logger.warning("http.probe connection failed for %s: %s", url, exc)
        return False


# Namespace classes for object-oriented tool calling
class PkgNamespace:
    @staticmethod
    def install(manager: str, deps: Sequence[str] | str, cwd: str = "/workspace", sandbox: Optional[SandboxProvider] = None) -> ExecResult:
        return install(manager, deps, cwd=cwd, sandbox=sandbox)


class HttpNamespace:
    @staticmethod
    def probe(url: str, expect_status: int = 200, timeout: float = 5.0) -> bool:
        return probe(url, expect_status=expect_status, timeout=timeout)


pkg = PkgNamespace()
http = HttpNamespace()
