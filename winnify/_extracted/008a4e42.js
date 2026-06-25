// Shared UI primitives used everywhere
const { useState, useEffect, useMemo, useRef, useCallback, useContext, createContext } = React;

// ───────────────────────────────────────────────────────────────────────────
// App state context
// ───────────────────────────────────────────────────────────────────────────
const AppCtx = createContext(null);
window.AppCtx = AppCtx;

function useApp() { return useContext(AppCtx); }
window.useApp = useApp;

// ───────────────────────────────────────────────────────────────────────────
// Sidebar
// ───────────────────────────────────────────────────────────────────────────
function Sidebar() {
  const { route, go, user } = useApp();
  const active = route.screen.split(":")[0];
  const item = (key, label, ico) => (
    <button className={active === key || (key === "slog" && route.screen.startsWith("slog")) ? "active" : ""}
            onClick={() => go(key === "slog" ? "slog:list" : key)}>
      <span className="nav-ico">{ico}</span>
      <span>{label}</span>
    </button>
  );
  return (
    <aside className="sidebar">
      <div className="brand" style={{padding: '10px 10px 18px', gap: 0}}>
        <img src="data:image/png;base64,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" alt="Winnify" style={{height: 54, width: 'auto', objectFit: 'contain'}} />
        <div className="ws" style={{marginLeft: 'auto'}}>v2.4</div>
      </div>
      <div className="nav-section">Workspace</div>
      <nav className="nav col" style={{gap: 2}}>
        {item("home", "Home", <Icons.Home/>)}
        {item("slog", "Slog Overs", <Icons.Target/>)}
        {item("winspeak", "WinSpeak", <Icons.Mic/>)}
        {item("foundation", "Foundation", <Icons.Book/>)}
        {item("library", "Role Library", <Icons.Folder/>)}
      </nav>
      <div className="nav-section">Active sessions</div>
      <nav className="nav col" style={{gap: 2}}>
        {WINNIFY.sessions.filter(s => s.status === "active").map(s => (
          <button key={s.id} className={route.screen.startsWith("slog:") && route.params?.sid === s.id ? "active" : ""}
                  onClick={() => go("slog:phase", { sid: s.id, phase: s.activePhase })}>
            <span className={`nav-ico chip-dot`} style={{
              background: s.activePhase === "powerplay" ? "var(--powerplay)" :
                          s.activePhase === "acceleration" ? "var(--acceleration)" : "var(--final-over)"
            }}></span>
            <span style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
              {s.role}
            </span>
          </button>
        ))}
      </nav>
      <div className="sidebar-spacer"></div>
      <div className="user-card">
        <div className="user-avatar">{user.initials}</div>
        <div className="col" style={{gap: 0}}>
          <div className="user-name">{user.name}</div>
          <div className="user-meta">B.Tech · CSE · Year 4</div>
        </div>
      </div>
    </aside>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Topbar (breadcrumbs)
// ───────────────────────────────────────────────────────────────────────────
function Topbar({ crumbs = [], right = null }) {
  return (
    <div className="topbar">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            <span className={i === crumbs.length - 1 ? "here" : ""}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="right">
        {right}
        <button className="btn btn-ghost btn-sm" title="Search"><Icons.Search/></button>
        <button className="btn btn-ghost btn-sm" title="Notifications"><Icons.Bell/></button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Modal
// ───────────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, children, size = "" }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={"modal " + size}>
        {children}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Toast
// ───────────────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  return <div className="toast"><Icons.Check size={14}/> {msg}</div>;
}

// ───────────────────────────────────────────────────────────────────────────
// Generic chips/cards used everywhere
// ───────────────────────────────────────────────────────────────────────────
function PhaseChip({ phase }) {
  const lbl = WUTIL.phaseLabel(phase);
  const cls = "chip chip-" + (phase === "powerplay" ? "power" : phase === "acceleration" ? "accel" : "final");
  return <span className={cls}><span className="chip-dot"></span>{lbl}</span>;
}

function Pct({ value, tone = "" }) {
  return (
    <div className="row gap-2" style={{flex:1}}>
      <div className={`progress thick ${tone}`} style={{flex:1}}><span style={{width: WUTIL.pct(value) + "%"}}></span></div>
      <span className="mono dim" style={{fontSize: 11, minWidth: 32, textAlign: "right"}}>{WUTIL.pct(value)}%</span>
    </div>
  );
}

// Image placeholder (striped) — used for content cards in cluster previews
function Placeholder({ label = "preview", h = 120 }) {
  return (
    <div style={{
      height: h, borderRadius: 8,
      background: "repeating-linear-gradient(45deg, var(--surface-3), var(--surface-3) 8px, var(--surface-2) 8px, var(--surface-2) 16px)",
      display: "grid", placeItems: "center",
      color: "var(--ink-4)",
      fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".05em",
    }}>{label}</div>
  );
}

window.UI = { Modal, Toast, Topbar, Sidebar, PhaseChip, Pct, Placeholder };
