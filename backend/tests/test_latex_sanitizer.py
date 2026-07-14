"""LaTeX sanitizer: JSON escape-eaten control chars + unbalanced $ repair."""
from app.services.latex_sanitizer import sanitize_content, sanitize_str


class TestControlCharRestoration:
    def test_formfeed_forall(self):
        # Real corruption observed in DB: model wrote "\forall" single-escaped.
        assert sanitize_str("$\x0corall x\\,P(x)$") == "$\\forall x\\,P(x)$"

    def test_backspace_beta(self):
        assert sanitize_str("$\x08eta$") == "$\\beta$"

    def test_ff_bs_restored_even_without_dollar(self):
        assert sanitize_str("\x0crac{1}{2}") == "\\frac{1}{2}"

    def test_tab_times_inside_math(self):
        assert sanitize_str("$a \times b$") == "$a \\times b$"

    def test_newline_neg_inside_math(self):
        assert sanitize_str("$P \neg Q$") == "$P \\neg Q$"

    def test_cr_rightarrow_inside_math(self):
        assert sanitize_str("$P \rightarrow Q$") == "$P \\rightarrow Q$"

    def test_stray_ctrl_char_before_command_word(self):
        # Real corruption observed in DB: 0x11 where the backslash of \land was.
        assert sanitize_str("$A \x11land B$") == "$A \\land B$"

    def test_stray_ctrl_char_not_before_command_untouched(self):
        s = "$A \x11zzz B$"
        assert sanitize_str(s) == s

    def test_ctrl_char_prefix_of_longer_word_untouched(self):
        # "inland" starts with "in" + letters, so the (?![A-Za-z]) guard blocks it.
        s = "route \x11inland here"
        assert sanitize_str(s) == s

    def test_legit_newlines_untouched(self):
        s = "First paragraph.\n\nSecond paragraph with $x$."
        assert sanitize_str(s) == s

    def test_legit_tab_untouched(self):
        s = "col1\tcol2 with $x$"
        assert sanitize_str(s) == s

    def test_no_dollar_no_whitespace_restoration(self):
        # Without math markers, \n + "eg" stays a newline (prose guard).
        s = "line\negative thoughts"  # \n + "egative…" ends in letters, no match
        assert sanitize_str(s) == s
        s2 = "line\neg case"  # would match, but no "$" in string
        assert sanitize_str(s2) == s2


class TestDollarBalance:
    def test_backtick_closed_math_repaired(self):
        # Real corruption observed in DB.
        s = "the rule $\\forall x\\,(Trainee(x) \\rightarrow Helmeted(x))`."
        assert sanitize_str(s) == \
            "the rule $\\forall x\\,(Trainee(x) \\rightarrow Helmeted(x))$."

    def test_two_backtick_closed_formulas_even_parity(self):
        # Two "$…`" formulas make the total "$" count even; must still repair.
        s = ("To check $\\forall x\\,Registered(x)`, inspect every member. "
             "To check $\\exists x\\,Registered(x)`, stop at the first witness.")
        assert sanitize_str(s) == (
            "To check $\\forall x\\,Registered(x)$, inspect every member. "
            "To check $\\exists x\\,Registered(x)$, stop at the first witness.")

    def test_backtick_closed_mixed_with_balanced_math(self):
        s = ("Set $\\{a,b\\}$ and check $\\forall x\\,P(x)`, then "
             "$\\exists x\\,Q(x)` holds.")
        assert sanitize_str(s) == (
            "Set $\\{a,b\\}$ and check $\\forall x\\,P(x)$, then "
            "$\\exists x\\,Q(x)$ holds.")

    def test_two_dollar_currency_untouched(self):
        # Even count, no backslash-in-math — must not be touched.
        s = "It costs $5 and saves $10 per run."
        assert sanitize_str(s) == s

    def test_balanced_string_with_backtick_code_untouched(self):
        s = "use $x+y$ and `code` here"
        assert sanitize_str(s) == s

    def test_currency_odd_dollar_untouched(self):
        s = "it costs $5"
        assert sanitize_str(s) == s

    def test_plain_backtick_run_not_converted(self):
        # Odd $ but the backtick run has no backslash -> not latex, leave it.
        s = "price $5 and `Helmeted(asha)` fact"
        assert sanitize_str(s) == s


class TestTreeWalk:
    def test_nested_and_count(self):
        content = {
            "sections": [
                {"body": "$\x0corall x$", "title": "ok"},
                {"rows": [["$a \neg b$", "plain"]]},
            ]
        }
        fixed, n = sanitize_content(content)
        assert n == 2
        assert fixed["sections"][0]["body"] == "$\\forall x$"
        assert fixed["sections"][1]["rows"][0][0] == "$a \\neg b$"
        assert fixed["sections"][0]["title"] == "ok"

    def test_non_string_leaves_preserved(self):
        content = {"n": 3, "ok": True, "none": None, "s": "clean"}
        fixed, n = sanitize_content(content)
        assert fixed == content and n == 0
