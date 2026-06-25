// ──────────────────────────────────────────────────────────────────────
// Epic 11 — Final Over Phase (v1.3)
// FO-01 Quick Tips · FO-02 Mock Assessment · FO-03 Pre-Sim · FO-04 Sim ·
// FO-05 Debrief loading · FO-06 Post-Mock Debrief · FO-07 Completion
// ──────────────────────────────────────────────────────────────────────

// ───────── Helpers ─────────
window.FO = {
  hasOA(s) { return s.rounds.some(r => r.kind === "OA"); },
  oaRound(s) { return s.rounds.find(r => r.kind === "OA"); },
  oaSubType(s) { return s.oaSubType || (FO.hasOA(s) ? "aptitude_only" : null); },
  hasGD(s) { return s.rounds.some(r => r.kind === "GD"); },
  gdRound(s) { return s.rounds.find(r => r.kind === "GD"); },
  nonOARounds(s) { return s.rounds.filter(r => r.kind !== "OA" && r.kind !== "GD"); },
  simulatableRounds(s) { return s.rounds.filter(r => r.kind !== "OA" && r.kind !== "GD"); },
  isCold(s) {
    return !!(s.phases.powerplay.skipped && s.phases.acceleration.skipped);
  },
  companyKnown(s) { return !!s.company && WINNIFY.companies.includes(s.company); },
  // Required-activities checklist for SO-11 (v2.0)
  requiredList(s) {
    const fo = s.finalOver || {};
    const list = [];
    if (FO.hasOA(s)) {
      const sub = FO.oaSubType(s);
      const subLabel = sub === "both" ? "Aptitude + Technical (2 sections)" :
                       sub === "technical_only" ? "Technical Only" : "Aptitude Only";
      list.push({
        id: "mock-assessment",
        label: "Mock Assessment",
        sub: subLabel + " · " + (FO.companyKnown(s) ? `${s.company}-tuned` : "role-based"),
        done: !!fo.mockAssessment?.complete,
      });
    }
    // Mock Interview required unless every confirmed (non-OA/GD) round is unmapped
    if (FO.simulatableRounds(s).length > 0) {
      const sim = FO.simulatableRounds(s);
      const completed = (fo.mockInterview?.completedRounds || []).length;
      list.push({
        id: "mock-interview",
        label: "Mock Interview",
        sub: `${completed}/${sim.length} round${sim.length === 1 ? "" : "s"} simulated`,
        done: completed >= sim.length,
      });
    }
    // GD Simulation (v2.0)
    if (FO.hasGD(s)) {
      list.push({
        id: "gd-simulation",
        label: "GD Simulation",
        sub: `${FO.gdRound(s)?.name || "Group Discussion"} · AI-led multi-participant`,
        done: !!fo.gdSimulation?.complete,
      });
    }
    list.push({
      id: "resume-review",
      label: "Resume Review",
      sub: s.resume.uploaded
        ? (s.resume.gaps.length
            ? `${s.resume.gaps.filter(g=>g.status==="resolved").length}/${s.resume.gaps.length} gaps resolved`
            : "0 gaps detected")
        : "Upload required",
      done: !!s.resume.uploaded,
    });
    return list;
  },
  isComplete(s) { return FO.requiredList(s).every(r => r.done); },
  pctDisplay(s) { return FO.isComplete(s) ? 1.0 : 0; },
  ensure(s) {
    if (!s.finalOver) {
      s.finalOver = {
        cuesViewed: false,
        quickTipsViewed: false,
        mockAssessment: { complete: false, score: null, lastRunAt: null, aptitudeScore: null, technicalScore: null },
        mockInterview:  { runCount: 0, completedRounds: [], lastRoundIndex: 0, lastRunAt: null, lastDebrief: null, roundScores: {} },
        gdSimulation:   { complete: false, runCount: 0, lastDebrief: null, lastRunAt: null },
      };
    }
    return s;
  },
  patchSession(state, setState, sid, patch) {
    setState({
      sessions: state.sessions.map(x => x.id === sid ? { ...x, ...patch } : x)
    });
  },
  patchFO(state, setState, sid, fopatch) {
    setState({
      sessions: state.sessions.map(x => x.id === sid
        ? { ...x, finalOver: { ...(x.finalOver || {}), ...fopatch,
            mockAssessment: { ...(x.finalOver?.mockAssessment || {}), ...(fopatch.mockAssessment || {}) },
            mockInterview:  { ...(x.finalOver?.mockInterview  || {}), ...(fopatch.mockInterview  || {}) },
            gdSimulation:   { ...(x.finalOver?.gdSimulation   || {}), ...(fopatch.gdSimulation   || {}) },
          } }
        : x)
    });
  },
};

// ──────────────────────────────────────────────────────────────────────
// FO-01 · Interview Cues card content + modal (v2.0 — renamed from Quick Tips)
// ──────────────────────────────────────────────────────────────────────
function interviewCuesFor(s) {
  // Cold entry: role-derived only. Warm entry: would include weak-area pointers.
  const cold = FO.isCold(s);
  const roleTips = {
    "Full Stack Developer": [
      "Open every system-design answer with the API contract — never start at the database.",
      "For DSA, narrate time and space complexity unprompted, before the interviewer asks.",
      "Tie hands-on details to one or two metrics — latency hit, p99, request volume.",
      "When trade-offs come up, name two axes: latency vs consistency, cost vs flexibility.",
    ],
    "AI/ML Engineer": [
      "Distinguish offline metrics (AUC, RMSE) from online metrics (CTR, retention) early.",
      "For ML system design, separate training, serving and feedback loops on the whiteboard.",
      "On weak areas, surface assumptions first — leak risk, label noise, drift — before the model.",
      "Quote your experiments concretely: feature, baseline, lift, sample size.",
    ],
    "Graduate Engineer Trainee": [
      "Aptitude: read the question twice, write down the formula, then plug numbers — don't shortcut.",
      "Coding round: dry-run with a tiny input out loud before you start typing.",
      "HR: lead with one project you can defend deeply — better than three you can't.",
    ],
  };
  const fallback = [
    "Lead every answer with structure: context → action → outcome.",
    "If the prompt is ambiguous, ask one clarifying question — never assume silently.",
    "When stuck, talk through your thinking. Silence reads worse than a half-formed answer.",
  ];
  const tips = roleTips[s.role] || fallback;

  // Warm-entry overlay would inject weak-area pointers here. For demo, add one if Powerplay touched.
  const warmExtras = [];
  if (!cold) {
    const foundationAvg = Object.values(s.foundation).reduce((a,f)=>a+f.progress,0) / 5;
    if (foundationAvg < 0.5) {
      warmExtras.push("From your Powerplay: trees and graphs are still light — expect at least one tree question and answer recursively first.");
    }
    if (s.interviewPrep.behavioural < 0.3) {
      warmExtras.push("Your behavioural prep was thin — rehearse two STAR-shaped stories before walking in.");
    }
  }

  return {
    cold,
    fallback: false, // would flip true on real AI failure
    bullets: [...warmExtras, ...tips].slice(0, 5),
    footer: [
      "Confidence reads as competence — sit up, slow down, breathe between sentences.",
      "It's a conversation, not a viva. If you don't know something, say so and reason about it.",
      "Hydrate before, not during. Phone on silent and out of sight.",
    ],
  };
}

function InterviewCuesModal({ sid, onClose }) {
  const { state, setState, showToast } = useApp();
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const tips = interviewCuesFor(s);
  const markViewed = () => {
    FO.patchFO(state, setState, sid, { cuesViewed: true, quickTipsViewed: true });
    showToast("Interview Cues marked viewed.");
    onClose();
  };
  return (
    <>
      <div className="modal-head">
        <div className="row between">
          <div className="label">FO-01 · Interview Cues</div>
          <button className="btn btn-sm btn-ghost" onClick={onClose}><Icons.Close size={14}/></button>
        </div>
        <h2 className="h-2 mt-2">Walk in focused.</h2>
        <p className="muted mt-2" style={{fontSize: 13}}>
          A short cues card for <strong>{s.role}</strong>{s.company && WINNIFY.companies.includes(s.company) ? <> · tuned to <strong>{s.company}</strong></> : null}. Review once before your first mock.
        </p>
      </div>
      <div className="modal-pad" style={{paddingTop: 0}}>
        <div className="card card-pad" style={{background: "var(--accent-tint)", border: "1px solid var(--color-primary-tint-2, var(--line-1))"}}>
          <div className="label">Role pointers</div>
          <ul className="mt-2" style={{paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: "var(--ink-2)"}}>
            {tips.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
        <div className="card card-pad mt-3" style={{background: "var(--surface-2)"}}>
          <div className="label">On the day</div>
          <ul className="mt-2" style={{paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: "var(--ink-2)"}}>
            {tips.footer.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Close</button>
        <button className="btn btn-primary" onClick={markViewed}>
          <Icons.Check size={12}/> I've read these
        </button>
      </div>
    </>
  );
}
// Back-compat alias
const QuickTipsModal = InterviewCuesModal;
const quickTipsFor = interviewCuesFor;

// ──────────────────────────────────────────────────────────────────────
// FO-02 · Mock Assessment Session (v2.0 — driven by oaSubType)
// FO-02b · Mock Assessment Results (NEW)
// ──────────────────────────────────────────────────────────────────────
function ScreenMockAssessment() {
  const { route, go, state, setState, showToast } = useApp();
  const sid = route.params?.sid;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  if (!FO.hasOA(s)) {
    return (
      <div className="viewport"><div className="viewport-inner">
        <div className="banner danger">Mock Assessment is only available when an Online Assessment round is confirmed. <button className="btn btn-sm" style={{marginLeft:8}} onClick={() => go("slog:phase", { sid, phase: "final-over" })}>Back</button></div>
      </div></div>
    );
  }
  const sub = FO.oaSubType(s);
  const isBoth = sub === "both";
  const known = FO.companyKnown(s);
  const [stage, setStage] = useState("intro"); // intro · running · done
  const [section, setSection] = useState("aptitude"); // for both
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState({});
  const [aptScore, setAptScore] = useState(null);

  const aptitude = [
    { id: "a1", q: "Trains A and B start 240 km apart, moving toward each other at 60 and 80 km/h. When do they meet?",
      choices: ["1.5 h","1.71 h","2 h","2.5 h"], answer: 1, topic: "Quant" },
    { id: "a2", q: "If 30% of x is 75, what is 65% of x?",
      choices: ["162.5","160","175","150"], answer: 0, topic: "Quant" },
    { id: "a3", q: "Choose the word most opposite to PROLIFIC.",
      choices: ["Sparse","Fertile","Abundant","Rapid"], answer: 0, topic: "Verbal" },
    { id: "a4", q: "Find the next term: 2, 6, 12, 20, 30, ?",
      choices: ["40","42","44","48"], answer: 1, topic: "Logical" },
    { id: "a5", q: "5 men finish a job in 12 days. How many days will 8 men take?",
      choices: ["7.5","6.5","8","9"], answer: 0, topic: "Quant" },
  ];

  const technical = [
    { id: "t1", q: "Average-case time complexity of inserting into a hash map?",
      choices: ["O(log n)","O(1)","O(n)","O(n log n)"], answer: 1, topic: "DSA" },
    { id: "t2", q: "Which traversal of a BST yields elements in sorted order?",
      choices: ["Pre-order","Post-order","In-order","Level-order"], answer: 2, topic: "DSA" },
    { id: "t3", q: "Which is true about a 'write-through' cache?",
      choices: ["Writes only to cache","Writes to DB synchronously","Writes are eventual","Cache loses data on restart"], answer: 1, topic: "System Design" },
    { id: "t4", q: "TCP handshake is a:",
      choices: ["2-way","3-way","4-way","Stateless"], answer: 1, topic: "Networking" },
    { id: "t5", q: "Which index supports range queries best?",
      choices: ["Hash","B-tree","Bitmap","Inverted"], answer: 1, topic: "DBMS" },
  ];

  const sectionQs = section === "aptitude" ? aptitude : technical;
  const totalSections = isBoth ? 2 : 1;
  const sectionIdx = section === "aptitude" ? 1 : 2;

  const sectionLabel = sub === "aptitude_only" ? "Aptitude" :
                       sub === "technical_only" ? "Technical" :
                       (section === "aptitude" ? "Aptitude" : "Technical");

  const submitSection = () => {
    const correct = sectionQs.filter(q => answers[q.id] === q.answer).length;
    const score = Math.round(100 * correct / sectionQs.length);

    if (sub === "both" && section === "aptitude") {
      setAptScore(score);
      setSection("technical");
      setQi(0);
      showToast("Aptitude section complete — moving to Technical");
      return;
    }
    // Final submit (either single-section, or technical-finishing of both)
    const finalScore = sub === "both" ? Math.round((aptScore + score) / 2) : score;
    FO.patchFO(state, setState, sid, {
      mockAssessment: {
        complete: true,
        score: finalScore,
        aptitudeScore: sub === "aptitude_only" ? score : (sub === "both" ? aptScore : null),
        technicalScore: sub === "technical_only" ? score : (sub === "both" ? score : null),
        lastRunAt: new Date().toISOString(),
      }
    });
    setStage("done");
    setTimeout(() => go("slog:mock-assessment-results", { sid }), 600);
  };

  // Sub-type descriptors for intro screen
  const subInfo = sub === "aptitude_only"
    ? { title: "Aptitude Only", desc: "MCQs across quant, verbal and logical reasoning.", sections: 1 }
    : sub === "technical_only"
    ? { title: "Technical Only", desc: "Role-driven technical MCQs from the Q&A bank.", sections: 1 }
    : { title: "Both — Aptitude → Technical", desc: "Aptitude sub-session first, then Technical. Fixed order. Both must complete.", sections: 2 };

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Final Over", "Mock Assessment"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:phase", { sid, phase: "final-over" })}><Icons.ArrowL/> Final Over</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          {stage === "intro" && (
            <>
              <div className="label">FO-02 · Mock Assessment</div>
              <h1 className="h-display mt-2" style={{fontSize: 36}}>Rehearse your OA round.</h1>
              <p className="muted mt-2" style={{maxWidth: "60ch"}}>
                Driven by your OA sub-type: <strong>{subInfo.title}</strong>. {subInfo.desc}
                {known ? <> Tuned to the <strong>{s.company}</strong> pattern.</> : null}
              </p>

              <div className="card mt-6">
                <div style={{padding: "16px 20px", borderBottom: "1px solid var(--line-1)", background: "var(--surface-2)"}}>
                  <div className="row between">
                    <div className="label">What you'll get</div>
                    <span className="chip chip-accent">oaSubType · {sub}</span>
                  </div>
                </div>
                <div className="row gap-6 wrap" style={{padding: 18}}>
                  <Stat label="Sections" value={String(subInfo.sections)} sub={isBoth ? "Apt → Tech" : "single"}/>
                  <Stat label="Questions" value={isBoth ? "10" : "5"} sub="per session"/>
                  <Stat label="Duration" value={isBoth ? "~20 min" : "~12 min"} sub="estimated"/>
                  <Stat label="Source" value={known ? `${s.company}` : "Generic"} sub="question bank"/>
                </div>
                {isBoth && (
                  <div className="row" style={{padding: "12px 20px", borderTop: "1px solid var(--line-1)", background: "var(--surface-2)"}}>
                    <Icons.Info size={14}/>
                    <span style={{fontSize: 12.5, marginLeft: 8}}>
                      <strong>Both sub-sessions must complete</strong> before Mock Assessment ticks off in the Final Over checklist.
                    </span>
                  </div>
                )}
              </div>

              <div className="row gap-2 mt-6">
                <button className="btn btn-accent btn-lg" onClick={() => setStage("running")}>
                  <Icons.Play size={14}/> Begin {isBoth ? "Section 1 (Aptitude)" : "assessment"}
                </button>
                <button className="btn btn-lg" onClick={() => go("slog:phase", { sid, phase: "final-over" })}>Not now</button>
              </div>
            </>
          )}

          {stage === "running" && (
            <div className="card card-pad fade-in" style={{maxWidth: 720, margin: "0 auto"}}>
              <div className="row between">
                <div className="row gap-2">
                  {isBoth && <span className="chip chip-accent">Section {sectionIdx} of {totalSections}</span>}
                  <span className="label">{sectionLabel} · Q{qi+1} of {sectionQs.length}</span>
                </div>
                <div className="row gap-2">
                  <span className="chip">{sectionQs[qi].topic}</span>
                  <span className="chip"><Icons.Clock size={11}/>&nbsp;01:42</span>
                </div>
              </div>
              <h2 className="h-2 mt-3" style={{fontSize: 20, lineHeight: 1.4}}>{sectionQs[qi].q}</h2>
              <div className="col gap-2 mt-4">
                {sectionQs[qi].choices.map((c, i) => (
                  <label key={i} className="row gap-3" style={{
                    padding: "12px 14px", borderRadius: 8, cursor: "pointer",
                    border: `1px solid ${answers[sectionQs[qi].id] === i ? "var(--ink-1)" : "var(--line-2)"}`,
                    background: answers[sectionQs[qi].id] === i ? "var(--surface-2)" : "transparent"
                  }}>
                    <input type="radio" name={"ap-"+sectionQs[qi].id} checked={answers[sectionQs[qi].id] === i}
                           onChange={() => setAnswers(a => ({...a, [sectionQs[qi].id]: i}))}/>
                    <span style={{fontSize: 14}}>{c}</span>
                  </label>
                ))}
              </div>
              <div className="row between mt-6">
                <button className="btn" disabled={qi === 0} onClick={() => setQi(i => i - 1)}>← Prev</button>
                {qi < sectionQs.length - 1
                  ? <button className="btn btn-primary" onClick={() => setQi(i => i + 1)}>Next →</button>
                  : <button className="btn btn-accent" onClick={submitSection}>
                      {isBoth && section === "aptitude" ? "Finish Aptitude · go to Technical" : "Submit assessment"}
                    </button>}
              </div>
              <div className="progress mt-6"><span style={{width: ((qi+1)/sectionQs.length*100) + "%"}}></span></div>
            </div>
          )}

          {stage === "done" && (
            <div className="fade-in" style={{textAlign: "center", padding: 40}}>
              <Icons.Sparkle size={32}/>
              <div className="h-3 mt-3">Loading results…</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// FO-02b · Mock Assessment Results (NEW)
function ScreenMockAssessmentResults() {
  const { route, go, state } = useApp();
  const sid = route.params?.sid;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const ma = s.finalOver?.mockAssessment || {};
  const sub = FO.oaSubType(s);
  const isBoth = sub === "both";

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Final Over", "Mock Assessment", "Results"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:phase", { sid, phase: "final-over" })}><Icons.ArrowL/> Final Over</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="row between wrap gap-3">
            <div className="col gap-2">
              <div className="label">FO-02b · Mock Assessment Results</div>
              <h1 style={{margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: "-0.02em"}}>
                {isBoth ? "Combined results · Aptitude + Technical" : `${sub === "aptitude_only" ? "Aptitude" : "Technical"} results`}
              </h1>
              <div className="muted" style={{fontSize: 13.5, maxWidth: "60ch"}}>
                Question-level breakdown + topic hints. Re-run anytime — score overwrites on completion.
              </div>
            </div>
            <div className="col" style={{alignItems: "flex-end"}}>
              <div className="label">{isBoth ? "Combined" : "Score"}</div>
              <div className="mono" style={{fontSize: 44, letterSpacing: "-0.02em"}}>{ma.score ?? 0}%</div>
              <span className="chip chip-success mt-1"><Icons.Check size={11}/>&nbsp;Mock Assessment complete</span>
            </div>
          </div>

          {/* Section breakdown */}
          {isBoth ? (
            <div className="row gap-3 wrap mt-6">
              <div className="card card-pad" style={{flex: "1 1 320px"}}>
                <div className="row between">
                  <div className="label">Section 1 · Aptitude</div>
                  <span className="mono" style={{fontSize: 22}}>{ma.aptitudeScore ?? 0}%</span>
                </div>
                <div className="progress accent mt-3"><span style={{width: (ma.aptitudeScore || 0) + "%"}}></span></div>
                <div className="row gap-2 mt-3 wrap">
                  <Stat label="Quant" value="2/3" sub="topic"/>
                  <Stat label="Verbal" value="1/1" sub="topic"/>
                  <Stat label="Logical" value="1/1" sub="topic"/>
                </div>
              </div>
              <div className="card card-pad" style={{flex: "1 1 320px"}}>
                <div className="row between">
                  <div className="label">Section 2 · Technical</div>
                  <span className="mono" style={{fontSize: 22}}>{ma.technicalScore ?? 0}%</span>
                </div>
                <div className="progress power mt-3"><span style={{width: (ma.technicalScore || 0) + "%"}}></span></div>
                <div className="row gap-2 mt-3 wrap">
                  <Stat label="DSA" value="1/2" sub="topic"/>
                  <Stat label="System Design" value="1/1" sub="topic"/>
                  <Stat label="DBMS" value="1/1" sub="topic"/>
                  <Stat label="Networking" value="1/1" sub="topic"/>
                </div>
              </div>
            </div>
          ) : (
            <div className="card card-pad mt-6">
              <div className="row between">
                <div className="label">{sub === "aptitude_only" ? "Aptitude breakdown" : "Technical breakdown"}</div>
                <span className="mono" style={{fontSize: 22}}>{ma.score ?? 0}%</span>
              </div>
              <div className={`progress ${sub === "aptitude_only" ? "accent" : "power"} mt-3`}><span style={{width: (ma.score || 0) + "%"}}></span></div>
              <div className="row gap-3 mt-4 wrap">
                {sub === "aptitude_only" ? (
                  <>
                    <Stat label="Quant" value="2/3" sub="topic"/>
                    <Stat label="Verbal" value="1/1" sub="topic"/>
                    <Stat label="Logical" value="1/1" sub="topic"/>
                  </>
                ) : (
                  <>
                    <Stat label="DSA" value="1/2" sub="topic"/>
                    <Stat label="System Design" value="1/1" sub="topic"/>
                    <Stat label="DBMS" value="1/1" sub="topic"/>
                    <Stat label="Networking" value="1/1" sub="topic"/>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Question-level review */}
          <div className="card mt-4">
            <div style={{padding: "14px 20px", background: "var(--surface-2)", borderBottom: "1px solid var(--line-1)"}}>
              <div className="row between">
                <div className="label">Question-level review</div>
                <span className="muted" style={{fontSize: 12}}>Tap to expand any question</span>
              </div>
            </div>
            {["Q1 · Quant","Q2 · Quant","Q3 · Verbal","Q4 · Logical","Q5 · Quant"].map((q, i) => (
              <div key={q} className="row between" style={{padding: "12px 20px", borderBottom: i < 4 ? "1px solid var(--line-1)" : 0}}>
                <div className="row gap-3" style={{flex: 1, minWidth: 0}}>
                  {i % 4 === 2 ? <Icons.Info size={14} color="var(--danger)"/> : <Icons.Check size={14} color="var(--success)"/>}
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{fontSize: 13.5}}>{q}</div>
                    <div className="muted" style={{fontSize: 12}}>
                      {i % 4 === 2 ? "Picked PROLIFIC = Fertile (similar). Opposite is Sparse — note the antonym framing." : "Correct, ~1m to solve."}
                    </div>
                  </div>
                </div>
                <span className={`chip ${i % 4 === 2 ? "chip-danger" : "chip-success"}`}>{i % 4 === 2 ? "Wrong" : "Right"}</span>
              </div>
            ))}
          </div>

          {/* Topic hints */}
          <div className="card card-pad mt-4">
            <div className="label">Topic hints — where to drill next</div>
            <div className="row gap-2 mt-3 wrap">
              <span className="chip chip-warn">Antonyms (verbal)</span>
              <span className="chip chip-warn">Time & Work (quant)</span>
              {!isBoth && sub === "technical_only" && <span className="chip chip-warn">DSA · Trees</span>}
              {isBoth && <span className="chip chip-warn">DSA · Trees</span>}
            </div>
          </div>

          <div className="row gap-2 mt-6">
            <button className="btn btn-accent" onClick={() => go("slog:mock-assessment", { sid })}>
              <Icons.Refresh size={12}/> Re-run Mock Assessment
            </button>
            <button className="btn" onClick={() => go("slog:phase", { sid, phase: "final-over" })}>
              Back to Final Over <Icons.ArrowR size={12}/>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// FO-07 · Final Over Completion Screen
// ──────────────────────────────────────────────────────────────────────
function ScreenFOComplete() {
  const { route, go, state, openModal } = useApp();
  const sid = route.params?.sid;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const fo = s.finalOver || {};
  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Final Over", "Ready"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:phase", { sid, phase: "final-over" })}><Icons.ArrowL/> Final Over</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in" style={{maxWidth: 720}}>
          <div className="label">FO-07 · You're ready</div>
          <h1 className="h-display mt-2" style={{fontSize: 48, letterSpacing: "-0.03em"}}>You're ready.</h1>
          <p className="muted mt-3" style={{fontSize: 14, maxWidth: "55ch"}}>
            You've completed every required Final Over activity for <strong>{s.role}</strong>{s.company ? <> at <strong>{s.company}</strong></> : null}.
            Sessions stay active until you mark them complete — keep practising if you want.
          </p>

          <div className="card mt-6">
            <div style={{padding: "14px 20px", borderBottom: "1px solid var(--line-1)", background: "var(--surface-2)"}}>
              <div className="label">Summary</div>
            </div>
            <div className="col">
              {FO.requiredList(s).map((r, i, arr) => (
                <div key={r.id} className="row between" style={{padding: "14px 20px", borderBottom: i < arr.length-1 ? "1px solid var(--line-1)" : 0}}>
                  <div className="row gap-3">
                    <Icons.Check size={16} color="var(--success)"/>
                    <div>
                      <div style={{fontSize: 14}}>{r.label}</div>
                      <div className="mono dim" style={{fontSize: 11}}>{r.sub}</div>
                    </div>
                  </div>
                  <span className="chip chip-success">Complete</span>
                </div>
              ))}
            </div>
          </div>

          <div className="row gap-2 mt-6">
            <button className="btn btn-accent btn-lg" onClick={() => openModal({ kind: "mark-complete", sid })}>
              <Icons.Trophy size={14}/> Mark session complete
            </button>
            <button className="btn btn-lg" onClick={() => go("slog:phase", { sid, phase: "final-over" })}>
              Return to dashboard
            </button>
          </div>

          <div className="muted mt-6" style={{fontSize: 12.5}}>
            US-11.21 · No auto-archive. You can re-run mocks, review tips and practise indefinitely until interview day.
          </div>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// FO-03 → FO-06 · Mock Interview (v2.0 — Round Selection, NON-sequential)
// FO-03 = Round Selection Screen · taps a round → FO-04 simulator
// On round completion → returns to FO-03. Re-simulate any round any time.
// When LAST pending round completes → auto-triggers FO-05 → FO-06 debrief.
// ──────────────────────────────────────────────────────────────────────
function ScreenMock() {
  const { route, go, state, setState, showToast } = useApp();
  const sid = route.params?.sid;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const fo = s.finalOver || {};
  const seq = FO.simulatableRounds(s);
  const allUnmapped = seq.length === 0;
  const scores = fo.mockInterview?.roundScores || {};
  const completedSet = new Set(fo.mockInterview?.completedRounds || []);

  const [stage, setStage] = useState("pre"); // pre · sim · loading · debrief
  const [roundIdx, setRoundIdx] = useState(0);
  const [showCuesNudge, setShowCuesNudge] = useState(!fo.cuesViewed);
  const [showCuesModal, setShowCuesModal] = useState(false);

  const beginRound = (idx) => {
    setRoundIdx(idx);
    setStage("sim");
  };

  const finishRound = () => {
    // Save round score and add to completed
    const round = seq[roundIdx];
    const score = Math.floor(60 + Math.random() * 30);
    const nextScores = { ...scores, [round.id]: score };
    const nextCompleted = Array.from(new Set([...completedSet, round.id]));

    FO.patchFO(state, setState, sid, {
      mockInterview: {
        roundScores: nextScores,
        completedRounds: nextCompleted,
        lastRoundIndex: roundIdx + 1,
        lastRunAt: new Date().toISOString(),
      }
    });
    showToast(`${round.name} · ${score}%`);

    // If all simulatable rounds done, auto-trigger debrief
    if (nextCompleted.length >= seq.length) {
      setStage("loading");
      setTimeout(() => buildDebrief(nextScores), 1800);
    } else {
      setStage("pre");
    }
  };

  const reSim = (idx) => {
    beginRound(idx);
  };

  const buildDebrief = (allScores) => {
    const debrief = {
      overall: avgScores(allScores) >= 75 ? "Strong" : avgScores(allScores) >= 65 ? "Moderate" : "Weak",
      rounds: seq.map(r => ({
        name: r.name, kind: r.kind,
        score: allScores[r.id] || 0,
        rating: (allScores[r.id] || 0) >= 75 ? "Strong" : (allScores[r.id] || 0) >= 60 ? "Moderate" : "Weak",
        notes: r.kind === "Technical"
          ? "Solid pseudo-code, but jumped to implementation before sketching the API contract."
          : r.kind === "Behavioural"
          ? "STAR held up, but the 'Action' was buried inside long context."
          : "Walkthrough was clean; trade-offs section was light."
      })),
      tips: [
        "Open every system design with the API contract before storage.",
        "Tighten STAR — lead with the action, justify with context.",
        "Quote complexity unprompted; don't wait to be asked.",
      ],
      review: ["Sharding strategies","Read replicas vs cache","Sliding window — implementation"],
      cold: FO.isCold(s),
      warmDelta: !FO.isCold(s) ? {
        improved: ["Hashing", "Two pointers"],
        stillWeak: ["Trees", "Graphs · BFS / DFS"],
      } : null,
      at: new Date().toISOString(),
    };
    FO.patchFO(state, setState, sid, {
      mockInterview: {
        runCount: (fo.mockInterview?.runCount || 0) + 1,
        lastRunAt: new Date().toISOString(),
        lastDebrief: debrief,
      }
    });
    setStage("debrief");
  };

  const goBack = () => go("slog:phase", { sid, phase: "final-over" });

  if (allUnmapped) {
    return (
      <>
        <UI.Topbar crumbs={["Slog Overs", s.role, "Final Over", "Mock Interview"]}
                   right={<button className="btn btn-sm" onClick={goBack}><Icons.ArrowL/> Final Over</button>}/>
        <div className="viewport"><div className="viewport-inner fade-in">
          <div className="banner danger">
            <Icons.Info size={14}/>
            No simulation content available for your confirmed rounds. Add a standard round to enable Mock Interview.
          </div>
        </div></div>
      </>
    );
  }

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Final Over", stage === "debrief" ? "Debrief" : "Mock Interview"]}
        right={<button className="btn btn-sm" onClick={goBack}><Icons.ArrowL/> Final Over</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">

          {stage === "pre" && (
            <>
              <div className="row between wrap gap-3">
                <div className="col gap-2">
                  <div className="label">FO-03 · Mock Interview · Round Selection</div>
                  <h1 style={{margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: "-0.02em"}}>
                    Pick a round to simulate.
                  </h1>
                  <p className="muted mt-2" style={{maxWidth: "60ch", fontSize: 13.5}}>
                    Each round runs independently — tap to start, finish, come back here. <strong>Re-simulate</strong> any completed round any time; score overwrites on this page. When the last pending round completes, your <strong>combined debrief (FO-06)</strong> generates automatically.
                  </p>
                </div>
                <div className="col" style={{alignItems: "flex-end"}}>
                  <div className="label">Progress</div>
                  <div className="mono" style={{fontSize: 32}}>{completedSet.size}<span className="dim" style={{fontSize: 16}}>/{seq.length}</span></div>
                  <div className="mono dim" style={{fontSize: 11}}>rounds simulated</div>
                </div>
              </div>

              {/* Interview Cues nudge */}
              {showCuesNudge && !fo.cuesViewed && (
                <div className="banner info mt-4">
                  <Icons.Spark size={14}/>
                  <span>FO-01 · Review your <strong>Interview Cues</strong> before you begin.</span>
                  <div className="row gap-2" style={{marginLeft:"auto"}}>
                    <button className="btn btn-sm" onClick={() => setShowCuesNudge(false)}>Start anyway</button>
                    <button className="btn btn-sm btn-primary" onClick={() => setShowCuesModal(true)}>View Cues</button>
                  </div>
                </div>
              )}

              {/* Round cards */}
              <div className="row gap-3 wrap mt-6">
                {seq.map((r, i) => {
                  const done = completedSet.has(r.id);
                  const score = scores[r.id];
                  return (
                    <button key={r.id} className="card card-hover" style={{
                      flex: "1 1 280px", padding: 20, textAlign: "left", cursor: "pointer",
                      background: done ? "var(--surface-2)" : "var(--surface)",
                      border: done ? "1.5px solid var(--success)" : "1px solid var(--line-1)",
                    }} onClick={() => done ? reSim(i) : beginRound(i)}>
                      <div className="row between">
                        <div className="row gap-2">
                          <span className="mono dim" style={{fontSize: 11}}>R{i+1}</span>
                          <span className={`chip ${r.kind === "Technical" ? "chip-power" : r.kind === "Behavioural" ? "chip-accel" : "chip-final"}`}>{r.kind}</span>
                        </div>
                        {done ? (
                          <span className="chip chip-success"><Icons.Check size={11}/>&nbsp;{score}%</span>
                        ) : (
                          <span className="chip">Pending</span>
                        )}
                      </div>
                      <div className="h-3 mt-3" style={{fontSize: 16}}>{r.name}</div>
                      <div className="muted mt-2" style={{fontSize: 12.5}}>
                        {r.kind === "Technical" ? "Pseudo-code, complexity, trade-offs." :
                         r.kind === "Behavioural" ? "STAR-structured prompts, voice." :
                         "Walkthrough + defence of one project."}
                      </div>
                      <div className="row gap-2 mt-4">
                        <span className="btn btn-sm btn-accent" style={{pointerEvents: "none"}}>
                          {done ? <><Icons.Refresh size={11}/>&nbsp;Re-simulate</> : <><Icons.Play size={11}/>&nbsp;Start round</>}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {/* OA — handled by Mock Assessment, shown as disabled */}
                {FO.hasOA(s) && (
                  <div className="card" style={{flex: "1 1 280px", padding: 20, opacity: 0.55, background: "var(--surface-2)"}}>
                    <div className="row between">
                      <span className="chip">Excluded</span>
                      <span className="chip chip-outline">OA</span>
                    </div>
                    <div className="h-3 mt-3" style={{fontSize: 16, color: "var(--ink-3)"}}>{FO.oaRound(s)?.name}</div>
                    <div className="muted mt-2" style={{fontSize: 12.5}} title="Handled by Mock Assessment (FO-02). OA is not part of the Mock Interview sequence.">
                      Handled by Mock Assessment. Not simulatable here.
                    </div>
                  </div>
                )}

                {/* GD — handled by GD Simulation, shown as disabled */}
                {FO.hasGD(s) && (
                  <div className="card" style={{flex: "1 1 280px", padding: 20, opacity: 0.55, background: "var(--surface-2)"}}>
                    <div className="row between">
                      <span className="chip">Excluded</span>
                      <span className="chip chip-outline">GD</span>
                    </div>
                    <div className="h-3 mt-3" style={{fontSize: 16, color: "var(--ink-3)"}}>{FO.gdRound(s)?.name}</div>
                    <div className="muted mt-2" style={{fontSize: 12.5}} title="Handled by GD Simulation (FO-GD-01).">
                      Handled by GD Simulation. Not simulatable here.
                    </div>
                  </div>
                )}
              </div>

              {/* Disabled-rounds tooltip explainer */}
              <div className="muted mt-4" style={{fontSize: 12, fontStyle: "italic"}}>
                <Icons.Info size={11}/>&nbsp;Rounds without simulation content (OA, GD) show as disabled. Tooltip: 'No simulation content available.'
              </div>

              {/* Last debrief shortcut */}
              {fo.mockInterview?.lastDebrief && (
                <div className="card card-pad mt-6" style={{background: "var(--surface-2)"}}>
                  <div className="row between gap-3 wrap">
                    <div>
                      <div className="label">Latest debrief · Run #{fo.mockInterview.runCount}</div>
                      <div className="h-3 mt-1">Combined debrief is ready</div>
                      <div className="muted mt-1" style={{fontSize: 12}}>
                        Overall: <strong>{fo.mockInterview.lastDebrief.overall}</strong> · generated {WUTIL.shortDate(fo.mockInterview.lastDebrief.at)}
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => setStage("debrief")}>Open debrief <Icons.ArrowR size={12}/></button>
                  </div>
                </div>
              )}
            </>
          )}

          {stage === "sim" && (
            <div className="card card-pad fade-in">
              <div className="row between">
                <div className="row gap-3">
                  <span className="chip chip-final"><span className="chip-dot"></span>FO-04 · Live mock</span>
                  <span className="mono dim" style={{fontSize: 12}}>{seq[roundIdx].name}</span>
                </div>
                <div className="row gap-2">
                  <span className="chip"><Icons.Clock size={11}/>&nbsp;12:34</span>
                  <button className="btn btn-sm" onClick={() => setStage("pre")}>Exit round</button>
                </div>
              </div>
              <h2 className="h-2 mt-3">{seq[roundIdx].name}</h2>
              <div className="row gap-2 mt-2">
                <span className={`chip ${seq[roundIdx].kind === "Technical" ? "chip-power" : seq[roundIdx].kind === "Behavioural" ? "chip-accel" : "chip-final"}`}>{seq[roundIdx].kind}</span>
                <span className="chip"><Icons.Mic size={11}/>&nbsp;WinSpeak voice</span>
              </div>

              <div className="card card-pad mt-4" style={{background: "var(--surface-2)"}}>
                <div className="label">Interviewer prompt</div>
                <div className="h-3 mt-2" style={{fontSize: 16, lineHeight: 1.5}}>
                  {seq[roundIdx].kind === "Technical"
                    ? "Design a system that ingests 100K events per second from mobile clients and supports near-real-time analytics queries."
                    : seq[roundIdx].kind === "Behavioural"
                    ? "Tell me about a time you disagreed with a teammate's technical choice. How did you resolve it?"
                    : "Walk me through your strongest project — what's it for, what's the stack, and what would you change in hindsight?"}
                </div>
              </div>

              <div className="row gap-3 mt-4" style={{alignItems: "center", justifyContent: "center"}}>
                <div style={{width: 56, height: 56, borderRadius: 999, background: "var(--danger)", display: "grid", placeItems: "center", color: "white"}}>
                  <Icons.Mic size={20}/>
                </div>
                <div className="row gap-1" style={{height: 30, alignItems: "center"}}>
                  {[...Array(28)].map((_, i) => (
                    <div key={i} style={{width: 3, height: 6 + Math.abs(Math.sin(i*0.6))*22, background: "var(--ink-2)", borderRadius: 99}}></div>
                  ))}
                </div>
                <div className="mono dim" style={{fontSize: 11}}>● 00:42 listening</div>
              </div>

              <div className="divider mt-6"></div>
              <div className="row between mt-4">
                <button className="btn" onClick={() => setStage("pre")}>← Back to round selection</button>
                <button className="btn btn-accent" onClick={finishRound}>Finish round · save score</button>
              </div>
            </div>
          )}

          {stage === "loading" && (
            <div className="card card-pad fade-in" style={{textAlign: "center", padding: 56, maxWidth: 560, margin: "40px auto"}}>
              <div className="label">FO-05 · Analysing</div>
              <Icons.Sparkle size={36}/>
              <div className="h-3 mt-3">Analysing your performance…</div>
              <div className="muted mt-2" style={{fontSize: 12.5}}>Scoring delivery, structure, keyword coverage and pacing across {seq.length} rounds.</div>
              <div className="progress accent mt-6" style={{maxWidth: 320, margin: "0 auto"}}>
                <span className="skel" style={{width:"80%", height: "100%", display:"block"}}></span>
              </div>
            </div>
          )}

          {stage === "debrief" && (
            <DebriefView s={s} fo={state.sessions.find(x => x.id === sid)?.finalOver} seq={seq}
                         onRunAgain={() => { setStage("pre"); }}
                         onBack={goBack}/>
          )}
        </div>
      </div>

      <UI.Modal open={showCuesModal} onClose={() => setShowCuesModal(false)}>
        <InterviewCuesModal sid={sid} onClose={() => { setShowCuesModal(false); setShowCuesNudge(false); }}/>
      </UI.Modal>
    </>
  );
}

function avgScores(map) {
  const v = Object.values(map);
  if (!v.length) return 0;
  return v.reduce((a,b) => a+b, 0) / v.length;
}

function DebriefView({ s, fo, seq, onRunAgain, onBack }) {
  const debrief = fo?.mockInterview?.lastDebrief;
  if (!debrief) return null;
  return (
    <div className="fade-in">
      <div className="label">FO-06 · Post-mock debrief</div>
      <div className="row between gap-4 wrap">
        <div>
          <h1 className="h-display mt-2" style={{fontSize: 36}}>Debrief · Run #{fo.mockInterview?.runCount}</h1>
          <p className="muted mt-2" style={{maxWidth: "60ch"}}>
            {debrief.cold
              ? "Based on your mock performance and role profile."
              : "Based on your mock performance plus your earlier Powerplay and Acceleration prep."}
          </p>
        </div>
        <div className="col" style={{alignItems: "flex-end"}}>
          <div className="label">Overall</div>
          <div className="mono mt-1" style={{fontSize: 32, letterSpacing: "-0.02em"}}>{debrief.overall}</div>
          <span className="chip chip-success mt-1"><Icons.Check size={11}/>&nbsp;Mock complete</span>
        </div>
      </div>

      <div className="card mt-6">
        <div style={{padding: "14px 20px", borderBottom: "1px solid var(--line-1)", background: "var(--surface-2)"}}>
          <div className="label">Round-level breakdown</div>
        </div>
        {debrief.rounds.map((r, i) => (
          <div key={i} style={{padding: "14px 20px", borderBottom: i < debrief.rounds.length-1 ? "1px solid var(--line-1)" : 0}}>
            <div className="row between">
              <div className="row gap-3">
                <span className="mono dim" style={{fontSize: 11, width: 22}}>R{i+1}</span>
                <span style={{fontSize: 14, fontWeight: 500}}>{r.name}</span>
                <span className={`chip ${r.kind === "Technical" ? "chip-power" : r.kind === "Behavioural" ? "chip-accel" : "chip-final"}`}>{r.kind}</span>
              </div>
              <span className={`chip ${r.rating === "Strong" ? "chip-success" : r.rating === "Moderate" ? "chip-warn" : "chip-danger"}`}>{r.rating}</span>
            </div>
            <div className="muted mt-2" style={{fontSize: 13, lineHeight: 1.6}}>{r.notes}</div>
          </div>
        ))}
      </div>

      <div className="row gap-3 wrap mt-4">
        <div className="card card-pad" style={{flex: "1 1 320px"}}>
          <div className="h-3">Improvement tips</div>
          <ul className="mt-2" style={{paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: "var(--ink-2)"}}>
            {debrief.tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
        <div className="card card-pad" style={{flex: "1 1 320px"}}>
          <div className="h-3">Topic review</div>
          <div className="col gap-2 mt-2">
            {debrief.review.map(t => (
              <button key={t} className="row between" style={{padding: "10px 12px", borderRadius: 6, border: "1px solid var(--line-1)", background: "var(--surface-2)", cursor:"pointer"}}>
                <span style={{fontSize: 13}}>{t}</span>
                <Icons.ArrowR size={12} color="var(--ink-3)"/>
              </button>
            ))}
          </div>
        </div>
      </div>

      {!debrief.cold && debrief.warmDelta && (
        <div className="card mt-4">
          <div style={{padding: "14px 20px", borderBottom: "1px solid var(--line-1)", background: "var(--surface-2)"}}>
            <div className="label">Compared to your earlier prep</div>
          </div>
          <div className="row" style={{padding: 0}}>
            <div style={{flex: 1, padding: 18, borderRight: "1px solid var(--line-1)"}}>
              <div className="label" style={{color: "var(--success)"}}>Improved</div>
              <div className="col gap-2 mt-2">
                {debrief.warmDelta.improved.map(t => (
                  <div key={t} className="row gap-2"><Icons.Check size={12} color="var(--success)"/><span style={{fontSize: 13}}>{t}</span></div>
                ))}
              </div>
            </div>
            <div style={{flex: 1, padding: 18}}>
              <div className="label" style={{color: "var(--warn)"}}>Still needs work</div>
              <div className="col gap-2 mt-2">
                {debrief.warmDelta.stillWeak.map(t => (
                  <div key={t} className="row gap-2"><Icons.Info size={12} color="var(--warn)"/><span style={{fontSize: 13}}>{t}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row gap-2 mt-6">
        <button className="btn btn-primary" onClick={onRunAgain}>
          <Icons.Refresh size={12}/> Run again
        </button>
        <button className="btn" onClick={onBack}>Back to Final Over</button>
      </div>
      <div className="muted mt-3" style={{fontSize: 12}}>
        US-11.16 · Each re-run generates a standalone debrief. No delta comparison between runs in v1.3.
      </div>
    </div>
  );
}

window.ScreenMock = ScreenMock; // overrides prep-resume.jsx version
window.ScreenMockAssessment = ScreenMockAssessment;
window.ScreenMockAssessmentResults = ScreenMockAssessmentResults;
window.ScreenFOComplete = ScreenFOComplete;
window.QuickTipsModal = QuickTipsModal;
window.InterviewCuesModal = InterviewCuesModal;
window.quickTipsFor = quickTipsFor;
window.interviewCuesFor = interviewCuesFor;
