"""
Import every ORM model here so `Base.metadata` is fully populated wherever
`app.models` (this package) is imported — this is what makes Alembic's
autogenerate, and `Base.metadata.create_all` in tests, see every table.
Import order matters only in that every model referenced by a string
forward-reference (e.g. "Project") must be imported somewhere before the
mapper configuration is used — importing the whole package here guarantees
that regardless of which individual model a caller imports first.
"""
from app.models.agent import Agent
from app.models.agent_run import AgentRun
from app.models.artifact import Artifact, ArtifactDependency, ArtifactVersion
from app.models.audit_log import AuditLog
from app.models.decision import Decision
from app.models.document import Document
from app.models.execution import CofounderMessageRecord, ExecutionPlanRecord
from app.models.financial_model import FinancialModel
from app.models.notification import Notification
from app.models.pitch_deck import PitchDeck
from app.models.project import Project
from app.models.report import Report
from app.models.session import UserSession
from app.models.stage_execution import StageExecutionRecord
from app.models.subscription import Subscription
from app.models.task import Task
from app.models.user import User

__all__ = [
    "Agent",
    "AgentRun",
    "Artifact",
    "ArtifactDependency",
    "ArtifactVersion",
    "AuditLog",
    "Decision",
    "Document",
    "CofounderMessageRecord",
    "ExecutionPlanRecord",
    "FinancialModel",
    "Notification",
    "PitchDeck",
    "Project",
    "Report",
    "StageExecutionRecord",
    "UserSession",
    "Subscription",
    "Task",
    "User",
]
