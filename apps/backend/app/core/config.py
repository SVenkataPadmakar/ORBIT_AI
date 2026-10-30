"""
Centralized application configuration.

All environment-driven settings live here as a single Pydantic Settings object,
so no module reaches into `os.environ` directly. Import `get_settings()` (cached)
wherever configuration is needed.
"""
from functools import lru_cache
from typing import Literal

from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ---- General ----
    environment: Literal["development", "staging", "production", "test"] = "development"
    log_level: str = "info"
    api_v1_prefix: str = "/v1"

    # ---- Database ----
    database_url: str = Field(
        default="postgresql+asyncpg://copilot:changeme@localhost:5432/ai_startup_copilot",
        validation_alias=AliasChoices("DATABASE_URL", "database_url"),
    )
    database_pool_size: int = 10
    database_max_overflow: int = 20
    database_echo: bool = False

    # ---- Redis / Celery ----
    redis_url: str = Field(
        default="redis://localhost:6379/0",
        validation_alias=AliasChoices("REDIS_URL", "redis_url"),
    )
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

    # ---- Constitutional LLM & Service API Keys ----
    ai_provider: Literal["auto", "anthropic", "openai", "gemini", "demo"] = "auto"
    gemini_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("GEMINI_API_KEY", "gemini_api_key", "GOOGLE_GEMINI_API_KEY", "google_gemini_api_key"),
    )
    gemini_api_key_2: str = Field(
        default="",
        validation_alias=AliasChoices("GEMINI_API_KEY_2", "gemini_api_key_2", "GOOGLE_GEMINI_API_KEY_2", "google_gemini_api_key_2"),
    )
    openai_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("OPENAI_API_KEY", "openai_api_key"),
    )
    anthropic_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("ANTHROPIC_API_KEY", "anthropic_api_key"),
    )
    anthropic_chat_model: str = Field(
        default="claude-3-5-sonnet-20241022",
        validation_alias=AliasChoices("ANTHROPIC_CHAT_MODEL", "anthropic_chat_model"),
    )
    tavily_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("TAVILY_API_KEY", "tavily_api_key"),
    )
    e2b_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("E2B_API_KEY", "e2b_api_key"),
    )
    deepseek_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("DEEPSEEK_API_KEY", "deepseek_api_key"),
    )
    deepseek_base_url: str = Field(
        default="https://api.deepseek.com/v1",
        validation_alias=AliasChoices("DEEPSEEK_BASE_URL", "deepseek_base_url"),
    )
    gemini_chat_model: str = Field(
        default="gemini-2.0-flash",
        validation_alias=AliasChoices("GEMINI_CHAT_MODEL", "gemini_chat_model"),
    )

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

    @property
    def google_gemini_api_key(self) -> str:
        return self.gemini_api_key


@lru_cache
def get_settings() -> Settings:
    return Settings()
