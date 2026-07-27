"""Mermaid normalizer: label quoting, lint honesty, content walking.

Every "renders" case here was verified against mermaid 11.16 in a browser —
the unquoted form is a parse error, the quoted form renders. Mirrors
winnify/src/lib/mermaid.ts; keep the two in step.
"""
import json

from app.services import generation_service as gs
from app.services.mermaid_normalize import (
    mermaid_lint, normalize_mermaid, normalize_mermaid_content,
)


class TestNodeLabels:
    def test_parens_in_label_quoted(self):
        assert normalize_mermaid("flowchart LR\nA --> B[grade(score)]") == \
            'flowchart LR\nA --> B["grade(score)"]'

    def test_brackets_in_label_quoted(self):
        assert normalize_mermaid("flowchart LR\nH --> I[cal.month_name[3]]") == \
            'flowchart LR\nH --> I["cal.month_name[3]"]'

    def test_two_labels_on_one_line(self):
        assert normalize_mermaid("flowchart LR\n A[foo(1)] --> B[bar[2]] --> C[ok]") == \
            'flowchart LR\n A["foo(1)"] --> B["bar[2]"] --> C[ok]'

    def test_shape_openers_preserved(self):
        assert normalize_mermaid("flowchart LR\n B([Stadium (x)]) --> C[[Sub (y)]]") == \
            'flowchart LR\n B(["Stadium (x)"]) --> C[["Sub (y)"]]'

    def test_already_quoted_untouched(self):
        src = 'flowchart LR\n A["already (quoted)"] --> B[plain]'
        assert normalize_mermaid(src) == src

    def test_inner_quote_escaped(self):
        assert normalize_mermaid('flowchart LR\n A[say "hi" (loud)]') == \
            'flowchart LR\n A["say #quot;hi#quot; (loud)"]'

    def test_clean_source_untouched(self):
        src = ("flowchart LR\nA[Developer needs reusable functionality] --> "
               "B[PIP obtains requested package]")
        assert normalize_mermaid(src) == src

    def test_decision_label_with_colon_and_gt_untouched(self):
        # Colons and `>` parse fine unquoted — do not churn them.
        src = "flowchart TD\n A[Read] --> B{temperature > 35?}\n B --> C{After 22:00?}"
        assert normalize_mermaid(src) == src


class TestEdgeAndSubgraphLabels:
    def test_pipe_edge_label_quoted(self):
        assert normalize_mermaid("flowchart TD\n A[x] -->|calls f(y)| B[z]") == \
            'flowchart TD\n A[x] -->|"calls f(y)"| B[z]'

    def test_plain_pipe_edge_label_untouched(self):
        src = "flowchart TD\n A[x] -->|True| B[y]\n A -->|False| C[z]"
        assert normalize_mermaid(src) == src

    def test_dash_edge_label_untouched(self):
        # `-- Yes -->` accepts parentheses unquoted, so leave the form alone.
        src = "flowchart TD\n A[x] -- Yes --> B[y]\n B -- No --> C[z]"
        assert normalize_mermaid(src) == src

    def test_subgraph_title_with_space_quoted(self):
        assert normalize_mermaid("flowchart TD\n subgraph one [Group (a)]\n end") == \
            'flowchart TD\n subgraph one ["Group (a)"]\n end'

    def test_subgraph_title_without_space_quoted(self):
        assert normalize_mermaid("flowchart TD\n subgraph one[Group (a)]\n end") == \
            'flowchart TD\n subgraph one["Group (a)"]\n end'

    def test_bare_subgraph_untouched(self):
        src = "flowchart TD\n subgraph Group a\n  A[x] --> B[y]\n end"
        assert normalize_mermaid(src) == src


class TestNonFlowchartDiagrams:
    def test_sequence_untouched(self):
        # Parens are legal in sequence message text; quoting would corrupt it.
        src = "sequenceDiagram\n A->>B: call f(x)\n B-->>A: return (ok)"
        assert normalize_mermaid(src) == src

    def test_class_untouched(self):
        src = "classDiagram\n class Grade {\n +grade(score) int\n }"
        assert normalize_mermaid(src) == src

    def test_state_untouched(self):
        src = "stateDiagram-v2\n [*] --> Idle\n Idle --> Running: start()\n Running --> [*]"
        assert normalize_mermaid(src) == src

    def test_er_untouched(self):
        src = "erDiagram\n CUSTOMER ||--o{ ORDER : places\n ORDER { string id }"
        assert normalize_mermaid(src) == src


class TestEllipsisLines:
    def test_bare_ellipsis_dropped_from_sequence(self):
        # Real corruption observed in DB: the model elided repeated steps with
        # "...", which no diagram grammar accepts as a statement.
        src = ("sequenceDiagram\n    R->>Grid: Move to (0,1)\n    ...\n"
               "    R->>Grid: Move to (4,4)")
        assert normalize_mermaid(src) == \
            "sequenceDiagram\n    R->>Grid: Move to (0,1)\n    R->>Grid: Move to (4,4)"

    def test_bare_ellipsis_dropped_from_flowchart(self):
        assert normalize_mermaid("flowchart LR\n A[x] --> B[y]\n …\n B --> C[z]") == \
            "flowchart LR\n A[x] --> B[y]\n B --> C[z]"

    def test_ellipsis_inside_a_label_kept(self):
        assert normalize_mermaid("flowchart LR\n A[stats.mean(...)] --> B[y]") == \
            'flowchart LR\n A["stats.mean(...)"] --> B[y]'

    def test_single_dot_line_kept(self):
        # Only 2+ dots read as an elision; a lone "." is left for the parser.
        src = "flowchart LR\n A[x] --> B[y]\n ."
        assert normalize_mermaid(src) == src


class TestLint:
    def test_rejects_empty(self):
        assert not mermaid_lint("")

    def test_rejects_wrong_header(self):
        assert not mermaid_lint("A --> B")

    def test_rejects_unbalanced(self):
        assert not mermaid_lint("flowchart LR\n A[unclosed --> B")

    def test_rejects_unquoted_brackets_despite_balance(self):
        # The old counting lint passed this — bracket counts balance, but
        # mermaid cannot parse it.
        assert not mermaid_lint("graph LR\nD[ns] --> F[grade(score)]")

    def test_accepts_normalized_form(self):
        assert mermaid_lint(normalize_mermaid("graph LR\nD[ns] --> F[grade(score)]"))

    def test_accepts_clean_source(self):
        assert mermaid_lint("flowchart LR\nA[Start here] --> B[Finish there]")

    def test_accepts_sequence(self):
        assert mermaid_lint("sequenceDiagram\n A->>B: call f(x)")

    def test_accepts_er_cardinality(self):
        # `||--o{` borrows a brace the entity block never closes — a naive
        # balance count reads valid ER source as broken.
        assert mermaid_lint("erDiagram\n CUSTOMER ||--o{ ORDER : places\n"
                            " ORDER {\n  int orderNumber\n }")

    def test_rejects_unbalanced_er_entity_block(self):
        assert not mermaid_lint("erDiagram\n CUSTOMER ||--o{ ORDER : places\n"
                                " ORDER {\n  int orderNumber")

    def test_rejects_bare_ellipsis_line(self):
        assert not mermaid_lint("sequenceDiagram\n A->>B: one\n ...\n A->>B: two")


class TestValidatorWiring:
    """The gates that consume the lint — a green check must mean renderable."""

    @staticmethod
    def _check(result, name):
        return next(c for c in result.checks if c.name == name)

    def _deck(self, code):
        return {"slides": [{"slide_no": 1, "phase": 1, "layout": "visual",
                            "visual": {"type": "mermaid_flowchart", "mermaid_code": code}}]}

    def test_deck_lint_fails_on_unquoted_label(self):
        r = gs.validate_slides_deck(self._deck("graph LR\nD[ns] --> F[grade(score)]"),
                                    {"time_minutes": 30})
        assert not self._check(r, "deck:mermaid_lint").passed

    def test_deck_lint_passes_normalized_label(self):
        r = gs.validate_slides_deck(self._deck('graph LR\nD[ns] --> F["grade(score)"]'),
                                    {"time_minutes": 30})
        assert self._check(r, "deck:mermaid_lint").passed

    def _core(self, visual):
        return {"deep_dive": {"architecture_and_mechanism": {"visuals": [visual]}}}

    def test_notes_diagram_check_fails_on_unparseable_mermaid(self):
        # Description alone used to count as "compiles" for every non-table
        # visual, so broken diagrams passed this gate untouched.
        c = gs._check_diagram_compile(self._core(
            {"visual_id": "V1", "type": "mermaid_flowchart", "description": "A flow.",
             "mermaid_code": "flowchart LR\n A[f(x)] --> B[y]"}))
        assert not c.passed and "V1" in c.detail

    def test_notes_diagram_check_passes_normalized_mermaid(self):
        c = gs._check_diagram_compile(self._core(
            {"visual_id": "V1", "type": "mermaid_flowchart", "description": "A flow.",
             "mermaid_code": 'flowchart LR\n A["f(x)"] --> B[y]'}))
        assert c.passed

    def test_gen_notes_unit_output_is_normalized(self, monkeypatch):
        raw = {"deep_dive": {"architecture_and_mechanism": {"visuals": [
            {"type": "mermaid_flowchart", "mermaid_code": "flowchart LR\n A[f(x)] --> B[y]"}]}}}
        monkeypatch.setattr(gs, "_chat_json", lambda *a, **k: json.loads(json.dumps(raw)))
        out = gs.gen_notes_unit(None, {}, {}, {"concept_id": "C1"},
                                prev_title=None, next_title=None, prior_terms=[])
        code = (out["core"]["deep_dive"]["architecture_and_mechanism"]
                ["visuals"][0]["mermaid_code"])
        assert code == 'flowchart LR\n A["f(x)"] --> B[y]'


class TestContentWalk:
    def test_rewrites_nested_mermaid_code_only(self):
        content = {"slides": [
            {"visual": {"type": "mermaid_flowchart",
                        "mermaid_code": "flowchart LR\n A[f(x)] --> B[y]",
                        "title": "keeps (parens) in prose"}},
            {"visual": {"type": "table", "mermaid_code": None, "rows": [["f(x)"]]}},
        ]}
        out, n = normalize_mermaid_content(content)
        assert n == 1
        assert out["slides"][0]["visual"]["mermaid_code"] == 'flowchart LR\n A["f(x)"] --> B[y]'
        assert out["slides"][0]["visual"]["title"] == "keeps (parens) in prose"
        assert out["slides"][1]["visual"]["rows"] == [["f(x)"]]

    def test_clean_content_reports_no_change(self):
        content = {"visuals": [{"mermaid_code": "flowchart LR\n A[x] --> B[y]"}]}
        out, n = normalize_mermaid_content(content)
        assert n == 0
        assert out == content

    def test_leaves_input_untouched(self):
        content = {"v": {"mermaid_code": "flowchart LR\n A[f(x)]"}}
        normalize_mermaid_content(content)
        assert content["v"]["mermaid_code"] == "flowchart LR\n A[f(x)]"
