// SO-12 Cluster view (Foundation sub-cluster) + SO-13 Diagnostic Quiz +
// SO-14 Skill Tree (3 variants) + SO-15 Topic View + SO-16 Foundation Adaptive Practice

const CLUSTER_META = {
  dsa:         { name: "Data Structures & Algorithms", topics: 14, hours: "12–18h" },
  dbms:        { name: "DBMS & SQL",                   topics: 12, hours: "8–12h" },
  os:          { name: "Operating Systems",             topics: 10, hours: "6–10h" },
  networking:  { name: "Networking",                    topics: 10, hours: "6–10h" },
  systemDesign:{ name: "System Design",                 topics: 8,  hours: "8–14h" },
};

function ScreenCluster() {
  const { route, go, state } = useApp();
  const sid = route.params?.sid;
  const cluster = route.params?.cluster || "dsa";
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const meta = CLUSTER_META[cluster];
  const v = s.foundation[cluster].progress;
  const hasQuizDone = state.quizDone?.[cluster];
  const onBack = () => go("slog:phase", { sid, phase: "powerplay" });

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Powerplay", meta.name]}
        right={<button className="btn btn-sm" onClick={onBack}><Icons.ArrowL size={16}/> Phase</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          {/* Page header */}
          <div className="row between wrap gap-4">
            <div className="col gap-2">
              <div className="label">SO-12 · Foundation cluster</div>
              <h1 style={{margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em"}}>{meta.name}</h1>
              <div className="muted" style={{fontSize: 13.5}}>{meta.topics} topics · est. {meta.hours} · shared across sessions</div>
            </div>
            <div className="row gap-6">
              <Stat label="Progress" value={`${WUTIL.pct(v)}%`} sub="cluster"/>
              <Stat label="Quiz" value={hasQuizDone ? "Done" : "Pending"} sub="diagnostic"/>
            </div>
          </div>

          {/* Skill tree — always the main content */}
          <SkillTree cluster={cluster} sid={sid}/>
        </div>
      </div>

      {/* Diagnostic quiz — centered modal over the page */}
      {!hasQuizDone && (
        <>
          <div style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.42)",
            backdropFilter: "blur(3px)",
            zIndex: 300,
          }}/>
          <div style={{
            position: "fixed",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(560px, calc(100vw - 48px))",
            zIndex: 301,
          }}>
            <DiagnosticQuiz cluster={cluster} sid={sid} inModal/>
          </div>
        </>
      )}
    </>
  );
}

function Step({ n, label, state }) {
  const styles = {
    done:    { bg: "var(--success)", color: "var(--paper)", line: "var(--success)" },
    current: { bg: "var(--ink-1)",   color: "var(--paper)", line: "var(--ink-2)" },
    todo:    { bg: "var(--surface-3)", color: "var(--ink-4)", line: "var(--line-2)" },
  }[state];
  return (
    <div className="row gap-2" style={{flex: 1}}>
      <span className="mono" style={{
        width: 20, height: 20, borderRadius: 999, display:"grid", placeItems:"center",
        background: styles.bg, color: styles.color, fontSize: 11, fontWeight: 600,
      }}>{state === "done" ? "✓" : n}</span>
      <span style={{fontSize: 12.5, color: state === "todo" ? "var(--ink-4)" : "var(--ink-1)"}}>{label}</span>
      {n < 3 && <div style={{flex:1, height: 1, background: styles.line}}></div>}
    </div>
  );
}

// ────────────────────── SO-13 Diagnostic Quiz ──────────────────────
function DiagnosticQuiz({ cluster, sid, inModal }) {
  const { setState, state, showToast } = useApp();
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState({});
  const [skipped, setSkipped] = useState(false);
  const qs = WINNIFY.quiz;
  const q = qs[i];

  const submit = () => {
    setState({ quizDone: { ...(state.quizDone || {}), [cluster]: { score: 2, total: qs.length, skipped: false } } });
    showToast("Quiz scored — Focus Topics calibrated.");
  };
  const skip = () => {
    setState({ quizDone: { ...(state.quizDone || {}), [cluster]: { skipped: true } } });
    showToast("Quiz skipped — default Focus Topics applied.");
  };

  if (skipped) return null;

  return (
    <div className="card card-pad" style={{marginTop: inModal ? 0 : 24, borderRadius: inModal ? 14 : undefined, boxShadow: inModal ? "0 8px 40px rgba(0,0,0,0.16)" : undefined}}>
      <div className="label">SO-13 · Diagnostic quiz</div>
      <div className="row between mt-2">
        <h3 className="h-2">Calibrate your skill tree</h3>
        <div className="mono dim" style={{fontSize: 12}}>Question {i+1} of {qs.length}</div>
      </div>
      <div className="muted mt-2" style={{fontSize: 13}}>10–15 adaptive questions. Skip if you'd rather work from the default Focus Topics — it's retryable any time.</div>

      <div className="card mt-4" style={{background: "var(--surface-2)", padding: 22, border: "1px solid var(--line-1)"}}>
        <div className="row gap-2"><span className="chip chip-power">Q{i+1}</span><span className="chip chip-outline">{cluster.toUpperCase()}</span></div>
        <div className="h-3 mt-3" style={{fontSize: 15, lineHeight: 1.5}}>{q.q}</div>
        <div className="col gap-2 mt-4">
          {q.choices.map((c, ci) => (
            <button key={ci}
                    onClick={() => setPicks({...picks, [q.id]: ci })}
                    className="row gap-3"
                    style={{
                      padding: "12px 14px", textAlign: "left",
                      borderRadius: 8, border: "1px solid var(--line-2)",
                      background: picks[q.id] === ci ? "var(--accent-tint)" : "var(--surface)",
                      borderColor: picks[q.id] === ci ? "var(--accent)" : "var(--line-2)",
                      cursor: "pointer",
                      fontSize: 13.5,
                    }}>
              <span className="mono dim" style={{fontSize: 11, width: 18}}>{String.fromCharCode(65+ci)}</span>
              <span>{c}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="row between mt-4">
        <button className="btn btn-ghost" onClick={skip}>Skip diagnostic →</button>
        <div className="row gap-2">
          <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>Previous</button>
          {i < qs.length - 1
            ? <button className="btn btn-primary" disabled={picks[q.id] === undefined} onClick={() => setI(i+1)}>Next <Icons.ArrowR size={12}/></button>
            : <button className="btn btn-accent" disabled={picks[q.id] === undefined} onClick={submit}>Submit &amp; calibrate <Icons.Sparkle size={12}/></button>
          }
        </div>
      </div>
    </div>
  );
}

// ────────────────────── SO-14 Skill Tree (3 variants) ──────────────────────
const CLUSTER_WINNIFY_KEY = {
  dsa: "DSA", dbms: "DBMS", os: "OS", networking: "Networking", systemDesign: "System Design"
};

function SkillTree({ cluster, sid }) {
  const { go, tweaks, setTweak, state } = useApp();
  const variant = tweaks?.skillTreeVariant || "branching";
  const s = state.sessions.find(x => x.id === sid);
  const rawData = WINNIFY.clusters[CLUSTER_WINNIFY_KEY[cluster] || cluster] || WINNIFY.clusters.DSA;

  const completedList = s?.completedTopics || [];
  const data = {
    ...rawData,
    topics: rawData.topics.map(t => {
      if (t.status === "done") return t;
      if (completedList.includes(t.id)) {
        return { ...t, status: "manual" };
      }
      return t;
    })
  };
  const [filter, setFilter] = useState("all");

  return (
    <div className="mt-6">
      <div className="row between">
        <div>
          <div className="label">SO-14 · Skill tree</div>
          <h3 className="h-2 mt-2">Topics &amp; dependencies</h3>
        </div>
        <div className="row gap-3">
          <div className="segmented">
            <button className={filter==="all"?"active":""} onClick={() => setFilter("all")}>All topics</button>
            <button className={filter==="focus"?"active":""} onClick={() => setFilter("focus")}>Focus only</button>
          </div>
          <div className="segmented">
            {[
              ["branching","Branching"],
              ["radial","Radial"],
              ["linear","Linear"],
            ].map(([v, lbl]) => (
              <button key={v} className={variant === v ? "active" : ""} onClick={() => setTweak("skillTreeVariant", v)}>{lbl}</button>
            ))}
          </div>
        </div>
      </div>

      <Legend/>

      <div className="card mt-3" style={{padding: variant === "linear" ? 0 : 20}}>
        {variant === "branching" && <SkillBranching data={data} filter={filter} sid={sid} cluster={cluster}/>}
        {variant === "radial"    && <SkillRadial    data={data} filter={filter} sid={sid} cluster={cluster}/>}
        {variant === "linear"    && <SkillLinear    data={data} filter={filter} sid={sid} cluster={cluster}/>}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="row gap-4 wrap mt-3" style={{fontSize: 12}}>
      <span className="row gap-2"><span style={{width:8, height:8, borderRadius: 99, background: "var(--success)"}}></span>Completed</span>
      <span className="row gap-2"><span style={{width:8, height:8, borderRadius: 99, background: "var(--accent)"}}></span>In progress</span>
      <span className="row gap-2"><Icons.Star size={11}/>Focus</span>
      <span className="row gap-2"><span style={{width:8, height:8, borderRadius: 99, background: "var(--surface-3)", border: "1px solid var(--line-2)"}}></span>Not started</span>
      <span className="row gap-2 dim"><span style={{width:8, height:8, borderRadius: 99, background: "var(--surface)", border: "1.5px dashed var(--line-strong)"}}></span>Self-marked</span>
    </div>
  );
}

// Variant: Branching grid with dependency arrows
function SkillBranching({ data, filter, sid, cluster }) {
  const { go } = useApp();
  const W = 720, H = 460, padX = 40, padY = 60;

  // Group topics by row, sorted by col within each row
  const byRow = {};
  data.topics.forEach(t => { (byRow[t.row] = byRow[t.row] || []).push(t); });
  Object.values(byRow).forEach(arr => arr.sort((a, b) => a.col - b.col));

  const numRows = Math.max(...data.topics.map(t => t.row)) + 1;
  const rowH = (H - 2 * padY) / (numRows - 1);

  // Evenly center nodes within each row
  const allPos = {};
  Object.entries(byRow).forEach(([rowStr, rowTopics]) => {
    const row = parseInt(rowStr);
    const n = rowTopics.length;
    rowTopics.forEach((t, i) => {
      allPos[t.id] = {
        x: padX + (i + 0.5) * (W - 2 * padX) / n,
        y: padY + row * rowH
      };
    });
  });

  return (
    <div style={{position: "relative", width: "100%", overflowX: "auto"}}>
      <svg width={W} height={H} style={{display:"block", width:"100%", height:"auto"}} viewBox={`0 0 ${W} ${H}`}>
        {data.edges.map(([a, b], i) => {
          const A = allPos[a], B = allPos[b];
          if (!A || !B) return null;
          const sameRow = Math.abs(A.y - B.y) < 5;
          if (sameRow) {
            // Dashed arc below nodes to show within-tier progression
            const mx = (A.x + B.x) / 2;
            return <path key={i}
              d={`M ${A.x} ${A.y + 16} Q ${mx} ${A.y + 46} ${B.x} ${B.y + 16}`}
              stroke="var(--line-2)" strokeWidth="1.2" fill="none"
              strokeDasharray="4 3" markerEnd="url(#arr2)"/>;
          }
          // Cross-tier: vertical S-curve from bottom of A to top of B
          const ay = A.y + 16, by = B.y - 16;
          const mid = (ay + by) / 2;
          return <path key={i}
            d={`M ${A.x} ${ay} C ${A.x} ${mid}, ${B.x} ${mid}, ${B.x} ${by}`}
            stroke="var(--line-2)" strokeWidth="1.5" fill="none" markerEnd="url(#arr2)"/>;
        })}
        <defs>
          <marker id="arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--line-strong)"/>
          </marker>
        </defs>
      </svg>
      {data.topics.map(t => {
        const p = allPos[t.id];
        const dim = filter === "focus" && t.status !== "focus";
        return (
          <button key={t.id}
            onClick={() => go("slog:topic", { sid, cluster, topic: t.id })}
            style={{
              position: "absolute", left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%`,
              transform: "translate(-50%, -50%)",
              padding: "8px 14px", borderRadius: 999,
              background: nodeBG(t.status), color: nodeColor(t.status),
              border: `1.5px ${t.status === "manual" ? "dashed" : "solid"} ${nodeBorder(t.status)}`,
              fontSize: 12.5, fontWeight: 500, cursor: "pointer", opacity: dim ? .25 : 1,
              transition: "transform .15s var(--ease)",
              boxShadow: "var(--shadow-1)",
              display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
            }}>
            {t.status === "focus" && <Icons.Star size={12}/>}
            {t.status === "done" && <Icons.Check size={12}/>}
            {t.name}
          </button>
        );
      })}
    </div>
  );
}

function nodeBG(status) {
  return status === "done" ? "var(--success-tint)" :
         status === "in-progress" ? "var(--accent-tint)" :
         status === "focus" ? "var(--color-w-orange-tint)" :
         status === "manual" ? "var(--surface)" :
         "var(--surface)";
}
function nodeColor(status) {
  return status === "done" ? "var(--success)" :
         status === "in-progress" ? "var(--accent)" :
         status === "focus" ? "var(--powerplay-deep)" :
         "var(--ink-2)";
}
function nodeBorder(status) {
  return status === "done" ? "var(--success)" :
         status === "in-progress" ? "var(--accent)" :
         status === "focus" ? "var(--powerplay)" :
         status === "manual" ? "var(--line-strong)" :
         "var(--line-2)";
}

// Variant: Radial — focus topics at the centre
function SkillRadial({ data, filter, sid, cluster }) {
  const { go } = useApp();
  const focus = data.topics.filter(t => t.status === "focus");
  const others = data.topics.filter(t => t.status !== "focus");
  const cx = 360, cy = 220, R1 = 100, R2 = 180;
  const list = filter === "focus" ? focus : data.topics;

  const placements = list.map((t, i) => {
    const isFocus = t.status === "focus";
    const angle = (i / list.length) * Math.PI * 2 - Math.PI/2;
    const r = isFocus && filter !== "focus" ? 0 : (isFocus ? 0 : R2);
    if (isFocus && filter !== "focus") {
      const angleF = (focus.indexOf(t) / focus.length) * Math.PI * 2 - Math.PI/2;
      return { t, x: cx + Math.cos(angleF) * R1, y: cy + Math.sin(angleF) * R1, isFocus: true };
    }
    return { t, x: cx + Math.cos(angle) * R2, y: cy + Math.sin(angle) * R2, isFocus };
  });

  return (
    <div style={{position: "relative", width: "100%", height: 440}}>
      <svg viewBox="0 0 720 440" style={{position:"absolute", inset: 0, width:"100%", height:"100%"}}>
        <circle cx={cx} cy={cy} r={R1} fill="rgba(99,102,241,0.04)" stroke="var(--line-strong)" strokeWidth="1.3" strokeDasharray="5 4"/>
        <circle cx={cx} cy={cy} r={R2} fill="none" stroke="var(--line-strong)" strokeWidth="1.3" strokeDasharray="5 4"/>
        <text x={cx} y={cy} dominantBaseline="central" textAnchor="middle"
              style={{fontSize: 11, fill: "var(--ink-4)", fontFamily: "var(--font-mono)"}}>FOCUS</text>
        <text x={cx + R2 - 10} y={cy - R2 + 4} textAnchor="end"
              style={{fontSize: 10, fill: "var(--ink-4)", fontFamily: "var(--font-mono)"}}>ALL TOPICS</text>
      </svg>
      {placements.map(({t, x, y}) => (
        <button key={t.id}
                onClick={() => go("slog:topic", { sid, cluster, topic: t.id })}
                style={{
          position: "absolute",
          left: `${(x/720)*100}%`, top: `${(y/440)*100}%`,
          transform: "translate(-50%, -50%)",
          padding: "8px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 500,
          background: nodeBG(t.status), color: nodeColor(t.status),
          border: `1.5px solid ${nodeBorder(t.status)}`, cursor: "pointer",
          display:"inline-flex", alignItems:"center", gap: 6, whiteSpace: "nowrap",
          boxShadow: "var(--shadow-1)",
        }}>
          {t.status === "focus" && <Icons.Star size={12}/>}
          {t.status === "done" && <Icons.Check size={12}/>}
          {t.name}
        </button>
      ))}
    </div>
  );
}

// Variant: Linear list (table-like)
function SkillLinear({ data, filter, sid, cluster }) {
  const { go } = useApp();
  const rows = data.topics.filter(t => filter === "all" || t.status === "focus");
  return (
    <div>
      <div className="row" style={{padding: "10px 16px", background: "var(--surface-2)", borderBottom: "1px solid var(--line-1)"}}>
        <span className="label" style={{flex: 1}}>Topic</span>
        <span className="label" style={{width: 110}}>Status</span>
        <span className="label" style={{width: 160}}>Depends on</span>
        <span className="label" style={{width: 60, textAlign: "right"}}>Open</span>
      </div>
      {rows.map((t, i) => {
        const deps = data.edges.filter(([a,b]) => b === t.id).map(([a]) => data.topics.find(x => x.id === a)?.name);
        return (
          <div key={t.id} className="row" style={{padding: "12px 16px", borderBottom: i < rows.length-1 ? "1px solid var(--line-1)" : 0, alignItems: "center"}}>
            <div className="row gap-2" style={{flex: 1}}>
              {t.status === "focus" && <Icons.Star size={12}/>}
              {t.status === "done" && <span style={{width:8, height:8, borderRadius:99, background:"var(--success)"}}></span>}
              {t.status === "manual" && <span style={{width:8, height:8, borderRadius:99, background:"var(--surface)", border: "1.5px dashed var(--line-strong)"}}></span>}
              {t.status === "in-progress" && <span style={{width:8, height:8, borderRadius:99, background:"var(--accent)"}}></span>}
              {t.status === "todo" && <span style={{width:8, height:8, borderRadius:99, background:"var(--surface-3)", border: "1px solid var(--line-2)"}}></span>}
              <span style={{fontSize: 13.5}}>{t.name}</span>
            </div>
            <span style={{width: 110}}>
              <span className={`chip ${t.status === "done" ? "chip-success" : t.status === "manual" ? "chip-outline" : t.status === "focus" ? "chip-power" : t.status === "in-progress" ? "chip-accent" : ""}`}>
                {t.status === "done" ? "Completed" : t.status === "manual" ? "Self-marked" : t.status === "focus" ? "Focus" : t.status === "in-progress" ? "In progress" : "Not started"}
              </span>
            </span>
            <span className="dim" style={{width: 160, fontSize: 12, overflow:"hidden", textOverflow:"ellipsis"}}>
              {deps.length ? deps.join(", ") : <span className="dim">—</span>}
            </span>
            <button className="btn btn-sm" style={{marginLeft: "auto"}} onClick={() => go("slog:topic", { sid, cluster, topic: t.id })}>Open</button>
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────── SO-15 Topic view ──────────────────────
function ScreenTopic() {
  const { route, go, state, setState, showToast } = useApp();
  const sid = route.params?.sid;
  const cluster = route.params?.cluster;
  const topicId = route.params?.topic;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const clusterData = WINNIFY.clusters[CLUSTER_WINNIFY_KEY[cluster] || cluster] || WINNIFY.clusters.DSA;
  const topicRaw = clusterData.topics.find(t => t.id === topicId) || { id: topicId, name: topicId, status: "todo" };
  const isCompleted = s.completedTopics?.includes(topicId);
  const topic = {
    ...topicRaw,
    status: topicRaw.status === "done" ? "done" : (isCompleted ? "manual" : topicRaw.status)
  };
  const meta = CLUSTER_META[cluster];
  const [tab, setTab] = useState("summary");

  const markComplete = () => {
    const completedList = s.completedTopics || [];
    if (completedList.includes(topicId)) {
      showToast("Topic is already marked as complete.");
      return;
    }

    const updatedCompleted = [...completedList, topicId];
    const totalTopics = clusterData.topics.length;
    const currentProgress = s.foundation[cluster]?.progress || 0;
    const nextProgress = Math.min(1, currentProgress + (1 / totalTopics));

    setState({
      sessions: state.sessions.map(x => {
        if (x.id === sid) {
          return {
            ...x,
            completedTopics: updatedCompleted,
            foundation: {
              ...x.foundation,
              [cluster]: {
                ...x.foundation[cluster],
                progress: nextProgress,
                lastActive: "Just now"
              }
            }
          };
        }
        return x;
      })
    });

    showToast("Topic marked complete (self-marked).");
  };

  const topicIndex = clusterData.topics.findIndex(t => t.id === topicId);
  const prevTopic = topicIndex > 0 ? clusterData.topics[topicIndex - 1] : null;
  const nextTopic = topicIndex < clusterData.topics.length - 1 ? clusterData.topics[topicIndex + 1] : null;

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Powerplay", meta.name, topic.name]}
        right={<button className="btn btn-sm" onClick={() => go("slog:cluster", { sid, cluster })}><Icons.ArrowL/> Skill tree</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="row between">
            <div className="col gap-2">
              <div className="label">SO-15 · Topic view</div>
              <div className="row gap-2">
                {topic.status === "focus" && <span className="chip chip-power"><Icons.Star size={11}/>&nbsp;Focus</span>}
                {topic.status === "done" && <span className="chip chip-success"><Icons.Check size={11}/>&nbsp;Completed</span>}
                {topic.status === "manual" && <span className="chip chip-success"><Icons.Check size={11}/>&nbsp;Self-marked</span>}
                <span className="chip chip-outline">{cluster.toUpperCase()}</span>
              </div>
              <h1 style={{margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em"}}>{topic.name}</h1>
            </div>
            <div className="row gap-2">
              <button className="btn" disabled={topic.status === "done" || topic.status === "manual"} onClick={markComplete}>
                <Icons.Check size={12}/> {topic.status === "done" || topic.status === "manual" ? "Completed" : "Mark complete"}
              </button>
              <button className="btn btn-primary" onClick={() => setTab("practice")}><Icons.Play size={12}/> Practice now</button>
            </div>
          </div>

          <div className="tabs mt-6">
            {[
              ["summary", "Summary", "2-min concept brief"],
              ["link", "External link", "Article / YouTube"],
              ["cards", "Flashcards", "Tap-to-flip Q&A"],
              ["practice", "Practice", "Adaptive difficulty"],
            ].map(([k, t]) => (
              <button key={k} className={"tab " + (tab === k ? "active" : "")} onClick={() => setTab(k)}>{t}</button>
            ))}
          </div>

          <div className="card card-pad mt-4">
            {tab === "summary" && <TopicSummary key={topic.id} topic={topic}/>}
            {tab === "link" && <TopicLink key={topic.id} topic={topic}/>}
            {tab === "cards" && <Flashcards key={topic.id} topic={topic}/>}
            {tab === "practice" && <Practice key={topic.id}/>}
          </div>

          <div className="row between mt-4">
            <button className="btn" disabled={!prevTopic} onClick={() => prevTopic && go("slog:topic", { sid, cluster, topic: prevTopic.id })}><Icons.ArrowL size={12}/> Previous topic</button>
            <button className="btn" disabled={!nextTopic} onClick={() => nextTopic && go("slog:topic", { sid, cluster, topic: nextTopic.id })}>Next topic <Icons.ArrowR size={12}/></button>
          </div>
        </div>
      </div>
    </>
  );
}

function TopicSummary({ topic }) {
  const td = WINNIFY.topicData?.[topic.id];
  const pages = td?.summary;
  const [page, setPage] = React.useState(0);
  if (!pages) return (
    <div className="muted" style={{fontSize: 13.5}}>Summary not yet available for this topic.</div>
  );
  const p = pages[page];
  return (
    <>
      <div className="row between mb-4">
        <span className="label">Summary · {page + 1} of {pages.length}</span>
        <div className="row gap-2">
          <button className="btn btn-sm btn-ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>← Prev</button>
          <button className="btn btn-sm btn-ghost" disabled={page === pages.length - 1} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      </div>
      <h2 style={{fontSize: 19, fontWeight: 600, marginBottom: 10}}>{p.heading}</h2>
      <p style={{fontSize: 14, lineHeight: 1.7, color: "var(--ink-2)", marginBottom: 18}}>{p.body}</p>
      <ul style={{paddingLeft: 20, margin: 0}}>
        {p.points.map((pt, i) => (
          <li key={i} style={{fontSize: 13.5, lineHeight: 1.8, color: "var(--ink-2)", marginBottom: 4}}>{pt}</li>
        ))}
      </ul>
      <div className="row gap-2 mt-6" style={{justifyContent: "center"}}>
        {pages.map((_, i) => (
          <button key={i} onClick={() => setPage(i)} style={{
            width: 8, height: 8, borderRadius: 99, border: "none", cursor: "pointer",
            background: i === page ? "var(--accent)" : "var(--line-2)",
          }}/>
        ))}
      </div>
    </>
  );
}

function TopicLink({ topic }) {
  const td = WINNIFY.topicData?.[topic.id];
  const videoId = td?.videoId;
  if (!videoId) return (
    <div className="muted" style={{fontSize: 13.5}}>No video linked for this topic yet.</div>
  );
  return (
    <>
      <div className="label mb-2">Video Lecture</div>
      <div className="h-3 mb-3">{topic.name} — Concept Walkthrough</div>
      <div style={{position:"relative", paddingBottom:"56.25%", height:0, borderRadius:10, overflow:"hidden", background:"#000"}}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          style={{position:"absolute", top:0, left:0, width:"100%", height:"100%", border:"none"}}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="muted mt-3" style={{fontSize: 12}}>Source: YouTube · Curated concept lecture.</div>
    </>
  );
}

function Flashcards({ topic }) {
  const td = WINNIFY.topicData?.[topic?.id];
  const cards = td?.flashcards || [
    { q:"What is the core invariant of this data structure?", a:"Defined by the structure — ask your interviewer to clarify." },
    { q:"What is the time complexity of the primary operation?", a:"Depends on implementation — O(log n) for balanced trees, O(1) for hash tables." },
    { q:"When would you choose this over alternatives?", a:"When its primary operation time complexity matches the bottleneck of your problem." },
  ];
  const [flipped, setFlipped] = React.useState({});
  return (
    <>
      <div className="label mb-3">Click a card to flip · {cards.length} cards</div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12}}>
        {cards.map((c, i) => (
          <div key={i} onClick={() => setFlipped(f => ({...f, [i]: !f[i]}))} style={{
            minHeight:110, borderRadius:10, cursor:"pointer",
            background: flipped[i] ? "var(--accent-tint)" : "var(--surface)",
            border:`1.5px solid ${flipped[i] ? "var(--accent)" : "var(--line-2)"}`,
            padding:"14px 12px", display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", textAlign:"center",
            transition:"background .15s, border .15s", boxShadow:"var(--shadow-1)",
          }}>
            <div style={{fontSize:11, color:"var(--ink-3)", marginBottom:6, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase"}}>
              {flipped[i] ? "Answer" : "Question"}
            </div>
            <div style={{fontSize:12.5, lineHeight:1.5, color:"var(--ink-1)", fontWeight: flipped[i] ? 600 : 400}}>
              {flipped[i] ? c.a : c.q}
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-sm btn-ghost mt-4" onClick={() => setFlipped({})}>Reset all</button>
    </>
  );
}

function Practice() {
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState(null);
  const [shown, setShown] = useState(false);

  const q = WINNIFY.quiz[qi % WINNIFY.quiz.length];

  const reveal = (i) => {
    if (shown) return;
    setPick(i);
    setShown(true);
  };
  const next = () => {
    setPick(null);
    setShown(false);
    setQi(prev => prev + 1);
  };

  return (
    <>
      <div className="row between">
        <div className="label">Adaptive practice · Q{(qi % 8) + 1} of 8</div>
        <div className="row gap-2">
          <span className={`chip ${q.difficulty === "Easy" ? "chip-success" : q.difficulty === "Medium" ? "chip-warn" : "chip-danger"}`}>{q.difficulty || "Medium"}</span>
          <span className="chip">Streak · {qi}</span>
        </div>
      </div>
      <div className="h-3 mt-3" style={{fontSize: 15}}>{q.q}</div>
      <div className="col gap-2 mt-3">
        {q.choices.map((c, i) => (
          <button key={i} onClick={() => reveal(i)}
                  className="row gap-3"
                  style={{
                    padding: "12px 14px", textAlign: "left",
                    borderRadius: 8,
                    border: `1.5px solid ${shown && i === q.answer ? "var(--success)" : shown && pick === i ? "var(--danger)" : pick === i ? "var(--accent)" : "var(--line-2)"}`,
                    background: shown && i === q.answer ? "var(--success-tint)" :
                                shown && pick === i ? "var(--danger-tint)" :
                                pick === i ? "var(--accent-tint)" : "var(--surface)",
                    cursor: shown ? "default" : "pointer", fontSize: 13.5,
                  }}>
            <span className="mono dim" style={{fontSize: 11, width: 18}}>{String.fromCharCode(65+i)}</span>
            <span>{c}</span>
            {shown && i === q.answer && <Icons.Check size={14} style={{marginLeft:"auto", color: "var(--success)"}}/>}
          </button>
        ))}
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
      <div className="row between mt-4">
        <span className="muted" style={{fontSize: 12.5}}>Click an answer to reveal · difficulty adapts.</span>
        {!shown
          ? <button className="btn btn-ghost" onClick={next}>Skip →</button>
          : <button className="btn btn-accent" onClick={next}>Next question →</button>
        }
      </div>
    </>
  );
}

// ────────────────────── SO-16 Foundation Adaptive Practice ──────────────────────
function ScreenAdaptive() {
  const { go, route, state } = useApp();
  const sid = route.params?.sid;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const [started, setStarted] = useState(false);

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Powerplay", "Foundation Adaptive Practice"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:phase", { sid, phase: "powerplay" })}><Icons.ArrowL/> Phase</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in" style={{maxWidth: 760}}>
          <div className="label">SO-16 · Foundation Adaptive Practice</div>
          <h1 className="h-display mt-2" style={{fontSize: 36}}>Mixed practice across foundations</h1>
          <p className="muted mt-2" style={{maxWidth: "62ch"}}>
            Stress-test holistically. Questions across DSA, DBMS, OS, Networking and System Design — difficulty adapts in real time.
          </p>

          <div className="card card-pad mt-6">
            <div className="row between">
              <div>
                <div className="label">Last session</div>
                <div className="h-3 mt-2">2 days ago · 18 questions · 72% accuracy</div>
              </div>
              <div className="col" style={{alignItems: "flex-end"}}>
                <div className="label">Trend</div>
                <Sparkline values={[0.41,0.48,0.55,0.50,0.60,0.66,0.72]}/>
              </div>
            </div>
            <div className="divider mt-4"></div>
            <div className="row gap-3 wrap mt-4">
              {[
                ["DSA", 0.61],["DBMS", 0.40],["OS", 0.30],["Networking", 0.10],["System Design", 0.34]
              ].map(([l, v]) => (
                <div key={l} className="col gap-2" style={{flex: "1 1 140px"}}>
                  <div className="row between">
                    <span style={{fontSize: 12.5}}>{l}</span>
                    <span className="mono dim" style={{fontSize: 11}}>{WUTIL.pct(v)}%</span>
                  </div>
                  <div className="progress accent"><span style={{width: WUTIL.pct(v) + "%"}}></span></div>
                </div>
              ))}
            </div>
          </div>

          {!started ? (
            <div className="card card-pad mt-4">
              <div className="row between">
                <div className="col gap-2">
                  <div className="h-3">Start a new mixed set</div>
                  <div className="muted" style={{fontSize: 12.5}}>Default: 20 questions · adaptive difficulty · ~25 minutes</div>
                </div>
                <button className="btn btn-accent" onClick={() => setStarted(true)}><Icons.Play size={12}/> Start practice</button>
              </div>
            </div>
          ) : (
            <div className="card card-pad mt-4">
              <Practice/>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Sparkline({ values }) {
  const W = 120, H = 32;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => [(i/(values.length-1))*W, H - (v/max)*H]);
  const d = pts.map((p, i) => (i===0?"M":"L") + p[0] + " " + p[1]).join(" ");
  return (
    <svg width={W} height={H} style={{marginTop: 4}}>
      <path d={d} stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
      {pts.map(([x,y], i) => <circle key={i} cx={x} cy={y} r={1.6} fill="var(--accent)"/>)}
    </svg>
  );
}

window.ScreenCluster = ScreenCluster;
window.ScreenTopic = ScreenTopic;
window.ScreenAdaptive = ScreenAdaptive;
