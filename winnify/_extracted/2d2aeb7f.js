// SO-01 Sessions list + SO-02 Empty state modal
function ScreenSessionsList() {
  const { go, state, setState } = useApp();
  const sessions = state.sessions;
  const hasActive = sessions.some(s => s.status !== "archived");
  const firstVisit = state.firstVisit && sessions.length === 0;

  const [showEmpty, setShowEmpty] = useState(firstVisit);
  const [showExplainer, setShowExplainer] = useState(false);

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", "Active sessions"]}
        right={
          <button className="btn btn-primary btn-sm" onClick={() => go("slog:setup-1")}>
            <Icons.Plus/> New session
          </button>
        }
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="page-h">
            <div>
              <div className="label">SO-01 · Slog Overs</div>
              <h1>Your prep sessions</h1>
              <div className="sub">A focused, phase-based study plan per role. Foundation progress is shared across sessions; interview prep and resume gaps are per-session.</div>
            </div>
            <div className="actions">
              <button className="btn" onClick={() => setShowExplainer(true)}>
                <Icons.Info/> What is a Slog Over?
              </button>
              <button className="btn btn-accent" onClick={() => go("slog:setup-1")}>
                <Icons.Plus/> New session
              </button>
            </div>
          </div>

          {sessions.length === 0 && (
            <EmptyHero onStart={() => go("slog:setup-1")} onLearn={() => setShowExplainer(true)} />
          )}

          {sessions.length > 0 && (
            <div className="col gap-6">
              <SessionGroup title="Active" rows={sessions.filter(s => s.status === "active")} />
              {sessions.some(s => s.status === "expired") && (
                <SessionGroup title="Expired" rows={sessions.filter(s => s.status === "expired")} />
              )}
              {sessions.some(s => s.status === "archived") && (
                <SessionGroup title="Archived" rows={sessions.filter(s => s.status === "archived")} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* SO-02 Empty State Modal (first-time) */}
      <UI.Modal open={showEmpty} onClose={() => { setShowEmpty(false); setState({ firstVisit: false }); }}>
        <div className="modal-head">
          <div className="label">SO-02 · First visit</div>
          <h2 className="h-2 mt-2">Build a study plan that adapts to your interview window</h2>
          <p className="muted mt-2" style={{fontSize: 13.5}}>
            Pick a target role, company and date. We'll generate a phase-based plan — Powerplay for foundations, Acceleration for round-specific prep, and a Final Over for full mocks.
          </p>
        </div>
        <div className="modal-pad" style={{paddingTop: 0}}>
          <div className="label" style={{marginBottom: 8}}>Popular roles</div>
          <div className="row gap-2 wrap">
            {WINNIFY.popularRoles.map(r => (
              <button key={r} className="chip chip-outline" style={{padding: "6px 12px", cursor: "pointer", fontSize: 12.5}}
                      onClick={() => { setShowEmpty(false); setState({ firstVisit: false }); go("slog:setup-1", { presetRole: r }); }}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <label className="row gap-2" style={{fontSize: 12.5, color: "var(--ink-3)", marginRight: "auto"}}>
            <input type="checkbox" onChange={(e) => setState({ dontShowEmpty: e.target.checked })}/>
            Don't show again
          </label>
          <button className="btn" onClick={() => { setShowEmpty(false); setState({ firstVisit: false }); }}>Maybe later</button>
          <button className="btn btn-primary" onClick={() => { setShowEmpty(false); setState({ firstVisit: false }); go("slog:setup-1"); }}>
            Start Slog Over <Icons.ArrowR/>
          </button>
        </div>
      </UI.Modal>

      {/* Generic explainer */}
      <UI.Modal open={showExplainer} onClose={() => setShowExplainer(false)} size="modal-lg">
        <div className="modal-head">
          <div className="label">About Slog Overs</div>
          <h2 className="h-2 mt-2">A unified, time-aware interview prep loop</h2>
        </div>
        <div className="modal-pad" style={{paddingTop: 0}}>
          <div className="row gap-3 wrap">
            {[
              { t: "Powerplay", s: "Foundations: DSA, DBMS, OS, Networking, System Design.", c: "power" },
              { t: "Acceleration", s: "Compressed, round-specific prep + behavioural drills.", c: "accel" },
              { t: "Final Over", s: "Full mock interviews + company-specific simulations.", c: "final" },
            ].map(x => (
              <div key={x.t} className={`card card-pad tint-${x.c}`} style={{flex:"1 1 200px"}}>
                <div className="label">Phase</div>
                <div className="h-3 mt-2">{x.t}</div>
                <div className="muted mt-2" style={{fontSize: 12.5}}>{x.s}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={() => setShowExplainer(false)}>Close</button>
          <button className="btn btn-primary" onClick={() => { setShowExplainer(false); go("slog:setup-1"); }}>Start a Slog Over</button>
        </div>
      </UI.Modal>
    </>
  );
}

function EmptyHero({ onStart, onLearn }) {
  return (
    <div className="card card-pad fade-in" style={{padding: "48px 40px", marginTop: 8}}>
      <div className="label">SO-02 · Empty state</div>
      <div className="h-display mt-3" style={{maxWidth: "20ch"}}>
        Tell us your role.<br/>
        We'll plan the next {`{X}`} days.
      </div>
      <p className="muted mt-3" style={{maxWidth: "55ch"}}>
        Slog Overs converts your target role, company, interview rounds and remaining days into a structured, adaptive prep plan. Day-by-day tasks; phase-by-phase depth.
      </p>
      <div className="row gap-2 mt-6">
        <button className="btn btn-primary btn-lg" onClick={onStart}><Icons.Plus/> Start your first Slog Over</button>
        <button className="btn btn-lg" onClick={onLearn}>How it works</button>
      </div>
    </div>
  );
}

function SessionGroup({ title, rows }) {
  if (!rows.length) return null;
  return (
    <div>
      <div className="row between" style={{marginBottom: 12}}>
        <div className="label">{title} · {rows.length}</div>
      </div>
      <div className="col gap-3">
        {rows.map(s => <SessionCard key={s.id} s={s} />)}
      </div>
    </div>
  );
}

function SessionCard({ s }) {
  const { go, openModal } = useApp();
  const dl = WUTIL.daysLeft(s.targetDate);
  const expired = s.status === "expired";
  const archived = s.status === "archived";
  const phaseObj = s.phases[s.activePhase === "final-over" ? "finalOver" : s.activePhase];
  // Final Over progress is completion-gated per US-11.19
  const foDisplay = (window.FO && FO.isComplete(s)) ? 1 : 0;
  const overall = (s.phases.powerplay.progress * 0.4 + s.phases.acceleration.progress * 0.35 + foDisplay * 0.25);

  return (
    <div className="card card-hover" style={{padding: 0, cursor: archived ? "default" : "pointer"}}
         onClick={() => !archived && go("slog:phase", { sid: s.id, phase: s.activePhase })}>
      <div style={{padding: "18px 22px"}}>
        <div className="row between gap-4">
          <div className="col" style={{gap: 6, minWidth: 0, flex: 1}}>
            <div className="row gap-2 wrap">
              <UI.PhaseChip phase={s.activePhase}/>
              <span className="chip chip-outline">{s.company || "No company"}</span>
              {expired && <span className="chip chip-danger"><span className="chip-dot"></span>Expired</span>}
              {archived && <span className="chip">Archived</span>}
            </div>
            <div className="row gap-3">
              <div className="h-2" style={{fontSize: 20}}>{s.role}</div>
              <div className="dim mono" style={{fontSize: 12}}>· {WUTIL.fmtDate(s.targetDate)}</div>
            </div>
          </div>
          <div className="col" style={{alignItems: "flex-end", gap: 4}}>
            <div className="mono" style={{fontSize: 11, color: "var(--ink-3)"}}>
              {expired ? "Target passed" : archived ? "Closed" : `${dl} day${dl===1?"":"s"} left`}
            </div>
            <div className="h-2 mono" style={{fontSize: 24, letterSpacing: "-0.02em"}}>
              {WUTIL.pct(overall)}<span style={{fontSize: 14, color: "var(--ink-3)"}}>%</span>
            </div>
          </div>
        </div>

        {/* Phases mini-strip */}
        <div className="row gap-2 mt-4">
          {["powerplay","acceleration","finalOver"].map((k) => {
            const p = s.phases[k];
            const tone = k === "powerplay" ? "power" : k === "acceleration" ? "accel" : "final";
            const isActive = (k === "powerplay" && s.activePhase==="powerplay") || (k==="acceleration" && s.activePhase==="acceleration") || (k==="finalOver" && s.activePhase==="final-over");
            return (
              <div key={k} className="col gap-1" style={{flex: 1, opacity: p.skipped ? .4 : 1}}>
                <div className="row between">
                  <span className="label" style={{textTransform:"none", letterSpacing: 0, color: isActive ? "var(--ink-1)" : "var(--ink-3)", fontFamily: "var(--font-sans)", fontSize: 12}}>
                    {k==="powerplay"?"Powerplay":k==="acceleration"?"Acceleration":"Final Over"} {p.skipped && "(skipped)"}
                  </span>
                  <span className="mono dim" style={{fontSize: 11}}>{WUTIL.pct(k === "finalOver" ? foDisplay : p.progress)}%</span>
                </div>
                <div className={`progress ${tone}`}><span style={{width: WUTIL.pct(k === "finalOver" ? foDisplay : p.progress) + "%"}}></span></div>
              </div>
            );
          })}
        </div>
      </div>
      {expired && (
        <div className="banner danger" style={{borderRadius: 0, border: 0, borderTop: "1px solid var(--line-1)"}}>
          <Icons.Clock size={14}/>
          <span>Target date passed {Math.abs(dl)} day{Math.abs(dl)===1?"":"s"} ago. Plan paused — no new tasks until extended or closed.</span>
          <div className="row gap-2" style={{marginLeft:"auto"}} onClick={(e)=>e.stopPropagation()}>
            <button className="btn btn-sm" onClick={() => openModal({ kind: "mark-complete", sid: s.id })}>Mark complete</button>
            <button className="btn btn-sm btn-primary" onClick={() => openModal({ kind: "extend", sid: s.id })}>Extend date</button>
          </div>
        </div>
      )}
    </div>
  );
}

window.ScreenSessionsList = ScreenSessionsList;
