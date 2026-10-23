"""LLM provider abstraction with validated JSON responses and explicit demo fallback."""
import importlib
import json
from dataclasses import dataclass
from typing import Any, Protocol, cast

from pydantic import BaseModel

from app.core.config import Settings, get_settings


class ProviderError(RuntimeError):
    """Raised when an enabled provider cannot produce a valid structured response."""


@dataclass(frozen=True)
class ProviderResult:
    output: BaseModel
    provider: str
    model: str
    tokens_used: int
    cost_usd: float = 0.0


class AIProvider(Protocol):
    name: str

    async def generate(
        self,
        *,
        stage: str,
        model: str,
        output_model: type[BaseModel],
        context: dict[str, Any],
    ) -> ProviderResult: ...


def _system_prompt(stage: str, output_model: type[BaseModel]) -> str:
    schema = json.dumps(output_model.model_json_schema(), separators=(",", ":"))
    return (
        "You are one stage in a startup planning pipeline. Produce rigorous, concise, "
        "decision-useful analysis. Treat market and financial numbers as reasoned estimates, "
        "state assumptions, and never claim live research or verified facts unless supplied in "
        f"the context. Return only valid JSON for stage {stage!r} matching this schema: {schema}"
    )


def _user_prompt(context: dict[str, Any]) -> str:
    return "Pipeline context:\n" + json.dumps(context, sort_keys=True, default=str)


class OpenAIProvider:
    name = "openai"

    def __init__(self, api_key: str) -> None:
        module = importlib.import_module("openai")
        self.client: Any = module.AsyncOpenAI(api_key=api_key)

    async def generate(
        self,
        *,
        stage: str,
        model: str,
        output_model: type[BaseModel],
        context: dict[str, Any],
    ) -> ProviderResult:
        try:
            response = await self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": _system_prompt(stage, output_model)},
                    {"role": "user", "content": _user_prompt(context)},
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
            )
            content = response.choices[0].message.content
            if not content:
                raise ProviderError("OpenAI returned an empty response")
            output = output_model.model_validate_json(content)
            tokens = response.usage.total_tokens if response.usage is not None else 0
            return ProviderResult(output, self.name, model, tokens)
        except ProviderError:
            raise
        except Exception as exc:
            raise ProviderError(f"OpenAI generation failed: {type(exc).__name__}") from exc


class AnthropicProvider:
    name = "anthropic"

    def __init__(self, api_key: str) -> None:
        module = importlib.import_module("anthropic")
        self.client: Any = module.AsyncAnthropic(api_key=api_key)

    async def generate(
        self,
        *,
        stage: str,
        model: str,
        output_model: type[BaseModel],
        context: dict[str, Any],
    ) -> ProviderResult:
        try:
            response = await self.client.messages.create(
                model=model,
                max_tokens=4096,
                temperature=0.2,
                system=_system_prompt(stage, output_model),
                messages=[{"role": "user", "content": _user_prompt(context)}],
            )
            text = "".join(block.text for block in response.content if block.type == "text")
            if not text:
                raise ProviderError("Anthropic returned an empty response")
            output = output_model.model_validate_json(text)
            tokens = response.usage.input_tokens + response.usage.output_tokens
            return ProviderResult(output, self.name, model, tokens)
        except ProviderError:
            raise
        except Exception as exc:
            raise ProviderError(f"Anthropic generation failed: {type(exc).__name__}") from exc


class GeminiProvider:
    name = "gemini"

    def __init__(self, api_key: str) -> None:
        module = importlib.import_module("google.genai")
        self.client: Any = module.Client(api_key=api_key)

    async def generate(
        self,
        *,
        stage: str,
        model: str,
        output_model: type[BaseModel],
        context: dict[str, Any],
    ) -> ProviderResult:
        try:
            response = await self.client.aio.models.generate_content(
                model=model,
                contents=f"{_system_prompt(stage, output_model)}\n\n{_user_prompt(context)}",
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": output_model.model_json_schema(),
                    "temperature": 0.2,
                },
            )
            if not response.text:
                raise ProviderError("Gemini returned an empty response")
            output = output_model.model_validate_json(response.text)
            metadata = response.usage_metadata
            tokens = int(metadata.total_token_count or 0) if metadata is not None else 0
            return ProviderResult(output, self.name, model, tokens)
        except ProviderError:
            raise
        except Exception as exc:
            raise ProviderError(f"Gemini generation failed: {type(exc).__name__}") from exc


def _build_provider(name: str, api_key: str) -> AIProvider | None:
    if not api_key:
        return None
    provider_types = {
        "anthropic": AnthropicProvider,
        "openai": OpenAIProvider,
        "gemini": GeminiProvider,
    }
    try:
        return cast(AIProvider, provider_types[name](api_key))
    except (ImportError, ModuleNotFoundError):
        return None


def select_provider(settings: Settings | None = None) -> AIProvider | None:
    """Choose a usable configured provider deterministically; otherwise use demo mode."""
    configured = settings or get_settings()
    if configured.ai_provider == "demo":
        return None

    keys = {
        "anthropic": configured.anthropic_api_key,
        "openai": configured.openai_api_key,
        "gemini": configured.google_gemini_api_key,
    }
    order = (
        (configured.ai_provider,)
        if configured.ai_provider != "auto"
        else ("anthropic", "openai", "gemini")
    )
    for name in order:
        provider = _build_provider(name, keys[name])
        if provider is not None:
            return provider
    return None


def model_for_provider(provider: AIProvider, configured_model: str) -> str:
    """Avoid sending a provider-specific seeded model name to another provider."""
    if provider.name == "openai" and not configured_model.startswith(("gpt", "o1", "o3")):
        return "gpt-4o-mini"
    if provider.name == "anthropic" and not configured_model.startswith("claude"):
        return "claude-3-5-sonnet-latest"
    if provider.name == "gemini" and not configured_model.startswith("gemini"):
        return "gemini-2.0-flash"
    return configured_model
