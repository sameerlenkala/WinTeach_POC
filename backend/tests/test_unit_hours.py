"""Unit-hour derivation (pipeline) — units the syllabus left silent get hours
from the course total (L-T-P parse) or credits, while explicit values are
never touched. See derive_unit_hours in pipeline_service."""
from app.services.pipeline_service import derive_unit_hours


def _units(*hours):
    return [{"unit_number": i + 1, "title": f"Unit {i + 1}", "hours": h, "topics": []}
            for i, h in enumerate(hours)]


def test_explicit_hours_untouched():
    units = _units(10, 8, 9, 9, 9)
    derive_unit_hours(units, total_hours=45, credits=3)
    assert [u["hours"] for u in units] == [10, 8, 9, 9, 9]


def test_ltp_total_split_evenly():
    # L:3 T:0 → (3+0)×15 = 45h across 5 silent units → 9 each
    units = _units(0, 0, 0, 0, 0)
    derive_unit_hours(units, total_hours=45, credits=3)
    assert [u["hours"] for u in units] == [9.0, 9.0, 9.0, 9.0, 9.0]


def test_mixed_remainder_split():
    # One unit explicit 10h; remaining 35h across 4 silent units → 8.75 → 9.0 (half-hour steps)
    units = _units(10, 0, 0, 0, 0)
    derive_unit_hours(units, total_hours=45, credits=0)
    assert units[0]["hours"] == 10
    assert all(u["hours"] == 9.0 for u in units[1:])


def test_credits_fallback_when_no_total():
    # credits×15 = 45 across 5 units → 9 each
    units = _units(0, 0, 0, 0, 0)
    derive_unit_hours(units, total_hours=0, credits=3)
    assert [u["hours"] for u in units] == [9.0, 9.0, 9.0, 9.0, 9.0]


def test_nothing_known_leaves_zero():
    # No total, no credits — hours stay 0; generation's safety net handles it.
    units = _units(0, 0)
    derive_unit_hours(units, total_hours=0, credits=0)
    assert [u["hours"] for u in units] == [0, 0]


def test_clamped_to_sane_band():
    # Absurd totals never produce absurd per-unit hours.
    lo = _units(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
    derive_unit_hours(lo, total_hours=5, credits=0)      # 0.5/unit → clamp 2
    assert all(u["hours"] == 2.0 for u in lo)
    hi = _units(0, 0)
    derive_unit_hours(hi, total_hours=90, credits=0)     # 45/unit → clamp 15
    assert all(u["hours"] == 15.0 for u in hi)


def test_half_hour_rounding():
    # 25h across 3 units = 8.33 → 8.5
    units = _units(0, 0, 0)
    derive_unit_hours(units, total_hours=25, credits=0)
    assert all(u["hours"] == 8.5 for u in units)
