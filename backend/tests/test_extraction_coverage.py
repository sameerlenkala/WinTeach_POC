"""Runtime module-tree coverage validator, exercised against the golden OS
syllabus (real text + hand-verified tree). Offline — no network."""

import copy
import json
from pathlib import Path

from app.services.extraction_service import module_tree_coverage, _unit_segments

GOLDEN = Path(__file__).resolve().parents[1] / "evals" / "golden"


def _load():
    text = (GOLDEN / "os_syllabus.txt").read_text()
    exp = json.loads((GOLDEN / "os_syllabus.expected.json").read_text())
    units = [{"unit_number": u["unit_number"],
              "topics": [{"title": t["title"], "subtopics": t["subtopics"]}
                         for t in u["topics"]]}
             for u in exp["units"]]
    return text, units


def test_unit_segmentation_finds_all_units_and_stops_at_books():
    text, _ = _load()
    segs = _unit_segments(text)
    assert [n for n, _ in segs] == [1, 2, 3, 4, 5]
    # Unit V body must not bleed into the Text Books section.
    assert "Silberschatz" not in segs[-1][1]
    assert "Access matrix" in segs[-1][1]


def test_perfect_tree_passes_clean():
    text, units = _load()
    r = module_tree_coverage(text, units)
    assert r["overall_coverage"] >= 0.95
    assert r["flagged_units"] == []
    assert all(u["coverage"] >= 0.9 for u in r["units"])


def test_dropped_topic_is_flagged():
    text, units = _load()
    broken = copy.deepcopy(units)
    broken[4]["topics"] = [t for t in broken[4]["topics"] if t["title"] != "File System"]
    r = module_tree_coverage(text, broken)
    u5 = next(u for u in r["units"] if u["unit_number"] == 5)
    assert u5["flagged"] and 5 in r["flagged_units"]
    assert u5["coverage"] < 0.5
    assert "directory" in u5["missing_terms"]


def test_partial_drop_names_the_missing_terms():
    """The observed real failure: three File-System Internals items vanished.
    Small enough not to flag the unit, but the missing terms must be NAMED so
    the review screen can show them."""
    text, units = _load()
    broken = copy.deepcopy(units)
    fs = next(t for t in broken[4]["topics"] if t["title"] == "File System")
    fs["subtopics"] = [s for s in fs["subtopics"]
                       if s not in ("File-System Mounting", "Partitions and Mounting",
                                    "File Sharing")]
    r = module_tree_coverage(text, broken)
    u5 = next(u for u in r["units"] if u["unit_number"] == 5)
    for term in ("mounting", "partitions", "sharing"):
        assert term in u5["missing_terms"]


def test_inline_books_heading_terminates_last_unit():
    """CIET R24 syllabi put the book list on the SAME line as its heading
    ("Text Books: 1) ..."). That line must still end the last unit's body —
    otherwise the author names land in missing_terms and the unit is falsely
    flagged despite a perfect extraction."""
    text = (
        "UNIT V\n"
        "Correlation and Regression: scatter diagram, Karl Pearson coefficient "
        "of correlation, rank correlation, lines of regression.\n"
        "Text Books: 1) Miller and Freund's, Probability and Statistics for "
        "Engineers, Pearson Education. 2) S.C. Gupta, Fundamentals of "
        "Mathematical Statistics, Sultan Chand & Sons.\n"
    )
    segs = _unit_segments(text)
    assert len(segs) == 1
    num, body = segs[0]
    assert num == 5
    assert "Freund" not in body and "Gupta" not in body
    assert "rank correlation" in body

    units = [{"unit_number": 5, "topics": [
        {"title": "Correlation and Regression",
         "subtopics": ["Scatter diagram",
                       "Karl Pearson coefficient of correlation",
                       "Rank correlation", "Lines of regression"]}]}]
    r = module_tree_coverage(text, units)
    u5 = r["units"][0]
    assert not u5["flagged"], u5
    assert u5["missing_terms"] == []


def test_prose_starting_with_references_is_not_a_section_end():
    """Only a colon lets the heading carry inline content; a sentence that
    happens to begin with "References" must stay inside the unit body."""
    text = ("UNIT V\n"
            "Protection: access matrix, capability lists.\n"
            "References to the access matrix are validated by the reference "
            "monitor at runtime.\n")
    (num, body), = _unit_segments(text)
    assert num == 5
    assert "reference monitor" in body


def test_missing_unit_is_flagged():
    text, units = _load()
    r = module_tree_coverage(text, units[:4])   # unit 5 never extracted
    u5 = next(u for u in r["units"] if u["unit_number"] == 5)
    assert u5["flagged"] and not u5["extracted"]
