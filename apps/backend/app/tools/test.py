"""
ORBIT — Test Execution Tool (test).
Typed tool interface for test runners inside sandbox:
  test.run(framework)
Supported frameworks:
  - pytest (Backend Python API tests)
  - vitest (Frontend React / Next.js tests)
  - playwright (E2E browser tests)
"""
from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from typing import Optional

from app.sandbox.provider import ExecResult, SandboxProvider
from app.tools.context import get_current_sandbox

logger = logging.getLogger("orbit.tools.test")


@dataclass
class TestResult:
    """Structured report of test execution."""
    framework: str
    passed: bool
    exit_code: int
    stdout: str
    stderr: str
    passed_count: int = 0
    failed_count: int = 0
    total_count: int = 0

    @property
    def summary(self) -> str:
        return f"{self.framework}: {'PASSED' if self.passed else 'FAILED'} ({self.passed_count}/{self.total_count} passed)"


def _resolve_sandbox(sandbox: Optional[SandboxProvider] = None) -> SandboxProvider:
    sb = sandbox or get_current_sandbox()
    if sb is None:
        raise RuntimeError("No active SandboxProvider bound to tool context.")
    return sb


import sys

def run(
    framework: str,
    cwd: str = "/workspace",
    timeout: int = 30,
    sandbox: Optional[SandboxProvider] = None,
) -> TestResult:
    """
    Executes tests using the specified test framework:
      - pytest: runs Python backend tests in apps/api
      - vitest: runs TypeScript frontend unit tests in apps/web
      - playwright: runs end-to-end integration tests
    """
    sb = _resolve_sandbox(sandbox)
    fw = framework.lower().strip()

    if fw == "pytest":
        # Use active python interpreter if not inside external container
        python_bin = sys.executable if not getattr(sb, "has_docker", False) else "python"
        cmd = f'"{python_bin}" -m pytest -v apps/api'
    elif fw == "vitest":
        cmd = "pnpm --filter web test"
    elif fw == "playwright":
        cmd = "pnpm exec playwright test"
    else:
        cmd = f"pnpm test"

    logger.info("test.run: framework=%s, cmd='%s'", fw, cmd)
    exec_res: ExecResult = sb.exec(cmd, timeout=timeout, cwd=cwd)

    passed = exec_res.exit_code == 0
    stdout = exec_res.stdout
    stderr = exec_res.stderr

    passed_count = 0
    failed_count = 0
    total_count = 0

    if fw == "pytest":
        # Parse pytest output e.g. "5 passed, 0 failed in 0.42s"
        m_pass = re.search(r"(\d+)\s+passed", stdout)
        m_fail = re.search(r"(\d+)\s+failed", stdout)
        if m_pass:
            passed_count = int(m_pass.group(1))
        if m_fail:
            failed_count = int(m_fail.group(1))
        total_count = passed_count + failed_count
        if total_count == 0 and passed:
            passed_count = 1
            total_count = 1
    elif fw == "vitest":
        m_pass = re.search(r"(\d+)\s+passed", stdout)
        m_fail = re.search(r"(\d+)\s+failed", stdout)
        if m_pass:
            passed_count = int(m_pass.group(1))
        if m_fail:
            failed_count = int(m_fail.group(1))
        total_count = passed_count + failed_count
        if total_count == 0 and passed:
            passed_count = 1
            total_count = 1
    else:
        passed_count = 1 if passed else 0
        failed_count = 0 if passed else 1
        total_count = 1

    result = TestResult(
        framework=framework,
        passed=passed,
        exit_code=exec_res.exit_code,
        stdout=stdout,
        stderr=stderr,
        passed_count=passed_count,
        failed_count=failed_count,
        total_count=total_count,
    )
    logger.info("test.run finished: %s", result.summary)
    return result
