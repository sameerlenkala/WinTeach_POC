// SO-07 Milestone view (Day view now lives inside Phase View per v1.2)
function ScreenDashboard() {
  const { route, go, state, setState, openModal, tweaks } = useApp();
  const sid = route.params?.sid;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return <div className="viewport"><div className="viewport-inner">Session not found.</div></div>;

  const dl = WUTIL.daysLeft(s.targetDate);
  const expired = s.status === "expired";
  const milestoneVariant = tweaks?.milestoneVariant || "phases-cards";

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Dashboard"]}
        right={
          <div className="row gap-2">
            <span className="chip"><Icons.Layers size={11}/>&nbsp;Milestone view</span>
            <button className="btn btn-sm" onClick={() => go("slog:phase", { sid, phase: s.activePhase })}>
              <Icons.ArrowL/> Back to active phase
            </button>
            <button className="btn btn-sm" onClick={() => openModal({ kind: "mark-complete", sid })}>Mark complete</button>
          </div>
        }
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <SessionHeader s={s} expired={expired} dl={dl}/>

          {expired && (
            <div className="banner danger mt-4">
              <Icons.Clock size={14}/>
              <span>SO-21 · Target date passed. Day View tasks paused until you extend.</span>
              <div className="row gap-2" style={{marginLeft:"auto"}}>
                <button className="btn btn-sm" onClick={() => openModal({ kind: "mark-complete", sid })}>Mark complete</button>
                <button className="btn btn-sm btn-primary" onClick={() => openModal({ kind: "extend", sid })}>Extend date</button>
              </div>
            </div>
          )}

          {dl <= 3 && dl >= 0 && !expired && (
            <div className="banner warn mt-4">
              <Icons.Flame size={14}/>
              <span>US-8.4 · Your interview is in {dl} day{dl===1?"":"s"}. Jump into Final Over for mock simulations.</span>
              <button className="btn btn-sm" style={{marginLeft:"auto"}}
                      onClick={() => go("slog:phase", { sid, phase: "final-over" })}>Open Final Over</button>
            </div>
          )}

          <div className="mt-6"></div>

          <MilestoneView s={s} variant={milestoneVariant}/>
        </div>
      </div>
    </>
  );
}

function SessionHeader({ s, expired, dl }) {
  const foDisplay = (window.FO && FO.isComplete(s)) ? 1 : 0;
  const overall = (s.phases.powerplay.progress * 0.4 + s.phases.acceleration.progress * 0.35 + foDisplay * 0.25);
  return (
    <div className="row between gap-4 wrap">
      <div className="col" style={{gap: 8}}>
        <div className="row gap-2">
          <UI.PhaseChip phase={s.activePhase}/>
          <span className="chip chip-outline">{s.company || "No company"}</span>
          <span className="chip"><Icons.Calendar size={11}/>&nbsp;{WUTIL.fmtDate(s.targetDate)}</span>
        </div>
        <h1 style={{margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em"}}>{s.role}</h1>
        <div className="muted" style={{fontSize: 13}}>
          {expired ? `${Math.abs(dl)} days past target` : `${dl} days to interview · ${s.rounds.length} rounds confirmed`}
        </div>
      </div>
      <div className="row gap-6 wrap">
        <Stat label="Overall" value={`${WUTIL.pct(overall)}%`} sub="across phases" />
        <Stat label="Foundation" value={`${WUTIL.pct(avg(Object.values(s.foundation).map(f => f.progress)))}%`} sub="user-level" />
        <Stat label="Streak" value="7d" sub="active days" />
      </div>
    </div>
  );
}

function avg(xs) { return xs.length ? xs.reduce((a,b) => a+b, 0) / xs.length : 0; }

function Stat({ label, value, sub }) {
  return (
    <div className="col" style={{gap: 2}}>
      <div className="label">{label}</div>
      <div className="mono" style={{fontSize: 22, letterSpacing: "-0.02em"}}>{value}</div>
      <div className="dim" style={{fontSize: 11}}>{sub}</div>
    </div>
  );
}

// ───────── Milestone View (with variants) ─────────
function MilestoneView({ s, variant }) {
  return (
    <>
      <div className="row between" style={{marginBottom: 12}}>
        <div className="label">SO-07 · Milestone view</div>
        <div className="row gap-2">
          <span className="muted" style={{fontSize: 12}}>Layout</span>
          <VariantSwitcher/>
        </div>
      </div>
      {variant === "phases-cards" && <MilestoneCards s={s}/>}
      {variant === "phases-timeline" && <MilestoneTimeline s={s}/>}
      {variant === "phases-rings" && <MilestoneRings s={s}/>}
    </>
  );
}

function VariantSwitcher() {
  const { tweaks, setTweak } = useApp();
  return (
    <div className="segmented">
      {["phases-cards","phases-timeline","phases-rings"].map(v => (
        <button key={v} className={tweaks.milestoneVariant === v ? "active" : ""}
                onClick={() => setTweak("milestoneVariant", v)}>
          {v === "phases-cards" ? "Cards" : v === "phases-timeline" ? "Timeline" : "Rings"}
        </button>
      ))}
    </div>
  );
}

// Variant A — Phase cards with cluster breakdowns
function MilestoneCards({ s }) {
  const { go } = useApp();
  const foDisplay = (window.FO && FO.isComplete(s)) ? 1 : 0;
  const phaseList = [
    { key: "powerplay", phase: "powerplay", data: { ...s.phases.powerplay }, blurb: "Build foundations across all clusters. Diagnostic quiz → skill tree → topic depth." },
    { key: "acceleration", phase: "acceleration", data: { ...s.phases.acceleration }, blurb: "Round-specific drills, WinSpeak technical, behavioural prep, and resume gap resolution." },
    { key: "final-over", phase: "final-over", data: { ...s.phases.finalOver, progress: foDisplay }, blurb: "Simulate, review, lock. Mock Assessment (if OA) + Mock Interview + Resume Review. Completion-gated 0% → 100%." },
  ];
  return (
    <div className="col gap-3">
      {phaseList.map(p => {
        const tone = WUTIL.phaseTone(p.phase);
        const active = s.activePhase === p.phase;
        const skipped = p.data.skipped;
        return (
          <div key={p.key} className={`card card-hover ${skipped ? "" : ""}`}
               style={{cursor: skipped ? "default" : "pointer", padding: 0, opacity: skipped ? 0.55 : 1}}
               onClick={() => !skipped && go("slog:phase", { sid: s.id, phase: p.phase })}>
            <div className={`phase-strip ${tone}`} style={{borderRadius: "12px 12px 0 0", border: 0, borderBottom: "1px solid var(--line-1)"}}>
              <div className="row gap-4">
                <UI.PhaseChip phase={p.phase}/>
                {active && <span className="chip chip-accent"><span className="chip-dot"></span>Active</span>}
                {skipped && <span className="chip">Skipped · {p.phase === "powerplay" ? "window < 15 days" : "Final Over only"}</span>}
              </div>
              <div className="row gap-6">
                <span className="mono dim" style={{fontSize: 12}}>
                  {skipped ? "Not generated" : `Day ${p.data.start} – ${p.data.end}`}
                </span>
                <span className="mono" style={{fontSize: 22}}>{WUTIL.pct(p.data.progress)}%</span>
              </div>
            </div>
            <div style={{padding: "16px 22px"}}>
              <div className="muted" style={{fontSize: 13, maxWidth: "70ch"}}>{p.blurb}</div>
              <div className={`progress thick ${tone} mt-3`}><span style={{width: WUTIL.pct(p.data.progress) + "%"}}></span></div>

              <div className="row gap-2 wrap mt-4">
                {p.phase === "powerplay" && (
                  <>
                    <ClusterChip label="DSA" v={s.foundation.dsa.progress}/>
                    <ClusterChip label="DBMS" v={s.foundation.dbms.progress}/>
                    <ClusterChip label="OS" v={s.foundation.os.progress}/>
                    <ClusterChip label="Networking" v={s.foundation.networking.progress}/>
                    <ClusterChip label="System Design" v={s.foundation.systemDesign.progress}/>
                  </>
                )}
                {p.phase === "acceleration" && (
                  <>
                    <ClusterChip label="Interview Prep · Technical" v={s.interviewPrep.technical}/>
                    <ClusterChip label="Interview Prep · Behavioural" v={s.interviewPrep.behavioural}/>
                    <ClusterChip label={`Resume (${s.resume.gaps.filter(g => g.status === "resolved").length}/${s.resume.gaps.length} gaps)`} v={s.resume.gaps.length ? s.resume.gaps.filter(g => g.status === "resolved").length / s.resume.gaps.length : 0}/>
                  </>
                )}
                {p.phase === "final-over" && (
                  <>
                    {window.FO && FO.hasOA(s) && (
                      <ClusterChip label="Mock Assessment" v={s.finalOver?.mockAssessment?.complete ? 1 : 0}/>
                    )}
                    <ClusterChip label="Mock Interview" v={s.finalOver?.mockInterview?.runCount ? 1 : 0}/>
                    <ClusterChip label="Resume Review" v={s.resume.uploaded ? 1 : 0}/>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ClusterChip({ label, v }) {
  return (
    <div className="chip" style={{padding: "6px 12px", gap: 10, background: "var(--surface-2)", border: "1px solid var(--line-1)"}}>
      <span style={{fontFamily: "var(--font-sans)", color: "var(--ink-1)"}}>{label}</span>
      <span className="mono dim" style={{fontSize: 10}}>{WUTIL.pct(v)}%</span>
    </div>
  );
}

// Variant B — Linear timeline
function MilestoneTimeline({ s }) {
  const { go } = useApp();
  const total = s.phases.finalOver.end || 30;
  const foDisplay = (window.FO && FO.isComplete(s)) ? 1 : 0;
  const phases = [
    { key: "powerplay", data: s.phases.powerplay, tone: "var(--powerplay)", deep: "var(--powerplay-deep)", tint: "var(--powerplay-tint)" },
    { key: "acceleration", data: s.phases.acceleration, tone: "var(--acceleration)", deep: "var(--acceleration-deep)", tint: "var(--acceleration-tint)" },
    { key: "final-over", data: { ...s.phases.finalOver, progress: foDisplay }, tone: "var(--final-over)", deep: "var(--final-over-deep)", tint: "var(--final-over-tint)" },
  ];
  const cursorDay = Math.min(total, Math.max(1, total - WUTIL.daysLeft(s.targetDate) + 1));

  return (
    <div className="card card-pad">
      <div className="row between">
        <div>
          <div className="h-3">Plan window</div>
          <div className="muted" style={{fontSize: 12.5}}>Day 1 → Day {total} · {WUTIL.fmtDate(s.targetDate)}</div>
        </div>
        <div className="mono dim" style={{fontSize: 12}}>Today: Day {cursorDay}</div>
      </div>

      <div style={{position: "relative", marginTop: 28, height: 88}}>
        {/* Track */}
        <div style={{position: "absolute", left: 0, right: 0, top: 18, height: 36, borderRadius: 8, background: "var(--surface-3)"}}></div>

        {phases.map(p => {
          if (p.data.skipped) return null;
          const left = ((p.data.start - 1) / total) * 100;
          const width = ((p.data.end - p.data.start + 1) / total) * 100;
          const active = s.activePhase === p.key;
          return (
            <div key={p.key} style={{position: "absolute", left: left + "%", top: 18, width: width + "%", height: 36}}>
              <div onClick={() => go("slog:phase", { sid: s.id, phase: p.key })}
                   style={{
                position: "absolute", inset: 0, borderRadius: 8,
                background: p.tint, border: `1px solid ${p.tone}`,
                cursor: "pointer", overflow: "hidden",
                boxShadow: active ? "0 0 0 3px var(--accent-tint)" : "none",
              }}>
                <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: WUTIL.pct(p.data.progress) + "%", background: p.tone, opacity: .6}}></div>
                <div style={{position: "relative", padding: "8px 12px", display: "flex", justifyContent: "space-between", color: p.deep, fontSize: 12, fontWeight: 500}}>
                  <span>{p.key === "powerplay" ? "Powerplay" : p.key === "acceleration" ? "Acceleration" : "Final Over"}</span>
                  <span className="mono">{WUTIL.pct(p.data.progress)}%</span>
                </div>
              </div>
              <div className="mono dim" style={{position: "absolute", top: 42, left: 0, fontSize: 11}}>D{p.data.start}</div>
              <div className="mono dim" style={{position: "absolute", top: 42, right: 0, fontSize: 11}}>D{p.data.end}</div>
            </div>
          );
        })}

        {/* Today marker */}
        <div style={{position: "absolute", left: ((cursorDay - 1) / total) * 100 + "%", top: 0, bottom: 8, width: 1, background: "var(--ink-1)"}}>
          <div style={{position: "absolute", top: -8, left: -22, fontSize: 10, color: "var(--ink-1)", fontFamily: "var(--font-mono)"}}>TODAY</div>
        </div>
      </div>

      <div className="divider mt-6"></div>
      <div className="row gap-6 wrap mt-6">
        {phases.map(p => p.data.skipped ? null : (
          <div key={p.key} className="col gap-1" style={{flex: "1 1 200px"}}>
            <UI.PhaseChip phase={p.key}/>
            <div className="muted mt-2" style={{fontSize: 12.5}}>
              {p.key === "powerplay" && "DSA · DBMS · OS · Networking · System Design"}
              {p.key === "acceleration" && "Round drills · WinSpeak · Resume gaps"}
              {p.key === "final-over" && "Full mocks · Company simulations"}
            </div>
            <button className="btn btn-sm mt-2" onClick={() => go("slog:phase", { sid: s.id, phase: p.key })}>Open phase</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Variant C — Rings + cluster grid
function MilestoneRings({ s }) {
  const { go } = useApp();
  const foDisplay = (window.FO && FO.isComplete(s)) ? 1 : 0;
  const phases = [
    { key: "powerplay", color: "var(--powerplay)", val: s.phases.powerplay.progress, range: `D${s.phases.powerplay.start}–${s.phases.powerplay.end}`, skipped: s.phases.powerplay.skipped },
    { key: "acceleration", color: "var(--acceleration)", val: s.phases.acceleration.progress, range: `D${s.phases.acceleration.start}–${s.phases.acceleration.end}`, skipped: s.phases.acceleration.skipped },
    { key: "final-over", color: "var(--final-over)", val: foDisplay, range: `D${s.phases.finalOver.start}–${s.phases.finalOver.end}` },
  ];
  return (
    <div className="col gap-3">
      <div className="card card-pad">
        <div className="row gap-6 wrap" style={{justifyContent:"center"}}>
          {phases.map(p => (
            <button key={p.key}
                    onClick={() => !p.skipped && go("slog:phase", { sid: s.id, phase: p.key })}
                    disabled={p.skipped}
                    style={{background:"transparent", border:0, cursor: p.skipped ? "default" : "pointer", padding: 12, opacity: p.skipped ? .4 : 1, color: "inherit"}}>
              <Ring value={p.val} color={p.color} size={120}/>
              <div className="mt-3" style={{textAlign: "center"}}>
                <UI.PhaseChip phase={p.key}/>
                <div className="mono dim mt-2" style={{fontSize: 11}}>{p.skipped ? "Skipped" : p.range}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Foundation grid */}
      <div className="card card-pad">
        <div className="row between">
          <div className="h-3">Foundation · user-level</div>
          <span className="muted" style={{fontSize: 12}}>Shared across all your active sessions</span>
        </div>
        <div className="row gap-3 wrap mt-4">
          {[
            ["DSA","dsa"],["DBMS","dbms"],["OS","os"],["Networking","networking"],["System Design","systemDesign"]
          ].map(([label, key]) => (
            <button key={key} className="card card-hover" style={{flex: "1 1 180px", padding: 14, textAlign: "left", background: "var(--surface-2)", cursor: "pointer", border: "1px solid var(--line-1)"}}
                    onClick={() => go("slog:cluster", { sid: s.id, cluster: key })}>
              <div className="row between">
                <span className="h-3" style={{fontSize: 14}}>{label}</span>
                <span className="mono dim" style={{fontSize: 12}}>{WUTIL.pct(s.foundation[key].progress)}%</span>
              </div>
              <div className="progress mt-3"><span style={{width: WUTIL.pct(s.foundation[key].progress) + "%"}}></span></div>
              <div className="mono dim mt-2" style={{fontSize: 11}}>Last: {s.foundation[key].lastActive}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Ring({ value, color, size = 100, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value);
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--surface-3)" strokeWidth={stroke} fill="none"/>
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
              strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
              transform={`rotate(-90 ${size/2} ${size/2})`}
              style={{transition: "stroke-dashoffset .8s var(--ease)"}}/>
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
            style={{fontFamily: "var(--font-mono)", fontSize: 18, fill: "var(--ink-1)"}}>
        {WUTIL.pct(value)}%
      </text>
    </svg>
  );
}

// ───────── Day View ─────────
function DayView({ s }) {
  const { tweaks, setState, state, showToast, setTweak } = useApp();
  const heatmapPos = tweaks?.heatmapPosition || "bottom";
  const [showViewAll, setShowViewAll] = useState(false);
  const [dismissed, setDismissed] = useState(state.dismissed || []);
  const tasks = WINNIFY.todayTasks.filter(t => !dismissed.includes(t.id));
  const rolled = WINNIFY.rolledOverTasks;
  const dis = [...WINNIFY.dismissedTasks, ...WINNIFY.todayTasks.filter(t => dismissed.includes(t.id))];

  const dismiss = (id) => {
    setDismissed(d => {
      const next = [...d, id];
      setState({ dismissed: next });
      showToast?.("Task dismissed — moved to View all.");
      return next;
    });
  };
  const complete = (id) => {
    setDismissed(d => [...d, id]);
    showToast?.("Task completed.");
  };

  const TasksBlock = (
    <div className="card card-pad">
      <div className="row between">
        <div>
          <div className="h-3">Today · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
          <div className="muted" style={{fontSize: 12.5}}>Top {tasks.length} priorities, re-ranked with {rolled.length} rolled-over task{rolled.length===1?"":"s"}.</div>
        </div>
        <div className="row gap-2">
          <button className="btn btn-sm" onClick={() => setShowViewAll(true)}><Icons.List size={12}/> View all</button>
          <button className="btn btn-sm"><Icons.Refresh size={12}/> Re-rank</button>
        </div>
      </div>

      <div className="col gap-2 mt-4">
        {tasks.map((t, i) => <TaskRow key={t.id} t={t} i={i+1} onDismiss={() => dismiss(t.id)} onComplete={() => complete(t.id)}/>)}
        {tasks.length === 0 && (
          <div className="card card-pad" style={{background: "var(--success-tint)", borderColor: "transparent", textAlign: "center"}}>
            <Icons.Check size={20}/>
            <div className="h-3 mt-2">All caught up for today.</div>
            <div className="muted mt-1" style={{fontSize: 12.5}}>New tasks generated overnight.</div>
          </div>
        )}
      </div>

      {rolled.length > 0 && (
        <div className="mt-6">
          <div className="label" style={{marginBottom: 8}}>Rolled over · {rolled.length}</div>
          <div className="col gap-2">
            {rolled.slice(0, 2).map(t => <TaskRow key={t.id} t={t} rolled/>)}
          </div>
        </div>
      )}
    </div>
  );

  const HeatmapBlock = (
    <div className="card card-pad">
      <div className="row between">
        <div>
          <div className="h-3">Activity heatmap</div>
          <div className="muted" style={{fontSize: 12.5}}>Past 20 days × intensity per task slot</div>
        </div>
        <div className="row gap-2" style={{fontSize: 11}}>
          <span className="dim">Less</span>
          <div className="heatcell" style={{width: 12, height: 12}}></div>
          <div className="heatcell h1" style={{width: 12, height: 12}}></div>
          <div className="heatcell h2" style={{width: 12, height: 12}}></div>
          <div className="heatcell h3" style={{width: 12, height: 12}}></div>
          <div className="heatcell h4" style={{width: 12, height: 12}}></div>
          <span className="dim">More</span>
        </div>
      </div>
      <div className="heatmap mt-4">
        {s.heatmap.map((v, i) => (
          <div key={i} className={`heatcell ${v === 1 ? "h1" : v === 2 ? "h2" : v === 3 ? "h3" : v === 4 ? "h4" : ""}`} title={`D${Math.floor(i/7)+1}`}></div>
        ))}
      </div>
      <div className="row between mt-3">
        <span className="mono dim" style={{fontSize: 11}}>20 days ago</span>
        <span className="mono dim" style={{fontSize: 11}}>Today</span>
      </div>
    </div>
  );

  return (
    <>
      <div className="row between" style={{marginBottom: 12}}>
        <div className="label">SO-08 · Day view (hybrid)</div>
        <div className="row gap-2">
          <span className="muted" style={{fontSize: 12}}>Layout</span>
          <div className="segmented">
            <button className={heatmapPos === "bottom" ? "active" : ""} onClick={() => setTweak("heatmapPosition", "bottom")}>Tasks · Heatmap</button>
            <button className={heatmapPos === "top" ? "active" : ""} onClick={() => setTweak("heatmapPosition", "top")}>Heatmap · Tasks</button>
          </div>
        </div>
      </div>

      <div className="col gap-4">
        {heatmapPos === "top" ? HeatmapBlock : TasksBlock}
        {heatmapPos === "top" ? TasksBlock : HeatmapBlock}
      </div>

      <UI.Modal open={showViewAll} onClose={() => setShowViewAll(false)} size="modal-lg">
        <div className="modal-head">
          <div className="label">View all · Day view</div>
          <h2 className="h-2 mt-2">Today, rolled over and dismissed</h2>
        </div>
        <div className="modal-pad" style={{paddingTop: 0}}>
          <div className="col gap-4">
            {[
              { title: "Today (active)", items: tasks },
              { title: "Rolled over", items: rolled },
              { title: "Dismissed", items: dis },
            ].map(group => (
              <div key={group.title}>
                <div className="label">{group.title} · {group.items.length}</div>
                <div className="col gap-2 mt-2">
                  {group.items.length === 0 && <div className="muted" style={{fontSize: 12.5}}>None.</div>}
                  {group.items.map(t => <TaskRow key={t.id} t={t} compact/>)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-primary" onClick={() => setShowViewAll(false)}>Done</button>
        </div>
      </UI.Modal>
    </>
  );
}

function TaskRow({ t, i, onDismiss, onComplete, rolled, compact }) {
  return (
    <div className="row between gap-3"
         style={{padding: compact ? "8px 10px" : "12px 14px", borderRadius: 8, border: "1px solid var(--line-1)", background: rolled ? "var(--surface-2)" : "var(--surface)"}}>
      <div className="row gap-3" style={{flex: 1, minWidth: 0}}>
        {i && <span className="mono dim" style={{fontSize: 11, width: 18}}>#{i}</span>}
        {!compact && <button className="btn btn-sm btn-ghost" onClick={onComplete} title="Mark done">
          <span style={{width: 16, height: 16, border: "1.5px solid var(--ink-3)", borderRadius: 999, display: "inline-block"}}></span>
        </button>}
        <div className="col" style={{gap: 2, minWidth: 0}}>
          <div style={{fontSize: 13.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{t.title}</div>
          <div className="row gap-2">
            <span className="mono dim" style={{fontSize: 11}}>{t.meta}</span>
            <span className="dim" style={{fontSize: 11}}>· {t.est}</span>
          </div>
        </div>
      </div>
      {!compact && (
        <div className="row gap-2">
          <span className={`chip ${t.cluster === "DSA" ? "chip-power" : t.cluster === "Interview" ? "chip-accel" : "chip-outline"}`}>{t.cluster}</span>
          {!rolled && <button className="btn btn-sm btn-ghost" onClick={onDismiss}>Dismiss</button>}
        </div>
      )}
    </div>
  );
}

window.ScreenDashboard = ScreenDashboard;
window.DayView = DayView;
window.SessionHeader = SessionHeader;
