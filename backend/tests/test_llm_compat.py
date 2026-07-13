"""Cross-generation chat-completions shim (llm_compat). Offline — fake client."""

import pytest

from app.services import llm_compat


class BadRequestError(Exception):
    """Name-matched by the shim (real class lives in the openai package)."""


class FakeCompletions:
    def __init__(self, rejects: dict[str, str]):
        # param name -> error message template raised while the param is present
        self.rejects = rejects
        self.calls: list[dict] = []

    def create(self, **kwargs):
        self.calls.append(dict(kwargs))
        extra = kwargs.get("extra_body") or {}
        for param, msg in self.rejects.items():
            if param in kwargs or param in extra:
                raise BadRequestError(msg)
        return {"ok": True, "sent": kwargs}


class FakeClient:
    def __init__(self, rejects=None):
        self.chat = type("Chat", (), {})()
        self.chat.completions = FakeCompletions(rejects or {})


@pytest.fixture(autouse=True)
def clear_known_drops():
    llm_compat._known_drops.clear()
    yield
    llm_compat._known_drops.clear()


MSGS = [{"role": "user", "content": "hi"}]


def test_gpt4o_uses_max_tokens():
    client = FakeClient()
    llm_compat.create_chat_completion(client, model="gpt-4o", messages=MSGS,
                                      temperature=0.4, max_tokens=100)
    sent = client.chat.completions.calls[0]
    assert sent["max_tokens"] == 100 and "max_completion_tokens" not in sent


def test_gpt5_uses_max_completion_tokens_upfront():
    client = FakeClient()
    llm_compat.create_chat_completion(client, model="gpt-5.6-terra", messages=MSGS,
                                      temperature=0.4, max_tokens=100)
    sent = client.chat.completions.calls[0]
    assert sent["max_completion_tokens"] == 100 and "max_tokens" not in sent


def test_rejected_max_tokens_renamed_and_remembered():
    client = FakeClient(rejects={"max_tokens":
        "Unsupported parameter: 'max_tokens' is not supported with this model. "
        "Use 'max_completion_tokens' instead."})
    r = llm_compat.create_chat_completion(client, model="future-model", messages=MSGS,
                                          max_tokens=50)
    assert r["sent"]["max_completion_tokens"] == 50
    assert len(client.chat.completions.calls) == 2
    # Second call skips the 400 entirely.
    llm_compat.create_chat_completion(client, model="future-model", messages=MSGS,
                                      max_tokens=60)
    assert client.chat.completions.calls[-1]["max_completion_tokens"] == 60
    assert len(client.chat.completions.calls) == 3


def test_rejected_temperature_dropped_and_remembered():
    client = FakeClient(rejects={"temperature":
        "Unsupported value: 'temperature' does not support 0.2 with this model."})
    r = llm_compat.create_chat_completion(client, model="gpt-5.6-sol", messages=MSGS,
                                          temperature=0.2, max_tokens=10)
    assert "temperature" not in r["sent"]
    llm_compat.create_chat_completion(client, model="gpt-5.6-sol", messages=MSGS,
                                      temperature=0.9, max_tokens=10)
    assert "temperature" not in client.chat.completions.calls[-1]
    assert len(client.chat.completions.calls) == 3  # 400 paid exactly once


def test_reasoning_effort_sent_only_to_reasoning_families():
    client = FakeClient()
    llm_compat.create_chat_completion(client, model="gpt-5.6-terra", messages=MSGS,
                                      reasoning_effort="low")
    # Transported via extra_body so old SDKs without the typed kwarg still work.
    assert client.chat.completions.calls[0]["extra_body"]["reasoning_effort"] == "low"
    # gpt-4o never sees the param — no guaranteed 400 on the fallback model.
    llm_compat.create_chat_completion(client, model="gpt-4o", messages=MSGS,
                                      reasoning_effort="low")
    assert "extra_body" not in client.chat.completions.calls[1]


def test_rejected_reasoning_effort_dropped_and_remembered():
    client = FakeClient(rejects={"reasoning_effort":
        "Unsupported parameter: 'reasoning_effort' is not supported with this model."})
    r = llm_compat.create_chat_completion(client, model="gpt-5.4-nano", messages=MSGS,
                                          reasoning_effort="low")
    assert "reasoning_effort" not in (r["sent"].get("extra_body") or {})
    llm_compat.create_chat_completion(client, model="gpt-5.4-nano", messages=MSGS,
                                      reasoning_effort="low")
    assert len(client.chat.completions.calls) == 3  # 400 paid exactly once


def test_non_param_errors_propagate():
    class RateLimitError(Exception):
        pass

    class Raising:
        def create(self, **kwargs):
            raise RateLimitError("slow down")

    client = FakeClient()
    client.chat.completions = Raising()
    with pytest.raises(RateLimitError):
        llm_compat.create_chat_completion(client, model="gpt-4o", messages=MSGS)


def test_unparseable_bad_request_propagates():
    client = FakeClient(rejects={"messages": "something else entirely"})
    with pytest.raises(BadRequestError):
        llm_compat.create_chat_completion(client, model="gpt-4o", messages=MSGS)
