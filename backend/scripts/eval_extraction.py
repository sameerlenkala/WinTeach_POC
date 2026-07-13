"""
Golden-set eval for syllabus STRUCTURE extraction (P1-STRUCTURE).

For every evals/golden/<case>.txt + <case>.expected.json pair: run the live
structure prompt, score the extracted module tree against the hand-verified
expected tree, print a scorecard, and exit non-zero if any case fails its
thresholds. Run after ANY change to the extraction prompts:

    cd backend && .venv/bin/python scripts/eval_extraction.py [case ...]

Costs one structure-model call per case. Requires OPENAI_API_KEY.

Scoring (token-normalized, tolerant of punctuation/hyphen/case drift):
  unit_match      — unit count, numbers, hours all correct
  topic F1        — greedy title matching (exact-normalized or Jaccard ≥ 0.6)
  subtopic recall — expected subtopics found under their matched topic
  content recall  — expected subtopics found ANYWHERE in the tree (catches
                    misplaced-but-present; the gap vs subtopic recall is
                    misassignment, the gap vs 1.0 is DROPPED CONTENT)

PASS thresholds: topic F1 ≥ 0.80 and content recall ≥ 0.90.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

GOLDEN_DIR = Path(__file__).resolve().parents[1] / "evals" / "golden"
TOPIC_F1_FLOOR = 0.80
CONTENT_RECALL_FLOOR = 0.90


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9 ]+", " ", str(s).casefold()).strip()


def tokens(s: str) -> set[str]:
    return {w for w in norm(s).split() if len(w) > 2}


def jaccard(a: set[str], b: set[str]) -> float:
    return len(a & b) / len(a | b) if a | b else 0.0


def contains(needle: str, haystacks: list[str]) -> bool:
    """Expected item counts as found when all its distinctive tokens appear in
    one extracted string (order-free, hyphen/case tolerant)."""
    need = tokens(needle)
    if not need:
        return True
    return any(need <= tokens(h) | set(norm(h).split()) for h in haystacks)


def match_topics(extracted: list[dict], expected: list[dict]) -> list[tuple[dict, dict]]:
    """Greedy best-first pairing of extracted↔expected topics by title."""
    pairs, used = [], set()
    cands = []
    for i, ex in enumerate(expected):
        for j, got in enumerate(extracted):
            a, b = tokens(ex["title"]), tokens(got.get("title", ""))
            score = 1.0 if norm(ex["title"]) == norm(got.get("title", "")) else jaccard(a, b)
            if score >= 0.6:
                cands.append((score, i, j))
    for score, i, j in sorted(cands, reverse=True):
        if i in used or ("j", j) in used:
            continue
        used.add(i)
        used.add(("j", j))
        pairs.append((expected[i], extracted[j]))
    return pairs


def duplication_errors(got_units: list[dict]) -> list[str]:
    """Duplication failure class: a topic title that also appears as a
    subtopic in the SAME unit, or the same subtopic repeated within ONE topic.
    Honest repeats across topics (e.g. two 'Introduction' subtopics under
    different topics of one unit) are NOT flagged — they occur in real
    syllabi."""
    dups: list[str] = []
    for u in got_units:
        topics = u.get("topics", [])
        unit_subs = {norm(str(s)) for t in topics for s in t.get("subtopics", [])}
        for t in topics:
            title = norm(t.get("title", ""))
            if title and title in unit_subs:
                dups.append(f"title-as-subtopic: {t.get('title')}")
            subs = [norm(str(s)) for s in t.get("subtopics", [])]
            for s in {x for x in subs if subs.count(x) > 1}:
                dups.append(f"repeated-in-topic: {s}")
    return dups


def score_case(got_units: list[dict], expected: dict) -> dict:
    exp_units = expected["units"]

    unit_ok = (len(got_units) == len(exp_units)
               and all(int(g.get("contact_hours") or 0) == e["hours"]
                       for g, e in zip(got_units, exp_units)))

    n_expected = n_extracted = n_matched = 0
    sub_found = sub_total = 0
    anywhere_found = anywhere_total = 0
    dropped: list[str] = []
    misplaced: list[str] = []

    all_strings: list[str] = []
    for g in got_units:
        for t in g.get("topics", []):
            all_strings.append(t.get("title", ""))
            all_strings += [str(s) for s in t.get("subtopics", [])]

    for g, e in zip(got_units, exp_units):
        got_topics = g.get("topics", [])
        n_expected += len(e["topics"])
        n_extracted += len(got_topics)
        pairs = match_topics(got_topics, e["topics"])
        n_matched += len(pairs)
        paired_expected = {id(p[0]) for p in pairs}
        for ex_t, got_t in pairs:
            local = [got_t.get("title", "")] + [str(s) for s in got_t.get("subtopics", [])]
            for s in ex_t["subtopics"]:
                sub_total += 1
                anywhere_total += 1
                if contains(s, local):
                    sub_found += 1
                    anywhere_found += 1
                elif contains(s, all_strings):
                    anywhere_found += 1
                    misplaced.append(s)
                else:
                    dropped.append(s)
        for ex_t in e["topics"]:
            if id(ex_t) not in paired_expected:
                for s in ex_t["subtopics"]:
                    sub_total += 1
                    anywhere_total += 1
                    if contains(s, all_strings):
                        anywhere_found += 1
                        misplaced.append(s)
                    else:
                        dropped.append(s)

    precision = n_matched / n_extracted if n_extracted else 0.0
    recall = n_matched / n_expected if n_expected else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    sub_recall = sub_found / sub_total if sub_total else 1.0
    content_recall = anywhere_found / anywhere_total if anywhere_total else 1.0

    dups = duplication_errors(got_units)

    return {
        "unit_match": unit_ok,
        "topic_precision": round(precision, 3),
        "topic_recall": round(recall, 3),
        "topic_f1": round(f1, 3),
        "subtopic_recall": round(sub_recall, 3),
        "content_recall": round(content_recall, 3),
        "duplication": dups,
        "dropped": dropped,
        "misplaced": misplaced,
        "passed": (f1 >= TOPIC_F1_FLOOR and content_recall >= CONTENT_RECALL_FLOOR
                   and not dups),
    }


def run_case(client, case: str) -> dict:
    from app.services import pipeline_service as ps
    from app.services import structure_extraction as sx
    text = (GOLDEN_DIR / f"{case}.txt").read_text()
    expected = json.loads((GOLDEN_DIR / f"{case}.expected.json").read_text())
    tree = sx.extract_module_tree(client, text, chat_fn=ps._chat)
    got_units = tree.get("value") or []
    result = score_case(got_units, expected)
    result["case"] = case
    return result


def main() -> int:
    from openai import OpenAI
    from app.core.config import settings
    if not settings.openai_api_key:
        print("OPENAI_API_KEY not configured — cannot run the live eval.")
        return 2
    client = OpenAI(api_key=settings.openai_api_key)

    wanted = sys.argv[1:]
    cases = sorted(p.stem.replace(".expected", "")
                   for p in GOLDEN_DIR.glob("*.expected.json"))
    if wanted:
        cases = [c for c in cases if c in wanted]
    if not cases:
        print("No golden cases found in", GOLDEN_DIR)
        return 2

    print(f"{'case':<16} {'pass':<5} {'units':<6} {'topicF1':<8} {'subRec':<7} {'content':<8} {'dup':<4}")
    all_ok = True
    for case in cases:
        r = run_case(client, case)
        all_ok &= r["passed"]
        print(f"{r['case']:<16} {'PASS' if r['passed'] else 'FAIL':<5} "
              f"{'ok' if r['unit_match'] else 'BAD':<6} {r['topic_f1']:<8} "
              f"{r['subtopic_recall']:<7} {r['content_recall']:<8} "
              f"{len(r['duplication']):<4}")
        if r["duplication"]:
            print(f"    DUPLICATION: {r['duplication']}")
        if r["dropped"]:
            print(f"    DROPPED CONTENT: {r['dropped']}")
        if r["misplaced"]:
            print(f"    misplaced (present, wrong topic): {r['misplaced']}")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
