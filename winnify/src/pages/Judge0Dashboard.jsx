import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play, RotateCcw, Copy, Download, ChevronDown, ChevronRight,
  Terminal, Code2, Clock, Cpu, AlertCircle, CheckCircle,
  Loader2, Settings, Lightbulb, Eye, EyeOff, Search,
  Filter, Sun, Moon, BookOpen, Trophy, Lock, ChevronsUpDown
} from "lucide-react";
import { LANGUAGES } from "./judge0Languages.js";
import { PROBLEMS, CATEGORIES } from "./judge0Problems.js";

// ── Inject devicon ────────────────────────────────────────────────
const DEVICON_CDN = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css";
if (typeof document !== "undefined" && !document.getElementById("devicon-css")) {
  const link = Object.assign(document.createElement("link"), { id: "devicon-css", rel: "stylesheet", href: DEVICON_CDN });
  document.head.appendChild(link);
}

// ── Judge0 API ────────────────────────────────────────────────────
const RAPIDAPI_KEY  = "a04c3e326fmshbf4b73fa08b531bp14cdf6jsneac4f93cb52c";
const RAPIDAPI_HOST = "judge0-ce.p.rapidapi.com";
const BASE_URL      = `https://${RAPIDAPI_HOST}`;
const HEADERS = { "Content-Type": "application/json", "X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": RAPIDAPI_HOST };

const STATUS_MAP = {
  1:  { label: "In Queue",          color: "#a1a1aa" },
  2:  { label: "Processing",        color: "#3b82f6" },
  3:  { label: "Accepted",          color: "#10b981" },
  4:  { label: "Wrong Answer",      color: "#f59e0b" },
  5:  { label: "Time Limit",        color: "#ef4444" },
  6:  { label: "Compilation Error", color: "#ef4444" },
  7:  { label: "Runtime Error",     color: "#ef4444" },
  13: { label: "Internal Error",    color: "#ef4444" },
};

const DIFF_COLORS = { Easy: "#10b981", Medium: "#f59e0b", Hard: "#ef4444" };
const DIFF_BG     = { Easy: "rgba(16,185,129,.12)", Medium: "rgba(245,158,11,.12)", Hard: "rgba(239,68,68,.12)" };

function LangIcon({ lang, size = 16 }) {
  if (!lang) return null;
  if (lang.icon) return <i className={`${lang.icon} j0-devicon`} style={{ fontSize: size }} />;
  return <span className="j0-icon-fallback" style={{ fontSize: Math.max(9, size - 4) }}>{lang.iconFallback}</span>;
}

const DEFAULT_LANG = LANGUAGES.find(l => l.id === 71) || LANGUAGES[0];

export default function Judge0Dashboard() {
  // ── Problem state ─────────────────────────────────────────────
  const [selectedProblem, setSelectedProblem] = useState(PROBLEMS[0]);
  const [search,          setSearch]          = useState("");
  const [filterDiff,      setFilterDiff]      = useState("All");
  const [filterCat,       setFilterCat]       = useState("All");
  const [solvedSet,       setSolvedSet]       = useState(new Set());

  // ── Editor state ──────────────────────────────────────────────
  const [language,    setLanguage]    = useState(DEFAULT_LANG);
  const [code,        setCode]        = useState(PROBLEMS[0].boilerplate?.[71] || PROBLEMS[0].boilerplate?.[DEFAULT_LANG.id] || DEFAULT_LANG.boilerplate);
  const [stdin,       setStdin]       = useState(PROBLEMS[0].defaultStdin || "");
  const [fontSize,    setFontSize]    = useState(14);
  const [tabSize,     setTabSize]     = useState(4);
  const [lineCount,   setLineCount]   = useState(1);

  // ── Execution state ───────────────────────────────────────────
  const [output,  setOutput]  = useState(null);
  const [running, setRunning] = useState(false);

  // ── Right panel state ─────────────────────────────────────────
  const [rightTab,       setRightTab]       = useState("hints");   // hints | output | settings
  const [hintsRevealed,  setHintsRevealed]  = useState(0);
  const [solutionShown,  setSolutionShown]  = useState(false);
  const [copied,         setCopied]         = useState(false);

  // ── UI state ──────────────────────────────────────────────────
  const [langOpen,   setLangOpen]   = useState(false);
  const [descOpen,   setDescOpen]   = useState(true);
  const [theme,      setTheme]      = useState("dark");
  const [editorCollapsed, setEditorCollapsed] = useState(true);

  const textareaRef = useRef(null);
  const pollRef     = useRef(null);

  useEffect(() => setLineCount(code.split("\n").length), [code]);
  useEffect(() => () => clearInterval(pollRef.current), []);

  // ── Select problem ────────────────────────────────────────────
  const selectProblem = (p) => {
    setSelectedProblem(p);
    setHintsRevealed(0);
    setSolutionShown(false);
    setOutput(null);
    const bp = p.boilerplate?.[language.id] || p.boilerplate?.[71] || language.boilerplate;
    setCode(bp);
    setStdin(p.defaultStdin || "");
    setRightTab("hints");
  };

  // ── Language switch ───────────────────────────────────────────
  const switchLanguage = (lang) => {
    setLanguage(lang);
    setLangOpen(false);
    const bp = selectedProblem.boilerplate?.[lang.id] || lang.boilerplate;
    setCode(bp);
  };

  // ── Tab key ───────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const ta = textareaRef.current;
    const spaces = " ".repeat(tabSize);
    const start = ta.selectionStart, end = ta.selectionEnd;
    const next = code.substring(0, start) + spaces + code.substring(end);
    setCode(next);
    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + tabSize; });
  };

  // ── Run code ──────────────────────────────────────────────────
  const runCode = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setOutput({ status: { id: 1, description: "In Queue" } });
    setRightTab("output");
    try {
      const res = await fetch(`${BASE_URL}/submissions?base64_encoded=false&wait=false`, {
        method: "POST", headers: HEADERS,
        body: JSON.stringify({ source_code: code, language_id: language.id, stdin: stdin || null }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { token } = await res.json();
      if (!token) throw new Error("No token");
      clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        const r = await fetch(`${BASE_URL}/submissions/${token}?base64_encoded=false&fields=status,stdout,stderr,compile_output,time,memory`, { headers: HEADERS });
        if (!r.ok) return;
        const d = await r.json();
        setOutput({ status: d.status, stdout: d.stdout || "", stderr: d.stderr || "", compileOutput: d.compile_output || "", time: d.time, memory: d.memory });
        if (d.status?.id >= 3) {
          clearInterval(pollRef.current);
          setRunning(false);
          if (d.status?.id === 3) setSolvedSet(prev => new Set([...prev, selectedProblem.id]));
        }
      }, 1200);
    } catch (err) {
      setOutput({ status: { id: 13, description: "Error" }, stderr: err.message });
      setRunning(false);
    }
  }, [code, language, stdin, running, selectedProblem]);

  const copyCode = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const downloadCode = () => { const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([code])), download: `solution.${language.ext}` }); a.click(); };
  const resetCode = () => { const bp = selectedProblem.boilerplate?.[language.id] || language.boilerplate; setCode(bp); setOutput(null); };

  const statusInfo = output?.status ? (STATUS_MAP[output.status.id] || { label: output.status.description, color: "#a1a1aa" }) : null;
  const filteredProblems = PROBLEMS.filter(p =>
    (filterDiff === "All" || p.difficulty === filterDiff) &&
    (filterCat  === "All" || p.category  === filterCat)  &&
    p.title.toLowerCase().includes(search.toLowerCase())
  );
  const hints = selectedProblem.hints || [];
  const solution = selectedProblem.solutions?.[language.id] || selectedProblem.solutions?.[71] || "// No solution available for this language.";

  return (
    <div className="j0-app" data-theme={theme}>
      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <header className="j0-header">
        <div className="j0-header-left">
          <div className="j0-logo"><Code2 size={18} /></div>
          <span className="j0-title">Judge0 IDE</span>
          <span className="j0-badge">powered by Judge0 CE</span>
        </div>

        {/* Problem title in center */}
        <div className="j0-header-center">
          <span className="j0-header-prob-num">#{selectedProblem.id}</span>
          <span className="j0-header-prob-title">{selectedProblem.title}</span>
          <span className="j0-diff-badge" style={{ color: DIFF_COLORS[selectedProblem.difficulty], background: DIFF_BG[selectedProblem.difficulty] }}>
            {selectedProblem.difficulty}
          </span>
        </div>

        <div className="j0-header-right">
          <button className="j0-icon-btn" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} title="Toggle theme">
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button className="j0-icon-btn" onClick={copyCode} title="Copy">{copied ? <CheckCircle size={15} style={{ color: "#10b981" }} /> : <Copy size={15} />}</button>
          <button className="j0-icon-btn" onClick={downloadCode} title="Download"><Download size={15} /></button>
          <button className="j0-icon-btn" onClick={resetCode} title="Reset"><RotateCcw size={15} /></button>
          <button className={`j0-run-btn${running ? " running" : ""}`} onClick={runCode} disabled={running}>
            {running ? <><Loader2 size={15} className="j0-spin" /><span>Running…</span></> : <><Play size={15} /><span>Run</span></>}
          </button>
        </div>
      </header>

      {/* ══ 3-PANEL BODY ════════════════════════════════════════ */}
      <div className="j0-body">

        {/* ── LEFT: Problem List ─────────────────────────────── */}
        <aside className="j0-problem-list">
          <div className="j0-list-header">
            <div className="j0-search-wrap">
              <Search size={13} className="j0-search-icon" />
              <input className="j0-search" placeholder="Search problems…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="j0-filter-row">
              <select className="j0-filter-select" value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
                <option value="All">All</option>
                {["Easy","Medium","Hard"].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="j0-filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                <option value="All">All Topics</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="j0-list-stats">
              <span>{filteredProblems.length} problems</span>
              <span>{solvedSet.size} solved</span>
            </div>
          </div>

          <div className="j0-list-body">
            {filteredProblems.map(p => (
              <div
                key={p.id}
                className={`j0-prob-item${selectedProblem.id === p.id ? " active" : ""}${solvedSet.has(p.id) ? " solved" : ""}`}
                onClick={() => selectProblem(p)}
              >
                <div className="j0-prob-num">{solvedSet.has(p.id) ? <CheckCircle size={13} style={{ color: "#10b981" }} /> : p.id}</div>
                <div className="j0-prob-info">
                  <div className="j0-prob-title">{p.title}</div>
                  <div className="j0-prob-meta">
                    <span className="j0-diff-dot" style={{ background: DIFF_COLORS[p.difficulty] }} />
                    <span style={{ color: DIFF_COLORS[p.difficulty], fontSize: 11 }}>{p.difficulty}</span>
                    <span className="j0-prob-cat">{p.category}</span>
                  </div>
                </div>
                {selectedProblem.id === p.id && <ChevronRight size={13} className="j0-prob-arrow" />}
              </div>
            ))}
          </div>
        </aside>

        {/* ── MIDDLE: Description + Editor ──────────────────── */}
        <div className="j0-middle">

          {/* Problem description (collapsible) */}
          <div className="j0-desc-panel">
            <div className="j0-desc-toggle" onClick={() => setDescOpen(o => !o)}>
              <div className="j0-desc-toggle-left">
                <BookOpen size={13} />
                <span>Problem Description</span>
                <span className="j0-diff-badge" style={{ color: DIFF_COLORS[selectedProblem.difficulty], background: DIFF_BG[selectedProblem.difficulty] }}>{selectedProblem.difficulty}</span>
                <span className="j0-cat-chip">{selectedProblem.category}</span>
              </div>
              <ChevronDown size={14} style={{ transform: descOpen ? "rotate(180deg)" : "none", transition: ".2s", color: "var(--j0-text3)" }} />
            </div>

            {descOpen && (
              <div className="j0-desc-body">
                <p className="j0-desc-text">{selectedProblem.description}</p>

                {selectedProblem.examples?.length > 0 && (
                  <div className="j0-examples-section">
                    {selectedProblem.examples.map((ex, i) => (
                      <div key={i} className="j0-example-block">
                        <div className="j0-example-label">Example {i + 1}</div>
                        <div className="j0-example-io">
                          <div><span className="j0-io-key">Input:</span> <code className="j0-io-val">{ex.input}</code></div>
                          <div><span className="j0-io-key">Output:</span> <code className="j0-io-val">{ex.output}</code></div>
                          {ex.explanation && <div><span className="j0-io-key">Explanation:</span> <span className="j0-io-explain">{ex.explanation}</span></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedProblem.constraints?.length > 0 && (
                  <div className="j0-constraints">
                    <div className="j0-constraints-label">Constraints</div>
                    <ul className="j0-constraints-list">
                      {selectedProblem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Editor toolbar + editor + stdin — all collapse together */}
          {!editorCollapsed && (
            <>
              <div className="j0-editor-toolbar">
                <div className="j0-lang-selector" onClick={() => setLangOpen(o => !o)}>
                  <LangIcon lang={language} size={16} />
                  <span className="j0-lang-name">{language.name}</span>
                  <ChevronDown size={12} className={`j0-chevron${langOpen ? " open" : ""}`} />
                  {langOpen && (
                    <div className="j0-lang-dropdown">
                      <input className="j0-lang-search" placeholder="Search…" autoFocus onClick={e => e.stopPropagation()} onChange={e => e.stopPropagation()} />
                      <div className="j0-lang-list">
                        {LANGUAGES.map(l => (
                          <div key={`${l.id}-${l.name}`} className={`j0-lang-item${l.id === language.id ? " active" : ""}`} onClick={e => { e.stopPropagation(); switchLanguage(l); }}>
                            <LangIcon lang={l} size={14} /><span>{l.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className="j0-editor-meta">{lineCount} lines</span>
                <span className="j0-editor-meta" style={{ marginLeft: "auto" }}>Font</span>
                <button className="j0-step-btn" onClick={() => setFontSize(f => Math.max(10, f-1))}>−</button>
                <span className="j0-editor-meta">{fontSize}px</span>
                <button className="j0-step-btn" onClick={() => setFontSize(f => Math.min(22, f+1))}>+</button>
                <button className="j0-toggle-editor-btn" onClick={() => setEditorCollapsed(true)} title="Hide Editor">
                  <ChevronDown size={13} style={{ transform: "rotate(180deg)" }} />
                  <span>Hide Editor</span>
                </button>
              </div>

              <div className="j0-editor-wrap">
                <div className="j0-gutter" aria-hidden="true">
                  {Array.from({ length: lineCount }, (_, i) => <div key={i+1} className="j0-line-num">{i+1}</div>)}
                </div>
                <textarea ref={textareaRef} className="j0-textarea" value={code}
                  onChange={e => setCode(e.target.value)} onKeyDown={handleKeyDown}
                  spellCheck={false} autoCorrect="off" autoCapitalize="off"
                  style={{ fontSize: `${fontSize}px` }}
                />
              </div>

              <div className="j0-stdin-section">
                <div className="j0-stdin-label"><Terminal size={12} />  Standard Input (stdin)</div>
                <textarea className="j0-stdin-area" rows={3} value={stdin} onChange={e => setStdin(e.target.value)} placeholder="Enter input…" spellCheck={false} />
              </div>
            </>
          )}

          {/* Slim bar — always visible when editor is hidden */}
          {editorCollapsed && (
            <button className="j0-show-editor-bar" onClick={() => setEditorCollapsed(false)}>
              <Code2 size={13} />
              <span>Show Editor</span>
              <ChevronDown size={13} />
            </button>
          )}

        </div>

        {/* ── RIGHT: Hints / Output / Settings ──────────────── */}
        <aside className="j0-right-panel">
          <div className="j0-tabs">
            {[
              { id: "hints",    icon: <Lightbulb size={12} />, label: "Hints" },
              { id: "output",   icon: <Terminal  size={12} />, label: "Output" },
              { id: "settings", icon: <Settings  size={12} />, label: "Settings" },
            ].map(t => (
              <button key={t.id} className={`j0-tab${rightTab === t.id ? " active" : ""}`} onClick={() => setRightTab(t.id)}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          <div className="j0-panel-content">

            {/* ── Hints tab ────────────────────────────────── */}
            {rightTab === "hints" && (
              <div className="j0-hints-panel">
                <div className="j0-hints-intro">
                  <Lightbulb size={18} style={{ color: "#f59e0b" }} />
                  <div>
                    <div className="j0-hints-title">Need a hint?</div>
                    <div className="j0-hints-sub">Reveal hints one at a time. Try solving with as few as possible!</div>
                  </div>
                </div>

                <div className="j0-hints-list">
                  {hints.map((h, i) => (
                    <div key={i} className={`j0-hint-card${i < hintsRevealed ? " revealed" : ""}`}>
                      <div className="j0-hint-header" onClick={() => { if (i <= hintsRevealed) setHintsRevealed(Math.max(hintsRevealed, i + 1)); }}>
                        <div className="j0-hint-num">
                          {i < hintsRevealed ? <Lightbulb size={13} style={{ color: "#f59e0b" }} /> : <Lock size={13} />}
                          <span>Hint {i + 1}</span>
                        </div>
                        {i >= hintsRevealed
                          ? <span className="j0-hint-reveal-btn">{i === hintsRevealed ? "Reveal" : "Locked"}</span>
                          : <ChevronDown size={13} style={{ color: "var(--j0-text3)" }} />
                        }
                      </div>
                      {i < hintsRevealed && <div className="j0-hint-body">{h}</div>}
                    </div>
                  ))}
                </div>

                {hints.length === 0 && (
                  <div className="j0-empty-state"><Lightbulb size={28} style={{ opacity: .3 }} /><p>No hints for this problem.</p></div>
                )}

                {/* Full solution reveal */}
                <div className="j0-solution-section">
                  <div className="j0-solution-header">
                    <Trophy size={16} style={{ color: "#f59e0b" }} />
                    <span>Full Solution</span>
                  </div>
                  {!solutionShown ? (
                    <button className="j0-show-solution-btn" onClick={() => setSolutionShown(true)}>
                      <Eye size={14} /> Reveal Solution
                    </button>
                  ) : (
                    <div className="j0-solution-block">
                      <div className="j0-solution-toolbar">
                        <span className="j0-solution-lang">{language.name}</span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="j0-icon-btn" style={{ height: 26, width: 26 }} onClick={() => { setCode(solution); setRightTab("output"); }}>
                            <Code2 size={12} />
                          </button>
                          <button className="j0-icon-btn" style={{ height: 26, width: 26 }} onClick={() => setSolutionShown(false)}>
                            <EyeOff size={12} />
                          </button>
                        </div>
                      </div>
                      <pre className="j0-solution-code">{solution}</pre>
                      <button className="j0-copy-solution-btn" onClick={() => { setCode(solution); setRightTab("output"); }}>
                        <Play size={13} /> Load into Editor
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Output tab ───────────────────────────────── */}
            {rightTab === "output" && (
              <div className="j0-output-wrap">
                {!output && (
                  <div className="j0-empty-state">
                    <Play size={28} style={{ opacity: .3 }} />
                    <p>Click <strong>Run</strong> to execute your code.</p>
                  </div>
                )}
                {output && (
                  <>
                    <div className="j0-output-meta">
                      {statusInfo && <span className="j0-meta-status" style={{ color: statusInfo.color }}>● {statusInfo.label}</span>}
                      {output.time   && <span className="j0-meta-item"><Clock size={11} /> {output.time}s</span>}
                      {output.memory && <span className="j0-meta-item"><Cpu   size={11} /> {(output.memory/1024).toFixed(1)} MB</span>}
                    </div>
                    {running && <div className="j0-running-indicator"><Loader2 size={14} className="j0-spin" /><span>{output.status?.description}</span></div>}
                    {output.stdout && <div className="j0-output-block"><div className="j0-output-block-label success"><CheckCircle size={11} /> stdout</div><pre className="j0-output-pre">{output.stdout}</pre></div>}
                    {output.stderr && <div className="j0-output-block"><div className="j0-output-block-label error"><AlertCircle size={11} /> stderr</div><pre className="j0-output-pre error">{output.stderr}</pre></div>}
                    {output.compileOutput && <div className="j0-output-block"><div className="j0-output-block-label warn"><AlertCircle size={11} /> Compile</div><pre className="j0-output-pre warn">{output.compileOutput}</pre></div>}
                  </>
                )}
              </div>
            )}

            {/* ── Settings tab ─────────────────────────────── */}
            {rightTab === "settings" && (
              <div className="j0-settings">
                <div className="j0-setting-row">
                  <label className="j0-setting-label">Font Size</label>
                  <div className="j0-setting-control">
                    <button className="j0-step-btn" onClick={() => setFontSize(f => Math.max(10,f-1))}>−</button>
                    <span className="j0-setting-val">{fontSize}px</span>
                    <button className="j0-step-btn" onClick={() => setFontSize(f => Math.min(22,f+1))}>+</button>
                  </div>
                </div>
                <div className="j0-setting-row">
                  <label className="j0-setting-label">Tab Size</label>
                  <div className="j0-setting-control">
                    {[2,4,8].map(n => <button key={n} className={`j0-tab-size-btn${tabSize===n?" active":""}`} onClick={() => setTabSize(n)}>{n}</button>)}
                  </div>
                </div>
                <div className="j0-setting-row">
                  <label className="j0-setting-label">Theme</label>
                  <button className="j0-tab-size-btn active" onClick={() => setTheme(t => t==="dark"?"light":"dark")}>
                    {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
