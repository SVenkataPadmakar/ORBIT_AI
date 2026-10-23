"""
ORBIT v2 — Checkpoint Persistence Factory.
Provides SqliteSaver for local development and Postgres checkpointer for production.
Ensures every node transition is fully idempotent, resumeable, and audit-checkpointed.
"""
from __future__ import annotations

import logging
import os
import pickle
import sqlite3
from pathlib import Path
from typing import Any

from langgraph.checkpoint.base import BaseCheckpointSaver, ChannelVersions, Checkpoint, CheckpointMetadata, RunnableConfig
from langgraph.checkpoint.memory import MemorySaver

logger = logging.getLogger("orbit.graph.checkpointer")


class SqliteSaver(MemorySaver):
    """
    SQLite-backed Checkpoint Saver for LangGraph.
    Provides persistent local execution checkpoints without external daemon dependencies.
    Used during development and local integration tests.
    """
    def __init__(self, db_path: str | None = None) -> None:
        super().__init__()
        self.db_path = db_path
        if self.db_path and self.db_path != ":memory:":
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
            self._init_sqlite()
            self._load_sqlite()

    def _init_sqlite(self) -> None:
        if not self.db_path or self.db_path == ":memory:":
            return
        conn = sqlite3.connect(self.db_path)
        with conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS state_dump (
                    key TEXT PRIMARY KEY,
                    value BLOB
                )
                """
            )
        conn.close()

    def _load_sqlite(self) -> None:
        if not self.db_path or self.db_path == ":memory:":
            return
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT key, value FROM state_dump")
            for k, v in cursor.fetchall():
                data = pickle.loads(v)
                if k == "storage":
                    self.storage.update(data)
                elif k == "writes":
                    self.writes.update(data)
                elif k == "blobs":
                    self.blobs.update(data)
            conn.close()
        except Exception as exc:
            logger.warning("Could not load prior SQLite checkpoints from %s: %s", self.db_path, exc)

    def _save_sqlite(self) -> None:
        if not self.db_path or self.db_path == ":memory:":
            return
        try:
            conn = sqlite3.connect(self.db_path)
            with conn:
                conn.execute(
                    "INSERT OR REPLACE INTO state_dump (key, value) VALUES (?, ?)",
                    ("storage", pickle.dumps(dict(self.storage))),
                )
                conn.execute(
                    "INSERT OR REPLACE INTO state_dump (key, value) VALUES (?, ?)",
                    ("writes", pickle.dumps(dict(self.writes))),
                )
                conn.execute(
                    "INSERT OR REPLACE INTO state_dump (key, value) VALUES (?, ?)",
                    ("blobs", pickle.dumps(dict(self.blobs))),
                )
            conn.close()
        except Exception as exc:
            logger.error("Failed persisting checkpoint to SQLite at %s: %s", self.db_path, exc)

    def put(
        self,
        config: RunnableConfig,
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
        new_versions: ChannelVersions,
    ) -> RunnableConfig:
        res = super().put(config, checkpoint, metadata, new_versions)
        self._save_sqlite()
        return res

    def put_writes(
        self,
        config: RunnableConfig,
        writes: list[tuple[str, Any]],
        task_id: str,
        task_path: str = "",
    ) -> None:
        super().put_writes(config, writes, task_id, task_path)
        self._save_sqlite()


def get_checkpointer(env: str | None = None) -> BaseCheckpointSaver:
    """
    Factory resolving checkpointer based on environment.
    'dev' -> SqliteSaver (persisted to .orbit/checkpoints.db or in-memory)
    'prod' -> Postgres checkpointer (or fallback to SqliteSaver)
    """
    active_env = (env or os.getenv("ORBIT_ENV", "dev")).lower()

    if active_env in ("prod", "production"):
        try:
            from langgraph.checkpoint.postgres import PostgresSaver  # type: ignore
            dsn = os.getenv("DATABASE_URL", "postgresql://orbit:orbit@localhost:5432/orbit")
            logger.info("Initializing Postgres checkpointer for production.")
            return PostgresSaver.from_conn_string(dsn)
        except Exception as exc:
            logger.warning("Could not load PostgresSaver (%s). Falling back to SqliteSaver.", exc)

    # Default development checkpointer
    db_path = os.getenv("ORBIT_CHECKPOINT_DB", ".orbit/dev_checkpoints.db")
    return SqliteSaver(db_path=db_path)
