"""Content-rendering audit — lints every stored concept artifact against the
reader's rendering contracts.

Run from backend/:  .venv/bin/python scripts/audit_content.py

Checks, per artifact type:
  student_notes  crash risks (string where the renderer maps/joins an array),
                 run-on step strings, literal \\n escapes, malformed members,
                 placeholder / codeless-mermaid visuals
  slides         non-list list fields, malformed code/visual objects,
                 empty table visuals, literal \\n in speaker notes
  quiz           MCQ option count, answer_index range, malformed members

Exit code 1 when any CRASH-class finding exists (safe for CI); renderer-recovered
classes (run-ons, literal \\n) are reported but do not fail the run.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.supabase import get_client  # noqa: E402

RUNON = re.compile(r"(Step\s+\d+|Observation|Result|Edge\s+Cases?|Key\s+insight)\s*:", re.I)


def is_runon(v) -> bool:
    return isinstance(v, str) and "\n" not in v and len(RUNON.findall(v)) >= 2


def walk_strings(obj):
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, list):
        for x in obj:
            yield from walk_strings(x)
    elif isinstance(obj, dict):
        for x in obj.values():
            yield from walk_strings(x)


def audit_notes(content: dict) -> list[str]:
    probs: list[str] = []
    core = content.get("core") or {}
    op = (content.get("opening") or {}).get("sections") or {}
    cl = (content.get("closing") or {}).get("sections") or {}

    # Array-required fields — the renderer calls .map/.join on these.
    conn = (op.get("introduction") or {}).get("connectivity_matrix") or {}
    for k in ("foundation", "this_subtopic", "builds_toward"):
        if conn.get(k) is not None and not isinstance(conn[k], list):
            probs.append(f"CRASH connectivity.{k} is {type(conn[k]).__name__}")
    pu = core.get("practical_understanding") or {}
    for k in ("advantages", "disadvantages", "applications"):
        if pu.get(k) is not None and not isinstance(pu[k], list):
            probs.append(f"CRASH {k} is {type(pu[k]).__name__}")
    rt = cl.get("related_topics") or {}
    if rt.get("builds_toward") is not None and not isinstance(rt["builds_toward"], list):
        probs.append(f"CRASH related.builds_toward is {type(rt['builds_toward']).__name__}")
    outs = (op.get("topic_overview") or {}).get("outcomes_checklist")
    if outs is not None and not isinstance(outs, list):
        probs.append(f"CRASH outcomes_checklist is {type(outs).__name__}")

    # Member shapes.
    et = (core.get("deep_dive") or {}).get("execution_trace") or {}
    if any(not isinstance(e, dict) for e in (et.get("edge_case_matrix") or [])):
        probs.append("edge_case_matrix member not dict")
    for m in cl.get("common_mistakes") or []:
        if isinstance(m, dict) and not (m.get("wrong_way") or m.get("mistake")):
            probs.append("closing mistake missing wrong_way/mistake")
            break
    for card in ((cl.get("flashcard_section") or {}).get("cards") or []):
        if not isinstance(card, dict) or not card.get("front"):
            probs.append("flashcard member malformed")
            break

    # Renderer-recovered classes — reported for telemetry.
    if is_runon(pu.get("worked_example")):
        probs.append("run-on worked_example (recovered at render)")
    if is_runon(et.get("dry_run_trace")):
        probs.append("run-on dry_run_trace (recovered at render)")
    arch = ((core.get("deep_dive") or {}).get("architecture_and_mechanism") or {})
    if is_runon(arch.get("explanation")):
        probs.append("run-on architecture explanation")
    nls = sum(1 for s in walk_strings(content) if "\\n" in s)
    if nls:
        probs.append(f"literal-\\n in {nls} strings (normalized at render)")

    # Visuals.
    for holder in (core.get("deep_dive") or {}).values():
        if isinstance(holder, dict):
            for v in holder.get("visuals") or []:
                t = str(v.get("type") or "")
                if t.startswith("mermaid") and not (v.get("mermaid_code") or "").strip():
                    probs.append(f"mermaid visual without code ({v.get('visual_id')})")
                if not t.startswith("mermaid") and not (v.get("rows") or []):
                    probs.append(f"placeholder visual {t} ({v.get('visual_id')})")
    return probs


def audit_slides(content: dict) -> list[str]:
    probs: list[str] = []
    slides = content.get("slides") or []
    if not isinstance(slides, list):
        return ["CRASH slides not a list"]
    for s in slides:
        if not isinstance(s, dict):
            probs.append(f"CRASH slide member {type(s).__name__}")
            continue
        no = s.get("slide_no")
        for f in ("body_blocks", "sections", "terms", "left_bullets", "right_bullets", "build_steps"):
            if s.get(f) is not None and not isinstance(s[f], list):
                probs.append(f"CRASH s{no} {f} is {type(s[f]).__name__}")
        if s.get("code") is not None and not isinstance(s["code"], dict):
            probs.append(f"CRASH s{no} code is {type(s['code']).__name__}")
        v = s.get("visual")
        if isinstance(v, dict):
            t = str(v.get("type") or "")
            if t.startswith("mermaid") and not (v.get("mermaid_code") or "").strip():
                probs.append(f"s{no} mermaid visual without code")
            if t == "table" and not (v.get("rows") or []):
                probs.append(f"s{no} empty table visual")
        for f in ("title", "speaker_notes", "myth", "reality", "takeaway", "kicker", "definition_core"):
            if s.get(f) is not None and not isinstance(s[f], str):
                probs.append(f"s{no} {f} is {type(s[f]).__name__}")
        if isinstance(s.get("speaker_notes"), str) and "\\n" in s["speaker_notes"]:
            probs.append(f"s{no} literal-\\n in speaker notes")
    return probs


def audit_quiz(content: dict) -> list[str]:
    probs: list[str] = []
    mcq = content.get("mcq")
    if mcq is not None and not isinstance(mcq, list):
        return ["CRASH mcq not a list"]
    for i, q in enumerate(mcq or []):
        if not isinstance(q, dict):
            probs.append(f"CRASH mcq[{i}] is {type(q).__name__}")
            continue
        opts = q.get("options")
        if not isinstance(opts, list) or len(opts) != 4:
            probs.append(f"mcq[{i}] options={opts if not isinstance(opts, list) else len(opts)}")
        ai = q.get("answer_index")
        if not isinstance(ai, int) or not 0 <= ai <= 3:
            probs.append(f"mcq[{i}] answer_index={ai!r}")
    sa = content.get("short_answer")
    if sa is not None and not isinstance(sa, list):
        probs.append("CRASH short_answer not a list")
    else:
        for i, q in enumerate(sa or []):
            if not isinstance(q, dict) or not q.get("question"):
                probs.append(f"short_answer[{i}] malformed")
    return probs


AUDITORS = {"student_notes": audit_notes, "slides": audit_slides, "quiz": audit_quiz}


def main() -> int:
    db = get_client()
    rows = (db.table("concept_artifacts")
            .select("topic_id,concept_id,artifact_type,content").execute().data)
    scanned = {t: 0 for t in AUDITORS}
    findings = crash = 0
    for r in rows:
        fn = AUDITORS.get(r.get("artifact_type"))
        if fn is None:
            continue
        scanned[r["artifact_type"]] += 1
        probs = fn(r.get("content") or {})
        if probs:
            findings += len(probs)
            crash += sum(1 for p in probs if p.startswith("CRASH"))
            print(f"{r['topic_id'][:8]}/{r['concept_id']} [{r['artifact_type']}]:")
            for p in probs:
                print("   -", p)
    summary = " · ".join(f"{n} {t}" for t, n in scanned.items())
    print(f"--- scanned {summary} · {findings} findings · {crash} crash-class")
    return 1 if crash else 0


if __name__ == "__main__":
    raise SystemExit(main())
