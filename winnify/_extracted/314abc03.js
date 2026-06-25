// SO-03 / SO-04 / SO-05 setup wizard + SO-06 generating + SO-23 duplicate warning
function SetupShell({ step, children, draft, setDraft, onBack, onNext, nextLabel = "Next", nextDisabled = false, error = "" }) {
  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", "New session", ["Role & Timeline","Placement Rounds","Plan Preview"][step-1]]}
        right={<span className="mono dim" style={{fontSize: 12}}>Step {step} / 3</span>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in" style={{maxWidth: 880, paddingTop: 32}}>
          <div className="row gap-2" style={{marginBottom: 28}}>
            {[1,2,3].map(n => (
              <div key={n} className="row gap-2" style={{flex:1}}>
                <div className="row gap-2" style={{alignItems:"center", flex: 1}}>
                  <span className="mono" style={{
                    width: 20, height: 20, borderRadius: 999, display: "grid", placeItems: "center",
                    background: n <= step ? "var(--ink-1)" : "var(--surface-3)",
                    color: n <= step ? "var(--paper)" : "var(--ink-3)",
                    fontSize: 11, fontWeight: 600
                  }}>{n < step ? "✓" : n}</span>
                  <span style={{
                    fontSize: 12.5, color: n === step ? "var(--ink-1)" : "var(--ink-3)",
                    fontWeight: n === step ? 500 : 400
                  }}>{["Role & Timeline","Placement Rounds","Plan Preview"][n-1]}</span>
                  {n < 3 && <div style={{flex:1, height: 1, background: n < step ? "var(--ink-2)" : "var(--line-2)"}}></div>}
                </div>
              </div>
            ))}
          </div>

          {children}

          {error && (
            <div className="banner danger mt-6">
              <Icons.Info size={16}/> {error}
            </div>
          )}
          <div className="row between mt-8" style={{borderTop:"1px solid var(--line-1)", paddingTop: 18}}>
            <button className="btn" onClick={onBack}>
              <Icons.ChevronL/> {step === 1 ? "Cancel" : "Back"}
            </button>
            <div className="row gap-3">
              <span className="muted" style={{fontSize: 12}}>No drafts are saved during setup.</span>
              <button className="btn btn-primary" onClick={onNext} disabled={nextDisabled}>
                {nextLabel} <Icons.ArrowR/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// SO-03
function ScreenSetup1() {
  const { go, state, route, setState, openModal } = useApp();
  const seed = route.params?.presetRole;
  const [role, setRole] = useState(state.draft?.role || seed || "");
  const [company, setCompany] = useState(state.draft?.company || "");
  const [date, setDate] = useState(state.draft?.targetDate || "");
  const [showRoleList, setShowRoleList] = useState(false);
  const [showCompanyList, setShowCompanyList] = useState(false);
  const [error, setError] = useState("");

  const minDate = (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().slice(0,10); })();
  const today = new Date(); today.setHours(0,0,0,0);
  const dl = date ? Math.round((new Date(date) - today)/86400000) : null;

  const roleOpts = WINNIFY.roleLibrary.filter(r => r.toLowerCase().includes(role.toLowerCase()) && r !== role);
  const compOpts = WINNIFY.companies.filter(c => c.toLowerCase().includes(company.toLowerCase()) && c !== company);
  const companyKnown = WINNIFY.companies.some(c => c.toLowerCase() === company.toLowerCase());

  const onNext = () => {
    if (!role) return setError("Role is required.");
    if (!date) return setError("Target interview date is required.");
    if (dl < 3) return setError("Too close to drive — Slog Overs unavailable. Pick a date at least 3 days away.");
    // SO-23 duplicate
    const dup = state.sessions.find(s => s.status === "active" && s.role.toLowerCase() === role.toLowerCase());
    setState({ draft: { role, company, targetDate: new Date(date).toISOString() } });
    if (dup) {
      openModal({ kind: "duplicate", role, onContinue: () => go("slog:setup-2") });
    } else {
      go("slog:setup-2");
    }
  };

  return (
    <SetupShell
      step={1}
      onBack={() => go("slog:list")}
      onNext={onNext}
      error={error}
      nextDisabled={!role || !date}
    >
      <div className="label">SO-03 · Role & timeline</div>
      <h1 className="h-display mt-2" style={{fontSize: 36}}>What are you preparing for?</h1>
      <p className="muted mt-2" style={{maxWidth: "62ch"}}>
        Pick the role from the Winnify Role Library, an optional company, and a target interview date. We'll shape the plan from there.
      </p>

      <div className="col gap-4 mt-6" style={{maxWidth: 640}}>
        <div className="field" style={{position: "relative"}}>
          <label>Target role <span style={{color: "var(--danger)"}}>*</span></label>
          <input className="input" value={role} placeholder="e.g. Full Stack Developer"
                 onChange={(e) => { setRole(e.target.value); setShowRoleList(true); }}
                 onFocus={() => setShowRoleList(true)}
                 onBlur={() => setTimeout(() => setShowRoleList(false), 150)} />
          {showRoleList && roleOpts.length > 0 && (
            <div className="card" style={{position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, zIndex: 10, maxHeight: 220, overflow: "auto"}}>
              {roleOpts.slice(0, 8).map(r => (
                <button key={r} className="nav" style={{display: "block", width: "100%", textAlign: "left", padding: "10px 14px", border: 0, background: "transparent", fontSize: 13.5, cursor: "pointer"}}
                        onMouseDown={() => { setRole(r); setShowRoleList(false); }}>
                  {r}
                </button>
              ))}
            </div>
          )}
          <div className="hint">From the Winnify Role Library — your plan template is built from this.</div>
        </div>

        <div className="row gap-4">
          <div className="field" style={{flex: 1}}>
            <label>Target interview date <span style={{color: "var(--danger)"}}>*</span></label>
            <input type="date" className="input" min={minDate} value={date} onChange={(e) => setDate(e.target.value)}/>
            <div className="hint">{dl !== null && dl >= 3
              ? `${dl} days from today — ${planShapeForDays(dl)}`
              : dl !== null && dl < 3 ? "Below the 3-day minimum."
              : "Minimum 3 days from today."}
            </div>
            {dl !== null && dl >= 3 && dl < 10 && (
              <div className="hint" style={{color: "var(--warn)", marginTop: 6}}>
                <Icons.Info size={12}/>&nbsp;With this timeline, you'll go straight into Final Over simulation mode. No Powerplay or Acceleration phases.
              </div>
            )}
          </div>
          <div className="field" style={{flex: 1, position: "relative"}}>
            <label>Company <span className="dim">(optional)</span></label>
            <input className="input" value={company} placeholder="e.g. Winnify"
                   onChange={(e) => { setCompany(e.target.value); setShowCompanyList(true); }}
                   onFocus={() => setShowCompanyList(true)}
                   onBlur={() => setTimeout(() => setShowCompanyList(false), 150)} />
            {showCompanyList && compOpts.length > 0 && (
              <div className="card" style={{position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, zIndex: 10, maxHeight: 220, overflow: "auto"}}>
                {compOpts.slice(0, 8).map(c => (
                  <button key={c} className="nav" style={{display: "block", width: "100%", textAlign: "left", padding: "10px 14px", border: 0, background: "transparent", fontSize: 13.5, cursor: "pointer"}}
                          onMouseDown={() => { setCompany(c); setShowCompanyList(false); }}>
                    {c}
                  </button>
                ))}
              </div>
            )}
            <div className="hint">{company && !companyKnown
              ? <span className="row gap-1" style={{color: "var(--warn)"}}><Icons.Info size={12}/> Company not in our list — we'll use a generic role plan.</span>
              : company && companyKnown ? "Company-specific topic weighting will be applied." : "We'll tune the plan to this company if it's in our list."}
            </div>
          </div>
        </div>

        <div className="row gap-2 mt-2">
          <span className="label" style={{paddingRight: 8}}>Popular</span>
          {WINNIFY.popularRoles.map(r => (
            <button key={r} className="chip chip-outline" style={{cursor: "pointer"}}
                    onClick={() => setRole(r)}>{r}</button>
          ))}
        </div>
      </div>
    </SetupShell>
  );
}

function planShapeForDays(n) {
  if (n > 30) return "Powerplay-heavy plan — full depth.";
  if (n >= 10) return "All 3 phases — Powerplay shortened.";
  if (n >= 3)  return "Final Over only — straight into simulation.";
  return "Below minimum.";
}

// SO-04 — Placement Rounds (v2.0)
function ScreenSetup2() {
  const { go, state, setState } = useApp();
  const draft = state.draft || {};
  const seed = WINNIFY.defaultRounds[draft.role] || [
    { id: "r1", name: "DSA Round", kind: "Technical" },
    { id: "r2", name: "System Design", kind: "Technical" },
    { id: "r3", name: "Hiring Manager", kind: "Behavioural" },
  ];
  const [rounds, setRounds] = useState(state.draft?.rounds || seed);
  const [oaSubType, setOaSubType] = useState(state.draft?.oaSubType || null);
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [error, setError] = useState("");

  const hasOA = rounds.some(r => r.kind === "OA");

  const rename = (id, name) => setRounds(r => r.map(x => x.id === id ? { ...x, name } : x));
  const remove = (id) => setRounds(r => r.filter(x => x.id !== id));
  const add = (kind) => setRounds(r => [...r, {
    id: "rn" + Date.now(),
    name: kind === "Technical" ? "New Technical Round" :
          kind === "Behavioural" ? "New Behavioural Round" :
          kind === "OA" ? "Online Assessment" : "Group Discussion",
    kind
  }]);

  const onNext = () => {
    if (rounds.length < 1) return setError("Add at least one round to continue.");
    if (hasOA && !oaSubType) return setError("Pick an OA sub-type — Mock Assessment content is driven by this.");
    setState({ draft: { ...draft, rounds, oaSubType: hasOA ? oaSubType : null } });
    go("slog:setup-3");
  };

  return (
    <SetupShell step={2} onBack={() => go("slog:setup-1")} onNext={onNext} error={error} nextDisabled={rounds.length < 1 || (hasOA && !oaSubType)}>
      <div className="label">SO-04 · Placement rounds</div>
      <h1 className="h-display mt-2" style={{fontSize: 36}}>Confirm your placement rounds.</h1>
      <p className="muted mt-2" style={{maxWidth: "62ch"}}>
        AI-suggested rounds for <strong>{draft.role}</strong>. Rename or remove any, and add custom rounds if your process is different.
      </p>
      <div className="banner info mt-4" style={{maxWidth: 640}}>
        <Icons.Spark size={14}/> Your prep plan will be shaped by these rounds — Interview Prep in WinSpeak maps directly to each.
      </div>

      <div className="card mt-6" style={{maxWidth: 640}}>
        {rounds.map((r, i) => (
          <div key={r.id} style={{borderBottom: i < rounds.length-1 || (r.kind === "OA" && oaSubType !== undefined) ? "1px solid var(--line-1)" : 0}}>
            <div className="row between gap-3" style={{padding: "12px 16px"}}>
              <div className="row gap-3" style={{flex: 1, minWidth: 0}}>
                <span className="mono dim" style={{fontSize: 11, width: 22}}>R{i+1}</span>
                {editing === r.id ? (
                  <input className="input" autoFocus value={editVal}
                         onChange={(e) => setEditVal(e.target.value)}
                         onBlur={() => { rename(r.id, editVal || r.name); setEditing(null); }}
                         onKeyDown={(e) => { if (e.key === "Enter") { rename(r.id, editVal || r.name); setEditing(null); } }} />
                ) : (
                  <span style={{fontSize: 14}}>{r.name}</span>
                )}
                <span className={`chip ${r.kind === "Technical" ? "chip-power" : r.kind === "Behavioural" ? "chip-accel" : r.kind === "GD" ? "chip-final" : ""}`}>
                  {r.kind}
                </span>
              </div>
              <div className="row gap-1">
                <button className="btn btn-sm btn-ghost" onClick={() => { setEditing(r.id); setEditVal(r.name); }}><Icons.Edit size={14}/></button>
                <button className="btn btn-sm btn-ghost" onClick={() => remove(r.id)}><Icons.Trash size={14}/></button>
              </div>
            </div>
            {/* v2.0 — inline OA sub-type expander */}
            {r.kind === "OA" && (
              <div style={{padding: "12px 16px 16px 56px", background: "var(--surface-2)", borderTop: "1px dashed var(--line-2)"}}>
                <div className="row between" style={{marginBottom: 8}}>
                  <div className="label" style={{fontSize: 11}}>
                    What type of online assessment will you face? <span style={{color:"var(--danger)"}}>*</span>
                  </div>
                  <span className="muted" style={{fontSize: 11}} title="This determines what your Mock Assessment will simulate in Final Over">
                    <Icons.Info size={11}/>&nbsp;Mock Assessment driver
                  </span>
                </div>
                <div className="row gap-2 wrap">
                  {[
                    ["aptitude_only", "Aptitude Only", "MCQs across quant, verbal, logical"],
                    ["technical_only", "Technical Only", "Role-driven technical MCQs"],
                    ["both", "Both", "Aptitude → Technical (two sections)"],
                  ].map(([v, t, sub]) => (
                    <label key={v} className="card card-hover" style={{
                      flex: "1 1 180px", padding: "10px 12px", cursor: "pointer",
                      border: `1.5px solid ${oaSubType === v ? "var(--accent)" : "var(--line-2)"}`,
                      background: oaSubType === v ? "var(--accent-tint)" : "var(--surface)",
                    }}>
                      <div className="row gap-2" style={{alignItems: "center"}}>
                        <input type="radio" name="oaSubType" checked={oaSubType === v} onChange={() => setOaSubType(v)}/>
                        <strong style={{fontSize: 12.5}}>{t}</strong>
                      </div>
                      <div className="muted" style={{fontSize: 11, marginTop: 4}}>{sub}</div>
                    </label>
                  ))}
                </div>
                {!oaSubType && <div className="hint" style={{color: "var(--warn)", marginTop: 8}}>
                  <Icons.Info size={11}/>&nbsp;Required — no default assumed. Stored as <code>oaSubType</code>.
                </div>}
              </div>
            )}
          </div>
        ))}
        <div className="row gap-2" style={{padding: 12, background: "var(--surface-2)", borderTop: "1px solid var(--line-1)"}}>
          {!hasOA && <button className="btn btn-sm" onClick={() => add("OA")}><Icons.Plus size={14}/> OA</button>}
          <button className="btn btn-sm" onClick={() => add("Technical")}><Icons.Plus size={14}/> Technical</button>
          <button className="btn btn-sm" onClick={() => add("Behavioural")}><Icons.Plus size={14}/> Behavioural</button>
          <button className="btn btn-sm" onClick={() => add("GD")}><Icons.Plus size={14}/> Group Discussion</button>
        </div>
      </div>
    </SetupShell>
  );
}

// SO-05 — Plan Preview + Starting Phase selector (v2.0)
function ScreenSetup3() {
  const { go, state, setState } = useApp();
  const draft = state.draft;
  if (!draft?.role || !draft?.targetDate) {
    return <div className="viewport"><div className="viewport-inner"><div className="banner danger">Draft missing — restart from Step 1.</div></div></div>;
  }
  const dl = WUTIL.daysLeft(draft.targetDate);
  const plan = generatePlanShape(dl);
  const hasGD = draft.rounds?.some(r => r.kind === "GD");

  // AI-recommended starting phase based on the generated plan
  const aiPhase =
    plan.phases.includes("powerplay") ? "powerplay" :
    plan.phases.includes("acceleration") ? "acceleration" : "final-over";

  const [startingPhase, setStartingPhase] = useState(draft.startingPhase || aiPhase);
  const [showConflict, setShowConflict] = useState(false);
  const [pendingPhase, setPendingPhase] = useState(null);

  const eligiblePhases = ["powerplay","acceleration","final-over"].filter(p => {
    if (p === "powerplay" && !plan.phases.includes("powerplay")) return false;
    if (p === "acceleration" && !plan.phases.includes("acceleration")) return false;
    return true;
  });

  const onPickPhase = (p) => {
    if (p !== aiPhase) {
      setPendingPhase(p);
      setShowConflict(true);
    } else {
      setStartingPhase(p);
    }
  };

  const onGenerate = () => {
    setState({ generating: true });
    setTimeout(() => {
      const newSession = {
        id: "s" + Date.now(),
        role: draft.role,
        company: draft.company,
        targetDate: draft.targetDate,
        createdAt: new Date().toISOString(),
        status: "active",
        activePhase: startingPhase,
        startingPhase,
        aiRecommendedPhase: aiPhase,
        rounds: draft.rounds,
        oaSubType: draft.oaSubType || null,
        phases: plan.phaseData,
        foundation: {
          dsa: { progress: 0, lastActive: "—" },
          dbms: { progress: 0, lastActive: "—" },
          os: { progress: 0, lastActive: "—" },
          networking: { progress: 0, lastActive: "—" },
          systemDesign: { progress: 0, lastActive: "—" },
        },
        interviewPrep: { technical: 0, behavioural: 0 },
        resume: { uploaded: false, gaps: [] },
        heatmap: new Array(140).fill(0),
        finalOver: {
          cuesViewed: false,
          quickTipsViewed: false,
          mockAssessment: { complete: false, score: null, lastRunAt: null, aptitudeScore: null, technicalScore: null },
          mockInterview:  { runCount: 0, completedRounds: [], lastRoundIndex: 0, lastRunAt: null, lastDebrief: null, roundScores: {} },
          gdSimulation:   { complete: false, runCount: 0, lastDebrief: null, lastRunAt: null },
        },
        acceleration: { checked: [], lastTriageScore: null, listOrderVersion: 0,
                        technicalProgress: 0, behavioralProgress: 0, aptitudeProgress: 0,
                        flags: [], adHocCompleted: [] },
      };
      setState({
        sessions: [newSession, ...state.sessions],
        draft: null,
        generating: false,
      });
      go("slog:phase", { sid: newSession.id, phase: newSession.activePhase });
    }, 2200);
  };

  return (
    <SetupShell step={3} onBack={() => go("slog:setup-2")} onNext={onGenerate} nextLabel="Start my Slog Over">
      <div className="label">SO-05 · Plan preview</div>
      <h1 className="h-display mt-2" style={{fontSize: 36}}>Your plan, ready to commit.</h1>
      <p className="muted mt-2" style={{maxWidth: "62ch"}}>
        Review before generating. You can switch phases manually later — Foundation progress carries forward, no recalculation.
      </p>

      <div className="card mt-6" style={{padding: 22}}>
        <div className="row gap-6 wrap">
          <div className="col gap-2">
            <div className="label">Role</div>
            <div className="h-3">{draft.role}</div>
          </div>
          <div className="col gap-2">
            <div className="label">Company</div>
            <div className="h-3">{draft.company || <span className="dim">None</span>}</div>
          </div>
          <div className="col gap-2">
            <div className="label">Days remaining</div>
            <div className="h-3 mono">{dl}</div>
          </div>
          <div className="col gap-2">
            <div className="label">Target date</div>
            <div className="h-3 mono">{WUTIL.fmtDate(draft.targetDate)}</div>
          </div>
          {draft.oaSubType && (
            <div className="col gap-2">
              <div className="label">OA sub-type</div>
              <div className="h-3" style={{textTransform: "capitalize"}}>{draft.oaSubType.replace("_"," ")}</div>
            </div>
          )}
        </div>

        <div className="divider mt-6"></div>

        <div className="label mt-6">Phase breakdown</div>
        <div className="row gap-3 mt-3 wrap">
          {["powerplay","acceleration","finalOver"].map(k => {
            const phase = plan.phaseData[k];
            const tone = k === "powerplay" ? "power" : k === "acceleration" ? "accel" : "final";
            const skipped = phase.skipped;
            return (
              <div key={k} className={`card card-pad tint-${tone}`} style={{flex: "1 1 220px", opacity: skipped ? .5 : 1}}>
                <div className="row between">
                  <UI.PhaseChip phase={k === "finalOver" ? "final-over" : k}/>
                  {skipped && <span className="chip">Skipped</span>}
                </div>
                <div className="h-3 mt-3">{WUTIL.phaseLabel(k === "finalOver" ? "final-over" : k)}</div>
                <div className="mono dim mt-2" style={{fontSize: 12}}>
                  {skipped ? "Not generated" : `Day ${phase.start} – ${phase.end}`}
                </div>
                <div className="muted mt-3" style={{fontSize: 12.5}}>
                  {k === "powerplay" && "Build foundations · DSA · DBMS · OS · Networking · System Design · Aptitude"}
                  {k === "acceleration" && "Technical topics · Behavioral cluster · Aptitude practice"}
                  {k === "finalOver" && "Mocks · GD sim · Resume review"}
                </div>
              </div>
            );
          })}
        </div>

        {/* v2.0 — Starting phase selector */}
        <div className="divider mt-6"></div>
        <div className="row between mt-6">
          <div>
            <div className="label">Starting phase</div>
            <div className="muted" style={{fontSize: 12.5, maxWidth: "55ch"}}>
              AI recommends <strong>{WUTIL.phaseLabel(aiPhase)}</strong>. You can override — we'll warn you if you skip ahead.
            </div>
          </div>
          <span className="chip chip-accent">
            <Icons.Sparkle size={11}/>&nbsp;AI rec: {WUTIL.phaseLabel(aiPhase)}
          </span>
        </div>
        <div className="row gap-3 mt-3 wrap">
          {eligiblePhases.map(p => {
            const selected = startingPhase === p;
            const isAI = p === aiPhase;
            const tone = WUTIL.phaseTone(p);
            return (
              <button key={p} onClick={() => onPickPhase(p)}
                style={{
                  flex: "1 1 200px", textAlign: "left", padding: "14px 16px",
                  border: `1.5px solid ${selected ? "var(--accent)" : "var(--line-2)"}`,
                  borderRadius: 12,
                  background: selected ? "var(--accent-tint)" : "var(--surface)",
                  cursor: "pointer", color: "inherit", fontFamily: "inherit",
                }}>
                <div className="row between" style={{alignItems: "center"}}>
                  <UI.PhaseChip phase={p}/>
                  {isAI && <span className="chip chip-accent" style={{padding: "2px 8px", fontSize: 10}}>AI rec</span>}
                  {selected && !isAI && <span className="chip chip-warn" style={{padding: "2px 8px", fontSize: 10}}>Override</span>}
                </div>
                <div style={{fontSize: 12.5, marginTop: 8, color: "var(--ink-2)"}}>
                  {p === "powerplay" && "Start with foundations. Best for >30-day windows."}
                  {p === "acceleration" && "Skip foundations. Best for warm-entry students or 10–30 days."}
                  {p === "final-over" && "Straight to simulation. Best for <10 days or returning students."}
                </div>
              </button>
            );
          })}
        </div>

        <div className="divider mt-6"></div>

        <div className="row gap-6 wrap mt-6">
          <div className="col gap-2" style={{flex: 1, minWidth: 240}}>
            <div className="label">Foundation clusters (Powerplay)</div>
            <div className="row gap-2 wrap">
              {["DSA","DBMS","OS","Networking","System Design"].map(c => (
                <span key={c} className="chip">{c}</span>
              ))}
              {draft.rounds?.some(r => r.kind === "OA") && (
                <span className="chip chip-power"><Icons.Brain size={11}/>&nbsp;Aptitude (OA)</span>
              )}
            </div>
          </div>
          <div className="col gap-2" style={{flex: 1, minWidth: 240}}>
            <div className="label">Confirmed rounds</div>
            <div className="row gap-2 wrap">
              {draft.rounds.map(r => <span key={r.id} className="chip chip-outline">{r.name}</span>)}
            </div>
          </div>
          <div className="col gap-2" style={{flex: 1, minWidth: 240}}>
            <div className="label">Final Over activities</div>
            <div className="row gap-2 wrap">
              {draft.rounds?.some(r => r.kind === "OA") && <span className="chip">Mock Assessment</span>}
              <span className="chip">Mock Interview</span>
              {hasGD ? <span className="chip chip-final">GD Simulation</span> : <span className="chip chip-outline dim">GD Sim · N/A</span>}
              <span className="chip"><Icons.File size={11}/>&nbsp;Resume Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conflict warning modal (v2.0) */}
      <UI.Modal open={showConflict} onClose={() => setShowConflict(false)}>
        <div className="modal-head">
          <div className="label">SO-05 · Starting phase override</div>
          <h2 className="h-2 mt-2">You're starting in {pendingPhase ? WUTIL.phaseLabel(pendingPhase) : ""}, not {WUTIL.phaseLabel(aiPhase)}</h2>
        </div>
        <div className="modal-pad" style={{paddingTop: 0}}>
          <div className="card card-pad" style={{background: "var(--warn-tint)", border: "1px solid #f5c89a"}}>
            <div className="row gap-3">
              <Icons.Info size={16}/>
              <div className="col gap-1">
                <strong style={{fontSize: 13.5}}>This deviates from the AI recommendation.</strong>
                <span className="muted" style={{fontSize: 12.5}}>
                  Based on your {dl}-day window, AI suggested starting in <strong>{WUTIL.phaseLabel(aiPhase)}</strong>. Earlier phases may still be reachable later — they're never locked.
                </span>
              </div>
            </div>
          </div>
          <div className="muted mt-3" style={{fontSize: 12.5, lineHeight: 1.6}}>
            Foundation progress carries forward across phases. If you start in {pendingPhase ? WUTIL.phaseLabel(pendingPhase) : ""} and later return to {WUTIL.phaseLabel(aiPhase)}, your work isn't lost.
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={() => setShowConflict(false)}>Keep {WUTIL.phaseLabel(aiPhase)}</button>
          <button className="btn btn-danger" onClick={() => { setStartingPhase(pendingPhase); setShowConflict(false); }}>
            Start in {pendingPhase ? WUTIL.phaseLabel(pendingPhase) : ""} anyway
          </button>
        </div>
      </UI.Modal>
    </SetupShell>
  );
}

function generatePlanShape(days) {
  if (days >= 30) {
    return {
      phases: ["powerplay","acceleration","finalOver"],
      phaseData: {
        powerplay: { start: 1, end: Math.round(days*0.5), progress: 0 },
        acceleration: { start: Math.round(days*0.5)+1, end: Math.round(days*0.83), progress: 0 },
        finalOver: { start: Math.round(days*0.83)+1, end: days, progress: 0 },
      }
    };
  }
  if (days >= 10) {
    // v2.0 — all 3 phases, Powerplay shortened
    return {
      phases: ["powerplay","acceleration","finalOver"],
      phaseData: {
        powerplay: { start: 1, end: Math.round(days*0.30), progress: 0 },
        acceleration: { start: Math.round(days*0.30)+1, end: Math.round(days*0.80), progress: 0 },
        finalOver: { start: Math.round(days*0.80)+1, end: days, progress: 0 },
      }
    };
  }
  // v2.0 — < 10 days: Final Over only (was 7 in v1.3)
  return {
    phases: ["finalOver"],
    phaseData: {
      powerplay: { start: 0, end: 0, progress: 0, skipped: true },
      acceleration: { start: 0, end: 0, progress: 0, skipped: true },
      finalOver: { start: 1, end: days, progress: 0 },
    }
  };
}

// SO-06 generating interstitial — rendered via overlay in App
function GeneratingOverlay() {
  const [step, setStep] = useState(0);
  const steps = [
    "Reading role & company signals",
    "Mapping rounds to clusters",
    "Computing Powerplay → Final Over windows",
    "Tagging Focus Topics in the Skill Tree",
    "Seeding Day View priorities",
  ];
  useEffect(() => {
    const id = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 380);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="modal-scrim" style={{background: "var(--paper)", backdropFilter:"none"}}>
      <div style={{textAlign: "center", maxWidth: 480}}>
        <div className="label">SO-06 · Generating</div>
        <div className="h-display mt-3" style={{fontSize: 32}}>Building your plan.</div>
        <div className="muted mt-2">Personalising phases, clusters and daily priorities.</div>
        <div className="card mt-6" style={{padding: 24, textAlign: "left"}}>
          {steps.map((s, i) => (
            <div key={i} className="row gap-3" style={{padding: "6px 0", opacity: i <= step ? 1 : 0.4}}>
              <span className="mono" style={{
                width: 18, height: 18, borderRadius: 999, display: "grid", placeItems: "center",
                background: i < step ? "var(--success)" : i === step ? "var(--ink-1)" : "var(--surface-3)",
                color: i <= step ? "var(--paper)" : "var(--ink-4)",
                fontSize: 10,
              }}>{i < step ? "✓" : i === step ? "…" : i+1}</span>
              <span style={{fontSize: 13.5}}>{s}</span>
            </div>
          ))}
        </div>
        <div className="muted mono mt-4" style={{fontSize: 11}}>This usually takes 3–6 seconds.</div>
      </div>
    </div>
  );
}

window.ScreenSetup1 = ScreenSetup1;
window.ScreenSetup2 = ScreenSetup2;
window.ScreenSetup3 = ScreenSetup3;
window.GeneratingOverlay = GeneratingOverlay;
