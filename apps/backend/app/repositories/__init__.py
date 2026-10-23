"""
Data-access layer, one repository per aggregate. Every repository extends
`BaseRepository` for the common get/list/add/delete operations and adds only
the query patterns specific to that aggregate.
"""
from app.repositories.agent_repository import AgentRepository
from app.repositories.agent_run_repository import AgentRunRepository
from app.repositories.audit_log_repository import AuditLogRepository
from app.repositories.document_repository import DocumentRepository
from app.repositories.financial_model_repository import FinancialModelRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.pitch_deck_repository import PitchDeckRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.report_repository import ReportRepository
from app.repositories.subscription_repository import SubscriptionRepository
from app.repositories.user_repository import UserRepository

__all__ = [
    "AgentRepository",
    "AgentRunRepository",
    "AuditLogRepository",
    "DocumentRepository",
    "FinancialModelRepository",
    "NotificationRepository",
    "PitchDeckRepository",
    "ProjectRepository",
    "ReportRepository",
    "SubscriptionRepository",
    "UserRepository",
]
