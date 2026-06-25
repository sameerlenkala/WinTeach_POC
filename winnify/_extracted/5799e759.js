// ──────────────────────────────────────────────────────────────────────
// V2.0 · Aptitude — AP-01..AP-04 sub-cluster views (Powerplay)
// Tap Aptitude card on SO-09 → AptitudeHub → per-type detail
// User-level, shared across sessions. Diagnostic = nudge, not gate.
// ──────────────────────────────────────────────────────────────────────

function ScreenAptitudeHub() {
  const { route, go, state } = useApp();
  const sid = route.params?.sid;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const apt = WINNIFY.aptitudeClusters;
  const hasOA = FO.hasOA(s);
  const avg = (apt.quant.progress + apt.logical.progress + apt.verbal.progress + apt.di.progress) / 4;

  const subClusters = [
    { id: "quant",   apId: "AP-01", icon: <Icons.Cpu size={18}/>,   ...apt.quant },
    { id: "logical", apId: "AP-02", icon: <Icons.Brain size={18}/>, ...apt.logical },
    { id: "verbal",  apId: "AP-03", icon: <Icons.Book size={18}/>,  ...apt.verbal },
    { id: "di",      apId: "AP-04", icon: <Icons.Stack size={18}/>, ...apt.di },
  ];

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Powerplay", "Aptitude"]}
        right={<button className="btn btn-sm" onClick={() => go("slog:phase", { sid, phase: "powerplay" })}><Icons.ArrowL/> Phase</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="row between gap-4 wrap">
            <div className="col gap-2">
              <div className="label">Aptitude cluster · Powerplay</div>
              <h1 style={{margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em"}}>
                Aptitude — pick a sub-cluster
              </h1>
              <div className="muted" style={{fontSize: 13.5, maxWidth: "62ch"}}>
                Four sub-clusters share the same structure as Foundation: <strong>Diagnostic Quiz (nudge) → Skill Tree → Topic View</strong>. Progress is user-level — runs across all your sessions.
              </div>
            </div>
            <div className="row gap-6">
              <Stat label="Overall" value={`${WUTIL.pct(avg)}%`} sub="user-level"/>
              <Stat label="Counts toward" value={hasOA ? "Powerplay %" : "Optional"} sub={hasOA ? "OA confirmed" : "no OA round"}/>
            </div>
          </div>

          <div className="row gap-3 wrap mt-6">
            {subClusters.map(c => (
              <button key={c.id} className="card card-hover" style={{
                flex: "1 1 280px", padding: 18, textAlign: "left", cursor: "pointer",
                background: "var(--surface)", border: "1px solid var(--line-1)"
              }} onClick={() => go("slog:aptitude-sub", { sid, sub: c.id })}>
                <div className="row between">
                  <div className="row gap-2" style={{alignItems: "center"}}>
                    <div style={{width: 32, height: 32, borderRadius: 8, background: "var(--surface-2)", display:"grid", placeItems:"center"}}>{c.icon}</div>
                    <div>
                      <div className="label">{c.apId}</div>
                      <div className="h-3" style={{fontSize: 15}}>{c.name}</div>
                    </div>
                  </div>
                  <span className="mono dim" style={{fontSize: 12}}>{WUTIL.pct(c.progress)}%</span>
                </div>
                <div className="muted mt-2" style={{fontSize: 12.5}}>{c.desc}</div>
                <div className="progress accent mt-3"><span style={{width: WUTIL.pct(c.progress) + "%"}}></span></div>
                <div className="row gap-3 mt-3">
                  <span className="mono dim" style={{fontSize: 11}}>{c.topics} topics</span>
                  <span className="mono dim" style={{fontSize: 11}}>· {c.sessions} session{c.sessions === 1 ? "" : "s"}</span>
                  <span className="mono dim" style={{fontSize: 11}}>· Last: {c.lastActive}</span>
                </div>
              </button>
            ))}
          </div>

          {/* User-level callout */}
          <div className="banner info mt-6">
            <Icons.Info size={14}/>
            <span>
              <strong>User-level progress</strong> — Aptitude work persists across every Slog Over you run. The same Quant Diagnostic only needs to be taken once.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}


// Tier-based visual skill tree for aptitude sub-clusters
function AptSkillTree({ topics, onTopicClick }) {
  const tiers = [
    { key: "foundation",   label: "Foundational", color: "var(--success)",       tint: "var(--success-tint)",       dot: "var(--success)" },
    { key: "intermediate", label: "Intermediate",  color: "var(--accent)",        tint: "var(--accent-tint)",        dot: "var(--accent)" },
    { key: "advanced",     label: "Advanced",      color: "var(--powerplay-deep)", tint: "rgba(79,70,229,0.07)",     dot: "var(--powerplay-deep)" },
  ];
  return (
    <div className="col gap-0 mt-5">
      {tiers.map((tier, ti) => {
        const list = topics.filter(t => t.tier === tier.key);
        return (
          <React.Fragment key={tier.key}>
            <div style={{borderRadius: 12, border: `1.5px solid ${tier.color}`, background: tier.tint, padding: "14px 18px"}}>
              <div style={{display: "flex", alignItems: "center", gap: 7, marginBottom: 12}}>
                <span style={{width: 9, height: 9, borderRadius: 99, background: tier.dot, flexShrink: 0}}/>
                <span style={{fontSize: 11.5, fontWeight: 700, color: tier.color, letterSpacing: "0.06em", textTransform: "uppercase"}}>{tier.label}</span>
                <span className="mono dim" style={{fontSize: 11}}>{list.length} topics</span>
              </div>
              <div style={{display: "flex", flexWrap: "wrap", gap: 8}}>
                {list.map(t => (
                  <button key={t.id} onClick={() => onTopicClick(t)} style={{
                    padding: "9px 16px", borderRadius: 999, cursor: "pointer",
                    background: t.status === "done" ? "var(--success-tint)" : "var(--surface)",
                    border: `1.5px solid ${t.status === "done" ? "var(--success)" : t.status === "focus" ? tier.color : "var(--line-2)"}`,
                    color: "var(--ink-1)", fontSize: 13, fontWeight: 500,
                    display: "inline-flex", alignItems: "center", gap: 6,
                    boxShadow: "var(--shadow-1)", whiteSpace: "nowrap",
                    transition: "transform .12s var(--ease)",
                  }}>
                    {t.status === "focus" && <Icons.Star size={11}/>}
                    {t.status === "done" && <Icons.Check size={11}/>}
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            {ti < tiers.length - 1 && (
              <div style={{display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 0", gap: 0}}>
                <div style={{width: 2, height: 18, background: "var(--line-strong)"}}/>
                <svg width="12" height="7" viewBox="0 0 12 7" style={{display: "block"}}>
                  <path d="M0 0 L6 7 L12 0 Z" fill="var(--line-strong)"/>
                </svg>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Diagnostic quiz — renders inside the modal overlay
function AptDiagnostic({ apt, sub, onFinish }) {
  const total = 8;
  const mcqs = (WINNIFY.aptQuiz && WINNIFY.aptQuiz[sub]) ? WINNIFY.aptQuiz[sub] : WINNIFY.quiz;
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState(null);
  const [shown, setShown] = useState(false);
  const q = mcqs[qi % mcqs.length];

  const reveal = (ci) => { if (shown) return; setPick(ci); setShown(true); };
  const next = () => {
    if (qi < total - 1) { setQi(qi + 1); setPick(null); setShown(false); }
    else { onFinish(false); }
  };

  return (
    <div className="card card-pad" style={{borderRadius: 14, boxShadow: "0 8px 40px rgba(0,0,0,0.18)"}}>
      <div className="row between" style={{alignItems: "flex-start"}}>
        <div>
          <div className="label">Diagnostic · {total} questions · ~6 min</div>
          <h2 className="h-2 mt-2">Calibrate your skill tree</h2>
        </div>
        <span className="chip">Nudge — not a gate</span>
      </div>
      <p className="muted mt-2" style={{fontSize: 13, maxWidth: "52ch"}}>
        Questions step up/down with each answer. Skip to work from default focus topics.
      </p>
      <div style={{height: 3, background: "var(--line-1)", borderRadius: 99, marginTop: 14, overflow: "hidden"}}>
        <div style={{height: 3, background: "var(--accent)", borderRadius: 99, width: `${(qi / total) * 100}%`, transition: "width .3s"}}/>
      </div>
      <div className="row gap-2 mt-4">
        <span className="chip chip-power">Q{qi + 1} of {total}</span>
        <span className="chip">{apt.name}</span>
      </div>
      <div style={{fontSize: 15, fontWeight: 500, lineHeight: 1.55, marginTop: 14}}>{q.q}</div>
      <div className="col gap-2 mt-4">
        {q.choices.map((c, ci) => {
          const isCorrect = ci === q.answer, isPick = ci === pick;
          let bg = "var(--surface)", border = "1.5px solid var(--line-2)";
          if (shown && isPick && isCorrect)  { bg = "var(--success-tint)"; border = "1.5px solid var(--success)"; }
          else if (shown && isPick)          { bg = "var(--danger-tint)";  border = "1.5px solid var(--danger)"; }
          else if (shown && isCorrect)       { bg = "var(--success-tint)"; border = "1.5px solid var(--success)"; }
          return (
            <button key={ci} onClick={() => reveal(ci)} style={{
              padding: "10px 12px", borderRadius: 8, cursor: shown ? "default" : "pointer",
              border, background: bg, textAlign: "left",
              display: "flex", gap: 10, alignItems: "center", fontSize: 13.5,
            }}>
              <span className="mono dim" style={{fontSize: 11, width: 18, flexShrink: 0}}>{String.fromCharCode(65 + ci)}</span>
              {c}
              {shown && isCorrect && <Icons.Check size={13}/>}
            </button>
          );
        })}
      </div>
      {shown && (
        <div className="card card-pad mt-3" style={{
          background: pick === q.answer ? "var(--success-tint)" : "var(--danger-tint)",
          border: `1px solid ${pick === q.answer ? "var(--success)" : "var(--danger)"}`,
        }}>
          <strong>{pick === q.answer ? "✓ Correct." : "✗ Not quite."}</strong>
          <div className="muted mt-1" style={{fontSize: 12.5}}>Brief explanation anchored to the underlying concept.</div>
        </div>
      )}
      <div className="row between mt-4">
        <button className="btn btn-ghost" onClick={() => onFinish(true)}>Skip diagnostic →</button>
        {!shown
          ? <span className="muted" style={{fontSize: 12}}>click an answer to continue</span>
          : <button className="btn btn-accent" onClick={next}>{qi < total - 1 ? "Next →" : "Finish & calibrate ✦"}</button>}
      </div>
    </div>
  );
}

function ScreenAptitudeSub() {
  const { route, go, state, setState, showToast } = useApp();
  const sid = route.params?.sid;
  const sub = route.params?.sub;
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return null;
  const apt = WINNIFY.aptitudeClusters[sub];
  if (!apt) return null;
  const apId = { quant: "AP-01", logical: "AP-02", verbal: "AP-03", di: "AP-04" }[sub];

  const quizDoneKey = "aptQuiz:" + sub;
  const quizDone = state.quizDone?.[quizDoneKey];
  const [showDiag, setShowDiag] = useState(false);

  const topics = subClusterTopics(sub);

  const finishQuiz = (skipped) => {
    setState({ quizDone: { ...(state.quizDone || {}), [quizDoneKey]: { skipped, at: new Date().toISOString() } } });
    showToast(skipped ? "Diagnostic skipped — default Focus Topics applied." : "Diagnostic complete — skill tree calibrated.");
    setShowDiag(false);
  };

  const diagOpen = !quizDone || showDiag;

  const openTopic = (t) => go("slog:apt-topic", { sid, sub, topicId: t.id });

  return (
    <>
      <UI.Topbar
        crumbs={["Slog Overs", s.role, "Powerplay", "Aptitude", apt.name]}
        right={<button className="btn btn-sm" onClick={() => go("slog:aptitude-hub", { sid })}><Icons.ArrowL/> Aptitude</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="row between wrap gap-3">
            <div className="col gap-2">
              <div className="label">{apId} · Aptitude sub-cluster</div>
              <h1 style={{margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em"}}>{apt.name}</h1>
              <div className="muted" style={{fontSize: 13.5}}>{apt.topics} topics · est. {apt.topics * 0.5}h · user-level shared progress</div>
            </div>
            <div className="row gap-6">
              <Stat label="Progress" value={`${WUTIL.pct(apt.progress)}%`} sub="cluster"/>
              <Stat label="Diagnostic" value={quizDone ? "Done" : "Pending"} sub="nudge, not gate"/>
              <Stat label="Sessions" value={String(apt.sessions)} sub="completed"/>
            </div>
          </div>

          <div className="card card-pad mt-6">
            <div className="row between" style={{alignItems: "flex-start"}}>
              <div>
                <div className="label">Skill tree · difficulty progression</div>
                <h3 className="h-2 mt-2">Topics &amp; dependencies</h3>
              </div>
              {quizDone?.skipped
                ? <button className="btn btn-sm" onClick={() => setShowDiag(true)}>Retake diagnostic ✦</button>
                : quizDone
                  ? <span className="chip chip-power" style={{alignSelf: "flex-start"}}><Icons.Check size={11}/>&nbsp;Calibrated</span>
                  : null}
            </div>
            <AptSkillTree topics={topics} onTopicClick={openTopic}/>
            <div className="muted mt-4" style={{fontSize: 12}}>Click any topic to open its detail page.</div>
          </div>

          <div className="card mt-6">
            <div style={{padding: "12px 16px", background: "var(--surface-2)", borderBottom: "1px solid var(--line-1)"}}>
              <div className="row between">
                <div className="label">All topics</div>
                <span className="mono dim" style={{fontSize: 11}}>{topics.length} topics</span>
              </div>
            </div>
            {topics.map((t, i) => (
              <div key={t.id} className="row between" style={{padding: "12px 16px", borderBottom: i < topics.length - 1 ? "1px solid var(--line-1)" : 0}}>
                <div className="row gap-3" style={{alignItems: "center"}}>
                  {t.status === "focus" && <Icons.Star size={12}/>}
                  {t.status === "done" && <span style={{width: 8, height: 8, borderRadius: 99, background: "var(--success)"}}/>}
                  {t.status === "todo" && <span style={{width: 8, height: 8, borderRadius: 99, background: "var(--surface-3)", border: "1px solid var(--line-2)"}}/>}
                  <div>
                    <div style={{fontSize: 13.5}}>{t.name}</div>
                    <div className="mono dim" style={{fontSize: 11}}>{t.tier} · {t.qaCount || 8} prompts</div>
                  </div>
                </div>
                <button className="btn btn-sm" onClick={() => openTopic(t)}><Icons.Play size={12}/>&nbsp;Open</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {diagOpen && (
        <>
          <div style={{position: "fixed", inset: 0, background: "rgba(0,0,0,0.42)", backdropFilter: "blur(3px)", zIndex: 300}}/>
          <div style={{position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(560px, calc(100vw - 48px))", maxHeight: "90vh", overflowY: "auto", zIndex: 301, borderRadius: 14}}>
            <AptDiagnostic apt={apt} sub={sub} onFinish={finishQuiz}/>
          </div>
        </>
      )}
    </>
  );
}

function subClusterTopics(sub) {
  const seed = {
    quant: [
      ["Percentages","foundation","focus"],["Ratios","foundation","done"],["Profit & Loss","foundation","todo"],
      ["Time, Speed, Distance","intermediate","focus"],["Time & Work","intermediate","todo"],["Mixtures","intermediate","todo"],
      ["Probability","advanced","todo"],["Permutations & Combinations","advanced","todo"],
    ],
    logical: [
      ["Series & Sequences","foundation","focus"],["Coding-Decoding","foundation","done"],
      ["Syllogisms","intermediate","focus"],["Blood Relations","intermediate","todo"],["Seating Arrangement","intermediate","todo"],
      ["Logical Deduction","advanced","todo"],
    ],
    verbal: [
      ["Synonyms & Antonyms","foundation","todo"],["Spotting Errors","foundation","focus"],
      ["Para-jumbles","intermediate","todo"],["Sentence Completion","intermediate","todo"],
      ["Reading Comprehension","advanced","focus"],
    ],
    di: [
      ["Tables","foundation","todo"],["Bar Charts","foundation","todo"],
      ["Pie Charts","intermediate","todo"],["Line Graphs","intermediate","todo"],
      ["Caselets","advanced","focus"],
    ],
  };
  return (seed[sub] || []).map(([name, tier, status], i) => ({
    id: sub + "-" + i, name, tier, status, qaCount: 8,
  }));
}

function aptVideoId(name) {
  const map = {
    // Quantitative
    "Percentages":                  "4mX0wiSlE2U",
    "Ratios":                       "nFQiH_8JKHI",
    "Profit & Loss":                "VpEsX4K6OXc",
    "Time, Speed, Distance":        "BX3YPaYkMXk",
    "Time & Work":                  "8lQxzj_MPUM",
    "Mixtures":                     "vXz45RA0wAc",
    "Probability":                  "KzfWUEJjG18",
    "Permutations & Combinations":  "p8vIcmr_Pqo",
    // Logical
    "Series & Sequences":           "GJGfXGGXbhQ",
    "Coding-Decoding":              "X9JlnNv9HEs",
    "Syllogisms":                   "MFSwQFyloNs",
    "Blood Relations":              "2pQwX2mDiZ8",
    "Seating Arrangement":          "VD5QxO-6l5Y",
    "Logical Deduction":            "W7aTAUm-Hs8",
    // Verbal
    "Synonyms & Antonyms":          "aWVTJPvb3Do",
    "Spotting Errors":              "7bQf7bMYR0A",
    "Para-jumbles":                 "dCqBbBQkDg0",
    "Sentence Completion":          "3BkN2MUUHQw",
    "Reading Comprehension":        "LizcmH7Fv2c",
    // DI
    "Tables":                       "8ZsDTd0SQHM",
    "Bar Charts":                   "X8H1J6nGfb4",
    "Pie Charts":                   "wMFgVwNeqyU",
    "Line Graphs":                  "BvbRFcVcJkE",
    "Caselets":                     "Gy6T7s9VqpM",
  };
  return map[name] || "dQw4w9WgXcQ";
}

function aptSummaryPages(name, tier) {
  const content = {
    "Percentages": [
      { heading:"Percentages — Core Formula & Concepts",
        body:"A percentage expresses a number as a fraction of 100. It is the foundation of profit & loss, interest calculations, and data interpretation. Mastering the base formula — Percentage = (Part/Whole) × 100 — and its inverses unlocks most exam questions.",
        points:["If x% of A = B, then A = (B × 100) / x","% increase = (New − Old) / Old × 100","x% of y = y% of x — useful for mental math","Successive % changes: (1 ± a/100)(1 ± b/100) − 1"] },
      { heading:"Percentages — Exam Shortcuts",
        body:"Most exam percentages questions can be solved faster by converting to fractions (e.g., 12.5% = 1/8) or by using the concept of percentage points vs percentage change. Practice converting common fractions to percentages and back.",
        points:["1/8 = 12.5%, 1/6 ≈ 16.67%, 1/3 ≈ 33.33%, 3/8 = 37.5%","If price rises a% then falls a%, net change = −a²/100 (always loss)","Population/value chain: multiply factors directly","Shortcut: x% of y = x × y / 100 — avoid the long division"] },
    ],
    "Ratios": [
      { heading:"Ratios — Definitions & Types",
        body:"A ratio a:b compares two quantities of the same kind. Ratios are pure numbers — they have no units. They can be simplified like fractions. Key types: compound ratio (a:b combined with c:d → ac:bd), duplicate ratio (a²:b²), sub-duplicate (√a:√b).",
        points:["Simplify ratios by dividing by GCD","Compound ratio: multiply individual ratios","If A:B = m:n, A's share of total T = mT/(m+n)","Inverse ratio of a:b is b:a"] },
      { heading:"Ratios — Partnerships & Mixing",
        body:"Partnership problems distribute profit in the ratio of capital × time. Mixture problems use alligation — a cross-multiplication shortcut for blending two concentrations into a required mixture ratio.",
        points:["Partnership profit ratio: capital₁ × time₁ : capital₂ × time₂","Alligation: (higher − mean) : (mean − lower) gives the mixing ratio","Mean proportional of a and b = √(ab)","If A:B = 2:3 and B:C = 4:5, A:C = 2×4 : 3×5 = 8:15"] },
    ],
    "Time, Speed, Distance": [
      { heading:"Time, Speed, Distance — Core Relations",
        body:"Speed = Distance / Time. All TSD problems reduce to this formula and its inverses. Key insight: if speed changes, the time and distance change inversely or proportionally — identify the constant (usually distance or time) first.",
        points:["Convert units before applying formula: km/h × 5/18 = m/s","Average speed for equal distances = 2ab/(a+b) (harmonic mean, not arithmetic)","Relative speed: same direction = |a−b|; opposite = a+b","Train passing a pole: time = train length / speed"] },
      { heading:"Time, Speed, Distance — Boats, Trains & Shortcuts",
        body:"Boats: speed downstream = boat speed + stream speed; upstream = boat speed − stream speed. For trains: time to cross a stationary object uses train length; crossing another train uses sum of lengths.",
        points:["Boat speed in still water = (downstream + upstream) / 2","Stream speed = (downstream − upstream) / 2","Crossing another train: time = sum of lengths / relative speed","Meeting point: ratio of distances = ratio of speeds"] },
    ],
    "Time & Work": [
      { heading:"Time & Work — Core Concept",
        body:"If A completes a job in n days, A's 1-day work = 1/n. Combine fractional daily works for people working together. LCM method: assign the total work as the LCM of all days — converts fractions to integers for easier calculation.",
        points:["Together rate = 1/a + 1/b + ... ; together time = 1/(sum of rates)","LCM method: total work = LCM(a, b); compute daily work as integers","Efficiency ratio inverse of time ratio","Pipes: filling rate positive, leaking rate negative"] },
      { heading:"Time & Work — MDH Formula & Shortcuts",
        body:"MDH (Men × Days = Hours × Work) is the master formula for workforce problems. Doubling the workforce halves the time. If work increases, time increases proportionally when workforce is constant.",
        points:["M₁D₁H₁/W₁ = M₂D₂H₂/W₂","If A is twice as efficient as B: A does in n days what B does in 2n days","Alternate day work: add rates for one full cycle","Negative work (pipe leaking): subtract its rate"] },
    ],
  };
  const defaultContent = [
    { heading:`${name} — Core Concepts`,
      body:`${name} is a ${tier}-level topic tested regularly in competitive exams. Understanding the definitions, formulas, and common problem types is essential before attempting speed-based solving.`,
      points:["Learn the core formula and its derivations","Identify the type of problem (direct application vs. multi-step)","Practice converting between units and representations","Use approximation when choices are widely spread"] },
    { heading:`${name} — Exam Strategy`,
      body:`Exam questions on ${name} typically appear in 2–4 variations. Recognising the pattern early lets you pick the fastest approach rather than working from first principles every time.`,
      points:["Shortcut formulas reduce solving time by 40–60%","If options are far apart, approximate to the nearest 5%","Back-substitute your answer to verify in 5 seconds","Past papers consistently test 2–3 specific sub-patterns — identify them"] },
  ];
  return content[name] || defaultContent;
}

function aptFlashcards(name) {
  const sets = {
    "Percentages": [
      { q:"15% of 200 = ?", a:"30" },
      { q:"Convert 3/8 to %", a:"37.5%" },
      { q:"If price rises 20% then falls 20%, net change?", a:"−4% (always a loss: −a²/100)" },
      { q:"Formula for % change", a:"(New − Old) / Old × 100" },
      { q:"40 is what % of 160?", a:"25%" },
      { q:"x% of y = y% of x?", a:"True — e.g. 4% of 50 = 50% of 4 = 2" },
      { q:"1/8 as a percentage?", a:"12.5%" },
      { q:"Successive discounts of 10% and 20%?", a:"28% net (not 30%): 0.9 × 0.8 = 0.72" },
      { q:"A = 120% of B → B = ?% of A", a:"83.33% (= 100/120 × 100)" },
    ],
    "Ratios": [
      { q:"a:b = 3:4, b:c = 2:5 → a:c = ?", a:"3:10 (compound: 3×2 : 4×5)" },
      { q:"A:B = 2:3, total = 60 → A's share?", a:"24" },
      { q:"Duplicate ratio of 3:4?", a:"9:16" },
      { q:"Sub-duplicate ratio of 16:25?", a:"4:5" },
      { q:"Mean proportional of 4 and 9?", a:"6 (= √36)" },
      { q:"Alligation rule?", a:"(Higher − Mean) : (Mean − Lower) gives the mixing ratio" },
      { q:"A:B:C = 2:3:5, total Rs 500 → B's share?", a:"Rs 150" },
      { q:"Inverse ratio of 7:3?", a:"3:7" },
      { q:"If A:B = 5:3, (A+B):(A−B) = ?", a:"8:2 = 4:1" },
    ],
    "Time, Speed, Distance": [
      { q:"Speed = ?", a:"Distance / Time" },
      { q:"Convert 72 km/h to m/s", a:"20 m/s (× 5/18)" },
      { q:"Average speed for equal distances at a km/h and b km/h?", a:"2ab/(a+b)" },
      { q:"Relative speed: same direction?", a:"|a − b|" },
      { q:"Relative speed: opposite directions?", a:"a + b" },
      { q:"Speed downstream = ?", a:"Boat speed + Stream speed" },
      { q:"Time for train of length L to cross a pole at speed v?", a:"L / v" },
      { q:"Two trains of lengths L1, L2 crossing each other (opposite) at speeds v1, v2?", a:"(L1+L2)/(v1+v2)" },
      { q:"Boat in still water = ?", a:"(Downstream speed + Upstream speed) / 2" },
    ],
    "Series & Sequences": [
      { q:"Next term: 2, 6, 12, 20, 30 → ?", a:"42 (differences: 4, 6, 8, 10, 12)" },
      { q:"Next term: 1, 4, 9, 16 → ?", a:"25 (perfect squares)" },
      { q:"Next term: 2, 3, 5, 8, 13 → ?", a:"21 (Fibonacci)" },
      { q:"Next term: 3, 6, 12, 24 → ?", a:"48 (×2 each step)" },
      { q:"Pattern type: 1, 8, 27, 64 → ?", a:"125 (n³)" },
      { q:"How to identify an arithmetic series?", a:"Constant difference between consecutive terms" },
      { q:"How to identify a geometric series?", a:"Constant ratio between consecutive terms" },
      { q:"Series: 100, 50, 25, 12.5 → next?", a:"6.25 (÷2 each step)" },
      { q:"Letter series A, C, E, G → ?", a:"I (skip one letter)" },
    ],
    "Syllogisms": [
      { q:"'All A are B, All B are C' → conclusion?", a:"All A are C (valid syllogism)" },
      { q:"'No A are B, All B are C' → can we conclude 'No A are C'?", a:"No — 'No A are B' allows A and C to overlap through other paths" },
      { q:"What is a valid syllogism?", a:"A conclusion necessarily true given both premises — not just possibly true" },
      { q:"'Some A are B, Some B are C' → 'Some A are C'?", a:"Not necessarily valid — some ≠ all" },
      { q:"In Venn diagram method, which diagram falsifies 'All A are B'?", a:"One where the A circle is not fully inside the B circle" },
      { q:"'Either … or' in syllogisms means?", a:"At least one is true (inclusive OR unless stated exclusive)" },
      { q:"Complementary pair rule?", a:"If one conclusion cannot be determined, its complement may be true — check both together" },
      { q:"'All men are mortal, Socrates is a man' → ?", a:"Socrates is mortal (classic valid deductive syllogism)" },
      { q:"How many Venn diagram cases should you draw for each syllogism?", a:"All possible cases — a conclusion is valid only if it holds in EVERY case" },
    ],
    "Reading Comprehension": [
      { q:"What is the primary question type in RC?", a:"Main idea / purpose of the passage" },
      { q:"Inference vs stated fact — difference?", a:"Stated fact: directly in the text. Inference: must be logically concluded from the text." },
      { q:"How to eliminate wrong RC answer choices?", a:"Too extreme, out of scope, opposite of passage, partially correct but overreaching" },
      { q:"'Author's tone' questions — how to approach?", a:"Look for adjectives and hedging language; avoid extreme tone labels unless supported" },
      { q:"'It can be inferred' means?", a:"The answer must follow from the passage, not contradict it, and not go beyond it" },
      { q:"Strategy: skim or read first?", a:"Skim passage for structure, read questions, then locate and re-read relevant sections" },
      { q:"'Strengthen/weaken the argument' in RC?", a:"Find the main conclusion; strengthen adds support; weaken undermines a premise" },
      { q:"Word-in-context questions?", a:"Re-read the sentence with each option substituted — pick the one that preserves meaning" },
      { q:"Typical RC passage length in campus placements?", a:"200–400 words; 3–5 questions per passage" },
    ],
  };
  const defaultCards = [
    { q:"Core formula for this topic?", a:"Refer to your formula sheet and practice applying it to 5 simple problems." },
    { q:"Most common exam variation of this topic?", a:"Direct application followed by a multi-step problem — identify which type you are looking at first." },
    { q:"Shortcut technique?", a:"Convert to the simplest representation (fraction, ratio, or percentage) before computing." },
    { q:"Common mistake to avoid?", a:"Not converting units, or forgetting to account for both directions in a two-way problem." },
    { q:"Time to solve under exam conditions?", a:"Target under 90 seconds per question — if you need more, move on and return." },
    { q:"Key relationship to memorise?", a:"The formula and its two inverses — all three appear in exams." },
    { q:"Approximation technique?", a:"Round to the nearest convenient number when options are spaced ≥ 5% apart." },
    { q:"How to verify your answer?", a:"Back-substitute into the original equation in 5–10 seconds." },
    { q:"Number of questions per exam from this topic?", a:"Typically 2–4; medium difficulty; solvable in under 2 minutes each with practice." },
  ];
  return (sets[name] || defaultCards).slice(0, 9);
}


function ScreenAptTopic() {
  const { route, go } = useApp();
  const { sid, sub, topicId } = route.params || {};
  const topics = subClusterTopics(sub);
  const topic = topics.find(t => t.id === topicId) || topics[0];
  const [tab, setTab] = useState("summary");
  const [page, setPage] = useState(0);
  const [flipped, setFlipped] = useState({});
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState(null);
  const [shown, setShown] = useState(false);

  if (!topic) return null;
  const pages = aptSummaryPages(topic.name, topic.tier);
  const cards = aptFlashcards(topic.name);
  const mcqs = (WINNIFY.aptQuiz && WINNIFY.aptQuiz[sub]) ? WINNIFY.aptQuiz[sub] : WINNIFY.quiz;
  const q = mcqs[qi % mcqs.length];

  const reveal = (ci) => { if (shown) return; setPick(ci); setShown(true); };
  const nextQ = () => { setQi(qi + 1); setPick(null); setShown(false); };

  const TABS = ["summary", "course", "flashcards", "practice"];
  const TAB_LABELS = { summary: "Summary", course: "Course", flashcards: "Flashcards", practice: "Practice" };

  return (
    <>
      <UI.Topbar
        crumbs={["Aptitude", sub?.toUpperCase(), topic.name]}
        right={<button className="btn btn-sm" onClick={() => go("slog:aptitude-sub", { sid, sub })}><Icons.ArrowL/> Back</button>}
      />
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="col gap-1 mb-5">
            <div className="label">{topic.tier} · Aptitude</div>
            <h1 style={{margin: 0, fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em"}}>{topic.name}</h1>
          </div>

          {/* Tab bar */}
          <div className="row gap-1 mb-5" style={{borderBottom: "1px solid var(--line-1)", paddingBottom: 0}}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "8px 16px", borderRadius: "8px 8px 0 0", border: "none", cursor: "pointer",
                background: tab === t ? "var(--surface)" : "transparent",
                borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
                color: tab === t ? "var(--ink-1)" : "var(--ink-3)",
                fontWeight: tab === t ? 600 : 400, fontSize: 13.5,
              }}>{TAB_LABELS[t]}</button>
            ))}
          </div>

          {/* Summary */}
          {tab === "summary" && (
            <div className="card card-pad fade-in">
              <div className="row between mb-4">
                <span className="label">Page {page + 1} of {pages.length}</span>
                <div className="row gap-2">
                  <button className="btn btn-sm btn-ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>← Prev</button>
                  <button className="btn btn-sm btn-ghost" disabled={page === pages.length - 1} onClick={() => setPage(page + 1)}>Next →</button>
                </div>
              </div>
              <h2 style={{fontSize: 19, fontWeight: 600, marginBottom: 10}}>{pages[page].heading}</h2>
              <p style={{fontSize: 14, lineHeight: 1.7, color: "var(--ink-2)", marginBottom: 18}}>{pages[page].body}</p>
              <ul style={{paddingLeft: 20, margin: 0}}>
                {pages[page].points.map((pt, i) => (
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
            </div>
          )}

          {/* Course */}
          {tab === "course" && (
            <div className="card card-pad fade-in col gap-3">
              <div>
                <div className="label mb-1">Video Lecture</div>
                <h3 className="h-3">{topic.name} — Full Concept Walkthrough</h3>
              </div>
              <div style={{position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 10, overflow: "hidden", background: "#000"}}>
                <iframe
                  src={`https://www.youtube.com/embed/${aptVideoId(topic.name)}?rel=0&modestbranding=1`}
                  style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none"}}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="muted" style={{fontSize: 12}}>Source: YouTube · Concept lecture curated for competitive exams.</div>
            </div>
          )}

          {/* Flashcards */}
          {tab === "flashcards" && (
            <div className="fade-in">
              <div className="label mb-3">Click a card to flip</div>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12}}>
                {cards.map((c, i) => (
                  <div key={i} onClick={() => setFlipped(f => ({...f, [i]: !f[i]}))} style={{
                    minHeight: 110, borderRadius: 10, cursor: "pointer",
                    background: flipped[i] ? "var(--accent-tint)" : "var(--surface)",
                    border: `1.5px solid ${flipped[i] ? "var(--accent)" : "var(--line-2)"}`,
                    padding: "14px 12px", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", textAlign: "center",
                    transition: "background .15s, border .15s", boxShadow: "var(--shadow-1)",
                  }}>
                    <div style={{fontSize: 11, color: "var(--ink-3)", marginBottom: 6, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase"}}>
                      {flipped[i] ? "Answer" : "Question"}
                    </div>
                    <div style={{fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-1)", fontWeight: flipped[i] ? 600 : 400}}>
                      {flipped[i] ? c.a : c.q}
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-sm btn-ghost mt-4" onClick={() => setFlipped({})}>Reset all</button>
            </div>
          )}

          {/* Practice */}
          {tab === "practice" && (
            <div className="card card-pad fade-in">
              <div className="row between mb-4">
                <div className="label">Practice MCQ · {topic.name}</div>
                <span className="mono dim" style={{fontSize: 11}}>Q {qi + 1}</span>
              </div>
              <div style={{fontSize: 15, fontWeight: 500, lineHeight: 1.6, marginBottom: 18}}>{q.q}</div>
              <div className="col gap-2">
                {q.choices.map((c, ci) => {
                  const isCorrect = ci === q.answer, isPick = ci === pick;
                  let bg = "var(--surface)", border = "1.5px solid var(--line-2)";
                  if (shown && isPick && isCorrect)  { bg = "var(--success-tint)"; border = "1.5px solid var(--success)"; }
                  else if (shown && isPick)          { bg = "var(--danger-tint)";  border = "1.5px solid var(--danger)"; }
                  else if (shown && isCorrect)       { bg = "var(--success-tint)"; border = "1.5px solid var(--success)"; }
                  return (
                    <button key={ci} onClick={() => reveal(ci)} style={{
                      padding: "10px 14px", borderRadius: 8, cursor: shown ? "default" : "pointer",
                      border, background: bg, textAlign: "left",
                      display: "flex", gap: 10, alignItems: "center", fontSize: 13.5,
                    }}>
                      <span className="mono dim" style={{fontSize: 11, width: 18, flexShrink: 0}}>{String.fromCharCode(65 + ci)}</span>
                      {c}
                      {shown && isCorrect && <Icons.Check size={13}/>}
                    </button>
                  );
                })}
              </div>
              {shown && (
                <div className="card card-pad mt-3" style={{
                  background: pick === q.answer ? "var(--success-tint)" : "var(--danger-tint)",
                  border: `1px solid ${pick === q.answer ? "var(--success)" : "var(--danger)"}`,
                }}>
                  <strong>{pick === q.answer ? "✓ Correct." : "✗ Not quite."}</strong>
                  <div className="muted mt-1" style={{fontSize: 12.5}}>Review the concept and try the next question.</div>
                </div>
              )}
              <div className="row between mt-5">
                <span className="muted" style={{fontSize: 12.5}}>Click an answer to reveal</span>
                {!shown
                  ? <button className="btn btn-ghost" onClick={nextQ}>Skip →</button>
                  : <button className="btn btn-accent" onClick={nextQ}>Next →</button>}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

window.ScreenAptitudeHub = ScreenAptitudeHub;
window.ScreenAptitudeSub = ScreenAptitudeSub;
window.ScreenAptTopic = ScreenAptTopic;
