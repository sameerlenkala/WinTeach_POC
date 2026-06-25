// ──────────────────────────────────────────────────────────────────────
// V2.0 · Final Over — GD Simulation (NEW)
// FO-GD-01 GD Simulation Session
// FO-GD-02 GD Debrief
// Visible only when a GD round is confirmed in SO-04.
// ──────────────────────────────────────────────────────────────────────

function ScreenGDSimulation() {
  const { route, go, state, setState, showToast } = useApp();
  const sid = route.params?.sid;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  if (!FO.hasGD(s)) {
    return (
      <div className="viewport"><div className="viewport-inner">
        <div className="banner danger">GD Simulation is only available when a Group Discussion round is confirmed. <button className="btn btn-sm" style={{marginLeft:8}} onClick={() => go("slog:phase", { sid, phase: "final-over" })}>Back</button></div>
      </div></div>
    );
  }
  const fo = s.finalOver || {};
  const cuesViewed = fo.cuesViewed || fo.quickTipsViewed;
  const [showCuesModal, setShowCuesModal] = useState(false);
  const [stage, setStage] = useState("intro"); // intro · session · loading
  const [showCuesNudge, setShowCuesNudge] = useState(!cuesViewed);

  // Pick a topic deterministically based on session id
  const topic = WINNIFY.gdTopics[parseInt(sid.slice(-1)) % WINNIFY.gdTopics.length] || WINNIFY.gdTopics[0];

  // Mock multi-participant timeline
  const [turn, setTurn] = useState(0);
  const turns = [
    { who: "AI · Moderator", text: `Today's topic: "${topic.topic}" — you'll have 8 minutes. Please share your opening view.`, isYou: false },
    { who: "You", text: "[Recording — your response]", isYou: true },
    { who: "AI · Aarav (Participant)", text: topic.angles[0] + " — that's where I land.", isYou: false },
    { who: "AI · Priya (Participant)", text: topic.angles[1] + " — let's push back on that.", isYou: false },
    { who: "You", text: "[Recording — your counter]", isYou: true },
    { who: "AI · Devansh (Participant)", text: topic.angles[2] + " — bringing this third angle in.", isYou: false },
    { who: "You", text: "[Recording — your closing]", isYou: true },
    { who: "AI · Moderator", text: "Thanks. Time's up. Generating your debrief now.", isYou: false },
  ];

  const finish = () => {
    setStage("loading");
    setTimeout(() => {
      const debrief = {
        overall: "Strong",
        argumentQuality: 78,
        communication: 72,
        participation: 81,
        tips: [
          "You opened with a clear thesis — good. Time spent defending it dropped after Priya's counter.",
          "Quantitative evidence appeared twice. Try thrice — interviewers track citation density.",
          "You ceded floor space to Devansh once unnecessarily. Stake out the close more confidently.",
          "Tone stayed even when interrupted. Strong signal.",
          "Re-summarise the room's positions before your closing — 10 seconds, big credibility lift.",
        ],
        transcript: turns,
        at: new Date().toISOString(),
      };
      FO.patchFO(state, setState, sid, {
        gdSimulation: {
          complete: true,
          runCount: (fo.gdSimulation?.runCount || 0) + 1,
          lastDebrief: debrief,
          lastRunAt: new Date().toISOString(),
        }
      });
      showToast("GD Simulation complete · debrief ready");
      go("slog:gd-debrief", { sid });
    }, 1800);
  };

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Final Over", "GD Simulation"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:phase", { sid, phase: "final-over" })}><Icons.ArrowL/> Final Over</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">

          {/* Interview Cues nudge */}
          {showCuesNudge && !cuesViewed && stage === "intro" && (
            <div className="banner info">
              <Icons.Spark size={14}/>
              <span>FO-01 · Review your <strong>Interview Cues</strong> before you begin.</span>
              <div className="row gap-2" style={{marginLeft: "auto"}}>
                <button className="btn btn-sm" onClick={() => setShowCuesNudge(false)}>Start anyway</button>
                <button className="btn btn-sm btn-primary" onClick={() => setShowCuesModal(true)}>View Cues</button>
              </div>
            </div>
          )}

          {stage === "intro" && (
            <>
              <div className="row between wrap gap-3 mt-2">
                <div className="col gap-2">
                  <div className="label">FO-GD-01 · GD Simulation</div>
                  <h1 style={{margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: "-0.02em"}}>
                    Group discussion simulation
                  </h1>
                  <p className="muted mt-2" style={{maxWidth: "62ch", fontSize: 13.5}}>
                    AI presents a GD topic and plays <strong>multiple discussion participants</strong>. You argue, defend and build on points like you would in a real group. On finish, you get a debrief on argument quality + communication.
                  </p>
                </div>
                <div className="row gap-2">
                  <span className="chip chip-final"><span className="chip-dot"></span>{FO.gdRound(s)?.name}</span>
                </div>
              </div>

              <div className="card card-pad mt-6" style={{background: "var(--surface-2)"}}>
                <div className="label">Today's topic</div>
                <h2 className="h-2 mt-2" style={{fontSize: 20, lineHeight: 1.4}}>{topic.topic}</h2>
                <div className="muted mt-3" style={{fontSize: 12.5}}>
                  Three opposing angles will be raised by the AI participants. Your job is to stake a position and defend it without dominating.
                </div>
                <div className="row gap-2 mt-3 wrap">
                  {topic.angles.map((a, i) => (
                    <span key={i} className="chip chip-outline">Angle {i+1}: {a.slice(0, 36)}…</span>
                  ))}
                </div>
              </div>

              <div className="row gap-3 wrap mt-6">
                {[
                  ["AI · Moderator", "Sets topic, manages time, asks for openings."],
                  ["AI · Aarav", "Strong opening view. Will defend hard."],
                  ["AI · Priya", "Counter-arguer. Plays devil's advocate."],
                  ["AI · Devansh", "Synthesiser. Tries to bridge positions."],
                ].map(([who, blurb]) => (
                  <div key={who} className="card card-pad" style={{flex: "1 1 200px"}}>
                    <div className="row gap-2">
                      <div style={{width: 32, height: 32, borderRadius: 99, background: "var(--surface-3)", display: "grid", placeItems: "center"}}>
                        <Icons.Brain size={14}/>
                      </div>
                      <div>
                        <div style={{fontSize: 13, fontWeight: 500}}>{who}</div>
                        <div className="muted" style={{fontSize: 11.5}}>{blurb}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="row gap-2 mt-6">
                <button className="btn btn-accent btn-lg" onClick={() => setStage("session")}>
                  <Icons.Play size={14}/> Begin GD Simulation
                </button>
                <button className="btn btn-lg" onClick={() => go("slog:phase", { sid, phase: "final-over" })}>
                  Not now
                </button>
              </div>
            </>
          )}

          {stage === "session" && (
            <div className="card card-pad fade-in">
              <div className="row between">
                <div className="row gap-2">
                  <span className="chip chip-final"><span className="chip-dot"></span>FO-GD-01 · Live</span>
                  <span className="mono dim" style={{fontSize: 12}}>Turn {turn + 1} of {turns.length}</span>
                </div>
                <div className="row gap-2">
                  <span className="chip"><Icons.Clock size={11}/>&nbsp;05:24</span>
                  <button className="btn btn-sm" onClick={() => setStage("intro")}>Exit</button>
                </div>
              </div>

              <div className="card card-pad mt-4" style={{background: "var(--surface-2)"}}>
                <div className="label">Topic</div>
                <div className="h-3 mt-1" style={{fontSize: 15, lineHeight: 1.4}}>{topic.topic}</div>
              </div>

              {/* Transcript so far */}
              <div className="col gap-3 mt-4">
                {turns.slice(0, turn + 1).map((t, i) => (
                  <div key={i} className="row gap-3" style={{alignItems: "flex-start"}}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 99, flexShrink: 0,
                      background: t.isYou ? "var(--accent)" : "var(--surface-3)",
                      color: t.isYou ? "white" : "var(--ink-1)",
                      display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600,
                    }}>{t.isYou ? "U" : t.who.includes("Moderator") ? "M" : t.who.split(" · ")[1]?.[0] || "A"}</div>
                    <div className="card card-pad" style={{
                      flex: 1,
                      background: t.isYou ? "var(--accent-tint)" : "var(--surface-2)",
                      border: t.isYou ? "1px solid var(--accent)" : "1px solid var(--line-1)",
                    }}>
                      <div className="label" style={{fontSize: 11}}>{t.who}</div>
                      <div className="mt-1" style={{fontSize: 13.5, color: "var(--ink-2)"}}>{t.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recording bar for your turns */}
              {turns[turn].isYou && (
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
              )}

              <div className="row between mt-6">
                <button className="btn" disabled={turn === 0} onClick={() => setTurn(t => t - 1)}>← Prev turn</button>
                {turn < turns.length - 1
                  ? <button className="btn btn-primary" onClick={() => setTurn(t => t + 1)}>Next turn →</button>
                  : <button className="btn btn-accent" onClick={finish}>Finish &amp; debrief</button>}
              </div>
              <div className="progress accel mt-4"><span style={{width: ((turn+1)/turns.length*100) + "%"}}></span></div>
            </div>
          )}

          {stage === "loading" && (
            <div className="card card-pad fade-in" style={{textAlign: "center", padding: 56, maxWidth: 560, margin: "40px auto"}}>
              <Icons.Sparkle size={36}/>
              <div className="h-3 mt-3">Analysing your GD performance…</div>
              <div className="muted mt-2" style={{fontSize: 12.5}}>Argument quality · communication · participation balance.</div>
              <div className="progress accent mt-6" style={{maxWidth: 320, margin: "0 auto"}}>
                <span className="skel" style={{width:"80%", height: "100%", display:"block"}}></span>
              </div>
            </div>
          )}
        </div>
      </div>

      <UI.Modal open={showCuesModal} onClose={() => setShowCuesModal(false)}>
        <InterviewCuesModal sid={sid} onClose={() => { setShowCuesModal(false); setShowCuesNudge(false); }}/>
      </UI.Modal>
    </>
  );
}

// FO-GD-02 · GD Debrief
function ScreenGDDebrief() {
  const { route, go, state, showToast } = useApp();
  const sid = route.params?.sid;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const gd = s.finalOver?.gdSimulation;
  if (!gd?.lastDebrief) {
    return (
      <div className="viewport"><div className="viewport-inner">
        <div className="banner danger">No debrief available — run the GD Simulation first.</div>
      </div></div>
    );
  }
  const d = gd.lastDebrief;

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Final Over", "GD Debrief"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:phase", { sid, phase: "final-over" })}><Icons.ArrowL/> Final Over</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="row between wrap gap-3">
            <div className="col gap-2">
              <div className="label">FO-GD-02 · GD Debrief</div>
              <h1 style={{margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: "-0.02em"}}>
                Group discussion · Run #{gd.runCount}
              </h1>
              <div className="muted" style={{fontSize: 13.5, maxWidth: "60ch"}}>
                Argument quality · communication · participation balance · improvement tips.
              </div>
            </div>
            <div className="col" style={{alignItems: "flex-end"}}>
              <div className="label">Overall</div>
              <div className="mono" style={{fontSize: 40}}>{d.overall}</div>
              <span className="chip chip-success mt-1"><Icons.Check size={11}/>&nbsp;GD Simulation complete</span>
            </div>
          </div>

          <div className="row gap-3 wrap mt-6">
            {[
              ["Argument quality", d.argumentQuality, "Stake · defence · evidence density"],
              ["Communication", d.communication, "Clarity · pace · interruption handling"],
              ["Participation", d.participation, "Air-time balance · floor-claiming"],
            ].map(([lbl, v, sub]) => (
              <div key={lbl} className="card card-pad" style={{flex: "1 1 240px"}}>
                <div className="row between">
                  <div className="label">{lbl}</div>
                  <span className="mono" style={{fontSize: 22}}>{v}%</span>
                </div>
                <div className="progress accel mt-2"><span style={{width: v + "%"}}></span></div>
                <div className="muted mt-3" style={{fontSize: 12, lineHeight: 1.5}}>{sub}</div>
              </div>
            ))}
          </div>

          <div className="card card-pad mt-4">
            <div className="label">3–5 Improvement tips</div>
            <ul className="mt-2" style={{paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: "var(--ink-2)"}}>
              {d.tips.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>

          <div className="card mt-4">
            <div style={{padding: "14px 20px", background: "var(--surface-2)", borderBottom: "1px solid var(--line-1)"}}>
              <div className="label">Transcript</div>
            </div>
            {d.transcript.map((t, i) => (
              <div key={i} style={{padding: "12px 20px", borderBottom: i < d.transcript.length - 1 ? "1px solid var(--line-1)" : 0}}>
                <div className="row gap-3" style={{alignItems: "flex-start"}}>
                  <span className="mono dim" style={{fontSize: 11, width: 22}}>{i+1}.</span>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: 12.5, fontWeight: 500, color: t.isYou ? "var(--accent)" : "var(--ink-1)"}}>{t.who}</div>
                    <div className="muted" style={{fontSize: 12.5, marginTop: 2}}>{t.text}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row gap-2 mt-6">
            <button className="btn btn-accent" onClick={() => go("slog:gd-simulation", { sid })}>
              <Icons.Refresh size={12}/> Run again
            </button>
            <button className="btn" onClick={() => showToast("AI feedback flagged for review.")}><Icons.Spark size={12}/>&nbsp;Flag AI feedback</button>
            <button className="btn" onClick={() => go("slog:phase", { sid, phase: "final-over" })}>Back to Final Over</button>
          </div>
        </div>
      </div>
    </>
  );
}

window.ScreenGDSimulation = ScreenGDSimulation;
window.ScreenGDDebrief = ScreenGDDebrief;
