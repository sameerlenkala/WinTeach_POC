"""One-off repair pass: apply the LaTeX sanitizer to stored generated content.

Walks every `concept_artifacts` and `artifacts` row that has JSON content,
runs app.services.latex_sanitizer.sanitize_content, and updates rows whose
content changed. Run from backend/ so .env loads.

Usage:
    python scripts/repair_latex.py            # dry run (default): report only
    python scripts/repair_latex.py --apply    # write changes
    python scripts/repair_latex.py --apply --backup /path/backup.json
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.supabase import get_client  # noqa: E402
from app.services.latex_sanitizer import sanitize_content  # noqa: E402

PAGE = 200


def _pages(db, table: str, cols: str):
    off = 0
    while True:
        rows = (db.table(table).select(cols).order("id")
                .range(off, off + PAGE - 1).execute().data or [])
        if not rows:
            return
        yield from rows
        if len(rows) < PAGE:
            return
        off += PAGE


def repair_table(db, table: str, apply: bool, backup: list[dict]) -> tuple[int, int, int]:
    scanned = changed_rows = changed_strings = 0
    for row in _pages(db, table, "id,content"):
        scanned += 1
        content = row.get("content")
        if not isinstance(content, (dict, list)):
            continue
        fixed, n = sanitize_content(content)
        if not n:
            continue
        changed_rows += 1
        changed_strings += n
        print(f"  {table}/{row['id']}: {n} string(s) repaired")
        if apply:
            backup.append({"table": table, "id": row["id"], "content": content})
            db.table(table).update({"content": fixed}).eq("id", row["id"]).execute()
    return scanned, changed_rows, changed_strings


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="write repairs (default: dry run)")
    ap.add_argument("--backup", help="where to write pre-repair content of changed rows")
    args = ap.parse_args()

    db = get_client()
    backup: list[dict] = []
    for table in ("concept_artifacts", "artifacts", "concept_artifact_versions"):
        print(f"{table}: {'applying' if args.apply else 'dry run'}…")
        s, r, n = repair_table(db, table, args.apply, backup)
        print(f"{table}: scanned {s} rows, {r} rows / {n} strings need repair\n")

    if args.apply and args.backup and backup:
        Path(args.backup).write_text(json.dumps(backup, ensure_ascii=False, indent=1))
        print(f"backup of {len(backup)} original rows -> {args.backup}")


if __name__ == "__main__":
    main()
