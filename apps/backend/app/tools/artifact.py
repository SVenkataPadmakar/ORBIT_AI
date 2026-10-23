"""
ORBIT — Artifact Packaging and Upload Tool (artifact).
Typed tool interface for packaging workspace into zip and uploading deliverable:
  artifact.zip()
  artifact.upload()
"""
from __future__ import annotations

import logging
import os
import zipfile
from pathlib import Path
from typing import Optional

from app.sandbox.provider import SandboxProvider
from app.services.artifact_storage import persist_artifact
from app.tools.context import get_current_sandbox

logger = logging.getLogger("orbit.tools.artifact")

# Directories and files to exclude when packaging the deliverable zip
EXCLUDE_DIRS = {
    ".git",
    "node_modules",
    "__pycache__",
    ".pytest_cache",
    ".venv",
    "venv",
    ".next",
    ".turbo",
    "dist",
    "coverage",
}
EXCLUDE_FILES = {
    ".DS_Store",
    "thumbs.db",
}


def _resolve_sandbox(sandbox: Optional[SandboxProvider] = None) -> SandboxProvider:
    sb = sandbox or get_current_sandbox()
    if sb is None:
        raise RuntimeError("No active SandboxProvider bound to tool context.")
    return sb


def zip(
    source_dir: str = "/workspace",
    output_path: Optional[str] = None,
    sandbox: Optional[SandboxProvider] = None,
) -> str:
    """
    Packages the /workspace directory into a clean, reproducible zip archive (orbit.zip).
    Excludes node_modules, .git, and ephemeral build caches.
    """
    sb = _resolve_sandbox(sandbox)
    ws_dir = Path(sb.get_workspace_dir())

    if not ws_dir.exists():
        raise FileNotFoundError(f"Workspace directory does not exist: {ws_dir}")

    target_zip = output_path or str(ws_dir.parent / "orbit.zip")
    os.makedirs(os.path.dirname(target_zip), exist_ok=True)

    logger.info("Packaging workspace '%s' into '%s'...", ws_dir, target_zip)

    file_count = 0
    with zipfile.ZipFile(target_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(ws_dir):
            # Exclude unwanted directories in-place
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            for file in files:
                if file in EXCLUDE_FILES:
                    continue
                file_path = Path(root) / file
                rel_path = file_path.relative_to(ws_dir)
                zf.write(file_path, arcname=str(rel_path).replace("\\", "/"))
                file_count += 1

    logger.info("Created zip '%s' containing %d files (%d bytes)", target_zip, file_count, os.path.getsize(target_zip))
    return target_zip


def upload(
    zip_path: Optional[str] = None,
    run_id: Optional[str] = None,
    sandbox: Optional[SandboxProvider] = None,
) -> str:
    """
    Registers the packaged zip artifact in the persistent storage and returns zip_uri.
    """
    sb = _resolve_sandbox(sandbox)
    ws_dir = Path(sb.get_workspace_dir())

    effective_run_id = run_id or ws_dir.parent.name
    effective_zip = zip_path or str(ws_dir.parent / "orbit.zip")

    if not os.path.exists(effective_zip):
        # Auto-zip if not already packaged
        effective_zip = zip(source_dir="/workspace", output_path=effective_zip, sandbox=sb)

    logger.info("Uploading artifact zip '%s' for run %s...", effective_zip, effective_run_id)

    # Persist via unified artifact storage
    with open(effective_zip, "rb") as f:
        zip_bytes = f.read()

    art_record = persist_artifact(
        run_id=effective_run_id,
        artifact_type="deliverable_zip",
        filename="orbit.zip",
        content=zip_bytes,
        metadata={
            "size_bytes": len(zip_bytes),
            "file_count": 0,
            "deliverable": True,
        },
    )

    zip_uri = f"/api/runs/{effective_run_id}/artifacts/orbit.zip"
    logger.info("Artifact registered: %s -> %s", art_record.artifact_id, zip_uri)
    return zip_uri


# Namespace class for object-oriented tool calling
class ArtifactNamespace:
    @staticmethod
    def zip(source_dir: str = "/workspace", output_path: Optional[str] = None, sandbox: Optional[SandboxProvider] = None) -> str:
        return zip(source_dir=source_dir, output_path=output_path, sandbox=sandbox)

    @staticmethod
    def upload(zip_path: Optional[str] = None, run_id: Optional[str] = None, sandbox: Optional[SandboxProvider] = None) -> str:
        return upload(zip_path=zip_path, run_id=run_id, sandbox=sandbox)


artifact = ArtifactNamespace()
