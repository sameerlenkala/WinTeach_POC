"""
Syllabus structure extraction v2 — atomize, then cluster.

The v1 approach asked the model to regenerate the syllabus as a tree, which
allowed three failure classes by construction: duplicated phrases (a trailing
"list: item" line — "…alpha, beta, GAMMA: delta" — emitted GAMMA both as a
subtopic and as its own topic), dropped phrases, and paraphrased phrases.
v2 makes all three structurally impossible:

  1. ATOMIZE (deterministic code): normalize OCR artifacts, detect unit
     blocks, strip page junk, rejoin wrapped lines, then shatter each unit
     body into delimiter-free atomic phrases. Each atom gets a positional id
     and a hint recording what delimiter followed it in the source.
  2. CLUSTER (one small LLM call per unit, in parallel): the model assigns
     every atom id to exactly one place — a topic title or a subtopic. It
     selects and may CONCATENATE atoms (to rejoin fragments of a heading the
     OCR wrapped across lines), but it never writes content strings. Topic
     titles may be synthesized only when no atom works as an umbrella term,
     and are flagged as such.
  3. VALIDATE + REPAIR (deterministic): the partition invariant (every atom
     used exactly once) is checked mechanically; one repair call fixes
     violations, and a deterministic fallback guarantees a valid tree even if
     the model fails completely.

Atoms are identified by POSITION, not text — "Introduction" may legitimately
appear under two topics of the same unit (os_syllabus Unit IV does exactly
this), so no text-level dedup is ever applied.

Output shape matches what every downstream consumer already reads:
  {"value": [{"unit_id", "title", "contact_hours", "topics":
              [{"title", "subtopics": [...]}]}], "confidence": ...}
"""

from __future__ import annotations

import json
import logging
import math
import re
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Callable

logger = logging.getLogger(__name__)

ChatFn = Callable[..., dict]

# Hard ceiling on topics per unit grows with content volume — a fixed cap
# would weld genuinely distinct teaching blocks together.
MAX_TOPICS_CEILING = 6

_DASH_PLACEHOLDER = "\x00"

_ROMAN = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6,
          "VII": 7, "VIII": 8, "IX": 9, "X": 10, "XI": 11, "XII": 12}
_TO_ROMAN = {v: k for k, v in _ROMAN.items()}

_UNIT_RE = re.compile(
    r"^[ \t]*(?:UNIT|MODULE|CHAPTER)[ \t]*(?:[–—:\-]|\x00)?[ \t]*(?P<num>[IVXivx]+|\d+)\b(?P<rest>[^\n]*)",
    re.MULTILINE | re.IGNORECASE,
)
_HOURS_RE = re.compile(r"\(\s*(\d+)\s*(?:Hours?|Hrs?)\s*\.?\s*\)", re.IGNORECASE)
_STOP_RE = re.compile(
    r"^[ \t]*(?:Text\s*Books?|Reference\s*Books?|References|Online\s+Learning|"
    r"Web\s+Resources?|e-?Resources?|Course\s+Outcomes?|Course\s+Objectives?|"
    r"Prescribed\s+Books?|Suggested\s+Read)",
    re.MULTILINE | re.IGNORECASE,
)
# Page junk: L/T/P/C credit tables, bare numbers, regulation banners, page markers.
_JUNK_LINE_RE = re.compile(
    r"^(?:[LTPC](?:[ \t]+[LTPC0-9]+)*|[\d\s.]+|Page\s+\d+|.*B\.?\s*Tech.*Regulations?.*)$",
    re.IGNORECASE,
)
_LIST_MARKER_RE = re.compile(r"^\(?\d{1,2}[.)]\s+")

# Delimiter that followed the atom → hint shown to the model.
_HINT = {":": "colon", _DASH_PLACEHOLDER: "dash", ";": "break",
         ".": "stop", ",": "item", "\n": "line"}
_HINT_MARK = {"colon": "[:]", "dash": "[–]", "break": "[;]",
              "stop": "[.]", "item": "[,]", "line": "[¶]"}


# ── Normalization ─────────────────────────────────────────────────────────────

def _normalize(text: str) -> str:
    text = text.replace("’", "'").replace("‘", "'")
    text = text.replace("“", '"').replace("”", '"')
    # Spaced dashes (hyphen/en/em) become an explicit delimiter placeholder;
    # intra-word hyphens ("Copy-on-write") are untouched, and so are zero-space
    # en dashes ("Bellman–Ford") — an en/em dash delimits when at least one
    # side has a space (covers common OCR drift).
    text = re.sub(r"\s+[–—-]\s+", _DASH_PLACEHOLDER, text)
    text = re.sub(r"\s+[–—]|[–—]\s+", _DASH_PLACEHOLDER, text)
    return text


def _roman_or_int(s: str) -> int:
    s = s.strip().upper()
    if s.isdigit():
        return int(s)
    return _ROMAN.get(s, 0)


# ── Unit block detection ──────────────────────────────────────────────────────

def find_unit_blocks(text: str) -> list[dict]:
    """Split the syllabus into unit blocks: number, declared name, hours, body."""
    matches = list(_UNIT_RE.finditer(text))
    blocks: list[dict] = []
    for i, m in enumerate(matches):
        number = _roman_or_int(m.group("num"))
        if number == 0:
            continue
        rest = m.group("rest") or ""
        hours = 0
        hm = _HOURS_RE.search(rest)
        if hm:
            hours = int(hm.group(1))
            rest = _HOURS_RE.sub(" ", rest)
        rest = rest.replace(_DASH_PLACEHOLDER, " ")
        declared = re.sub(r"^[\s:–—\-]+|[\s:–—\-]+$", "", rest).strip()
        if len(declared) < 3 or _JUNK_LINE_RE.match(declared):
            declared = ""
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end]
        stop = _STOP_RE.search(body)
        if stop:
            body = body[:stop.start()]
        blocks.append({"number": number, "declared_title": declared,
                       "hours": hours, "body": body})
    # A TOC that lists "UNIT I..V" with no content produces near-empty bodies;
    # keep the densest occurrence of each unit number.
    best: dict[int, dict] = {}
    for b in blocks:
        cur = best.get(b["number"])
        if cur is None or len(b["body"].strip()) > len(cur["body"].strip()):
            best[b["number"]] = b
    return [best[n] for n in sorted(best)]


# ── Line cleanup + wrap joining ───────────────────────────────────────────────

def _clean_lines(body: str) -> list[str]:
    lines = []
    for raw in body.split("\n"):
        s = re.sub(r"\s+", " ", raw).strip()
        if not s:
            lines.append("")          # blank = hard join boundary
            continue
        if _JUNK_LINE_RE.match(s.replace(_DASH_PLACEHOLDER, " ")):
            continue
        lines.append(s)
    return lines


def join_wrapped_lines(lines: list[str]) -> list[str]:
    """Rejoin OCR line wraps. Join line B into line A when B starts with ':'
    or lowercase, or when A ends dangling on a delimiter. A following line that
    starts uppercase stays separate — that is how a standalone heading line
    (dash_format Unit II) survives. The one unfixable case — a heading wrapped
    mid-phrase with an uppercase continuation line — is left split; the
    clustering model rejoins it via multi-atom titles."""
    out: list[str] = []
    prev_blank = True
    for s in lines:
        if not s:
            prev_blank = True
            continue
        join = False
        if out and not prev_blank:
            prev = out[-1]
            if s[0] == ":" or s[0].islower():
                join = True
            elif prev and (prev[-1] in ",:;" or prev.endswith(_DASH_PLACEHOLDER)):
                join = True
        if join:
            out[-1] = out[-1].rstrip() + " " + s
        else:
            out.append(s)
        prev_blank = False
    return out


# ── Atomization ───────────────────────────────────────────────────────────────

def atomize(body: str) -> tuple[list[dict], bool]:
    """Shatter a unit body into atoms: [{'id', 'text', 'hint'}, ...].
    Returns (atoms, list_mode) — list_mode when the body is a numbered list
    (lab/experiment syllabi). Splits only OUTSIDE parentheses/brackets, so
    '(FCFS, SJF, Round Robin)' stays attached to its item."""
    lines = join_wrapped_lines(_clean_lines(body))
    atoms: list[dict] = []
    numbered = 0
    for line in lines:
        stripped = _LIST_MARKER_RE.sub("", line)
        if stripped != line:
            numbered += 1
        line = stripped
        depth = 0
        buf: list[str] = []
        pieces: list[tuple[str, str]] = []  # (text, following delimiter)
        for ch in line:
            if ch in "([{":
                depth += 1
            elif ch in ")]}":
                depth = max(0, depth - 1)
            if depth == 0 and ch in ",;:." + _DASH_PLACEHOLDER:
                # keep decimal points ("3.5") intact
                if ch == "." and buf and buf[-1].isdigit():
                    buf.append(ch)
                    continue
                pieces.append(("".join(buf), ch))
                buf = []
            else:
                buf.append(ch)
        pieces.append(("".join(buf), "\n"))
        for text, delim in pieces:
            t = text.strip(" \t–—-")
            if len(t) < 2 or re.fullmatch(r"[\d\s./()-]+", t):
                continue
            atoms.append({"id": len(atoms), "text": t, "hint": _HINT[delim]})
    list_mode = numbered >= 3
    return atoms, list_mode


def topic_bound(n_atoms: int) -> int:
    return max(1, min(MAX_TOPICS_CEILING, math.ceil(n_atoms / 4)))


# ── Clustering call ───────────────────────────────────────────────────────────

_CLUSTER_SYSTEM = (
    "You group the atomic phrases of one syllabus unit into teaching topics. "
    "You NEVER write new content phrases — you only reference phrase ids. "
    "Output ONLY valid JSON."
)

_CLUSTER_TEMPLATE = """Below are the atomic content phrases of ONE syllabus unit, in source order.
Delimiters were already removed. The marker after each phrase shows what
followed it in the source: [:] colon  [–] dash  [;] semicolon  [.] period
[,] comma  [¶] end of line.

A TOPIC is a coherent block a lecturer teaches over consecutive sessions.
A SUBTOPIC is one item taught inside that block. Phrases followed by [:] or
[–], or alone on a line before an item list, are usually — not always — topic
headings.

━━━ RULES ━━━
1. Assign EVERY id to exactly one place: a topic's "title_ids" or one entry of
   its "sub_ids". Never reuse an id. Never skip one.
2. A title is normally ONE id. Use two ids in "title_ids" ONLY to rejoin a
   heading the source split across lines (e.g. "Digital" + "Electronics" →
   "Digital Electronics"). Likewise each sub_ids entry is a list so you can
   rejoin split fragments — normally one id each.
3. If no phrase is an umbrella term for a group, omit "title_ids" and write a
   short "title_text" (2-5 words) yourself instead. Do this only when needed.
4. Trailing phrases that continue an example list belong to that SAME topic:
   in "Sorting techniques [–] Quick sort [,] Merge sort [,] Heap sort [:]
   Divide and conquer approach [.]" — Heap sort is an example like Quick sort
   and Merge sort, and "Divide and conquer approach" continues the same topic.
   A [:] or [–] after a list item is delimiter noise, not a new heading.
5. Aim for {aim} topics; hard maximum {max_topics}. Do not fragment one
   teaching block into many topics, and do not weld unrelated blocks together.
6. Preserve source order — topics and their members follow the original
   sequence.
{list_rule}{title_rule}

Unit {unit_label} phrases:
{atom_lines}

Output ONLY this JSON:
{{"unit_title": "short unit name",
  "unit_title_source": "declared|phrase|synthesized",
  "topics": [
    {{"title_ids": [0], "sub_ids": [[1], [2], [3, 4]]}},
    {{"title_text": "synthesized name", "sub_ids": [[7], [8]]}}
  ]}}"""

_LIST_RULE = ("\n7. This unit is a numbered experiment/exercise list: each numbered "
              "item is a SUBTOPIC; group them into a few themed topics with "
              "synthesized titles.")


def _title_rule(declared: str, number: int) -> str:
    if declared:
        return (f'\nUNIT TITLE: the unit declares its own name — set "unit_title" '
                f'to exactly "{declared}" and "unit_title_source" to "declared".')
    return ('\nUNIT TITLE: no name was declared. Propose a short descriptive '
            '"unit_title" (3-6 words) summarizing the whole unit — never '
            f'"Unit {number}" or a bare numeral — and set "unit_title_source" '
            'to "synthesized" (or "phrase" if one phrase names the whole unit).')


def _render_atoms(atoms: list[dict]) -> str:
    return "\n".join(f"{a['id']:>3}| {a['text']}  {_HINT_MARK[a['hint']]}"
                     for a in atoms)


# ── Validation, repair, fallback ──────────────────────────────────────────────

def validate_clusters(out: dict, n_atoms: int, max_topics: int) -> list[str]:
    problems: list[str] = []
    topics = out.get("topics")
    if not isinstance(topics, list) or not topics:
        return ["no topics array"]
    if len(topics) > max_topics:
        problems.append(f"{len(topics)} topics exceeds the hard maximum of {max_topics}")
    seen: set[int] = set()

    def use(i: Any, where: str) -> None:
        if not isinstance(i, int) or i < 0 or i >= n_atoms:
            problems.append(f"unknown id {i!r} in {where}")
        elif i in seen:
            problems.append(f"id {i} used more than once")
        else:
            seen.add(i)

    for ti, t in enumerate(topics):
        if not isinstance(t, dict):
            problems.append(f"topic {ti} is not an object")
            continue
        title_ids = t.get("title_ids") or []
        if not title_ids and not str(t.get("title_text") or "").strip():
            problems.append(f"topic {ti} has neither title_ids nor title_text")
        for i in title_ids:
            use(i, f"topic {ti} title_ids")
        for group in t.get("sub_ids") or []:
            for i in (group if isinstance(group, list) else [group]):
                use(i, f"topic {ti} sub_ids")
    missing = sorted(set(range(n_atoms)) - seen)
    if missing:
        problems.append(f"ids never assigned: {missing}")
    return problems


def _force_valid(out: dict, atoms: list[dict]) -> dict:
    """Deterministically coerce a near-miss clustering into a valid partition:
    duplicate uses keep their first occurrence, unknown ids are dropped, and
    unassigned atoms attach to the nearest preceding topic in id order."""
    n = len(atoms)
    topics_in = out.get("topics") if isinstance(out.get("topics"), list) else []
    seen: set[int] = set()
    topics: list[dict] = []
    for t in topics_in:
        if not isinstance(t, dict):
            continue
        title_ids = [i for i in (t.get("title_ids") or [])
                     if isinstance(i, int) and 0 <= i < n and i not in seen]
        seen.update(title_ids)
        sub_ids: list[list[int]] = []
        for group in t.get("sub_ids") or []:
            g = [i for i in (group if isinstance(group, list) else [group])
                 if isinstance(i, int) and 0 <= i < n and i not in seen]
            seen.update(g)
            if g:
                sub_ids.append(g)
        title_text = str(t.get("title_text") or "").strip()
        if title_ids or sub_ids or title_text:
            topics.append({"title_ids": title_ids, "sub_ids": sub_ids,
                           "title_text": title_text})
    if not topics:
        topics = [{"title_ids": [], "sub_ids": [], "title_text": ""}]
    # Attach leftovers to the topic whose members immediately precede them.
    for i in sorted(set(range(n)) - seen):
        target = topics[0]
        for t in topics:
            members = list(t["title_ids"]) + [j for g in t["sub_ids"] for j in g]
            if members and min(members) <= i:
                target = t
        target["sub_ids"].append([i])
    return {"unit_title": out.get("unit_title"),
            "unit_title_source": out.get("unit_title_source"),
            "topics": topics}


def _fallback_clusters(atoms: list[dict]) -> dict:
    """Total-failure fallback: one topic holding everything, titled by the
    first heading-hinted atom when one exists."""
    title_idx = next((a["id"] for a in atoms if a["hint"] in ("colon", "dash")), None)
    subs = [[a["id"]] for a in atoms if a["id"] != title_idx]
    topic: dict = {"sub_ids": subs, "title_ids": [], "title_text": ""}
    if title_idx is not None:
        topic["title_ids"] = [title_idx]
    return {"unit_title": None, "unit_title_source": None, "topics": [topic]}


# ── Reconstruction ────────────────────────────────────────────────────────────

def _join_atoms(ids: list[int], atoms: list[dict]) -> str:
    return " ".join(atoms[i]["text"] for i in sorted(ids))


def reconstruct_unit(block: dict, clusters: dict, atoms: list[dict]) -> dict:
    """Rebuild the unit tree from a VALID (or force-validated) clustering by
    slicing atom text — the model never contributed content strings."""
    topics_out = []
    for t in clusters.get("topics", []):
        title_ids = t.get("title_ids") or []
        title_text = str(t.get("title_text") or "").strip()
        sub_groups = t.get("sub_ids") or []
        # A synthesized title that duplicates a member phrase collapses onto
        # it — the phrase is promoted to title so it never renders twice.
        if not title_ids and title_text:
            norm_title = re.sub(r"\W+", " ", title_text).strip().lower()
            for g in list(sub_groups):
                if re.sub(r"\W+", " ", _join_atoms(g, atoms)).strip().lower() == norm_title:
                    title_ids, title_text = g, ""
                    sub_groups = [x for x in sub_groups if x is not g]
                    break
        title = _join_atoms(title_ids, atoms) if title_ids else title_text
        members = list(title_ids) + [i for g in sub_groups for i in g]
        order_key = min(members) if members else 0
        sub_groups = sorted(sub_groups, key=lambda g: min(g) if g else 0)
        topics_out.append((order_key, {
            "title": title or "Topic",
            "title_synthesized": not title_ids,
            "subtopics": [_join_atoms(g, atoms) for g in sub_groups if g],
        }))
    topics_out.sort(key=lambda x: x[0])

    number = block["number"]
    roman = _TO_ROMAN.get(number, str(number))
    title = block["declared_title"]
    title_source = "declared" if title else None
    if not title:
        model_title = str(clusters.get("unit_title") or "").strip()
        if model_title and not re.fullmatch(r"(?i)unit\s*[ivx\d]+", model_title):
            title = model_title
            title_source = clusters.get("unit_title_source") or "synthesized"
        else:
            title = f"Unit {roman}"
            title_source = "fallback"
    return {
        "unit_id": f"UNIT-{roman}",
        "title": title,
        "title_source": title_source,
        "contact_hours": block["hours"],
        "topics": [t for _, t in topics_out],
    }


# ── Orchestration ─────────────────────────────────────────────────────────────

def _cluster_unit(chat_fn: ChatFn, client: Any, block: dict) -> tuple[dict, str]:
    """Atomize + cluster one unit. Returns (unit dict, mode) where mode is
    'ok' | 'repaired' | 'fallback' | 'empty'."""
    atoms, list_mode = atomize(block["body"])
    if not atoms:
        return reconstruct_unit(block, {"topics": []}, atoms), "empty"
    if len(atoms) == 1:
        clusters = {"topics": [{"title_ids": [0], "sub_ids": []}]}
        return reconstruct_unit(block, clusters, atoms), "ok"

    max_topics = topic_bound(len(atoms))
    aim = "2–4" if max_topics >= 4 else f"1–{max_topics}"
    roman = _TO_ROMAN.get(block["number"], str(block["number"]))
    prompt = _CLUSTER_TEMPLATE.format(
        aim=aim, max_topics=max_topics,
        list_rule=_LIST_RULE if list_mode else "",
        title_rule=_title_rule(block["declared_title"], block["number"]),
        unit_label=roman, atom_lines=_render_atoms(atoms),
    )
    mode = "fallback"
    clusters: dict | None = None
    try:
        out = chat_fn(client, prompt, _CLUSTER_SYSTEM)
        problems = validate_clusters(out, len(atoms), max_topics)
        if not problems:
            clusters, mode = out, "ok"
        else:
            logger.warning("structure v2 unit %s violations: %s", roman, problems)
            repair = (prompt + "\n\nYour previous grouping had these violations:\n- "
                      + "\n- ".join(problems)
                      + "\nRe-emit the COMPLETE corrected JSON.")
            out2 = chat_fn(client, repair, _CLUSTER_SYSTEM)
            if not validate_clusters(out2, len(atoms), max_topics):
                clusters, mode = out2, "repaired"
            else:
                clusters, mode = _force_valid(out2, atoms), "repaired"
    except Exception:
        logger.exception("structure v2 clustering failed for unit %s", roman)
    if clusters is None:
        clusters = _fallback_clusters(atoms)
    return reconstruct_unit(block, clusters, atoms), mode


def extract_module_tree(client: Any, syllabus_text: str,
                        chat_fn: ChatFn | None = None) -> dict:
    """Public entry point — returns the module_tree dict shape that
    pipeline_service stores and the frontend consumes."""
    if chat_fn is None:
        from app.services.pipeline_service import _chat as chat_fn  # lazy: no cycle
    text = _normalize(syllabus_text)
    blocks = find_unit_blocks(text)
    if not blocks:
        # Prose document with no unit markers: treat everything as one unit.
        blocks = [{"number": 1, "declared_title": "", "hours": 0, "body": text}]
        confidence = "missing"
    else:
        confidence = "high"

    units: list[dict] = []
    modes: list[str] = []
    with ThreadPoolExecutor(max_workers=min(5, len(blocks))) as pool:
        futures = [pool.submit(_cluster_unit, chat_fn, client, b) for b in blocks]
        for f in futures:
            unit, mode = f.result()
            units.append(unit)
            modes.append(mode)
    if any(m in ("repaired", "fallback") for m in modes) and confidence == "high":
        confidence = "low"
    return {"value": units, "confidence": confidence}
