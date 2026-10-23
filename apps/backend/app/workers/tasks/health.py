"""
Smoke-test task for verifying the Celery/Redis wiring end-to-end. Not part of
the product feature set — used by the health check and by CI to confirm a
worker is actually consuming from the queue before deploying dependent phases.
"""
from app.workers.celery_app import celery_app


@celery_app.task(name="app.workers.tasks.health.ping")  # type: ignore[untyped-decorator]
def ping() -> str:
    return "pong"
