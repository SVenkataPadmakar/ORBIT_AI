"""
ORBIT — Sandbox Provider Interface & Implementations.
Defines SandboxProvider ABC and implementations:
  - LocalDockerProvider (dev: Docker container or isolated host workspace fallback)
  - E2BProvider (prod: E2B cloud sandbox)
"""
from __future__ import annotations

import fnmatch
import logging
import os
import shutil
import subprocess
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger("orbit.sandbox.provider")


@dataclass
class ExecResult:
    """Result of command execution inside sandbox."""
    exit_code: int
    stdout: str
    stderr: str
    timed_out: bool = False

    @property
    def success(self) -> bool:
        return self.exit_code == 0 and not self.timed_out


class SandboxProvider(ABC):
    """Abstract interface for all ORBIT sandbox environments."""

    @abstractmethod
    def start(self, run_id: str) -> None:
        """Provision and initialize the sandbox environment."""
        pass

    @abstractmethod
    def exec(self, cmd: str, timeout: int = 60, cwd: str = "/workspace") -> ExecResult:
        """Execute a shell command inside the sandbox."""
        pass

    @abstractmethod
    def write_file(self, path: str, content: str) -> None:
        """Write content to a file at path inside sandbox."""
        pass

    @abstractmethod
    def read_file(self, path: str) -> str:
        """Read content of a file at path inside sandbox."""
        pass

    @abstractmethod
    def patch_file(self, path: str, unified_diff: str) -> bool:
        """Apply a unified diff patch to a file at path inside sandbox."""
        pass

    @abstractmethod
    def list_files(self, glob_pattern: str = "**/*") -> list[str]:
        """List files in workspace matching a glob pattern."""
        pass

    @abstractmethod
    def stop(self) -> None:
        """Tear down and clean up sandbox resources."""
        pass

    @abstractmethod
    def get_workspace_dir(self) -> str:
        """Return the host/local filesystem directory representing /workspace."""
        pass


class LocalDockerProvider(SandboxProvider):
    """
    Local Docker sandbox provider for development.
    Uses Docker container when Docker daemon is available;
    falls back cleanly to an isolated host directory with git-init in dev/test environments.
    """

    def __init__(self, base_dir: str | None = None, image: str = "node:20-bookworm") -> None:
        self.base_dir = base_dir or os.getenv("ORBIT_RUNS_DIR", "runs")
        self.image = image
        self.run_id: str = ""
        self.workspace_dir: Path = Path()
        self.container_id: str | None = None
        self.has_docker: bool = False

    def _check_docker_available(self) -> bool:
        """Checks if Docker CLI and daemon are accessible."""
        try:
            res = subprocess.run(
                ["docker", "info"],
                capture_output=True,
                text=True,
                timeout=5,
                check=False,
            )
            return res.returncode == 0
        except Exception:
            return False

    def _resolve_path(self, path: str) -> Path:
        """Resolves /workspace or relative path to host filesystem path."""
        p_str = path.replace("\\", "/")
        if p_str.startswith("/workspace/"):
            rel = p_str[len("/workspace/"):]
            return self.workspace_dir / rel
        elif p_str == "/workspace":
            return self.workspace_dir
        elif os.path.isabs(p_str):
            # Check if inside workspace
            try:
                rel = Path(p_str).relative_to(self.workspace_dir)
                return self.workspace_dir / rel
            except ValueError:
                # Strip leading drive or slash
                cleaned = p_str.lstrip("/\\")
                if ":" in cleaned:
                    cleaned = cleaned.split(":", 1)[1].lstrip("/\\")
                return self.workspace_dir / cleaned
        return self.workspace_dir / path

    def start(self, run_id: str) -> None:
        self.run_id = run_id
        self.workspace_dir = Path(self.base_dir).resolve() / run_id / "workspace"
        self.workspace_dir.mkdir(parents=True, exist_ok=True)

        self.has_docker = self._check_docker_available()
        if self.has_docker:
            try:
                logger.info("Spawning Docker container for run %s (%s)...", run_id, self.image)
                cmd = [
                    "docker", "run", "-d",
                    "--name", f"orbit-sandbox-{run_id[:12]}",
                    "-v", f"{self.workspace_dir}:/workspace",
                    "-w", "/workspace",
                    self.image, "tail", "-f", "/dev/null"
                ]
                proc = subprocess.run(cmd, capture_output=True, text=True, timeout=30, check=False)
                if proc.returncode == 0:
                    self.container_id = proc.stdout.strip()
                    logger.info("Docker container started: %s", self.container_id[:12])
                else:
                    logger.warning("Docker start failed: %s; falling back to local workspace.", proc.stderr)
                    self.has_docker = False
            except Exception as exc:
                logger.warning("Docker startup exception: %s; falling back to local workspace.", exc)
                self.has_docker = False

        # Initialize git in workspace if not already initialized
        self._init_git()

    def _init_git(self) -> None:
        """Ensures /workspace is a git repository with standard user config."""
        git_dir = self.workspace_dir / ".git"
        if not git_dir.exists():
            self.exec("git init", cwd="/workspace")
            self.exec("git config user.name \"ORBIT Developer Agent\"", cwd="/workspace")
            self.exec("git config user.email \"developer@orbit.agent\"", cwd="/workspace")

    def exec(self, cmd: str, timeout: int = 60, cwd: str = "/workspace") -> ExecResult:
        resolved_cwd = str(self._resolve_path(cwd))
        if not os.path.exists(resolved_cwd):
            os.makedirs(resolved_cwd, exist_ok=True)

        if self.has_docker and self.container_id:
            docker_cmd = ["docker", "exec", "-w", cwd, self.container_id, "sh", "-c", cmd]
            try:
                proc = subprocess.run(
                    docker_cmd,
                    capture_output=True,
                    text=True,
                    timeout=timeout,
                    check=False,
                )
                return ExecResult(
                    exit_code=proc.returncode,
                    stdout=proc.stdout,
                    stderr=proc.stderr,
                    timed_out=False,
                )
            except subprocess.TimeoutExpired:
                return ExecResult(exit_code=-1, stdout="", stderr=f"Command timed out after {timeout}s", timed_out=True)
            except Exception as exc:
                return ExecResult(exit_code=-1, stdout="", stderr=str(exc))

        # Local process execution fallback
        try:
            env = {**os.environ, "GIT_TERMINAL_PROMPT": "0", "GIT_EDITOR": "true"}
            proc = subprocess.run(
                cmd,
                cwd=resolved_cwd,
                capture_output=True,
                text=True,
                timeout=timeout,
                shell=True,
                env=env,
                check=False,
            )
            return ExecResult(
                exit_code=proc.returncode,
                stdout=proc.stdout,
                stderr=proc.stderr,
                timed_out=False,
            )
        except subprocess.TimeoutExpired:
            return ExecResult(
                exit_code=-1,
                stdout="",
                stderr=f"Command timed out after {timeout}s",
                timed_out=True,
            )
        except Exception as exc:
            return ExecResult(exit_code=-1, stdout="", stderr=str(exc))

    def write_file(self, path: str, content: str) -> None:
        target = self._resolve_path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")

    def read_file(self, path: str) -> str:
        target = self._resolve_path(path)
        if not target.exists():
            raise FileNotFoundError(f"File not found in sandbox: {path}")
        return target.read_text(encoding="utf-8")

    def patch_file(self, path: str, unified_diff: str) -> bool:
        target = self._resolve_path(path)
        if not target.exists():
            return False

        original_lines = target.read_text(encoding="utf-8").splitlines(keepends=True)
        # Parse diff lines
        lines = unified_diff.splitlines()
        
        # Simple unified diff hunk application
        patch_applied = False
        # Try diff replacement
        removals = []
        additions = []
        for line in lines:
            if line.startswith("-") and not line.startswith("---"):
                removals.append(line[1:].rstrip("\r\n"))
            elif line.startswith("+") and not line.startswith("+++"):
                additions.append(line[1:].rstrip("\r\n"))

        content = target.read_text(encoding="utf-8")
        if removals:
            search_block = "\n".join(removals)
            replace_block = "\n".join(additions)
            if search_block in content:
                content = content.replace(search_block, replace_block, 1)
                target.write_text(content, encoding="utf-8")
                return True

        # Fallback to direct hunk matching or append
        if additions and not removals:
            content += "\n" + "\n".join(additions)
            target.write_text(content, encoding="utf-8")
            return True

        return False

    def list_files(self, glob_pattern: str = "*") -> list[str]:
        if not self.workspace_dir.exists():
            return []
        results = []
        for p in self.workspace_dir.rglob("*"):
            if p.is_file():
                rel = str(p.relative_to(self.workspace_dir)).replace("\\", "/")
                if not rel.startswith(".git/"):
                    if glob_pattern in ("*", "**/*", ""):
                        results.append(rel)
                    elif fnmatch.fnmatch(rel, glob_pattern) or fnmatch.fnmatch(p.name, glob_pattern):
                        results.append(rel)
        return sorted(results)

    def stop(self) -> None:
        if self.has_docker and self.container_id:
            try:
                subprocess.run(["docker", "rm", "-f", self.container_id], capture_output=True, timeout=10, check=False)
                logger.info("Stopped Docker container %s", self.container_id[:12])
            except Exception as exc:
                logger.warning("Error stopping container: %s", exc)
            self.container_id = None

    def get_workspace_dir(self) -> str:
        return str(self.workspace_dir)


class E2BProvider(SandboxProvider):
    """
    E2B cloud sandbox provider for production.
    Uses E2B SDK when available and configured; falls back cleanly to LocalDockerProvider.
    """

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or os.getenv("E2B_API_KEY")
        self.sandbox: Any = None
        self._fallback = LocalDockerProvider()

    def start(self, run_id: str) -> None:
        if self.api_key:
            try:
                # Attempt importing e2b SDK if installed
                import e2b  # type: ignore
                logger.info("Initializing E2B cloud sandbox for run %s...", run_id)
                self.sandbox = e2b.Sandbox()
                return
            except Exception as exc:
                logger.warning("E2B initialization failed (%s); falling back to LocalDockerProvider", exc)
        # Fallback
        self._fallback.start(run_id)

    def exec(self, cmd: str, timeout: int = 60, cwd: str = "/workspace") -> ExecResult:
        if self.sandbox:
            try:
                proc = self.sandbox.commands.run(cmd, timeout=timeout, cwd=cwd)
                return ExecResult(
                    exit_code=proc.exit_code or 0,
                    stdout=proc.stdout or "",
                    stderr=proc.stderr or "",
                    timed_out=False,
                )
            except Exception as exc:
                return ExecResult(exit_code=-1, stdout="", stderr=str(exc))
        return self._fallback.exec(cmd, timeout=timeout, cwd=cwd)

    def write_file(self, path: str, content: str) -> None:
        if self.sandbox:
            self.sandbox.files.write(path, content)
            return
        self._fallback.write_file(path, content)

    def read_file(self, path: str) -> str:
        if self.sandbox:
            return self.sandbox.files.read(path)
        return self._fallback.read_file(path)

    def patch_file(self, path: str, unified_diff: str) -> bool:
        if self.sandbox:
            content = self.read_file(path)
            # Apply diff
            lines = unified_diff.splitlines()
            removals = [l[1:] for l in lines if l.startswith("-") and not l.startswith("---")]
            additions = [l[1:] for l in lines if l.startswith("+") and not l.startswith("+++")]
            if removals:
                sb = "\n".join(removals)
                rb = "\n".join(additions)
                if sb in content:
                    self.write_file(path, content.replace(sb, rb, 1))
                    return True
            return False
        return self._fallback.patch_file(path, unified_diff)

    def list_files(self, glob_pattern: str = "*") -> list[str]:
        if self.sandbox:
            try:
                entries = self.sandbox.files.list("/workspace")
                if glob_pattern in ("*", "**/*", ""):
                    return [e.name for e in entries]
                return [e.name for e in entries if fnmatch.fnmatch(e.name, glob_pattern)]
            except Exception:
                return []
        return self._fallback.list_files(glob_pattern)

    def stop(self) -> None:
        if self.sandbox:
            try:
                self.sandbox.close()
            except Exception:
                pass
            self.sandbox = None
        self._fallback.stop()

    def get_workspace_dir(self) -> str:
        if self.sandbox:
            return "/workspace"
        return self._fallback.get_workspace_dir()


def get_sandbox_provider(mode: str | None = None) -> SandboxProvider:
    """
    Factory function for obtaining the appropriate SandboxProvider.
    - 'e2b' or prod: E2BProvider
    - 'docker' or dev: LocalDockerProvider
    """
    selected_mode = mode or os.getenv("ORBIT_SANDBOX_MODE", "dev").lower()
    if selected_mode in ("e2b", "prod", "production") and os.getenv("E2B_API_KEY"):
        return E2BProvider()
    return LocalDockerProvider()
