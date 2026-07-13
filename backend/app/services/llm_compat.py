"""
Chat-completions compatibility shim across OpenAI model generations.

GPT-5-series models renamed `max_tokens` → `max_completion_tokens`, and some
tiers reject non-default `temperature`. Rather than hardcoding per-model
capability tables that rot as models ship, the shim sends the requested params
and reacts to the API's "unsupported parameter/value" 400s: the offending
param is dropped (or renamed, for max_tokens), the drop is LOGGED — a silent
temperature drop changes critic determinism and notes variety, so it must be
visible — and remembered per model so later calls don't pay the 400 again.

Every LLM chat call in the backend goes through create_chat_completion, so a
model swap is an env-var change, never a code change.
"""

from __future__ import annotations

import logging
import re
import threading
from typing import Any

logger = logging.getLogger(__name__)

# "Unsupported parameter: 'temperature' is not supported with this model."
# "Unsupported value: 'temperature' does not support 0.7 with this model."
_UNSUPPORTED = re.compile(r"[Uu]nsupported (?:parameter|value):?\s*'([a-zA-Z_]+)'")

# Params a model has rejected before → skipped up-front on later calls.
# ("max_tokens" in the set means "rename to max_completion_tokens".)
_known_drops: dict[str, set[str]] = {}
_lock = threading.Lock()


def uses_completion_tokens(model: str) -> bool:
    """Newer OpenAI families take max_completion_tokens instead of max_tokens."""
    return model.startswith(("gpt-5", "o1", "o3", "o4"))


def _apply_known_drops(model: str, kwargs: dict) -> None:
    for param in _known_drops.get(model, ()):
        if param == "max_tokens" and "max_tokens" in kwargs:
            kwargs["max_completion_tokens"] = kwargs.pop("max_tokens")
        else:
            kwargs.pop(param, None)
            if isinstance(kwargs.get("extra_body"), dict):
                kwargs["extra_body"].pop(param, None)


def _remember_drop(model: str, param: str) -> None:
    with _lock:
        _known_drops.setdefault(model, set()).add(param)


def create_chat_completion(client: Any, *, model: str, messages: list[dict],
                           temperature: float | None = None,
                           max_tokens: int | None = None,
                           response_format: dict | None = None,
                           reasoning_effort: str | None = None,
                           **extra: Any):
    """client.chat.completions.create with cross-generation param handling.
    Raises whatever the SDK raises for anything other than an unsupported-param
    400 (auth, rate limits, model-not-found all propagate to the caller's own
    retry logic).

    reasoning_effort is the per-node behaviour control on reasoning-tier models
    (which reject temperature): critics/repairs run at "low", content nodes at
    the model default. Sent only to gpt-5/o-family models; anything that still
    rejects it is dropped reactively and remembered."""
    kwargs: dict[str, Any] = {"model": model, "messages": messages, **extra}
    if response_format is not None:
        kwargs["response_format"] = response_format
    if temperature is not None:
        kwargs["temperature"] = temperature
    if reasoning_effort is not None and uses_completion_tokens(model):
        # Via extra_body: older SDKs (e.g. 1.51) don't have the typed kwarg,
        # and extra_body serializes identically on newer ones.
        kwargs.setdefault("extra_body", {})["reasoning_effort"] = reasoning_effort
    if max_tokens is not None:
        key = "max_completion_tokens" if uses_completion_tokens(model) else "max_tokens"
        kwargs[key] = max_tokens
    _apply_known_drops(model, kwargs)

    # At most one retry per droppable param, then the error propagates.
    for _ in range(4):
        try:
            return client.chat.completions.create(**kwargs)
        except Exception as e:
            if type(e).__name__ != "BadRequestError":
                raise
            m = _UNSUPPORTED.search(str(e))
            param = m.group(1) if m else None
            if param == "max_tokens" and "max_tokens" in kwargs:
                kwargs["max_completion_tokens"] = kwargs.pop("max_tokens")
                _remember_drop(model, "max_tokens")
                logger.warning("llm_compat: %s rejected max_tokens — renamed to "
                               "max_completion_tokens", model)
                continue
            in_extra = isinstance(kwargs.get("extra_body"), dict) and param in kwargs["extra_body"]
            if param and (param in kwargs or in_extra) and param not in ("model", "messages"):
                value = kwargs["extra_body"].pop(param) if in_extra else kwargs.pop(param)
                logger.warning("llm_compat: %s rejected %s=%r — dropped (behaviour "
                               "may differ from the tuned value)", model, param, value)
                _remember_drop(model, param)
                continue
            raise
    raise RuntimeError("llm_compat: retry loop exhausted")  # pragma: no cover
