"""
Structured logging setup (structlog), configured once at app startup.

Every log line is emitted as JSON with a consistent set of base fields so logs
are queryable in CloudWatch/Datadog without ad-hoc parsing. `request_id` is bound
per-request by the logging middleware and automatically included on every log
call made during that request, which lets a single pipeline run be traced
end-to-end across API -> Celery task -> LangGraph node.
"""
import logging
import sys
from typing import cast

import structlog

from app.core.config import get_settings


def configure_logging() -> None:
    settings = get_settings()
    level = getattr(logging, settings.log_level.upper(), logging.INFO)

    logging.basicConfig(format="%(message)s", stream=sys.stdout, level=level)

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(level),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str) -> structlog.typing.FilteringBoundLogger:
    return cast(structlog.typing.FilteringBoundLogger, structlog.get_logger(name))
