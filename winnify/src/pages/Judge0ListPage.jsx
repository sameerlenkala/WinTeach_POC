import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CheckCircle, ChevronRight, Code2 } from "lucide-react";
import { PROBLEMS, CATEGORIES } from "./judge0Problems.js";

const DIFF_META = {
  Easy:   { color: "#3DA35D", bg: "#E5F4E9" },
  Medium: { color: "#E4853B", bg: "rgba(228,133,59,.14)" },
  Hard:   { color: "#DC2133", bg: "rgba(220,33,51,.12)" },
};

const CAT_ICONS = {
  "Arrays": "[ ]", "Strings": '"s"', "Math": "∑",
  "Dynamic Programming": "DP", "Searching": "⌕",
  "Stacks": "⊓", "Graphs": "◈", "Sorting": "↕", "Linked Lists": "→",
  "Backtracking": "↩",
};

/* ── shared token shortcuts ─────────────────────────────── */
const T = {
  brand:       "var(--brand, #6C5CE7)",
  brandBg:     "color-mix(in oklab, var(--brand, #6C5CE7) 10%, transparent)",
  text:        "var(--text, #1A1A22)",
  text2:       "var(--text-2, rgba(26,26,34,.66))",
  text3:       "var(--text-3, rgba(26,26,34,.45))",
  card:        "var(--card, #FFFFFF)",
  border:      "var(--border, #E6E5F0)",
  muted:       "var(--surface-muted, #F1F2F7)",
  rowHover:    "var(--row-hover, #F4F3FD)",
  shadow:      "0 1px 2px rgba(20,20,50,.04), 0 8px 24px -12px rgba(60,50,140,.12)",
  fontDisplay: "var(--font-display, 'Fredoka', sans-serif)",
  fontSans:    "var(--font-sans, 'DM Sans', sans-serif)",
};

export default function Judge0ListPage() {
  const navigate = useNavigate();
  const [search,     setSearch]     = useState("");
  const [filterDiff, setFilterDiff] = useState("All");
  const [filterCat,  setFilterCat]  = useState("All");
  const [solved]                    = useState(new Set());

  const filtered = PROBLEMS.filter(p =>
    (filterDiff === "All" || p.difficulty === filterDiff) &&
    (filterCat  === "All" || p.category  === filterCat)  &&
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter(p => p.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  const stats = [
    { label: "Total",   val: PROBLEMS.length,                                      color: T.brand },
    { label: "Easy",    val: PROBLEMS.filter(p => p.difficulty === "Easy").length,  color: DIFF_META.Easy.color },
    { label: "Medium",  val: PROBLEMS.filter(p => p.difficulty === "Medium").length,color: DIFF_META.Medium.color },
    { label: "Hard",    val: PROBLEMS.filter(p => p.difficulty === "Hard").length,  color: DIFF_META.Hard.color },
    { label: "Solved",  val: solved.size,                                           color: DIFF_META.Easy.color },
  ];

  return (
    <div style={{ padding: "36px 36px 48px", minHeight: "100%", fontFamily: T.fontSans }}>

      {/* ── Page header ─────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 26, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: T.brand, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0, boxShadow: "0 8px 18px -6px rgba(108,92,231,.45)" }}>
            <Code2 size={22} />
          </div>
          <div>
            <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 28, color: T.text, margin: 0, lineHeight: 1.1 }}>DSA Practice</h1>
            <p style={{ fontSize: 14, color: T.text2, margin: "4px 0 0", fontFamily: T.fontSans }}>Solve problems · learn algorithms · track progress</p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: T.text3, width: 15, height: 15, pointerEvents: "none" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search problems…"
            style={{
              height: 42, paddingLeft: 40, paddingRight: 16, width: 260,
              borderRadius: 12, border: `1px solid var(--border, #E6E5F0)`,
              background: "var(--surface-muted, #F1F2F7)",
              fontSize: 14, color: T.text, fontFamily: T.fontSans, outline: "none",
              transition: "border 120ms ease, background 120ms ease",
            }}
            onFocus={e => { e.target.style.borderColor = "var(--brand, #6C5CE7)"; e.target.style.background = T.card; }}
            onBlur={e => { e.target.style.borderColor = "var(--border, #E6E5F0)"; e.target.style.background = "var(--surface-muted, #F1F2F7)"; }}
          />
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 26 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: T.card, border: `1px solid var(--border, #E6E5F0)`,
            borderRadius: 20, padding: "18px 20px",
            boxShadow: T.shadow,
          }}>
            <p style={{ fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 30, color: s.color, margin: 0, lineHeight: 1, tabularNums: true }}>{s.val}</p>
            <p style={{ fontSize: 12.5, color: T.text3, margin: "5px 0 0", fontFamily: T.fontSans, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Difficulty filters ───────────────────────────────── */}
      <p style={{ fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 14, color: T.text2, margin: "0 0 10px", letterSpacing: "0.01em" }}>Difficulty</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {["All", "Easy", "Medium", "Hard"].map(d => {
          const active = filterDiff === d;
          const meta = DIFF_META[d];
          return (
            <button key={d} onClick={() => setFilterDiff(d)} style={{
              padding: "6px 18px", borderRadius: 48, fontSize: 13, fontWeight: 600,
              fontFamily: T.fontDisplay, cursor: "pointer",
              border: `1.5px solid ${active ? (meta?.color || "var(--brand, #6C5CE7)") : "var(--border, #E6E5F0)"}`,
              background: active ? (meta?.bg || T.brandBg) : "transparent",
              color: active ? (meta?.color || "var(--brand, #6C5CE7)") : T.text2,
              transition: "all 120ms ease",
            }}>
              {d}
            </button>
          );
        })}
      </div>

      {/* ── Topic filters ───────────────────────────────────── */}
      <p style={{ fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 14, color: T.text2, margin: "0 0 10px", letterSpacing: "0.01em" }}>Topic</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 26 }}>
        {["All Topics", ...CATEGORIES].map(c => {
          const active = c === "All Topics" ? filterCat === "All" : filterCat === c;
          return (
            <button key={c} onClick={() => setFilterCat(c === "All Topics" ? "All" : c)} style={{
              padding: "6px 18px", borderRadius: 48, fontSize: 13, fontWeight: 600,
              fontFamily: T.fontDisplay, cursor: "pointer",
              border: `1.5px solid ${active ? "var(--brand, #6C5CE7)" : "var(--border, #E6E5F0)"}`,
              background: active ? T.brandBg : "transparent",
              color: active ? "var(--brand, #6C5CE7)" : T.text2,
              transition: "all 120ms ease",
            }}>
              {c}
            </button>
          );
        })}
      </div>

      {/* ── Problem groups ───────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {Object.entries(grouped).map(([cat, probs]) => (
          <div key={cat} style={{
            background: T.card, border: `1px solid var(--border, #E6E5F0)`,
            borderRadius: 20, overflow: "hidden", boxShadow: T.shadow,
          }}>
            {/* Category header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 20px", background: "var(--surface-muted, #F1F2F7)",
              borderBottom: `1px solid var(--border, #E6E5F0)`,
            }}>
              <span style={{
                fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                fontSize: 13, fontWeight: 700, color: "var(--brand, #6C5CE7)",
                width: 28, textAlign: "center", flexShrink: 0,
              }}>{CAT_ICONS[cat] || "#"}</span>
              <span style={{ fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 16, color: T.text }}>{cat}</span>
              <span style={{ marginLeft: "auto", fontSize: 12.5, color: T.text3, fontFamily: T.fontSans }}>
                {probs.length} problem{probs.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Table header */}
            <div style={{
              display: "grid", gridTemplateColumns: "44px 1fr 120px 64px 32px",
              padding: "8px 20px", borderBottom: `1px solid var(--border, #E6E5F0)`,
            }}>
              {["#", "Title", "Difficulty", "Status", ""].map((h, i) => (
                <span key={i} style={{
                  fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                  letterSpacing: "0.08em", color: T.text3, fontFamily: T.fontSans,
                }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            {probs.map((p, idx) => {
              const diff = DIFF_META[p.difficulty] || {};
              const isSolved = solved.has(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/judge0/${p.id}`)}
                  style={{
                    display: "grid", gridTemplateColumns: "44px 1fr 120px 64px 32px",
                    alignItems: "center", padding: "14px 20px", cursor: "pointer",
                    borderBottom: idx < probs.length - 1 ? `1px solid var(--border, #E6E5F0)` : "none",
                    transition: "background 120ms ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--row-hover, #F4F3FD)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text3, fontFamily: T.fontSans }}>{p.id}</span>

                  <span style={{
                    fontSize: 14, fontWeight: 500, color: T.text,
                    fontFamily: T.fontSans, overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12,
                  }}>{p.title}</span>

                  <span>
                    <span style={{
                      display: "inline-flex", padding: "3px 12px", borderRadius: 48,
                      fontSize: 12.5, fontWeight: 600, fontFamily: T.fontDisplay,
                      color: diff.color, background: diff.bg,
                    }}>{p.difficulty}</span>
                  </span>

                  <span style={{ display: "flex", alignItems: "center", paddingLeft: 4 }}>
                    {isSolved
                      ? <CheckCircle size={15} style={{ color: DIFF_META.Easy.color }} />
                      : <span style={{ width: 9, height: 9, borderRadius: "50%", border: `2px solid var(--border, #E6E5F0)`, display: "inline-block" }} />
                    }
                  </span>

                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", color: T.text3 }}>
                    <ChevronRight size={15} />
                  </span>
                </div>
              );
            })}
          </div>
        ))}

        {/* Empty state */}
        {Object.keys(grouped).length === 0 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "80px 0", gap: 14,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: "var(--surface-muted, #F1F2F7)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Search size={22} style={{ color: T.text3 }} />
            </div>
            <p style={{ fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 17, color: T.text2, margin: 0 }}>No problems match your filters</p>
            <p style={{ fontSize: 14, color: T.text3, margin: 0, fontFamily: T.fontSans }}>Try clearing the filters or searching something else.</p>
          </div>
        )}
      </div>
    </div>
  );
}
