"""
Celery application factory.

Queue layout mirrors the backend architecture doc:
  - pipeline:      full 6-agent orchestrated runs (long-running)
  - agent:         single-agent re-runs after a user edit
  - export:        PDF/PPTX generation
  - notifications: transactional email + in-app notification writes
  - default:       housekeeping / periodic tasks (Celery beat)

Task modules are imported (not just declared) so Celery's autodiscovery
registers every task defined under app.workers.tasks.*.
"""
from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "ai_startup_copilot",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_routes={
        "app.workers.tasks.pipeline.*": {"queue": "pipeline"},
        "app.workers.tasks.agent.*": {"queue": "agent"},
        "app.workers.tasks.export.*": {"queue": "export"},
        "app.workers.tasks.notifications.*": {"queue": "notifications"},
    },
    task_default_queue="default",
)

celery_app.autodiscover_tasks(["app.workers.tasks"])
