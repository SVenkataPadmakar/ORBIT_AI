"""
Centralized application configuration.

All environment-driven settings live here as a single Pydantic Settings object,
so no module reaches into `os.environ` directly. Import `get_settings()` (cached)
wherever configuration is needed.
"""
from functools import lru_cache
from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ---- General ----
    environment: Literal["development", "staging", "production", "test"] = "development"
    log_level: str = "info"
    api_v1_prefix: str = "/v1"

    # ---- Database ----
    database_url: str = Field(
        default="postgresql+asyncpg://copilot:changeme@localhost:5432/ai_startup_copilot"
    )
    database_pool_size: int = 10
    database_max_overflow: int = 20
    database_echo: bool = False

    # ---- Redis / Celery ----
    redis_url: str = "redis://localhost:6379/0"
    pipeline_execution_mode: Literal["auto", "queued", "inline"] = "auto"

    # ---- ChromaDB ----
    chroma_host: str = "localhost"
    chroma_port: int = 8001

    # ---- Auth ----
    jwt_secret_key: str = "dev-only-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30
    google_oauth_client_id: str = ""
    google_oauth_client_secret: str = ""
    google_oauth_redirect_uri: str = "http://localhost:3000/auth/google/callback"

    # ---- LLM Providers ----
    ai_provider: Literal["auto", "anthropic", "openai", "gemini", "demo"] = "auto"
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    google_gemini_api_key: str = ""
    gemini_chat_model: str = "gemini-2.0-flash"

    # ---- Billing ----
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_id_pro: str = ""
    stripe_price_id_team: str = ""

    # ---- AWS / S3 ----
    aws_region: str = "us-east-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    s3_bucket_name: str = "ai-startup-copilot-documents"

    # ---- Observability ----
    sentry_dsn: str = ""

    # ---- CORS ----
    # Browsers treat localhost and 127.0.0.1 as distinct credentialed origins.
    cors_allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        if self.is_production and (
            len(self.jwt_secret_key) < 32
            or self.jwt_secret_key in {"dev-only-secret-change-me", "change-me-in-production"}
        ):
            raise ValueError("JWT_SECRET_KEY must be a non-default value of at least 32 characters")
        return self

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
