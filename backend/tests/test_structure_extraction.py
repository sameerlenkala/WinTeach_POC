"""Structure extraction v2 (atomize-then-cluster) — offline tests, no network.

Exercised against the real golden syllabi (evals/golden), which contain the
known hard cases: headings split across lines, page-break junk inside a unit,
uppercase OCR wraps ("CPU\\nScheduling"), the trailing "list: item" trap
("...MYCIN, DART, XCON: Expert systems shells"), parenthetical enumerations,
and intra-word hyphens. The clustering LLM is stubbed — these tests cover the
deterministic layers: normalization, unit detection, wrap joining, atomization,
validation, repair coercion, fallback, and reconstruction.
"""

import json
from pathlib import Path

from app.services.structure_extraction import (
    _normalize, atomize, extract_module_tree, find_unit_blocks,
    join_wrapped_lines, reconstruct_unit, topic_bound, validate_clusters,
    _force_valid, _fallback_clusters,
)

GOLDEN = Path(__file__).resolve().parents[1] / "evals" / "golden"

OS_TEXT = (GOLDEN / "os_syllabus.txt").read_text()
DASH_TEXT = (GOLDEN / "dash_format.txt").read_text()
XCON_TEXT = (GOLDEN / "xcon_pattern.txt").read_text()


def _blocks(text):
    return find_unit_blocks(_normalize(text))


def _unit_atoms(text, number):
    block = next(b for b in _blocks(text) if b["number"] == number)
    atoms, list_mode = atomize(block["body"])
    return block, atoms, list_mode


def _texts(atoms):
    return [a["text"] for a in atoms]


# ── Unit block detection ──────────────────────────────────────────────────────

def test_unit_blocks_os_syllabus():
    blocks = _blocks(OS_TEXT)
    assert [b["number"] for b in blocks] == [1, 2, 3, 4, 5]
    assert [b["hours"] for b in blocks] == [10, 9, 9, 10, 9]
    # The last unit's body stops before Text Books.
    assert "Silberschatz" not in blocks[-1]["body"]


def test_unit_blocks_dash_format():
    blocks = _blocks(DASH_TEXT)
    assert [b["number"] for b in blocks] == [1, 2, 3]
    assert [b["hours"] for b in blocks] == [8, 10, 9]


def test_declared_unit_title_captured():
    text = "UNIT – II: Process Management (9 Hours)\nProcesses: Process concept, IPC.\n"
    blocks = _blocks(text)
    assert blocks[0]["declared_title"] == "Process Management"
    assert blocks[0]["hours"] == 9


def test_no_units_detected_yields_empty():
    assert _blocks("Just some prose with no unit markers at all.") == []


# ── Junk filtering + wrap joining ─────────────────────────────────────────────

def test_page_junk_inside_unit_iv_is_stripped():
    _, atoms, _ = _unit_atoms(OS_TEXT, 4)
    joined = " ".join(_texts(atoms))
    assert "Regulations" not in joined
    assert "L T P" not in joined
    # Content on both sides of the page break survives.
    assert any("Swapping" in t for t in _texts(atoms))
    assert any("Demand paging" in t for t in _texts(atoms))


def test_join_wrapped_lines_rules():
    # Lowercase continuation joins; ':' continuation joins;
    # uppercase next line stays separate (standalone heading).
    lines = ["Operating systems", "operations, Computing environments",
             "Operating Systems Overview", ": Introduction",
             "Relational Algebra", "Selection and projection, Set operations"]
    out = join_wrapped_lines(lines)
    assert out[0] == "Operating systems operations, Computing environments"
    assert out[1] == "Operating Systems Overview : Introduction"
    assert out[2] == "Relational Algebra"
    assert out[3] == "Selection and projection, Set operations"


# ── Atomization ───────────────────────────────────────────────────────────────

def test_parenthetical_enumeration_stays_one_atom():
    _, atoms, _ = _unit_atoms(DASH_TEXT, 3)
    assert any(t == "Normal forms (1NF, 2NF, 3NF, BCNF)" for t in _texts(atoms))


def test_intra_word_hyphens_never_split():
    _, atoms, _ = _unit_atoms(OS_TEXT, 4)
    assert any("Copy-on-write" in t for t in _texts(atoms))
    assert any("Memory-Management" in t for t in _texts(atoms))


def test_spaced_dash_is_a_delimiter_with_heading_hint():
    _, atoms, _ = _unit_atoms(DASH_TEXT, 1)
    dm = next(a for a in atoms if a["text"] == "Data Models")
    assert dm["hint"] == "dash"
    assert any(a["text"] == "Relational model" for a in atoms)


def test_xcon_trap_atoms_are_positional_and_unique():
    _, atoms, _ = _unit_atoms(XCON_TEXT, 5)
    texts = _texts(atoms)
    assert texts.count("XCON") == 1
    assert "Expert systems shells" in texts
    xcon = next(a for a in atoms if a["text"] == "XCON")
    assert xcon["hint"] == "colon"  # the trap: colon noise after a list item


def test_uppercase_wrap_produces_mergeable_fragments():
    # "threading issues. CPU\nScheduling: Basic concepts..." cannot be joined
    # safely in code — both fragments must survive as atoms for the model to
    # rejoin via multi-id titles.
    _, atoms, _ = _unit_atoms(OS_TEXT, 2)
    texts = _texts(atoms)
    assert "CPU" in texts
    assert "Scheduling" in texts


def test_legit_repeated_text_kept_positionally():
    # os Unit IV has "Introduction" under two different topics — both survive.
    _, atoms, _ = _unit_atoms(OS_TEXT, 4)
    assert _texts(atoms).count("Introduction") == 2


def test_numbered_list_mode_detected():
    text = ("UNIT – I (12 Hours)\n"
            "1. Write a program to implement FCFS scheduling.\n"
            "2. Write a program to implement Round Robin scheduling.\n"
            "3. Simulate paging with FIFO replacement.\n")
    _, atoms, list_mode = _unit_atoms(text, 1)
    assert list_mode
    assert not any(a["text"].startswith(("1.", "2.", "3.")) for a in atoms)


# ── Bound / validation / repair / fallback ────────────────────────────────────

def test_topic_bound_is_adaptive():
    assert topic_bound(3) == 1
    assert topic_bound(16) == 4
    assert topic_bound(200) == 6  # ceiling


def test_validate_catches_all_partition_violations():
    out = {"topics": [
        {"title_ids": [0], "sub_ids": [[1], [1], [99]]},  # reuse + unknown
    ]}
    problems = validate_clusters(out, n_atoms=4, max_topics=3)
    joined = " ".join(problems)
    assert "used more than once" in joined
    assert "unknown id" in joined
    assert "never assigned" in joined  # ids 2, 3 missing


def test_validate_accepts_a_correct_partition():
    out = {"topics": [{"title_ids": [0], "sub_ids": [[1], [2, 3]]}]}
    assert validate_clusters(out, n_atoms=4, max_topics=3) == []


def test_force_valid_coerces_near_miss_into_partition():
    atoms = [{"id": i, "text": f"t{i}", "hint": "item"} for i in range(5)]
    out = {"topics": [
        {"title_ids": [0], "sub_ids": [[1], [1], [77]]},   # dup + unknown
        {"title_ids": [3], "sub_ids": []},                  # ids 2 and 4 missing
    ]}
    fixed = _force_valid(out, atoms)
    used = []
    for t in fixed["topics"]:
        used += t["title_ids"] + [i for g in t["sub_ids"] for i in g]
    assert sorted(used) == [0, 1, 2, 3, 4]
    assert validate_clusters(fixed, 5, 3) == []


def test_fallback_yields_valid_single_topic():
    atoms = [{"id": 0, "text": "Heading", "hint": "colon"},
             {"id": 1, "text": "item one", "hint": "item"},
             {"id": 2, "text": "item two", "hint": "line"}]
    fb = _fallback_clusters(atoms)
    assert validate_clusters(fb, 3, 6) == []
    assert fb["topics"][0]["title_ids"] == [0]


# ── Reconstruction ────────────────────────────────────────────────────────────

def test_reconstruct_joins_merged_title_fragments():
    block = {"number": 2, "declared_title": "", "hours": 9, "body": ""}
    atoms = [{"id": 0, "text": "CPU", "hint": "line"},
             {"id": 1, "text": "Scheduling", "hint": "colon"},
             {"id": 2, "text": "Basic concepts", "hint": "item"}]
    clusters = {"unit_title": "Process Scheduling", "unit_title_source": "synthesized",
                "topics": [{"title_ids": [0, 1], "sub_ids": [[2]]}]}
    unit = reconstruct_unit(block, clusters, atoms)
    assert unit["topics"][0]["title"] == "CPU Scheduling"
    assert unit["topics"][0]["subtopics"] == ["Basic concepts"]
    assert unit["unit_id"] == "UNIT-II"
    assert unit["title"] == "Process Scheduling"


def test_reconstruct_collapses_synthesized_title_duplicating_member():
    # Model synthesizes a title equal to a member phrase — the member is
    # promoted to title, never shown twice.
    block = {"number": 1, "declared_title": "", "hours": 0, "body": ""}
    atoms = [{"id": 0, "text": "Heat Transfer", "hint": "colon"},
             {"id": 1, "text": "Conduction basics", "hint": "stop"}]
    clusters = {"topics": [{"title_text": "Heat Transfer", "sub_ids": [[0], [1]]}]}
    unit = reconstruct_unit(block, clusters, atoms)
    t = unit["topics"][0]
    assert t["title"] == "Heat Transfer"
    assert t["subtopics"] == ["Conduction basics"]
    assert not t["title_synthesized"]


def test_reconstruct_never_uses_bare_unit_number_as_synthesized_title():
    block = {"number": 5, "declared_title": "", "hours": 8, "body": ""}
    atoms = [{"id": 0, "text": "Expert Systems", "hint": "dash"}]
    clusters = {"unit_title": "Unit V", "unit_title_source": "synthesized",
                "topics": [{"title_ids": [0], "sub_ids": []}]}
    unit = reconstruct_unit(block, clusters, atoms)
    assert unit["title"] == "Unit V"
    assert unit["title_source"] == "fallback"


# ── End-to-end with a stubbed model ───────────────────────────────────────────

def _stub_chat_group_by_hints(client, prompt, system=None, **kw):
    """Deterministic fake model: heading-hinted atoms start topics, everything
    else becomes subtopics of the latest topic. Parses ids from the prompt."""
    import re
    atoms = []
    for m in re.finditer(r"^\s*(\d+)\| (.+?)  \[(.+?)\]$", prompt, re.MULTILINE):
        atoms.append((int(m.group(1)), m.group(2), m.group(3)))
    topics, current = [], None
    for i, _text, mark in atoms:
        if mark in ("[:]", "[–]") or current is None:
            current = {"title_ids": [i], "sub_ids": []}
            topics.append(current)
        else:
            current["sub_ids"].append([i])
    return {"unit_title": "Stub Unit", "unit_title_source": "synthesized",
            "topics": topics}


def test_extract_module_tree_end_to_end_shape():
    tree = extract_module_tree(None, DASH_TEXT, chat_fn=_stub_chat_group_by_hints)
    assert tree["confidence"] in ("high", "low")
    units = tree["value"]
    assert [u["unit_id"] for u in units] == ["UNIT-I", "UNIT-II", "UNIT-III"]
    assert [u["contact_hours"] for u in units] == [8, 10, 9]
    for u in units:
        for t in u["topics"]:
            assert isinstance(t["title"], str) and t["title"]
            assert isinstance(t["subtopics"], list)
    # Every atom appears exactly once across the whole tree (partition).
    unit1 = units[0]
    all_strings = [t["title"] for t in unit1["topics"]] + \
                  [s for t in unit1["topics"] for s in t["subtopics"]]
    assert all_strings.count("Data Models") == 1
    assert all_strings.count("Relational model") == 1


def test_extract_module_tree_prose_document_single_unit():
    tree = extract_module_tree(
        None, "Some prose syllabus. It has sentences only.",
        chat_fn=_stub_chat_group_by_hints)
    assert tree["confidence"] == "missing"
    assert len(tree["value"]) == 1


def test_extract_module_tree_survives_model_garbage():
    def chaos(client, prompt, system=None, **kw):
        return {"topics": [{"title_ids": [999], "sub_ids": [[999]]}]}
    tree = extract_module_tree(None, XCON_TEXT, chat_fn=chaos)
    assert tree["confidence"] == "low"
    for u in tree["value"]:
        assert u["topics"]  # fallback still yields a usable tree


def test_extract_module_tree_survives_model_exception():
    def boom(client, prompt, system=None, **kw):
        raise RuntimeError("api down")
    tree = extract_module_tree(None, XCON_TEXT, chat_fn=boom)
    assert tree["confidence"] == "low"
    for u in tree["value"]:
        titles = [t["title"] for t in u["topics"]]
        assert titles
