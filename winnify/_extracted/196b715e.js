// SO-09 / SO-10 / SO-11 Phase views
// v1.2 — Horizontal Phase Bar (always visible), Browse Mode, Day View toggle inside Active phase.
function ScreenPhase() {
  const { route, go, state, openModal, showToast, setState, tweaks } = useApp();
  const sid = route.params?.sid;
  const phase = route.params?.phase; // "powerplay" | "acceleration" | "final-over"
  const s = state.sessions.find((x) => x.id === sid);
  if (!s) return null;
  const tone = WUTIL.phaseTone(phase);
  const data = phase === "powerplay" ? s.phases.powerplay :
  phase === "acceleration" ? s.phases.acceleration : s.phases.finalOver;
  const displayProgress = phase === "final-over" ? window.FO && FO.isComplete(s) ? 1 : 0 : data.progress;
  const isActive = s.activePhase === phase;
  const browseMode = !isActive; // US-3.5 — viewing a non-active phase
  const fcAvg = avg(Object.values(s.foundation).map((f) => f.progress));

  // Day View toggle — only on the active phase per US-3.2
  const [view, setView] = useState("phase"); // "phase" | "day"
  const dayActive = !browseMode && view === "day";

  const doSwitch = () => {
    setState({
      sessions: state.sessions.map((x) => x.id === sid ? { ...x, activePhase: phase } : x)
    });
    showToast(`Active phase switched to ${WUTIL.phaseLabel(phase)}.`);
  };

  const startPhase = (afterConfirm) => {
    // US-4.1 + US-4.2 — show confirm; for Final Over from Powerplay with low FC, route through warning
    const onConfirm = () => { doSwitch(); afterConfirm && afterConfirm(); };
    if (phase === "final-over" && fcAvg < 0.30 && s.activePhase === "powerplay") {
      openModal({ kind: "low-completion", from: s.activePhase, to: phase, sid, fcPct: fcAvg, onConfirm });
    } else {
      openModal({ kind: "start-phase", from: s.activePhase, to: phase, sid, onConfirm });
    }
  };

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, WUTIL.phaseLabel(phase) + (browseMode ? " · browsing" : "")]}
        right={
        <div className="row gap-2">
            {/* Day View toggle is only visible when viewing your own active phase (US-3.2 / 3.5) */}
            {!browseMode &&
          <div className="segmented">
                <button className={view === "phase" ? "active" : ""} onClick={() => setView("phase")}>
                  <Icons.Layers size={12} /> Phase
                </button>
                <button className={view === "day" ? "active" : ""} onClick={() => setView("day")}>
                  <Icons.Calendar size={12} /> Day
                </button>
              </div>
          }
            <button className="btn btn-sm" onClick={() => go("slog:dashboard", { sid })}>
              <Icons.Grid size={12} /> View phases
            </button>
          </div>
        } />
      
      <div className="viewport">
        <div className="viewport-inner fade-in">

          {/* US-3.4 — Horizontal Phase Bar, always at top */}
          <PhaseBar s={s} current={phase} browseMode={browseMode} />

          {/* US-4.3 — Prominent [Start Phase] CTA inside browse mode */}
          {browseMode && !data.skipped &&
          <div className="banner info mt-4" style={{ background: "var(--surface-2)", border: "1px solid var(--line-1)" }}>
              <Icons.Compass size={14} />
              <div className="col" style={{ gap: 2, flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>You're browsing {WUTIL.phaseLabel(phase)}</span>
                <span className="muted" style={{ fontSize: 12 }}>
                  Read-only preview. Your active phase is still <span style={{ fontWeight: 600 }}>{WUTIL.phaseLabel(s.activePhase)}</span>. Day View is hidden here.
                </span>
              </div>
              <button className="btn btn-primary" onClick={startPhase}>
                <Icons.Play size={12} /> Start {WUTIL.phaseLabel(phase).split(" ")[0]} phase
              </button>
            </div>
          }
          {browseMode && data.skipped &&
          <div className="banner mt-4" style={{ background: "var(--surface-2)", border: "1px solid var(--line-1)" }}>
              <Icons.Info size={14} />
              <span><span style={{ fontWeight: 600 }}>{WUTIL.phaseLabel(phase)}</span> was skipped — your prep window was too short to include it.</span>
            </div>
          }

          {/* Body — phase content OR Day View when toggled */}
          {dayActive ?
          <div className="mt-4">{window.DayView ? <DayView s={s} /> : null}</div> :

          <>
                {phase === "powerplay" && <PowerplayBody s={s} browseMode={browseMode} onLockedClick={startPhase} />}
                {phase === "acceleration" && (window.AccelerationBody ?
            <AccelerationBody s={s} browseMode={browseMode} onLockedClick={startPhase} /> :
            null)}
                {phase === "final-over" && <FinalOverBody s={s} browseMode={browseMode} onLockedClick={startPhase} />}
              </>
          }

        </div>
      </div>
    </>);

}

// US-3.4 — Horizontal Phase Bar. 3 segments, always visible, doesn't scroll away.
const PHASE_DESC = {
  "powerplay": "Build foundations. Diagnostic quizzes calibrate the Skill Tree per cluster — Foundation progress is shared across all your active sessions.",
  "acceleration": "High-ROI topics ranked by priority — Foundation + Interview Prep mixed. Compressed, time-adaptive.",
  "final-over": "No new learning. Simulate, review, lock. Completion-gated — 0% until every required activity is done."
};

function PhaseBar({ s, current, browseMode }) {
  const { go } = useApp();
  const items = [
  { key: "powerplay", phase: "powerplay", data: s.phases.powerplay, label: "Powerplay" },
  { key: "acceleration", phase: "acceleration", data: s.phases.acceleration, label: "Acceleration" },
  { key: "final-over", phase: "final-over", data: s.phases.finalOver, label: "Final Over" }];

  const foDisplay = window.FO && FO.isComplete(s) ? 1 : 0;
  return (
    <div className="card" style={{
      padding: 0, border: "1px solid var(--line-1)",
      position: "sticky", top: 0, zIndex: 5,
      background: "var(--surface)"
    }}>
      <div className="row" style={{ gap: 0 }}>
        {items.map((it, i) => {
          const isCurrent = it.phase === current;
          const isActive = s.activePhase === it.phase;
          const skipped = it.data.skipped;
          const tone = WUTIL.phaseTone(it.phase);
          const progress = it.phase === "final-over" ? foDisplay : it.data.progress;
          const indicator = isCurrent ?
          isActive ? "active" : "browsing" :
          null;
          return (
            <button
              key={it.key}
              onClick={() => !skipped && go("slog:phase", { sid: s.id, phase: it.phase })}
              disabled={skipped}
              style={{
                flex: "1 1 0",
                minWidth: 0,
                padding: "12px 16px",
                background: isCurrent ?
                isActive ? "var(--surface-2)" : "var(--surface-3)" :
                "transparent",
                border: 0,
                borderRight: i < items.length - 1 ? "1px solid var(--line-1)" : 0,
                borderBottom: indicator === "active" ? `3px solid var(--${tone === "power" ? "powerplay" : tone === "accel" ? "acceleration" : "final-over"})` : "3px solid transparent",
                borderTop: indicator === "browsing" ? `3px dashed var(--${tone === "power" ? "powerplay" : tone === "accel" ? "acceleration" : "final-over"})` : "3px solid transparent",
                cursor: skipped ? "not-allowed" : "pointer",
                opacity: skipped ? 0.55 : 1,
                textAlign: "left",
                color: "inherit",
                fontFamily: "inherit"
              }}>
              <div className="row between" style={{ alignItems: "center", minWidth: 0 }}>
                <div className="col" style={{ gap: 2, minWidth: 0, flex: 1 }}>
                  <div className="row gap-2" style={{ alignItems: "center", whiteSpace: "nowrap", minWidth: 0 }}>
                    <span className={`chip-dot`} style={{
                      background: isActive ? `var(--${tone === "power" ? "powerplay" : tone === "accel" ? "acceleration" : "final-over"})` : "var(--line-strong)",
                      flex: "0 0 auto"
                    }}></span>
                    <span style={{ fontSize: 13.5, fontWeight: isCurrent ? 500 : 400, color: skipped ? "var(--ink-4)" : "var(--ink-1)", whiteSpace: "nowrap" }}>
                      {it.label}
                    </span>
                    {isActive && !isCurrent && <span className="chip chip-accent" style={{ padding: "2px 8px", fontSize: 10, whiteSpace: "nowrap" }}>Active</span>}
                    {indicator === "browsing" && <span className="chip" style={{ padding: "2px 8px", fontSize: 10, whiteSpace: "nowrap" }}>Browsing</span>}
                    {indicator === "active" && <span className="chip chip-accent" style={{ padding: "2px 8px", fontSize: 10, whiteSpace: "nowrap" }}>Viewing</span>}
                    {skipped && <span className="chip" style={{ padding: "2px 8px", fontSize: 10, whiteSpace: "nowrap" }}>Skipped</span>}
                  </div>
                  <span className="mono dim" style={{ fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {skipped ? "—" : `Day ${it.data.start}–${it.data.end}`} · {WUTIL.pct(progress)}%
                  </span>
                </div>
              </div>
              <div className={`progress ${tone}`} style={{ marginTop: 8, height: 4 }}>
                <span style={{ width: WUTIL.pct(progress) + "%" }}></span>
              </div>
            </button>);

        })}
      </div>
      {PHASE_DESC[current] && (
        <div style={{
          borderTop: "1px solid var(--line-1)",
          padding: "7px 16px",
          fontSize: 12,
          color: "var(--ink-3)",
          lineHeight: 1.5,
          background: "var(--surface-2)"
        }}>
          {PHASE_DESC[current]}
        </div>
      )}
    </div>);

}

function PowerplayBody({ s, browseMode, onLockedClick }) {
  const { go } = useApp();
  const clusters = [
  { key: "dsa", label: "Data Structures & Algorithms", desc: "Arrays, hashing, two-pointers, trees, graphs, DP.", topics: 14 },
  { key: "dbms", label: "DBMS & SQL", desc: "Normalization, transactions, indexing, query plans.", topics: 12 },
  { key: "os", label: "Operating Systems", desc: "Process vs thread, scheduling, memory, deadlocks.", topics: 10 },
  { key: "networking", label: "Networking", desc: "OSI/TCP-IP, HTTP, DNS, congestion control.", topics: 10 },
  { key: "systemDesign", label: "System Design", desc: "Scalability, sharding, caching, queues, CAP.", topics: 8 }];

  // v2.0 — Aptitude cluster card
  const hasOA = window.FO ? FO.hasOA(s) : (s.rounds || []).some(r => r.kind === "OA");
  const apt = WINNIFY.aptitudeClusters;
  const aptAvg = (apt.quant.progress + apt.logical.progress + apt.verbal.progress + apt.di.progress) / 4;

  return (
    <>
      <div className="row between mt-6">
        <div className="h-3">Foundation clusters · {hasOA ? 6 : 5}</div>
        <button className="btn btn-sm" onClick={() => browseMode ? onLockedClick(() => go("slog:adaptive", { sid: s.id })) : go("slog:adaptive", { sid: s.id })}>
          <Icons.Sparkle size={12} /> Foundation Adaptive Practice
        </button>
      </div>
      <div className="row gap-3 wrap mt-3">
        {clusters.map((c) =>
        <button key={c.key} className="card card-hover" style={{ flex: "1 1 280px", padding: 18, textAlign: "left", cursor: "pointer", background: "var(--surface)", border: "1px solid var(--line-1)" }}
        onClick={() => browseMode ? onLockedClick(() => go("slog:cluster", { sid: s.id, cluster: c.key })) : go("slog:cluster", { sid: s.id, cluster: c.key })}>
            <div className="row between">
              <div className="h-3" style={{ fontSize: 15 }}>{c.label}</div>
              <span className="mono dim" style={{ fontSize: 12 }}>{WUTIL.pct(s.foundation[c.key].progress)}%</span>
            </div>
            <div className="muted mt-2" style={{ fontSize: 12.5 }}>{c.desc}</div>
            <div className="progress mt-3"><span style={{ width: WUTIL.pct(s.foundation[c.key].progress) + "%" }}></span></div>
            <div className="row gap-3 mt-3">
              <span className="mono dim" style={{ fontSize: 11 }}>{c.topics} topics</span>
              <span className="mono dim" style={{ fontSize: 11 }}>· Last: {s.foundation[c.key].lastActive}</span>
            </div>
          </button>
        )}

        {/* v2.0 — Aptitude cluster card. Always present, but contributes to progress only when OA confirmed. */}
        <button className="card card-hover" style={{
          flex: "1 1 280px", padding: 18, textAlign: "left", cursor: "pointer",
          background: hasOA ? "var(--surface)" : "var(--surface-2)",
          border: `1px solid ${hasOA ? "var(--accent)" : "var(--line-1)"}`,
          order: hasOA ? 0 : 99,  // bottom of list when no OA
          opacity: hasOA ? 1 : 0.78,
        }} onClick={() => browseMode ? onLockedClick(() => go("slog:aptitude-hub", { sid: s.id })) : go("slog:aptitude-hub", { sid: s.id })}>
          <div className="row between">
            <div className="row gap-2" style={{alignItems: "center"}}>
              <Icons.Brain size={16}/>
              <div className="h-3" style={{ fontSize: 15 }}>Aptitude</div>
              {hasOA && <span className="chip chip-accent" style={{padding: "2px 8px", fontSize: 10}}>Contributes to %</span>}
              {!hasOA && <span className="chip" style={{padding: "2px 8px", fontSize: 10}}>Optional · no OA</span>}
            </div>
            <span className="mono dim" style={{ fontSize: 12 }}>{WUTIL.pct(aptAvg)}%</span>
          </div>
          <div className="muted mt-2" style={{ fontSize: 12.5 }}>
            4 sub-clusters · Quant, Logical, Verbal, Data Interpretation. User-level — shared across sessions.
          </div>
          <div className="progress accent mt-3"><span style={{ width: WUTIL.pct(aptAvg) + "%" }}></span></div>
          <div className="row gap-3 mt-3 wrap">
            {Object.values(apt).map(c => (
              <span key={c.id} className="chip chip-outline" style={{padding: "2px 8px", fontSize: 10}}>
                {c.name.split(" ")[0]} · {WUTIL.pct(c.progress)}%
              </span>
            ))}
          </div>
        </button>
      </div>

      {/* Resume Review — available at any phase */}
      <div className="row between mt-6">
        <div className="h-3" style={{ fontSize: 16 }}>Resume</div>
        <span className="muted" style={{ fontSize: 12.5 }}>Available at any phase</span>
      </div>
      <button className="card card-hover mt-3" style={{ width: "100%", padding: 20, textAlign: "left", cursor: "pointer" }}
        onClick={() => browseMode ? onLockedClick(() => go("slog:resume", { sid: s.id })) : go("slog:resume", { sid: s.id })}>
        <div className="row between">
          <div className="row gap-3">
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--surface-3)", display: "grid", placeItems: "center" }}>
              <Icons.File size={18} />
            </div>
            <div>
              <div className="label">Anytime</div>
              <div className="h-3 mt-1" style={{ fontSize: 16 }}>Resume review</div>
            </div>
          </div>
          {!s.resume.uploaded ?
            <span className="chip chip-warn">Upload required</span> :
            s.resume.gaps.length === 0 ?
            <span className="chip chip-success"><Icons.Check size={11} />&nbsp;0 gaps</span> :
            s.resume.gaps.every((g) => g.status === "resolved") ?
            <span className="chip chip-success"><Icons.Check size={11} />&nbsp;Locked</span> :
            <span className="chip chip-warn">{s.resume.gaps.filter((g) => g.status === "open").length} open</span>}
        </div>
        <div className="muted mt-3" style={{ fontSize: 12.5 }}>
          {!s.resume.uploaded ?
            "Upload your resume to run the AI gap scan. Earlier is better — gaps take time to address." :
            s.resume.gaps.length === 0 ?
            "Scan returned no gaps — you're good to go." :
            `${s.resume.gaps.filter((g) => g.status === "resolved").length}/${s.resume.gaps.length} gaps resolved. Address them before your interview.`}
        </div>
      </button>
      <SiblingClusters s={s} hide="powerplay" />
    </>);

}

function FinalOverBody({ s, browseMode, onLockedClick }) {
  const { go, state, setState, openModal, showToast } = useApp();
  const fo = s.finalOver || {};
  const checklist = FO.requiredList(s);
  const doneCount = checklist.filter((r) => r.done).length;
  const totalCount = checklist.length;
  const isComplete = doneCount === totalCount;
  const hasOA = FO.hasOA(s);
  const hasGD = FO.hasGD(s);
  const cold = FO.isCold(s);
  const knownCompany = FO.companyKnown(s);

  return (
    <>
      {/* Progress bar — full width */}
      <div className="card card-pad mt-6" style={{ padding: "14px 20px" }}>
        <div className="row between">
          <div className="label">Completion</div>
          <span className="mono" style={{ fontSize: 15 }}>{doneCount} / {totalCount}</span>
        </div>
        <div className="progress thick final mt-2"><span style={{ width: (isComplete ? 100 : 0) + "%" }}></span></div>
      </div>

      {/* REQUIRED ACTIVITIES */}
      <div className="h-3 mt-6" style={{ fontSize: 15 }}>Required</div>
      <div className="col gap-3 mt-3">
        {/* Mock Assessment */}
        {hasOA &&
          <button className="card card-hover" style={{ padding: 20, textAlign: "left", cursor: "pointer" }}
            onClick={() => browseMode ? onLockedClick(() => go("slog:mock-assessment", { sid: s.id })) : go("slog:mock-assessment", { sid: s.id })}>
            <div className="row between">
              <div className="row gap-3">
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--final-over-tint, var(--surface-2))", display: "grid", placeItems: "center", color: "var(--final-over-deep, var(--ink-1))" }}>
                  <Icons.Cpu size={17} />
                </div>
                <div>
                  <div className="h-3" style={{ fontSize: 15 }}>{FO.oaRound(s)?.name || "Online Assessment"}</div>
                  <div className="muted mt-1" style={{ fontSize: 12.5 }}>
                    {FO.oaSubType(s) === "both" ? "Aptitude → Technical · ~20 min" :
                     FO.oaSubType(s) === "technical_only" ? "Technical only · ~12 min" :
                     "Aptitude only · ~12 min"}
                    {knownCompany ? <> · <span style={{ fontWeight: 600 }}>{s.company}</span> pattern</> : ""}
                  </div>
                </div>
              </div>
              <div className="row gap-2">
                {fo.mockAssessment?.complete ?
                  <span className="chip chip-success"><Icons.Check size={11} />&nbsp;{fo.mockAssessment.score}%</span> :
                  <span className="chip" style={{ color: "var(--ink-3)", background: "var(--surface-3)", border: "1px solid var(--line-2)" }}>Pending</span>}
                <Icons.ArrowR size={14} color="var(--ink-3)" />
              </div>
            </div>
          </button>
        }

        {/* Mock Interview */}
        <button className="card card-hover" style={{ padding: 20, textAlign: "left", cursor: "pointer" }}
          onClick={() => browseMode ? onLockedClick(() => go("slog:mock", { sid: s.id })) : go("slog:mock", { sid: s.id })}>
          <div className="row between">
            <div className="row gap-3">
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--final-over-tint, var(--surface-2))", display: "grid", placeItems: "center", color: "var(--final-over-deep, var(--ink-1))" }}>
                <Icons.Mic size={17} />
              </div>
              <div>
                <div className="h-3" style={{ fontSize: 15 }}>Mock Interview</div>
                <div className="muted mt-1" style={{ fontSize: 12.5 }}>
                  {FO.simulatableRounds(s).length} round{FO.simulatableRounds(s).length === 1 ? "" : "s"} · pick any order · re-simulate any time
                </div>
              </div>
            </div>
            <div className="row gap-2">
              {fo.mockInterview?.runCount ?
                <span className="chip chip-success"><Icons.Check size={11} />&nbsp;Run #{fo.mockInterview.runCount}</span> :
                (fo.mockInterview?.completedRounds || []).length > 0 ?
                <span className="chip chip-warn">{fo.mockInterview.completedRounds.length}/{FO.simulatableRounds(s).length} rounds</span> :
                <span className="chip" style={{ color: "var(--ink-3)" }}>Pending</span>}
              <Icons.ArrowR size={14} color="var(--ink-3)" />
            </div>
          </div>
          {FO.simulatableRounds(s).length > 0 && (
            <div className="row gap-2 mt-3 wrap">
              {FO.simulatableRounds(s).map((r, i) =>
                <span key={r.id} className={`chip ${r.kind === "Technical" ? "chip-power" : r.kind === "Behavioural" ? "chip-accel" : "chip-outline"}`}>
                  R{i + 1} · {r.name}
                </span>
              )}
            </div>
          )}
        </button>

        {/* GD Simulation */}
        {hasGD && (
          <button className="card card-hover" style={{ padding: 20, textAlign: "left", cursor: "pointer" }}
            onClick={() => browseMode ? onLockedClick(() => go("slog:gd-simulation", { sid: s.id })) : go("slog:gd-simulation", { sid: s.id })}>
            <div className="row between">
              <div className="row gap-3">
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--final-over-tint, var(--surface-2))", display: "grid", placeItems: "center", color: "var(--final-over-deep, var(--ink-1))" }}>
                  <Icons.Layers size={17} />
                </div>
                <div>
                  <div className="h-3" style={{ fontSize: 15 }}>{FO.gdRound(s)?.name || "Group Discussion"}</div>
                  <div className="muted mt-1" style={{ fontSize: 12.5 }}>
                    AI-led · ~15 min{knownCompany ? <> · <span style={{ fontWeight: 600 }}>{s.company}</span>-tuned</> : ""}
                  </div>
                </div>
              </div>
              <div className="row gap-2">
                {fo.gdSimulation?.complete ?
                  <span className="chip chip-success"><Icons.Check size={11} />&nbsp;Complete</span> :
                  <span className="chip" style={{ color: "var(--ink-3)" }}>Pending</span>}
                <Icons.ArrowR size={14} color="var(--ink-3)" />
              </div>
            </div>
          </button>
        )}

        {/* Resume Review */}
        <button className="card card-hover" style={{ padding: 20, textAlign: "left", cursor: "pointer" }}
          onClick={() => browseMode ? onLockedClick(() => go("slog:resume", { sid: s.id })) : go("slog:resume", { sid: s.id })}>
          <div className="row between">
            <div className="row gap-3">
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--final-over-tint, var(--surface-2))", display: "grid", placeItems: "center", color: "var(--final-over-deep, var(--ink-1))" }}>
                <Icons.File size={17} />
              </div>
              <div>
                <div className="h-3" style={{ fontSize: 15 }}>Resume Review</div>
                <div className="muted mt-1" style={{ fontSize: 12.5 }}>
                  {!s.resume.uploaded ?
                    "Upload your resume to clear this gate" :
                    s.resume.gaps.length === 0 ?
                    "No gaps found — cleared automatically" :
                    `${s.resume.gaps.filter((g) => g.status === "resolved").length}/${s.resume.gaps.length} gaps resolved`}
                </div>
              </div>
            </div>
            <div className="row gap-2">
              {!s.resume.uploaded ?
                <span className="chip chip-warn">Upload required</span> :
                s.resume.gaps.length === 0 ?
                <span className="chip chip-success"><Icons.Check size={11} />&nbsp;Cleared</span> :
                s.resume.gaps.every((g) => g.status === "resolved") ?
                <span className="chip chip-success"><Icons.Check size={11} />&nbsp;Locked</span> :
                <span className="chip chip-warn">{s.resume.gaps.filter((g) => g.status === "open").length} open</span>}
              <Icons.ArrowR size={14} color="var(--ink-3)" />
            </div>
          </div>
        </button>
      </div>

      {/* OPTIONAL */}
      <div className="h-3 mt-6" style={{ fontSize: 15 }}>Optional</div>
      <div className="mt-3">
        <button className="card card-hover" style={{ padding: 20, textAlign: "left", cursor: "pointer" }}
          onClick={() => browseMode ? onLockedClick(() => go("slog:adaptive", { sid: s.id })) : go("slog:adaptive", { sid: s.id })}>
          <div className="row between">
            <div className="row gap-3">
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--surface-3)", display: "grid", placeItems: "center" }}>
                <Icons.Sparkle size={17} />
              </div>
              <div>
                <div className="h-3" style={{ fontSize: 15 }}>Foundation Adaptive Practice</div>
                <div className="muted mt-1" style={{ fontSize: 12.5 }}>
                  Weak-topic sprint from Powerplay &amp; Acceleration — 5–10 MCQs per topic. Not gated.
                </div>
              </div>
            </div>
            <div className="row gap-2">
              <span className="chip">Not gated</span>
              <Icons.ArrowR size={14} color="var(--ink-3)" />
            </div>
          </div>
        </button>
      </div>

      {/* Completion CTA */}
      {isComplete &&
        <div className="card card-pad mt-6" style={{ background: "var(--success-tint)", border: "1px solid transparent" }}>
          <div className="row between wrap gap-3">
            <div className="row gap-3">
              <Icons.Trophy size={22} />
              <div>
                <div className="h-3">You're ready.</div>
                <div className="muted mt-1" style={{ fontSize: 12.5 }}>Every required Final Over activity is complete.</div>
              </div>
            </div>
            <button className="btn btn-accent" onClick={() => browseMode ? onLockedClick(() => go("slog:fo-complete", { sid: s.id })) : go("slog:fo-complete", { sid: s.id })}>
              Open completion screen <Icons.ArrowR size={12} />
            </button>
          </div>
        </div>
      }

    </>);

}

function SiblingClusters({ s, hide, inline }) {
  const { go } = useApp();
  const items = [
  { key: "interview", label: "Interview Prep", v: avg([s.interviewPrep.technical, s.interviewPrep.behavioural]) },
  { key: "resume", label: "Resume", v: s.resume.gaps.length ? s.resume.gaps.filter((g) => g.status === "resolved").length / s.resume.gaps.length : 0 }];

  if (inline) {
    return (
      <div className="row gap-3 wrap mt-3">
        {[
        ["DSA", "dsa"], ["DBMS", "dbms"], ["OS", "os"], ["Networking", "networking"], ["System Design", "systemDesign"]].
        map(([label, key]) =>
        <button key={key} onClick={() => go("slog:cluster", { sid: s.id, cluster: key })}
        className="chip chip-outline" style={{ padding: "8px 12px", cursor: "pointer" }}>
            {label} · <span className="dim">{WUTIL.pct(s.foundation[key].progress)}%</span>
          </button>
        )}
      </div>);

  }
  return null;
}

function Mini({ label, v, tone }) {
  return (
    <div className="col gap-1" style={{ flex: 1 }}>
      <div className="row between">
        <span style={{ fontSize: 12 }}>{label}</span>
        <span className="mono dim" style={{ fontSize: 11 }}>{WUTIL.pct(v)}%</span>
      </div>
      <div className={`progress ${tone}`}><span style={{ width: WUTIL.pct(v) + "%" }}></span></div>
    </div>);

}

window.ScreenPhase = ScreenPhase;