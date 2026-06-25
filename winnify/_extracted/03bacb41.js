// ──────────────────────────────────────────────────────────────────────
// V2.0 · Acceleration Phase
// ACC-01 3-section weighted home (Technical 50%, Behavioral 15%, Aptitude 35%)
// ACC-02 Topic Detail · ACC-03 Subtopic Q&A · ACC-04 MCQ Practice
// ACC-06 WinSpeak Interview Practice · ACC-07 Practice Report · ACC-15 Tech Cheat Sheet
// ACC-08 Behavioral Cluster · ACC-10 Behavioral Practice · ACC-11 Behavioral Report · ACC-16 Behavioral Cheat Sheet
// ACC-12 Aptitude Hub · ACC-13 Aptitude Type Detail
// ──────────────────────────────────────────────────────────────────────

window.ACC = {
  techTopics(s) {
    return WINNIFY.accTechTopics[s.role] || WINNIFY.accTechTopics.default;
  },
  technicalProgress(s) {
    const topics = ACC.techTopics(s);
    if (!topics.length) return 0;
    const done = topics.filter(t => (t.winSpeakHighScore || 0) >= 70).length;
    return done / topics.length;
  },
  behavioralProgress(s) {
    return s.acceleration?.behavioralProgress || 0;
  },
  aptitudeProgress(s) {
    return s.acceleration?.aptitudeProgress || 0;
  },
  overall(s) {
    return (ACC.technicalProgress(s) * 0.50) +
           (ACC.behavioralProgress(s) * 0.15) +
           (ACC.aptitudeProgress(s) * 0.35);
  },
  // Ad-hoc task — first matching trigger wins
  adHocTask(s) {
    const dl = WUTIL.daysLeft(s.targetDate);
    const tech = ACC.technicalProgress(s);
    const beh = ACC.behavioralProgress(s);
    const apt = ACC.aptitudeProgress(s);
    const topics = ACC.techTopics(s);

    // Priority 1 — Time pressure (interview ≤ 2 days)
    if (dl <= 2 && beh === 0) return { ...WINNIFY.adHocTaskCatalog.find(t => t.trigger === "time-pressure-behavioral") };
    if (dl <= 2 && apt === 0) return { ...WINNIFY.adHocTaskCatalog.find(t => t.trigger === "time-pressure-aptitude") };

    // Priority 2 — Time pressure + topic
    if (dl <= 2) {
      const topic = topics.find(t => t.freq >= 80 && (t.winSpeakHighScore || 0) === 0);
      if (topic) return { ...WINNIFY.adHocTaskCatalog.find(t => t.trigger === "time-pressure-topic"), topicId: topic.id };
    }

    // Priority 3 — Imbalance: Tech ≥ 60%, Beh = 0
    if (tech >= 0.6 && beh === 0) return { ...WINNIFY.adHocTaskCatalog.find(t => t.trigger === "imbalance-behavioral") };

    // Priority 5 — Progress gap (MCQs done, WinSpeak not)
    for (const t of topics) {
      const allMCQ = t.subtopics.every(st => st.mcqDone);
      if (allMCQ && (t.winSpeakHighScore || 0) === 0) {
        return { ...WINNIFY.adHocTaskCatalog.find(x => x.trigger === "progress-gap"), topicId: t.id };
      }
    }

    return null;
  },
};

// ──────────────────────────────────────────────────────────────────────
// ACC-01 · Acceleration Body — 3-section weighted home
// ──────────────────────────────────────────────────────────────────────
function AccelerationBody({ s, browseMode, onLockedClick }) {
  const { go } = useApp();
  const tech = ACC.technicalProgress(s);
  const beh = ACC.behavioralProgress(s);
  const apt = ACC.aptitudeProgress(s);
  const overall = ACC.overall(s);
  const task = ACC.adHocTask(s);
  const topics = ACC.techTopics(s);

  return (
    <>
      {/* Pinned Ad-Hoc Task — only when a trigger fires */}
      {task && !browseMode && (
        <button className="card card-hover mt-4" style={{
          width: "100%", padding: 18, textAlign: "left", cursor: "pointer",
          background: "var(--accent-tint)",
          border: "1.5px solid var(--accent)",
        }} onClick={() => routeAdHoc(go, s.id, task)}>
          <div className="row between">
            <div className="row gap-3">
              <div style={{width: 38, height: 38, borderRadius: 10, background: "var(--surface)", display: "grid", placeItems: "center", flexShrink: 0}}>
                <Icons.Lightning size={18}/>
              </div>
              <div>
                <div className="label">Priority {task.priority} · Ad-Hoc Task</div>
                <div className="h-3 mt-1" style={{fontSize: 15}}>{task.label}</div>
              </div>
            </div>
            <span className="chip chip-accent" style={{flexShrink: 0}}>{task.cta}</span>
          </div>
        </button>
      )}

      {/* ── Section 1: Technical Topics (50%) ── */}
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28}}>
        <div>
          <div className="label">Section 1 · Technical</div>
          <div className="h-3 mt-1" style={{fontSize: 15}}>Technical Topics <span className="dim" style={{fontSize: 12}}>· {WUTIL.pct(tech)}%</span></div>
        </div>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12}}>
        {topics.map((t, i) => {
          const mcqDone = t.subtopics.filter(st => st.mcqDone).length;
          const mcqTotal = t.subtopics.length;
          const mcqPct = mcqTotal > 0 ? (mcqDone / mcqTotal) * 100 : 0;
          const ws = t.winSpeakHighScore || 0;
          const done = ws >= 70;
          return (
            <button key={t.id}
              onClick={() => browseMode ? onLockedClick(() => go("slog:acc-topic", { sid: s.id, topicId: t.id })) : go("slog:acc-topic", { sid: s.id, topicId: t.id })}
              style={{
                background: done ? "var(--powerplay-tint)" : "var(--surface)",
                border: done ? "1.5px solid var(--powerplay)" : "1px solid var(--line-1)",
                borderRadius: 12,
                padding: 16,
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                <div style={{display: "flex", gap: 5, alignItems: "center", flex: 1, minWidth: 0}}>
                  <span className="mono dim" style={{fontSize: 10, flexShrink: 0}}>#{i+1}</span>
                  {t.focus && <Icons.Star size={11} color="var(--accent)"/>}
                  <span style={{fontSize: 13.5, fontWeight: 600, lineHeight: 1.3}}>{t.name}</span>
                </div>
                <Icons.ArrowR size={13} color="var(--ink-3)" style={{flexShrink: 0, marginLeft: 6}}/>
              </div>
              <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
                <span className="chip chip-power" style={{padding: "2px 8px", fontSize: 10}}>{t.cluster}</span>
                <span className="chip" style={{padding: "2px 8px", fontSize: 10}}>Freq {t.freq}</span>
              </div>
              <div style={{display: "flex", flexDirection: "column", gap: 4}}>
                <div style={{display: "flex", justifyContent: "space-between"}}>
                  <span className="mono dim" style={{fontSize: 10}}>Subtopics</span>
                  <span className="mono dim" style={{fontSize: 10}}>{mcqDone}/{mcqTotal}</span>
                </div>
                <div style={{height: 4, borderRadius: 3, background: "var(--surface-3)", overflow: "hidden"}}>
                  <div style={{height: "100%", width: mcqPct + "%", background: "var(--powerplay)", borderRadius: 3, transition: "width 0.3s"}}></div>
                </div>
              </div>
              {done ? (
                <span className="chip chip-success" style={{padding: "3px 10px", fontSize: 11, alignSelf: "flex-start"}}><Icons.Check size={10}/>&nbsp;WS {ws}%</span>
              ) : ws > 0 ? (
                <span className="chip chip-warn" style={{padding: "3px 10px", fontSize: 11, alignSelf: "flex-start"}}>WS {ws}% · retry</span>
              ) : (
                <span style={{fontSize: 11, color: "var(--ink-3)"}}>No WS yet</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Section 2: Behavioral (15%) ── */}
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28}}>
        <div>
          <div className="label">Section 2 · Behavioral</div>
          <div className="h-3 mt-1" style={{fontSize: 15}}>Behavioral Cluster <span className="dim" style={{fontSize: 12}}>· {WUTIL.pct(beh)}%</span></div>
        </div>
      </div>
      <button className="card card-hover mt-3" style={{
        width: "100%", padding: 20, textAlign: "left", cursor: "pointer", background: "var(--surface)",
      }} onClick={() => browseMode ? onLockedClick(() => go("slog:acc-behavioral", { sid: s.id })) : go("slog:acc-behavioral", { sid: s.id })}>
        <div className="row between">
          <div className="row gap-3">
            <div style={{width: 38, height: 38, borderRadius: 10, background: "var(--acceleration-tint, var(--surface-2))", display: "grid", placeItems: "center", flexShrink: 0}}>
              <Icons.Mic size={18}/>
            </div>
            <div>
              <div className="row gap-2"><span className="label">ACC-08</span><span className="chip chip-accel" style={{padding: "2px 8px", fontSize: 10}}>STAR-shaped</span></div>
              <div className="h-3 mt-1" style={{fontSize: 15}}>Behavioral practice cluster</div>
              <div className="muted mt-1" style={{fontSize: 12}}>5 prompts · WinSpeak drills + full session scoring</div>
            </div>
          </div>
          <div className="row gap-2" style={{flexShrink: 0}}>
            {beh >= 1 ? <span className="chip chip-success"><Icons.Check size={11}/>&nbsp;Done</span> : <span className="chip">Pending</span>}
            <Icons.ArrowR size={14} color="var(--ink-3)"/>
          </div>
        </div>
      </button>

      {/* ── Section 3: Aptitude Practice (35%) ── */}
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28}}>
        <div>
          <div className="label">Section 3 · Aptitude</div>
          <div className="h-3 mt-1" style={{fontSize: 15}}>Aptitude Practice <span className="dim" style={{fontSize: 12}}>· {WUTIL.pct(apt)}%</span></div>
        </div>
      </div>
      <button className="card card-hover mt-3" style={{
        width: "100%", padding: 20, textAlign: "left", cursor: "pointer", background: "var(--surface)",
      }} onClick={() => browseMode ? onLockedClick(() => go("slog:acc-apthub", { sid: s.id })) : go("slog:acc-apthub", { sid: s.id })}>
        <div className="row between">
          <div className="row gap-3">
            <div style={{width: 38, height: 38, borderRadius: 10, background: "var(--accent-tint)", display: "grid", placeItems: "center", flexShrink: 0}}>
              <Icons.Brain size={18}/>
            </div>
            <div>
              <div className="row gap-2"><span className="label">ACC-12</span><span className="chip chip-outline" style={{padding: "2px 8px", fontSize: 10}}>4 types</span></div>
              <div className="h-3 mt-1" style={{fontSize: 15}}>Aptitude practice hub</div>
              <div className="muted mt-1" style={{fontSize: 12}}>Quant · Logical · Verbal · DI · Score trend tracked per type</div>
            </div>
          </div>
          <Icons.ArrowR size={14} color="var(--ink-3)" style={{flexShrink: 0}}/>
        </div>
      </button>

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
    </>
  );
}

function routeAdHoc(go, sid, task) {
  if (task.action === "acc:beh-practice") go("slog:acc-behavioral", { sid });
  else if (task.action === "acc:apt-session") go("slog:acc-apthub", { sid });
  else if (task.action === "acc:topic") go("slog:acc-topic", { sid, topicId: task.topicId });
}

function Mini2({ label, val, weight, tone }) {
  return (
    <div className="col gap-1" style={{flex: "1 1 200px"}}>
      <div className="row between">
        <span style={{fontSize: 12.5}}>{label} <span className="dim">· {weight}</span></span>
        <span className="mono dim" style={{fontSize: 11}}>{WUTIL.pct(val)}%</span>
      </div>
      <div className={`progress ${tone === "power" ? "power" : tone === "accel" ? "accel" : "accent"}`}><span style={{width: WUTIL.pct(val) + "%"}}></span></div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// ACC-02 · Topic Detail View (subtopic list)
// ──────────────────────────────────────────────────────────────────────
function ScreenAccTopic() {
  const { route, go, state } = useApp();
  const sid = route.params?.sid;
  const topicId = route.params?.topicId;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const topic = ACC.techTopics(s).find(t => t.id === topicId);
  if (!topic) return <div className="viewport"><div className="viewport-inner"><div className="banner danger">Topic not found.</div></div></div>;

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Acceleration", topic.name]}
        right={<button className="btn btn-sm" onClick={() => go("slog:phase", { sid, phase: "acceleration" })}><Icons.ArrowL/> Acceleration</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="row between wrap gap-3">
            <div className="col gap-2">
              <div className="label">ACC-02 · Topic Detail</div>
              <div className="row gap-2">
                {topic.focus && <span className="chip chip-accent"><Icons.Star size={11}/>&nbsp;Focus</span>}
                <span className="chip chip-power">{topic.cluster}</span>
                <span className="chip">Freq · {topic.freq}</span>
              </div>
              <h1 style={{margin: 0, fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em"}}>{topic.name}</h1>
              <div className="muted" style={{fontSize: 13.5, maxWidth: "60ch"}}>
                Subtopic list with two-step reveal Q&amp;A and MCQ practice per subtopic. When you finish drills, jump into <strong>Interview Practice</strong> for a full WinSpeak session.
              </div>
            </div>
            <div className="row gap-6">
              <Stat label="WinSpeak high" value={`${topic.winSpeakHighScore || 0}%`} sub="threshold 70%"/>
              <Stat label="Subtopics" value={`${topic.subtopics.filter(s => s.mcqDone).length}/${topic.subtopics.length}`} sub="MCQs done"/>
            </div>
          </div>

          <div className="card mt-6">
            <div style={{padding: "12px 18px", background: "var(--surface-2)", borderBottom: "1px solid var(--line-1)"}}>
              <div className="row between">
                <div className="label">Subtopics</div>
                <span className="mono dim" style={{fontSize: 11}}>Self-mark doesn't gate the topic — only WinSpeak ≥ 70 does</span>
              </div>
            </div>
            {topic.subtopics.map((st, i) => (
              <div key={st.id} className="row between" style={{padding: "14px 18px", borderBottom: i < topic.subtopics.length - 1 ? "1px solid var(--line-1)" : 0}}>
                <div className="row gap-3" style={{alignItems: "center", flex: 1, minWidth: 0}}>
                  <span className="mono dim" style={{fontSize: 11, width: 22}}>{i+1}.</span>
                  <button onClick={() => go("slog:acc-subtopic", { sid, topicId, subId: st.id })}
                    style={{background: "transparent", border: 0, padding: 0, textAlign: "left", cursor: "pointer", color: "inherit", flex: 1, minWidth: 0}}>
                    <div style={{fontSize: 14, fontWeight: 500}}>{st.name}</div>
                    <div className="row gap-2 mt-1">
                      <span className="mono dim" style={{fontSize: 11}}>{st.qaCount} Q&amp;A prompts</span>
                      {st.confidence === "got" && <span className="chip chip-success" style={{padding: "2px 8px", fontSize: 10}}>Got it</span>}
                      {st.confidence === "revisit" && <span className="chip chip-warn" style={{padding: "2px 8px", fontSize: 10}}>Needs revisit</span>}
                      {st.confidence === "missed" && <span className="chip chip-danger" style={{padding: "2px 8px", fontSize: 10}}>Missed</span>}
                      {st.mcqDone && <span className="chip chip-outline" style={{padding: "2px 8px", fontSize: 10}}><Icons.Check size={10}/>&nbsp;MCQ done</span>}
                      {st.selfComplete && <span className="chip" style={{padding: "2px 8px", fontSize: 10}}>Self-marked</span>}
                    </div>
                  </button>
                </div>
                <button className="btn btn-sm" onClick={() => go("slog:acc-subtopic", { sid, topicId, subId: st.id })}>
                  Open <Icons.ArrowR size={11}/>
                </button>
              </div>
            ))}
          </div>

          {/* Anchored CTA — Start Interview Practice */}
          <div className="card card-pad mt-4" style={{background: "var(--accent-tint)", border: "1px solid var(--accent)"}}>
            <div className="row between gap-3 wrap">
              <div>
                <div className="label">Ready for a full WinSpeak session?</div>
                <div className="h-3 mt-1">Interview Practice — {topic.name}</div>
                <div className="muted mt-1" style={{fontSize: 12.5}}>
                  Questions weighted by your confidence tags. Routes through Technical Cheat Sheet (ACC-15) first.
                </div>
              </div>
              <button className="btn btn-accent btn-lg" onClick={() => go("slog:acc-cheatsheet", { sid, topicId, kind: "technical" })}>
                <Icons.Mic size={14}/> Start Interview Practice
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// ACC-03 · Subtopic Q&A View — two-step reveal + confidence tags
// ──────────────────────────────────────────────────────────────────────
function ScreenAccSubtopic() {
  const { route, go, state, showToast } = useApp();
  const sid = route.params?.sid;
  const topicId = route.params?.topicId;
  const subId = route.params?.subId;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const topic = ACC.techTopics(s).find(t => t.id === topicId);
  const sub = topic?.subtopics.find(x => x.id === subId);
  if (!topic || !sub) return null;

  const qas = WINNIFY.subtopicQA[subId] || WINNIFY.subtopicQA.default;
  const [revealed, setRevealed] = useState({});
  const [tagged, setTagged] = useState({});

  const tag = (qaId, label) => {
    setTagged(t => ({ ...t, [qaId]: label }));
    showToast(`Tagged as "${label}"`);
  };

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Acceleration", topic.name, sub.name]}
        right={<button className="btn btn-sm" onClick={() => go("slog:acc-topic", { sid, topicId })}><Icons.ArrowL/> Topic</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="row between wrap gap-3">
            <div className="col gap-2">
              <div className="label">ACC-03 · Subtopic Q&amp;A</div>
              <h1 style={{margin: 0, fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em"}}>{sub.name}</h1>
              <div className="muted" style={{fontSize: 13.5, maxWidth: "60ch"}}>
                Two-step reveal — try to answer in your head before flipping. Tag each as <strong>Got it</strong>, <strong>Needs Revisit</strong> or <strong>Missed</strong>. Tags drive WinSpeak question weighting in your next session.
              </div>
            </div>
            <div className="row gap-2">
              <Stat label="Questions" value={String(qas.length)} sub="Q&A bank"/>
            </div>
          </div>

          <div className="col gap-3 mt-6">
            {qas.map((qa, i) => {
              const open = !!revealed[qa.id];
              const t = tagged[qa.id];
              return (
                <div key={qa.id} className="card" style={{padding: 0, border: t ? `1.5px solid ${tagColor(t)}` : "1px solid var(--line-1)"}}>
                  <div style={{padding: "16px 20px"}}>
                    <div className="row between">
                      <div className="row gap-2">
                        <span className="mono dim" style={{fontSize: 11}}>Q{i+1}</span>
                        {t && <span className="chip" style={{padding: "2px 8px", fontSize: 10, background: tagBG(t), color: tagColor(t)}}>{t}</span>}
                      </div>
                      <button className="btn btn-sm btn-ghost"><Icons.Spark size={12}/>&nbsp;Flag</button>
                    </div>
                    <div className="h-3 mt-3" style={{fontSize: 15, lineHeight: 1.5}}>{qa.q}</div>
                    {!open && (
                      <button className="btn mt-3" onClick={() => setRevealed(r => ({ ...r, [qa.id]: true }))}>
                        <Icons.ChevronD size={12}/>&nbsp;Reveal answer
                      </button>
                    )}
                    {open && (
                      <div className="card card-pad mt-3" style={{background: "var(--surface-2)"}}>
                        <div className="label">Sample answer</div>
                        <div className="mt-2" style={{fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-2)"}}>
                          {String(qa.a).split("\n\n").map((para, pi) => (
                            <p key={pi} style={{margin: 0, marginTop: pi > 0 ? 10 : 0}}>{para}</p>
                          ))}
                        </div>
                        <div className="row gap-2 mt-4">
                          <span className="muted" style={{fontSize: 12, marginRight: 4}}>Tag your confidence:</span>
                          {["Got it","Needs Revisit","Missed"].map(lbl => (
                            <button key={lbl} className={`btn btn-sm ${tagged[qa.id] === lbl ? "btn-primary" : ""}`}
                                    onClick={() => tag(qa.id, lbl)}>
                              {lbl}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Anchored CTA */}
          <div className="card card-pad mt-4" style={{background: "var(--accent-tint)", border: "1px solid var(--accent)"}}>
            <div className="row between gap-3 wrap">
              <div>
                <div className="label">After Q&amp;A</div>
                <div className="h-3 mt-1">Drill MCQs for {sub.name}</div>
                <div className="muted mt-1" style={{fontSize: 12.5}}>AI-generated · difficulty-tagged · streak counter · per-answer feedback.</div>
              </div>
              <button className="btn btn-accent btn-lg" onClick={() => go("slog:acc-mcq", { sid, topicId, subId })}>
                <Icons.Play size={14}/> Start MCQ Practice
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function tagColor(t) {
  if (t === "Got it") return "var(--success)";
  if (t === "Needs Revisit") return "var(--warn)";
  return "var(--danger)";
}
function tagBG(t) {
  if (t === "Got it") return "var(--success-tint)";
  if (t === "Needs Revisit") return "var(--warn-tint)";
  return "var(--danger-tint)";
}

// ──────────────────────────────────────────────────────────────────────
// ACC-04 · MCQ Practice Session
// ──────────────────────────────────────────────────────────────────────
function ScreenAccMCQ() {
  const { route, go, state, showToast } = useApp();
  const sid = route.params?.sid;
  const topicId = route.params?.topicId;
  const subId = route.params?.subId;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const topic = ACC.techTopics(s).find(t => t.id === topicId);
  const sub = topic?.subtopics.find(x => x.id === subId);
  const mcqs = (WINNIFY.subtopicMCQ[subId] || WINNIFY.subtopicMCQ.default);
  if (!topic || !sub) return null;

  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [shown, setShown] = useState(false);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const q = mcqs[i];

  const reveal = (ci) => {
    if (shown) return;
    setPick(ci);
    setShown(true);
    if (ci === q.answer) {
      setStreak(streak + 1);
      setScore(score + 1);
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (i < mcqs.length - 1) {
      setI(i + 1); setPick(null); setShown(false);
    } else {
      showToast(`MCQ practice complete · ${score}/${mcqs.length}`);
      go("slog:acc-subtopic", { sid, topicId, subId });
    }
  };

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Acceleration", topic.name, sub.name, "MCQ"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:acc-subtopic", { sid, topicId, subId })}><Icons.ArrowL/> Subtopic</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in" style={{maxWidth: 760}}>
          <div className="row between wrap gap-3">
            <div className="col gap-2">
              <div className="label">ACC-04 · MCQ Practice</div>
              <h1 style={{margin: 0, fontSize: 24, fontWeight: 500}}>{sub.name}</h1>
            </div>
            <div className="row gap-3">
              <Stat label="Streak" value={`${streak}🔥`} sub="correct in a row"/>
              <Stat label="Score" value={`${score}/${i + (shown ? 1 : 0)}`} sub="this session"/>
              <button className="btn btn-sm btn-ghost"><Icons.Spark size={12}/>&nbsp;Flag</button>
            </div>
          </div>

          <div className="card card-pad mt-4 fade-in">
            <div className="row between">
              <div className="label">Q{i+1} of {mcqs.length} · AI-generated</div>
              <span className={`chip ${q.difficulty === "Easy" ? "chip-success" : q.difficulty === "Medium" ? "chip-warn" : "chip-danger"}`}>{q.difficulty}</span>
            </div>
            <div className="h-2 mt-3" style={{fontSize: 18, lineHeight: 1.5}}>{q.q}</div>
            <div className="col gap-2 mt-4">
              {q.choices.map((c, ci) => {
                const isAnswer = shown && ci === q.answer;
                const isWrong = shown && pick === ci && ci !== q.answer;
                return (
                  <button key={ci} onClick={() => reveal(ci)}
                    className="row gap-3" style={{
                      padding: "12px 14px", textAlign: "left", borderRadius: 8,
                      border: `1.5px solid ${isAnswer ? "var(--success)" : isWrong ? "var(--danger)" : pick === ci ? "var(--accent)" : "var(--line-2)"}`,
                      background: isAnswer ? "var(--success-tint)" : isWrong ? "var(--danger-tint)" : pick === ci ? "var(--accent-tint)" : "var(--surface)",
                      cursor: shown ? "default" : "pointer", fontSize: 13.5,
                    }}>
                    <span className="mono dim" style={{fontSize: 11, width: 18}}>{String.fromCharCode(65+ci)}</span>
                    <span>{c}</span>
                    {isAnswer && <Icons.Check size={14} style={{marginLeft: "auto", color: "var(--success)"}}/>}
                  </button>
                );
              })}
            </div>
            {shown && (
              <div className="card card-pad mt-4" style={{background: pick === q.answer ? "var(--success-tint)" : "var(--danger-tint)"}}>
                <div className="row gap-2">
                  {pick === q.answer ? <Icons.Check size={14}/> : <Icons.Info size={14}/>}
                  <strong style={{fontSize: 13}}>{pick === q.answer ? "Correct." : "Not quite."}</strong>
                </div>
                <div className="muted mt-2" style={{fontSize: 12.5}}>
                  Brief AI-generated explanation: the correct choice anchors on the underlying invariant. Each MCQ surfaces a one-line teach-back.
                </div>
              </div>
            )}
            <div className="row between mt-6">
              <span className="muted" style={{fontSize: 12}}>Click an answer to reveal · streak resets on incorrect.</span>
              {!shown
                ? <button className="btn btn-ghost" onClick={next}>Skip →</button>
                : <button className="btn btn-accent" onClick={next}>{i < mcqs.length - 1 ? "Next →" : "Finish"}</button>}
            </div>
            <div className="progress accel mt-4"><span style={{width: ((i + (shown ? 1 : 0))/mcqs.length*100) + "%"}}></span></div>
          </div>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// ACC-15 · Technical Cheat Sheet (auto before ACC-06)
// ACC-16 · Behavioral Cheat Sheet (auto before full ACC-10)
// ──────────────────────────────────────────────────────────────────────
function ScreenAccCheatSheet() {
  const { route, go, state } = useApp();
  const sid = route.params?.sid;
  const kind = route.params?.kind; // "technical" | "behavioral"
  const topicId = route.params?.topicId;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;

  const isBehavioral = kind === "behavioral";
  const sheetId = isBehavioral ? "ACC-16" : "ACC-15";
  const topic = topicId ? ACC.techTopics(s).find(t => t.id === topicId) : null;

  const continueTo = isBehavioral
    ? () => go("slog:acc-beh-practice", { sid })
    : () => go("slog:acc-winspeak", { sid, topicId });

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Acceleration", isBehavioral ? "Behavioral" : (topic?.name || "Topic"), "Cheat Sheet"]}
        right={<button className="btn btn-sm" onClick={() => isBehavioral ? go("slog:acc-behavioral", { sid }) : go("slog:acc-topic", { sid, topicId })}><Icons.ArrowL/> Back</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in" style={{maxWidth: 780}}>
          <div className="row between wrap gap-3">
            <div className="col gap-2">
              <div className="label">{sheetId} · {isBehavioral ? "Behavioral" : "Technical"} Cheat Sheet</div>
              <h1 style={{margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em"}}>
                {isBehavioral ? "Before your WinSpeak Behavioral session" : `Before your WinSpeak: ${topic?.name}`}
              </h1>
              <div className="muted" style={{fontSize: 13.5, maxWidth: "60ch"}}>
                AI-generated · 90 seconds to skim. <strong>You can skip anytime</strong> — the button is always visible.
              </div>
            </div>
            <button className="btn btn-accent btn-lg" onClick={continueTo}>
              Skip / Start now <Icons.ArrowR size={12}/>
            </button>
          </div>

          <div className="row gap-3 mt-6 wrap">
            <div className="card card-pad" style={{flex: "1 1 220px"}}>
              <div className="label">Answer structure</div>
              <div className="mt-2" style={{fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-2)"}}>
                {isBehavioral
                  ? "STAR — Situation, Task, Action, Result. Action is 60% of air-time. Quantify the Result."
                  : (topic?.cluster === "DSA"
                    ? "Restate input → clarify edge cases → naive → optimised → complexity."
                    : topic?.cluster === "System Design"
                    ? "API contract → requirements → high-level → storage → trade-offs."
                    : "Define the term → quote a complexity / invariant → contrast against one alternative.")}
              </div>
            </div>
            <div className="card card-pad" style={{flex: "1 1 220px"}}>
              <div className="label">Keywords to anchor</div>
              <div className="row gap-2 wrap mt-2">
                {(isBehavioral
                  ? ["ownership","disagreement","trade-off","quantified outcome","retrospective"]
                  : (topic?.cluster === "DSA"
                    ? ["time complexity","space complexity","monotonic","invariant","dry-run"]
                    : topic?.cluster === "System Design"
                    ? ["sharding","cache-aside","write-through","p99","eventual consistency"]
                    : ["latency","durability","throughput","invariant","trade-off"])
                ).map(k => <span key={k} className="chip chip-power">{k}</span>)}
              </div>
            </div>
            <div className="card card-pad" style={{flex: "1 1 220px"}}>
              <div className="label">Framework</div>
              <div className="mt-2" style={{fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-2)"}}>
                {isBehavioral
                  ? "Lead with the action verb. Pin one number in the outcome. Cap each answer at 90s."
                  : "Talk first, code second. Quote complexity unprompted. Defend trade-offs with one number."}
              </div>
            </div>
          </div>

          <div className="card card-pad mt-4" style={{background: "var(--surface-2)"}}>
            <div className="row between">
              <div className="label">Common mistakes</div>
              <span className="muted" style={{fontSize: 12}}>AI-derived from your past sessions</span>
            </div>
            <ul className="mt-2" style={{paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: "var(--ink-2)"}}>
              {isBehavioral ? (
                <>
                  <li>Burying the Action under too much Situation context.</li>
                  <li>Missing a measurable outcome ("we improved it" → "we improved it by 27% over 4 weeks").</li>
                  <li>Blaming a teammate or past employer.</li>
                </>
              ) : (
                <>
                  <li>Jumping to code before sketching the API contract or invariant.</li>
                  <li>Quoting time complexity but never space.</li>
                  <li>Not naming the pattern before applying it.</li>
                </>
              )}
            </ul>
          </div>

          <div className="row gap-2 mt-6">
            <button className="btn btn-accent btn-lg" onClick={continueTo}>
              <Icons.Mic size={14}/> Begin WinSpeak session
            </button>
            <button className="btn btn-lg" onClick={() => isBehavioral ? go("slog:acc-behavioral", { sid }) : go("slog:acc-topic", { sid, topicId })}>
              Not now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// ACC-06 · WinSpeak Interview Practice (technical, per-topic)
// ──────────────────────────────────────────────────────────────────────
function ScreenAccWinSpeak() {
  const { route, go, state, showToast } = useApp();
  const sid = route.params?.sid;
  const topicId = route.params?.topicId;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const topic = ACC.techTopics(s).find(t => t.id === topicId);
  if (!topic) return null;

  const [qi, setQi] = useState(0);
  const prompts = (WINNIFY.subtopicQA[topic.subtopics[0]?.id] || WINNIFY.subtopicQA.default)
    .slice(0, 5).map(qa => qa.q);

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Acceleration", topic.name, "WinSpeak"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:acc-topic", { sid, topicId })}><Icons.ArrowL/> Topic</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="row between wrap gap-3">
            <div className="col gap-2">
              <div className="label">ACC-06 · WinSpeak Interview Practice</div>
              <h1 style={{margin: 0, fontSize: 26, fontWeight: 500}}>{topic.name}</h1>
              <div className="muted" style={{fontSize: 13}}>
                Questions are weighted by your confidence tags — <strong>Missed</strong> and <strong>Needs Revisit</strong> surface first.
              </div>
            </div>
            <div className="row gap-2">
              <span className="chip"><Icons.Mic size={11}/>&nbsp;Voice-first</span>
              <span className="chip">Q{qi+1} of {prompts.length}</span>
            </div>
          </div>

          <div className="card card-pad mt-6">
            <div className="row between">
              <div className="label">Interviewer prompt</div>
              <span className="chip"><Icons.Clock size={11}/>&nbsp;~90s</span>
            </div>
            <div className="h-2 mt-3" style={{fontSize: 18, lineHeight: 1.5}}>{prompts[qi]}</div>

            <div className="row gap-3 mt-6" style={{alignItems: "center", justifyContent: "center"}}>
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

            <div className="row between mt-6">
              <button className="btn" disabled={qi === 0} onClick={() => setQi(qi-1)}>← Prev</button>
              {qi < prompts.length - 1
                ? <button className="btn btn-primary" onClick={() => setQi(qi+1)}>Next prompt →</button>
                : <button className="btn btn-accent" onClick={() => go("slog:acc-winspeak-report", { sid, topicId })}>Finish &amp; debrief</button>}
            </div>
            <div className="progress accel mt-4"><span style={{width: ((qi+1)/prompts.length*100) + "%"}}></span></div>
          </div>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// ACC-07 · WinSpeak Practice Report
// ──────────────────────────────────────────────────────────────────────
function ScreenAccWinSpeakReport() {
  const { route, go, state, showToast } = useApp();
  const sid = route.params?.sid;
  const topicId = route.params?.topicId;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const topic = ACC.techTopics(s).find(t => t.id === topicId);
  if (!topic) return null;
  const score = 74; // mock score for prototype

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Acceleration", topic.name, "Report"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:acc-topic", { sid, topicId })}><Icons.ArrowL/> Topic</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="row between wrap gap-3">
            <div className="col gap-2">
              <div className="label">ACC-07 · WinSpeak Practice Report</div>
              <h1 style={{margin: 0, fontSize: 28, fontWeight: 500}}>{topic.name}</h1>
              <div className="muted" style={{fontSize: 13.5, maxWidth: "60ch"}}>
                AI-evaluated · structure, accuracy, keyword anchoring, pacing. Topic flips to <strong>100% complete</strong> when your high-score ≥ 70%.
              </div>
            </div>
            <div className="col" style={{alignItems: "flex-end"}}>
              <div className="label">Overall</div>
              <div className="mono" style={{fontSize: 40, letterSpacing: "-0.02em"}}>{score}%</div>
              {score >= 70 ? (
                <span className="chip chip-success mt-1"><Icons.Check size={11}/>&nbsp;Topic complete</span>
              ) : (
                <span className="chip chip-warn mt-1">{70 - score}% from threshold</span>
              )}
            </div>
          </div>

          <div className="row gap-3 wrap mt-6">
            {[
              ["Structure", 82, "Strong — opened with API contract on 4/5 prompts."],
              ["Accuracy", 71, "Correct on the invariant; missed one edge case."],
              ["Keywords", 76, "Quoted complexity on 3/5. Add 'monotonic' next time."],
              ["Pacing", 65, "Two answers ran past 120s. Tighten the Situation framing."],
            ].map(([lbl, v, note]) => (
              <div key={lbl} className="card card-pad" style={{flex: "1 1 220px"}}>
                <div className="row between">
                  <div className="label">{lbl}</div>
                  <span className="mono" style={{fontSize: 18}}>{v}%</span>
                </div>
                <div className="progress accel mt-2"><span style={{width: v + "%"}}></span></div>
                <div className="muted mt-3" style={{fontSize: 12.5, lineHeight: 1.5}}>{note}</div>
              </div>
            ))}
          </div>

          <div className="card mt-4">
            <div style={{padding: "14px 20px", background: "var(--surface-2)", borderBottom: "1px solid var(--line-1)"}}>
              <div className="label">Per-question feedback</div>
            </div>
            {[1,2,3,4,5].map((n, i) => (
              <div key={n} className="row between" style={{padding: "12px 20px", borderBottom: i < 4 ? "1px solid var(--line-1)" : 0}}>
                <div className="row gap-3" style={{flex: 1, minWidth: 0}}>
                  <span className="mono dim" style={{fontSize: 11, width: 22}}>Q{n}</span>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{fontSize: 13.5}}>{["Strong", "Strong", "Moderate", "Moderate", "Weak"][i]}</div>
                    <div className="muted" style={{fontSize: 12}}>
                      {["Clear opening, accurate complexity.",
                        "Good — though the optimisation came late.",
                        "Naive came out, optimised was hand-waved.",
                        "Edge case missed; recovered with hint.",
                        "Time ran out — restate-clarify-naive loop took too long."][i]}
                    </div>
                  </div>
                </div>
                <button className="btn btn-sm btn-ghost"><Icons.Spark size={12}/>&nbsp;Flag</button>
              </div>
            ))}
          </div>

          <div className="row gap-3 wrap mt-4">
            <div className="card card-pad" style={{flex: "1 1 320px"}}>
              <div className="label">Weak areas</div>
              <ul className="mt-2" style={{paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: "var(--ink-2)"}}>
                <li>Edge-case enumeration (particularly empty / single-element inputs).</li>
                <li>Pacing — answers running 90s+.</li>
              </ul>
            </div>
            <div className="card card-pad" style={{flex: "1 1 320px"}}>
              <div className="label">Recommendations</div>
              <ul className="mt-2" style={{paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: "var(--ink-2)"}}>
                <li>Re-run with confidence tags refreshed on prefix-sums Q&A.</li>
                <li>Drill MCQs on edge cases — flag bad ones via the icon above.</li>
              </ul>
            </div>
          </div>

          <div className="row gap-2 mt-6">
            <button className="btn btn-primary"><Icons.Spark size={12}/>&nbsp;Ask for more questions</button>
            <button className="btn btn-accent" onClick={() => go("slog:acc-winspeak", { sid, topicId })}><Icons.Refresh size={12}/>&nbsp;Run again</button>
            <button className="btn" onClick={() => showToast("AI feedback flagged for review.")}><Icons.Spark size={12}/>&nbsp;Flag AI feedback</button>
            <button className="btn" onClick={() => go("slog:acc-topic", { sid, topicId })}>Back to topic</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// ACC-08 · Behavioral Cluster View
// ──────────────────────────────────────────────────────────────────────
function ScreenAccBehavioral() {
  const { route, go, state } = useApp();
  const sid = route.params?.sid;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const list = WINNIFY.behavioralQAs;

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Acceleration", "Behavioral"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:phase", { sid, phase: "acceleration" })}><Icons.ArrowL/> Acceleration</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="row between wrap gap-3">
            <div className="col gap-2">
              <div className="label">ACC-08 · Behavioral Cluster</div>
              <h1 style={{margin: 0, fontSize: 28, fontWeight: 500}}>Behavioral practice</h1>
              <div className="muted" style={{fontSize: 13.5, maxWidth: "60ch"}}>
                Flat Q&amp;A list with STAR hints. <strong>Per-question WinSpeak</strong> drills individual answers (no scoring). <strong>Full WinSpeak Behavioral</strong> session scores you — section flips to 100% on score ≥ 70.
              </div>
            </div>
            <button className="btn btn-accent btn-lg" onClick={() => go("slog:acc-cheatsheet", { sid, kind: "behavioral" })}>
              <Icons.Mic size={14}/> Start WinSpeak Behavioral Practice
            </button>
          </div>

          <div className="card mt-6">
            <div style={{padding: "12px 18px", background: "var(--surface-2)", borderBottom: "1px solid var(--line-1)"}}>
              <div className="row between">
                <div className="label">Prompts · {list.length}</div>
                <span className="mono dim" style={{fontSize: 11}}>Per-question WS does not affect section completion</span>
              </div>
            </div>
            {list.map((bq, i) => (
              <div key={bq.id} style={{padding: "14px 18px", borderBottom: i < list.length - 1 ? "1px solid var(--line-1)" : 0}}>
                <div className="row between">
                  <div className="col" style={{gap: 4, flex: 1}}>
                    <div className="row gap-2">
                      <span className="mono dim" style={{fontSize: 11}}>Q{i+1}</span>
                      <span className="chip chip-accel" style={{padding: "2px 8px", fontSize: 10}}>STAR</span>
                    </div>
                    <div style={{fontSize: 14, fontWeight: 500}}>{bq.q}</div>
                    <div className="muted" style={{fontSize: 12, marginTop: 4}}>
                      <strong>STAR hint:</strong> {bq.starHint}
                    </div>
                  </div>
                  <button className="btn btn-sm" onClick={() => go("slog:acc-beh-single", { sid, qId: bq.id })}>
                    <Icons.Mic size={11}/>&nbsp;Practice with WinSpeak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ACC-08-single · per-question WinSpeak (no cheat sheet)
function ScreenAccBehSingle() {
  const { route, go, state } = useApp();
  const sid = route.params?.sid;
  const qId = route.params?.qId;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const bq = WINNIFY.behavioralQAs.find(x => x.id === qId);
  if (!bq) return null;

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Acceleration", "Behavioral", "Single drill"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:acc-behavioral", { sid })}><Icons.ArrowL/> Behavioral</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in" style={{maxWidth: 720}}>
          <div className="label">ACC-08 · Per-question WinSpeak</div>
          <h1 className="h-display mt-2" style={{fontSize: 28}}>Drill — single prompt</h1>
          <div className="muted mt-2" style={{fontSize: 13, maxWidth: "55ch"}}>
            No cheat sheet, no scoring. Practice the answer aloud, get a transcript and one-line feedback, move on.
          </div>

          <div className="card card-pad mt-6">
            <div className="row gap-2">
              <span className="chip chip-accel">STAR</span>
              <span className="chip">~90s</span>
            </div>
            <div className="h-2 mt-3" style={{fontSize: 18, lineHeight: 1.5}}>{bq.q}</div>
            <div className="muted mt-3" style={{fontSize: 12.5}}><strong>STAR hint:</strong> {bq.starHint}</div>

            <div className="row gap-3 mt-6" style={{alignItems: "center", justifyContent: "center"}}>
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

            <div className="row between mt-6">
              <button className="btn" onClick={() => go("slog:acc-behavioral", { sid })}>← Back to cluster</button>
              <button className="btn btn-primary">Submit drill</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// ACC-10 · Full Behavioral WinSpeak Practice (scoring)
// ──────────────────────────────────────────────────────────────────────
function ScreenAccBehPractice() {
  const { route, go, state } = useApp();
  const sid = route.params?.sid;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const [qi, setQi] = useState(0);
  const prompts = WINNIFY.behavioralQAs;

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Acceleration", "Behavioral", "Full session"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:acc-behavioral", { sid })}><Icons.ArrowL/> Behavioral</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="row between wrap gap-3">
            <div className="col gap-2">
              <div className="label">ACC-10 · WinSpeak Behavioral Practice (full)</div>
              <h1 style={{margin: 0, fontSize: 26, fontWeight: 500}}>Random session · {prompts.length} prompts</h1>
              <div className="muted" style={{fontSize: 13}}>Confidence-weighted random selection. Scoring drives the Behavioral section %.</div>
            </div>
            <div className="row gap-2">
              <span className="chip"><Icons.Mic size={11}/>&nbsp;Voice</span>
              <span className="chip">Q{qi+1} of {prompts.length}</span>
            </div>
          </div>

          <div className="card card-pad mt-6">
            <div className="row gap-2">
              <span className="chip chip-accel">STAR</span>
              <span className="chip"><Icons.Clock size={11}/>&nbsp;90s</span>
            </div>
            <div className="h-2 mt-3" style={{fontSize: 18, lineHeight: 1.5}}>{prompts[qi].q}</div>

            <div className="row gap-3 mt-6" style={{alignItems: "center", justifyContent: "center"}}>
              <div style={{width: 56, height: 56, borderRadius: 999, background: "var(--danger)", display: "grid", placeItems: "center", color: "white"}}>
                <Icons.Mic size={20}/>
              </div>
              <div className="row gap-1" style={{height: 30, alignItems: "center"}}>
                {[...Array(28)].map((_, i) => (
                  <div key={i} style={{width: 3, height: 6 + Math.abs(Math.sin(i*0.6))*22, background: "var(--ink-2)", borderRadius: 99}}></div>
                ))}
              </div>
            </div>

            <div className="row between mt-6">
              <button className="btn" disabled={qi === 0} onClick={() => setQi(qi-1)}>← Prev</button>
              {qi < prompts.length - 1
                ? <button className="btn btn-primary" onClick={() => setQi(qi+1)}>Next →</button>
                : <button className="btn btn-accent" onClick={() => go("slog:acc-beh-report", { sid })}>Finish &amp; debrief</button>}
            </div>
            <div className="progress accel mt-4"><span style={{width: ((qi+1)/prompts.length*100) + "%"}}></span></div>
          </div>
        </div>
      </div>
    </>
  );
}

// ACC-11 · Behavioral Practice Report
function ScreenAccBehReport() {
  const { route, go, state, showToast } = useApp();
  const sid = route.params?.sid;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const score = 76;

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Acceleration", "Behavioral", "Report"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:acc-behavioral", { sid })}><Icons.ArrowL/> Behavioral</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="row between wrap gap-3">
            <div className="col gap-2">
              <div className="label">ACC-11 · WinSpeak Behavioral Report</div>
              <h1 style={{margin: 0, fontSize: 28, fontWeight: 500}}>Full session debrief</h1>
              <div className="muted" style={{fontSize: 13.5, maxWidth: "55ch"}}>
                Per-question STAR feedback · weak areas · improvement tips.
              </div>
            </div>
            <div className="col" style={{alignItems: "flex-end"}}>
              <div className="label">Overall</div>
              <div className="mono" style={{fontSize: 40}}>{score}%</div>
              {score >= 70
                ? <span className="chip chip-success mt-1"><Icons.Check size={11}/>&nbsp;Behavioral 100%</span>
                : <span className="chip chip-warn mt-1">{70 - score}% from threshold</span>}
            </div>
          </div>

          <div className="card mt-6">
            <div style={{padding: "14px 20px", background: "var(--surface-2)", borderBottom: "1px solid var(--line-1)"}}>
              <div className="label">Per-question STAR feedback</div>
            </div>
            {WINNIFY.behavioralQAs.map((bq, i) => (
              <div key={bq.id} style={{padding: "14px 20px", borderBottom: i < WINNIFY.behavioralQAs.length - 1 ? "1px solid var(--line-1)" : 0}}>
                <div className="row between">
                  <div className="row gap-2"><span className="mono dim" style={{fontSize: 11}}>Q{i+1}</span>
                    <span style={{fontSize: 13.5, fontWeight: 500}}>{bq.q.slice(0, 60)}…</span></div>
                  <span className={`chip ${i % 3 === 0 ? "chip-success" : i % 3 === 1 ? "chip-warn" : "chip-danger"}`}>
                    {i % 3 === 0 ? "Strong" : i % 3 === 1 ? "Moderate" : "Weak"}
                  </span>
                </div>
                <div className="row gap-3 mt-2 wrap">
                  {["S","T","A","R"].map(letter => (
                    <span key={letter} className="chip chip-outline" style={{padding: "2px 8px", fontSize: 10}}>
                      {letter} · {Math.floor(60 + Math.random() * 35)}%
                    </span>
                  ))}
                </div>
                <div className="muted mt-2" style={{fontSize: 12.5}}>
                  AI feedback: action took 41% of air-time (target 60%). Outcome was qualitative — pin one number next time.
                </div>
              </div>
            ))}
          </div>

          <div className="row gap-2 mt-6">
            <button className="btn btn-primary"><Icons.Spark size={12}/>&nbsp;Ask for more questions</button>
            <button className="btn btn-accent" onClick={() => go("slog:acc-beh-practice", { sid })}><Icons.Refresh size={12}/>&nbsp;Run again</button>
            <button className="btn" onClick={() => showToast("AI feedback flagged for review.")}><Icons.Spark size={12}/>&nbsp;Flag AI feedback</button>
            <button className="btn" onClick={() => go("slog:phase", { sid, phase: "acceleration" })}>Back to Acceleration</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// ACC-12 · Aptitude Practice Hub
// ACC-13 · Aptitude Type Detail
// ──────────────────────────────────────────────────────────────────────
function ScreenAccAptHub() {
  const { route, go, state } = useApp();
  const sid = route.params?.sid;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const apt = WINNIFY.aptitudeClusters;
  const types = [
    { id: "quant", trend: [0.45, 0.52, 0.58, 0.62, 0.68], avg: 62, sessions: 6 },
    { id: "logical", trend: [0.40, 0.44, 0.48, 0.50, 0.55], avg: 53, sessions: 3 },
    { id: "verbal", trend: [0.30, 0.32, 0.30], avg: 31, sessions: 1 },
    { id: "di", trend: [], avg: 0, sessions: 0 },
  ];

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Acceleration", "Aptitude Hub"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:phase", { sid, phase: "acceleration" })}><Icons.ArrowL/> Acceleration</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="row between wrap gap-3">
            <div className="col gap-2">
              <div className="label">ACC-12 · Aptitude Practice Hub</div>
              <h1 style={{margin: 0, fontSize: 28, fontWeight: 500}}>Aptitude practice</h1>
              <div className="muted" style={{fontSize: 13.5, maxWidth: "60ch"}}>
                Performance snapshot — score trend per type drawn from Powerplay + Acceleration. A type auto-completes after <strong>5 sessions all ≥ 60%</strong>.
              </div>
            </div>
            <Stat label="Aptitude %" value={`${WUTIL.pct(ACC.aptitudeProgress(s))}%`} sub="35% of Accel"/>
          </div>

          <div className="row gap-3 wrap mt-6">
            {types.map(t => {
              const c = apt[t.id];
              return (
                <button key={t.id} className="card card-hover" style={{
                  flex: "1 1 280px", padding: 18, textAlign: "left", cursor: "pointer",
                  background: "var(--surface)", border: "1px solid var(--line-1)",
                }} onClick={() => go("slog:acc-apt-type", { sid, sub: t.id })}>
                  <div className="row between">
                    <div className="h-3" style={{fontSize: 15}}>{c.name}</div>
                    <span className="mono dim" style={{fontSize: 12}}>{t.avg}%</span>
                  </div>
                  <div className="muted mt-2" style={{fontSize: 12.5}}>
                    {t.sessions} session{t.sessions === 1 ? "" : "s"} · target 5 sessions ≥ 60%
                  </div>
                  <div className="mt-3">
                    <MiniSparkline values={t.trend.length ? t.trend : [0]}/>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function ScreenAccAptType() {
  const { route, go, state } = useApp();
  const sid = route.params?.sid;
  const sub = route.params?.sub;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const apt = WINNIFY.aptitudeClusters[sub];
  if (!apt) return null;
  const trend = [0.45, 0.52, 0.58, 0.62, 0.68, 0.71];
  const [running, setRunning] = useState(false);
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState(null);
  const [shown, setShown] = useState(false);

  const mcqs = WINNIFY.quiz;
  const q = mcqs[qi % mcqs.length];

  const reveal = (ci) => {
    if (shown) return;
    setPick(ci);
    setShown(true);
  };
  const next = () => {
    if (qi < 7) { setQi(qi + 1); setPick(null); setShown(false); }
    else { setRunning(false); setQi(0); setPick(null); setShown(false); }
  };

  if (running) {
    return (
      <>
        <UI.Topbar
          crumbs={["Slog Overs", s.role, "Acceleration", "Aptitude", apt.name, "Session"]}
          right={<button className="btn btn-sm" onClick={() => setRunning(false)}><Icons.ArrowL/> Stop</button>}
        />
        <div className="viewport">
          <div className="viewport-inner fade-in" style={{maxWidth: 720}}>
            <div className="card card-pad fade-in">
              <div className="row between">
                <div className="label">Q{qi+1} of 8 · {apt.name}</div>
                <span className={`chip ${q.difficulty === "Easy" ? "chip-success" : q.difficulty === "Medium" ? "chip-warn" : "chip-danger"}`}>{q.difficulty}</span>
              </div>
              <h2 className="h-2 mt-3" style={{fontSize: 18, lineHeight: 1.5}}>{q.q}</h2>
              <div className="col gap-2 mt-4">
                {q.choices.map((c, i) => {
                  const isAnswer = shown && i === q.answer;
                  const isWrong  = shown && pick === i && i !== q.answer;
                  return (
                    <button key={i} onClick={() => reveal(i)}
                      className="row gap-3"
                      style={{
                        padding: "12px 14px", textAlign: "left", borderRadius: 8,
                        border: `1.5px solid ${isAnswer ? "var(--success)" : isWrong ? "var(--danger)" : pick === i ? "var(--accent)" : "var(--line-2)"}`,
                        background: isAnswer ? "var(--success-tint)" : isWrong ? "var(--danger-tint)" : pick === i ? "var(--accent-tint)" : "var(--surface)",
                        cursor: shown ? "default" : "pointer", fontSize: 13.5,
                      }}>
                      <span className="mono dim" style={{fontSize: 11, width: 18}}>{String.fromCharCode(65+i)}</span>
                      <span>{c}</span>
                      {isAnswer && <Icons.Check size={14} style={{marginLeft:"auto", color:"var(--success)"}}/>}
                    </button>
                  );
                })}
              </div>
              {shown && (
                <div className="card card-pad mt-4" style={{background: pick === q.answer ? "var(--success-tint)" : "var(--danger-tint)"}}>
                  <div className="row gap-2">
                    {pick === q.answer ? <Icons.Check size={14}/> : <Icons.Info size={14}/>}
                    <strong style={{fontSize: 13}}>{pick === q.answer ? "Correct." : "Not quite."}</strong>
                  </div>
                  <div className="muted mt-2" style={{fontSize: 12.5}}>
                    Brief AI-generated explanation: the correct choice anchors on the underlying invariant.
                  </div>
                </div>
              )}
              <div className="row between mt-6">
                <span className="muted" style={{fontSize: 12}}>Click an answer to reveal.</span>
                {!shown
                  ? <button className="btn btn-ghost" onClick={next}>Skip →</button>
                  : <button className="btn btn-accent" onClick={next}>{qi < 7 ? "Next →" : "Finish session"}</button>}
              </div>
              <div className="progress accent mt-4"><span style={{width: ((qi+1)/8*100) + "%"}}></span></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Acceleration", "Aptitude", apt.name]}
        right={<button className="btn btn-sm" onClick={() => go("slog:acc-apthub", { sid })}><Icons.ArrowL/> Hub</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="row between wrap gap-3">
            <div className="col gap-2">
              <div className="label">ACC-13 · Aptitude Type Detail</div>
              <h1 style={{margin: 0, fontSize: 28, fontWeight: 500}}>{apt.name}</h1>
              <div className="muted" style={{fontSize: 13.5, maxWidth: "55ch"}}>
                Score trend across recent sessions. Practice runs inline — when you finish, you return here, not the hub.
              </div>
            </div>
            <Stat label="Current avg" value={`${Math.round(trend[trend.length-1] * 100)}%`} sub="last 6 sessions"/>
          </div>

          <div className="card card-pad mt-6">
            <div className="row between">
              <div className="label">Score trend</div>
              <span className="mono dim" style={{fontSize: 11}}>Last 6 sessions</span>
            </div>
            <div className="mt-4">
              <SessionsTrend values={trend}/>
            </div>
          </div>

          <div className="row gap-3 wrap mt-4">
            <div className="card card-pad" style={{flex: "1 1 240px"}}>
              <div className="label">Strong topics</div>
              <div className="row gap-2 wrap mt-2">
                <span className="chip chip-success">Percentages</span>
                <span className="chip chip-success">Ratios</span>
              </div>
            </div>
            <div className="card card-pad" style={{flex: "1 1 240px"}}>
              <div className="label">Needs work</div>
              <div className="row gap-2 wrap mt-2">
                <span className="chip chip-warn">Probability</span>
                <span className="chip chip-warn">Time & Work</span>
              </div>
            </div>
          </div>

          <div className="row gap-2 mt-6">
            <button className="btn btn-accent btn-lg" onClick={() => setRunning(true)}>
              <Icons.Play size={14}/> Start new session
            </button>
            <button className="btn btn-lg" onClick={() => go("slog:acc-apthub", { sid })}>Back to hub</button>
          </div>
        </div>
      </div>
    </>
  );
}

function MiniSparkline({ values }) {
  if (!values.length) return <div className="muted" style={{fontSize: 11}}>No sessions yet</div>;
  const W = 200, H = 36;
  const max = 1, min = 0;
  const pts = values.map((v, i) => [(i/Math.max(values.length-1,1))*W, H - ((v-min)/(max-min))*H]);
  const d = pts.map((p, i) => (i===0?"M":"L") + p[0] + " " + p[1]).join(" ");
  return (
    <svg width={W} height={H}>
      <path d={d} stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
      {pts.map(([x,y], i) => <circle key={i} cx={x} cy={y} r={2} fill="var(--accent)"/>)}
    </svg>
  );
}

function SessionsTrend({ values }) {
  const W = 720, H = 160;
  const max = 1, min = 0;
  const pts = values.map((v, i) => [(i/Math.max(values.length-1,1))*W, H - ((v-min)/(max-min))*(H-20) - 10]);
  const d = pts.map((p, i) => (i===0?"M":"L") + p[0] + " " + p[1]).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width: "100%", height: "auto"}}>
      <line x1="0" y1={H - 10 - (0.6 * (H-20))} x2={W} y2={H - 10 - (0.6 * (H-20))}
            stroke="var(--warn)" strokeDasharray="4 4" strokeWidth="1"/>
      <text x={W-4} y={H - 10 - (0.6 * (H-20)) - 4} textAnchor="end" style={{fontSize: 10, fill: "var(--warn)", fontFamily: "var(--font-mono)"}}>60% threshold</text>
      <path d={d} stroke="var(--accent)" strokeWidth="2" fill="none"/>
      {pts.map(([x,y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={4} fill="var(--accent)"/>
          <text x={x} y={y - 10} textAnchor="middle" style={{fontSize: 10, fill: "var(--ink-2)", fontFamily: "var(--font-mono)"}}>{Math.round(values[i] * 100)}%</text>
        </g>
      ))}
    </svg>
  );
}

window.AccelerationBody = AccelerationBody;
window.ScreenAccTopic = ScreenAccTopic;
window.ScreenAccSubtopic = ScreenAccSubtopic;
window.ScreenAccMCQ = ScreenAccMCQ;
window.ScreenAccCheatSheet = ScreenAccCheatSheet;
window.ScreenAccWinSpeak = ScreenAccWinSpeak;
window.ScreenAccWinSpeakReport = ScreenAccWinSpeakReport;
window.ScreenAccBehavioral = ScreenAccBehavioral;
window.ScreenAccBehSingle = ScreenAccBehSingle;
window.ScreenAccBehPractice = ScreenAccBehPractice;
window.ScreenAccBehReport = ScreenAccBehReport;
window.ScreenAccAptHub = ScreenAccAptHub;
window.ScreenAccAptType = ScreenAccAptType;
