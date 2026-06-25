// Placeholder screens for other sidebar destinations + Tweaks panel

function ScreenPlaceholder({ title, icon, blurb }) {
  return (
    <>
      <UI.Topbar crumbs={[title]} />
      <div className="viewport">
        <div className="viewport-inner fade-in" style={{maxWidth: 720, padding: "64px 32px"}}>
          <div className="row gap-3">
            <div style={{width: 44, height: 44, borderRadius: 10, background: "var(--surface-3)", display: "grid", placeItems: "center"}}>{icon}</div>
            <div>
              <div className="label">Winnify module</div>
              <h1 style={{margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em"}}>{title}</h1>
            </div>
          </div>
          <p className="muted mt-4" style={{fontSize: 13.5, maxWidth: "55ch"}}>{blurb}</p>
          <div className="card card-pad mt-6" style={{background: "var(--surface-2)"}}>
            <div className="row gap-3">
              <Icons.Info size={16}/>
              <div>
                <strong>Outside this prototype.</strong>{" "}
                <span className="muted">This is a Slog Overs prototype — other Winnify modules are stubbed. Use the sidebar to return to Slog Overs.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ScreenHome() {
  const { go, state } = useApp();
  const sessions = state.sessions;
  return (
    <>
      <UI.Topbar crumbs={["Home"]}/>
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="label">Today</div>
          <h1 className="h-display mt-2" style={{fontSize: 36}}>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, Sameer.</h1>
          <p className="muted mt-2">{sessions.filter(s => s.status === "active").length} active Slog Overs · 4 tasks due today.</p>

          <div className="row gap-3 wrap mt-6">
            <button className="card card-hover" style={{flex: "1 1 280px", padding: 22, textAlign: "left", cursor: "pointer"}}
                    onClick={() => sessions[0] && go("slog:phase", { sid: sessions[0].id, phase: sessions[0].activePhase })}>
              <div className="label">Continue · Day view</div>
              <div className="h-3 mt-2">Today's tasks ({sessions[0]?.role})</div>
              <div className="muted mt-2" style={{fontSize: 12.5}}>Top 4 priorities re-ranked overnight.</div>
              <div className="row gap-2 mt-3"><span className="chip chip-power">DSA</span><span className="chip chip-accel">Interview Prep</span></div>
            </button>
            <button className="card card-hover" style={{flex: "1 1 280px", padding: 22, textAlign: "left", cursor: "pointer"}}
                    onClick={() => go("slog:list")}>
              <div className="label">Slog Overs</div>
              <div className="h-3 mt-2">All sessions</div>
              <div className="muted mt-2" style={{fontSize: 12.5}}>{sessions.length} total · {sessions.filter(s=>s.status==="active").length} active · {sessions.filter(s=>s.status==="expired").length} expired.</div>
            </button>
            <button className="card card-hover" style={{flex: "1 1 280px", padding: 22, textAlign: "left", cursor: "pointer"}}
                    onClick={() => go("slog:setup-1")}>
              <div className="label">New</div>
              <div className="h-3 mt-2">Start a new Slog Over</div>
              <div className="muted mt-2" style={{fontSize: 12.5}}>3 quick screens. AI generates a phase plan from your timeline.</div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Tweaks panel — uses the protocol described in the system prompt (manual implementation)
function TweaksPanel() {
  const { tweaks, setTweak, state, setState } = useApp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e?.data?.type === "__activate_edit_mode") setOpen(true);
      if (e?.data?.type === "__deactivate_edit_mode") setOpen(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  const close = () => {
    setOpen(false);
    window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
  };

  if (!open) return null;
  return (
    <div style={{
      position: "fixed", right: 16, bottom: 16, width: 300,
      background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line-1)",
      boxShadow: "var(--shadow-pop)", zIndex: 80, padding: 16,
      fontSize: 13,
    }}>
      <div className="row between" style={{marginBottom: 12}}>
        <div className="label">Tweaks</div>
        <button className="btn btn-sm btn-ghost" onClick={close}><Icons.Close size={12}/></button>
      </div>

      <Section label="Milestone view layout">
        <Seg value={tweaks.milestoneVariant} onChange={v => setTweak("milestoneVariant", v)}
             options={[["phases-cards","Cards"],["phases-timeline","Timeline"],["phases-rings","Rings"]]}/>
      </Section>

      <Section label="Skill tree layout">
        <Seg value={tweaks.skillTreeVariant} onChange={v => setTweak("skillTreeVariant", v)}
             options={[["branching","Branching"],["radial","Radial"],["linear","Linear"]]}/>
      </Section>

      <Section label="Day view layout">
        <Seg value={tweaks.heatmapPosition} onChange={v => setTweak("heatmapPosition", v)}
             options={[["bottom","Tasks · Heatmap"],["top","Heatmap · Tasks"]]}/>
      </Section>

      <Section label="Demo state">
        <div className="col gap-2">
          <button className="btn btn-sm" onClick={() => setState({ offline: !state.offline })}>
            {state.offline ? "Disable" : "Simulate"} offline mode
          </button>
          <button className="btn btn-sm" onClick={() => setState({ firstVisit: true, sessions: [] })}>
            Reset to first-time visit
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{padding: "10px 0", borderTop: "1px solid var(--line-1)"}}>
      <div className="label" style={{marginBottom: 6}}>{label}</div>
      {children}
    </div>
  );
}

function Seg({ value, onChange, options }) {
  return (
    <div className="segmented" style={{width: "100%"}}>
      {options.map(([v, lbl]) => (
        <button key={v} className={value === v ? "active" : ""} onClick={() => onChange(v)} style={{flex: 1, fontSize: 11.5}}>{lbl}</button>
      ))}
    </div>
  );
}

window.ScreenPlaceholder = ScreenPlaceholder;
window.ScreenHome = ScreenHome;
window.TweaksPanel = TweaksPanel;
