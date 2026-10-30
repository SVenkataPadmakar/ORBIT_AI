"""
ORBIT LLM Client & Structured Output Wrapper.
Provides robust structured JSON generation across LLM providers:
- Google GenAI (Gemini) with native response_schema and JSON mode.
- Anthropic Claude with tool-calling schema enforcement and JSON extraction.
"""
from __future__ import annotations

import json
import logging
import os
import re
from typing import Any, TypeVar

from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

from app.core.config import get_settings

logger = logging.getLogger("orbit.core.llm")

T = TypeVar("T", bound=BaseModel)

UNAVAILABLE_MODELS: set[str] = set()


# ─── GEMINI CLIENT & STRUCTURED GENERATION ────────────────────────────────────

def get_gemini_client(api_key: str | None = None) -> Any:
    """Returns an initialized Google GenAI client configured with GEMINI_API_KEY from the environment."""
    load_dotenv()
    from google import genai

    settings = get_settings()
    key = (
        api_key
        or os.getenv("GEMINI_API_KEY_2", "")
        or os.getenv("GEMINI_API_KEY", "")
        or getattr(settings, "gemini_api_key_2", "")
        or getattr(settings, "gemini_api_key", "")
        or os.getenv("GOOGLE_GEMINI_API_KEY", "")
        or os.getenv("GOOGLE_API_KEY", "")
    ).strip()
    if not key:
        raise ValueError("GEMINI_API_KEY is required to initialize Gemini client.")
    os.environ["GEMINI_API_KEY"] = key
    return genai.Client(api_key=key)


def generate_structured_gemini(
    prompt: str,
    output_schema: type[BaseModel] | dict[str, Any],
    *,
    model: str = "gemini-2.0-flash",
    system_prompt: str = "You are an expert AI evaluator. Always produce structured outputs adhering strictly to the schema.",
    temperature: float = 0.2,
    api_key: str | None = None,
) -> dict[str, Any]:
    """
    Calls Google GenAI with strict structured JSON output using response_schema.
    Supports multi-key failover and resilient fallback models.
    """
    from google import genai
    from google.genai import types

    settings = get_settings()

    # Collect available candidate keys (primary explicit / agent key, 2nd key, default key)
    candidate_keys: list[str] = []
    if api_key and api_key.strip():
        candidate_keys.append(api_key.strip())
    for candidate_key in [
        os.getenv("GEMINI_API_KEY_2", ""),
        getattr(settings, "gemini_api_key_2", ""),
        os.getenv("GEMINI_API_KEY", ""),
        getattr(settings, "gemini_api_key", ""),
        os.getenv("GOOGLE_GEMINI_API_KEY", ""),
        os.getenv("GOOGLE_API_KEY", ""),
    ]:
        k = candidate_key.strip()
        if k and k not in candidate_keys:
            candidate_keys.append(k)

    if not candidate_keys:
        raise ValueError("GEMINI_API_KEY is required to execute Gemini structured generation.")

    # Candidate models in order: requested model -> resilient fast fallback list
    candidate_models: list[str] = [model]
    for fallback in [
        "gemini-2.0-flash",
        "gemini-3.5-flash-lite",
        "gemini-3-flash-preview",
        "gemini-3.8-flash",
        "gemini-3.5-flash",
        "gemini-flash-latest",
    ]:
        if fallback not in candidate_models:
            candidate_models.append(fallback)

    last_error: Exception | None = None
    for current_key in candidate_keys:
        client = genai.Client(api_key=current_key)
        for candidate in candidate_models:
            if candidate in UNAVAILABLE_MODELS:
                continue
            try:
                config = types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=output_schema,
                    system_instruction=system_prompt if system_prompt else None,
                    temperature=temperature,
                )
                response = client.models.generate_content(
                    model=candidate,
                    contents=prompt,
                    config=config,
                )
                raw_text = (response.text or "").strip()
                if not raw_text:
                    raise RuntimeError(f"Gemini model {candidate} returned an empty response")

                # Clean markdown JSON block formatting if present
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                elif raw_text.startswith("```"):
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                raw_text = raw_text.strip()

                return json.loads(raw_text)  # type: ignore[no-any-return]
            except Exception as exc:
                err_msg = str(exc)
                if "404" in err_msg or "not_found" in err_msg.lower() or "no longer available" in err_msg.lower():
                    UNAVAILABLE_MODELS.add(candidate)
                if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
                    logger.warning("🛑 Gemini API rate limit reached on current key: %s; rotating key...", exc)
                    last_error = exc
                    break  # Break inner loop to try next candidate key
                last_error = exc
                logger.warning("Gemini model '%s' failed (%s); trying fallback...", candidate, exc)

    if last_error:
        raise last_error
    raise RuntimeError("All candidate Gemini models and API keys failed to return structured output")


def generate_text_gemini(
    prompt: str,
    *,
    model: str = "gemini-2.0-flash",
    system_prompt: str | None = None,
    temperature: float = 0.2,
    api_key: str | None = None,
) -> str:
    """
    Calls Google GenAI for text or markdown generation.
    Supports multi-key failover and resilient fallback models.
    """
    from google import genai
    from google.genai import types

    settings = get_settings()

    candidate_keys: list[str] = []
    if api_key and api_key.strip():
        candidate_keys.append(api_key.strip())
    for candidate_key in [
        os.getenv("GEMINI_API_KEY_2", ""),
        getattr(settings, "gemini_api_key_2", ""),
        os.getenv("GEMINI_API_KEY", ""),
        getattr(settings, "gemini_api_key", ""),
        os.getenv("GOOGLE_GEMINI_API_KEY", ""),
        os.getenv("GOOGLE_API_KEY", ""),
    ]:
        k = candidate_key.strip()
        if k and k not in candidate_keys:
            candidate_keys.append(k)

    if not candidate_keys:
        raise ValueError("GEMINI_API_KEY is required to execute Gemini text generation.")

    candidate_models: list[str] = [model]
    for fallback in [
        "gemini-2.0-flash",
        "gemini-3.5-flash-lite",
        "gemini-3-flash-preview",
        "gemini-3.8-flash",
        "gemini-3.5-flash",
        "gemini-flash-latest",
    ]:
        if fallback not in candidate_models:
            candidate_models.append(fallback)

    last_error: Exception | None = None
    for current_key in candidate_keys:
        client = genai.Client(api_key=current_key)
        for candidate in candidate_models:
            if candidate in UNAVAILABLE_MODELS:
                continue
            try:
                config = types.GenerateContentConfig(
                    system_instruction=system_prompt if system_prompt else None,
                    temperature=temperature,
                )
                response = client.models.generate_content(
                    model=candidate,
                    contents=prompt,
                    config=config,
                )
                raw_text = (response.text or "").strip()
                if raw_text:
                    return raw_text
            except Exception as exc:
                err_msg = str(exc)
                if "404" in err_msg or "not_found" in err_msg.lower() or "no longer available" in err_msg.lower():
                    UNAVAILABLE_MODELS.add(candidate)
                if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
                    logger.warning("🛑 Gemini API rate limit reached on current key: %s; rotating key...", exc)
                    last_error = exc
                    break
                last_error = exc
                logger.warning("Gemini model '%s' failed (%s); trying fallback...", candidate, exc)

    if last_error:
        raise last_error
    raise RuntimeError("All candidate Gemini models and API keys failed to return text output")


# ─── ANTHROPIC CLIENT & STRUCTURED GENERATION ─────────────────────────────────

def get_anthropic_client(api_key: str | None = None) -> Any:
    """Returns an initialized synchronous Anthropic client."""
    import anthropic
    import httpx

    settings = get_settings()
    key = (
        api_key
        or getattr(settings, "anthropic_api_key", "")
        or os.getenv("ANTHROPIC_API_KEY", "")
    ).strip()
    if not key:
        raise ValueError("ANTHROPIC_API_KEY is required to initialize Anthropic client.")
    return anthropic.Anthropic(api_key=key, http_client=httpx.Client())


def generate_structured_anthropic(
    prompt: str,
    output_schema: dict[str, Any] | type[BaseModel],
    *,
    model: str = "claude-3-5-sonnet-20241022",
    system_prompt: str = "You are an expert AI evaluator. Always produce structured outputs adhering strictly to the schema.",
    max_tokens: int = 4096,
    temperature: float = 0.2,
    api_key: str | None = None,
) -> dict[str, Any]:
    """
    Calls Anthropic Claude with strict structured JSON output using tool calling.
    """
    tool_name = "record_structured_output"

    if isinstance(output_schema, type) and issubclass(output_schema, BaseModel):
        schema_dict = output_schema.model_json_schema()
    else:
        schema_dict = output_schema

    tools = [
        {
            "name": tool_name,
            "description": "Submit the completed structured evaluation matching the required schema.",
            "input_schema": schema_dict,
        }
    ]

    client = get_anthropic_client(api_key)

    try:
        response = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=[{"role": "user", "content": prompt}],
            tools=tools,
            tool_choice={"type": "tool", "name": tool_name},
        )

        for block in response.content:
            if block.type == "tool_use" and block.name == tool_name:
                return block.input  # type: ignore[no-any-return]

        for block in response.content:
            if getattr(block, "type", None) == "text" and block.text:
                json_match = re.search(r"\{.*\}", block.text, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(0))

        raise RuntimeError("Claude did not return a tool_use block or valid JSON payload")

    except Exception as exc:
        logger.error("Anthropic structured generation failed: %s", exc)
        raise exc


# ─── DEEPSEEK CLIENT & CODE GENERATION ────────────────────────────────────────

def get_deepseek_client(api_key: str | None = None, base_url: str | None = None) -> Any:
    """
    Returns an initialized OpenAI client configured for the DeepSeek API.
    DeepSeek API is OpenAI-compatible with base_url="https://api.deepseek.com/v1".
    """
    load_dotenv()
    from openai import OpenAI

    settings = get_settings()
    key = (
        api_key
        or os.getenv("DEEPSEEK_API_KEY", "")
        or getattr(settings, "deepseek_api_key", "")
    ).strip()
    if not key:
        raise ValueError("DEEPSEEK_API_KEY is required to initialize DeepSeek client.")

    resolved_base_url = (
        base_url
        or os.getenv("DEEPSEEK_BASE_URL", "")
        or getattr(settings, "deepseek_base_url", "")
        or "https://api.deepseek.com/v1"
    ).strip()

    return OpenAI(api_key=key, base_url=resolved_base_url)


def generate_deepseek_code(
    prompt: str,
    *,
    model: str = "deepseek-coder",
    system_prompt: str = "You are an expert full-stack engineer and coding agent. Generate clean, robust, production-ready code.",
    temperature: float = 0.2,
    max_tokens: int = 4096,
    api_key: str | None = None,
    base_url: str | None = None,
    fallback_to_gemini: bool = True,
) -> str:
    """
    Calls the DeepSeek API using the OpenAI-compatible client (default model: deepseek-coder)
    for code generation, repair patches, and scaffolding.
    Provides graceful fallback to Gemini if account has insufficient balance or hits limits.
    """
    client = get_deepseek_client(api_key=api_key, base_url=base_url)

    messages: list[dict[str, str]] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        raw_text = (response.choices[0].message.content or "").strip()
        if raw_text:
            return raw_text
        raise RuntimeError("DeepSeek returned an empty response")
    except Exception as exc:
        err_msg = str(exc).lower()
        logger.warning("DeepSeek code generation failed on %s: %s", model, exc)
        if fallback_to_gemini and ("insufficient balance" in err_msg or "402" in err_msg or "rate limit" in err_msg or "429" in err_msg):
            logger.warning("Falling back to Gemini text generation due to DeepSeek API error: %s", exc)
            return generate_text_gemini(
                prompt=prompt,
                model="gemini-2.0-flash",
                system_prompt=system_prompt,
                temperature=temperature,
            )
        raise exc


def generate_structured_deepseek(
    prompt: str,
    output_schema: type[BaseModel] | dict[str, Any],
    *,
    model: str = "deepseek-coder",
    system_prompt: str = "You are an expert software engineer. Always return valid JSON conforming to the schema.",
    temperature: float = 0.2,
    api_key: str | None = None,
    base_url: str | None = None,
    fallback_to_gemini: bool = True,
) -> dict[str, Any]:
    """
    Calls DeepSeek with structured JSON output response format.
    Falls back gracefully to Gemini structured generation if DeepSeek returns an error.
    """
    if isinstance(output_schema, type) and issubclass(output_schema, BaseModel):
        schema_dict = output_schema.model_json_schema()
    else:
        schema_dict = output_schema

    enhanced_prompt = (
        f"{prompt}\n\nStrict Output Requirements:\n"
        f"Return ONLY valid JSON strictly matching this schema:\n"
        f"{json.dumps(schema_dict, indent=2)}\n"
        f"Do not include explanation or Markdown formatting outside of the JSON."
    )

    client = get_deepseek_client(api_key=api_key, base_url=base_url)

    messages: list[dict[str, str]] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": enhanced_prompt})

    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            response_format={"type": "json_object"},
        )
        raw_text = (response.choices[0].message.content or "").strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        return json.loads(raw_text.strip())  # type: ignore[no-any-return]
    except Exception as exc:
        err_msg = str(exc).lower()
        logger.warning("DeepSeek structured generation failed on %s: %s", model, exc)
        if fallback_to_gemini and ("insufficient balance" in err_msg or "402" in err_msg or "rate limit" in err_msg or "429" in err_msg):
            logger.warning("Falling back to Gemini structured generation due to DeepSeek API error: %s", exc)
            return generate_structured_gemini(
                prompt=prompt,
                output_schema=output_schema,
                model="gemini-2.0-flash",
                system_prompt=system_prompt,
                temperature=temperature,
            )
        raise exc

