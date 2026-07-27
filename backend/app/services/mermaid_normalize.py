"""Make model-authored Mermaid source parseable before it is stored.

Mermaid's flowchart grammar rejects brackets and parentheses inside an unquoted
label: `F[grade(score)]`, `I[cal.month_name[3]]` and `A -->|calls f(y)| B` are
all hard parse errors, and models emit them constantly. The bracket counts stay
balanced, so a counting lint sees nothing wrong — the diagram simply fails to
render, and the reader falls back to showing raw source.

`normalize_mermaid` quotes those labels; `mermaid_lint` then reports honestly,
because anything it still rejects is something quoting could not repair (wrong
header, unmatched delimiters). This mirrors winnify/src/lib/mermaid.ts, which
does the same at render time for content generated before this landed — keep
the two in step.
"""

from __future__ import annotations

import re
from typing import Any

MERMAID_STARTS = ("graph", "flowchart", "sequenceDiagram", "stateDiagram",
                  "erDiagram", "classDiagram")

# Node shapes, longest opener first so `[[` is matched before `[`.
_SHAPES = (("[[", "]]"), ("[(", ")]"), ("([", "])"), ("((", "))"), ("{{", "}}"),
           ("[/", "/]"), ("[\\", "\\]"), ("[", "]"), ("(", ")"), ("{", "}"))

# Characters that make an unquoted label unparseable.
_NEEDS_QUOTING = re.compile(r"[\[\](){}]")

# What may legally follow a node: end of statement, an edge, a chain (`&`),
# a class assignment (`:::`), or a link/callback suffix.
_AFTER_NODE = re.compile(r"^\s*($|[;&|]|:::|-|=|~|<|\.)")

_ID_CHAR = re.compile(r"[\w-]")
# A bare "..." continuation line — models write it to elide repetitive steps,
# but no diagram grammar accepts it as a statement.
_ELLIPSIS_LINE = re.compile(r"^\s*(\.{2,}|…)\s*$")
# ER cardinality operators (`||--o{`, `}o--||`, `}|..|{` …) borrow `{`/`}`, so
# they have to come out before delimiters are counted for balance.
_ER_CARDINALITY = re.compile(r"[|}o][|{o]?(?:--|\.\.)[|{o][|{o]?")
_FLOWCHART = re.compile(r"^(graph|flowchart)\b")
# `subgraph id [Title]` is the one place a label may be separated from its id
# by a space, so the node scan below would miss it.
_SUBGRAPH = re.compile(r"^(\s*subgraph\s+[\w-]+\s*\[)(.*)(\]\s*)$")


def _quote(text: str) -> str:
    already = len(text) >= 2 and text.startswith('"') and text.endswith('"')
    if already or not _NEEDS_QUOTING.search(text):
        return text
    return '"' + text.replace('"', "#quot;") + '"'


def _find_close(line: str, start: int, close: str) -> int:
    """Index of the closer that ends this label, preferring one followed by
    valid syntax so `A[foo(1)] --> B` splits correctly while `A[x[3]]` does
    not. Returns -1 when the label is never closed."""
    last = -1
    for i in range(start, len(line) - len(close) + 1):
        if not line.startswith(close, i):
            continue
        last = i
        if _AFTER_NODE.match(line[i + len(close):]):
            return i
    return last


def _normalize_line(line: str) -> str:
    sub = _SUBGRAPH.match(line)
    if sub:
        return sub.group(1) + _quote(sub.group(2)) + sub.group(3)

    out: list[str] = []
    i = 0
    while i < len(line):
        # Edge label: `-->|text|`.
        if line[i] == "|":
            end = line.find("|", i + 1)
            if end == -1:
                out.append(line[i])
                i += 1
                continue
            out.append("|" + _quote(line[i + 1:end]) + "|")
            i = end + 1
            continue
        # A label opener only counts when it directly follows a node id.
        if not _ID_CHAR.match(line[i]):
            out.append(line[i])
            i += 1
            continue
        j = i
        while j < len(line) and _ID_CHAR.match(line[j]):
            j += 1
        node_id = line[i:j]
        shape = next((s for s in _SHAPES if line.startswith(s[0], j)), None)
        if shape is None:
            out.append(node_id)
            i = j
            continue
        open_, close = shape
        end = _find_close(line, j + len(open_), close)
        if end == -1:
            out.append(node_id)
            i = j
            continue
        out.append(node_id + open_ + _quote(line[j + len(open_):end]) + close)
        i = end + len(close)
    return "".join(out)


def normalize_mermaid(code: str) -> str:
    """Quote flowchart node labels (`A[…]`), edge labels (`-->|…|`) and
    subgraph titles that contain brackets or parentheses, and drop bare "..."
    continuation lines. Label quoting only touches flowchart/graph source —
    sequence, class and ER diagrams have their own grammar where these
    characters are legal — and already-quoted labels are left alone."""
    src = (code or "").strip()
    lines = [ln for ln in src.split("\n") if not _ELLIPSIS_LINE.match(ln)]
    if not _FLOWCHART.match(src):
        return "\n".join(lines)
    return "\n".join(_normalize_line(line) for line in lines)


def mermaid_lint(code: str) -> bool:
    """Cheap structural check — a full compile needs a JS runtime, but the
    failure modes we see are empty code, wrong header, unbalanced delimiters,
    and labels whose brackets were never quoted."""
    c = (code or "").strip()
    if not c.startswith(MERMAID_STARTS):
        return False
    counted = _ER_CARDINALITY.sub("", c) if c.startswith("erDiagram") else c
    if not all(counted.count(a) == counted.count(b)
               for a, b in (("[", "]"), ("(", ")"), ("{", "}"))):
        return False
    # Anything normalization would still rewrite is source we know the parser
    # rejects; content is normalized on the way in, so this stays quiet.
    return normalize_mermaid(c) == c


def normalize_mermaid_content(obj: Any) -> tuple[Any, int]:
    """Deep-copy `obj` with every `mermaid_code` string normalized; returns
    (copy, n_changed)."""
    changed = 0

    def walk(o: Any, key: str | None = None) -> Any:
        nonlocal changed
        if isinstance(o, dict):
            return {k: walk(v, k) for k, v in o.items()}
        if isinstance(o, list):
            return [walk(v, key) for v in o]
        if isinstance(o, str) and key == "mermaid_code":
            fixed = normalize_mermaid(o)
            if fixed != o:
                changed += 1
            return fixed
        return o

    return walk(obj), changed
