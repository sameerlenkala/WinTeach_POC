// SO-17 Interview Prep cluster (embedded WinSpeak) + SO-19 Mock Interview
function ScreenInterview() {
  const { route, go, state } = useApp();
  const sid = route.params?.sid;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const phase = s.activePhase;
  const compressed = phase === "acceleration";
  const [tab, setTab] = useState("technical");
  const [active, setActive] = useState(null);

  const questions = {
    technical: [
      { id: "t1", q: "Walk me through how you'd design a URL shortener.", round: "System Design (Mid)", time: "4–6 min" },
      { id: "t2", q: "Reverse a linked list in-place. Now do it recursively. What changes?", round: "DSA Round", time: "3–5 min" },
      { id: "t3", q: "Difference between SQL and NoSQL — when would you pick each?", round: "DSA Round", time: "2–3 min" },
      { id: "t4", q: "Explain the React reconciliation algorithm in your own words.", round: "DSA Round", time: "3–4 min" },
    ],
    behavioural: [
      { id: "b1", q: "Tell me about a time you had to push back on a decision.", round: "Hiring Manager", time: "2–3 min" },
      { id: "b2", q: "Describe a project where you didn't meet the deadline.", round: "Hiring Manager", time: "2–3 min" },
      { id: "b3", q: "Why this role at this company, specifically?", round: "Hiring Manager", time: "1–2 min" },
    ],
  };

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, WUTIL.phaseLabel(phase), "Interview Prep"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:phase", { sid, phase })}><Icons.ArrowL/> Phase</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="row between">
            <div className="col gap-2">
              <div className="label">SO-17 · Interview Prep · Embedded WinSpeak</div>
              <h1 style={{margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em"}}>
                {compressed ? "Compressed Interview Prep" : "Interview Prep"}
              </h1>
              <div className="muted" style={{fontSize: 13.5}}>
                {compressed
                  ? "Acceleration mode · fewer questions, high-frequency topics only, faster pacing."
                  : "Powerplay mode · full set with pre-answer tips and AI debrief."}
                {" "}Progress is isolated to this session — does not sync to standalone WinSpeak.
              </div>
            </div>
            <div className="row gap-6">
              <Stat label="Technical" value={`${WUTIL.pct(s.interviewPrep.technical)}%`} sub={`${questions.technical.length} prompts`}/>
              <Stat label="Behavioural" value={`${WUTIL.pct(s.interviewPrep.behavioural)}%`} sub={`${questions.behavioural.length} prompts`}/>
            </div>
          </div>

          <div className="tabs mt-6">
            <button className={"tab " + (tab === "technical" ? "active" : "")} onClick={() => setTab("technical")}>Technical</button>
            <button className={"tab " + (tab === "behavioural" ? "active" : "")} onClick={() => setTab("behavioural")}>Behavioural</button>
          </div>

          <div className="col gap-2 mt-4">
            {questions[tab].map((q, i) => (
              <button key={q.id} className="card card-hover" style={{padding: 18, textAlign: "left", cursor: "pointer"}}
                      onClick={() => setActive(q)}>
                <div className="row between">
                  <div className="row gap-3" style={{flex: 1, minWidth: 0}}>
                    <span className="mono dim" style={{fontSize: 11, width: 20}}>Q{i+1}</span>
                    <div className="col" style={{gap: 4, minWidth: 0, flex: 1}}>
                      <div style={{fontSize: 14, fontWeight: 500}}>{q.q}</div>
                      <div className="row gap-2">
                        <span className="chip">{q.round}</span>
                        <span className="mono dim" style={{fontSize: 11}}>· {q.time}</span>
                      </div>
                    </div>
                  </div>
                  <Icons.Chevron size={14} color="var(--ink-3)"/>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <UI.Modal open={!!active} onClose={() => setActive(null)} size="modal-lg">
        {active && <WinspeakInline q={active} compressed={compressed} onClose={() => setActive(null)}/>}
      </UI.Modal>
    </>
  );
}

function WinspeakInline({ q, compressed, onClose }) {
  const [stage, setStage] = useState("tips"); // tips | recording | debrief
  return (
    <>
      <div className="modal-head">
        <div className="row between">
          <div className="label">WinSpeak · embedded · {q.round}</div>
          <button className="btn btn-sm btn-ghost" onClick={onClose}><Icons.Close size={14}/></button>
        </div>
        <h2 className="h-2 mt-2">{q.q}</h2>
      </div>
      <div className="modal-pad" style={{paddingTop: 0}}>
        {stage === "tips" && (
          <div className="card card-pad" style={{background: "var(--accent-tint)", border: "1px solid var(--color-primary-tint-2)"}}>
            <div className="label">{compressed ? "Quick pointers" : "Pre-answer tips"}</div>
            <ul className="mt-2" style={{paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-2)"}}>
              <li>Frame your answer as <strong>context → action → outcome</strong>.</li>
              <li>Lead with the design decision, then justify with constraints.</li>
              {!compressed && <li>If pressed for trade-offs, name two: latency vs consistency, cost vs flexibility.</li>}
              {!compressed && <li>Avoid filler — pause is fine, "um" is not.</li>}
            </ul>
            <button className="btn btn-accent mt-4" onClick={() => setStage("recording")}><Icons.Mic size={12}/> I'm ready, record answer</button>
          </div>
        )}
        {stage === "recording" && (
          <div className="card card-pad" style={{textAlign: "center", background: "var(--surface-2)"}}>
            <div className="mono dim" style={{fontSize: 11}}>● Recording · 00:42</div>
            <div style={{margin: "20px auto", width: 70, height: 70, borderRadius: 999, background: "var(--danger)", display: "grid", placeItems: "center", color: "white"}}>
              <Icons.Mic size={24}/>
            </div>
            <div className="row gap-1" style={{justifyContent: "center", height: 30, alignItems: "center"}}>
              {[...Array(28)].map((_, i) => (
                <div key={i} style={{width: 3, height: 6 + Math.abs(Math.sin(i*0.6 + Date.now()/300))*22, background: "var(--ink-2)", borderRadius: 99}}></div>
              ))}
            </div>
            <button className="btn mt-4" onClick={() => setStage("debrief")}>Stop &amp; debrief</button>
          </div>
        )}
        {stage === "debrief" && (
          <div className="col gap-3">
            <div className="row gap-4 wrap">
              <Stat label="Clarity" value="78%" sub="structural"/>
              <Stat label="Keywords" value="6/9" sub="hit"/>
              <Stat label="Pace" value="142 wpm" sub="target 130–150"/>
              <Stat label="Filler" value="3" sub="ums/uhs"/>
            </div>
            <div className="card card-pad" style={{background: "var(--surface-2)"}}>
              <div className="label">AI debrief</div>
              <div className="mt-2" style={{fontSize: 13.5, lineHeight: 1.6}}>
                Your context framing was strong but you jumped to implementation before sketching the high-level design. Try opening with the <strong>API contract</strong> before describing the database. You missed mentioning <strong>read/write ratio</strong> and <strong>cache invalidation</strong> — both are expected for this round.
              </div>
            </div>
            <div className="card card-pad">
              <div className="label">Suggested keywords</div>
              <div className="row gap-2 wrap mt-2">
                {["API contract","read/write ratio","cache invalidation","sharding strategy","consistency model"].map(k =>
                  <span key={k} className="chip chip-power">{k}</span>)}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Close</button>
        {stage === "debrief" && <button className="btn btn-primary">Mark prompt complete <Icons.Check size={12}/></button>}
      </div>
    </>
  );
}

// ────────────────────── SO-19 Mock Interview ──────────────────────
function ScreenMock() {
  const { route, go, state } = useApp();
  const sid = route.params?.sid;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const [running, setRunning] = useState(false);
  const [roundIdx, setRoundIdx] = useState(0);
  const [done, setDone] = useState(false);

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Final Over", "Mock Interview"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:phase", { sid, phase: "final-over" })}><Icons.ArrowL/> Final Over</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">

          {!running && !done && (
            <>
              <div className="label">SO-19 · Mock interview session</div>
              <h1 className="h-display mt-2" style={{fontSize: 36}}>Full simulated interview</h1>
              <p className="muted mt-2" style={{maxWidth: "60ch"}}>
                {s.rounds.length} rounds simulated in sequence{s.company && WINNIFY.companies.includes(s.company) ? <> with <strong>{s.company}</strong>-specific scenarios</> : ""}.
                Expect ~{s.rounds.length * 12} minutes end-to-end.
              </p>

              <div className="card mt-6">
                <div style={{padding: "16px 20px", borderBottom: "1px solid var(--line-1)", background: "var(--surface-2)"}}>
                  <div className="label">Round sequence</div>
                </div>
                {s.rounds.map((r, i) => (
                  <div key={r.id} className="row between" style={{padding: "12px 20px", borderBottom: i < s.rounds.length-1 ? "1px solid var(--line-1)" : 0}}>
                    <div className="row gap-3">
                      <span className="mono dim" style={{fontSize: 11, width: 22}}>R{i+1}</span>
                      <span style={{fontSize: 14}}>{r.name}</span>
                    </div>
                    <span className={`chip ${r.kind === "Technical" ? "chip-power" : r.kind === "Behavioural" ? "chip-accel" : "chip-final"}`}>{r.kind}</span>
                  </div>
                ))}
              </div>

              <div className="row gap-2 mt-6">
                <button className="btn btn-accent btn-lg" onClick={() => setRunning(true)}>
                  <Icons.Play size={14}/> Start mock
                </button>
                <button className="btn btn-lg">Configure rounds</button>
              </div>
            </>
          )}

          {running && (
            <div className="card card-pad fade-in">
              <div className="row between">
                <div className="label">Round {roundIdx+1} of {s.rounds.length}</div>
                <div className="row gap-2">
                  <span className="chip"><Icons.Clock size={11}/>&nbsp;12:34</span>
                  <button className="btn btn-sm" onClick={() => setRunning(false)}>End mock</button>
                </div>
              </div>
              <h2 className="h-2 mt-2">{s.rounds[roundIdx].name}</h2>
              <div className="card card-pad mt-4" style={{background: "var(--surface-2)"}}>
                <div className="label">Interviewer prompt</div>
                <div className="h-3 mt-2" style={{fontSize: 16, lineHeight: 1.5}}>
                  {s.rounds[roundIdx].kind === "Technical"
                    ? "Design a system that ingests 100K events per second from mobile clients and supports near-real-time analytics queries."
                    : s.rounds[roundIdx].kind === "Behavioural"
                    ? "Tell me about a time you disagreed with a teammate's technical choice. How did you resolve it?"
                    : "Walk me through your strongest project — what's it for, what's the stack, and what would you change in hindsight?"}
                </div>
              </div>

              <div className="row gap-3 mt-4" style={{justifyContent: "center"}}>
                <button className="btn btn-accent btn-lg"><Icons.Mic size={14}/> Record answer</button>
                <button className="btn">Skip prompt</button>
              </div>

              <div className="divider mt-6"></div>
              <div className="row between mt-4">
                <button className="btn" disabled={roundIdx === 0} onClick={() => setRoundIdx(i => i - 1)}>← Prev round</button>
                {roundIdx < s.rounds.length - 1
                  ? <button className="btn btn-primary" onClick={() => setRoundIdx(i => i + 1)}>Next round →</button>
                  : <button className="btn btn-accent" onClick={() => { setRunning(false); setDone(true); }}>Finish mock</button>}
              </div>
            </div>
          )}

          {done && (
            <div className="fade-in">
              <div className="label">SO-19 · Post-session report</div>
              <h1 className="h-display mt-2" style={{fontSize: 32}}>Mock complete</h1>
              <div className="row gap-3 wrap mt-4">
                <Stat label="Overall" value="74%" sub="weighted across rounds"/>
                <Stat label="Strongest" value={s.rounds[0]?.name || "—"} sub="round"/>
                <Stat label="Weakest" value={s.rounds[s.rounds.length-1]?.name || "—"} sub="round"/>
                <Stat label="Duration" value={`${s.rounds.length * 12} min`} sub="end-to-end"/>
              </div>

              <div className="row gap-3 wrap mt-6">
                <div className="card card-pad" style={{flex: "1 1 320px"}}>
                  <div className="h-3">Performance tips</div>
                  <ul className="mt-2" style={{paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: "var(--ink-2)"}}>
                    <li>System design: open with API contract before storage.</li>
                    <li>Behavioural: tighten STAR — "Action" was buried in context.</li>
                    <li>DSA: explain complexity unprompted, before the interviewer asks.</li>
                  </ul>
                </div>
                <div className="card card-pad" style={{flex: "1 1 320px"}}>
                  <div className="h-3">Topic review</div>
                  <div className="col gap-2 mt-2">
                    {[
                      "Sharding strategies",
                      "Read replicas vs cache",
                      "Sliding window — implementation",
                    ].map(t => (
                      <button key={t} className="row between" style={{padding: "10px 12px", borderRadius: 6, border: "1px solid var(--line-1)", background: "var(--surface-2)", cursor:"pointer"}}>
                        <span style={{fontSize: 13}}>{t}</span>
                        <Icons.ArrowR size={12} color="var(--ink-3)"/>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="row gap-2 mt-6">
                <button className="btn btn-primary" onClick={() => { setDone(false); setRoundIdx(0); }}>Run another mock</button>
                <button className="btn" onClick={() => go("slog:phase", { sid, phase: "final-over" })}>Back to Final Over</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ────────────────────── SO-18 Resume cluster ──────────────────────
function ScreenResume() {
  const { route, go, state, setState, showToast } = useApp();
  const sid = route.params?.sid;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const [scanning, setScanning] = useState(false);
  const [showExisting, setShowExisting] = useState(false);

  const upload = () => {
    // If another session has a resume, offer to reuse
    const other = state.sessions.find(x => x.id !== sid && x.resume.uploaded);
    if (other) { setShowExisting(true); return; }
    runScan();
  };

  const runScan = () => {
    setScanning(true);
    setTimeout(() => {
      setState({
        sessions: state.sessions.map(x => x.id === sid ? ({
          ...x,
          resume: {
            uploaded: true,
            gaps: [
              { id: "g1", text: "Quantify impact on Winnify rebuild project", status: "open" },
              { id: "g2", text: "Add metrics for backend internship at Razorpay", status: "open" },
              { id: "g3", text: "Mention CI/CD pipeline experience", status: "open" },
              { id: "g4", text: "Strengthen action verbs in education section", status: "open" },
              { id: "g5", text: "Add ATS-friendly skills line", status: "open" },
            ]
          }
        }) : x)
      });
      setScanning(false);
      showToast("Resume scanned — 5 gaps detected.");
    }, 1800);
  };

  const resolve = (gid) => {
    setState({
      sessions: state.sessions.map(x => x.id === sid ? {
        ...x,
        resume: { ...x.resume, gaps: x.resume.gaps.map(g => g.id === gid ? { ...g, status: "resolved" } : g) }
      } : x)
    });
  };

  const ready = s.resume.uploaded && s.resume.gaps.length && s.resume.gaps.every(g => g.status === "resolved");
  const resolved = s.resume.gaps.filter(g => g.status === "resolved").length;

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, WUTIL.phaseLabel(s.activePhase), "Resume"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:phase", { sid, phase: s.activePhase })}><Icons.ArrowL/> Phase</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="row between">
            <div className="col gap-2">
              <div className="label">SO-18 · Resume cluster · session-scoped</div>
              <h1 style={{margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em"}}>Resume</h1>
              <div className="muted" style={{fontSize: 13.5, maxWidth: "60ch"}}>
                Upload once per session — AI scans against <strong>{s.role}</strong> and surfaces specific gaps. Resolve them to lock the resume for Final Over.
              </div>
            </div>
            {s.resume.uploaded && (
              <div className="col" style={{alignItems: "flex-end"}}>
                <div className="mono dim" style={{fontSize: 12}}>{resolved}/{s.resume.gaps.length} gaps resolved</div>
                <div className="h-2 mt-1" style={{fontSize: 22}}>
                  {WUTIL.pct(resolved / Math.max(1, s.resume.gaps.length))}%
                </div>
                {ready && <span className="chip chip-success mt-2"><Icons.Check size={11}/>&nbsp;Locked &amp; ready</span>}
              </div>
            )}
          </div>

          {!s.resume.uploaded && !scanning && (
            <div className="card card-pad mt-6" style={{textAlign:"center", padding: 40, border: "2px dashed var(--line-2)"}}>
              <Icons.Upload size={36} className="dim"/>
              <div className="h-3 mt-3">Upload your resume to begin</div>
              <div className="muted mt-2" style={{fontSize: 12.5}}>PDF, DOCX, or paste from clipboard · max 5 MB</div>
              <div className="row gap-2 mt-4" style={{justifyContent:"center"}}>
                <button className="btn btn-accent" onClick={upload}><Icons.Upload size={12}/> Choose file</button>
                <button className="btn">Paste resume text</button>
              </div>
            </div>
          )}

          {scanning && (
            <div className="card card-pad mt-6" style={{textAlign: "center", padding: 40}}>
              <Icons.Sparkle size={32}/>
              <div className="h-3 mt-3">Scanning resume against {s.role}</div>
              <div className="muted mt-2">Detecting gaps · checking keywords · evaluating quantification</div>
              <div className="progress accent mt-4" style={{maxWidth: 360, margin: "16px auto 0"}}><span className="skel" style={{width:"60%", height: "100%", display:"block"}}></span></div>
            </div>
          )}

          {s.resume.uploaded && !scanning && (
            <>
              <div className="card mt-6" style={{padding: 0}}>
                <div className="row between" style={{padding: "14px 20px", borderBottom: "1px solid var(--line-1)", background: "var(--surface-2)"}}>
                  <div className="row gap-2"><Icons.File size={14}/><span className="mono" style={{fontSize: 12}}>sameer_anand_resume_v3.pdf</span><span className="chip">2 pages · uploaded {WUTIL.shortDate(s.createdAt)}</span></div>
                  <div className="row gap-2">
                    <button className="btn btn-sm">Re-upload</button>
                    <button className="btn btn-sm">Re-run scan</button>
                  </div>
                </div>
                <div className="row gap-2 wrap" style={{padding: 14}}>
                  <Stat label="Pages" value="2" sub="length"/>
                  <Stat label="Skills hit" value="22/30" sub="role keywords"/>
                  <Stat label="Quantification" value="60%" sub="bullets w/ metrics"/>
                  <Stat label="ATS score" value="A−" sub="format"/>
                </div>
              </div>

              <div className="h-3 mt-6">Detected gaps · {s.resume.gaps.length}</div>
              <div className="col gap-2 mt-3">
                {s.resume.gaps.map(g => (
                  <div key={g.id} className="row between" style={{padding: 14, borderRadius: 8, border: "1px solid var(--line-1)", background: g.status === "resolved" ? "var(--success-tint)" : "var(--surface)"}}>
                    <div className="row gap-3" style={{flex: 1}}>
                      <span style={{width: 16, height: 16, borderRadius: 99, border: "1.5px solid " + (g.status === "resolved" ? "var(--success)" : "var(--line-strong)"),
                                    background: g.status === "resolved" ? "var(--success)" : "transparent",
                                    display: "grid", placeItems: "center", color: "white"}}>
                        {g.status === "resolved" && <Icons.Check size={10}/>}
                      </span>
                      <div className="col" style={{gap: 2}}>
                        <div style={{fontSize: 13.5, textDecoration: g.status === "resolved" ? "line-through" : "none", color: g.status === "resolved" ? "var(--ink-3)" : "var(--ink-1)"}}>{g.text}</div>
                        <span className="mono dim" style={{fontSize: 11}}>{g.status === "resolved" ? "Resolved" : "Action: edit resume → re-run scan"}</span>
                      </div>
                    </div>
                    {g.status === "open" && <button className="btn btn-sm" onClick={() => resolve(g.id)}>Mark resolved</button>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <UI.Modal open={showExisting} onClose={() => setShowExisting(false)}>
        <div className="modal-head">
          <div className="label">Existing resume found</div>
          <h2 className="h-2 mt-2">Use your existing resume?</h2>
        </div>
        <div className="modal-pad" style={{paddingTop: 0}}>
          <div className="muted" style={{fontSize: 13.5}}>You've uploaded a resume in another active session. Reuse it for this session, or upload a fresh version.</div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={() => { setShowExisting(false); runScan(); }}>Upload new</button>
          <button className="btn btn-primary" onClick={() => { setShowExisting(false); runScan(); }}>Use existing</button>
        </div>
      </UI.Modal>
    </>
  );
}

window.ScreenInterview = ScreenInterview;
window.ScreenMock = ScreenMock;
window.ScreenResume = ScreenResume;
