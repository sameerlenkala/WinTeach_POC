"""Repair LaTeX damaged on its way into the DB.

Two corruption modes observed in generated content:

1. JSON escape-eating: the model sometimes single-escapes a LaTeX command
   inside a JSON string, and the valid JSON escapes \\f \\b \\t \\n \\r parse
   into control characters — "\\forall" arrives as "\\x0Corall". Form feed and
   backspace are never legitimate content, so they are restored
   unconditionally; tab/newline/CR are legitimate breaks, so they are only
   restored when (a) the string contains a "$" (i.e. it carries math) and
   (b) the following letters complete a known LaTeX command.

2. Unbalanced "$" delimiters: the model occasionally closes a formula with a
   backtick ("$\\forall x$" written as "$\\forall x`"). The stray "$" then
   pairs with the next formula's opener and the prose in between renders in
   math mode (spaces collapse). When a string has an odd "$" count, the
   backtick terminating a latex-looking "$…" run is rewritten to "$".

Applied at the artifact write path (see generation_service) and by the
one-off DB repair script (scripts/repair_latex.py).
"""
from __future__ import annotations

import re
from typing import Any

# FF ("\f…") and BS ("\b…") never appear legitimately — restore the eaten
# backslash wherever they occur: "\x0Corall" -> "\forall", "\x08eta" -> "\beta".
_FF_BS = str.maketrans({"\f": "\\f", "\b": "\\b"})

# TAB/LF/CR are real whitespace in prose, so restoration requires the trailing
# letters to complete a known command (suffix list = command minus its eaten
# first letter), with no further letter after the match.
_TAB_RE = re.compile(
    r"\t(?=(?:imes|ext|heta|au|riangle|ilde|herefore|frac|op|an|o)(?![A-Za-z]))")
_LF_RE = re.compile(
    r"\n(?=(?:eg|eq|abla|otin|exists|ot)(?![A-Za-z]))")
_CR_RE = re.compile(
    r"\r(?=(?:ightarrow|ight|angle|ceil|floor|ho)(?![A-Za-z]))")

# Any other control character sitting where a backslash should be, directly
# before a complete LaTeX command word (seen in DB: "\x11land" for "\land").
# Control chars are never legitimate content, so this replacement is safe.
_CTRL_CMD_WORDS = (
    "land|lor|lnot|neg|forall|exists|nexists|rightarrow|leftrightarrow|leftarrow|"
    "implies|iff|equiv|models|vdash|times|cdot|div|pm|leq|geq|neq|approx|subseteq|"
    "subset|supseteq|cup|cap|setminus|emptyset|infty|in|notin|mid|sum|prod|int|"
    "sqrt|frac|text|log|ln|exp|sin|cos|tan|min|max|alpha|beta|gamma|delta|epsilon|"
    "lambda|mu|nu|pi|rho|sigma|tau|phi|psi|omega|theta|nabla|partial|wedge|vee"
)
_CTRL_CMD_RE = re.compile(
    r"[\x00-\x08\x0b\x0e-\x1f](?=(?:" + _CTRL_CMD_WORDS + r")(?![A-Za-z]))")

# A "$…" run that contains a backslash (latex-looking) but is terminated by a
# backtick instead of a closing "$".
_MATH_BACKTICK_RE = re.compile(r"(\$[^$\n`]*\\[^$\n`]*)`")


def sanitize_str(s: str) -> str:
    s = s.translate(_FF_BS)
    s = _CTRL_CMD_RE.sub("\\\\", s)
    if "$" in s:
        s = _TAB_RE.sub("\\\\t", s)
        s = _LF_RE.sub("\\\\n", s)
        s = _CR_RE.sub("\\\\r", s)
    # Repair backtick-closed math ("$\\forall x`" -> "$\\forall x$"). The
    # pattern requires a "$"-opened run with a backslash command inside,
    # terminated by a backtick before any closing "$" — a shape balanced
    # "$…$" math and plain `code` never take, so it is applied unconditionally
    # rather than gated on "$"-parity (two such formulas make the count even).
    while True:
        fixed = _MATH_BACKTICK_RE.sub(r"\1$", s, count=1)
        if fixed == s:
            break
        s = fixed
    return s


def sanitize_content(obj: Any) -> tuple[Any, int]:
    """Deep-copy `obj` with every string sanitized; returns (copy, n_changed)."""
    changed = 0

    def walk(o: Any) -> Any:
        nonlocal changed
        if isinstance(o, dict):
            return {k: walk(v) for k, v in o.items()}
        if isinstance(o, list):
            return [walk(v) for v in o]
        if isinstance(o, str):
            fixed = sanitize_str(o)
            if fixed != o:
                changed += 1
            return fixed
        return o

    return walk(obj), changed
