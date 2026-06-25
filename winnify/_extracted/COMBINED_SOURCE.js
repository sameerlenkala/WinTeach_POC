

// ═══════════════════════════════════════════════════════════════════
// FILE: 940bdbe7.js (256,235 bytes)
// ═══════════════════════════════════════════════════════════════════

// Mock data + state seed for the prototype
window.WINNIFY = {
  user: { name: "Sameer Anand", initials: "SA", email: "sameer@winnify.ai" },

  roleLibrary: [
    "Full Stack Developer",
    "Frontend Engineer",
    "Backend Engineer",
    "Graduate Engineer Trainee",
    "AI/ML Engineer",
    "Data Engineer",
    "Mobile Engineer (Android)",
    "Mobile Engineer (iOS)",
    "DevOps / SRE",
    "Software Development Engineer I",
    "Data Scientist",
    "QA / SDET",
  ],

  popularRoles: ["Full Stack Developer", "Graduate Engineer Trainee", "AI/ML Engineer"],

  companies: [
    "Winnify", "Razorpay", "Zerodha", "Atlassian", "Microsoft",
    "Google", "Flipkart", "Swiggy", "Zomato", "Cred",
    "Stripe", "Postman", "Freshworks", "PhonePe", "Ola",
    "Uber", "Meta", "Salesforce", "Adobe",
  ],

  defaultRounds: {
    "Full Stack Developer": [
      { id: "r1", name: "Online Assessment", kind: "OA" },
      { id: "r2", name: "DSA Round", kind: "Technical" },
      { id: "r3", name: "System Design (Mid)", kind: "Technical" },
      { id: "r4", name: "Hiring Manager", kind: "Behavioural" },
      { id: "r5", name: "Bar Raiser", kind: "Behavioural" },
    ],
    "Graduate Engineer Trainee": [
      { id: "r1", name: "Aptitude", kind: "OA" },
      { id: "r2", name: "Coding", kind: "Technical" },
      { id: "r3", name: "HR", kind: "Behavioural" },
    ],
    "AI/ML Engineer": [
      { id: "r1", name: "ML Fundamentals", kind: "Technical" },
      { id: "r2", name: "DSA Round", kind: "Technical" },
      { id: "r3", name: "ML System Design", kind: "Technical" },
      { id: "r4", name: "Behavioural", kind: "Behavioural" },
    ],
  },

  // Demo sessions seeded for Sameer
  sessions: [
    {
      id: "s1",
      role: "Full Stack Developer",
      company: "Winnify",
      targetDate: addDays(30),
      createdAt: addDays(-2),
      status: "active",     // active | expired | archived
      activePhase: "powerplay", // powerplay | acceleration | final-over
      rounds: [
        { id: "r1", name: "Online Assessment", kind: "OA" },
        { id: "r2", name: "DSA Round", kind: "Technical" },
        { id: "r3", name: "System Design (Mid)", kind: "Technical" },
        { id: "r4", name: "Group Discussion", kind: "GD" },
        { id: "r5", name: "Hiring Manager", kind: "Behavioural" },
      ],
      oaSubType: "both",  // v2.0 — aptitude_only | technical_only | both
      startingPhase: "powerplay",
      aiRecommendedPhase: "powerplay",
      phases: {
        powerplay:    { start: 1,  end: 14, progress: 0.34 },
        acceleration: { start: 15, end: 24, progress: 0.0 },
        finalOver:    { start: 25, end: 30, progress: 0.0 },
      },
      foundation: {
        dsa:         { progress: 0.42, lastActive: "Today" },
        dbms:        { progress: 0.18, lastActive: "Yesterday" },
        os:          { progress: 0.06, lastActive: "—" },
        networking:  { progress: 0.00, lastActive: "—" },
        systemDesign:{ progress: 0.00, lastActive: "—" },
      },
      interviewPrep: { technical: 0.22, behavioural: 0.08 },
      resume: { uploaded: false, gaps: [] },
      heatmap: seedHeatmap(),
      finalOver: {
        cuesViewed: false,
        quickTipsViewed: false,
        mockAssessment: { complete: false, score: null, lastRunAt: null, aptitudeScore: null, technicalScore: null },
        mockInterview:  { runCount: 0, completedRounds: [], lastRoundIndex: 0, lastRunAt: null, lastDebrief: null, roundScores: {} },
        gdSimulation:   { complete: false, runCount: 0, lastDebrief: null, lastRunAt: null },
      },
      acceleration: { checked: [], lastTriageScore: null, listOrderVersion: 0,
                      technicalProgress: 0.20, behavioralProgress: 0, aptitudeProgress: 0,
                      flags: [], adHocCompleted: [] },
    },
    {
      id: "s2",
      role: "AI/ML Engineer",
      company: "Stripe",
      targetDate: addDays(11),
      createdAt: addDays(-9),
      status: "active",
      activePhase: "acceleration",
      rounds: [
        { id: "r1", name: "ML Fundamentals", kind: "Technical" },
        { id: "r2", name: "DSA Round", kind: "Technical" },
        { id: "r3", name: "ML System Design", kind: "Technical" },
      ],
      oaSubType: null,
      startingPhase: "acceleration",
      aiRecommendedPhase: "acceleration",
      phases: {
        powerplay:    { start: 1, end: 0, progress: 0, skipped: true },
        acceleration: { start: 1, end: 8, progress: 0.56 },
        finalOver:    { start: 9, end: 11, progress: 0.0 },
      },
      foundation: {
        dsa: { progress: 0.61, lastActive: "Today" },
        dbms:{ progress: 0.4, lastActive: "2d ago" },
        os: { progress: 0.30, lastActive: "—" },
        networking: { progress: 0.10, lastActive: "—" },
        systemDesign: { progress: 0.34, lastActive: "Yesterday" },
      },
      finalOver: {
        cuesViewed: false,
        quickTipsViewed: false,
        mockAssessment: { complete: false, score: null, lastRunAt: null, aptitudeScore: null, technicalScore: null },
        mockInterview:  { runCount: 0, completedRounds: [], lastRoundIndex: 0, lastRunAt: null, lastDebrief: null, roundScores: {} },
        gdSimulation:   { complete: false, runCount: 0, lastDebrief: null, lastRunAt: null },
      },
      acceleration: { checked: ["ai7","ai8"], lastTriageScore: null, listOrderVersion: 0,
                      technicalProgress: 0.55, behavioralProgress: 0.35, aptitudeProgress: 0,
                      flags: [], adHocCompleted: [] },
      interviewPrep: { technical: 0.48, behavioural: 0.15 },
      resume: { uploaded: true, gaps: [
        { id: "g1", text: "Quantify impact on ‘Search Ranker’ project", status: "open" },
        { id: "g2", text: "Add metrics for ML internship", status: "resolved" },
        { id: "g3", text: "Mention ML deployment pipeline experience", status: "open" },
      ]},
      heatmap: seedHeatmap(0.6),
    },
    {
      id: "s3",
      role: "Backend Engineer",
      company: "PhonePe",
      targetDate: addDays(-2),
      createdAt: addDays(-32),
      status: "expired",
      activePhase: "final-over",
      rounds: [
        { id: "r1", name: "DSA Round", kind: "Technical" },
        { id: "r2", name: "System Design", kind: "Technical" },
        { id: "r3", name: "Hiring Manager", kind: "Behavioural" },
      ],
      phases: {
        powerplay:    { start: 1,  end: 16, progress: 0.78 },
        acceleration: { start: 17, end: 26, progress: 0.62 },
        finalOver:    { start: 27, end: 30, progress: 0.20 },
      },
      foundation: {
        dsa: { progress: 0.82, lastActive: "3d ago" },
        dbms:{ progress: 0.74, lastActive: "5d ago" },
        os: { progress: 0.55, lastActive: "1w ago" },
        networking: { progress: 0.40, lastActive: "1w ago" },
        systemDesign: { progress: 0.62, lastActive: "4d ago" },
      },
      interviewPrep: { technical: 0.72, behavioural: 0.50 },
      resume: { uploaded: true, gaps: [] },
      heatmap: seedHeatmap(0.4),
      finalOver: {
        cuesViewed: true,
        quickTipsViewed: true,
        mockAssessment: { complete: false, score: null, lastRunAt: null, aptitudeScore: null, technicalScore: null },
        mockInterview:  { runCount: 1, completedRounds: ["r1","r2","r3"], lastRoundIndex: 3, lastRunAt: addDays(-3),
          roundScores: { r1: 72, r2: 65, r3: 60 },
          lastDebrief: { overall: "Moderate", strongest: "DSA Round", weakest: "System Design", at: addDays(-3) } },
        gdSimulation:   { complete: false, runCount: 0, lastDebrief: null, lastRunAt: null },
      },
      acceleration: { checked: [], lastTriageScore: null, listOrderVersion: 0,
                      technicalProgress: 0.72, behavioralProgress: 0.50, aptitudeProgress: 0,
                      flags: [], adHocCompleted: [] },
    },
  ],

  // Day View tasks for active session s1
  todayTasks: [
    { id: "t1", title: "DSA · Two Pointers — adaptive set (15Q)",
      meta: "Powerplay · Focus", cluster: "DSA", est: "25 min", priority: 1 },
    { id: "t2", title: "DBMS · Normalization summary + flashcards",
      meta: "Powerplay · Focus", cluster: "DBMS", est: "15 min", priority: 2 },
    { id: "t3", title: "Resume · upload + run gap scan",
      meta: "Onboarding", cluster: "Resume", est: "5 min", priority: 3 },
    { id: "t4", title: "WinSpeak · 3 behavioural prompts",
      meta: "Powerplay · Interview Prep", cluster: "Interview", est: "20 min", priority: 4 },
  ],
  rolledOverTasks: [
    { id: "rt1", title: "OS · Process vs Thread (skill tree)", meta: "Rolled from Mon", cluster: "OS", est: "10 min" },
    { id: "rt2", title: "DSA · Sliding Window practice", meta: "Rolled from Tue", cluster: "DSA", est: "20 min" },
  ],
  dismissedTasks: [
    { id: "dt1", title: "Networking · OSI Model — flashcards", meta: "Dismissed Mon", cluster: "Networking", est: "8 min" },
  ],

  clusters: {
    DSA: {
      name: "Data Structures & Algorithms",
      topics: [
        { id: "arr", name: "Arrays", row: 0, col: 0, status: "done" },
        { id: "str", name: "Strings", row: 0, col: 1, status: "done" },
        { id: "ll", name: "Linked Lists", row: 0, col: 2, status: "focus" },
        { id: "hash", name: "Hashing", row: 1, col: 0, status: "done" },
        { id: "stk", name: "Stacks & Queues", row: 1, col: 1, status: "in-progress" },
        { id: "tp", name: "Two Pointers", row: 1, col: 2, status: "focus" },
        { id: "sw", name: "Sliding Window", row: 1, col: 3, status: "focus" },
        { id: "tree", name: "Trees", row: 2, col: 0, status: "todo" },
        { id: "bst", name: "BSTs", row: 2, col: 1, status: "todo" },
        { id: "heap", name: "Heaps", row: 2, col: 2, status: "todo" },
        { id: "graph", name: "Graphs", row: 3, col: 0, status: "todo" },
        { id: "dp", name: "Dynamic Programming", row: 3, col: 1, status: "focus" },
        { id: "bt", name: "Backtracking", row: 3, col: 2, status: "todo" },
        { id: "greedy", name: "Greedy", row: 3, col: 3, status: "todo" },
      ],
      edges: [
        ["arr","str"], ["arr","hash"], ["arr","tp"], ["tp","sw"],
        ["str","hash"], ["hash","stk"], ["ll","stk"],
        ["stk","tree"], ["tree","bst"], ["tree","heap"], ["bst","graph"],
        ["heap","graph"], ["graph","dp"], ["dp","bt"], ["dp","greedy"],
      ],
    },
  },

  // Sample diagnostic quiz
  // Quiz pool — 24 questions across DSA, DBMS, OS, Networking, System Design
  quiz: [
    // DSA
    { id:"q1",  cluster:"DSA",           q:"Average-case time complexity of inserting into a hash map?",
      choices:["O(log n)","O(1)","O(n)","O(n log n)"], answer:1 },
    { id:"q2",  cluster:"DSA",           q:"Which BST traversal yields elements in sorted order?",
      choices:["Pre-order","Post-order","In-order","Level-order"], answer:2 },
    { id:"q3",  cluster:"DSA",           q:"Optimal approach for 'longest substring without repeating characters':",
      choices:["DP","Sliding window + hash set","Backtracking","Segment tree"], answer:1 },
    { id:"q4",  cluster:"DSA",           q:"In a min-heap, the minimum element is always at:",
      choices:["A leaf node","The root","The last level","Depends on input"], answer:1 },
    { id:"q5",  cluster:"DSA",           q:"Time complexity of merging two sorted arrays of size m and n?",
      choices:["O(log(m+n))","O(m+n)","O(m·n)","O((m+n)²)"], answer:1 },
    { id:"q6",  cluster:"DSA",           q:"Shortest path in an unweighted graph is found by:",
      choices:["BFS","DFS","Dijkstra","Bellman-Ford"], answer:0 },
    { id:"q7",  cluster:"DSA",           q:"'Container with most water' — why advance the shorter pointer?",
      choices:["Heuristic only","Preserves area-maximisation invariant","Longer side is expensive","Either side works"], answer:1 },
    // DBMS
    { id:"q8",  cluster:"DBMS",          q:"Which normal form eliminates all transitive dependencies?",
      choices:["1NF","2NF","3NF","BCNF"], answer:2 },
    { id:"q9",  cluster:"DBMS",          q:"Which index type is best for range queries on a large table?",
      choices:["Hash index","B-tree index","Bitmap index","Inverted index"], answer:1 },
    { id:"q10", cluster:"DBMS",          q:"In ACID, 'Isolation' specifically prevents:",
      choices:["Data loss on crash","Partial writes","Dirty reads between concurrent transactions","Constraint violations"], answer:2 },
    { id:"q11", cluster:"DBMS",          q:"A composite index on (A, B) directly accelerates filters on:",
      choices:["B only","A only or (A, B) together","Neither alone","Only B"], answer:1 },
    { id:"q12", cluster:"DBMS",          q:"Main advantage of a materialized view over a regular view?",
      choices:["Simpler syntax","Pre-computed results stored on disk — faster reads","Always up-to-date automatically","Uses less storage"], answer:1 },
    // OS
    { id:"q13", cluster:"OS",            q:"A context switch primarily saves and restores:",
      choices:["Heap contents","CPU registers and program counter (PCB)","File descriptors","Code segment"], answer:1 },
    { id:"q14", cluster:"OS",            q:"Deadlock requires which four conditions simultaneously?",
      choices:["Mutual exclusion, Hold & Wait, No preemption, Circular wait","Starvation, Livelock, No preemption, Circular wait","Mutex, Semaphore, Spinlock, Barrier","Mutual exclusion, Preemption, No waiting, Resource sharing"], answer:0 },
    { id:"q15", cluster:"OS",            q:"Thrashing in virtual memory means:",
      choices:["Deadlock in I/O","CPU spends more time paging than executing processes","Memory leak in kernel","Stack overflow"], answer:1 },
    { id:"q16", cluster:"OS",            q:"Key difference between a process and a thread:",
      choices:["Threads are slower","Threads share the process address space; processes do not","Processes share memory; threads do not","No practical difference"], answer:1 },
    // Networking
    { id:"q17", cluster:"Networking",    q:"TCP establishes a connection using a ___-way handshake.",
      choices:["2","3","4","5"], answer:1 },
    { id:"q18", cluster:"Networking",    q:"HTTP operates at which OSI layer?",
      choices:["Transport (L4)","Network (L3)","Application (L7)","Data Link (L2)"], answer:2 },
    { id:"q19", cluster:"Networking",    q:"DNS resolves:",
      choices:["IP addresses to MAC addresses","Domain names to IP addresses","HTTP to HTTPS","Ports to services"], answer:1 },
    { id:"q20", cluster:"Networking",    q:"TLS provides:",
      choices:["Only encryption","Encryption + authentication + integrity","Only integrity","Only authentication"], answer:1 },
    // System Design
    { id:"q21", cluster:"System Design", q:"In CAP theorem, a CP system sacrifices:",
      choices:["Consistency","Partition tolerance","Availability","Durability"], answer:2 },
    { id:"q22", cluster:"System Design", q:"Horizontal scaling means:",
      choices:["Adding CPU/RAM to the same machine","Adding more machines to the pool","Upgrading disk speed","None of the above"], answer:1 },
    { id:"q23", cluster:"System Design", q:"Consistent hashing minimises disruption when nodes change by:",
      choices:["Remapping all keys","Only remapping keys in the affected arc","Using a central coordinator","Rebuilding the entire ring"], answer:1 },
    { id:"q24", cluster:"System Design", q:"Primary purpose of a message queue like Kafka:",
      choices:["Replace the database","Decouple producers from consumers and buffer load spikes","Speed up SQL queries","Encrypt network traffic"], answer:1 },
  ],

  // ─────────────── Acceleration flat priority lists ───────────────
  // Per US-10.1 / 10.2 / 10.3 — role-derived, sorted by priority rank.
  // Each item: { id, topic, cluster, type (Foundation|InterviewPrep),
  //             freq (High|Medium), rank, prevCompleted? }
  accelerationLists: {
    "Full Stack Developer": [
      { id: "fsd1",  topic: "Two Pointers",                 cluster: "DSA",            type: "Foundation",   freq: "High",   rank: 1, focus: true  },
      { id: "fsd2",  topic: "System Design — caching & sharding", cluster: "System Design", type: "Foundation", freq: "High", rank: 2, focus: true },
      { id: "fsd3",  topic: "DSA Round (compressed prompts)", cluster: "Interview Prep", type: "InterviewPrep", round: "DSA Round", freq: "High", rank: 3 },
      { id: "fsd4",  topic: "Sliding Window",               cluster: "DSA",            type: "Foundation",   freq: "High",   rank: 4, focus: true },
      { id: "fsd5",  topic: "Indexing & query plans",       cluster: "DBMS",           type: "Foundation",   freq: "High",   rank: 5 },
      { id: "fsd6",  topic: "System Design Round (prompts + cheat sheet)", cluster: "Interview Prep", type: "InterviewPrep", round: "System Design (Mid)", freq: "High", rank: 6 },
      { id: "fsd7",  topic: "Hashing",                      cluster: "DSA",            type: "Foundation",   freq: "Medium", rank: 7,  prevCompleted: true },
      { id: "fsd8",  topic: "Hiring Manager (STAR drills)", cluster: "Interview Prep", type: "InterviewPrep", round: "Hiring Manager", freq: "Medium", rank: 8 },
      { id: "fsd9",  topic: "Process vs Thread",            cluster: "OS",             type: "Foundation",   freq: "Medium", rank: 9 },
      { id: "fsd10", topic: "Caching strategies",           cluster: "System Design",  type: "Foundation",   freq: "Medium", rank: 10 },
      { id: "fsd11", topic: "HTTP & DNS basics",            cluster: "Networking",     type: "Foundation",   freq: "Medium", rank: 11 },
      { id: "fsd12", topic: "Transactions & ACID",          cluster: "DBMS",           type: "Foundation",   freq: "Medium", rank: 12 },
    ],
    "AI/ML Engineer": [
      { id: "ai1",  topic: "ML metrics — AUC, RMSE, calibration", cluster: "System Design", type: "Foundation",   freq: "High",   rank: 1, focus: true },
      { id: "ai2",  topic: "ML Fundamentals round prompts",       cluster: "Interview Prep", type: "InterviewPrep", round: "ML Fundamentals", freq: "High", rank: 2 },
      { id: "ai3",  topic: "Sliding Window",                       cluster: "DSA",            type: "Foundation",   freq: "High",   rank: 3, focus: true },
      { id: "ai4",  topic: "ML System Design (training vs serving)", cluster: "System Design", type: "Foundation", freq: "High", rank: 4, focus: true },
      { id: "ai5",  topic: "DSA Round prompts",                    cluster: "Interview Prep", type: "InterviewPrep", round: "DSA Round", freq: "High", rank: 5 },
      { id: "ai6",  topic: "Feature engineering & leakage",        cluster: "System Design",  type: "Foundation",   freq: "High",   rank: 6 },
      { id: "ai7",  topic: "Two Pointers",                         cluster: "DSA",            type: "Foundation",   freq: "Medium", rank: 7,  prevCompleted: true },
      { id: "ai8",  topic: "Hashing",                              cluster: "DSA",            type: "Foundation",   freq: "Medium", rank: 8,  prevCompleted: true },
      { id: "ai9",  topic: "Transactions & isolation levels",      cluster: "DBMS",           type: "Foundation",   freq: "Medium", rank: 9 },
      { id: "ai10", topic: "Process vs Thread",                    cluster: "OS",             type: "Foundation",   freq: "Medium", rank: 10 },
    ],
    "default": [
      { id: "d1", topic: "Two Pointers",            cluster: "DSA",            type: "Foundation",   freq: "High",   rank: 1, focus: true },
      { id: "d2", topic: "Hashing",                  cluster: "DSA",           type: "Foundation",   freq: "High",   rank: 2 },
      { id: "d3", topic: "Technical Round prompts",  cluster: "Interview Prep", type: "InterviewPrep", round: "Technical", freq: "High", rank: 3 },
      { id: "d4", topic: "Indexing & query plans",   cluster: "DBMS",          type: "Foundation",   freq: "High",   rank: 4 },
      { id: "d5", topic: "HR / Behavioural prompts", cluster: "Interview Prep", type: "InterviewPrep", round: "HR", freq: "Medium", rank: 5 },
      { id: "d6", topic: "Process vs Thread",        cluster: "OS",            type: "Foundation",   freq: "Medium", rank: 6 },
      { id: "d7", topic: "HTTP & DNS basics",        cluster: "Networking",    type: "Foundation",   freq: "Medium", rank: 7 },
      { id: "d8", topic: "Caching strategies",       cluster: "System Design", type: "Foundation",   freq: "Medium", rank: 8 },
    ],
  },

  // Cheat-sheet content keyed by round name pattern (US-10.5)
  cheatSheets: {
    "Technical": {
      structure: "API contract → constraints → high-level design → storage → trade-offs.",
      keywords: ["latency","throughput","p99","read/write ratio","CAP","sharding","cache invalidation","idempotency"],
      framework: "Open with the contract. Pin two trade-offs before storage. Quote complexity unprompted.",
    },
    "DSA": {
      structure: "Restate input → clarify edge cases → naive → optimised → complexity.",
      keywords: ["time complexity","space complexity","monotonic","invariant","dry-run","off-by-one"],
      framework: "Talk first, code second. Walk a tiny input out loud before typing.",
    },
    "System Design": {
      structure: "Functional requirements → non-functional → API → data model → bottlenecks → scale.",
      keywords: ["sharding","replication","write-through","write-back","eventual consistency","queue back-pressure"],
      framework: "Pick two NFRs (latency, durability) and let them drive every design call.",
    },
    "Behavioural": {
      structure: "STAR — Situation, Task, Action, Result. Action is 60% of the air-time.",
      keywords: ["disagreement","trade-off","ownership","escalation","quantified outcome","retrospective"],
      framework: "Lead with the action verb. Quantify the outcome with one number.",
    },
    "Hiring Manager": {
      structure: "Why this role / why this company / one defended project — in that order.",
      keywords: ["company-specific bet","why now","30-60-90","what I'd ship first"],
      framework: "Tie your pitch to one verifiable company-public bet (product or hiring signal).",
    },
    "HR": {
      structure: "Concise · positive · forward-looking. Cap each answer at 90 seconds.",
      keywords: ["culture fit","strengths","growth area","compensation range","notice period"],
      framework: "Anchor weaknesses to a fix you're already running. Never blame past employers.",
    },
  },

  // Triage quiz pool (US-10.6) — short, cross-cluster
  triageQuiz: [
    { id: "tr1", q: "What is the time complexity of finding the lowest common ancestor in a BST?",
      choices: ["O(n)","O(log n) avg","O(1)","O(n log n)"], answer: 1, cluster: "DSA" },
    { id: "tr2", q: "Which index type best supports range queries on a large table?",
      choices: ["Hash","B-tree","Bitmap","Inverted"], answer: 1, cluster: "DBMS" },
    { id: "tr3", q: "Cache-aside vs write-through — which gives stronger consistency?",
      choices: ["Cache-aside","Write-through","Equal","Neither"], answer: 1, cluster: "System Design" },
    { id: "tr4", q: "In OS, what does a context switch primarily save?",
      choices: ["Heap","Stack pointer + registers","File descriptors","Code segment"], answer: 1, cluster: "OS" },
    { id: "tr5", q: "TCP handshake is a:",
      choices: ["2-way","3-way","4-way","Stateless"], answer: 1, cluster: "Networking" },
  ],
};

function addDays(n) {
  const d = new Date();
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function seedHeatmap(bias = 0.45) {
  // 20 cols × 7 rows of intensities 0..4
  const cells = [];
  for (let i = 0; i < 20 * 7; i++) {
    const r = Math.random();
    let v = 0;
    if (r < bias - 0.25) v = 0;
    else if (r < bias) v = 1;
    else if (r < bias + 0.18) v = 2;
    else if (r < bias + 0.30) v = 3;
    else v = 4;
    // Recent week (last 7 cols) skews higher for s1
    cells.push(v);
  }
  return cells;
}

// ──────────────────────────────────────────────────────────────────────
// V2.0 — Aptitude clusters, Acceleration topics, GD, Interview Cues
// ──────────────────────────────────────────────────────────────────────
WINNIFY.aptitudeClusters = {
  quant:   { id: "quant",   name: "Quantitative Aptitude", desc: "Numbers, percentages, ratios, time-speed-distance.",
             topics: 22, progress: 0.34, lastActive: "Today", sessions: 6, threshold: 60 },
  logical: { id: "logical", name: "Logical Reasoning",     desc: "Series, syllogisms, blood relations, seating.",
             topics: 18, progress: 0.18, lastActive: "Yesterday", sessions: 3, threshold: 60 },
  verbal:  { id: "verbal",  name: "Verbal Ability",        desc: "Reading comprehension, parajumbles, error spotting.",
             topics: 16, progress: 0.10, lastActive: "—", sessions: 1, threshold: 60 },
  di:      { id: "di",      name: "Data Interpretation",   desc: "Tables, charts, caselets, multi-source reasoning.",
             topics: 14, progress: 0.04, lastActive: "—", sessions: 0, threshold: 60 },
};

// ACC v2 — Technical Topics → Subtopics → Q&A (compressed mock content)
WINNIFY.accTechTopics = {
  "Full Stack Developer": [
    { id:"tt-js",   name:"JavaScript Core",        cluster:"JavaScript", freq:96, focus:true,
      winSpeakHighScore:72, subtopics:[
        { id:"st-js1", name:"Event Loop & Async/Await",     qaCount:8,  mcqDone:true,  confidence:"got",     selfComplete:true  },
        { id:"st-js2", name:"Closures & Lexical Scoping",   qaCount:6,  mcqDone:false, confidence:"revisit", selfComplete:false },
        { id:"st-js3", name:"Prototypes & this Binding",    qaCount:5,  mcqDone:false, confidence:null,      selfComplete:false },
      ]},
    { id:"tt-react", name:"React & State Management",   cluster:"Frontend",    freq:91, focus:true,
      winSpeakHighScore:58, subtopics:[
        { id:"st-r1",  name:"Hooks Deep Dive",             qaCount:8,  mcqDone:true,  confidence:"got",     selfComplete:true  },
        { id:"st-r2",  name:"Reconciliation & Re-renders", qaCount:6,  mcqDone:false, confidence:"missed",  selfComplete:false },
        { id:"st-r3",  name:"State Management Patterns",   qaCount:5,  mcqDone:false, confidence:null,      selfComplete:false },
      ]},
    { id:"tt-api",  name:"REST APIs & Node.js",       cluster:"Backend",     freq:87, focus:true,
      winSpeakHighScore:0, subtopics:[
        { id:"st-a1",  name:"REST Design & HTTP Methods",  qaCount:6,  mcqDone:false, confidence:null,      selfComplete:false },
        { id:"st-a2",  name:"JWT & Session Auth",          qaCount:7,  mcqDone:false, confidence:null,      selfComplete:false },
        { id:"st-a3",  name:"Middleware & Error Handling",  qaCount:5,  mcqDone:false, confidence:null,      selfComplete:false },
      ]},
    { id:"tt-sql",  name:"SQL & Databases",           cluster:"DBMS",        freq:82, focus:false,
      winSpeakHighScore:0, subtopics:[
        { id:"st-sq1", name:"Joins, Aggregations & Subqueries", qaCount:6, mcqDone:false, confidence:null,  selfComplete:false },
        { id:"st-sq2", name:"Indexing & Query Optimization",    qaCount:5, mcqDone:false, confidence:null,  selfComplete:false },
        { id:"st-sq3", name:"Transactions & ACID",              qaCount:4, mcqDone:false, confidence:null,  selfComplete:false },
      ]},
    { id:"tt-sd2",  name:"System Design (Web Scale)", cluster:"System Design", freq:78, focus:false,
      winSpeakHighScore:0, subtopics:[
        { id:"st-sd1", name:"Scalable API Architecture",   qaCount:5,  mcqDone:false, confidence:null,      selfComplete:false },
        { id:"st-sd2", name:"Caching Strategies",          qaCount:6,  mcqDone:false, confidence:null,      selfComplete:false },
        { id:"st-sd3", name:"Auth at Scale (OAuth/SSO)",   qaCount:4,  mcqDone:false, confidence:null,      selfComplete:false },
      ]},
    { id:"tt-dsa2", name:"DSA Patterns",              cluster:"DSA",         freq:74, focus:false,
      winSpeakHighScore:0, subtopics:[
        { id:"st-ds1", name:"Arrays, Strings & Sliding Window", qaCount:7, mcqDone:false, confidence:null,  selfComplete:false },
        { id:"st-ds2", name:"Trees & Graph Traversal",         qaCount:6,  mcqDone:false, confidence:null,  selfComplete:false },
      ]},
  ],
  "AI/ML Engineer": [
    { id:"tt-ml1",  name:"ML Fundamentals",           cluster:"ML/AI",       freq:97, focus:true,
      winSpeakHighScore:0, subtopics:[
        { id:"st-ml1", name:"Bias-Variance & Regularisation", qaCount:7, mcqDone:false, confidence:null,    selfComplete:false },
        { id:"st-ml2", name:"Loss Functions & Optimisers",    qaCount:6, mcqDone:false, confidence:null,    selfComplete:false },
        { id:"st-ml3", name:"Model Evaluation Metrics",       qaCount:6, mcqDone:false, confidence:null,    selfComplete:false },
      ]},
    { id:"tt-ml2",  name:"ML System Design",          cluster:"System Design", freq:90, focus:true,
      winSpeakHighScore:0, subtopics:[
        { id:"st-ms1", name:"Training vs Serving Pipeline",   qaCount:6, mcqDone:false, confidence:null,    selfComplete:false },
        { id:"st-ms2", name:"Feature Engineering & Leakage",  qaCount:5, mcqDone:false, confidence:null,    selfComplete:false },
        { id:"st-ms3", name:"Model Monitoring & Drift",       qaCount:4, mcqDone:false, confidence:null,    selfComplete:false },
      ]},
    { id:"tt-ml3",  name:"Deep Learning Core",        cluster:"ML/AI",       freq:82, focus:false,
      winSpeakHighScore:0, subtopics:[
        { id:"st-dl1", name:"Backpropagation & Gradients",    qaCount:6, mcqDone:false, confidence:null,    selfComplete:false },
        { id:"st-dl2", name:"CNN, RNN & Transformers Overview", qaCount:5, mcqDone:false, confidence:null,  selfComplete:false },
      ]},
    { id:"tt-ml4",  name:"DSA for ML Roles",          cluster:"DSA",         freq:75, focus:false,
      winSpeakHighScore:0, subtopics:[
        { id:"st-dm1", name:"Sliding Window & Two Pointers",  qaCount:7, mcqDone:false, confidence:null,    selfComplete:false },
        { id:"st-dm2", name:"Matrix & Graph Problems",        qaCount:6, mcqDone:false, confidence:null,    selfComplete:false },
      ]},
  ],
  default: [
    { id:"tt-js",   name:"JavaScript Core",        cluster:"JavaScript", freq:96, focus:true,
      winSpeakHighScore:0, subtopics:[
        { id:"st-js1", name:"Event Loop & Async/Await",     qaCount:8, mcqDone:false, confidence:null, selfComplete:false },
        { id:"st-js2", name:"Closures & Lexical Scoping",   qaCount:6, mcqDone:false, confidence:null, selfComplete:false },
      ]},
    { id:"tt-sql",  name:"SQL & Databases",        cluster:"DBMS",       freq:82, focus:false,
      winSpeakHighScore:0, subtopics:[
        { id:"st-sq1", name:"Joins & Aggregations",         qaCount:6, mcqDone:false, confidence:null, selfComplete:false },
        { id:"st-sq2", name:"Indexing & Query Optimization", qaCount:5, mcqDone:false, confidence:null, selfComplete:false },
      ]},
  ],
};






// Subtopic Q&A bank (used by ACC-03) — keyed by subtopic id
WINNIFY.subtopicQA = {
  // ── DSA: Arrays & Strings ────────────────────────────────────────────
  "st-1": [
    { id:"qa1", q:"What is the two-pointer pattern, and when do you choose it over brute force?",
      a:"Two indices walk a sorted (or structurally appropriate) array — one from each end or both from the start — narrowing based on a comparison. Choose it when brute force is O(n²) and the array allows directional movement: pairs summing to a target, removing duplicates, trapping rain water." },
    { id:"qa2", q:"Walk through time and space complexity for two-sum on a sorted array.",
      a:"O(n) time — each pointer crosses the array at most once. O(1) space — only two indices held in memory." },
    { id:"qa3", q:"When do you advance the left pointer vs the right pointer?",
      a:"Advance left when current sum < target (need a larger value). Advance right when current sum > target (need a smaller value). If equal, record the pair." },
    { id:"qa4", q:"How does 'container with most water' use two pointers?",
      a:"Place pointers at both ends. Water = width × min(height[left], height[right]). Always advance the pointer at the shorter bar — the invariant is that moving the taller bar can only decrease width without increasing the limiting height." },
    { id:"qa5", q:"How do you remove duplicates from a sorted array in-place?",
      a:"Same-direction two pointers: slow pointer (write position) and fast pointer (read). When fast finds a new value, copy it to the slow position and increment slow." },
  ],
  "st-2": [
    { id:"qa6", q:"Describe the sliding window pattern in one sentence.",
      a:"A pair of indices defines a contiguous window — expand the right edge to grow it, shrink the left edge when an invariant is violated." },
    { id:"qa7", q:"When is a fixed-size window enough vs a variable-size window?",
      a:"Fixed when the constraint is window length (e.g., max sum of k elements). Variable when the constraint is a property of window contents (e.g., at most k distinct characters, no repeated chars)." },
    { id:"qa8", q:"Walk through 'longest substring without repeating characters'.",
      a:"Maintain a hash set of characters in the window. Expand right — if the character is already in the set, shrink left until it's removed. Track the max window length seen." },
    { id:"qa9", q:"What is the time complexity of sliding window and why?",
      a:"O(n) — the right pointer advances at most n times, and the left pointer also advances at most n times total across the entire run." },
    { id:"qa10", q:"How does 'minimum window substring' work?",
      a:"Two frequency maps: target chars needed, current window chars. Expand right until all targets are covered, then shrink left as far as possible while still covered. Record the minimum length window found." },
  ],
  "st-3": [
    { id:"qa11", q:"What is a prefix sum array and what does it enable?",
      a:"prefix[i] = sum of array[0..i-1]. Given prefix sums, the sum of any subarray [l, r] = prefix[r+1] - prefix[l] in O(1), after O(n) preprocessing." },
    { id:"qa12", q:"How does prefix sum detect a subarray with sum equal to k?",
      a:"Store prefix sums in a hash map. For each new prefix sum, check if (prefixSum - k) exists in the map. If yes, a valid subarray ends here. This runs in O(n) time." },
    { id:"qa13", q:"What is a 2D prefix sum used for?",
      a:"Rectangles queries on a matrix: compute the sum of any sub-rectangle in O(1) after O(m×n) preprocessing using the inclusion-exclusion formula." },
  ],
  // ── System Design: Caching ─────────────────────────────────────────────
  "st-4": [
    { id:"qa14", q:"Cache-aside vs write-through — describe each and name their failure modes.",
      a:"Cache-aside: app reads from cache; on miss, loads from DB and populates cache. Failure: cache and DB diverge on writes (stale reads). Write-through: every write goes to both cache and DB synchronously. Failure: every write blocks until cache succeeds (throughput hit on write-heavy workloads)." },
    { id:"qa15", q:"How would you handle a cache stampede?",
      a:"(1) Single-flight / mutex: only one goroutine/thread regenerates; others wait. (2) Jitter on TTL: spread expiry times so not all keys expire simultaneously. (3) Background refresh: proactively refresh before expiry." },
    { id:"qa16", q:"What is write-back (write-behind) caching and when do you use it?",
      a:"Writes go to cache only; DB is updated asynchronously. Maximises write throughput but risks data loss if the cache crashes before flushing. Use when writes are extremely frequent and temporary data loss is acceptable (e.g., analytics counters)." },
    { id:"qa17", q:"How would you cache the result of a database query that aggregates 1M rows?",
      a:"Compute the aggregate once, store it in Redis with a TTL matching the acceptable staleness. Invalidate proactively on writes to the underlying data if possible (event-driven). Use a background job for heavy recomputation." },
  ],
  "st-5": [
    { id:"qa18", q:"What are the three main cache invalidation strategies?",
      a:"(1) TTL-based expiry: simple but may serve stale data until TTL expires. (2) Event-driven invalidation: invalidate explicitly on write — strong consistency but requires coordination. (3) Version/tag-based: namespace keys by version; deploy new version to bust old cache." },
    { id:"qa19", q:"Why is cache invalidation called 'one of the hardest problems in CS'?",
      a:"Because it requires coordinating two systems (cache + DB) atomically. Race conditions: a write invalidates the key, then a concurrent read repopulates the cache with the OLD value before the write commits." },
    { id:"qa20", q:"How do you handle cache invalidation in a microservices architecture?",
      a:"Event sourcing / message bus: services publish 'data changed' events; the cache layer subscribes and invalidates. Alternatively, cache per service and accept some inconsistency with a short TTL." },
  ],
  "st-6": [
    { id:"qa21", q:"How does a CDN reduce latency?",
      a:"CDN edge servers are geographically distributed. On the first request, the edge fetches from origin and caches. Subsequent requests from nearby users hit the edge — reducing round-trip time from hundreds of ms to single-digit ms." },
    { id:"qa22", q:"Push vs pull CDN — when would you use each?",
      a:"Push: you pre-upload assets to all edge nodes — predictable latency, good for static assets. Pull: edge fetches from origin on first request and caches — simpler management, good for content that changes frequently or has unpredictable traffic." },
    { id:"qa23", q:"What is cache-control and how do browsers use it?",
      a:"HTTP response header that tells clients how long to cache a resource. max-age=86400 means cache for 1 day. no-cache requires revalidation on every use. must-revalidate requires checking with the server after max-age expires." },
  ],
  // ── DBMS: Indexing ─────────────────────────────────────────────────────
  "st-7": [
    { id:"qa24", q:"B-tree index vs hash index — when would you choose each?",
      a:"B-tree: supports range queries, ORDER BY, LIKE prefix. Hash: only equality lookups (=), faster O(1) for exact matches. Choose B-tree by default; hash when the access pattern is exclusively equality on high-cardinality columns." },
    { id:"qa25", q:"What is a covering index?",
      a:"An index that contains all columns needed to satisfy a query — the DB can answer the query from the index alone without touching the table (heap). Eliminates the 'index scan + table fetch' double I/O." },
    { id:"qa26", q:"What is index cardinality and why does it matter?",
      a:"Cardinality = number of distinct values in a column. High cardinality (e.g., user_id) → index is selective, dramatically reduces rows scanned. Low cardinality (e.g., boolean) → index may not help; a full table scan could be cheaper." },
  ],
  "st-8": [
    { id:"qa27", q:"When does a composite index (A, B) NOT help a query filtering on B alone?",
      a:"The index is sorted by A first, then B within each A group. Filtering on B alone requires a full index scan — the optimizer will likely skip the index." },
    { id:"qa28", q:"What does 'index direction' mean, and when does it matter?",
      a:"Index columns can be stored ascending or descending. It matters for queries with mixed ORDER BY (e.g., ORDER BY created_at DESC, name ASC) — the index direction must match to avoid a sort step." },
    { id:"qa29", q:"Explain the difference between a clustered and a non-clustered index.",
      a:"Clustered: table rows are physically stored in index order. Only one per table. Non-clustered: separate structure with pointers to the actual rows. Multiple per table. InnoDB's primary key is always the clustered index." },
  ],
  "st-9": [
    { id:"qa30", q:"What does EXPLAIN output tell you in MySQL/PostgreSQL?",
      a:"Shows the query execution plan: whether an index is used (index scan vs seq scan), estimated rows, join type, and cost. Key fields: type (ALL = full table scan, ref/range = index), rows (estimated), key (index chosen)." },
    { id:"qa31", q:"What is a query plan and why might the optimizer choose a full table scan over an index?",
      a:"The optimizer estimates the cheapest plan. If a query returns >10-20% of rows, sequential scan is often cheaper than index scan + random I/O. Statistics (row counts, histograms) drive this decision — stale statistics cause bad plans." },
    { id:"qa32", q:"How do you force a specific index in MySQL?",
      a:"USE INDEX (index_name) hint on the FROM clause. Not recommended in production — fix the statistics or the query instead. Useful for debugging index selection." },
  ],
  // ── OS: Processes & Threads ────────────────────────────────────────────
  "st-10": [
    { id:"qa33", q:"What does a context switch save and restore?",
      a:"The Process Control Block (PCB): CPU registers, program counter, stack pointer, process state, memory maps, open file descriptors. Saving and restoring PCB takes microseconds — frequency matters for latency-sensitive workloads." },
    { id:"qa34", q:"Why are context switches expensive?",
      a:"(1) CPU state save/restore. (2) TLB flush on many architectures (virtual address translations are invalidated). (3) Cache cold-start: the new process's working set may not be in L1/L2 cache." },
    { id:"qa35", q:"Thread vs process context switch cost comparison?",
      a:"Thread context switch within the same process is cheaper: same address space, no TLB flush (same page tables), smaller PCB. Process context switch requires switching address spaces → TLB flush." },
  ],
  "st-11": [
    { id:"qa36", q:"What is a mutex and what problem does it solve?",
      a:"A mutex (mutual exclusion lock) allows only one thread to hold the lock at a time. Solves the race condition on shared data — only the lock holder can read/write the critical section." },
    { id:"qa37", q:"Mutex vs semaphore vs condition variable — key differences?",
      a:"Mutex: binary lock, owner-based (only holder can release). Semaphore: counter-based, any thread can signal. Condition variable: used with a mutex to wait for a condition without busy-waiting — the thread atomically releases the mutex and sleeps." },
    { id:"qa38", q:"What is a spinlock and when is it better than a mutex?",
      a:"A spinlock busy-waits (spins) instead of sleeping. Better when the critical section is very short (< a few hundred ns) and the lock is rarely contended — avoids the OS scheduler overhead of sleeping and waking." },
    { id:"qa39", q:"What is a deadlock and how do you prevent it?",
      a:"Deadlock: circular wait where each thread holds a resource the next thread needs. Prevention strategies: lock ordering (always acquire locks in a consistent order), try-lock with timeout, or lock-free data structures." },
  ],
  // ── Networking: HTTP & TLS ────────────────────────────────────────────
  "st-12": [
    { id:"qa40", q:"Key improvements of HTTP/2 over HTTP/1.1?",
      a:"(1) Multiplexing: multiple requests/responses over a single TCP connection, no head-of-line blocking per stream. (2) Header compression (HPACK): reduces overhead for repeated headers. (3) Server push: server can send resources before client asks." },
    { id:"qa41", q:"What is head-of-line blocking in HTTP/1.1?",
      a:"In HTTP/1.1, a slow response blocks all subsequent requests on that connection (pipelining is limited and rarely used). HTTP/2 multiplexing solves this at the HTTP layer, but TCP-level HOL blocking remains until HTTP/3 (QUIC)." },
    { id:"qa42", q:"HTTP/3 vs HTTP/2 — main difference?",
      a:"HTTP/3 runs on QUIC (UDP-based) instead of TCP. Eliminates TCP-level head-of-line blocking and enables faster connection establishment (0-RTT resumption)." },
  ],
  "st-13": [
    { id:"qa43", q:"Walk through the TLS 1.3 handshake.",
      a:"(1) ClientHello: client sends supported cipher suites and key share. (2) ServerHello: server selects cipher suite, sends its key share + certificate. (3) Client verifies certificate, both derive session keys. Total: 1 RTT (vs 2 RTT for TLS 1.2)." },
    { id:"qa44", q:"What is certificate pinning and what risk does it mitigate?",
      a:"Pinning hard-codes the expected server certificate or public key in the client. Mitigates MITM attacks using a rogue CA-signed certificate. Risk: certificate rotation requires a client update." },
    { id:"qa45", q:"Symmetric vs asymmetric encryption in TLS — when is each used?",
      a:"Asymmetric (RSA/ECDH) is used during the handshake to securely exchange a session key. Symmetric (AES-GCM) is used for all subsequent data — it is orders of magnitude faster than asymmetric." },
  ],
  default: [
    { id:"qa-x", q:"Explain the most important principle behind this subtopic.",
      a:"Name the core invariant, support it with one example, and quote a relevant complexity or trade-off number." },
    { id:"qa-y", q:"How would you defend this approach over its alternatives?",
      a:"Name two axes (e.g. latency vs consistency) and pin where the choice sits. Explain what changes if the axis flips." },
  ],
};

// MCQ pool for ACC-04 — keyed by subtopic id
WINNIFY.subtopicMCQ = {
  "st-1": [
    { id:"m1",  difficulty:"Easy",   q:"Two-sum on a sorted array — advance the LEFT pointer when:",
      choices:["current sum > target","current sum < target","pointers cross","array has duplicates"], answer:1 },
    { id:"m2",  difficulty:"Medium", q:"Two-pointer on an unsorted array requires preprocessing when:",
      choices:["Always","Never — sort first","Problem needs directional movement that sorting enables","When n < 100"], answer:2 },
    { id:"m3",  difficulty:"Hard",   q:"'Container with most water' — why advance the SHORTER pointer?",
      choices:["Heuristic only","Preserves area-maximisation invariant","Longer pointer is more expensive","No reason — either works"], answer:1 },
  ],
  "st-2": [
    { id:"m4",  difficulty:"Easy",   q:"Sliding window is preferred over brute force when:",
      choices:["Array is unsorted","Problem involves a contiguous subarray with a constraint","Array is very small","DP is too slow"], answer:1 },
    { id:"m5",  difficulty:"Medium", q:"'Minimum window substring' time complexity with sliding window?",
      choices:["O(n²)","O(n log n)","O(n)","O(n·m)"], answer:2 },
    { id:"m6",  difficulty:"Hard",   q:"Sliding window breaks down when:",
      choices:["Window needs to track non-contiguous elements","Input is sorted","Constraint involves a sum","n is large"], answer:0 },
  ],
  "st-3": [
    { id:"m7",  difficulty:"Easy",   q:"Prefix sum enables range sum queries in:",
      choices:["O(n) per query","O(log n) per query","O(1) per query after O(n) preprocessing","O(n²) total"], answer:2 },
    { id:"m8",  difficulty:"Medium", q:"'Subarray sum equals k' uses prefix sums + hash map for:",
      choices:["O(n log n) time","O(n) time","O(1) time","O(n²) time"], answer:1 },
  ],
  "st-4": [
    { id:"m9",  difficulty:"Easy",   q:"Write-through cache writes to:",
      choices:["Cache only","DB only","Both cache and DB synchronously","Asynchronously to DB"], answer:2 },
    { id:"m10", difficulty:"Medium", q:"Cache-aside's main failure mode is:",
      choices:["Cache stampede","Stale reads after writes (cache and DB diverge)","Write amplification","Loss of durability"], answer:1 },
    { id:"m11", difficulty:"Hard",   q:"Write-back caching is risky because:",
      choices:["It is slow","Data in cache not yet flushed to DB may be lost on crash","It increases read latency","It requires two network calls"], answer:1 },
  ],
  "st-5": [
    { id:"m12", difficulty:"Medium", q:"Event-driven cache invalidation is preferred over TTL when:",
      choices:["Data changes infrequently","Strong consistency is required and write events are trackable","Cache storage is limited","Read latency must be sub-millisecond"], answer:1 },
    { id:"m13", difficulty:"Hard",   q:"The race condition in cache invalidation occurs when:",
      choices:["Two reads hit the cache simultaneously","A write invalidates a key and a concurrent read repopulates it with stale data before the write commits","TTL expires at the wrong time","Cache capacity is exhausted"], answer:1 },
  ],
  "st-6": [
    { id:"m14", difficulty:"Easy",   q:"A CDN reduces latency by:",
      choices:["Compressing responses","Serving content from geographically nearby edge servers","Using a faster database","Caching at the client"], answer:1 },
    { id:"m15", difficulty:"Medium", q:"Push CDN is preferred when:",
      choices:["Content is highly dynamic","You want predictable latency and control over what is cached at every edge","Traffic is unpredictable","Origin bandwidth is limited"], answer:1 },
  ],
  "st-7": [
    { id:"m16", difficulty:"Easy",   q:"A B-tree index is preferred over a hash index when:",
      choices:["Only equality lookups are needed","Range queries and sorting are required","Table has fewer than 1000 rows","Column cardinality is very low"], answer:1 },
    { id:"m17", difficulty:"Medium", q:"A covering index means:",
      choices:["The index covers the entire table","All columns needed by a query are in the index — no table fetch required","The index is partitioned across nodes","The index has 100% cardinality"], answer:1 },
  ],
  "st-8": [
    { id:"m18", difficulty:"Medium", q:"Composite index (A, B) directly helps a query filtering on B only:",
      choices:["Always","Never — full index scan needed","Only if A has low cardinality","Only with a covering index"], answer:1 },
    { id:"m19", difficulty:"Hard",   q:"InnoDB's primary key is a clustered index, meaning:",
      choices:["Only one row per key","Table rows are physically stored in primary key order","Secondary indexes are slower","Primary key values are hashed"], answer:1 },
  ],
  "st-9": [
    { id:"m20", difficulty:"Medium", q:"In MySQL's EXPLAIN output, 'type: ALL' indicates:",
      choices:["Index scan","Full table scan","Covering index scan","Join"], answer:1 },
    { id:"m21", difficulty:"Hard",   q:"The query optimizer may choose a full table scan over an index when:",
      choices:["The table has fewer than 10 rows","The query returns a large fraction of rows (random I/O more expensive than sequential)","The index is a composite index","The query uses ORDER BY"], answer:1 },
  ],
  "st-10": [
    { id:"m22", difficulty:"Easy",   q:"What makes thread context switches cheaper than process context switches?",
      choices:["Threads have smaller stacks","Threads share the address space — no TLB flush required","Threads don't use CPU registers","OS scheduler ignores threads"], answer:1 },
    { id:"m23", difficulty:"Medium", q:"TLB flush during a context switch is expensive because:",
      choices:["TLB is on a remote chip","All cached virtual-to-physical translations are invalidated — subsequent accesses cause TLB misses","TLB size is fixed","Only kernel addresses are flushed"], answer:1 },
  ],
  "st-11": [
    { id:"m24", difficulty:"Easy",   q:"A mutex differs from a semaphore in that a mutex:",
      choices:["Allows multiple holders","Is owner-based — only the locking thread can unlock it","Is faster","Is implemented in hardware"], answer:1 },
    { id:"m25", difficulty:"Medium", q:"A condition variable is used to:",
      choices:["Lock a critical section","Wait for a condition to become true without busy-waiting, atomically releasing the mutex","Prevent deadlock","Guarantee ordering of operations"], answer:1 },
    { id:"m26", difficulty:"Hard",   q:"Deadlock prevention via lock ordering means:",
      choices:["Always acquiring locks in the reverse order","Acquiring multiple locks in a globally consistent order across all threads","Using try-lock everywhere","Avoiding all shared state"], answer:1 },
  ],
  "st-12": [
    { id:"m27", difficulty:"Easy",   q:"HTTP/2's biggest improvement for page load time is:",
      choices:["Faster DNS","Multiplexing — multiple streams over one TCP connection","Larger TCP window","Server-side rendering"], answer:1 },
    { id:"m28", difficulty:"Medium", q:"HTTP/3 eliminates TCP-level head-of-line blocking by:",
      choices:["Using HTTP/2 multiplexing","Running on QUIC over UDP","Compressing headers more","Using faster TLS"], answer:1 },
  ],
  "st-13": [
    { id:"m29", difficulty:"Easy",   q:"TLS 1.3 handshake completes in:",
      choices:["0 RTT (always)","1 RTT","2 RTT","3 RTT"], answer:1 },
    { id:"m30", difficulty:"Medium", q:"Asymmetric encryption is used in TLS to:",
      choices:["Encrypt all data","Securely exchange a session key — then symmetric encryption takes over","Compress payloads","Authenticate DNS"], answer:1 },
  ],
  default: [
    { id:"m-x", difficulty:"Medium", q:"Sample MCQ for this subtopic.",
      choices:["Option A","Option B (correct)","Option C","Option D"], answer:1 },
  ],
};

// ── Additional subtopicQA for new FSD acceleration subtopics ────────────────
Object.assign(WINNIFY.subtopicQA, {
  "st-js1": [
    { id:"jsqa1", q:"Explain the JavaScript event loop in one concise paragraph.",
      a:"JavaScript is single-threaded, meaning it can only execute one piece of code at a time. The runtime has three key components: the call stack, the Web APIs layer, and the task queues. When synchronous code runs, it is pushed onto the call stack and executed immediately. When asynchronous operations like setTimeout, fetch, or DOM events are triggered, the browser's Web APIs handle them in the background.\n\nOnce those operations complete, their callbacks are placed into either the macrotask queue or the microtask queue. The event loop's job is to continuously monitor the call stack — when it is empty, the loop first drains the entire microtask queue (which includes Promise callbacks and MutationObserver notifications), and only then picks the next item from the macrotask queue.\n\nThis ordering is why a resolved Promise always runs before a setTimeout(fn, 0) callback, even if the setTimeout was registered first." },
    { id:"jsqa2", q:"What is the difference between a microtask and a macrotask?",
      a:"The distinction comes down to when each type of callback is scheduled relative to the event loop's cycle. Macrotasks — also called tasks — include things like setTimeout, setInterval, setImmediate (Node.js), I/O callbacks, and UI rendering. The event loop picks exactly one macrotask per turn, runs it to completion, and then checks the microtask queue before doing anything else.\n\nMicrotasks, on the other hand, are processed exhaustively after every task and after every microtask — meaning if a microtask enqueues another microtask, that too runs before any macrotask gets a chance. Microtask sources include Promise.then/catch/finally, queueMicrotask(), and MutationObserver.\n\nIn practice this means: if you resolve a Promise inside a setTimeout callback, the Promise's then handler fires before the next setTimeout fires, not after. Understanding this ordering is critical for writing predictable async code and for debugging subtle race conditions in UI-heavy applications." },
    { id:"jsqa3", q:"Why does async/await not block the main thread?",
      a:"async/await is syntactic sugar over Promises, so it inherits the same non-blocking properties. When the JavaScript engine hits an await expression, it suspends execution of that specific async function and returns control back to the caller — but crucially, it does not block the call stack. The engine then registers a microtask to resume the function once the awaited Promise settles.\n\nMeanwhile, the event loop is free to process other tasks: handle user clicks, run other callbacks, update the UI. This is fundamentally different from a language-level blocking call like Thread.sleep() in Java, where the entire thread is frozen.\n\nUnder the hood, the async function is compiled into a state machine; each await is a yield point where state is saved and execution can be paused and resumed without tying up the thread. This design lets you write code that reads sequentially and intuitively, while the runtime manages the concurrency transparently." },
    { id:"jsqa4", q:"What is Promise.all and when does it reject?",
      a:"Promise.all() takes an iterable of promises and returns a single new Promise. That returned Promise resolves with an array of all the results, preserving the original order of the input, only when every promise in the iterable has resolved. This makes it ideal for fan-out patterns where you want to fire multiple independent async operations — like parallel API calls — and wait for all of them to complete before proceeding.\n\nThe important failure behaviour is fail-fast: if any single promise in the input rejects, Promise.all immediately rejects with that rejection reason. The remaining promises are not cancelled — they continue executing in the background — but their results are discarded.\n\nIf you need to wait for all promises regardless of individual failures, you should use Promise.allSettled() instead, which always resolves with an array of outcome descriptors (status: 'fulfilled' or 'rejected'). Knowing when to use each is a common interview follow-up question." },
    { id:"jsqa5", q:"Explain the difference between setTimeout(fn, 0) and Promise.resolve().then(fn).",
      a:"Both schedule fn to run asynchronously — after the current synchronous code finishes — but they end up in different queues and therefore run at different times. Promise.resolve().then(fn) schedules fn as a microtask. Once the current call stack is empty, the engine drains all pending microtasks before it does anything else. setTimeout(fn, 0) schedules fn as a macrotask — it only runs after the current task ends and the microtask queue has been fully drained.\n\nSo if you have both in the same synchronous block, the Promise callback always fires first, then the setTimeout callback. A classic interview scenario: console.log('A'); setTimeout(() => console.log('B'), 0); Promise.resolve().then(() => console.log('C')); console.log('D') — the output is A, D, C, B.\n\nThis ordering matters in frameworks that batch DOM updates via microtasks — mutations scheduled with Promises land before the browser's next paint opportunity, whereas setTimeout-based updates may be deferred an extra frame." },
  ],
  "st-js2": [
    { id:"jsqa6", q:"What is a closure and why is it useful?",
      a:"A closure is a function that retains access to variables in its outer lexical scope even after the outer function has returned. Useful for: data encapsulation/private state, factory functions, memoisation, and event handlers that remember context." },
    { id:"jsqa7", q:"Explain the classic loop-closure bug and how to fix it.",
      a:"Using var in a for loop shares one binding across all iterations; each closure captures the final value. Fix: use let (block-scoped, one binding per iteration) or wrap the callback in an IIFE that captures the current value as a parameter." },
    { id:"jsqa8", q:"What is the difference between var, let, and const in terms of scope and hoisting?",
      a:"var: function-scoped, hoisted and initialised to undefined. let/const: block-scoped, hoisted but not initialised (Temporal Dead Zone — access before declaration throws ReferenceError). const additionally prevents reassignment (not mutation of objects)." },
  ],
  "st-js3": [
    { id:"jsqa9",  q:"How does prototypal inheritance work in JavaScript?",
      a:"Every object has an internal [[Prototype]] link (accessible via Object.getPrototypeOf or __proto__). Property lookup walks the prototype chain until found or null is reached. ES6 classes are syntactic sugar over this prototype system — they don't introduce classical inheritance." },
    { id:"jsqa10", q:"Explain the four rules of this binding.",
      a:"1) Default: global (or undefined in strict mode). 2) Implicit: the object before the dot at call site. 3) Explicit: call/apply/bind sets this directly. 4) new: creates a new object and binds this to it. Arrow functions have no own this — they inherit lexically from their enclosing scope." },
    { id:"jsqa11", q:"What does Object.create(proto) do differently than new Constructor()?",
      a:"Object.create(proto) creates a bare object with proto as its [[Prototype]] — no constructor function runs. new Constructor() runs the constructor and sets [[Prototype]] to Constructor.prototype. Use Object.create for pure prototype delegation without construction logic." },
  ],
  "st-r1": [
    { id:"rqa1", q:"When does useEffect run and what does the dependency array control?",
      a:"useEffect runs after the browser has painted. Empty array []: run once on mount. [a, b]: run when a or b changes (shallow equality). No array: run after every render. The cleanup function returned runs before the next effect and on unmount." },
    { id:"rqa2", q:"What is the difference between useMemo and useCallback?",
      a:"useMemo memoises a computed value: useMemo(() => expensiveFn(a, b), [a, b]). useCallback memoises a function reference: useCallback(fn, deps). Both skip recomputation when deps haven't changed. useCallback(fn, deps) is equivalent to useMemo(() => fn, deps)." },
    { id:"rqa3", q:"When would you reach for useRef over useState?",
      a:"useRef when you need to (1) hold a mutable value that must not trigger a re-render (e.g., a timer ID, previous value store), or (2) reference a DOM node directly. Unlike useState, mutating ref.current doesn't cause a render." },
    { id:"rqa4", q:"What is the Rules of Hooks and why does React enforce them?",
      a:"Hooks must be called at the top level of a component (not inside loops, conditions, or nested functions) and only inside React functions. React tracks hook calls by order per render; violating this breaks the internal state association." },
  ],
  "st-r2": [
    { id:"rqa5", q:"How does React decide whether to re-render a component?",
      a:"By default, a component re-renders when its parent renders or its state/props change (shallow comparison for primitives, reference check for objects). React.memo wraps a component with a shallow-prop comparison; you can provide a custom comparator." },
    { id:"rqa6", q:"What is reconciliation and how does the virtual DOM help?",
      a:"Reconciliation is React's algorithm for diffing the old and new virtual DOM trees and computing the minimal set of DOM mutations. The virtual DOM is a lightweight JS object tree; computing diffs in JS is fast. React uses keys to match list items across renders." },
    { id:"rqa7", q:"What causes unnecessary re-renders and how do you prevent them?",
      a:"(1) Unstable object/function props — fix with useMemo/useCallback. (2) Context value changing on every render — split context or memoize the value. (3) Missing keys in lists. Profile with React DevTools Profiler to identify the culprit." },
  ],
  "st-r3": [
    { id:"rqa8",  q:"When should you use Context vs external state (Redux/Zustand)?",
      a:"Context: infrequently updated, tree-wide data (theme, auth user, locale). Its weakness is that all consumers re-render on any context value change. Redux/Zustand: high-frequency updates, complex derived state, fine-grained subscriptions. Zustand is lighter; Redux better for large teams that need devtools and middleware." },
    { id:"rqa9",  q:"What is the key difference between Redux's reducer pattern and Zustand's approach?",
      a:"Redux: centralised store, immutable updates via pure reducers dispatched with actions — verbose but predictable. Zustand: store is a hook with direct mutation via immer or set() — minimal boilerplate, no action creators needed." },
    { id:"rqa10", q:"How would you structure state in a medium-sized React app?",
      a:"Server state (API data): React Query or SWR — handles caching, deduplication, background refresh. UI state local to a component: useState/useReducer. Shared UI state: Context or lightweight Zustand slice. Avoid putting server data in Redux." },
  ],
  "st-a1": [
    { id:"aqa1", q:"What are the main HTTP methods and their semantics?",
      a:"GET: read (idempotent, cacheable). POST: create or trigger action (not idempotent). PUT: full replace (idempotent). PATCH: partial update. DELETE: remove (idempotent). HEAD: GET without body (for metadata). OPTIONS: discover allowed methods (used in CORS preflight)." },
    { id:"aqa2", q:"What makes a REST API truly RESTful vs just HTTP-based?",
      a:"REST constraints: client-server separation, statelessness (no session on server — each request self-contained), cacheability, uniform interface (resource-based URLs, standard verbs, HATEOAS), layered system. Most 'REST' APIs omit HATEOAS but that's pragmatically acceptable." },
    { id:"aqa3", q:"How do you design pagination for a large list endpoint?",
      a:"Cursor-based: stable under concurrent writes, no page drift — return a cursor token pointing to the last seen item. Offset-based: simple but items can shift if rows are inserted. For UIs with infinite scroll, cursor is preferred; for admin tables with page numbers, offset is acceptable." },
  ],
  "st-a2": [
    { id:"aqa4", q:"How does JWT authentication work end-to-end?",
      a:"Server issues a signed JWT (header.payload.signature) on login. Client stores it (httpOnly cookie preferred over localStorage — XSS-safe). Client sends it in Authorization: Bearer <token> on subsequent requests. Server verifies signature with the secret/public key — no DB lookup needed for stateless auth." },
    { id:"aqa5", q:"JWT vs session cookies — when to choose each?",
      a:"Sessions: server stores state — easy to revoke, but requires DB/Redis lookup per request. JWT: stateless — no server storage, scales horizontally, but hard to revoke before expiry. Use short-lived JWTs (15 min) + refresh tokens stored in httpOnly cookies for best of both." },
    { id:"aqa6", q:"What is CSRF and how do you prevent it in a Node.js app?",
      a:"CSRF tricks an authenticated user's browser into making an unintended request. Prevention: same-site cookie attribute (Lax or Strict), CSRF token (synchroniser token pattern), or checking Origin/Referer header. JWT in Authorization header is immune to CSRF — browsers don't auto-send it." },
  ],
  "st-a3": [
    { id:"aqa7", q:"What is Express middleware and how does the execution chain work?",
      a:"Middleware are functions with (req, res, next). They run in the order they're registered. Calling next() passes control to the next middleware; calling next(err) skips to the error-handling middleware (four-parameter function). Not calling either hangs the request." },
    { id:"aqa8", q:"How would you implement centralised error handling in Express?",
      a:"Register a four-parameter middleware (err, req, res, next) after all routes. All async route handlers should wrap code in try/catch and call next(err). Use an error class hierarchy (AppError, ValidationError) so the handler can format responses by error type." },
    { id:"aqa9", q:"How would you rate-limit an API endpoint in Node.js?",
      a:"Use express-rate-limit for per-IP limiting. For distributed systems, back it with Redis (sliding window counter or token bucket) so limits are shared across instances. Return 429 Too Many Requests with a Retry-After header." },
  ],
  "st-sq1": [
    { id:"sqa1", q:"What is the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN?",
      a:"INNER JOIN: only rows with a match in both tables. LEFT JOIN: all rows from left table, NULLs for unmatched right. RIGHT JOIN: mirror of LEFT. FULL OUTER JOIN: all rows from both, NULLs where no match. Use LEFT JOIN when you want to keep all records from the primary table regardless of match." },
    { id:"sqa2", q:"How do window functions differ from GROUP BY aggregations?",
      a:"GROUP BY collapses rows into one per group. Window functions (OVER clause) compute aggregates across a partition while keeping every row. Use case: running totals, rank within a group, comparing each row to the group average — without losing the row detail." },
    { id:"sqa3", q:"When would you use a subquery vs a CTE (WITH clause)?",
      a:"CTEs are more readable for multi-step transformations, and recursive CTEs enable hierarchical queries. Subqueries are fine for simple in-line filtering. Materialised CTEs (some engines) can improve performance when the subquery is expensive and reused multiple times." },
  ],
  "st-sq2": [
    { id:"sqa4", q:"How does a B-tree index speed up a range query?",
      a:"B-tree nodes are sorted — the engine finds the start of the range in O(log n) then scans forward. This is far cheaper than a full table scan for selective ranges. Hash indexes cannot do range scans — they only support equality lookups." },
    { id:"sqa5", q:"What is an index-only scan (covering index)?",
      a:"When all columns needed by the query are in the index, the engine never touches the heap (table). This eliminates a second I/O round trip per row. Design covering indexes by adding frequently-read SELECT columns as INCLUDE columns in the index." },
  ],
  "st-sq3": [
    { id:"sqa6", q:"Explain the four ACID properties with a bank transfer example.",
      a:"Atomicity: debit and credit either both succeed or both roll back. Consistency: account balance never goes negative (constraint). Isolation: a concurrent reader never sees the half-transferred state. Durability: once committed, the transfer survives a crash." },
    { id:"sqa7", q:"What are the four SQL isolation levels and what anomalies does each prevent?",
      a:"READ UNCOMMITTED: no protection (dirty reads). READ COMMITTED (default in PG): prevents dirty reads. REPEATABLE READ: also prevents non-repeatable reads. SERIALIZABLE: prevents phantom reads too. Higher isolation = more locking/worse throughput." },
  ],
  "st-sd1": [
    { id:"sdqa1", q:"How would you design a URL shortener system?",
      a:"API: POST /shorten → returns short code; GET /:code → 301/302 redirect. Storage: hash map of code → long URL in a fast KV store (Redis + persistent DB). Code generation: base62 encode a counter, or hash the URL and take 6 chars. Scale: cache hot redirects in Redis, shard by short code prefix." },
    { id:"sdqa2", q:"How do you handle API versioning in a production web app?",
      a:"Three main strategies: (1) URL path (/v1/, /v2/). (2) Request header (Accept: application/vnd.api+json;version=2). (3) Query param (?version=2). URL versioning is most visible and cache-friendly. Maintain at least one old version when deprecating." },
    { id:"sdqa3", q:"What is idempotency and why does it matter for API design?",
      a:"An idempotent operation produces the same result no matter how many times it's called. GET, PUT, DELETE are idempotent. POST is not by default. For payment APIs, accept a client-generated idempotency key so retries don't double-charge. Store the key + response; on retry, return the cached response." },
  ],
  "st-sd2": [
    { id:"sdqa4", q:"Walk through a caching strategy for a product catalogue page.",
      a:"Cache the rendered HTML or JSON at CDN edge (low TTL, ~5 min). Back it with Redis for API-layer caching of DB query results (longer TTL). On inventory updates, fire a cache invalidation event (pub/sub) to purge affected keys. Use stale-while-revalidate for non-critical staleness tolerance." },
    { id:"sdqa5", q:"What is a cache stampede and how would you prevent it for a high-traffic route?",
      a:"All cache entries expire simultaneously → thousands of requests hit the DB at once. Solutions: (1) Jitter: randomise TTLs ± 10–20%. (2) Probabilistic early expiry: start background refresh slightly before TTL. (3) Single-flight / mutex: only one request regenerates; others wait." },
  ],
  "st-sd3": [
    { id:"sdqa6", q:"Explain the OAuth 2.0 authorisation code flow.",
      a:"1) User clicks 'Login with Google'. 2) App redirects to Google with client_id, redirect_uri, scope, state. 3) Google authenticates user, redirects back with a short-lived code. 4) App exchanges code for access_token + refresh_token at Google's token endpoint (server-to-server, client_secret never exposed to browser). 5) App uses access_token to call APIs." },
    { id:"sdqa7", q:"How would you scale session management for 10M concurrent users?",
      a:"Replace sticky-session server memory with a distributed store (Redis cluster). Each request carries a session ID in a secure httpOnly cookie. Redis lookups are O(1) and sub-millisecond. Add TTL-based expiry; refresh TTL on each request to implement sliding sessions." },
  ],
  "st-ds1": [
    { id:"dsqa1", q:"Describe the sliding window pattern and when to apply it.",
      a:"Two pointers (left and right) define a contiguous window. Expand right to grow; shrink left when an invariant is violated. O(n) — each element is added and removed at most once. Apply when the problem asks for an optimal contiguous subarray or substring with a constraint on its contents." },
    { id:"dsqa2", q:"Walk through 'minimum window substring' step by step.",
      a:"Maintain two frequency maps: target (required chars) and window (current chars). Expand right until all target chars are covered. Record the window, then shrink left to find the minimum valid window. Repeat until right reaches the end. O(n + m) time." },
  ],
  "st-ds2": [
    { id:"dsqa3", q:"What is the difference between BFS and DFS on a graph?",
      a:"BFS (queue): visits level by level — finds shortest path in unweighted graphs. DFS (stack/recursion): goes deep first — useful for cycle detection, topological sort, connected components. BFS has O(V+E) space from the queue; DFS uses O(h) recursion stack (h = depth)." },
    { id:"dsqa4", q:"How would you detect a cycle in a directed graph?",
      a:"DFS with three-color marking: white (unvisited), grey (in current recursion stack), black (fully processed). If DFS reaches a grey node, a cycle exists. Alternatively, topological sort via Kahn's algorithm — if not all nodes are processed, a cycle is present." },
  ],
});

// ── Additional subtopicMCQ for new FSD subtopic IDs ────────────────────────
Object.assign(WINNIFY.subtopicMCQ, {
  "st-js1": [
    { id:"jm1", difficulty:"Easy",   q:"Which queue is processed before macrotasks after each task completes?",
      choices:["Macrotask queue","Microtask queue","Render queue","Timer queue"], answer:1 },
    { id:"jm2", difficulty:"Medium", q:"Promise.all([p1, p2, p3]) rejects when:",
      choices:["All promises reject","Any one promise rejects","p1 specifically rejects","The first promise resolves"], answer:1 },
    { id:"jm3", difficulty:"Hard",   q:"What is the output order: console.log('A'); setTimeout(()=>log('B'),0); Promise.resolve().then(()=>log('C')); console.log('D')?",
      choices:["A D B C","A D C B","A B C D","D A C B"], answer:1 },
  ],
  "st-js2": [
    { id:"jm4", difficulty:"Easy",   q:"The classic var loop-closure bug is fixed by replacing var with:",
      choices:["const (only)","let","var + bind","IIFE only"], answer:1 },
    { id:"jm5", difficulty:"Medium", q:"let differs from var in that let is:",
      choices:["Function-scoped","Block-scoped with Temporal Dead Zone","Hoisted and initialised","Global in strict mode"], answer:1 },
  ],
  "st-js3": [
    { id:"jm6", difficulty:"Medium", q:"Arrow functions differ from regular functions in that they:",
      choices:["Cannot take parameters","Have no own this — inherit lexically","Cannot be async","Run faster"], answer:1 },
    { id:"jm7", difficulty:"Hard",   q:"Object.create(null) creates an object with:",
      choices:["Object.prototype as its prototype","null as its prototype — no inherited methods","A copy of Object.prototype","A frozen prototype"], answer:1 },
  ],
  "st-r1": [
    { id:"rm1", difficulty:"Easy",   q:"useEffect with an empty dependency array [] runs:",
      choices:["After every render","Once on mount","Never","Before the first render"], answer:1 },
    { id:"rm2", difficulty:"Medium", q:"useCallback is primarily used to:",
      choices:["Memoize a computed value","Stabilise a function reference across renders","Replace useState","Prevent all re-renders"], answer:1 },
  ],
  "st-r2": [
    { id:"rm3", difficulty:"Medium", q:"React.memo prevents a re-render when:",
      choices:["Any parent state changes","Props are shallowly equal to the previous render","The component calls setState","useEffect runs"], answer:1 },
    { id:"rm4", difficulty:"Hard",   q:"The reconciliation diffing algorithm assumes keys in lists are:",
      choices:["Always numeric indices","Stable and unique among siblings","Random","Provided by the browser"], answer:1 },
  ],
  "st-r3": [
    { id:"rm5", difficulty:"Medium", q:"React Context is NOT well-suited for:",
      choices:["Theme switching","Current authenticated user","High-frequency state updates (e.g., mouse position)","App locale"], answer:2 },
  ],
  "st-a1": [
    { id:"am1", difficulty:"Easy",   q:"Which HTTP method is idempotent AND safe (no side effects)?",
      choices:["POST","PUT","GET","DELETE"], answer:2 },
    { id:"am2", difficulty:"Medium", q:"Cursor-based pagination is preferred over offset-based because:",
      choices:["It is simpler to implement","It remains stable under concurrent inserts — no page drift","It works without a sort key","It uses less memory"], answer:1 },
  ],
  "st-a2": [
    { id:"am3", difficulty:"Easy",   q:"Storing a JWT in localStorage vs httpOnly cookie — the httpOnly cookie prevents:",
      choices:["CSRF attacks","XSS-based token theft","Network interception","Server-side validation"], answer:1 },
    { id:"am4", difficulty:"Hard",   q:"Short-lived access token + long-lived refresh token is preferred because:",
      choices:["It is simpler","It limits the window of exposure if the access token is stolen, while maintaining session persistence","Refresh tokens cannot be stolen","It requires no server state"], answer:1 },
  ],
  "st-a3": [
    { id:"am5", difficulty:"Medium", q:"In Express, calling next(err) skips to:",
      choices:["The next regular middleware","The nearest error-handling middleware (4 params)","The response.end()","The previous middleware"], answer:1 },
  ],
  "st-sq1": [
    { id:"sqm1", difficulty:"Easy",   q:"LEFT JOIN returns:",
      choices:["Only matching rows","All rows from left table; NULLs for unmatched right","All rows from right table","Only non-matching rows"], answer:1 },
    { id:"sqm2", difficulty:"Medium", q:"Window functions differ from GROUP BY in that they:",
      choices:["Are slower","Keep all rows while computing group-level aggregates","Always require an ORDER BY","Cannot use SUM or AVG"], answer:1 },
  ],
  "st-sq2": [
    { id:"sqm3", difficulty:"Medium", q:"An index-only scan means:",
      choices:["The whole table is scanned using the index","The query is satisfied by the index alone — no heap access","The index is rebuilt","Only one column is indexed"], answer:1 },
  ],
  "st-sq3": [
    { id:"sqm4", difficulty:"Easy",   q:"REPEATABLE READ isolation prevents:",
      choices:["Dirty reads only","Dirty reads and non-repeatable reads","Phantom reads too","Nothing"], answer:1 },
  ],
  "st-sd1": [
    { id:"sdm1", difficulty:"Medium", q:"An idempotency key in payment APIs ensures:",
      choices:["Faster responses","Retries return the same result without double-processing","The request is encrypted","The server needs less memory"], answer:1 },
  ],
  "st-sd2": [
    { id:"sdm2", difficulty:"Medium", q:"Jitter on cache TTLs prevents:",
      choices:["Cache misses","Cache stampede from mass simultaneous expiry","Stale reads","Cache eviction"], answer:1 },
  ],
  "st-sd3": [
    { id:"sdm3", difficulty:"Medium", q:"In OAuth 2.0 authorisation code flow, the client_secret is kept secure by:",
      choices:["Encrypting it in the browser","Exchanging the code for tokens in a server-to-server call, never in the browser","Storing it in localStorage","Rotating it on every request"], answer:1 },
  ],
  "st-ds1": [
    { id:"dsm1", difficulty:"Medium", q:"Sliding window runs in O(n) because:",
      choices:["It sorts the array","Each element is added and removed from the window at most once","It uses a hash map","The window is always fixed-size"], answer:1 },
  ],
  "st-ds2": [
    { id:"dsm2", difficulty:"Medium", q:"Cycle detection in a directed graph using DFS uses which colouring?",
      choices:["Black and white (2 colours)","White / grey / black (3 colours)","Red / blue","No colouring needed"], answer:1 },
  ],
});

// Behavioral cluster (ACC-08) — 14 STAR prompts
WINNIFY.behavioralQAs = [
  { id:"bq1",  q:"Tell me about a time you pushed back on a decision you disagreed with.",
    starHint:"S: meeting or project context · T: what was at stake if you stayed silent · A: how you raised the objection constructively · R: outcome and what the team decided.",
    confidence:null },
  { id:"bq2",  q:"Describe a project where you missed a deadline. What happened and what changed?",
    starHint:"S: project framing · T: the original deadline · A: your specific actions, not the team's · R: explicit lesson and one change you made since.",
    confidence:null },
  { id:"bq3",  q:"Tell me about your most ambiguous project and how you brought clarity.",
    starHint:"S: where the ambiguity lived · T: the unknowns you had to resolve · A: how you tightened scope or found the north star metric · R: what shipped.",
    confidence:null },
  { id:"bq4",  q:"Walk me through a disagreement with a manager. How did you resolve it?",
    starHint:"S: context of the disagreement · T: what you believed was wrong · A: how you presented data and escalated respectfully · R: final decision and relationship outcome.",
    confidence:null },
  { id:"bq5",  q:"Describe a time you owned an outcome that was not strictly your responsibility.",
    starHint:"S: where the gap was · T: why it mattered and nobody else was stepping up · A: what you specifically did · R: measurable impact on the team or product.",
    confidence:null },
  { id:"bq6",  q:"Tell me about a time you had to learn a new technology quickly under a deadline.",
    starHint:"S: project and timeline · T: the technology gap · A: structured approach to learning (docs, prototypes, asking the right people) · R: what you shipped and how long it took.",
    confidence:null },
  { id:"bq7",  q:"Describe a situation where you had to make a decision with incomplete information.",
    starHint:"S: decision context · T: what information was unavailable and why · A: how you reasoned under uncertainty and what assumptions you made explicit · R: outcome and whether you revisited the decision.",
    confidence:null },
  { id:"bq8",  q:"Tell me about a time you significantly improved a process or system.",
    starHint:"S: the pain point or inefficiency · T: what you were tasked to fix or what you noticed independently · A: your specific change · R: quantified improvement (time saved, error rate, throughput).",
    confidence:null },
  { id:"bq9",  q:"Describe the most technically complex problem you have solved.",
    starHint:"S: the system or codebase · T: the specific technical challenge · A: your investigation and solution approach · R: outcome and what you would do differently.",
    confidence:null },
  { id:"bq10", q:"Tell me about a time you mentored or helped a colleague grow.",
    starHint:"S: the colleague and context · T: the skill or knowledge gap · A: specific steps you took (pair programming, structured reviews, 1-on-1s) · R: measurable growth and what you learned about teaching.",
    confidence:null },
  { id:"bq11", q:"Describe a time you had to balance speed and quality under pressure.",
    starHint:"S: the deadline and constraints · T: where the trade-off lived · A: how you assessed the risk of cutting corners · R: what shipped, what you deferred, and what broke (if anything).",
    confidence:null },
  { id:"bq12", q:"Tell me about a time you failed. What did you learn?",
    starHint:"S: what you were attempting · T: the expected outcome · A: what went wrong and what you did after · R: the concrete change you made and how it played out.",
    confidence:null },
  { id:"bq13", q:"Describe a time you had to influence without authority to get something done.",
    starHint:"S: the stakeholders and their incentives · T: what you needed from them · A: how you built alignment (data, demos, finding a shared win) · R: outcome.",
    confidence:null },
  { id:"bq14", q:"Tell me about a time you received critical feedback. How did you respond?",
    starHint:"S: who gave the feedback and in what setting · T: what specifically was said · A: your immediate reaction versus your considered response · R: what you changed and evidence it worked.",
    confidence:null },
];

// GD topic pool (FO-GD-01) — 8 topics
WINNIFY.gdTopics = [
  { id:"gd1",  topic:"Should companies prefer hiring generalists over specialists in early engineering teams?",
    angles:["Generalists ship faster in early-stage ambiguity","Specialists scale better once product-market fit is found","Optimal ratio depends on problem domain and team size"] },
  { id:"gd2",  topic:"Is remote work hurting career growth for early-career engineers?",
    angles:["Less osmotic learning from senior engineers","Better deep-work environment and access to global opportunities","Outcome depends on manager quality and team culture, not location"] },
  { id:"gd3",  topic:"Are coding interviews still the right way to evaluate developers in 2026?",
    angles:["LeetCode-style tests measure pattern recognition, not production engineering","Take-home projects and system design better predict on-the-job performance","Interview format is a company culture signal — pick accordingly"] },
  { id:"gd4",  topic:"Should AI-generated code be allowed in technical interviews?",
    angles:["Real work uses AI tools — banning them tests an artificial setting","Interviewers cannot verify AI abstinence — policy is unenforceable","Tests should shift to architectural thinking and tradeoff discussion"] },
  { id:"gd5",  topic:"Is a four-year CS degree still necessary to become a software engineer?",
    angles:["Bootcamp and self-taught engineers close the gap quickly in practice","Fundamentals (OS, networking, algorithms) are taught rigorously only in degree programs","Employers are dropping degree requirements but GPA/school still correlates with first-job offers"] },
  { id:"gd6",  topic:"Should engineers be responsible for the ethical impact of the products they build?",
    angles:["Individual accountability is limited — systemic incentives drive product decisions","Engineers closest to implementation have the most power to raise concerns early","Professional codes of conduct (like medicine) should apply to software"] },
  { id:"gd7",  topic:"Is 'move fast and break things' a valid engineering philosophy in 2026?",
    angles:["Works in early-stage consumer apps with low stakes","Catastrophic for infrastructure, fintech, or health-tech where failure costs lives or trust","Speed and reliability are now table stakes — the tradeoff is a false dichotomy for most companies"] },
  { id:"gd8",  topic:"Should large tech companies be broken up to promote competition?",
    angles:["Network effects create natural monopolies that regulation cannot easily unwind","Antitrust action could stifle R&D investment and hurt consumers in the short term","Platform dominance harms startups and developer ecosystems — structural remedies may be needed"] },
];


// Ad-hoc task triggers (ACC-01)
WINNIFY.adHocTaskCatalog = [
  { priority: 1, trigger: "time-pressure-behavioral", label: "Run a WinSpeak Behavioral session — interview is in 2 days.",
    cta: "Start session", action: "acc:beh-practice" },
  { priority: 1, trigger: "time-pressure-aptitude",   label: "Aptitude is at 0% with 2 days left — run a short session.",
    cta: "Start session", action: "acc:apt-session" },
  { priority: 2, trigger: "time-pressure-topic",      label: "You haven't run WinSpeak for Arrays & Strings yet — top-frequency topic.",
    cta: "Open topic", action: "acc:topic", topicId: "tt-dsa-arr" },
  { priority: 3, trigger: "imbalance-behavioral",     label: "Technical is at 60%+. Behavioral hasn't been started — let's balance.",
    cta: "Start Behavioral", action: "acc:beh-practice" },
  { priority: 5, trigger: "progress-gap",             label: "All Caching subtopics have MCQs done — finish with a WinSpeak session.",
    cta: "Open topic", action: "acc:topic", topicId: "tt-sd-cache" },
];


// ─── Additional Foundation Clusters ──────────────────────────────────────────
WINNIFY.clusters.DBMS = {
  name: "DBMS & SQL",
  topics: [
    { id: "sql",    name: "SQL Basics",            row: 0, col: 0, status: "done" },
    { id: "joins",  name: "Joins",                 row: 0, col: 1, status: "done" },
    { id: "agg",    name: "Aggregations",           row: 0, col: 2, status: "focus" },
    { id: "norm",   name: "Normalization",          row: 1, col: 0, status: "done" },
    { id: "idx",    name: "Indexing",               row: 1, col: 1, status: "focus" },
    { id: "txn",    name: "Transactions & ACID",    row: 1, col: 2, status: "focus" },
    { id: "qopt",   name: "Query Optimization",     row: 2, col: 0, status: "todo" },
    { id: "cc",     name: "Concurrency Control",    row: 2, col: 1, status: "todo" },
    { id: "nosql",  name: "NoSQL vs SQL",           row: 2, col: 2, status: "todo" },
    { id: "stored", name: "Stored Procedures",      row: 3, col: 0, status: "todo" },
    { id: "views",  name: "Views & Materialized",   row: 3, col: 1, status: "todo" },
    { id: "repl",   name: "Replication Basics",     row: 3, col: 2, status: "todo" },
  ],
  edges: [
    ["sql","joins"], ["sql","agg"], ["sql","norm"],
    ["joins","agg"], ["norm","idx"], ["norm","txn"],
    ["idx","qopt"], ["txn","cc"], ["txn","nosql"],
    ["qopt","stored"], ["cc","stored"], ["nosql","views"],
    ["stored","repl"], ["views","repl"],
  ],
};

WINNIFY.clusters.OS = {
  name: "Operating Systems",
  topics: [
    { id: "proc",   name: "Processes vs Threads",      row: 0, col: 0, status: "focus" },
    { id: "sched",  name: "CPU Scheduling",            row: 0, col: 1, status: "todo" },
    { id: "syscall",name: "System Calls",              row: 0, col: 2, status: "todo" },
    { id: "sync",   name: "Synchronization",           row: 1, col: 0, status: "todo" },
    { id: "dead",   name: "Deadlocks",                 row: 1, col: 1, status: "todo" },
    { id: "mem",    name: "Memory Management",         row: 1, col: 2, status: "todo" },
    { id: "vmem",   name: "Virtual Memory",            row: 2, col: 0, status: "todo" },
    { id: "page",   name: "Paging & Segmentation",     row: 2, col: 1, status: "todo" },
    { id: "fs",     name: "File Systems",              row: 2, col: 2, status: "todo" },
    { id: "ipc",    name: "IPC Mechanisms",            row: 3, col: 0, status: "todo" },
    { id: "io",     name: "I/O Management",            row: 3, col: 1, status: "todo" },
  ],
  edges: [
    ["proc","sched"], ["proc","sync"], ["proc","syscall"],
    ["sched","sync"], ["sync","dead"],
    ["syscall","mem"], ["mem","vmem"], ["vmem","page"],
    ["syscall","fs"], ["mem","fs"],
    ["dead","ipc"], ["fs","io"], ["ipc","io"],
  ],
};

WINNIFY.clusters.Networking = {
  name: "Networking",
  topics: [
    { id: "osi",    name: "OSI Model",               row: 0, col: 0, status: "todo" },
    { id: "tcpip",  name: "TCP/IP Stack",             row: 0, col: 1, status: "todo" },
    { id: "tcp",    name: "TCP vs UDP",               row: 1, col: 0, status: "todo" },
    { id: "http",   name: "HTTP & HTTPS",             row: 1, col: 1, status: "todo" },
    { id: "dns",    name: "DNS",                      row: 1, col: 2, status: "todo" },
    { id: "tls",    name: "TLS/SSL",                  row: 2, col: 0, status: "todo" },
    { id: "ws",     name: "WebSockets",               row: 2, col: 1, status: "todo" },
    { id: "lb",     name: "Load Balancing",           row: 2, col: 2, status: "todo" },
    { id: "cdn",    name: "CDN & Proxies",            row: 3, col: 0, status: "todo" },
    { id: "rest",   name: "REST & GraphQL",           row: 3, col: 1, status: "todo" },
  ],
  edges: [
    ["osi","tcpip"], ["tcpip","tcp"], ["tcpip","http"],
    ["http","dns"], ["http","tls"], ["tcp","ws"],
    ["tls","ws"], ["dns","cdn"], ["http","rest"],
    ["lb","cdn"], ["ws","rest"],
  ],
};

WINNIFY.clusters["System Design"] = {
  name: "System Design",
  topics: [
    { id: "cap",    name: "CAP Theorem",             row: 0, col: 0, status: "todo" },
    { id: "apidesign", name: "API Design",           row: 0, col: 1, status: "todo" },
    { id: "cache",  name: "Caching Strategies",      row: 1, col: 0, status: "todo" },
    { id: "shard",  name: "Sharding & Partitioning", row: 1, col: 1, status: "todo" },
    { id: "repl2",  name: "Replication",             row: 1, col: 2, status: "todo" },
    { id: "mq",     name: "Message Queues",          row: 2, col: 0, status: "todo" },
    { id: "rl",     name: "Rate Limiting",           row: 2, col: 1, status: "todo" },
    { id: "lbsd",   name: "Load Balancers",          row: 2, col: 2, status: "todo" },
    { id: "ms",     name: "Microservices",           row: 3, col: 0, status: "todo" },
    { id: "ch",     name: "Consistent Hashing",      row: 3, col: 1, status: "todo" },
    { id: "obs",    name: "Observability",           row: 3, col: 2, status: "todo" },
  ],
  edges: [
    ["cap","shard"], ["cap","repl2"],
    ["apidesign","rl"], ["apidesign","cache"],
    ["cache","shard"], ["shard","ch"],
    ["repl2","cache"], ["mq","ms"],
    ["rl","lbsd"], ["lbsd","ms"],
    ["ms","obs"], ["ch","obs"],
  ],
};


// ─── Per-topic content: summary pages, flashcards, video IDs ─────────────────
WINNIFY.topicData = {

  // ── DBMS ─────────────────────────────────────────────────────────────────
  sql: {
    summary: [
      { heading: "SQL Basics — Queries & Syntax", body: "SQL (Structured Query Language) is the standard language for relational databases. Core statements: SELECT retrieves rows, INSERT adds rows, UPDATE modifies, DELETE removes. The WHERE clause filters; ORDER BY sorts; LIMIT caps results. Aliases (AS) rename columns or tables for readability.", points: ["SELECT col FROM table WHERE cond ORDER BY col LIMIT n", "INSERT INTO t (cols) VALUES (vals)", "UPDATE t SET col=val WHERE cond", "DELETE FROM t WHERE cond"] },
      { heading: "SQL Basics — Constraints & DDL", body: "DDL (Data Definition Language) manages schema. CREATE TABLE defines structure with data types and constraints. PRIMARY KEY uniquely identifies rows. FOREIGN KEY enforces referential integrity. NOT NULL, UNIQUE, CHECK, DEFAULT are column-level constraints. ALTER TABLE adds/drops columns; DROP TABLE deletes.", points: ["PRIMARY KEY — unique + not null", "FOREIGN KEY — references another table's PK", "UNIQUE — no duplicate values in column", "CHECK — validates column values against expression"] }
    ],
    flashcards: [
      { q: "What does SELECT DISTINCT do?", a: "Returns only unique rows — eliminates duplicate values from the result set." },
      { q: "Difference between WHERE and HAVING?", a: "WHERE filters rows before grouping; HAVING filters groups after GROUP BY." },
      { q: "What is a PRIMARY KEY?", a: "A column (or set) that uniquely identifies each row; implicitly NOT NULL and UNIQUE." },
      { q: "What does FOREIGN KEY enforce?", a: "Referential integrity — every value in the FK column must exist in the referenced table's PK." },
      { q: "What is a NULL in SQL?", a: "NULL means unknown/absent. Use IS NULL / IS NOT NULL; comparisons with = NULL always return NULL." },
      { q: "What does GROUP BY do?", a: "Collapses rows with identical values in specified columns into summary rows for aggregate functions." }
    ],
    mcqs: [
      { q: "Which clause filters results AFTER GROUP BY?", choices: ["WHERE","HAVING","ORDER BY","LIMIT"], answer: 1 },
      { q: "Which constraint ensures no duplicate values in a column?", choices: ["PRIMARY KEY","FOREIGN KEY","UNIQUE","CHECK"], answer: 2 },
      { q: "SELECT * FROM t WHERE id = NULL — how many rows returned?", choices: ["All rows","0 rows","Rows where id is NULL","Error"], answer: 1 },
    ],
    videoId: "HXV3zeQKqGY"
  },
  joins: {
    summary: [
      { heading: "Joins — Combining Tables", body: "A JOIN combines rows from two tables based on a related column. INNER JOIN returns only matching rows. LEFT JOIN returns all left-table rows plus matches (NULLs where no match). RIGHT JOIN is the mirror. FULL OUTER JOIN returns all rows from both tables.", points: ["INNER JOIN — intersection only", "LEFT JOIN — all of left + matched right", "RIGHT JOIN — all of right + matched left", "FULL OUTER JOIN — union of both"] },
      { heading: "Joins — Self & Cross Joins", body: "SELF JOIN joins a table to itself — useful for hierarchical data (employees and their managers). CROSS JOIN produces a Cartesian product (every row × every row). Use cross join only when intentional — it scales as O(n²). Natural Join auto-joins on columns with the same name (avoid in production — fragile).", points: ["Self join: alias same table twice", "Cross join: n×m rows — use with care", "Natural join: implicit on shared column names", "Prefer explicit ON conditions over NATURAL JOIN"] }
    ],
    flashcards: [
      { q: "What rows does an INNER JOIN return?", a: "Only rows where the join condition matches in BOTH tables." },
      { q: "What does LEFT JOIN add over INNER JOIN?", a: "All rows from the left table; unmatched right-side columns are NULL." },
      { q: "What is a CROSS JOIN?", a: "Cartesian product — pairs every row of table A with every row of table B. O(n×m) rows." },
      { q: "When would you use a SELF JOIN?", a: "To query hierarchical relationships within one table, e.g. employee → manager where both are rows in the same table." },
      { q: "What is a NATURAL JOIN?", a: "Implicitly joins on all columns with the same name in both tables. Fragile — avoid in production code." },
      { q: "INNER JOIN vs OUTER JOIN in one line?", a: "INNER: only matched rows. OUTER: matched rows + unmatched rows from one or both tables (with NULLs)." }
    ],
    mcqs: [
      { q: "Table A has 5 rows, Table B has 4 rows. Cross join returns?", choices: ["9","20","5","4"], answer: 1 },
      { q: "Which join type returns NULLs for unmatched rows on the right side?", choices: ["INNER JOIN","RIGHT JOIN","LEFT JOIN","CROSS JOIN"], answer: 2 },
    ],
    videoId: "9yeOJ0ZMUYw"
  },
  agg: {
    summary: [
      { heading: "Aggregations — GROUP BY & Functions", body: "Aggregate functions compute a single result from a set of rows: COUNT(*) counts rows, SUM totals a column, AVG averages, MIN/MAX find extremes. GROUP BY splits the result into groups before aggregating. Every non-aggregate column in SELECT must appear in GROUP BY.", points: ["COUNT(*) — includes NULLs; COUNT(col) excludes NULLs", "SUM / AVG — numeric columns only", "GROUP BY col1, col2 — groups by combination", "HAVING filters groups; WHERE filters rows"] },
      { heading: "Aggregations — Window Functions", body: "Window functions compute across a set of rows related to the current row without collapsing them. OVER() defines the window. PARTITION BY divides into groups; ORDER BY determines row order within the window. ROW_NUMBER(), RANK(), DENSE_RANK(), LAG(), LEAD(), SUM() OVER() are common.", points: ["ROW_NUMBER() — unique sequential number per partition", "RANK() — ties get same rank, gaps follow", "DENSE_RANK() — ties get same rank, no gaps", "LAG/LEAD — access previous/next row's value"] }
    ],
    flashcards: [
      { q: "Difference between COUNT(*) and COUNT(col)?", a: "COUNT(*) counts all rows including NULLs; COUNT(col) counts non-NULL values in that column." },
      { q: "Can you use WHERE with aggregate functions?", a: "No — use HAVING. WHERE filters before aggregation; HAVING filters after GROUP BY." },
      { q: "What does PARTITION BY do in a window function?", a: "Divides the result set into partitions — the window function resets for each partition." },
      { q: "RANK() vs DENSE_RANK()?", a: "RANK() leaves gaps after ties (1,1,3). DENSE_RANK() doesn't (1,1,2)." },
      { q: "What does LAG(col, n) return?", a: "The value of col from n rows before the current row within the window partition." },
      { q: "SUM() OVER (ORDER BY date) computes what?", a: "A running total — cumulative sum of the column up to the current row." }
    ],
    mcqs: [
      { q: "Which aggregate ignores NULL values?", choices: ["COUNT(*)","SUM(col)","Both SUM and COUNT(*)","Neither"], answer: 1 },
      { q: "RANK() on values [10,10,20] returns?", choices: ["1,1,2","1,2,3","1,1,3","2,2,3"], answer: 2 },
    ],
    videoId: "7moh8xSC3Gk"
  },
  norm: {
    summary: [
      { heading: "Normalization — 1NF to 3NF", body: "Normalization reduces data redundancy and improves integrity. 1NF: atomic values, no repeating groups, each row uniquely identified. 2NF: 1NF + no partial dependency (non-key attributes depend on the full primary key, not just part of it). 3NF: 2NF + no transitive dependency (non-key attributes depend only on the PK, not on other non-key attributes).", points: ["1NF — atomic cells, unique rows", "2NF — full functional dependency on PK", "3NF — no non-key → non-key dependencies", "Violations → data anomalies on insert/update/delete"] },
      { heading: "Normalization — BCNF & Denormalization", body: "BCNF (Boyce-Codd NF) is a stricter 3NF: every determinant must be a superkey. Most relations in 3NF are also in BCNF. Denormalization intentionally introduces redundancy for read performance — common in data warehouses and OLAP systems. Trade-off: faster reads, harder writes, more storage.", points: ["BCNF: for every X→Y, X must be a superkey", "Violation: split into two tables", "Denormalize for read-heavy workloads (OLAP)", "OLTP prefers normalized; OLAP often denormalized"] }
    ],
    flashcards: [
      { q: "What is 1NF?", a: "Each column has atomic (indivisible) values, no repeating groups, and each row is uniquely identifiable." },
      { q: "What violates 2NF?", a: "A partial dependency — a non-key attribute depends on only part of a composite primary key." },
      { q: "What violates 3NF?", a: "A transitive dependency — a non-key attribute depends on another non-key attribute rather than directly on the PK." },
      { q: "What is BCNF?", a: "Every determinant must be a candidate key (superkey). Stronger than 3NF — eliminates remaining anomalies." },
      { q: "Why denormalize?", a: "To improve read performance by reducing joins. Common in analytics/OLAP where updates are rare." },
      { q: "What is a functional dependency?", a: "X → Y means knowing X uniquely determines Y. Basis for all normal form analysis." }
    ],
    mcqs: [
      { q: "A table with a composite PK where a non-key column depends on only one PK column violates:", choices: ["1NF","2NF","3NF","BCNF"], answer: 1 },
      { q: "Denormalization is most appropriate for:", choices: ["OLTP write-heavy systems","OLAP read-heavy analytics","Both equally","Neither"], answer: 1 },
    ],
    videoId: "GFQaEYEc8_8"
  },
  idx: {
    summary: [
      { heading: "Indexing — B-Tree & Hash Indexes", body: "An index is a data structure that speeds up row retrieval without scanning the full table. B-Tree indexes (default in most RDBMS) store data in a balanced tree — O(log n) lookups, range queries, ORDER BY. Hash indexes use a hash table — O(1) equality lookups but no range queries. Clustered index stores rows in index order (one per table); non-clustered index is a separate structure pointing to row locations.", points: ["B-Tree: O(log n), supports range + equality", "Hash: O(1) equality only, no range", "Clustered: row data stored in index order", "Non-clustered: pointer to row; multiple per table"] },
      { heading: "Indexing — Composite & Covering Indexes", body: "A composite index covers multiple columns — order matters. Queries can use the index if they filter on a left-prefix of the indexed columns. A covering index includes all columns a query needs, so the DB never hits the table (index-only scan). Too many indexes slow writes and waste storage.", points: ["Composite index: (a,b,c) helps WHERE a=? AND b=?", "Left-prefix rule: (a,b,c) does NOT help WHERE b=?", "Covering index: query satisfied entirely from index", "Index trade-off: faster reads, slower writes"] }
    ],
    flashcards: [
      { q: "Why does a B-Tree index support range queries but hash index does not?", a: "B-Tree stores keys in sorted order so a range scan is a sequential traversal. A hash distributes keys randomly — no ordering." },
      { q: "What is a clustered index?", a: "The table rows are physically stored in the order of the index. Only one clustered index per table (it IS the table storage)." },
      { q: "What is a covering index?", a: "An index that includes every column the query needs, so the query can be answered from the index alone without touching the table." },
      { q: "Left-prefix rule in composite indexes?", a: "A composite index (a,b,c) is usable only if the query filters start from 'a'. Filtering only on 'b' or 'c' skips the index." },
      { q: "When should you NOT add an index?", a: "On small tables, write-heavy tables, columns with low cardinality (few distinct values), or columns rarely used in WHERE/JOIN." },
      { q: "What is an index scan vs a full table scan?", a: "Index scan traverses the index structure (O(log n)); full table scan reads every row. Index scans win for selective queries." }
    ],
    mcqs: [
      { q: "A composite index on (city, age). Which query uses it?", choices: ["WHERE age=25","WHERE city='NY'","WHERE age=25 AND salary>50k","ORDER BY age"], answer: 1 },
      { q: "Which index type supports range queries?", choices: ["Hash index","B-Tree index","Both","Neither"], answer: 1 },
    ],
    videoId: "fsG1XaZEa78"
  },
  txn: {
    summary: [
      { heading: "Transactions & ACID", body: "A transaction is a unit of work that must execute atomically. ACID guarantees: Atomicity — all-or-nothing (COMMIT or ROLLBACK). Consistency — DB moves from one valid state to another. Isolation — concurrent transactions don't see each other's partial work. Durability — committed data survives crashes (WAL / redo log).", points: ["Atomicity: partial failure → full rollback", "Consistency: constraints always satisfied post-commit", "Isolation: concurrency anomalies controlled by level", "Durability: write-ahead log ensures persistence"] },
      { heading: "Transactions — Isolation Levels", body: "Isolation levels trade consistency for concurrency. Read Uncommitted (dirtiest) → Read Committed → Repeatable Read → Serializable (strictest). Anomalies: dirty read (read uncommitted data), non-repeatable read (row changes between reads), phantom read (new rows appear between reads). PostgreSQL default: Read Committed. MySQL InnoDB default: Repeatable Read.", points: ["Dirty read — prevented at Read Committed+", "Non-repeatable read — prevented at Repeatable Read+", "Phantom read — prevented at Serializable only", "Higher isolation = more locks = less throughput"] }
    ],
    flashcards: [
      { q: "What does Atomicity guarantee?", a: "Either all operations in a transaction commit, or none do — partial state is never persisted." },
      { q: "What is a dirty read?", a: "Reading data written by a transaction that hasn't committed yet — that write might be rolled back." },
      { q: "What anomaly does Repeatable Read prevent?", a: "Non-repeatable reads — the same SELECT returns the same rows within a transaction, even if another transaction commits changes." },
      { q: "What does Durability rely on technically?", a: "Write-ahead logging (WAL) — changes are written to a log before the data pages, so they can be replayed after a crash." },
      { q: "What is a phantom read?", a: "A transaction re-runs a query and sees new rows that were inserted by another committed transaction." },
      { q: "Default isolation level in PostgreSQL?", a: "Read Committed — dirty reads are prevented, but non-repeatable reads are possible." }
    ],
    mcqs: [
      { q: "Which isolation level prevents phantom reads?", choices: ["Read Committed","Repeatable Read","Serializable","Read Uncommitted"], answer: 2 },
      { q: "COMMIT fails — what happens to the transaction's writes?", choices: ["Partially saved","Fully rolled back","Saved to a temp table","Depends on DB"], answer: 1 },
    ],
    videoId: "pomxJOFVcQs"
  },
  qopt: {
    summary: [
      { heading: "Query Optimization — Execution Plans", body: "The query optimizer converts SQL into an execution plan — a tree of physical operators. EXPLAIN (or EXPLAIN ANALYZE) shows the plan: Seq Scan reads all rows, Index Scan uses an index, Nested Loop / Hash Join / Merge Join combine tables. Cost estimates drive plan choice. Statistics (ANALYZE) keep estimates accurate.", points: ["EXPLAIN — shows estimated plan and cost", "EXPLAIN ANALYZE — actually executes and shows real times", "Seq Scan: O(n); Index Scan: O(log n + k)", "Outdated statistics → bad plans → slow queries"] },
      { heading: "Query Optimization — Rewrites & Hints", body: "The optimizer rewrites queries for efficiency: predicate pushdown (filter early), projection pruning (drop unneeded columns), join reordering. Common pitfalls: functions on indexed columns disable the index (WHERE YEAR(date)=2024 → use range), OR on multiple columns, SELECT * when few columns needed, N+1 query problem in ORMs.", points: ["Predicate pushdown: filter before join", "Sargable: WHERE col = ? (uses index) vs WHERE fn(col) = ? (doesn't)", "N+1: fetch 100 parents + 100 child queries → use JOIN or eager load", "LIMIT early to avoid processing unneeded rows"] }
    ],
    flashcards: [
      { q: "What does EXPLAIN ANALYZE do?", a: "Executes the query and shows the actual execution plan with real row counts and timing — not just estimates." },
      { q: "What is a sargable predicate?", a: "A WHERE condition the engine can use an index for. Functions on the column (WHERE YEAR(col)=?) are not sargable." },
      { q: "What causes an N+1 query problem?", a: "Fetching a list of N records, then issuing one query per record to get related data — totaling N+1 round trips." },
      { q: "Why does SELECT * hurt performance?", a: "Transfers unneeded columns, prevents index-only scans, and breaks covering index optimizations." },
      { q: "What is predicate pushdown?", a: "The optimizer moves filter conditions as early as possible in the plan to reduce the number of rows processed downstream." },
      { q: "When does a query NOT use an index on col?", a: "When a function wraps the column: WHERE LOWER(col) = 'x'. Use generated columns or function-based indexes instead." }
    ],
    mcqs: [
      { q: "WHERE UPPER(name) = 'ALICE' — does this use an index on name?", choices: ["Yes","No","Only B-Tree","Only on PostgreSQL"], answer: 1 },
      { q: "Best tool to diagnose a slow query in PostgreSQL?", choices: ["DESCRIBE","EXPLAIN ANALYZE","SHOW PLAN","PROFILE"], answer: 1 },
    ],
    videoId: "BHwzDmr6d7s"
  },
  cc: {
    summary: [
      { heading: "Concurrency Control — Locking", body: "Concurrency control ensures correctness when multiple transactions run simultaneously. Pessimistic locking acquires locks before accessing data — shared lock for reads, exclusive lock for writes. Two-Phase Locking (2PL): growing phase (acquire locks), shrinking phase (release). Strict 2PL holds all locks until commit — prevents cascading aborts.", points: ["Shared lock (S): multiple readers allowed", "Exclusive lock (X): single writer, no readers", "2PL: ensures serializability", "Deadlock: cycle of transactions waiting on each other's locks"] },
      { heading: "Concurrency Control — MVCC", body: "Multi-Version Concurrency Control (MVCC) keeps multiple versions of each row. Readers see a consistent snapshot without blocking writers; writers create new versions without blocking readers. PostgreSQL and InnoDB use MVCC. Old versions are cleaned up by VACUUM. Optimistic locking (version numbers) detects conflicts at commit time without holding locks.", points: ["MVCC: readers never block writers and vice versa", "Snapshot isolation: each txn sees DB at its start time", "VACUUM: reclaims dead row versions in PostgreSQL", "Optimistic: check version at commit; retry on conflict"] }
    ],
    flashcards: [
      { q: "What is a shared vs exclusive lock?", a: "Shared (S): multiple transactions can read simultaneously. Exclusive (X): one transaction writes; all others blocked." },
      { q: "What is Two-Phase Locking?", a: "Growing phase: acquire all needed locks. Shrinking phase: release locks. No acquiring after first release. Guarantees serializability." },
      { q: "How does MVCC avoid read-write conflicts?", a: "Readers access an older consistent snapshot; writers create new versions. Neither blocks the other." },
      { q: "How does a deadlock occur?", a: "Transaction A holds lock X, waits for Y. Transaction B holds Y, waits for X. Neither can proceed." },
      { q: "How do databases detect deadlocks?", a: "Periodic wait-for graph cycle detection. When a cycle is found, one transaction is chosen as victim and rolled back." },
      { q: "What is optimistic locking?", a: "No locks held during transaction. At commit, check if the data was modified (via version/timestamp). If yes, abort and retry." }
    ],
    mcqs: [
      { q: "Which approach best fits read-heavy workloads with occasional writes?", choices: ["Strict 2PL","MVCC","Table locks","Row-level exclusive locks"], answer: 1 },
      { q: "MVCC old row versions are cleaned up by:", choices: ["COMMIT","ROLLBACK","VACUUM","CHECKPOINT"], answer: 2 },
    ],
    videoId: "sxabCqWsFHg"
  },
  nosql: {
    summary: [
      { heading: "NoSQL vs SQL — When to Choose", body: "Relational (SQL) databases store structured data in tables with strict schemas, ACID transactions, and powerful joins. NoSQL databases sacrifice some of these for scale, flexibility, or speed. Key-value stores (Redis) for caching; Document stores (MongoDB) for semi-structured data; Column-family (Cassandra) for wide-column analytics; Graph DBs (Neo4j) for highly connected data.", points: ["SQL: schema-first, ACID, joins, vertical scale", "Key-value: O(1) get/set, no queries, ephemeral or persistent", "Document: JSON/BSON, flexible schema, nested objects", "Column-family: write-optimized, good for time-series / IoT"] },
      { heading: "NoSQL — CAP Theorem Basics", body: "CAP theorem: a distributed system can guarantee only 2 of 3 — Consistency (all nodes see same data), Availability (every request gets a response), Partition Tolerance (works despite network splits). Since partitions are unavoidable, real systems choose CP (consistent + partition-tolerant) or AP (available + partition-tolerant). PACELC extends CAP to include latency trade-offs under normal operation.", points: ["CP: HBase, MongoDB (default), Zookeeper", "AP: Cassandra, DynamoDB, CouchDB", "SQL DBs are CA — not distributed by default", "PACELC: even without partition, latency vs consistency"] }
    ],
    flashcards: [
      { q: "When would you choose MongoDB over PostgreSQL?", a: "For flexible, evolving schemas, nested document structures, or when horizontal scale matters more than complex joins." },
      { q: "What is a key-value store best for?", a: "Fast O(1) reads/writes by key — session storage, caching, rate limiting, leaderboards." },
      { q: "What does Cassandra optimise for?", a: "Write-heavy, wide-column workloads. It's AP — eventual consistency, but extremely high write throughput and horizontal scale." },
      { q: "CAP theorem — what are the three properties?", a: "Consistency (all nodes return same data), Availability (every request gets a response), Partition Tolerance (survives network splits)." },
      { q: "Why can't a distributed system be CAP-complete?", a: "Network partitions happen. During a partition you must choose between consistency (refuse stale reads) or availability (serve possibly stale data)." },
      { q: "What is eventual consistency?", a: "Writes propagate to all replicas asynchronously. Reads might return stale data temporarily but will converge to the latest value." }
    ],
    mcqs: [
      { q: "Which DB is CP (consistent + partition tolerant)?", choices: ["Cassandra","DynamoDB","HBase","CouchDB"], answer: 2 },
      { q: "Best DB choice for a social graph with deep relationship queries?", choices: ["Redis","PostgreSQL","Neo4j","Cassandra"], answer: 2 },
    ],
    videoId: "W2Z7fbCLSTw"
  },
  stored: {
    summary: [
      { heading: "Stored Procedures & Functions", body: "A stored procedure is a named, reusable block of SQL (and procedural code) stored in the database. Benefits: reduced network round-trips (logic lives on server), reusability, security (grant EXECUTE without exposing tables). A function is similar but must return a value and is usable in SQL expressions. Triggers fire automatically on INSERT/UPDATE/DELETE.", points: ["Stored proc: no mandatory return, side effects OK", "Function: must return value, used in SELECT/WHERE", "Trigger: auto-fires on data events (BEFORE/AFTER)", "Pros: perf + security. Cons: hard to version-control, test"] },
      { heading: "Views & Indexes (Recap)", body: "A view is a saved SELECT query — acts like a virtual table. Simple views are updatable. Materialized views store the result on disk and must be refreshed. They trade freshness for query speed. An index on a materialized view enables fast analytics. REFRESH MATERIALIZED VIEW [CONCURRENTLY] updates the data.", points: ["View: virtual, always fresh, no storage", "Materialized view: stored on disk, needs refresh", "REFRESH CONCURRENTLY: no lock but requires unique index", "Use materialized views for expensive aggregation queries"] }
    ],
    flashcards: [
      { q: "Stored procedure vs function?", a: "Procedures: no required return, can have side effects, called with CALL. Functions: must return a value, usable inside SQL expressions." },
      { q: "When do triggers fire?", a: "Automatically BEFORE or AFTER INSERT, UPDATE, or DELETE on a table — or INSTEAD OF on a view." },
      { q: "What is a view?", a: "A named saved query. Every access re-executes the query — no storage, always fresh, optionally updatable." },
      { q: "What is a materialized view?", a: "A view whose result is stored physically on disk. Faster reads but stale until manually or automatically refreshed." },
      { q: "Why use stored procedures for security?", a: "Grant EXECUTE permission on the procedure without exposing the underlying tables — users can't run arbitrary SQL." },
      { q: "REFRESH MATERIALIZED VIEW CONCURRENTLY?", a: "Refreshes without locking out reads, but requires a unique index on the materialized view." }
    ],
    mcqs: [
      { q: "Which object stores query results physically on disk?", choices: ["View","Stored Procedure","Materialized View","Index"], answer: 2 },
      { q: "A trigger fires:", choices: ["Only on SELECT","On INSERT/UPDATE/DELETE","Only on schema changes","On COMMIT"], answer: 1 },
    ],
    videoId: "Sggdhot1KJM"
  },
  views: {
    summary: [
      { heading: "Views & Materialized Views", body: "A view is a virtual table — a named query stored in the catalog. It has no data of its own; each query against the view re-runs the underlying SELECT. Simple single-table views are usually updatable. Complex views (joins, aggregates) are read-only. Materialized views cache the query result on disk for performance.", points: ["Virtual view: fresh data, no storage overhead", "Read-only if it uses DISTINCT, GROUP BY, UNION, subquery", "Materialized view: fast but requires refresh strategy", "REFRESH MATERIALIZED VIEW [CONCURRENTLY]"] },
      { heading: "Materialized Views — Use Cases & Trade-offs", body: "Materialized views excel for expensive aggregations queried frequently — dashboards, reports, analytics. They introduce staleness: data is only as fresh as the last refresh. Incremental refresh (only recompute changed data) is supported by some engines (dbt, Snowflake). In PostgreSQL, CONCURRENTLY refresh avoids lock but needs a unique index.", points: ["Best for: pre-aggregated metrics, slow joining queries", "Staleness risk: refresh on schedule or on source write", "CONCURRENTLY: zero downtime refresh, unique index required", "Alternative: use event-driven refresh via trigger"] }
    ],
    flashcards: [
      { q: "View vs materialized view in one line?", a: "View: virtual query — always fresh, no storage. Materialized view: stored result — fast reads, potentially stale." },
      { q: "When is a view NOT updatable?", a: "When it contains DISTINCT, aggregate functions (GROUP BY), UNION, or joins without a unique key mapping to one base table." },
      { q: "Why use a materialized view over a regular view?", a: "When the underlying query is expensive and freshness can be sacrificed — avoids recomputing on every access." },
      { q: "What does CONCURRENTLY do in REFRESH MATERIALIZED VIEW?", a: "Performs the refresh without an exclusive lock, so reads continue during refresh. Requires a unique index." },
      { q: "How do you keep a materialized view fresh automatically?", a: "Use a trigger on source tables, a scheduled cron job, or a pipeline tool like dbt that runs incremental refreshes." },
      { q: "Can you index a materialized view?", a: "Yes — and you should. Indexes on materialized views make analytical queries much faster." }
    ],
    mcqs: [
      { q: "Which SQL makes a materialized view fresh?", choices: ["UPDATE VIEW","REBUILD VIEW","REFRESH MATERIALIZED VIEW","SYNC VIEW"], answer: 2 },
      { q: "A view with GROUP BY is:", choices: ["Updatable","Read-only","Deletable only","Index-only"], answer: 1 },
    ],
    videoId: "Sggdhot1KJM"
  },
  repl: {
    summary: [
      { heading: "Replication — Concepts & Modes", body: "Replication copies data from a primary (leader) to one or more replicas (followers). Benefits: read scaling, failover. Synchronous replication: primary waits for replica ACK before committing — strong consistency, higher latency. Asynchronous replication: primary commits immediately — lower latency, risk of data loss on primary failure.", points: ["Synchronous: zero data loss, higher write latency", "Asynchronous: fast writes, replication lag", "Semi-synchronous: wait for at least one replica ACK", "Replication lag: replica is N bytes/seconds behind primary"] },
      { heading: "Replication — Multi-Master & Failover", body: "Multi-master allows writes on multiple nodes — resolves conflicts with last-write-wins or application logic. Leader election (Raft, Paxos) selects a new primary on failure. Read replicas route SELECT queries to followers; writes always go to the primary. Replication lag can cause stale reads — mitigated by read-your-writes consistency.", points: ["Single-leader: one writer, many readers", "Multi-leader: writes anywhere, conflict resolution needed", "Leaderless: quorum reads/writes (Dynamo-style)", "Failover: elect new primary when current fails"] }
    ],
    flashcards: [
      { q: "Synchronous vs asynchronous replication?", a: "Synchronous: primary waits for replica confirmation — zero data loss but higher latency. Async: commits immediately — faster but replica may lag." },
      { q: "What is replication lag?", a: "The delay between a write on the primary and when that write appears on replicas." },
      { q: "What is a read replica used for?", a: "Offloading SELECT queries from the primary — improves read throughput without affecting write performance." },
      { q: "What is leader election?", a: "When the primary fails, a consensus protocol (Raft/Paxos) selects a new primary from the remaining replicas." },
      { q: "What does 'read-your-writes consistency' guarantee?", a: "After writing, you always read your own write — even if replicas are slightly behind. Achieved by routing writes and reads to same node." },
      { q: "What is a leaderless replication system?", a: "All nodes accept writes (e.g. DynamoDB, Cassandra). Quorum (W + R > N) ensures consistency without a designated primary." }
    ],
    mcqs: [
      { q: "Which replication mode guarantees zero data loss?", choices: ["Asynchronous","Synchronous","Semi-synchronous","Leaderless"], answer: 1 },
      { q: "Read replicas primarily help with:", choices: ["Write throughput","Read throughput","Reducing storage","Eliminating lag"], answer: 1 },
    ],
    videoId: "bI8IQ5CTW8w"
  },

  
  // ── OS ────────────────────────────────────────────────────────────────────
  proc: {
    summary: [
      { heading: "Processes vs Threads", body: "A process is an independent program in execution with its own memory space (code, data, heap, stack). A thread is a lightweight execution unit within a process — shares heap and code, has its own stack and registers. Context switching between threads is cheaper than between processes. Threads communicate via shared memory; processes via IPC.", points: ["Process: isolated memory, own file descriptors", "Thread: shared heap, own stack/registers", "Context switch cost: thread < process", "Thread safety needed when sharing mutable state"] },
      { heading: "Process States & PCB", body: "A process moves through states: New → Ready → Running → Waiting → Terminated. The OS tracks each process in a Process Control Block (PCB): PID, state, PC, registers, memory maps, open files. A thread has a Thread Control Block (TCB). The scheduler picks the next Ready process to run.", points: ["New: being created", "Ready: in run queue, waiting for CPU", "Running: currently on CPU", "Waiting/Blocked: waiting for I/O or event"] }
    ],
    flashcards: [
      { q: "Key difference between process and thread?", a: "Processes have isolated memory spaces. Threads share the process heap/code but have separate stacks — cheaper to create and switch." },
      { q: "What is a PCB?", a: "Process Control Block — kernel data structure storing process state, PID, registers, memory maps, and open file descriptors." },
      { q: "Why are threads cheaper to context-switch?", a: "No TLB flush or address space change — they share the same page tables as the parent process." },
      { q: "What does fork() do?", a: "Creates a copy of the current process (copy-on-write). Returns 0 to child, child's PID to parent." },
      { q: "What is a zombie process?", a: "A terminated process whose exit status hasn't been collected by its parent (wait() not called). Occupies a PCB slot." },
      { q: "User-level threads vs kernel threads?", a: "User-level: scheduled by user-space library, fast but can't run in parallel on multi-core. Kernel: OS-managed, true parallelism." }
    ],
    mcqs: [
      { q: "Which resource is NOT shared between threads of the same process?", choices: ["Heap","Code segment","Stack","Global variables"], answer: 2 },
      { q: "A zombie process has:", choices: ["No PCB","Finished execution but PCB not yet reaped","Active memory allocation","Blocked on I/O"], answer: 1 },
    ],
    videoId: "OrM7nZcxXZU"
  },
  sched: {
    summary: [
      { heading: "CPU Scheduling — Algorithms", body: "The scheduler decides which ready process gets the CPU. FCFS (First-Come-First-Served): simple, convoy effect. SJF (Shortest Job First): optimal average wait, needs future knowledge. Round Robin: time slices ensure fairness, higher context-switch overhead. Priority Scheduling: risk of starvation — solved with aging. MLFQ (Multi-Level Feedback Queue) adapts priority based on behaviour.", points: ["FCFS: simple, non-preemptive, convoy problem", "SJF: min avg wait, preemptive = SRTF", "Round Robin: fair, quantum size is key trade-off", "MLFQ: demotes CPU-bound, promotes I/O-bound"] },
      { heading: "Scheduling Metrics", body: "Key metrics: CPU utilisation (keep CPU busy), throughput (processes completed/time), turnaround time (submit to finish), waiting time (time in ready queue), response time (submit to first response). Interactive systems prioritise response time; batch systems prioritise throughput. The OS also handles real-time scheduling (EDF, Rate-Monotonic).", points: ["Turnaround = completion − arrival", "Waiting = turnaround − burst", "Response time: matters for interactive processes", "Starvation: low-priority never runs — fix with aging"] }
    ],
    flashcards: [
      { q: "What is the convoy effect in FCFS?", a: "A long CPU-bound process holds the CPU while many short I/O-bound processes queue up, reducing throughput." },
      { q: "Why is SJF optimal for average wait time?", a: "Scheduling the shortest job first minimises the accumulated waiting time — provably optimal for batch average wait." },
      { q: "What is the trade-off with a small Round Robin quantum?", a: "More responsive but higher context-switch overhead. Very small quantum → CPU spends more time switching than running." },
      { q: "How does MLFQ work?", a: "New processes start at high priority. If they use their full time slice, they drop to a lower queue. I/O-bound stay high." },
      { q: "What is starvation and how is it fixed?", a: "Low-priority processes never get CPU time. Fixed with aging — gradually raise priority of waiting processes." },
      { q: "Preemptive vs non-preemptive scheduling?", a: "Preemptive: OS can interrupt a running process. Non-preemptive: process runs until it voluntarily yields or blocks." }
    ],
    mcqs: [
      { q: "Which algorithm is provably optimal for minimising average waiting time?", choices: ["FCFS","Round Robin","SJF","Priority"], answer: 2 },
      { q: "Starvation is best addressed by:", choices: ["Increasing quantum","Aging","Preemption","Reducing priority"], answer: 1 },
    ],
    videoId: "EWkQl0n0w5M"
  },
  syscall: {
    summary: [
      { heading: "System Calls & Kernel Mode", body: "A system call is the interface between user-space programs and the OS kernel. The CPU has privilege levels: user mode (ring 3) and kernel mode (ring 0). System calls trigger a mode switch via software interrupt (INT 0x80 / syscall instruction). Common categories: process control (fork, exec, exit), file I/O (open, read, write, close), memory (mmap, brk).", points: ["User → kernel transition via syscall / INT", "Kernel mode: full hardware access", "syscall overhead: ~100ns per call", "Batching I/O (large reads) reduces syscall count"] },
      { heading: "System Call Examples", body: "File I/O: open() returns a file descriptor; read()/write() operate on it; close() releases it. Process: fork() clones process, exec() replaces image, wait() reaps children, exit() terminates. Memory: mmap() maps files or anonymous pages, brk()/sbrk() grow the heap. Network: socket(), bind(), listen(), accept(), connect().", points: ["fd = open(path, flags) → int file descriptor", "fork() + exec() pattern for launching programs", "mmap() for memory-mapped files and anonymous memory", "socket() → bind() → listen() → accept() for servers"] }
    ],
    flashcards: [
      { q: "Why do system calls involve a mode switch?", a: "User code runs in ring 3 (restricted). Kernel operations need ring 0. The CPU switches privilege level on syscall entry and exit." },
      { q: "What does fork() return to parent vs child?", a: "Parent receives the child's PID (>0). Child receives 0. On failure, parent receives -1." },
      { q: "What does exec() do?", a: "Replaces the current process image with a new program — PID stays the same, memory is replaced." },
      { q: "What is a file descriptor?", a: "An integer handle to an open file/socket/pipe. 0=stdin, 1=stdout, 2=stderr; new fds start at 3." },
      { q: "What does mmap() do?", a: "Maps a file or anonymous memory into the process address space. Used for memory-mapped I/O and shared memory." },
      { q: "How does strace help debugging?", a: "It traces all system calls made by a process — shows filenames, return codes, and timing. Useful for diagnosing hanging or failing programs." }
    ],
    mcqs: [
      { q: "Which syscall replaces a process image with a new program?", choices: ["fork()","exit()","exec()","spawn()"], answer: 2 },
      { q: "File descriptor 1 refers to:", choices: ["stdin","stdout","stderr","first opened file"], answer: 1 },
    ],
    videoId: "lhToWeuWWfw"
  },
  sync: {
    summary: [
      { heading: "Synchronization — Race Conditions & Mutex", body: "A race condition occurs when two threads access shared mutable data concurrently and the outcome depends on scheduling order. A critical section is code that must run atomically. A mutex (mutual exclusion lock) allows only one thread in the critical section at a time. lock() blocks if held; unlock() releases. Proper acquire/release ordering prevents races.", points: ["Race condition: result depends on timing", "Critical section: must be atomic", "Mutex: binary lock — one holder at a time", "Deadlock risk if locks acquired in inconsistent order"] },
      { heading: "Synchronization — Semaphores & Monitors", body: "A semaphore is an integer counter with atomic wait() (P) and signal() (V) operations. Binary semaphore ≈ mutex. Counting semaphore controls access to N resources (e.g. connection pool). Monitors are higher-level: a class with built-in mutual exclusion + condition variables. Condition variables (wait/signal) let threads sleep inside the critical section until a condition holds.", points: ["wait(S): if S>0 decrement; else block", "signal(S): increment S; wake one waiter", "Condition variable: wait releases lock, signal re-acquires", "Producer-consumer, readers-writers solved with semaphores"] }
    ],
    flashcards: [
      { q: "What is a race condition?", a: "When the outcome of a computation depends on the interleaving of concurrent operations — non-deterministic, data-corrupting." },
      { q: "What does a mutex guarantee?", a: "Mutual exclusion — only one thread holds the lock and runs the critical section at a time." },
      { q: "Binary semaphore vs mutex?", a: "Both enforce mutual exclusion, but mutex has ownership (only locker can unlock). Semaphore has no ownership concept." },
      { q: "What is a counting semaphore used for?", a: "Limiting access to N identical resources simultaneously — e.g. a connection pool of size 10." },
      { q: "What does a condition variable's wait() do?", a: "Atomically releases the mutex and puts the thread to sleep. Re-acquires the mutex when signalled." },
      { q: "What is a spurious wakeup?", a: "A thread wakes from condition variable wait without being signalled. Always re-check the condition in a while loop." }
    ],
    mcqs: [
      { q: "A counting semaphore initialized to 5 controls:", choices: ["5 threads total","Access to 5 identical resources","5 critical sections","Binary choices"], answer: 1 },
      { q: "Condition variable wait() must be called inside:", choices: ["A for loop","A while loop checking the condition","Any loop","No loop needed"], answer: 1 },
    ],
    videoId: "DvVt11mPuM0"
  },
  dead: {
    summary: [
      { heading: "Deadlocks — Conditions & Detection", body: "A deadlock is a state where a set of processes are each waiting for a resource held by another — no progress is possible. Four necessary conditions (Coffman): Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. Breaking any one prevents deadlock. Detection: resource allocation graph — cycle means deadlock (single instance); Banker's algorithm checks safe state.", points: ["Mutual exclusion: resources non-shareable", "Hold & wait: holds resource while requesting another", "No preemption: resources can't be forcibly taken", "Circular wait: P1→R1→P2→R2→P1"] },
      { heading: "Deadlock Prevention & Recovery", body: "Prevention eliminates one condition: require all resources up-front (breaks Hold & Wait), impose lock ordering (breaks Circular Wait). Avoidance (Banker's algorithm): only grant requests that keep system in safe state. Detection + recovery: periodically check for cycles, then terminate a process or preempt a resource. Ignore (Ostrich algorithm): used by most OSes for rare deadlocks.", points: ["Prevention: strict ordering (lock A before B always)", "Avoidance: Banker's — check safe state before grant", "Detection: wait-for graph cycle check", "Recovery: kill process, rollback transaction, preempt resource"] }
    ],
    flashcards: [
      { q: "What are the four Coffman conditions for deadlock?", a: "Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. All four must hold simultaneously." },
      { q: "How does lock ordering prevent deadlocks?", a: "Always acquire locks in a global consistent order. If every thread locks A before B, a cycle is impossible." },
      { q: "What is the Banker's algorithm?", a: "Before granting a resource, simulate the allocation. If the resulting state is safe (all processes can finish), grant it." },
      { q: "What is a safe state?", a: "There exists a sequence in which all processes can complete using currently available + eventually released resources." },
      { q: "How does the OS detect deadlocks?", a: "Builds a resource allocation graph (or wait-for graph) and checks for cycles. Cycle = deadlock in single-instance systems." },
      { q: "What is the Ostrich algorithm?", a: "Ignore the deadlock problem — used when deadlocks are rare and the cost of prevention/detection exceeds the cost of occasional restart." }
    ],
    mcqs: [
      { q: "Which condition can be broken by requiring all resources be requested upfront?", choices: ["Mutual Exclusion","Hold and Wait","No Preemption","Circular Wait"], answer: 1 },
      { q: "A cycle in a resource allocation graph (single instance) means:", choices: ["Starvation","Deadlock","Livelock","Race condition"], answer: 1 },
    ],
    videoId: "ONEIScuT5RM"
  },
  mem: {
    summary: [
      { heading: "Memory Management — Heap & Stack", body: "Each process has a virtual address space: text (code), data (globals), heap (dynamic allocation), stack (function frames). Stack grows downward; heap grows upward. malloc()/free() manage heap; the OS provides pages via brk()/mmap(). Stack overflows crash the process; heap fragmentation (external/internal) wastes memory.", points: ["Stack: LIFO, automatic, fixed size (typically 8 MB)", "Heap: dynamic, manual (C) or GC managed", "External fragmentation: free gaps too small to use", "Internal fragmentation: allocated block larger than needed"] },
      { heading: "Memory Management — Allocators", body: "A memory allocator (glibc malloc, jemalloc, tcmalloc) manages the heap. Free lists track available blocks. Best-fit reduces fragmentation but is slow; first-fit is fast; buddy allocator splits/coalesces powers-of-two blocks. Garbage collectors (JVM, Go, Python) track reachability and automatically free unreachable objects.", points: ["Free list: singly-linked list of free blocks", "Best-fit: least wasted space, O(n) scan", "Buddy system: fast coalescing, internal fragmentation", "GC: mark-and-sweep, reference counting, generational"] }
    ],
    flashcards: [
      { q: "Stack vs heap memory?", a: "Stack: automatic, LIFO, fast, fixed size — for local vars and call frames. Heap: dynamic, manual or GC, flexible size — for objects allocated at runtime." },
      { q: "What is external fragmentation?", a: "Free memory is split into many small non-contiguous gaps — total free space is enough but no single block is large enough." },
      { q: "What is internal fragmentation?", a: "An allocated block is larger than requested — the excess bytes inside the block are wasted." },
      { q: "What does malloc() do under the hood?", a: "Requests memory from the OS via brk()/mmap(), manages a free list, and returns a pointer to a suitable block." },
      { q: "How does mark-and-sweep GC work?", a: "Mark phase: traverse all live references from roots. Sweep phase: free all unmarked (unreachable) objects." },
      { q: "What is a memory leak?", a: "Memory allocated on the heap is no longer referenced but never freed — causes gradual OOM. Common in C/C++." }
    ],
    mcqs: [
      { q: "Where are local variables stored?", choices: ["Heap","Stack","Data segment","Text segment"], answer: 1 },
      { q: "External fragmentation is caused by:", choices: ["Oversized allocations","Many small free gaps between live objects","GC pauses","Stack overflow"], answer: 1 },
    ],
    videoId: "qdkxb9B6gJs"
  },
  vmem: {
    summary: [
      { heading: "Virtual Memory — Concepts", body: "Virtual memory gives each process a private, large address space independent of physical RAM. The MMU (Memory Management Unit) translates virtual addresses to physical via page tables. Pages not in RAM are stored on disk (swap). This allows running programs larger than RAM and provides isolation between processes.", points: ["Virtual address space: process's view of memory", "Page table: maps virtual pages → physical frames", "TLB: hardware cache of recent translations (O(1) lookup)", "Page fault: virtual page not in RAM → load from disk"] },
      { heading: "Virtual Memory — Demand Paging & Thrashing", body: "Demand paging loads pages only when accessed. A page fault triggers the OS to load the page from disk. Page replacement algorithms decide which page to evict: LRU (least recently used), LFU (least frequently used), CLOCK (approximation of LRU). Thrashing: process spends more time swapping than executing — too few frames for working set.", points: ["Demand paging: lazy loading, reduces startup time", "LRU: evict least recently used page — near-optimal", "CLOCK algorithm: efficient LRU approximation", "Thrashing fix: reduce multiprogramming, increase RAM"] }
    ],
    flashcards: [
      { q: "What is the role of the MMU?", a: "Translates virtual addresses to physical addresses using page tables on every memory access." },
      { q: "What is a TLB?", a: "Translation Lookaside Buffer — hardware cache of recent virtual-to-physical mappings. Hit: O(1). Miss: walk page table." },
      { q: "What happens on a page fault?", a: "The MMU can't find the page in RAM. The OS handles it: loads the page from swap/disk into a free frame and resumes the process." },
      { q: "What is LRU page replacement?", a: "Evict the page that was least recently used. Near-optimal in practice but expensive to implement exactly — CLOCK approximates it." },
      { q: "What is thrashing?", a: "The system spends most of its time swapping pages in/out rather than executing — occurs when working set exceeds available frames." },
      { q: "How does virtual memory provide process isolation?", a: "Each process has its own page table and virtual address space. A process can't access another's physical frames without OS mediation." }
    ],
    mcqs: [
      { q: "A TLB miss results in:", choices: ["Process termination","Page fault","Page table walk","Cache eviction"], answer: 2 },
      { q: "Thrashing is best solved by:", choices: ["Larger page size","Reducing the number of concurrent processes","Faster disk","More CPU cores"], answer: 1 },
    ],
    videoId: "59pkFkCkxLs"
  },
  page: {
    summary: [
      { heading: "Paging & Segmentation", body: "Paging divides memory into fixed-size pages (typically 4 KB). No external fragmentation (all pages same size). Internal fragmentation possible (last page partly used). Multi-level page tables reduce memory for sparse address spaces. Segmentation divides into variable-size logical segments (code, stack, heap) — natural but causes external fragmentation.", points: ["Paging: fixed size, no external frag, page tables", "Segmentation: variable size, logical units, external frag", "Modern: segmented paging (x86) = both combined", "Huge pages (2 MB) reduce TLB pressure for large apps"] },
      { heading: "Page Table Structures", body: "A flat page table for 64-bit addresses is impractical — too large. Multi-level tables (2, 3, 4 levels) only allocate entries for used regions. An inverted page table has one entry per physical frame — small but slow to look up. The OS uses copy-on-write (CoW) — fork() shares pages until one process writes, then copies only the modified page.", points: ["Multi-level: 4-level on x86-64 (PML4→PDP→PD→PT)", "Inverted: 1 entry per physical frame, searched by PID+VA", "CoW: fork shares pages; write triggers copy of that page only", "mmap shared: two processes share same physical frames"] }
    ],
    flashcards: [
      { q: "Why does paging eliminate external fragmentation?", a: "All pages and frames are the same size — any free frame can hold any page. No 'holes' that are too small." },
      { q: "What causes internal fragmentation in paging?", a: "The last page of a process is rarely exactly full — unused bytes within the final page are wasted." },
      { q: "Why use multi-level page tables?", a: "A flat table for a 64-bit address space is enormous. Multi-level tables only allocate entries for regions actually used." },
      { q: "What is copy-on-write after fork()?", a: "Parent and child share the same physical pages. When either writes, the OS copies only that one page for the writer." },
      { q: "What are huge pages (2 MB) good for?", a: "Reducing TLB pressure for memory-intensive apps (databases, JVMs) — fewer TLB entries needed to cover the same memory." },
      { q: "Paging vs segmentation in one line?", a: "Paging: fixed-size physical units, no external fragmentation. Segmentation: variable logical units, natural but fragments." }
    ],
    mcqs: [
      { q: "Copy-on-write after fork() — when does a copy occur?", choices: ["Immediately on fork","On first read by child","On first write by either process","On exec()"], answer: 2 },
      { q: "Multi-level page tables save memory because:", choices: ["Pages are larger","Unused address regions need no page table entries","TLB covers more","Segmentation is disabled"], answer: 1 },
    ],
    videoId: "59pkFkCkxLs"
  },
  fs: {
    summary: [
      { heading: "File Systems — Inodes & VFS", body: "A file system organises data on storage into files and directories. An inode (index node) stores metadata: owner, permissions, timestamps, size, and pointers to data blocks — NOT the filename. A directory maps names to inode numbers. The VFS (Virtual File System) layer abstracts different FS implementations (ext4, NTFS, APFS) behind a uniform API.", points: ["Inode: metadata + block pointers, not filename", "Directory: name → inode number mapping", "Hard link: two names → same inode", "Soft/symbolic link: name → path string"] },
      { heading: "File Systems — Journaling & Performance", body: "Journaling records changes to a log before applying them — ensures consistency after crash (ext4, NTFS). Without journaling, fsck must scan the entire disk. Log-structured file systems write sequentially for throughput (LFS, F2FS). SSDs benefit from large sequential writes; random writes cause write amplification. Page cache (buffer cache) speeds reads by caching blocks in RAM.", points: ["Journal: write-ahead log for metadata/data", "Page cache: hot blocks stay in RAM, write-back", "SSD: no seek time, but block-level erase before write", "Write amplification: small writes cause large erase operations"] }
    ],
    flashcards: [
      { q: "What does an inode store?", a: "File metadata: size, owner, permissions, timestamps, and pointers to data blocks. NOT the filename." },
      { q: "Hard link vs symbolic (soft) link?", a: "Hard link: another directory entry pointing to the same inode. Soft link: a file containing a path string to the target." },
      { q: "What does journaling protect against?", a: "Inconsistent state after a crash — the journal lets the OS replay or undo incomplete operations during recovery." },
      { q: "What is the page cache?", a: "RAM cache of recently read/written disk blocks. Reads hit cache first; dirty pages are written back to disk asynchronously." },
      { q: "What is the VFS layer?", a: "An abstraction layer in the kernel that presents a uniform file operation API regardless of the underlying FS type." },
      { q: "What is write amplification on SSDs?", a: "A small write to an SSD may require erasing an entire block (128KB–256KB) and rewriting all its pages — amplifying I/O." }
    ],
    mcqs: [
      { q: "Deleting the last hard link to a file:", choices: ["Deletes the inode immediately","Decrements link count; inode freed when count reaches 0","Leaves inode intact forever","Requires fsck"], answer: 1 },
      { q: "Journaling primarily protects:", choices: ["Against data corruption from bugs","File system consistency after a crash","Disk from wear","Against unauthorised access"], answer: 1 },
    ],
    videoId: "KN8YgJnShPM"
  },
  ipc: {
    summary: [
      { heading: "IPC — Pipes, Sockets, Shared Memory", body: "Inter-Process Communication (IPC) lets processes exchange data. Pipes: unidirectional byte stream between related processes (fork). Named pipes (FIFOs): between unrelated processes via filesystem path. Unix domain sockets: bidirectional, low-latency, same host. TCP/UDP sockets: across network. Shared memory: fastest IPC — processes map the same physical pages; need explicit synchronisation.", points: ["Pipe: parent↔child, unidirectional, in-kernel buffer", "FIFO: named pipe accessible by any process via path", "Unix socket: bidirectional, same machine, very fast", "Shared memory: zero-copy, but needs mutex/semaphore"] },
      { heading: "IPC — Message Queues & Signals", body: "Message queues store messages in kernel until consumed — decoupled producer/consumer. POSIX MQ or System V MQ. Signals are async notifications sent to a process (SIGTERM, SIGKILL, SIGUSR1). Signal handler must be async-signal-safe. Memory-mapped files (mmap + MAP_SHARED) allow file-backed shared memory across processes.", points: ["Message queue: kernel-buffered, persists until read", "SIGTERM: graceful shutdown request (catchable)", "SIGKILL: immediate termination (uncatchable)", "mmap MAP_SHARED: changes visible to all mapping processes"] }
    ],
    flashcards: [
      { q: "What is a pipe?", a: "A unidirectional kernel buffer connecting stdout of one process to stdin of another. Works between related processes (parent-child)." },
      { q: "Pipe vs named pipe (FIFO)?", a: "Pipe requires a common ancestor (fork). FIFO has a filesystem name — any two processes can open it." },
      { q: "Why is shared memory the fastest IPC?", a: "Zero copies — both processes read/write the same physical memory pages. No kernel involvement after setup." },
      { q: "SIGTERM vs SIGKILL?", a: "SIGTERM: catchable signal requesting graceful shutdown. SIGKILL: uncatchable — OS forcibly terminates immediately." },
      { q: "What synchronisation is needed for shared memory IPC?", a: "A mutex or semaphore to protect concurrent reads/writes — shared memory itself provides no synchronisation." },
      { q: "What is a message queue advantage over a pipe?", a: "Messages are discrete units with types; reader can receive by type. Kernel buffers messages — producer and consumer don't need to run simultaneously." }
    ],
    mcqs: [
      { q: "Which IPC mechanism requires explicit synchronisation by the programmer?", choices: ["Pipes","Message queues","Shared memory","Signals"], answer: 2 },
      { q: "SIGKILL:", choices: ["Can be caught and handled","Terminates after cleanup","Cannot be caught or ignored","Pauses the process"], answer: 1 },
    ],
    videoId: "dJuYKfR8vec"
  },
  io: {
    summary: [
      { heading: "I/O Management — Buffering & DMA", body: "The OS manages I/O between CPU and devices via device drivers. Buffered I/O accumulates data in kernel buffers — reduces syscall count. Direct I/O bypasses page cache for databases that do their own caching. DMA (Direct Memory Access) lets devices transfer data to RAM without CPU involvement — CPU sets up the transfer and is interrupted on completion.", points: ["Buffered I/O: kernel buffers, fewer syscalls, write-back", "Direct I/O: O_DIRECT flag, bypasses page cache", "DMA: device ↔ RAM without CPU cycles", "Interrupt-driven I/O: CPU free to run other tasks"] },
      { heading: "I/O — Blocking vs Non-blocking & Async", body: "Blocking I/O: process sleeps until data is ready. Non-blocking (O_NONBLOCK): returns EAGAIN immediately if not ready — caller must poll. I/O multiplexing (select/poll/epoll): monitor many fds, block until one is ready. Async I/O (io_uring, AIO): kernel performs I/O and notifies when done — maximises CPU utilisation.", points: ["Blocking: simple but ties up thread", "Non-blocking + poll: C10K pattern", "epoll: O(1) per event, scales to millions of fds", "io_uring: zero-copy, minimal syscalls, modern Linux"] }
    ],
    flashcards: [
      { q: "What is DMA?", a: "Direct Memory Access — a hardware feature allowing devices to transfer data directly to/from RAM without CPU involvement." },
      { q: "What does O_DIRECT do?", a: "Opens a file bypassing the OS page cache. Useful for databases that manage their own read/write cache." },
      { q: "epoll vs select/poll?", a: "select/poll scan all fds on each call — O(n). epoll registers interest once and only returns ready fds — O(1) per event." },
      { q: "What is io_uring?", a: "A modern Linux async I/O interface using shared ring buffers — minimal syscall overhead, zero-copy, batched submissions." },
      { q: "What does blocking I/O do to a thread?", a: "The thread is put to sleep in the kernel until the I/O completes. CPU is freed to run other threads/processes." },
      { q: "What problem does non-blocking I/O solve?", a: "A single thread can handle many connections without blocking on slow I/O — basis of event-driven servers (Node.js, nginx)." }
    ],
    mcqs: [
      { q: "epoll scales better than select because:", choices: ["It uses more threads","It returns only ready file descriptors, not all","It uses DMA","It bypasses the kernel"], answer: 1 },
      { q: "DMA frees the CPU from:", choices: ["Executing instructions","Managing page tables","Data transfer between device and RAM","Handling interrupts"], answer: 2 },
    ],
    videoId: "xHu7qI1e2mU"
  },

  
  // ── Networking ───────────────────────────────────────────────────────────
  osi: {
    summary: [
      { heading: "OSI Model — 7 Layers", body: "The OSI model divides networking into 7 layers: Physical (bits on wire), Data Link (frames, MAC), Network (IP routing), Transport (TCP/UDP, ports), Session (connection mgmt), Presentation (encoding/encryption), Application (HTTP, DNS, FTP). In practice TCP/IP collapses this to 4 layers: Link, Internet, Transport, Application.", points: ["Layer 1 Physical: cables, signals, NICs", "Layer 2 Data Link: Ethernet, MAC addresses, switches", "Layer 3 Network: IP, routing, routers", "Layer 4 Transport: TCP/UDP, ports, reliability"] },
      { heading: "OSI Model — Upper Layers", body: "Layer 5 Session: manages dialogue (RPC, NetBIOS). Layer 6 Presentation: serialisation, encryption (SSL/TLS lives here in strict OSI). Layer 7 Application: user-facing protocols — HTTP, DNS, SMTP, FTP. Encapsulation: each layer adds a header; de-capsulation strips them on receipt. Real-world TCP/IP doesn't map cleanly to OSI 5–7.", points: ["Layer 5 Session: connection setup/teardown", "Layer 6 Presentation: ASCII, JSON, encryption", "Layer 7 Application: HTTP/HTTPS, DNS, SMTP", "PDU names: bit→frame→packet→segment→data"] }
    ],
    flashcards: [
      { q: "Which OSI layer handles IP addressing and routing?", a: "Layer 3 — Network. IP packets are routed here; routers operate at this layer." },
      { q: "Which layer do switches operate at?", a: "Layer 2 (Data Link). They forward frames based on MAC addresses within a network segment." },
      { q: "Where does TCP/UDP operate?", a: "Layer 4 — Transport. Provides end-to-end communication, port numbers, and reliability (TCP) or speed (UDP)." },
      { q: "What is encapsulation?", a: "Each layer wraps the payload with its own header (and trailer) as data travels down the stack." },
      { q: "Layer 7 protocols?", a: "HTTP, HTTPS, DNS, FTP, SMTP, SSH, WebSocket — user-facing application protocols." },
      { q: "TCP/IP model layers?", a: "Link (1+2), Internet (3), Transport (4), Application (5+6+7 combined)." }
    ],
    mcqs: [
      { q: "Which layer adds MAC address headers?", choices: ["Physical","Data Link","Network","Transport"], answer: 1 },
      { q: "A router operates primarily at OSI layer:", choices: ["2","3","4","7"], answer: 1 },
    ],
    videoId: "Ilk7UXzV_Qc"
  },
  tcpip: {
    summary: [
      { heading: "TCP/IP Stack — IP Addressing", body: "IPv4 uses 32-bit addresses (4 octets). Subnetting divides address space — CIDR notation (192.168.1.0/24). Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. NAT maps private IPs to a public IP. IPv6 uses 128-bit addresses. ARP resolves IP → MAC within a subnet. DHCP dynamically assigns IPs.", points: ["Subnet mask: /24 = 255 hosts, /16 = 65535 hosts", "NAT: many private IPs share one public IP", "ARP: IP → MAC (layer 2 resolution)", "DHCP: auto IP assignment on network join"] },
      { heading: "TCP/IP — Routing & Forwarding", body: "A router maintains a routing table mapping destination prefixes to next-hop addresses. Longest prefix match selects the most specific route. BGP (Border Gateway Protocol) handles routing between autonomous systems (internet). OSPF and RIP handle intra-AS routing. TTL decrements at each hop — reaches 0 → packet dropped (prevents loops).", points: ["Longest prefix match: most specific subnet wins", "Default route (0.0.0.0/0): last resort gateway", "TTL: decremented each hop, drop at 0", "BGP: inter-AS routing (the internet's routing protocol)"] }
    ],
    flashcards: [
      { q: "What does /24 mean in CIDR notation?", a: "The first 24 bits are the network portion — 8 bits for hosts, giving 254 usable addresses (256 minus broadcast and network)." },
      { q: "What does ARP do?", a: "Resolves an IPv4 address to a MAC address within the same subnet by broadcasting 'Who has IP X?'" },
      { q: "What is NAT?", a: "Network Address Translation — maps multiple private IPs to one public IP. The router rewrites source addresses on outbound packets." },
      { q: "What is longest prefix match?", a: "When multiple routing table entries match a destination, the one with the most specific (longest) subnet prefix wins." },
      { q: "What is TTL?", a: "Time To Live — decremented by each router. Packet dropped when TTL=0, preventing infinite routing loops." },
      { q: "BGP vs OSPF?", a: "BGP: inter-AS routing on the internet (path-vector). OSPF: intra-AS link-state routing within one organisation." }
    ],
    mcqs: [
      { q: "Which protocol resolves IP to MAC?", choices: ["DNS","DHCP","ARP","NAT"], answer: 2 },
      { q: "CIDR /16 provides how many host addresses?", choices: ["254","1022","65534","16 million"], answer: 2 },
    ],
    videoId: "OqsXzkXfwRw"
  },
  tcp: {
    summary: [
      { heading: "TCP vs UDP", body: "TCP (Transmission Control Protocol) is connection-oriented, reliable, ordered, and flow/congestion-controlled. Three-way handshake (SYN, SYN-ACK, ACK) establishes a connection. Four-way teardown (FIN, ACK, FIN, ACK) closes it. UDP is connectionless, unreliable, unordered — no handshake, minimal overhead. Use TCP for HTTP, SSH, databases; UDP for DNS, streaming, gaming, VoIP.", points: ["TCP: reliable, ordered, congestion control", "UDP: fast, no guarantee, low overhead", "TCP handshake: SYN → SYN-ACK → ACK", "UDP header: 8 bytes vs TCP: 20 bytes minimum"] },
      { heading: "TCP — Flow & Congestion Control", body: "Flow control (receiver window): the receiver advertises how much buffer it has — sender limits to that. Congestion control (network): slow start, AIMD (additive increase, multiplicative decrease). Nagle's algorithm batches small writes to reduce packet count. TCP fast retransmit: 3 duplicate ACKs → retransmit without waiting for timeout.", points: ["Sliding window: sender tracks unacked bytes", "Slow start: double cwnd each RTT until threshold", "AIMD: +1 MSS per RTT on success, halve on loss", "TCP head-of-line blocking: later data waits for lost packet"] }
    ],
    flashcards: [
      { q: "TCP three-way handshake steps?", a: "Client sends SYN → Server replies SYN-ACK → Client sends ACK. Connection is now established." },
      { q: "When would you choose UDP over TCP?", a: "When low latency or broadcast matters more than reliability: DNS, video streaming, online gaming, VoIP, QUIC." },
      { q: "What is TCP slow start?", a: "Congestion window starts at 1 MSS and doubles each RTT until the ssthresh — probes for available bandwidth safely." },
      { q: "What is TCP head-of-line blocking?", a: "If a packet is lost, all subsequent data waits until the lost packet is retransmitted and acknowledged." },
      { q: "What is the TCP receive window?", a: "Flow control mechanism — the receiver tells the sender how many bytes it can buffer. Sender won't exceed this." },
      { q: "UDP header size vs TCP?", a: "UDP: 8 bytes (src port, dst port, length, checksum). TCP: 20 bytes minimum. UDP has significantly less overhead." }
    ],
    mcqs: [
      { q: "TCP ensures reliability via:", choices: ["Checksums only","ACKs, sequence numbers, retransmission","UDP fallback","Connection pooling"], answer: 1 },
      { q: "Which protocol is preferred for DNS queries?", choices: ["TCP","UDP","QUIC","ICMP"], answer: 1 },
    ],
    videoId: "uwoD5YsGACg"
  },
  http: {
    summary: [
      { heading: "HTTP & HTTPS — Fundamentals", body: "HTTP is a stateless request-response protocol. Methods: GET (retrieve), POST (create/submit), PUT (replace), PATCH (partial update), DELETE (remove). Status codes: 2xx success, 3xx redirect, 4xx client error, 5xx server error. Headers carry metadata: Content-Type, Authorization, Cache-Control, Accept. HTTP/1.1 keeps connections alive; HTTP/2 multiplexes streams.", points: ["GET: idempotent, safe, cacheable", "POST: not idempotent, may have side effects", "PUT: idempotent full replacement", "PATCH: partial update, usually non-idempotent"] },
      { heading: "HTTP/2, HTTP/3 & HTTPS", body: "HTTP/2: multiplexed streams over one TCP connection — no head-of-line blocking at HTTP layer, header compression (HPACK), server push. HTTP/3 uses QUIC over UDP — eliminates TCP head-of-line blocking entirely. HTTPS = HTTP over TLS — TLS handshake negotiates cipher suite and exchanges certificates. HSTS forces HTTPS on future requests.", points: ["HTTP/2: multiplexing, HPACK, one TCP conn", "HTTP/3 / QUIC: UDP-based, faster handshake, 0-RTT", "TLS: certificate exchange + symmetric key negotiation", "HSTS: browser remembers HTTPS-only for a domain"] }
    ],
    flashcards: [
      { q: "What is idempotency in HTTP?", a: "An operation is idempotent if repeating it N times produces the same result as once. GET, PUT, DELETE are idempotent. POST is not." },
      { q: "HTTP 401 vs 403?", a: "401 Unauthorized: not authenticated (login required). 403 Forbidden: authenticated but not permitted." },
      { q: "What does HTTP/2 multiplexing solve?", a: "HTTP/1.1 head-of-line blocking — only one request per connection at a time. HTTP/2 sends multiple streams concurrently." },
      { q: "What is HSTS?", a: "HTTP Strict Transport Security — server instructs browser to use HTTPS for this domain for a set duration. Prevents downgrade attacks." },
      { q: "Difference between PUT and PATCH?", a: "PUT replaces the entire resource. PATCH applies a partial update — more efficient for large resources." },
      { q: "What is HTTP/3 built on?", a: "QUIC protocol over UDP — provides reliability and multiplexing at the QUIC layer, eliminating TCP's head-of-line blocking." }
    ],
    mcqs: [
      { q: "Which HTTP method is NOT idempotent?", choices: ["GET","PUT","DELETE","POST"], answer: 3 },
      { q: "HTTP 503 means:", choices: ["Not found","Gateway timeout","Service unavailable","Forbidden"], answer: 2 },
    ],
    videoId: "iYM2zFP3Zn0"
  },
  dns: {
    summary: [
      { heading: "DNS — Domain Name System", body: "DNS translates domain names to IP addresses. Hierarchy: root (.) → TLD (.com, .io) → authoritative nameserver → record. Types: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), TXT (verification), NS (nameserver), SOA. TTL controls cache duration. Resolution: recursive resolver queries root → TLD → authoritative — result cached by TTL.", points: ["A record: domain → IPv4 address", "CNAME: alias to another hostname", "MX: mail server for domain", "TTL: seconds to cache the response"] },
      { heading: "DNS — Resolution Flow & Security", body: "Recursive resolution: client asks resolver → resolver queries the hierarchy. Iterative: resolver gives referral, client continues. DNS caching at resolver, OS, and browser reduces latency. DNSSEC signs records cryptographically to prevent spoofing. DNS over HTTPS (DoH) and DNS over TLS (DoT) encrypt queries to prevent surveillance/tampering.", points: ["Resolver → root → TLD → authoritative chain", "TTL 0: bypass cache (force fresh lookup)", "DNSSEC: RRSIG signatures on DNS records", "DoH/DoT: encrypted DNS queries"] }
    ],
    flashcards: [
      { q: "What does an A record contain?", a: "A mapping from a hostname to an IPv4 address." },
      { q: "CNAME vs A record?", a: "A record: hostname → IP. CNAME: hostname → another hostname. CNAMEs add an extra lookup; can't be used for bare domain apex." },
      { q: "What is a DNS TTL?", a: "Time To Live — how long (seconds) a resolver may cache the DNS response before querying again." },
      { q: "What is DNS poisoning?", a: "An attacker injects forged DNS responses to redirect users to malicious servers. DNSSEC mitigates this." },
      { q: "What happens when DNS TTL expires?", a: "The cached record is discarded; the resolver makes a fresh query to the authoritative nameserver." },
      { q: "What is the role of the DNS resolver?", a: "A recursive server (usually ISP or 8.8.8.8) that handles the full lookup chain on behalf of the client and caches results." }
    ],
    mcqs: [
      { q: "Which DNS record type is used for email routing?", choices: ["A","CNAME","MX","TXT"], answer: 2 },
      { q: "DNS typically uses which transport protocol?", choices: ["TCP","UDP","Both (UDP for queries, TCP for large responses/zone transfers)","QUIC"], answer: 2 },
    ],
    videoId: "27r4Bzuj5NQ"
  },
  tls: {
    summary: [
      { heading: "TLS/SSL — Handshake & Certificates", body: "TLS (Transport Layer Security) encrypts data in transit. TLS 1.3 handshake: ClientHello → ServerHello + Certificate + CertificateVerify + Finished → Client Finished. Certificates are X.509, signed by a Certificate Authority (CA). The handshake negotiates a cipher suite and derives symmetric session keys via ECDHE key exchange.", points: ["TLS 1.3: 1-RTT handshake (vs 2-RTT in 1.2)", "Certificate: public key + identity, CA-signed", "ECDHE: perfect forward secrecy — unique keys per session", "Session ticket / PSK: 0-RTT resumption (replay risk)"] },
      { heading: "TLS — Cipher Suites & Certificate Trust", body: "A cipher suite specifies: key exchange (ECDHE), authentication (RSA/ECDSA), bulk encryption (AES-GCM), and MAC (SHA-256). Chain of trust: leaf cert → intermediate CA → root CA (trusted by OS/browser). Certificate pinning embeds expected cert/public key in the client. OCSP/CRL checks if a certificate is revoked.", points: ["AES-256-GCM: symmetric encryption post-handshake", "SHA-256: integrity/MAC", "Root CA: pre-installed in OS/browser trust stores", "Pinning: reject certs not matching embedded value"] }
    ],
    flashcards: [
      { q: "What does TLS provide?", a: "Confidentiality (encryption), integrity (MAC), and authentication (certificates) for data in transit." },
      { q: "What is perfect forward secrecy?", a: "Each session uses an ephemeral key (ECDHE). Compromising the server's long-term private key doesn't decrypt past sessions." },
      { q: "What is a Certificate Authority?", a: "A trusted third party that signs certificates, binding a public key to an identity. Browsers trust a built-in list of root CAs." },
      { q: "TLS 1.3 vs TLS 1.2 handshake RTTs?", a: "TLS 1.3: 1-RTT (0-RTT for resumption). TLS 1.2: 2-RTT. TLS 1.3 is faster and removes weak cipher suites." },
      { q: "What is certificate pinning?", a: "The client hard-codes the expected certificate or public key. Any other cert is rejected — prevents MITM with a rogue CA." },
      { q: "What does HSTS do?", a: "Tells browsers to only connect via HTTPS for a domain for a specified duration — enforced via Strict-Transport-Security header." }
    ],
    mcqs: [
      { q: "Perfect forward secrecy is provided by:", choices: ["RSA key exchange","ECDHE key exchange","AES-256","SHA-256"], answer: 1 },
      { q: "A TLS certificate is signed by:", choices: ["The website owner","A Certificate Authority","The browser","The DNS resolver"], answer: 1 },
    ],
    videoId: "0TLDTodL7Lc"
  },
  ws: {
    summary: [
      { heading: "WebSockets — Full-Duplex Communication", body: "WebSockets provide a persistent, full-duplex channel over a single TCP connection. Upgrade from HTTP via the Upgrade: websocket header. Once established, either side can push messages at any time — no request-response cycle. Ideal for real-time apps: chat, live feeds, collaborative editing, notifications.", points: ["HTTP Upgrade handshake starts the connection", "Full-duplex: server can push without a request", "Low overhead: 2-byte frame headers vs HTTP headers", "Stays open: no repeated TCP/TLS handshake cost"] },
      { heading: "WebSockets vs SSE vs Long Polling", body: "Server-Sent Events (SSE): server pushes events over a persistent HTTP connection — one-directional (server→client), auto-reconnect, works over HTTP/2. Long polling: client requests, server holds response until data is available, client immediately re-requests. WebSockets: bidirectional, lowest latency. Choose SSE for one-way feeds, WebSocket for bidirectional real-time.", points: ["Long polling: works everywhere, high latency and overhead", "SSE: simple, one-way, auto-reconnect, HTTP/2 compatible", "WebSocket: full-duplex, custom protocol, needs separate infra", "QUIC/HTTP3: WebTransport is the emerging alternative"] }
    ],
    flashcards: [
      { q: "How does a WebSocket connection start?", a: "An HTTP request with 'Upgrade: websocket' and 'Connection: Upgrade' headers. Server responds 101 Switching Protocols." },
      { q: "WebSocket vs HTTP?", a: "HTTP is request-response. WebSocket is a persistent full-duplex TCP connection — server can push data without a client request." },
      { q: "When to use SSE vs WebSocket?", a: "SSE for one-way server push (notifications, live feed). WebSocket for bidirectional real-time (chat, gaming, live collaboration)." },
      { q: "What is the overhead of a WebSocket frame?", a: "As little as 2 bytes (vs hundreds of bytes for HTTP headers) — very efficient for high-frequency small messages." },
      { q: "How does long polling work?", a: "Client makes an HTTP request; server holds it open until data is available, then responds. Client immediately re-requests." },
      { q: "What is a major challenge of WebSocket at scale?", a: "Each connection holds a TCP socket on the server. Millions of connections require efficient event-loop servers (Node.js, Nginx, Go)." }
    ],
    mcqs: [
      { q: "HTTP status code when a WebSocket upgrade succeeds?", choices: ["200 OK","301 Redirect","101 Switching Protocols","426 Upgrade Required"], answer: 2 },
      { q: "SSE differs from WebSocket in that SSE is:", choices: ["Bidirectional","Server-to-client only","Client-to-server only","UDP-based"], answer: 1 },
    ],
    videoId: "2Nt-ZrNP22A"
  },
  lb: {
    summary: [
      { heading: "Load Balancing — Algorithms", body: "A load balancer distributes incoming requests across a pool of servers. Algorithms: Round Robin (equal distribution), Weighted Round Robin (capacity-aware), Least Connections (route to least busy), IP Hash (sticky sessions), Random. Layer 4 LB operates on TCP/UDP; Layer 7 LB (application) can inspect HTTP headers, path, cookies for routing decisions.", points: ["Round Robin: simple, equal distribution", "Least Connections: dynamic, good for variable-length requests", "IP Hash: consistent routing, enables sticky sessions", "L7 LB: path-based routing, content-aware"] },
      { heading: "Load Balancing — Health Checks & HA", body: "Health checks probe backend servers; unhealthy servers are removed from the pool. Active checks send periodic probes; passive checks detect failures from real traffic. Active-active HA: multiple LBs handle traffic. Active-passive: standby takes over on failure. DNS load balancing distributes at DNS level — no single LB bottleneck, but TTL limits failover speed.", points: ["Health check: TCP ping, HTTP /health, or custom", "Active-active: both LBs share load", "Active-passive: standby promotes on failure", "Connection draining: gracefully remove server (finish in-flight)"] }
    ],
    flashcards: [
      { q: "What is the difference between L4 and L7 load balancing?", a: "L4 routes based on IP/port (TCP/UDP). L7 inspects HTTP content — can route by path, header, cookie, or body." },
      { q: "What is a sticky session?", a: "Routing the same client to the same backend on each request, typically via IP hash or a cookie. Needed for stateful sessions." },
      { q: "What is connection draining?", a: "When removing a server, allow in-flight requests to complete before stopping traffic to it — avoids dropping active requests." },
      { q: "Least connections algorithm vs round robin?", a: "Round robin is simple but ignores server load. Least connections routes to the server with fewest active connections — better for variable workloads." },
      { q: "What is a health check?", a: "Periodic probe to a backend server. If it fails N times, the server is removed from the pool until it recovers." },
      { q: "Why use DNS load balancing?", a: "No single LB bottleneck; global distribution is easy. Drawback: TTL limits how quickly you can remove a failed server." }
    ],
    mcqs: [
      { q: "Which algorithm best handles servers with different processing capacities?", choices: ["Round Robin","Weighted Round Robin","IP Hash","Random"], answer: 1 },
      { q: "L7 load balancing can route based on:", choices: ["IP address only","TCP port only","HTTP headers and URL path","Physical server location"], answer: 2 },
    ],
    videoId: "sCR3SAVdyCc"
  },
  cdn: {
    summary: [
      { heading: "CDN & Proxies", body: "A CDN (Content Delivery Network) caches static assets (images, JS, CSS, video) at edge nodes close to users — reduces latency and origin load. Cache-Control and ETag headers control freshness. Edge nodes serve cached responses; on cache miss, they fetch from origin. CDNs also absorb DDoS traffic and terminate TLS near users.", points: ["Edge node: geographically distributed PoP", "Cache hit: served from edge (low latency)", "Cache miss: edge fetches from origin, caches result", "ETag / Cache-Control: cache validation headers"] },
      { heading: "Proxies — Forward vs Reverse", body: "A forward proxy sits between clients and the internet — used for filtering, anonymisation, and caching outbound traffic (corporate proxies). A reverse proxy sits in front of servers — hides origin, handles SSL termination, load balancing, caching (nginx, HAProxy). A service mesh (Envoy) provides reverse proxying as a sidecar for every microservice.", points: ["Forward proxy: client → proxy → internet", "Reverse proxy: internet → proxy → server", "nginx: reverse proxy, TLS termination, static files", "CDN PoPs are globally distributed reverse proxies"] }
    ],
    flashcards: [
      { q: "What is a CDN PoP?", a: "Point of Presence — a CDN edge server in a specific geography. Requests route to the nearest PoP for lowest latency." },
      { q: "Forward proxy vs reverse proxy?", a: "Forward: client-side proxy (anonymise, filter outbound). Reverse: server-side (load balance, cache, TLS terminate inbound)." },
      { q: "What is cache invalidation on a CDN?", a: "Explicitly purging or replacing a cached object before its TTL expires — e.g. after deploying a new JS bundle." },
      { q: "What does ETag do?", a: "A token (hash) representing resource state. Browser sends it in If-None-Match; server returns 304 Not Modified if unchanged." },
      { q: "How does a CDN reduce origin load?", a: "Cache hits are served entirely by the edge — the origin only sees cache miss requests (a fraction of total traffic)." },
      { q: "What is SSL/TLS termination at the CDN?", a: "The CDN terminates the TLS connection from the client and may re-encrypt to the origin — reduces latency and offloads crypto." }
    ],
    mcqs: [
      { q: "A CDN cache miss results in:", choices: ["Error to client","Edge fetching from origin and caching","Client going direct to origin","New DNS lookup"], answer: 1 },
      { q: "nginx is commonly used as a:", choices: ["Forward proxy","Reverse proxy","Database proxy","DNS server"], answer: 1 },
    ],
    videoId: "RI9np1LWzqw"
  },
  rest: {
    summary: [
      { heading: "REST & GraphQL — REST Principles", body: "REST (Representational State Transfer) is an architectural style: stateless, uniform interface, client-server, cacheable. Resources are identified by URLs; operations map to HTTP methods. Constraints: stateless (no server-side session), uniform interface (GET/POST/PUT/DELETE), layered (LB, CDN transparent). Well-designed REST APIs version with /v1/, return JSON, use proper status codes.", points: ["GET /users — list; GET /users/1 — get one", "POST /users — create; PUT /users/1 — replace", "PATCH /users/1 — partial update; DELETE /users/1 — delete", "Stateless: each request has all context; no session"] },
      { heading: "GraphQL — Query Language for APIs", body: "GraphQL lets clients specify exactly what data they need — no over-fetching or under-fetching. Single endpoint (/graphql). Operations: query (read), mutation (write), subscription (real-time). Schema defines types and resolvers. Trade-offs: flexible for clients, harder to cache, N+1 query problem in resolvers, complex introspection.", points: ["Query: { user(id:1) { name email } } — fetch specific fields", "Mutation: create/update/delete with return value", "Subscription: real-time updates via WebSocket", "DataLoader: batch and dedupe resolver DB calls"] }
    ],
    flashcards: [
      { q: "What does 'stateless' mean in REST?", a: "Each HTTP request must contain all information needed to process it — the server stores no session state between requests." },
      { q: "Over-fetching vs under-fetching in REST?", a: "Over-fetching: API returns more fields than needed. Under-fetching: one call isn't enough, multiple calls needed. GraphQL solves both." },
      { q: "REST vs GraphQL in one line?", a: "REST: multiple endpoints, fixed responses, HTTP-native caching. GraphQL: single endpoint, flexible queries, client-specified shape." },
      { q: "What is the N+1 problem in GraphQL?", a: "For a list of N items, each item's field triggers a separate resolver DB call — N+1 total queries. Solved with DataLoader batching." },
      { q: "What HTTP method is idempotent AND safe?", a: "GET — safe (no side effects) and idempotent (same result every time)." },
      { q: "What does a GraphQL subscription use?", a: "WebSocket — maintains a persistent connection for the server to push updates when data changes." }
    ],
    mcqs: [
      { q: "Which REST method is idempotent but NOT safe?", choices: ["GET","POST","DELETE","PATCH"], answer: 2 },
      { q: "GraphQL primarily solves:", choices: ["Database performance","Over/under-fetching in REST APIs","TLS overhead","Stateless auth"], answer: 1 },
    ],
    videoId: "yWzKJPw_VzM"
  },

  // ── System Design ─────────────────────────────────────────────────────────
  cap: {
    summary: [
      { heading: "CAP Theorem", body: "In a distributed system you can guarantee at most 2 of 3: Consistency (every read sees the latest write), Availability (every request gets a response), Partition Tolerance (system works despite network splits). Since partitions are unavoidable, real systems choose CP (HBase, Zookeeper) or AP (Cassandra, DynamoDB). PACELC extends this: even during normal operation, you trade latency vs consistency.", points: ["CP: strong consistency, may reject requests during partition", "AP: always responds, may return stale data", "CA systems (MySQL single-node) are not distributed", "PACELC: during partition C vs A; else latency vs consistency"] },
      { heading: "CAP in Practice", body: "Most distributed databases let you tune: quorum reads/writes (R + W > N → consistent), eventual consistency for speed. Amazon DynamoDB: AP by default, strongly consistent reads available. Cassandra: tunable from ONE to QUORUM to ALL. CockroachDB / Spanner: CP with distributed transactions. The right choice depends on whether correctness or availability is the business priority.", points: ["Quorum (W+R > N): consistent without strong serialisability", "Tunable consistency: per-request level (Cassandra)", "Spanner/CockroachDB: CP with atomic clocks / HLC", "Eventual consistency + conflict resolution = CRDT / LWW"] }
    ],
    flashcards: [
      { q: "What are the 3 CAP properties?", a: "Consistency (all nodes see same data), Availability (every request responds), Partition Tolerance (survives network splits)." },
      { q: "Why can't you have all three in CAP?", a: "During a network partition you must choose: stop serving (sacrifice A for C) or serve possibly stale data (sacrifice C for A)." },
      { q: "Is MySQL a CAP-CA system?", a: "A single-node MySQL is CA — but it's not a distributed system. CAP applies to multi-node setups with replication." },
      { q: "What does PACELC add to CAP?", a: "It considers the normal (no partition) case: even then you trade lower latency vs stronger consistency." },
      { q: "What is eventual consistency?", a: "Writes propagate asynchronously; reads may return stale data temporarily but all replicas converge eventually." },
      { q: "Cassandra is AP — what does that mean in practice?", a: "It always accepts writes and reads even during partitions, but different nodes may briefly return different values." }
    ],
    mcqs: [
      { q: "Zookeeper (used for leader election) is:", choices: ["AP","CP","CA","PA"], answer: 1 },
      { q: "In CAP, partition tolerance is:", choices: ["Optional for distributed systems","Mandatory — partitions always occur","Only needed at scale","Provided by TLS"], answer: 1 },
    ],
    videoId: "k-Yaq8AHlFA"
  },
  apidesign: {
    summary: [
      { heading: "API Design — REST Best Practices", body: "Good API design: noun-based URLs (/orders, not /getOrders), HTTP method semantics (GET=read, POST=create, PUT/PATCH=update, DELETE=remove), consistent error format (RFC 7807 Problem Details), versioning (/v1/), pagination (cursor > offset for large sets), HATEOAS links for discoverability.", points: ["/v1/orders — collection; /v1/orders/42 — resource", "POST 201 Created + Location header", "Error body: type, title, status, detail, instance", "Cursor pagination: stable for concurrent inserts/deletes"] },
      { heading: "API Design — Auth, Rate Limiting & Documentation", body: "Authentication: API keys (simple, no expiry control), OAuth 2.0 + JWT (delegated access, short-lived tokens), mTLS (service-to-service). Rate limiting: token bucket or leaky bucket algorithm, return 429 Too Many Requests with Retry-After header. Document with OpenAPI/Swagger — enables auto-generated clients. Idempotency keys prevent duplicate POST operations.", points: ["JWT: header.payload.signature, verify without DB", "OAuth scopes: fine-grained permissions", "429 + Retry-After: tell client when to retry", "Idempotency-Key header: safe to retry POST"] }
    ],
    flashcards: [
      { q: "Why prefer cursor pagination over offset pagination?", a: "Offset pagination skips rows — unstable when rows are inserted/deleted mid-pagination. Cursor-based is stable and O(1)." },
      { q: "What should a REST API return on POST success?", a: "201 Created with a Location header pointing to the new resource URL, and optionally the created resource in the body." },
      { q: "What is an idempotency key?", a: "A client-generated unique ID in the request header. Server stores it — duplicate requests with same key return the original response without side effects." },
      { q: "JWT structure?", a: "Three base64url-encoded parts separated by dots: Header (alg/typ), Payload (claims), Signature. Verify signature with the server's secret/public key." },
      { q: "What does 429 Too Many Requests indicate?", a: "The client has exceeded the rate limit. Include Retry-After header to tell the client when it can retry." },
      { q: "What is OpenAPI?", a: "A machine-readable specification format (YAML/JSON) for REST APIs. Enables auto-generated docs (Swagger UI), SDKs, and mocking." }
    ],
    mcqs: [
      { q: "Which HTTP status means a resource was successfully created?", choices: ["200","201","204","202"], answer: 1 },
      { q: "Cursor pagination is preferred over offset because:", choices: ["It is simpler","It handles concurrent inserts stably","It uses less memory","It avoids HTTP","It is faster for small datasets"], answer: 1 },
    ],
    videoId: "7nm1pYuKAhY"
  },
  cache: {
    summary: [
      { heading: "Caching Strategies — Patterns", body: "Caching stores frequently accessed data in fast storage (RAM) to reduce latency and backend load. Write strategies: write-through (write to cache and DB synchronously), write-back/write-behind (write to cache; flush to DB asynchronously), write-around (skip cache on write). Read strategies: cache-aside (app checks cache first; on miss, loads from DB and populates), read-through (cache fetches on miss automatically).", points: ["Cache-aside: app manages cache explicitly", "Read-through: cache fetches from DB on miss", "Write-through: cache + DB updated synchronously", "Write-back: async flush — fast writes, durability risk"] },
      { heading: "Caching — Eviction & Consistency", body: "Eviction policies: LRU (evict least recently used), LFU (least frequently used), TTL-based expiry. Cache stampede: many requests miss simultaneously and hammer the DB — mitigate with mutex/lock, probabilistic early expiry, or request coalescing. Cache coherence: ensure cache invalidation on writes. Thundering herd: spike of traffic after cache flush — warm cache before switchover.", points: ["LRU: good general-purpose policy", "TTL: simple staleness control", "Cache stampede prevention: mutex or jitter on TTL", "Redis: in-memory, persistence optional, pub/sub"] }
    ],
    flashcards: [
      { q: "Cache-aside vs read-through?", a: "Cache-aside: app queries cache; on miss, fetches DB and populates cache manually. Read-through: cache handles the miss and fetches DB automatically." },
      { q: "What is a cache stampede?", a: "Many requests simultaneously miss the cache (e.g. after expiry) and all hit the DB at once. Fix: lock, background refresh, or TTL jitter." },
      { q: "Write-through vs write-back?", a: "Write-through: write to cache and DB synchronously — consistent, slower. Write-back: write cache, flush DB async — faster, risk of loss." },
      { q: "What eviction policy does Redis use by default?", a: "noeviction — returns error when memory full. Configurable to allkeys-lru, volatile-lru, allkeys-random, etc." },
      { q: "What is a hot key problem in caching?", a: "One key (e.g. a viral post) receives disproportionate traffic — one shard overloaded. Fix: local in-process cache, key sharding, or replication." },
      { q: "What is TTL jitter?", a: "Adding random variation to cache TTLs so entries don't all expire simultaneously — prevents stampedes." }
    ],
    mcqs: [
      { q: "Write-back caching risks:", choices: ["Higher write latency","Data loss if cache fails before flush","Stale reads","More DB connections"], answer: 1 },
      { q: "LRU eviction removes:", choices: ["The largest object","The least recently accessed object","The oldest inserted object","The most frequently accessed"], answer: 1 },
    ],
    videoId: "dGAgxozNWFE"
  },
  shard: {
    summary: [
      { heading: "Sharding & Partitioning", body: "Sharding horizontally splits a database across multiple nodes — each shard holds a subset of data. Partition strategies: range (by key range, hotspot risk), hash (even distribution, range query hard), directory (lookup table, flexible but extra hop), geo (by region). Consistent hashing minimises remapping when nodes are added/removed.", points: ["Range partition: time-series, sorted scans easy, hotspots", "Hash partition: even load, no range queries", "Consistent hashing: add/remove node remaps only 1/N keys", "Shard key choice: cardinality, access pattern, growth"] },
      { heading: "Sharding — Cross-shard Queries & Resharding", body: "Cross-shard queries (JOIN, aggregation) require scatter-gather — fan out to all shards, aggregate results. Expensive — denormalise or use a separate analytics layer. Resharding (rebalancing) is complex: data must move while serving traffic. Strategies: double-write to old and new shard during migration, virtual shards (more logical shards than physical — reassign virtual → physical).", points: ["Scatter-gather: query all shards, merge — O(N) cost", "Hotspot: shard key choice matters (avoid monotonic IDs)", "Virtual shards: decouple logical from physical shards", "Resharding: background copy, dual-write, cutover"] }
    ],
    flashcards: [
      { q: "What problem does sharding solve?", a: "Vertical scaling limits of a single DB node — sharding distributes data and load across many nodes for horizontal scale." },
      { q: "What is a hotspot in sharding?", a: "One shard receives disproportionate traffic — usually because the shard key has low cardinality or is monotonically increasing (e.g. timestamps)." },
      { q: "How does consistent hashing help sharding?", a: "Nodes and keys are placed on a ring. Adding/removing a node only remaps keys adjacent to that node — minimises data movement." },
      { q: "What is a scatter-gather query?", a: "A query that fans out to all shards in parallel, collects results, and merges them — necessary for cross-shard aggregations." },
      { q: "Why is an auto-increment ID a bad shard key?", a: "All new writes go to the latest shard — creates a hotspot. Use a hash of the ID or a UUID instead." },
      { q: "What are virtual shards?", a: "Logical partitions that map to physical nodes. Makes resharding easier — reassign virtual → physical without moving data schema." }
    ],
    mcqs: [
      { q: "Consistent hashing minimises:", choices: ["Query latency","Keys remapped when a node is added/removed","Shard size","Cross-shard joins"], answer: 1 },
      { q: "Which sharding strategy makes range queries easiest?", choices: ["Hash partitioning","Consistent hashing","Range partitioning","Directory partitioning"], answer: 2 },
    ],
    videoId: "zaRkONvyGr8"
  },
  repl2: {
    summary: [
      { heading: "Replication in System Design", body: "Replication copies data to multiple nodes for durability, read scaling, and failover. Leader-follower: one writer, many readers. Multi-leader: write anywhere, conflict resolution needed. Leaderless (Dynamo-style): quorum writes/reads. Synchronous replication: zero data loss, higher latency. Asynchronous: lower latency, replication lag risk.", points: ["Leader-follower: simple, one write path", "Multi-leader: geo-distributed writes, conflict risk", "Leaderless: quorum W+R>N ensures consistency", "Replication factor: how many copies to maintain (N=3 typical)"] },
      { heading: "Replication — Conflict Resolution", body: "Multi-leader and leaderless systems face write conflicts. Strategies: last-write-wins (LWW — simple, data loss), version vectors (track causality), CRDTs (conflict-free data types — auto merge), application-level merge. Read repair and anti-entropy processes fix diverged replicas in the background. Hinted handoff: write to a proxy when target is down, deliver later.", points: ["LWW: simple, loses concurrent updates", "Vector clocks: detect causality, client resolves conflicts", "CRDT: counter, set, register — always mergeable", "Hinted handoff: store hint, deliver when node recovers"] }
    ],
    flashcards: [
      { q: "What is replication lag?", a: "The delay between a write committed on the leader and when it appears on a follower. Can cause stale reads." },
      { q: "Quorum write/read formula?", a: "W + R > N — if writes go to W nodes and reads from R nodes, and W+R > N (total replicas), at least one node overlaps." },
      { q: "Last-write-wins conflict resolution?", a: "In a conflict, the write with the latest timestamp wins. Simple but loses concurrent updates — requires synchronised clocks." },
      { q: "What is a CRDT?", a: "Conflict-Free Replicated Data Type — data structures (counters, sets) that can be merged automatically without conflicts." },
      { q: "What is hinted handoff?", a: "When a target node is unavailable, another node stores the write with a 'hint'. When the target recovers, the hint is replayed." },
      { q: "What is read repair?", a: "On a quorum read, if replicas return different values, the most recent is written back to stale replicas." }
    ],
    mcqs: [
      { q: "N=3, W=2, R=2. Is quorum consistency achieved?", choices: ["No (W+R=4, not > N)","Yes (W+R=4 > 3)","Only with synchronous replication","Only for CP systems"], answer: 1 },
      { q: "CRDTs solve:", choices: ["Network latency","Write conflicts without coordination","Replication lag","Shard hotspots"], answer: 1 },
    ],
    videoId: "bI8IQ5CTW8w"
  },
  mq: {
    summary: [
      { heading: "Message Queues — Async Communication", body: "Message queues decouple producers from consumers. Producer publishes a message; consumer processes it asynchronously. Benefits: load levelling (absorb bursts), resilience (retry failed messages), decoupling (independent scaling). Queue semantics: at-most-once (fast, may lose), at-least-once (may duplicate), exactly-once (expensive). DLQ (dead-letter queue) holds failed messages.", points: ["At-least-once: default; consumers must be idempotent", "Exactly-once: requires 2-phase commit or idempotency key", "DLQ: failed messages after N retries → inspect and fix", "Fan-out: one message → multiple queues (pub/sub pattern)"] },
      { heading: "Kafka vs RabbitMQ vs SQS", body: "Kafka: distributed log, high-throughput, consumer groups, replay, retention. RabbitMQ: AMQP broker, routing rules, exchanges, ACK-based, message TTL. SQS: managed AWS queue, at-least-once, visibility timeout, FIFO option. Use Kafka for event streaming and analytics; RabbitMQ/SQS for task queues and job dispatch.", points: ["Kafka: ordered per partition, consumer offset, replay", "RabbitMQ: exchanges (fanout, direct, topic), acks", "SQS: visibility timeout hides message while processing", "Consumer group: each message delivered to one instance"] }
    ],
    flashcards: [
      { q: "What delivery guarantee should consumers handle?", a: "At-least-once delivery — messages may be delivered more than once. Consumers must be idempotent (same result on duplicate)." },
      { q: "What is a dead-letter queue?", a: "A separate queue where messages land after failing processing N times. Used for inspection, alerting, and manual replay." },
      { q: "Kafka vs RabbitMQ in one line?", a: "Kafka: high-throughput event log with replay. RabbitMQ: flexible message broker with routing rules and ACK semantics." },
      { q: "What is a consumer group in Kafka?", a: "Multiple consumers sharing a topic. Each partition is consumed by exactly one member — enables parallel processing." },
      { q: "What is visibility timeout (SQS)?", a: "After a consumer receives a message, it becomes invisible to others for a set period. If not deleted, it reappears for retry." },
      { q: "Why use a message queue instead of direct HTTP calls?", a: "Decouples producer/consumer, absorbs traffic spikes, provides retry/DLQ, and allows independent scaling of each side." }
    ],
    mcqs: [
      { q: "At-least-once delivery means consumers must be:", choices: ["Fast","Idempotent","Synchronous","Stateless"], answer: 1 },
      { q: "Kafka partitions provide:", choices: ["Global ordering","Ordering within a partition","Random delivery","Exactly-once semantics"], answer: 1 },
    ],
    videoId: "oUJbuFMyc4o"
  },
  rl: {
    summary: [
      { heading: "Rate Limiting — Algorithms", body: "Rate limiting controls how many requests a client can make in a time window — prevents abuse and ensures fair use. Algorithms: Fixed window (count per window, burst at boundary), Sliding window log (exact, memory-heavy), Sliding window counter (approximate, efficient), Token bucket (allows bursts up to bucket size, refills at rate R), Leaky bucket (output at constant rate, smoothes bursts).", points: ["Fixed window: simple, boundary burst problem", "Sliding window: accurate, memory proportional to request count", "Token bucket: bursty traffic allowed, commonest in practice", "Leaky bucket: smooth output rate, no bursts allowed"] },
      { heading: "Rate Limiting — Distributed Implementation", body: "Single-server rate limiting uses in-memory counters. Distributed: use Redis with atomic INCR + EXPIRE, or Lua scripts for token bucket. Return 429 Too Many Requests with Retry-After header. Apply per user, per IP, per API key, or per route. Redis sorted sets implement sliding window logs. Sliding window counter: combine current and previous window counters proportionally.", points: ["Redis INCR + EXPIRE: fixed window in one atomic op", "Redis Lua: atomic token bucket state", "429 + Retry-After: X seconds until next allowed request", "Distributed: shard rate limit state by user/key ID"] }
    ],
    flashcards: [
      { q: "Token bucket vs leaky bucket?", a: "Token bucket: tokens accumulate up to a max — allows controlled bursts. Leaky bucket: output drains at fixed rate — no bursts, smooth." },
      { q: "What is the fixed window boundary burst problem?", a: "A client can make 2× the limit straddling the window boundary (max at end of window 1, max at start of window 2)." },
      { q: "What HTTP status code signals rate limiting?", a: "429 Too Many Requests, typically with a Retry-After header indicating when the client may retry." },
      { q: "How does Redis enable distributed rate limiting?", a: "Atomic INCR + EXPIRE commands (or Lua scripts) allow all instances to share rate limit state with consistent counting." },
      { q: "What is the sliding window counter algorithm?", a: "Blend previous window count (weighted by time elapsed) and current window count — approximates a true sliding window efficiently." },
      { q: "Why rate limit per API key rather than per IP?", a: "IP-based limiting is coarse — a NAT gateway shares one IP for many users. API keys identify individual clients precisely." }
    ],
    mcqs: [
      { q: "Which algorithm allows short bursts above the average rate?", choices: ["Leaky bucket","Fixed window","Token bucket","Sliding window log"], answer: 2 },
      { q: "Redis INCR + EXPIRE implements which algorithm?", choices: ["Token bucket","Leaky bucket","Fixed window counter","Sliding window log"], answer: 2 },
    ],
    videoId: "FU4WlwfS3G0"
  },
  lbsd: {
    summary: [
      { heading: "Load Balancers in System Design", body: "Load balancers are a critical component for horizontal scaling. DNS round-robin: simple, no health checks, low cost. L4 LB (TCP): fast, protocol-agnostic, no content inspection. L7 LB (HTTP): routing by path/header/cookie, SSL termination, sticky sessions. Hardware LBs (F5): expensive, high performance. Software LBs: nginx, HAProxy, Envoy, AWS ALB/NLB.", points: ["L4: low latency, no TLS termination (pass-through)", "L7: smart routing, TLS terminate, more CPU", "nginx upstream: health-check, weight, backup", "AWS ALB: L7, path-based routing, WAF integration"] },
      { heading: "Load Balancer — Algorithms & Patterns", body: "Round Robin: equal distribution. Weighted: capacity-aware. Least Connections: dynamic, handles variable request duration. Random with two choices (power of two): outperforms pure random. Consistent hashing: affinity without sticky sessions. Global load balancing (Anycast, GeoDNS, Cloudflare): routes users to nearest data centre. GSLB (Global Server Load Balancing) considers health + geo.", points: ["Power of two choices: pick 2 random, send to less loaded", "Consistent hashing: same client → same backend (affinity)", "Anycast: multiple IPs same, routed to nearest PoP", "GSLB: DNS-based global routing + health"] }
    ],
    flashcards: [
      { q: "L4 vs L7 load balancer?", a: "L4 routes TCP/UDP by IP/port — fast but no HTTP awareness. L7 inspects HTTP content — path routing, header rules, cookie stickiness." },
      { q: "What is the power of two choices algorithm?", a: "Pick two random backends; send to the one with fewer active connections. Outperforms pure random with minimal overhead." },
      { q: "When does consistent hashing help load balancing?", a: "When you want client affinity (same client → same server) without cookie-based sticky sessions — e.g. WebSocket servers or caches." },
      { q: "What is Anycast?", a: "Multiple servers share the same IP. BGP routing sends the client to the nearest server — used by CDNs and DNS resolvers (8.8.8.8)." },
      { q: "What is SSL termination at the LB?", a: "The LB decrypts TLS and forwards plain HTTP to backends — offloads crypto from app servers, simplifies certificate management." },
      { q: "What is connection draining?", a: "On server removal, the LB stops new connections but allows existing ones to complete. Ensures zero dropped requests during deploys." }
    ],
    mcqs: [
      { q: "Which LB algorithm adapts to variable request processing time?", choices: ["Round Robin","Least Connections","Weighted Round Robin","IP Hash"], answer: 1 },
      { q: "Anycast routing sends traffic to:", choices: ["A random server","The server with the most capacity","The geographically nearest server","The least loaded server"], answer: 2 },
    ],
    videoId: "sCR3SAVdyCc"
  },
  ms: {
    summary: [
      { heading: "Microservices — Architecture", body: "Microservices decompose a monolith into small, independently deployable services — each owns its domain and data. Benefits: independent scaling, technology flexibility, team autonomy, fault isolation. Costs: network latency, distributed transactions, operational complexity, service discovery, observability overhead. Bounded Context (DDD) defines service boundaries.", points: ["Each service owns its DB — no shared schema", "Service-to-service: REST, gRPC, or async messaging", "API gateway: single entry point, auth, rate limit, routing", "Service mesh (Istio/Envoy): mTLS, retries, circuit breaker"] },
      { heading: "Microservices — Patterns & Pitfalls", body: "Saga pattern: distributed transaction via choreography (events) or orchestration (central coordinator). CQRS: separate read and write models. Event sourcing: store events, not state. Circuit breaker: stop calling a failing service, fast-fail. Strangler fig: incrementally replace monolith. Common pitfall: distributed monolith — services coupled by shared DB or synchronous chains.", points: ["Saga: choreography (events) vs orchestration (orchestrator)", "Circuit breaker: closed → open → half-open", "Strangler fig: route traffic gradually to new service", "Avoid: shared DB, synchronous chains of N services"] }
    ],
    flashcards: [
      { q: "What is the key data isolation rule in microservices?", a: "Each service owns its own database — no other service directly queries it. Sharing data happens via API or events." },
      { q: "What is a Saga pattern?", a: "Manages distributed transactions without 2PC. Choreography: services emit events. Orchestration: a central coordinator calls each step." },
      { q: "What is a circuit breaker?", a: "Monitors calls to a downstream service. After N failures, it 'opens' and fast-fails without calling — allows the service to recover." },
      { q: "What is the strangler fig pattern?", a: "Gradually replace a monolith by routing specific routes to new microservices. The monolith shrinks over time until fully replaced." },
      { q: "What is a distributed monolith?", a: "Microservices that are tightly coupled — share a database or have long synchronous call chains. Worst of both worlds." },
      { q: "What does an API gateway do?", a: "Single entry point for all clients. Handles routing, auth, rate limiting, SSL termination, and aggregation of multiple services." }
    ],
    mcqs: [
      { q: "Which pattern avoids 2-phase commit for distributed transactions?", choices: ["Two-phase locking","Saga","CQRS","Outbox pattern"], answer: 1 },
      { q: "A circuit breaker in 'open' state:", choices: ["Allows all requests","Blocks all requests and fast-fails","Retries with exponential backoff","Logs requests only"], answer: 1 },
    ],
    videoId: "rv4LlmLmVWk"
  },
  ch: {
    summary: [
      { heading: "Consistent Hashing", body: "Consistent hashing places both nodes and keys on a virtual ring (0 to 2^32). A key is assigned to the first node clockwise from its hash. When a node is added/removed, only the keys between it and its predecessor are remapped — O(1/N) rehashing. Used in distributed caches (memcached), DHTs, and load balancers.", points: ["Ring: nodes and keys hashed to same space", "Add node: take over keys from next node only", "Remove node: next node absorbs its keys", "1/N keys remapped vs N keys in simple modular hashing"] },
      { heading: "Consistent Hashing — Virtual Nodes", body: "With few physical nodes, keys can distribute unevenly (hot node). Virtual nodes: each physical node gets K positions on the ring — more uniform distribution and better load balancing when nodes have different capacities. More virtual nodes → smoother distribution but higher memory for the ring data structure.", points: ["Virtual nodes: K ring positions per physical node", "Uniform distribution: more virtual nodes → better balance", "Weighted: powerful node gets more virtual slots", "Rendezvous hashing: alternative, each key picks highest-scoring node"] }
    ],
    flashcards: [
      { q: "What problem does consistent hashing solve?", a: "Minimises key remapping when nodes are added/removed. Simple mod hashing remaps O(N) keys; consistent hashing remaps O(1/N)." },
      { q: "How is a key assigned to a node in consistent hashing?", a: "Hash the key to a point on the ring; walk clockwise to find the first node at or after that point." },
      { q: "What are virtual nodes?", a: "Each physical node is given K positions on the ring. This improves load distribution and handles heterogeneous node capacities." },
      { q: "What fraction of keys move when a node is added?", a: "Only 1/N of keys (where N is number of nodes) — those that were assigned to the next node on the ring." },
      { q: "Where is consistent hashing used?", a: "Distributed caches (memcached, Redis cluster), DHTs, Cassandra token ring, load balancers with affinity." },
      { q: "What is rendezvous hashing?", a: "Alternative to ring hashing. For each key, compute a score with each node; assign to highest-scoring node. Simple and elegant." }
    ],
    mcqs: [
      { q: "With consistent hashing, adding a new node remaps approximately:", choices: ["All keys","Half the keys","1/N of keys","No keys"], answer: 2 },
      { q: "Virtual nodes in consistent hashing primarily improve:", choices: ["Query latency","Load distribution uniformity","Network throughput","Replication factor"], answer: 1 },
    ],
    videoId: "zaRkONvyGr8"
  },
  obs: {
    summary: [
      { heading: "Observability — Metrics, Logs, Traces", body: "Observability is the ability to understand a system's internal state from its external outputs. Three pillars: Metrics (numeric, aggregated — Prometheus/Grafana), Logs (structured events — Elasticsearch/Kibana, Loki), Distributed Traces (request flow across services — Jaeger, Zipkin, OpenTelemetry). SLO (Service Level Objective) defines acceptable reliability; SLA is the contract; SLI is the measured indicator.", points: ["Metrics: counters, gauges, histograms, summaries", "Logs: structured JSON, correlation IDs, severity", "Traces: span tree, parent-child, context propagation", "SLI/SLO/SLA: measured indicator, target, agreement"] },
      { heading: "Observability — Alerting & On-call", body: "Alert on symptoms, not causes — high error rate is a symptom; a specific function throwing is a cause. RED method: Rate, Errors, Duration. USE method: Utilisation, Saturation, Errors (infrastructure). Runbooks describe how to respond. Error budget: 100% − SLO; when budget exhausted, freeze features and fix reliability. Structured logging with correlation IDs enables tracing a request across services.", points: ["RED: request rate, error rate, latency (services)", "USE: utilisation, saturation, errors (resources)", "Error budget: SLO=99.9% → 8.7h downtime/year allowed", "Correlation ID: trace one request across microservices"] }
    ],
    flashcards: [
      { q: "What are the three pillars of observability?", a: "Metrics (aggregated numbers), Logs (event records), Distributed Traces (request flow across services)." },
      { q: "SLI vs SLO vs SLA?", a: "SLI: measured metric (e.g. 99.5% requests < 200ms). SLO: target (99.9%). SLA: contract with penalties if SLO is breached." },
      { q: "What is the RED method?", a: "Rate (requests/sec), Errors (error rate), Duration (latency distribution). Use for service-level monitoring." },
      { q: "What is an error budget?", a: "The allowed downtime/errors = 1 − SLO. If 99.9% uptime target, error budget = 0.1% = ~8.7 hours/year." },
      { q: "What is a distributed trace?", a: "A record of a request's journey across multiple services, represented as a tree of spans with timing and metadata." },
      { q: "Why use structured (JSON) logging?", a: "Machine-parseable — enables filtering by field (user_id, request_id, level) in log aggregators without regex parsing." }
    ],
    mcqs: [
      { q: "An SLO of 99.9% allows how much downtime per month?", choices: ["43 minutes","8.7 hours","4.3 minutes","1 hour"], answer: 0 },
      { q: "The RED method applies to:", choices: ["Infrastructure resources","Application services","Database queries","Network devices"], answer: 1 },
    ],
    videoId: "ACL_rzC0oAY"
  },

    // ── DSA ──────────────────────────────────────────────────────────────────
  arr: {
    videoId: "Qou8pnW-eRY",
    summary: [
      { heading: "Arrays — Memory Model & Core Operations",
        body: "An array stores elements in contiguous memory locations, giving O(1) random access by index. The CPU cache loves arrays because of spatial locality — iterating an array is much faster than traversing a linked list. Insertion/deletion at an arbitrary position costs O(n) because you must shift elements.",
        points: ["O(1) read/write by index","O(n) insert/delete in the middle","O(1) amortised append to end (dynamic array)","Foundation for two-pointer, sliding window, prefix-sum patterns"] },
      { heading: "Arrays — Key Patterns in Interviews",
        body: "Most medium-hard array problems reduce to one of three patterns: two pointers (sorted or symmetric input), sliding window (contiguous subarray with a constraint), or prefix sums (range sum / subarray sum queries). Recognise the pattern early to avoid O(n²) brute force.",
        points: ["Prefix sum: precompute cumulative totals for O(1) range queries","Two pointer: works on sorted arrays or when shrinking from both ends","Sliding window: expand right, shrink left when invariant is violated","Kadane's algorithm: O(n) max subarray sum"] },
    ],
    flashcards: [
      { q:"Time complexity of random access in an array?", a:"O(1) — direct index calculation." },
      { q:"Why is array iteration cache-friendly?", a:"Contiguous memory → CPU prefetches adjacent cache lines." },
      { q:"How does a dynamic array (ArrayList) achieve O(1) amortised append?", a:"Doubles capacity on overflow; cost is amortised across all appends." },
      { q:"Two-sum on a SORTED array — optimal approach?", a:"Two pointers: O(n) time, O(1) space." },
      { q:"Prefix sum use case?", a:"Range sum query in O(1) after O(n) preprocessing." },
      { q:"Difference between array and linked list for insert at head?", a:"Array: O(n) shift. Linked list: O(1) pointer update." },
    ],
    mcqs: [
      { q:"Which technique solves 'subarray with sum equal to k' in O(n)?", choices:["Sorting","Prefix sum + hash map","Two pointers","Sliding window"], answer:1 },
      { q:"Time complexity of removing an element from the middle of an array?", choices:["O(1)","O(log n)","O(n)","O(n²)"], answer:2 },
      { q:"Kadane's algorithm finds:", choices:["Sorted subarray","Maximum sum subarray","Minimum element","Longest unique substring"], answer:1 },
    ],
  },
  str: {
    videoId: "AresDTyFM0",
    summary: [
      { heading: "Strings — Immutability & Common Operations",
        body: "Strings are sequences of characters, often immutable. Concatenation in a loop is O(n²) in languages where strings are immutable — use a StringBuilder or join. Most string problems involve pattern matching, anagram detection, or subsequence checks.",
        points: ["Use a frequency map (hash map) for anagram/permutation problems","KMP and Rabin-Karp for pattern matching in O(n+m)","Sliding window for 'minimum window substring' type problems","Palindrome check: two pointers from centre outward"] },
      { heading: "Strings — Interview Patterns",
        body: "Character frequency arrays (size 26 for lowercase) are faster than hash maps for alphabet-restricted problems. For palindrome and parenthesis problems, a stack is the natural auxiliary structure.",
        points: ["Fixed-size int[26] replaces a hash map for lowercase-only problems","Stack: valid parentheses, largest rectangle in histogram","Trie: prefix matching, autocomplete, word search","Rolling hash (Rabin-Karp): substring search in O(n) expected"] },
    ],
    flashcards: [
      { q:"Why is string += in a loop O(n²)?", a:"Each concatenation copies the existing string — O(n) per step." },
      { q:"Anagram check: fastest approach?", a:"Sort both → O(n log n). Or frequency array → O(n), O(1) space (fixed alphabet)." },
      { q:"KMP's advantage over naive pattern matching?", a:"O(n+m) vs O(n·m) — it never re-examines characters." },
      { q:"How to check if a string is a palindrome in O(n)?", a:"Two pointers: one from start, one from end, compare characters." },
      { q:"Trie use case in interviews?", a:"Prefix search, autocomplete, word dictionary — O(L) lookup where L = word length." },
      { q:"What is a rolling hash?", a:"Hash that updates in O(1) as the window slides — used in Rabin-Karp." },
    ],
    mcqs: [
      { q:"'Minimum window substring' is solved optimally with:", choices:["DP","Trie","Sliding window + frequency map","Binary search"], answer:2 },
      { q:"Time complexity of KMP pattern matching for text T and pattern P?", choices:["O(|T|·|P|)","O(|T|+|P|)","O(|T| log |P|)","O(|P|²)"], answer:1 },
      { q:"Best data structure for autocomplete / prefix search?", choices:["Hash map","Array","Trie","BST"], answer:2 },
    ],
  },
  ll: {
    videoId: "WwfhLC16bis",
    summary: [
      { heading: "Linked Lists — Structure & Traversal",
        body: "A linked list stores elements in nodes connected by pointers. Unlike arrays, nodes are scattered in memory, so random access is O(n). The payoff: O(1) insertion and deletion at any position when you hold a pointer to the predecessor.",
        points: ["Singly linked: each node points to next only","Doubly linked: each node points to both prev and next","No random access — must traverse from head","Insertion/deletion at known pointer: O(1)"] },
      { heading: "Linked Lists — Interview Techniques",
        body: "Most linked list interview problems use one of two tricks: fast/slow pointers (Floyd's cycle detection, finding the middle) or the dummy node head (simplifies edge cases at the actual head). Practice reversing a list iteratively — it appears as a sub-step in harder problems.",
        points: ["Fast/slow pointer: cycle detection, find middle, kth from end","Dummy head: simplifies edge cases when the head might change","Reverse in-place: O(n) time, O(1) space","Merge two sorted lists: classic recursion or iterative with a dummy"] },
    ],
    flashcards: [
      { q:"Floyd's cycle detection uses:", a:"Two pointers — slow moves 1 step, fast moves 2 steps per iteration." },
      { q:"How do you find the middle of a linked list in O(n)?", a:"Fast/slow pointer: when fast reaches the end, slow is at the middle." },
      { q:"Why use a dummy head node?", a:"Avoids special-casing insertions/deletions at the actual head." },
      { q:"Reversing a singly linked list in-place: time and space?", a:"O(n) time, O(1) space — three-pointer iteration." },
      { q:"Detect the start of a cycle in a linked list?", a:"After Floyd's meet point, reset one pointer to head; advance both 1 step at a time — they meet at cycle start." },
      { q:"When is a doubly linked list preferred over singly?", a:"When you need O(1) backward traversal or deletion given only the node (no predecessor pointer needed)." },
    ],
    mcqs: [
      { q:"Detecting a cycle in a linked list in O(n) time and O(1) space uses:", choices:["Hash set","Sorting","Fast/slow pointer","Recursion"], answer:2 },
      { q:"Merging k sorted linked lists most efficiently runs in:", choices:["O(n·k)","O(n log k)","O(n²)","O(k²)"], answer:1 },
      { q:"Reversing a linked list iteratively requires how many pointers?", choices:["1","2","3","4"], answer:2 },
    ],
  },
  hash: {
    videoId: "9HFbhPscPU0",
    summary: [
      { heading: "Hashing — Hash Tables & Collision Handling",
        body: "A hash table maps keys to values via a hash function, achieving O(1) average-case get, put, and delete. Collisions — when two keys map to the same bucket — are handled by chaining (linked list per bucket) or open addressing (linear/quadratic probing).",
        points: ["O(1) average get/put/delete","O(n) worst case when hash function is poor or table is overloaded","Load factor = n/capacity; rehash when it exceeds ~0.75","Chaining: each bucket holds a list; open addressing: probe for next empty slot"] },
      { heading: "Hashing — Interview Applications",
        body: "Hash maps are the go-to auxiliary structure for trading space for time. Any O(n²) 'find two elements that satisfy condition' problem becomes O(n) by storing seen elements in a hash set.",
        points: ["Two-sum: store complements in a hash map — O(n)","Frequency counting: character/word frequency in O(n)","Detecting duplicates in O(n) instead of O(n log n) sort","Group anagrams: key = sorted string, value = list of anagrams"] },
    ],
    flashcards: [
      { q:"Average time complexity for hash map lookup?", a:"O(1). Worst case O(n) with many collisions." },
      { q:"What is the load factor and why does it matter?", a:"n/capacity. High load factor → more collisions → slower ops. Rehash at ~0.75." },
      { q:"Chaining vs open addressing — key trade-off?", a:"Chaining handles high load better; open addressing has better cache locality." },
      { q:"How does two-sum use a hash map?", a:"Store each number's index; for each element check if (target - element) exists in the map." },
      { q:"How to group anagrams in O(n·k)?", a:"Key = sorted characters of each word. Group into a map<string, list<string>>." },
      { q:"What is a perfect hash function?", a:"Maps every key to a unique bucket — no collisions. Rare; only achievable for known key sets." },
    ],
    mcqs: [
      { q:"Two-sum on an unsorted array — optimal time complexity:", choices:["O(n²)","O(n log n)","O(n)","O(log n)"], answer:2 },
      { q:"A hash set is preferred over a hash map when:", choices:["You need key-value pairs","You only need to check membership (no associated value)","Ordering is required","You need sorted output"], answer:1 },
      { q:"Rehashing a hash table costs:", choices:["O(1)","O(log n)","O(n)","O(n²)"], answer:2 },
    ],
  },
  stk: {
    videoId: "KInG04mAjO0",
    summary: [
      { heading: "Stacks & Queues — LIFO vs FIFO",
        body: "A stack follows Last-In-First-Out (LIFO). A queue follows First-In-First-Out (FIFO). Both support O(1) push/enqueue and pop/dequeue. In interviews, stacks model 'undo' / balanced parentheses / monotonic problems. Queues power BFS.",
        points: ["Stack: push/pop at the top — O(1)","Queue: enqueue at back, dequeue from front — O(1) with a deque","Monotonic stack: maintains elements in sorted order — next greater element in O(n)","Deque (double-ended queue): O(1) at both ends"] },
      { heading: "Stacks & Queues — Common Interview Patterns",
        body: "Monotonic stacks solve 'next greater/smaller element' problems in a single O(n) pass. A queue backed by a deque solves sliding window maximum in O(n). Implement a stack using two queues (and vice versa) as a warm-up exercise.",
        points: ["Valid parentheses: push open brackets, pop and match on close","Daily temperatures / next greater element: monotonic stack","Sliding window maximum: monotonic deque","LRU Cache: doubly linked list + hash map"] },
    ],
    flashcards: [
      { q:"What does 'monotonic stack' mean?", a:"Elements in the stack are maintained in a monotonically increasing or decreasing order." },
      { q:"'Next greater element' pattern: time complexity?", a:"O(n) — each element is pushed and popped at most once." },
      { q:"How to implement a queue using two stacks?", a:"Push to stack1. To dequeue: if stack2 is empty, pop all from stack1 to stack2, then pop stack2." },
      { q:"LRU Cache — which data structures make O(1) get and put?", a:"Hash map (O(1) lookup) + doubly linked list (O(1) move to front / remove from tail)." },
      { q:"Sliding window maximum in O(n) — approach?", a:"Monotonic deque: keep indices of potentially maximum elements; pop from front when out of window." },
      { q:"Stack-based evaluation of postfix expressions?", a:"Operand → push. Operator → pop two, compute, push result." },
    ],
    mcqs: [
      { q:"'Valid parentheses' is solved with:", choices:["Array","Queue","Stack","Hash map"], answer:2 },
      { q:"Sliding window maximum in O(n) uses:", choices:["Sorting","Priority queue","Monotonic deque","Two stacks"], answer:2 },
      { q:"Implement stack using two queues — push is O(n) while pop is O(1) in the version that:", choices:["Rotates queue on push","Rotates queue on pop","Never rotates","Uses three queues"], answer:1 },
    ],
  },
  tp: {
    videoId: "eD03AsyDN2o",
    summary: [
      { heading: "Two Pointers — Core Idea",
        body: "Two pointers maintain two indices that traverse a data structure simultaneously. On a sorted array, one starts at the left and one at the right, converging inward based on a comparison. This turns many O(n²) problems into O(n).",
        points: ["Works best on sorted arrays or when structure allows directional movement","Each pointer moves at most n steps → O(n) total","No extra space needed — O(1) space","Classic: two-sum, remove duplicates, palindrome check"] },
      { heading: "Two Pointers — Variants",
        body: "Variations include the fast/slow pointer (for linked list cycles, finding the middle) and the same-direction variant where both pointers start at the left but advance at different speeds (for 'remove element', 'move zeroes').",
        points: ["Opposite ends: two-sum, container with most water, trapping rain water","Same direction (slow/fast): remove duplicates in-place, move zeroes","Slow/fast on linked list: Floyd's cycle detection, find middle","Three pointers: 3-sum uses an outer loop + inner two-pointer scan"] },
    ],
    flashcards: [
      { q:"Pre-condition for two-pointer to work on an array?", a:"Array is sorted (or sortable), so comparison result tells you which pointer to advance." },
      { q:"Two-sum sorted — when to advance the left pointer?", a:"When current sum < target (need a larger value)." },
      { q:"Two-sum sorted — when to advance the right pointer?", a:"When current sum > target (need a smaller value)." },
      { q:"'Trapping rain water' — two-pointer approach?", a:"Track maxLeft and maxRight; advance the pointer with the smaller max. Water at each position = min(maxLeft, maxRight) − height[i]." },
      { q:"3-sum time complexity with two-pointer inner loop?", a:"O(n²): O(n log n) sort + O(n) outer × O(n) inner two-pointer." },
      { q:"Remove duplicates from sorted array in-place — technique?", a:"Slow pointer tracks write position; fast pointer scans ahead — same-direction two pointers." },
    ],
    mcqs: [
      { q:"Two-pointer works WITHOUT sorting when:", choices:["The problem requires O(1) space","The structure has a directional invariant without sorting (e.g., palindrome check)","The array is random","Both pointers always move right"], answer:1 },
      { q:"'Container with most water' — why advance the shorter bar?", choices:["Heuristic only","Preserves the area-maximisation invariant","Longer bar is more expensive to move","Random choice"], answer:1 },
      { q:"3-sum time complexity:", choices:["O(n)","O(n log n)","O(n²)","O(n³)"], answer:2 },
    ],
  },
  sw: {
    videoId: "MK-NZ4OwLyY",
    summary: [
      { heading: "Sliding Window — Variable & Fixed Size",
        body: "A sliding window defines a contiguous subarray or substring using two pointers (left and right). Expand the right edge to grow the window; shrink the left edge when an invariant is violated. This avoids recomputing the window from scratch each step.",
        points: ["O(n): each element is added and removed from the window at most once","Fixed size: window length is given (e.g. average of k elements)","Variable size: window grows/shrinks based on a constraint","Hash map or counter tracks the window's contents"] },
      { heading: "Sliding Window — Problem Recognition",
        body: "If a problem asks for an optimal contiguous subarray or substring and has a constraint on its contents, sliding window is likely the right tool. The hard part is defining the invariant — what makes a window valid or invalid.",
        points: ["'Longest substring with at most k distinct characters' → variable window","'Maximum sum subarray of size k' → fixed window","'Minimum window substring' → variable window + two frequency maps","'Permutation in string' → fixed window + character frequency match"] },
    ],
    flashcards: [
      { q:"How is sliding window different from two pointers?", a:"Both use two pointers, but sliding window explicitly tracks a window's contents (often with a map/counter). Two pointers is a broader pattern." },
      { q:"When do you shrink the left boundary?", a:"When the window violates the invariant (e.g., too many distinct chars, sum exceeds target)." },
      { q:"'Minimum window substring' — data structures needed?", a:"Two frequency maps: one for the target, one for the current window. Expand right, shrink left when all chars are covered." },
      { q:"Fixed vs variable window — key distinction?", a:"Fixed: move both pointers together (right expands, left = right - k). Variable: left moves independently when invariant is broken." },
      { q:"'Longest substring without repeating characters' — window invariant?", a:"All characters in window are unique. Use a set or map to track the current window." },
      { q:"Overall time complexity of sliding window?", a:"O(n) — left and right each traverse the array at most once." },
    ],
    mcqs: [
      { q:"'Longest substring with at most 2 distinct characters' is a:", choices:["Fixed window","Variable window","Stack problem","DP problem"], answer:1 },
      { q:"'Maximum sum of k consecutive elements' — window type?", choices:["Variable","Fixed","Monotonic","Prefix sum"], answer:1 },
      { q:"Time complexity of sliding window?", choices:["O(n²)","O(n log n)","O(n)","O(1)"], answer:2 },
    ],
  },
  tree: {
    videoId: "fAAZixBzIAI",
    summary: [
      { heading: "Trees — Structure & Traversals",
        body: "A tree is a connected acyclic graph with a root node. Each node has at most one parent and zero or more children. Binary trees restrict children to at most two. The height h determines traversal cost: O(h) for balanced trees (O(log n)), O(n) worst case (skewed).",
        points: ["Three DFS orders: pre-order (root→L→R), in-order (L→root→R), post-order (L→R→root)","Level-order (BFS): uses a queue; visits level by level","Height = max depth of any leaf. Balanced tree height = O(log n)","Recursive traversal: O(n) time, O(h) implicit stack space"] },
      { heading: "Trees — Key Interview Problems",
        body: "Most binary tree problems have a clean recursive structure: solve left subtree, solve right subtree, combine. Identify whether you need a top-down (pass info down via parameters) or bottom-up (return info up via return value) approach.",
        points: ["Max depth / diameter: bottom-up recursion","Path sum: top-down DFS with a running sum","LCA (Lowest Common Ancestor): bottom-up, return the node when both targets found","Serialise/deserialise: pre-order DFS with sentinel for null"] },
    ],
    flashcards: [
      { q:"In-order traversal of a BST gives?", a:"Elements in sorted (ascending) order." },
      { q:"What is the height of a balanced binary tree with n nodes?", a:"O(log n)." },
      { q:"Difference between DFS and BFS on trees?", a:"DFS uses a stack (implicit via recursion). BFS uses a queue, visits level by level." },
      { q:"How to check if a binary tree is balanced?", a:"Check left and right heights differ by at most 1 at every node — O(n) bottom-up recursion." },
      { q:"LCA algorithm (binary tree, no parent pointers)?", a:"If current node is either target or null, return it. Otherwise recurse left and right; if both return non-null, current node is LCA." },
      { q:"Level-order traversal iterative implementation?", a:"BFS with a queue: dequeue node, process it, enqueue its children." },
    ],
    mcqs: [
      { q:"Which traversal visits the root LAST?", choices:["Pre-order","In-order","Post-order","Level-order"], answer:2 },
      { q:"'Maximum path sum in a binary tree' — approach?", choices:["BFS","Greedy","Bottom-up DFS returning max gain","Top-down DP"], answer:2 },
      { q:"Height of a complete binary tree with n nodes?", choices:["O(n)","O(log n)","O(n log n)","O(1)"], answer:1 },
    ],
  },
  bst: {
    videoId: "f5dU3xoE6ms",
    summary: [
      { heading: "Binary Search Trees — Invariant & Operations",
        body: "A BST maintains the invariant: every node in the left subtree is smaller, and every node in the right subtree is larger. This lets you binary search in O(h) time. For a balanced BST (AVL, Red-Black), h = O(log n); for a degenerate (sorted input) BST, h = O(n).",
        points: ["Search, insert, delete: O(log n) average, O(n) worst","In-order traversal yields sorted output","Successor/predecessor: O(h) by going right then left (or vice versa)","Self-balancing BSTs (AVL, Red-Black): O(log n) guaranteed"] },
      { heading: "BSTs — Validation & Interview Problems",
        body: "Validating a BST is a classic mistake — checking each node against its direct children is wrong. You must pass down valid ranges (min, max) and verify at every node. Most BST problems are cleaner with an in-order traversal approach.",
        points: ["Validate BST: pass (min, max) bounds top-down","Kth smallest: in-order traversal with a counter","BST to sorted doubly linked list: in-order + pointer reassignment","Recover BST (two nodes swapped): find the two violations in in-order traversal"] },
    ],
    flashcards: [
      { q:"BST invariant in one sentence?", a:"Left subtree < node < right subtree at every node." },
      { q:"Why is checking only parent-child insufficient to validate a BST?", a:"A node must be bounded by ALL its ancestors, not just its direct parent." },
      { q:"Find kth smallest in BST — O(h) space approach?", a:"In-order traversal with a counter; stop when counter reaches k." },
      { q:"BST deletion of a node with two children?", a:"Replace with in-order successor (smallest in right subtree), then delete that successor." },
      { q:"Sorted array to balanced BST?", a:"Recursively pick the middle element as the root." },
      { q:"Time complexity of range query [lo, hi] in a balanced BST?", a:"O(log n + k) where k = number of elements in range." },
    ],
    mcqs: [
      { q:"In-order traversal of a BST yields:", choices:["Random order","Sorted descending","Sorted ascending","Level-order"], answer:2 },
      { q:"Worst-case search time in an unbalanced BST?", choices:["O(1)","O(log n)","O(n)","O(n²)"], answer:2 },
      { q:"Correct way to validate a BST?", choices:["Check left < root and right > root at each node","Pass valid (min, max) bounds top-down","Use BFS","Sort and compare"], answer:1 },
    ],
  },
  heap: {
    videoId: "sLDbbHxGVus",
    summary: [
      { heading: "Heaps — Structure & Priority Queue",
        body: "A heap is a complete binary tree satisfying the heap property: min-heap has each parent ≤ children; max-heap has each parent ≥ children. Implemented as an array — parent at i, children at 2i+1 and 2i+2. Core operations: insert O(log n), extract-min/max O(log n), peek O(1).",
        points: ["Build heap from array: O(n) — not O(n log n)","Extract min/max: O(log n) — remove root, sift down","Insert: O(log n) — add to end, bubble up","Heapify (sift down) a subtree: O(log n)"] },
      { heading: "Heaps — Top-K & Streaming Problems",
        body: "A min-heap of size k is the standard solution for 'top-k largest elements': push each element; if the heap exceeds size k, pop the min. The heap always holds the k largest. This gives O(n log k) versus O(n log n) sorting.",
        points: ["Top-k elements: min-heap of size k → O(n log k)","Kth largest: maintain min-heap of size k","Merge k sorted lists: min-heap of (value, list_index) pairs → O(n log k)","Median of data stream: max-heap (lower half) + min-heap (upper half)"] },
    ],
    flashcards: [
      { q:"Min-heap property?", a:"Every parent is ≤ both children. The minimum element is always at the root." },
      { q:"Build a heap from an unsorted array — time complexity?", a:"O(n) — start from last non-leaf and sift down each subtree." },
      { q:"Top-k largest elements using a heap — which heap and complexity?", a:"Min-heap of size k. O(n log k) — for each element, push; if size > k, pop." },
      { q:"Median of a data stream — approach?", a:"Max-heap for lower half, min-heap for upper half. Rebalance to keep sizes differ by ≤ 1." },
      { q:"Heap vs BST for priority queue?", a:"Heap: faster push/pop O(log n), no ordering. BST: O(log n) with full ordering support." },
      { q:"Parent and child index formulas for array-based heap (0-indexed)?", a:"Parent: (i-1)/2. Left child: 2i+1. Right child: 2i+2." },
    ],
    mcqs: [
      { q:"Find the kth largest element in O(n log k) — uses:", choices:["Max-heap of size n","Min-heap of size k","Sort + index","BST"], answer:1 },
      { q:"Building a heap from n elements costs:", choices:["O(n log n)","O(n)","O(log n)","O(n²)"], answer:1 },
      { q:"Merge k sorted arrays of total n elements — optimal time?", choices:["O(n·k)","O(n log k)","O(n log n)","O(n²)"], answer:1 },
    ],
  },
  graph: {
    videoId: "utDu3fFx10I",
    summary: [
      { heading: "Graphs — Representations & Traversals",
        body: "A graph is a set of vertices (nodes) and edges. Directed or undirected; weighted or unweighted; cyclic or acyclic. Choose adjacency list for sparse graphs (space O(V+E)) and adjacency matrix for dense graphs or when edge lookup must be O(1) (space O(V²)).",
        points: ["Adjacency list: O(V+E) space, O(degree) neighbour iteration","Adjacency matrix: O(V²) space, O(1) edge lookup","BFS: shortest path (unweighted), level-order, connected components","DFS: cycle detection, topological sort, strongly connected components"] },
      { heading: "Graphs — Shortest Path & Special Cases",
        body: "For weighted graphs, use Dijkstra (non-negative weights, O((V+E) log V)) or Bellman-Ford (negative weights, O(VE)). For DAGs, topological sort enables O(V+E) shortest/longest path. Union-Find is the go-to for dynamic connectivity.",
        points: ["Dijkstra: greedy + min-heap, non-negative weights only","Bellman-Ford: handles negative edges, detects negative cycles","Topological sort: Kahn's (BFS-based) or DFS post-order","Union-Find: O(α(n)) ≈ O(1) union and find with path compression + rank"] },
    ],
    flashcards: [
      { q:"BFS gives shortest path on which type of graph?", a:"Unweighted graphs only." },
      { q:"Dijkstra's algorithm fails when:", a:"There are negative edge weights." },
      { q:"Topological sort is defined for:", a:"Directed Acyclic Graphs (DAGs) only." },
      { q:"Detect a cycle in a directed graph?", a:"DFS with three states: unvisited, in-stack, done. A back edge (node in stack) = cycle." },
      { q:"Union-Find: what is path compression?", a:"Make every node on the find path point directly to the root — flattens the tree." },
      { q:"Bipartite graph check?", a:"BFS/DFS: 2-colour the graph. If a neighbour has the same colour, it's not bipartite." },
    ],
    mcqs: [
      { q:"Dijkstra uses which data structure for efficiency?", choices:["Stack","Queue","Min-heap / priority queue","Hash map"], answer:2 },
      { q:"Topological sort requires the graph to be:", choices:["Undirected","Weighted","A DAG","Complete"], answer:2 },
      { q:"Number of connected components in an undirected graph — approach?", choices:["Dijkstra","DFS/BFS counting islands","Topological sort","Bellman-Ford"], answer:1 },
    ],
  },
  dp: {
    videoId: "oBt53YbR9Kk",
    summary: [
      { heading: "Dynamic Programming — Overlapping Subproblems & Optimal Substructure",
        body: "DP is memoised recursion. Apply it when a problem has overlapping subproblems (same sub-problems recur) and optimal substructure (optimal solution to the whole contains optimal solutions to sub-problems). Convert recursive solution to iterative tabulation for better constant factors.",
        points: ["Top-down (memoisation): recursion + cache","Bottom-up (tabulation): fill a table iteratively","Identify state variables: what changes between subproblems?","Transition: how does dp[i] relate to dp[i-1], dp[i-2], etc.?"] },
      { heading: "DP — Classic Patterns",
        body: "Most DP problems fall into a handful of patterns. Recognising the pattern determines the state design. 2D DP often reduces to 1D by noting that only the previous row/column is needed.",
        points: ["1D: Fibonacci, climbing stairs, house robber, longest increasing subsequence","2D: edit distance, coin change grid, unique paths, longest common subsequence","Interval DP: matrix chain multiplication, burst balloons","Bitmask DP: travelling salesman, covering subsets"] },
    ],
    flashcards: [
      { q:"Two conditions for DP to apply?", a:"Overlapping subproblems + optimal substructure." },
      { q:"Memoisation vs tabulation?", a:"Memoisation = top-down recursion + cache. Tabulation = bottom-up iterative table." },
      { q:"Longest Common Subsequence — state?", a:"dp[i][j] = LCS length of first i chars of s1 and first j chars of s2." },
      { q:"Coin change (minimum coins) — state transition?", a:"dp[amount] = min(dp[amount - coin] + 1) for each coin ≤ amount." },
      { q:"0/1 Knapsack state?", a:"dp[i][w] = max value using first i items with capacity w." },
      { q:"How to reduce 2D knapsack to 1D?", a:"Iterate capacity in reverse; each row only depends on the previous row." },
    ],
    mcqs: [
      { q:"Longest Increasing Subsequence — optimal time complexity?", choices:["O(n²)","O(n log n)","O(n)","O(2ⁿ)"], answer:1 },
      { q:"DP is NOT applicable when:", choices:["Subproblems overlap","Problem has optimal substructure","Subproblems are independent (no overlap)","Both conditions hold"], answer:2 },
      { q:"Edit distance between two strings of length m and n?", choices:["O(m+n)","O(m·n)","O(m²+n²)","O(2^(m+n))"], answer:1 },
    ],
  },
  bt: {
    videoId: "REOH22Xwdkk",
    summary: [
      { heading: "Backtracking — Explore & Prune",
        body: "Backtracking is a systematic brute-force that builds candidates incrementally and abandons ('backtracks') candidates as soon as it determines they cannot lead to a valid solution. The search space is a tree; pruning cuts branches early.",
        points: ["Base case: candidate is a complete valid solution → record it","Choice: enumerate choices at each step","Constraint: prune before recursing if constraint is violated","Undo: remove last choice after returning from recursion"] },
      { heading: "Backtracking — Classic Problems",
        body: "Backtracking problems typically ask for all valid combinations, permutations, or placements. The time complexity is often O(n! ) or O(2ⁿ) in the worst case, but pruning can dramatically reduce the effective search space.",
        points: ["Subsets / power set: 2ⁿ subsets, O(2ⁿ) time","Permutations: n! permutations, swap-based or boolean visited array","N-Queens: try each column per row, prune with attack checks","Sudoku solver: try 1–9 per empty cell, check row/col/box validity"] },
    ],
    flashcards: [
      { q:"Backtracking template in three steps?", a:"1) Check base case. 2) Loop through choices. 3) Make choice, recurse, undo choice." },
      { q:"Difference between backtracking and DP?", a:"Backtracking enumerates all solutions (no overlapping subproblems). DP memoises overlapping subproblems for optimal value." },
      { q:"Subsets of n elements — how many?", a:"2ⁿ subsets." },
      { q:"How to avoid duplicate subsets in 'subsets II' (array with duplicates)?", a:"Sort the input first; skip duplicates at the same tree level." },
      { q:"N-Queens board size n — pruning check?", a:"Each queen must not share row, column, or diagonal with any previously placed queen." },
      { q:"Combination sum — how to avoid revisiting the same combination?", a:"Pass a start index to the recursive call so each position is only considered forward." },
    ],
    mcqs: [
      { q:"'Generate all permutations of n distinct elements' time complexity?", choices:["O(n²)","O(n log n)","O(n!)","O(2ⁿ)"], answer:2 },
      { q:"The 'undo' step in backtracking is critical because:", choices:["It speeds up the algorithm","It restores the shared state so the next choice starts from a clean slate","It avoids stack overflow","It guarantees sorted output"], answer:1 },
      { q:"Which problem is NOT a classic backtracking problem?", choices:["N-Queens","Sudoku solver","Merge two sorted arrays","Combination sum"], answer:2 },
    ],
  },
  greedy: {
    videoId: "lfQvPHGtu6Q",
    summary: [
      { heading: "Greedy Algorithms — Local Optimal Choices",
        body: "A greedy algorithm makes the locally optimal choice at each step and never reconsiders it. It works when the greedy choice property holds: a locally optimal choice leads to a globally optimal solution. Proving correctness typically uses an exchange argument.",
        points: ["No backtracking — decision is final at each step","Works when greedy choice property + optimal substructure hold","Proof technique: assume exchange argument (swapping greedy choice with any other doesn't improve solution)","Often O(n log n) due to a preliminary sort"] },
      { heading: "Greedy — Classic Problems",
        body: "Activity selection, interval scheduling, Huffman coding, and Dijkstra are greedy. Fractional knapsack is greedy; 0/1 knapsack is not. For interval problems, sorting by end time and greedily selecting non-overlapping intervals is the standard approach.",
        points: ["Activity selection / non-overlapping intervals: sort by end time","Jump game: track the farthest reachable index","Gas station: greedy with running sum check","Huffman encoding: always merge two smallest-frequency nodes"] },
    ],
    flashcards: [
      { q:"Greedy choice property means?", a:"A globally optimal solution can be arrived at by making locally optimal choices." },
      { q:"Fractional knapsack — why greedy works?", a:"You can take fractions, so always taking the highest value-to-weight ratio maximises value." },
      { q:"Non-overlapping intervals — greedy sort key?", a:"Sort by end time (earliest finish first)." },
      { q:"Jump game — greedy approach?", a:"Track the maximum reachable index. At each position, update max reach. If current index > max reach, return false." },
      { q:"When does greedy FAIL for 0/1 knapsack?", a:"You can't take fractions, so the locally optimal ratio item may leave dead capacity — DP is required." },
      { q:"Huffman coding — which structure drives the greedy?", a:"Min-heap: always merge the two nodes with the smallest frequency." },
    ],
    mcqs: [
      { q:"'Minimum number of platforms needed for trains' — greedy approach?", choices:["Sort by duration","Sort arrivals and departures separately, use two pointers","DP on intervals","Backtracking"], answer:1 },
      { q:"Greedy works for fractional knapsack because:", choices:["All weights are equal","You can split items — highest ratio always optimal","DP is too slow","Backtracking is exhaustive"], answer:1 },
      { q:"Activity selection: sort by which key?", choices:["Start time","Duration","End time","Frequency"], answer:2 },
    ],
  },
};


// ─── Aptitude quiz pools — one per sub-cluster (used by AptDiagnostic & ScreenAptTopic) ─
WINNIFY.aptQuiz = {
  quant: [
    { id:"aq1",  q:"If 20% of a number is 50, what is the number?",
      choices:["200","250","150","300"], answer:1 },
    { id:"aq2",  q:"A train 200 m long passes a pole in 10 seconds. What is its speed?",
      choices:["15 m/s","20 m/s","25 m/s","10 m/s"], answer:1 },
    { id:"aq3",  q:"Two pipes fill a tank in 12 and 18 hours. Together, they fill it in:",
      choices:["6 hours","7.2 hours","10 hours","15 hours"], answer:1 },
    { id:"aq4",  q:"A shopkeeper marks up by 25% and offers a 10% discount. Profit %?",
      choices:["12.5%","15%","10%","17.5%"], answer:0 },
    { id:"aq5",  q:"The ratio of A:B = 3:4 and B:C = 2:3. What is A:C?",
      choices:["1:2","3:8","6:8","1:4"], answer:0 },
    { id:"aq6",  q:"In how many ways can 5 books be arranged on a shelf?",
      choices:["25","60","120","720"], answer:2 },
    { id:"aq7",  q:"A and B complete a job in 10 days together. A alone takes 15 days. B alone takes:",
      choices:["20 days","25 days","30 days","35 days"], answer:2 },
    { id:"aq8",  q:"Simple interest on Rs 5000 at 8% for 3 years?",
      choices:["Rs 1000","Rs 1200","Rs 1500","Rs 2400"], answer:1 },
  ],
  logical: [
    { id:"al1",  q:"Find the next term: 2, 6, 12, 20, 30, ?",
      choices:["40","42","44","36"], answer:1 },
    { id:"al2",  q:"If CLOUD → DNQVE, then STORM → ?",
      choices:["TUSPN","UVPSN","TUPSO","TUTOS"], answer:0 },
    { id:"al3",  q:"All dogs are mammals. All mammals are animals. Therefore:",
      choices:["All animals are dogs","All dogs are animals","Some animals are not mammals","None of the above"], answer:1 },
    { id:"al4",  q:"Pointing to a girl, Raj says 'She is the daughter of my father's only son'. How is she related to Raj?",
      choices:["Sister","Niece","Daughter","Cousin"], answer:2 },
    { id:"al5",  q:"6 people sit in a row. A is to the left of B, C is to the right of A, D is between A and C. Who is in the middle?",
      choices:["A","B","C","D"], answer:3 },
    { id:"al6",  q:"Statement: 'All pens are books. Some books are copies.' Conclusion: Some copies are pens?",
      choices:["Definitely true","Definitely false","Cannot be determined","Partially true"], answer:2 },
    { id:"al7",  q:"Mirror image: if a clock shows 9:15 in a mirror, the actual time is:",
      choices:["2:45","3:45","6:45","9:45"], answer:1 },
    { id:"al8",  q:"Series: 1, 4, 9, 16, 25, __ ?",
      choices:["30","36","49","64"], answer:1 },
  ],
  verbal: [
    { id:"av1",  q:"Choose the word most SIMILAR in meaning to 'TENACIOUS':",
      choices:["Weak","Persistent","Careless","Brief"], answer:1 },
    { id:"av2",  q:"Choose the word most OPPOSITE in meaning to 'CONCISE':",
      choices:["Brief","Wordy","Clear","Accurate"], answer:1 },
    { id:"av3",  q:"Select the error in: 'She is one of the students who has submitted their assignments.'",
      choices:["is","one of","has","their"], answer:2 },
    { id:"av4",  q:"Rearrange: [P] declared Q [R] the company bankrupt [S] The court → correct order?",
      choices:["QPRS","SQRP","SPQR","SRQP"], answer:1 },
    { id:"av5",  q:"Fill in: 'The manager was __ at the employee's careless attitude.'",
      choices:["apprehensive","indifferent","infuriated","elated"], answer:2 },
    { id:"av6",  q:"Identify the part with error: 'Neither the manager nor the employees (a) was (b) present at the (c) meeting (d)'.",
      choices:["a","b","c","d"], answer:1 },
    { id:"av7",  q:"Which sentence is grammatically correct?",
      choices:["He don't know the answer","Neither of the answers are correct","The committee has reached its decision","Everyone must bring their own lunch"], answer:2 },
    { id:"av8",  q:"Antonym of 'EPHEMERAL':",
      choices:["Temporary","Permanent","Gradual","Sudden"], answer:1 },
  ],
  di: [
    { id:"ad1",  q:"In a table, Company A earned Rs 120 Cr in Q1 and Rs 90 Cr in Q2. What is the decline %?",
      choices:["20%","25%","30%","33%"], answer:1 },
    { id:"ad2",  q:"A pie chart shows Sales: 30%, Ops: 25%, HR: 15%, Finance: 30%. Total budget Rs 400 Cr. Finance budget?",
      choices:["Rs 80 Cr","Rs 100 Cr","Rs 120 Cr","Rs 150 Cr"], answer:2 },
    { id:"ad3",  q:"Bar chart: Jan: 50, Feb: 60, Mar: 45, Apr: 70. Average of all months?",
      choices:["55","56.25","57","60"], answer:1 },
    { id:"ad4",  q:"A line graph shows production increased from 200 to 350 units over 5 years. CAGR is approximately:",
      choices:["10%","11.8%","15%","20%"], answer:1 },
    { id:"ad5",  q:"From a table: City A population 2M, growth rate 5%. Population after 2 years?",
      choices:["2.1 M","2.2 M","2.205 M","2.25 M"], answer:2 },
    { id:"ad6",  q:"Two companies A and B. A's profit = Rs 50 Cr on revenue Rs 200 Cr. B's profit = Rs 40 Cr on Rs 150 Cr. Which has higher profit margin?",
      choices:["A (25%)","B (26.7%)","Equal","Cannot determine"], answer:1 },
    { id:"ad7",  q:"In a caselet: Out of 500 students, 60% passed Maths, 70% passed English, 40% passed both. Failed both?",
      choices:["100","110","90","120"], answer:1 },
    { id:"ad8",  q:"From a bar chart comparing two years, if Year 1 = 80 and Year 2 = 100, the growth is:",
      choices:["20%","25%","30%","80%"], answer:1 },
  ],
};

// Utility helpers
window.WUTIL = {
  daysLeft(iso) {
    const t = new Date(iso); const n = new Date(); n.setHours(0,0,0,0);
    return Math.round((t - n) / 86400000);
  },
  pct(x) { return Math.round((x || 0) * 100); },
  phaseLabel(p) {
    if (p === "powerplay") return "Powerplay";
    if (p === "acceleration") return "Acceleration";
    return "Final Over";
  },
  phaseTone(p) {
    if (p === "powerplay") return "power";
    if (p === "acceleration") return "accel";
    return "final";
  },
  fmtDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  },
  shortDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  },
};


// ═══════════════════════════════════════════════════════════════════
// FILE: 5b83ac2a.js (5,968 bytes)
// ═══════════════════════════════════════════════════════════════════

// Tiny inline icon set (stroke). All accept {size, className, color}.
const Icon = ({ d, size = 16, className = "", strokeWidth = 1.6, fill = "none", viewBox = "0 0 24 24", children }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke="currentColor"
       strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} className={className}>
    {children || <path d={d} />}
  </svg>
);

const Icons = {
  Home:    (p) => <Icon {...p}><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></Icon>,
  Target:  (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></Icon>,
  Mic:     (p) => <Icon {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></Icon>,
  Book:    (p) => <Icon {...p}><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z"/><path d="M19 19H6a2 2 0 0 0-2 2"/></Icon>,
  Folder:  (p) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></Icon>,
  Plus:    (p) => <Icon {...p}><path d="M12 5v14"/><path d="M5 12h14"/></Icon>,
  Search:  (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></Icon>,
  Bell:    (p) => <Icon {...p}><path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16z"/><path d="M10 20a2 2 0 0 0 4 0"/></Icon>,
  Chevron: (p) => <Icon {...p}><path d="M9 6l6 6-6 6"/></Icon>,
  ChevronL:(p) => <Icon {...p}><path d="M15 6l-6 6 6 6"/></Icon>,
  ChevronD:(p) => <Icon {...p}><path d="M6 9l6 6 6-6"/></Icon>,
  Check:   (p) => <Icon {...p}><path d="M4 12l5 5L20 6"/></Icon>,
  Close:   (p) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18"/></Icon>,
  Calendar:(p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></Icon>,
  Spark:   (p) => <Icon {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3"/></Icon>,
  Flame:   (p) => <Icon {...p}><path d="M12 3c2 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4 1-6 1-8z"/></Icon>,
  Clock:   (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  Upload:  (p) => <Icon {...p}><path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/></Icon>,
  File:    (p) => <Icon {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></Icon>,
  Tree:    (p) => <Icon {...p}><circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="12" r="2"/><path d="M8 6h6a2 2 0 0 1 2 2v2M8 18h6a2 2 0 0 0 2-2v-2"/></Icon>,
  Star:    (p) => <Icon {...p}><path d="M12 3l2.6 5.7L21 9.6l-4.7 4 1.4 6.4L12 17l-5.7 3 1.4-6.4L3 9.6l6.4-.9z"/></Icon>,
  Settings:(p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.4 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.4l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>,
  Trash:   (p) => <Icon {...p}><path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/><path d="M9 7V4h6v3"/></Icon>,
  Edit:    (p) => <Icon {...p}><path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/></Icon>,
  Play:    (p) => <Icon {...p}><path d="M6 4l14 8-14 8z"/></Icon>,
  ArrowR:  (p) => <Icon {...p}><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></Icon>,
  ArrowL:  (p) => <Icon {...p}><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></Icon>,
  Layers:  (p) => <Icon {...p}><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17l9 5 9-5"/></Icon>,
  Grid:    (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Icon>,
  List:    (p) => <Icon {...p}><path d="M4 6h16M4 12h16M4 18h16"/></Icon>,
  Info:    (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></Icon>,
  WiFiOff: (p) => <Icon {...p}><path d="M2 8a17 17 0 0 1 4-2.6"/><path d="M22 8a17 17 0 0 0-7-3.7"/><path d="M5 12a12 12 0 0 1 3-1.7"/><path d="M19 12a12 12 0 0 0-5-1.8"/><path d="M8.5 15.5a6 6 0 0 1 7 0"/><path d="M12 19h.01"/><path d="M3 3l18 18"/></Icon>,
  Refresh: (p) => <Icon {...p}><path d="M4 4v6h6"/><path d="M20 20v-6h-6"/><path d="M4 10a8 8 0 0 1 14-3"/><path d="M20 14a8 8 0 0 1-14 3"/></Icon>,
  Compass: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M16 8l-2 6-6 2 2-6z"/></Icon>,
  Trophy:  (p) => <Icon {...p}><path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M6 4H4v2a3 3 0 0 0 4 3M18 4h2v2a3 3 0 0 1-4 3"/><path d="M9 14h6l-1 4h-4z"/><path d="M8 22h8"/></Icon>,
  Sparkle: (p) => <Icon {...p}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 16l.7 2L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-1z"/></Icon>,
  Cpu:     (p) => <Icon {...p}><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3"/></Icon>,
  Brain:   (p) => <Icon {...p}><path d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5 3 3 0 0 0 0 4 3 3 0 0 0 2 4 3 3 0 0 0 3 0 3 3 0 0 0 3-2"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1 0 4 3 3 0 0 1-2 4 3 3 0 0 1-3 0 3 3 0 0 1-3-2"/><path d="M12 5v14"/></Icon>,
  Stack:   (p) => <Icon {...p}><rect x="3" y="3" width="18" height="5" rx="1"/><rect x="3" y="10" width="18" height="5" rx="1"/><rect x="3" y="17" width="18" height="4" rx="1"/></Icon>,
  Lightning:(p) => <Icon {...p}><path d="M13 3L4 14h7l-1 7 9-11h-7z"/></Icon>,
};

window.Icons = Icons;


// ═══════════════════════════════════════════════════════════════════
// FILE: 008a4e42.js (27,248 bytes)
// ═══════════════════════════════════════════════════════════════════

// Shared UI primitives used everywhere
const { useState, useEffect, useMemo, useRef, useCallback, useContext, createContext } = React;

// ───────────────────────────────────────────────────────────────────────────
// App state context
// ───────────────────────────────────────────────────────────────────────────
const AppCtx = createContext(null);
window.AppCtx = AppCtx;

function useApp() { return useContext(AppCtx); }
window.useApp = useApp;

// ───────────────────────────────────────────────────────────────────────────
// Sidebar
// ───────────────────────────────────────────────────────────────────────────
function Sidebar() {
  const { route, go, user } = useApp();
  const active = route.screen.split(":")[0];
  const item = (key, label, ico) => (
    <button className={active === key || (key === "slog" && route.screen.startsWith("slog")) ? "active" : ""}
            onClick={() => go(key === "slog" ? "slog:list" : key)}>
      <span className="nav-ico">{ico}</span>
      <span>{label}</span>
    </button>
  );
  return (
    <aside className="sidebar">
      <div className="brand" style={{padding: '10px 10px 18px', gap: 0}}>
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARIAAACPCAYAAAA2uFQKAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFxEAABcRAcom8z8AADfASURBVHhe7X0HdF3FtbYgiZuscqt0JbmBwbiqXFX3kIQkL3kJBMgKLwVCC6RnvZcCCXECvNi4Yce2em+25CYbd9mWXEQJYLCpJhgX3GRbtnqzrfm/b+acKxlsSh7w1vrf/taaNefee/bMnjl7f7NnzpxzgwQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBJ8UlAq6yjoUXAmnMt2+ljzPW22F3v3txUglLuTO/W1MhZ79ncXut1sLIp8+kjlqvCXyqeHgwhGPtpR4D7Yui97fXhGzv415eeT+thKP1q0133v0TE70POv0IOg4t7XQ8y6S0bfEgcTcub+9NGJ/R/mQw23l1yRap2vMCJpx9btLri9sL/IcaC107W8ttNpa4EJ70fYi1zuvzJz+N+v0j4zG/NAVbYXOg0YXz/5W6NxW6NjfWgCd8h37W3Icb7XkeCOs0zXm/WbewOPZ4/PaS9wHte7FoUiD0dZQ6AXZ0uh36nP8/22d/pHRWhRd3lbsO9Ba4tvfWoZUgr7DdWVbW/Jdbzfn+Z6prAz6nHW6RvfSkIkdZd7D7Ti/rRx2UIa+KAmHTOj+lsIw6BW+vz5j+OHXnpg4xRLRoJO1FkbWtZX63m4ri4DO6MdSJ3ImtAHtYmrTxyjP+szUUoyc7UTehgS7e5P1dpTjepdCh6KIf7YXRb44Y1rN58/lRS9qKYw8wr5tL3a9RX3aUUdHufetNp5bEvF2W4l7NzT6WE5/JmtkRWvxkEMdsLWOZZGwN9qNd38X8vYSfC6KPthcNmyhdbrgSngw8bYfN2REK7XMqXqWOtXFpQ51sTxcXSgPUxfKwvWxWu5S53IjfmuJfCqovP32z53KDK+/UDJYdZeGqAtLQ1UPdLpYgVTugG7hqqvI2314bvy3YCxwgg39W3PdK9UK6LoUupaHIoWo82Um8bNa5YacL2D4Q4NmOu4cdefwxmzHMUWZMkuuDIl1Il2EbFeJs7OpMAr1fBTMuBraf64jL+QFVcG6Q63Ue8zyLxahPYUDoy0hjU0/T45tyY9GO8OQ0I4KJByfZ98jKXzuLIlsPJ079EuWyAfCNzjLneB57Nqz+ZEHVCWvnQN9Y/rnPPqT5Zp+dJ5SlxCJ6nd6ifdmtRLnL8P1r0R/o997KnBMvSB/Ef3UXTRUvTYr8euWUNBXgn4Q/Mf4Lw5rzws9w/ou4Nzz0J9t0HUuY53WdUH9vKbnl5prw+/Y3+fLgtE/dt+jj6CjtkFce4X6zxe5Wr4x5LdTFt52U3VPmRe/o12lvHboU1y/i+yrUnxXAv3yQ8635AXfYan3IfiD48f+r/+uOct7VC11oRwXrgFShckvMpW7oYNPnckbM8YSElwOW5J8v18ee03Pa/dHqG5cmPaCMNVRFKbaAwnfFYYoBQNoznHPscQ+caxIHHp/7Tdc+08vGdTdnDNQNeYMUE25A1RrwWCtR0dxuOpGairynuL5myc7M9YneA8ffiSspauM5zCFqLbCwUgmby8cpPXuzg8PEEnOuOv/vD7Rd+JsRviFDsh0BM4NQduDcRysWpG6SpEX+FoOzElLskSviIzY8XetnBD9dv3ssI4ukKDRw04sO1S14bsO9G1PoTNAJJVjYn7x1NSo+tZc1k25ULTTJJZBnSjfhc9dRcFHIT/cEr0i8iaM/WZF/LDT9Ytc5zuLWYa5fiy7jZ/R5k44XEte+On7/TMGUSYz4QZf6VjfurpbHSe74NQ8v6MYfV6C64+8HXkHZCjXWhCjXp0d/zXKbfhaUP+VCd7nq5IiDp9bPOhiR/Eg03bqDp1ZH6IryOOaMNf18zd8hh66b9Dn7czZP/p68DvIar1N/YjkLq5IGnKuaPyIztNPOHq6S9FHLAfn6XYVoJ48lJcXrBRsuC3fu27kyIX9qeMHoSR5+Nw99w9X7ZBtzUHCdWhDmR1FDrTViT4AkS33gggjP3ZE+H8O21M8v9+V5FUvftepL4S+qDQkGh+Muy1/EIxnIDoYvxU71Olc1yhL9BPD07fFDNw2yXXm2B/DVGfpQNWcN0g1ZYNMsvurJpBKK/RqzcdoBYN+/tHEUso89+Wwqj1Tver4n3HhS2wCMAZK8qG+rUg9GOXa8wcHiKQqwTvrhUke1ZRJ4+09z6RB+IwEAmI5F8oHq9NZnmWW6BWxJH7C8t1pQ9SZ2XQ26IIyWF4b9aBOJATtJCQSRiRqQFDQq/2eivPlP3tTJPoY57KNWgejk5ZjOej/lvyB6gKctCHLU2JVeUWsTYy8dffECHXm73QytCMf7UTfaV2ggyGSENWQ7W66Y1zBDZTJSBk1fHWC69U9t4EwStkHpg+NLVAOfYi8Q5NCtPrnwjGaSGqmBQ3YmuporJ3kVs3pIBH0G0mYSRMFCcNO/KzLMjqYRHtDQs7rp68HZUkMTCQTEFJLnktVT4tWNSlh6oWbHaoD7ekk8fB3tK8lG32UC73zKMfoKUKdyB7xTep4JSydHHX9c9+OON6dFw4Cgc4gkpZcJNobcpLYeUTj7SWeo2fzhsdaYoIr4eHrkuJWxUUe35rsUfWzcIG0U9KYeEGZ0ymMgXTiojbnOT/xEG9GbMrw6inetuOPYgQqY110nkGoC1FJHoklGMaE0QYh+bElI2+izM7pzjXPTvGqo5pILB3piDREJH0MB+1BtHJ0QVRgWrA6MXLmc5M9qjmTo6eRM2TZW4ZNBPzcUzJAtRQM/MAR6cnYsS9uT41Sp57gSA5ZOpRdHpzHOBeMkyNt9sAYykwLunPAan905TNf9aE+EDUcoRWEYevAXOuFNuhj3Z5wdSrX9ytd6RVQHj/s7p0Tvarh73Aq6KJJCs4WaBd060CEUJ/p7fyPhDztbEVf9g/dlOLet++7IHKQpyaSPjag9UEb6PCdJT51cPH1ASLZPtHVuGOyWzVlcKCBjN3/JAcSmc4NcRgysQiDJKK/5++mbH0u+4kJRNHGCE1HQ66G9Tf6frdjorOnNtWtDv8eEVoxZEA2JIHmTPQf7EMTD6KJrnKPaiuN2VNTM+3z1PNyWD8xZua7f/DqaIvk05aPaAtERBIhKbVgMON0q63clWuJCD4Mm1M8z21DVHLo92T6gWZkofFqozDG14LjToysZwucmZbYB4DrF+pqJGvRizk/Xx5rJvkef/F7iIj6GCHrb4aDNXNEhpF0gyyOLfG+tvpX03R4v2mKc+3OiR717p/hvCWWA2pdKYsEB2pGulg6WP3jT1xTMVie4Jv7LIikKQPGVzQARkTZXnndXvsY8p3IG7O9zW/O90+yingfZo67YfemJJ86CSJpgy4tVhktlgNqfeg0MPyXH7t+BPuCRLIiHkSCiKSdBIJ2GuIwstSrhXroBCJFOXrqU+Rub84YeUUyL4wf8pMdmkjgrHA29gNJ2ZRjdGtHX57M8HZ9Pzb7Fso8OS12+AYQyV4QSQeI10QklozWyfQP+6azKOISIqmd7GzcNRVEkkn9rP4rxPk6x2deS7RdEwuvr0Uimlw0YdifLTJhO/sQiZ6e5Yc1KjXt81tSHSt2JLvV9ilOkAeJBGUzmtDRHKddIJLCcNgDiKHY1dG2LPSy09Li1JiRNd/2nGrJ4nkg9yJEHkitICJGYiyvHe09le1pf33RDS5LTPBhWOmP/k11ikftvsmFi0bnokHA0WgIdAQaBb7r5ly3JPwVS+yyaMjx/aUhM/LFM1kRu5vy3DVNBc7acznuXWcy3btOZEfAid6PmmkRK/55j1O1YzTURoe6aPB0RJIJP/csC1ZNRYMXWSJBa9PC1mxPwej0CEJuTIfs0ZYOZxwADgT5CyCSw7OHftlIqauXjL+u9GmE4o0cxYotOdahZU0ZdjKkAhLj2lGZ84UjOalOU86l+Mvo6195yo9w+gk4gE0k0EMTCZxDt0lHJCHqnTmRwygzJuj2fhVxvmXP3BSBOgYECIROiwjISlbfawekPlyERlRY5NygZgT105W/Bzlxwx6swdQtQCRwjBYrwmhBGTaRnEj3dP8oLuM2yvwpZep1a5Nc+17+brjqLENdrJcpQEA8ppMjmin2gkiuDRDJtkmOxp3TQSRZcD7UZ4jEthujt4lOQMoou7O8bwIxIQLVx8g7kHfABjpwHte9OhERqIpQLqI2KxX0hYrxweM3JrraNsQ71Rv3h6kutENPvzl1JAlwvYQ5PneDgM7lhlVQz/di6aSo0n/+l0O1Y9pL8mnDNEanIuaUH6wXcE9mD51hiQg+CnZMcQzZmuJUWye7VMMCRCTaee1EQzKO1gkiachxn6ubMWWqJRrAjJHO0IrJ3juac9wvqRW8AxEKI0AOQ2BSS0NUY05osnV6ADlTrxu95UbPgSbL8GmAdCASQgsMogXza4bizXmhjQcyYgLyq5LD1lQzivqTFZFYo6AZxY0DMecayb5Hx/2bkSKRXFtal8ZQnJEXF3NNO1soT1mbQHUZxiE4x1eVTnV0yfXLTTmX4pEbrt2zNuFSItGEBoM07SBBwtEwxQBBW4utM66ujPUVPk0iIXkjBfobOugytCNb30EfPdWAYyo4W3Omc+kL99//BVNWL4oThtxVM8me2rAN7E+cz/K0U6Pd+J5Eck/i379DmRmJidesSnTve+n29xCJbgP7FGVQF8h3FHtAJMN610gmhjXuQETSqImE/Ub9e5OZ3uAYbT/0hzBEvUjIj/whVKejD4eqdx+yEo6PPByuDj2Ecx4KV+887Og4l+0oqU8Pz1RZQbqtq/3Op2qSXOrpG53q3ALYBklKr6cYQtHXnVO5fJBJiVsdzx16K+VsFKbGRD99s/dEcxZsi+flGSJpZSIRIfEuU1NBxOHn50391Lc7/H+Fe2JSnflxQ9+sTnSp1+5HaFjMEdI4mDFiGgOdYrDqWYqRoMzxmCUawLqk0AV7vutCdMB5Ko0YISnDxhJ8xvF5OPThDN9T1ukBPDXN8b0dX4Jj59BpaYgkADoeSSRUp06u0pc7D1siGqtTwqq2+EkknEfT+aErjdfSV4/myDm1efNvJhQn8uKGZtZNdKlGTm1IJIwA3uPEphwrWqFOSJ1wvqbckNYD86IvMUziL2Ovrd2Q6FP1s2HMXFOB4xgCsZ0R7UHel0ju9/kHVcRFr939FUMkrXnUAwn1kgxtYuPn3jbx2OjVhLD8n7Ov/bZWoA+K42N+XDOZi62oC6Sh2wf97URC4dpJfZaz/cHUhdMo8/iUG3yrE5wvvGwTCaMP1KGnJVYb2J8mInGrI32IpDqNRMKpIs/v0/dajn0HOdTXmBXSs26cq2XtGHf7utHurvVjXa2bx7naquPcrdXx7uat8Z7mrQnu1q3x7rbqBHfL5nhvx8YE75HK2y/d67Im3jthR6qzfleSW715H6ZiHHxgL4b8LNsBsZA8u0rC1OlsX/UL9/sDhLtxetTMk39F5E37ygXB5qBteYzaYKvFiEhgb91l9AHnPZaI4ONgfXLEz2uTPOoftzsw7zTGqhOMyrC8GZXOY3Q+OH/IipFBGy65vVaT6t3wzr1OHa7qsNYyQntOzJC8s9T1T+v0ADLjh8586UdOGNoAfYemGQ6lR0OLSFp5Ycsd6mDGdZfcsXgqLaxqa2KEOvRHQySXOJvWlfUbIjkUWGxVV2XGXpO3CxGJntqASNoChInPgVDetF2TKVMeHJC3okF2zVmDut6aNfIrpjyD2XHX7alJi1Gn5oA8SyGHem3ns0d2HpNIGpZEDaHMncOmDaiIj1q9ixFJXn/0OXS36mM/68hK6wN5frZ14XfIuXbTkht8qqs4YpxWwkJGwjW/qg0QiSWPRBKx8w5M6c5mhTX9etL8sZRZmDw+pirB+dJLt8GBSg2J2HoHpig6gVBLnepIZmRvRJLmbNxJIknndbfthe1lGSbpKU9RcMOqL93gundo8ogfxaQmz7hmgve3Q+KjfhOTGr14jGfwzKFDHb++4QbfT4fHD5t7vd/933Fxnp9ff9MN3DzIuvpiZ2rYb3amulQtprYn/5sL3NSZ+pGoGZVgILNTvvPCwZmjplOuYsqI5J03R1xozTfRB6OWZr24isToBGTSBRJpLHTUvmBFQIKPiZIEb+pav7t+e7JHnXiMi10crWEYXMiCI3Elu0mvZgerhmzn+SOLYgJhX+Uk3+Sa6e6GxifpnNaoqh3COCFXwDtgiOdy3O11j04O3Jbb8DVnaFWKp/7th0JUU34/dQ5kwqT3kFCOhgjiOo9pRWOZ85Jp0ZbJYVW1SRHqMIiksy+R0PDpBJYzcnPbC3+aEKizODZqwa5UEEm6TSSQY9JkYuVst/6ex2hHHqIMEEkziKQdjnJioe/5ebf9ZqBVZNDchFF7ayeSSKypjW4/6qe8rQ/K7huRTAORLIvzrewbkZi6jaxpA4+NvI5SbJ3QNzz/AvrmTEb0jrL/eNChFQHS40b9smaSD1MbOi/LxLnQwcibnIui9emurgcmPqkXobMmXTMURLKPRMK1it5IxMhqIuGoD7kuThcyY3rXSEAku0AkjQEiMbqb62COOf1AWWfs6cn/FCoo6OptSa7D2xLd6h83c7+HTSKs0yYQEEohNxk61IklwzdSbnmSd8nB33FfDH8zvzMSac3nLWaQCRI3650rcN2sKxL8a9icErp1a6JHvf0b3qOncRuDJRGYY9PZ3BhW+3CqXvEndk113/3CV7xgd+MIZtRkgizIR38Ped6+PZ0f86QlFjQvNjb5mX/zXjyFKUEjnPVc9kBEJdyIBtJCvYxOuOh2Ns+x/eCTw8ItMY2ayY6qupRIdcSa2hgyMEkTEJ0Gic72xuOjvmqJBRXGDVm8K8Wjzi3hojLJkroZeRKAvhWr24Ccbcb3zWyHTjwH7S/DiJYfHmjHrISxO6rTotWJWRjVMC0MEIkmAxq3diRNJMcW+IZSxh/k/0JFrG/pbmuNpLffTN2GiPDZ0sH+zUQmlsPCcbpKnJimDHlIKwKU+IfdsT2tl0hsMqeMboMmkmBEJCFnfz3lcR9llky5dkiV37n3ZRKJ3kdC4jA6kxw0oUCORMI1kr5Tm22piEim9BKJ3fe2POXMLfHBnxiREKsSor65HRH0xniXOsTbwTqSAploIrFzTrPDYLMe9ey9I2Zu/3fHCbN+AtvAgGgWoUEkXGTFuT1LYUul3p2Vv789zKpG8K9gcex1f9qEi7Pjyy7VAqfWRg0SaKGj0UDQ8fbc88Cia54xUjMGLBp33do37uHFoNHSEY0BBZwAOY34Ii72ycXRlRhTtEEtTxq25s27MKKUs9xgTR6c3jA1IgLgztYLkGnKD5upq+qDmqlhVU+nkki4z8DWzzivGblNfh4Rybvzo2+0xILyJgzLrENI3AgiaSeRsG0WkegydG5/Z9pO59COgWma3kkJ47tY5lDnMmI0mf5x7NjaKn+kOvY3HXEY57XLo5xOhkgaljj01MZEJFEr626KxLmY2kDGEJhVv32M+gPREUmO5aA8ewTmrdLOwvALB+dep7eFlycPu2MHI5JFcBJGJLrvg0HKJEQeG4c/le5qvz9pgZ7yzQWRrCaR3M4NaaiDEYhOqNciA/Yrv+ss9r6PSHb1IRLqrPtfyxh5bhhsLwn+RIkky+8IWx3v3LY13q3qvgp7zcC0EgTZl0j0vh0k7sqtf8yrjj0K0kA7TPRB+yCZmMiEO2g7SpwdHeXBAVsR/IvIGZcSsT7Jfb46zaXOLqTBwqhIBjRsGgaNHReCd29aC8MPgxA+vzItwrvS77l46K8IYUs4svaebyez3mCciSNCY765v78p1bPtwM8ceu+CDr+RmnFOE8iL05vm3H7qZHpo53OPj79dK9gHWzG12aWJxF4jQYLR0nhpyMZIgg2RzOklkqLYoem8a9OYDiKx10gswzfJKkuXZ0hBL3yiPOPQPAfOC8NryHK8fnRViOvXI8auqoyFgz1OskEfWPK2I9nTBBKAvUYSFHT755bH+Yqf1kQCGYuwGf0ZIrISiQT1204dcHC2kdcG+cVShOb5nlrutSj3j7itdmKUaljIPjXlkUTsaQ37ph3fn84Ib70v5ckUarLAmtrsvT0c14LX2NSjddd9wmtniKSjiLd/+xAJpja7p3jNGgnXZCCj16l0bj5z6gFSa2wp7P/F9iLH5Ob88Ckmuae0lzD5prQvRbLy7qXuKd3Lw6d0LO0/vWlFv+tY1+VQEuu8ZbPf2bklzqMO/KdDL4jrnbIkEi5wW4TC405Eplyr4UBIotEDjs4NkXSWMlr21aqP+cCf4DKYMWzYgGXx3tptyW716o9xYUqtEZtOYTsRDRufG5aEnt/z5xvu+KNn7LXrp7h7Ts7EBbTu9mhD1AZoOQANSzsk96IMUm8vuOZL84YPn7YixdlydgkMVO+zoOHiohbxwpoL3VmsZd6w1LsEmyeFVe1I4RoJb/9azkvjRTnagLXxc3E4WO18yG/NedVV2bHD8+omGiLRt1zZPu20luGzHCROyc4sokPhM6ZdPJdEosN+zvlBiF04/1zm4Or/GjV+fcUEjzr6N/zOPqADM+F340zQCbpxh+kBa2rD27+Y2hQ985VIOLtZgzFTSMjZOmlZ1AEnPf13yMNReR2447cZRGsTOzd19fDhtWXBxcXx0bc+heiofi51NCTSzLUtXju2C2V2oMyGrNCm+/1z9Rb52UljIhGRPL/3u4ZIuCFRt5P9SR2QdNs1kXjUwYV9iGSio3H39AjVqO/aWG3W15K6W9cfiTqqZdBzmXn4j/ry4Ts+KKoqXEpV8uE4JObL+R1+Ww0dyvsVsK4rYX2SJ3M3pqo7p3lU0xJGjJDRpG8II0AoWifaBHN+FwI9YWc4j8fdpU51Ort3wBH8D7E5JeKuHcke9dzNThg1Dcg4mRmZaJT9VWNWf9UNI2nKCZ5Vfr139ss/5GYehOc0HPtcHF+S68S7DQPVu3/3bC2K9d63nvtWsrkDFeXiAvPC8rkOJk4juD5ycNHIbEu1S7AhLaxqe0qkOvwIwlK9jd3UQQKyR1AdkaCclx8zG6j0XZvx1xRpIllCJzTkYJzWdn4cI28Aibz8Y+iiCQRtw/faaWmMkGnJGYSoiceD1YYfDVcrY12qfjYchqTGNtOBqA/P14uNZqS010iIirjIrDoSCfq0VT/jYelCnXA+jZ+bx47Pgi53oYy8/iAZ3uHhOcZJtcMzwXlAmhf2/MxVv2y8Sx2fTSdB/SQSlodzjHPTqU1E8uOExToieWLiqKiqROeLemrDiMQ6z26DTcpsu4lI+mxIm4ipzXREJBaR9LbbkkUe0BPXV0cMvM76s+kT5vZOV725jAugcO4eTGsbcwfms64rYcPEIdfWprrrecfx9XsQ3aKvzTNiptzAzlnWh6SjENRjT9NbuN8EEd3ZvPAcq0jBJ4E18aEj1yU69tekutXRvzAcpCPBQOhocCozcg7AlGGQeusJ37MrkyIPvH4vphfllmFbiUZkDNI4oG3IdIymnNDG3LGRO5+/b7A6px0SUxmMwnoOr88zI3g3d0KWDL7sdvD1mNpsS/apg1wjQeRiRlvqaDkiDImOxKnNgcDOVt6dil6kiSQD7Srsb7WN9VJn6IBEPc+lB6vtkx3qzQcxSkNn3S5OD6Anbx3zdnVjFs7nFm2kf9zmVCfhvO16jYERkmkHSaSFRAKDpvHaO1u5RlIe51u568uY2qA/W9GvfaeRdALdloL+6vjMgWpzCnT5OZys2Ohs+pY6WTLIORVtzhqkar8Rrk7MoXOiXrvv2bckSsh0ILI5leFouytx4UTq8tu4lOtWJbpe3ftdLjbaZUMGuekXc8zvubP1SB8i2Qoi2R0gkl79dZ/qcvC9bg8TScQQiF7jsfsIyRAP9cQgwrsoyC9gIGnKG/ihDr4hOWpGXWqE2pbqUWfm8eFClKPLZp8jJ5mwHhKMlbN8Tms6uOZV7Gg4nRv1iT+M+n8eW1KcVbX67g1XvWHknAJg9G62FgV16Asj5UV4AaPY6QUwYhKONSIZo4FB0sGtz8a4bOMOUXWIeA7MIFEZ8tAhO43dcgw9auZ6zxwsGHXZR+c3gEgYkRz8EyMSK5KgI9HZWQ5vWyMnkbw1a0Rg38eyBN+83RM9FpGwXcYJmQcMHw7BOf/u6aFq+yQQxKM0QE4nSCL91dn0/qopuz9IhNMLOAfq4LMm/F2vkbAc7VTQwXIUJm6R710jCQpaHh+ZpddISCSczoBItO7o7yZEKbqOvH460qmZFq62QRd9a74PuZsIxkoog/3GqRCnGloH3d+mXSRJTSTo87Mg8/smLryWesxMiR2+xu96xTxrY4hfT03t/tDXzlxHvdia2YdIJjkQkVy6Ic3UZ5GDXQZSL4mQUCyntj4HnF47OW/H8v0kYSzrQ5/tKogNC1+b6H2r2u9RL3zHaYhft4Flox70gc7teqxbv8z5molT2cN+bRUl+CRROD76V5uS3GoH550YffWzIJzHM+cCJXMYJR85f+lu3ounEeE8kgfDejoT0lk6q16/MMZFw+Ko2I5I493HQhCy4wJDLjAa0ehxsflZVeK4JPRhS6X3YfNkR9WOVExt/ggDwSgdmNpoRyQpmejifEmwOjw7KhCRFMYPWbKbz9rYO1u1M0KGTgYdOBWhM55JH9y1PCXqRLXfoWq/GK7q56C87C9Arp9qwtROTzEgY0jSanOg/ewLttV2JmPAfJz/TLZTP/3LFyFxjYR3bdpQVpsmEuiAfiaJmFcooA5MGQ/Ndqh1U6PV9olO9dy3HIg6eMeJepukR3y0wUxDSZCsH2VZOlE/3fdWTvJmRPKT1Az9ICLv2lT5XS/bd20MEbAt0NvuV6utnSWXEolZI/GoZntqox2Y9Rs5lmEiDxIJvgPZaMcm6fCz7hu7r0AizNFPzSASPsbfUhh62ante7Hc731gS7JbbUlhJM1Nalb9um6SiE0gyPXUmVvoQ1RjQfibx7Icgemm4BNEzTTP4K0prtatqR51ei4NgORhnMSeCtifG+iQPIYR6cRzYcAkjOd/GKLq55lR0l581WSEnHtL9G5RXR6/ZzSBnA7BcnNCevb/fchdlkrvAzek7UQ4y8VWvUZCWZZjEwmdEjl34p7NDA88G1SUELNwtzW14d0Luz22s9CoO41RH8wfH3lntT+0c2OsUz2D6UJTZj+QCaMy0x/mmSS2x0ooT5dhOUkviRhCMYt/vc/aVMT7isyzNiQmqw3Qm4upZoo2UHWhbScyHPtzkobn1qY5LmzEqPvc7U6jg9adfWvy3q3+SJYupk32Z+qDAQCR4plMR8t9qfMTqMmTKaOGVyUgIrHXSHh9te7sE5PrenAdNZH0mdqA3DSR6IhEn4e2ah1Mf9rlMGlS0dEBju0+sshb50yYkpJEGJVwM1l7YdgS1vVh4I2CzSnu1TtTPGqP7h/Ww2STCHKSil47CdGpqyRUNRcO/r1VhOCThgoKumpTcnjFtqQI9coPeVvNOI6e4mgDN0asnxS2IhRNMvqYBoMcRrdlikPt/415OlcbE2SM8eN3XQ6SdhqTmpnwuRv1ncke/LKlzmWxhREJpjaHeNeGEYkuwyIQPUWgY5m7Ns3ZvS82qkx0z9qtb/9a+mo9eD6dgDqa52qacwYf4/kbE0N+tRXRWbXfpQ7/Nlh1lvaz+sJM8zSBILejNOO0xqnsKYEZpRHpaCPuu7M1epUmEmsBtUXfAja6m34eiL4YqOozHIfmP/idazYnh87lE8+bMO08gkiss8Ra40HSUaF2YB4joW2GSFAe+15/Z3KukTRkhjfflbpI707mztY1ia59fNaGRGKmeibZ6yo8Zps63kMkZrGVW+QNQWhZ6kR5fNYPCiKnU3P7PfeU6LyUdmHnaEtpiH7at6MsVHWVh+uNdnz9YUP24A9cbO2LgsRh39uSGnmhJhkDzEMOvVaioypNIkiIdHg7mNMnvsmuIde9zxIVfFrYmuy6eUeSVz33bRdG3v569DVPqJpEo6URG/KA4XDhEkanR3mElY0LQ1T1JId65Sd0dOscytg5ZbXBGQc0o5jJedv3eNbgLZYql8VmRCQ7Urzm9i/KJ7nRAfWeCSQ7uuHO1rN9IpIVIJK6tIhL79rgfO0AOopB/Rg1UY4mEqIm1Zn1bJpT7UAkc/JxGD/vUFFv9gfbgKSnJjwmkbB9dDztTDBkjoQWkdgb0ngHaXl8VG5fItGEYOmgiQ2pG4R8Mt15OP2B7+vFwPXJnopavvJhuludmYvpko72qIfVhj79aBOJ+Y66mN/0Ymu6s/0ef45+BmXBpDFD1yY69+qIxF5sxfkkEJ0oyxEe+XtfI7A9zdFYN839HiIx8ibiQI76+FDmnpsdas+3XOrFbznVnn9HwvEe2NfLSC/d4lZ7v+NSr97mVq9819X5xs89v23I90w8khM6knV9NKir1yV5ttUgUn3zQRfaaQg8QCZWJMJjvhLjnfThKy1BwaeF7PHRqWv8Eee2gkyOPIzRgiMxHOd9ZKKNFMckFE0kA9SFpQMRiYS/sjXF2br7RpdqgtNyy719rnE065jOp4+ZaHycCgVjDh9yxY1IxCYQiR55AkRiHLDvdnYu3l7ACHh6YcQXLbGgNcnumU9P4r4H6MC2gEQ0oelIBjlk6Gj4/qglEvTs5H5jnpvseGcXooHnvs1XUvbDeXB+EADr0u1AJGXI0SIQ3RbLkDWRYIrYh0j0+0gSfMvqNJEYPUwy+ut+wXEXiOL4YtfBJ+82RLIiyT316cnOczugyz/giB1WXxpShjzqN9EVysFnXZZNlJZeHSjzbGbouZ+kPKkXsmeBSKr8zpfsiMRcG5N0GVa5lDU7W/sSibOxLjC1oSzaap3LaIY512Qas4M7n4p15VaNduWsGuPKXXWDJ3f1aG/hytHugqqx3sLVY32VK8dFVVVNiKra4I8sKEu6No11fFzMjx09dgNs9o0HEJGw/9HnJiIxJKIjEhIJoqB3loxYaokJPk1sTIpYUZPoVW/9gm+qQsShScAk+5g5DUYbMxOOL5ZjFF00+IHtaa5/1k7yqrMLOAqac/vK6VwbGxLLYMJ5p/PCW9/KjrYWJS+PDWmhVXzW4vDDvN1nohEdldD44YD2Gkk3wtsTi8L0yEusTIycuXui1zxro4kEcjrB8JlQDomkJbeXSIjNae6p1amurg1xbvXynaE4n0RilYGkSYTt0P1gOS1GZD0aWqMiw+sz1qsW9WJrnK84QCSMSLTD99EFiURycrEbRPJA4PbktknOH21HGzYnudT+n4XpKFDL6QQ5XT+OmffRqzci4dO/oY13pSzQZD0necKIqiTXK333kZioxCYjHpNwSUJ8H8mlU5u6L3Jqg99JwIH6rYRySCTN+cFnPviJWr5Bb8bn2S/WF/8SNk5x+9YleXve/JnTEIlelwKZINdJRyaY2oBIjmQNLbTEBJ8m1vmdv9jIuzc39q4p6Ls2mMZoEqADaUKAwVnGfL5kIOe1L5f/ckTEmlTv6ztBJHqjEIiIMoY8TDnmLhANnAZnDL1nabA6tsQ321Lhilg/Kaxqe7LXrJHoDWk0ekMo+o4NEo95+/f0IleASFYkemeRSPTUxiISnqedhY6sHY1rLcGXEAlRneJYvC3RpdbHu9WhP3BagTbpMpCYQ7bXcW1HYlhtkt4oZd214RpJRVzMCj60p+8AUQ8rMtHTm75EssTzzqJ7771eKwH8YuTI/lV+98rtydTFpfvAXjg2hMr6cWzpo4mSuvB3tg/nns0ObnggbY6X5ekt8omuvXxDWgffmWvrz2uC3JAJ20UiufR9JNwiX8c3pGWSSHA+rqVZQLXkkMy7cT/ZZ22uBBLJ+uSInv2/tF7difp1rq+BRSRFJJIQ1VDolf+q+SyQ5fd/YVOq68xmkEkD94pwHYTO38dQ9YVioiPi+4sc0YqC9WPblUlRd9WmetQz/+6Gs/cSiU0i9h0cbbAwQkYkF0AkLeXBP9MKfADWp3FDGubrfzQObciAqXfBlaMj30eCKUVgsRURyRN2RKIjGJtIaPQcTaFDpyYSLrZe+tzFrvFBjjV+585qv1vtvNGpGhcPgFPy1i0JFW3Q5SChDHt9wRgxDdgQyRsz7X0x939haVz00rqbvHpnawu3vNPhLSLROcrTU5t0z8H0B+6+ZMPU6pT+w9f6w/dX+51q900O1ZTFa0E5K6EtJjIy7WMf20TbXkwiGXz2Z/FPRLGsfN7+TXLt5RvSOkpNWwwJ2KRMXUx/diIiOd6HSLZPcjTu/iLvguF3XYepkzIm8bqyLz7Zp3+vBE0kKSCSXzn1FFmTuJ3b16KI0+FQdTj9Gv2PBIJPGXypTKU/cm91olu9eIfDbISCkegpCo1TGxyNlt8Zp+koDlEtRa7/pPzKxNCkqgTnxe2YQ5+aw5HJnh4Zww4ky/i6EM3Up4e/9vgt9+nH2z8IGxCRbEv2YDSGg1pTG234cCL9fAmf7sTxRUQk7X3+12Z5sjW1QYSlHR/nMGlnYXvwnZ7a5AeDSN4fZpf6fZN2pjnb+C6M529xwGnZF3Z/sG19HEo7EAxYr5HAiDFfP2ptSPODSMrjfEv5PhLuFu59aI/Jdtxgs9ia4Tm05MEfjtYK9MHM0TFTV/s9ahOikudvc6jmbPYjCZLtoLxpI78z/YMcunGB9lSmo/UH1hZ5/T6SRNe+PSAS7sw10xNThons8FkTM0n2Pa8RmOhorOM6WAad1OjNiKQJ59qRoZkmfTZEshJE8pQmErNd3hAHbIE7izWhc43E3PrdO2/8LktM8Gmjwu+7g2/ufvobThgD78zYZIKkjcwYq15khAN2ljk61Wrz7pBvjRoVUhHv3bQl3qve/GUowuZ+uIiUh7FbJGJHAjQ4vgvjbP6gGl3xh2DTVGtqE1gj4e1jQyL6EXH+TQFyvtiob0RSmYypDaZbgRGUhs/6tR7G8Dm3xpz+2O1XmK/XTQp/5OlJLsXHCA79lgvRJEjjsJpc2TbmLFM7kRkNubO1d42EEYkPEQmftYH+FpGYtR3kLA9t6UL0cBIRyZPviUgM1FVL491Ldqc5FR+0PPw760loa5plXxszPWGOepCTKM9mh5y924pIctNGD6vye15hRGITCfvBXBf2C/rTuk6dmNocX9znxUaISOr4qsxMOC0JWJ/H/jP1U+azJpK1KZ6e/b9ARMKt8oxGAkRiSISJz9e8Pn/sVktM8GljmX5zmqdre5pHvcsXLcPQ9A5FGKRxHhzTYOAA2pBKnO/UV44ZbIkHYQ49jxvH9t7lwPmY3tjTGho4ky6DhkrjC1Enstx3W6IfiM1THVW8zXfoTyAS7p61DZdPusIp+TazJpBJN4zm7OLBgdu/SxN9c+v031FYRAL99dZxy1HoONw01XSZqU1f1Ka59dvot6W51bHHOPKZNvVO19hHJrFsE5GEBJ7+ZUSyLMG37Omveg2xsi90NGLK0Q4MIuE062S6+7UZP5ih1zMug6vXJEWt2wVddkzxqDNzQVjcEKh1YZtYJo+RrL4nkZzLCT4945v363/aK+Lt3yS+/BlRpyai3r5g3xiS5XUOhj6uS4lkYlgj78w1IiLhbV5eR57H821SYaTanP9ZEom3500SCUmEEaEmE0YmZls8H9HoApG8tWhUlSUm+PShrqr0D63gnpK3ES7yn/B0NEHDp4PAYWgwDGW7ccEaMkMftAQ1MiZc96MtyRHnd0zxqjPzeT4iBxq1NnAjay72YNVSHH6hpTjiSg5zCTZNdmBqw3e28k+9LCKhA3M0RLkkEb6Psxtz4XcXugK3f5clRs2qm4yIJJOLblb9msjgNJBjYjjclBt6fEzQjMv+5QOxNsmbtj3V1cTNanVfd6qWbBKIRZAoyy5Xt02Xj/ry+m6RV1ct9/vyn/kaiISko+VMv9h6MKLqRL8gInl99p0/jTRy78dfR09IgS7n9dvVvwGnTmd9LIuObIjA7nPqRgc7mxV69iep8/TmOEYkaxLc+17E9IibxOj8NpkYgucxc+6huZRIqtMcjTv1GgkjEiPLtuq2sx9YFvqzJT/ssyOSZG/PGz8jkfAODYmMJHJpRNJVGqZeXzBmkyUm+CywPCHice4n2THdo84u5IWh4dNQ7A0+3NIMA8IFq88J039x0At1VXWa652tcPr6J3Bhi2mcxslsZ6FsV0mIOpYVXVkzg7cAPxybJjur9J96PWyH8yyTBmslviEcjttVhIikz4a04njvzG2pXCOxjIsyNDS0xWzPRvvwXWN22MmvjVwYaoldFtnjYm55KiFCv+7v5TvDIE8dTNv63moM3C2APm0Z9hZ5TBsT3E/suskL3bm/wRi9lkV/8B0iTHzQ7cRiz1uL775bPzV8JWxIdX1/U5Lr/IZEt9p3b7hFJBaZsFytg+l7EsmZzNBzD06Zq9dr+PLninjXS8/fioiEL5miDpCxH7nXd2F4fdE/HYVOEEnvy583p4Y17tJ39ay2sh+RzENxfA4L36Ofmz8jItG3fxGRvPGgG+3stU9NZrZuiEz4kudX5k3YaYkJPgvMHXvtkPWJntMb47zq+EzeJeGCHXI4fztCRP4Fhark49jOpw8WXPpuVaIiwbt5S2KEeuUup+pailENxqr/WBrGSjLhaMz/vWkqDrviszXvxdq0sKrNCbz9G6a6USZ1sf8k2zYe/um1Kodz9FlszY+NnLk5BdHRYho4SZFyfIKYf1iNHGXwH/E7CsNO3hn75Pva0hcTgr4SXDret247opJNCR517K/hqnOp2fKt+4b66DK5JTtUdfO9oIFnbTDNmuB+ZNuNHj0dI2HwfP6Hj+4btgNOf7EkWJ1a7DmSfe/39BvfPwjLEtxlW1M8aiP65cDveCuXZRpdOqgPE8rlLfHmrJCz96Q8FEG5BSkjIspinf945lZeH0tnXFOmNqRW6M6+5d+5XixDRJIe+XXKkUjWJ4c21k53szxtB+08lw7MBJk21Hm+nH9m9VkSSUTPmw96NFlwy307og/+GZb+D2Mm2kWlQ706b+yLlpjgswJGupe2JkWofT90q9PzwlT9nFB1cm6IOjU3TJ2aH9bWkO8+0Fzuvez+j9LYYV/kczHPfBkOvAAykNdySCeeCFHH5wcfPpkZvKuxZOCH/vO/jZVJYVXr4yIUQ9izC8MwbQpTp+eHq5NzwtTJJ6DbbHyX6dp/Lt/3+qnMofrhNKI8LmrGNm6tfwRThpkhqn4Wzn2C7QlXp+eGQzdn57k8976GHO+228csDqz1XAlZ1zjCnkqK3Lc7zaue/zoinYWh6J9QlIcyUe7J2aFoo6PnTK7rVZT5Ukt679RtZYL7kRpEeUcfD4Yu0Ad9cYpy6JcG9s+CsKaGPNfeo4uGbiy872b9yP8HoSDJE1md5nx710SveuYrEerk407dL1oX9Af75MSc8K4zOa59p9Mjan86bYZuX5b/endFnPuZum860Ifok9nsB4eqZ5rrRHsc6thcT/upbM9r9Vm+1w8tvFa/x8Qmkm2TQaKPUgYJfUjbODELESbadPSJkO6GPOe+cwXeHaom6CNFm/8T6KlNkrdn7w88qmG+S515EvrPdxrdaBuzYW9zQtvO5oe98vqC6/MsMcFnhWL/9Tc/P8WndqVEqB2ILrZg1NsAR+bLd1eN823/WtD3rzgN2JkcOaYuzdtNueoJkB3vVVtiKetV/0j2qN2Jnvf96dSHoWayZ03dJJ/a6keZ8RFqG/IalF+LKRT/puLZZK+qTXTHW6cHsC552KznJnnVdui/Nc4DPaDLeI+qRtqBz9smeN6yTv3IKEwYdktdGuSTItX2OB/KiFRb0T62cRvLj/V0bxoT876/+9ye5pv93GSc649Um+Mi1cbxkWrTuAi1Gf3zDPpmR4J3g3XqR0aBf9T02rSoZhJbDfSpZb+gLPZRDdpcG+c5ZJ0aQEZK7PAtk32v8s/HN8ZH4rpCF1ynTdC/GlFoXaJLrZgw6vTvrr31kqiIRFI32dVYgyhoA9q5CedujkdfIjrbhlQN23hqXPi71umfCRiRbEmN7NmCPmX/U/9qth9t3wLdaqDThninRCL/W6hJiRi+0R+T/VT8kIVVccMWVUwYklU4LubJgrGRWXmjfR/4r2S/GPm10LxxYx5bPi46t3xs9KKiG2Iy80cPW1w6ZsjsZXFDC5Ynjn6fw38Ytk+P/Om65OjCleOj08vGxmQsHR+TUTEhesnqhJiMtf6orLXJkQWV/t7XGtrImDD2ntXxQ1dtio/MWjMhImfleF/68rG+zAqm8ZH5FeM8j1unfixsSIy4e9V4X/7SsVHzS8dELylBO0vGI42LKSia4M1f6w/Sd0j6oizxuu+t9I8orogfllUydnhG/pih6bmjh2UyFY6NLigd5/ulderHwtq0YT+tTIjOWxYbk14RNzSzPC4msywOfRQ7tGhV/JA51mkBzEtNda5OG/LXdSlROZU4r3R8TCZ0Ty8eH5VZPi56SeWEiOzyuOGPz/VPc1siGi/4g76wKdW7sCohKmfFBN+S8glRi8rRnxUTIhdVJfgyV8b5SioTXPOt0z8TVH/ZEbZ1Iq5tQlTmitjojEok5qviojLXJERkrvT7SirSIj50w6NAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKB4P80goL+H7YrkI5shAPpAAAAAElFTkSuQmCC" alt="Winnify" style={{height: 54, width: 'auto', objectFit: 'contain'}} />
        <div className="ws" style={{marginLeft: 'auto'}}>v2.4</div>
      </div>
      <div className="nav-section">Workspace</div>
      <nav className="nav col" style={{gap: 2}}>
        {item("home", "Home", <Icons.Home/>)}
        {item("slog", "Slog Overs", <Icons.Target/>)}
        {item("winspeak", "WinSpeak", <Icons.Mic/>)}
        {item("foundation", "Foundation", <Icons.Book/>)}
        {item("library", "Role Library", <Icons.Folder/>)}
      </nav>
      <div className="nav-section">Active sessions</div>
      <nav className="nav col" style={{gap: 2}}>
        {WINNIFY.sessions.filter(s => s.status === "active").map(s => (
          <button key={s.id} className={route.screen.startsWith("slog:") && route.params?.sid === s.id ? "active" : ""}
                  onClick={() => go("slog:phase", { sid: s.id, phase: s.activePhase })}>
            <span className={`nav-ico chip-dot`} style={{
              background: s.activePhase === "powerplay" ? "var(--powerplay)" :
                          s.activePhase === "acceleration" ? "var(--acceleration)" : "var(--final-over)"
            }}></span>
            <span style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
              {s.role}
            </span>
          </button>
        ))}
      </nav>
      <div className="sidebar-spacer"></div>
      <div className="user-card">
        <div className="user-avatar">{user.initials}</div>
        <div className="col" style={{gap: 0}}>
          <div className="user-name">{user.name}</div>
          <div className="user-meta">B.Tech · CSE · Year 4</div>
        </div>
      </div>
    </aside>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Topbar (breadcrumbs)
// ───────────────────────────────────────────────────────────────────────────
function Topbar({ crumbs = [], right = null }) {
  return (
    <div className="topbar">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            <span className={i === crumbs.length - 1 ? "here" : ""}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="right">
        {right}
        <button className="btn btn-ghost btn-sm" title="Search"><Icons.Search/></button>
        <button className="btn btn-ghost btn-sm" title="Notifications"><Icons.Bell/></button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Modal
// ───────────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, children, size = "" }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={"modal " + size}>
        {children}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Toast
// ───────────────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  return <div className="toast"><Icons.Check size={14}/> {msg}</div>;
}

// ───────────────────────────────────────────────────────────────────────────
// Generic chips/cards used everywhere
// ───────────────────────────────────────────────────────────────────────────
function PhaseChip({ phase }) {
  const lbl = WUTIL.phaseLabel(phase);
  const cls = "chip chip-" + (phase === "powerplay" ? "power" : phase === "acceleration" ? "accel" : "final");
  return <span className={cls}><span className="chip-dot"></span>{lbl}</span>;
}

function Pct({ value, tone = "" }) {
  return (
    <div className="row gap-2" style={{flex:1}}>
      <div className={`progress thick ${tone}`} style={{flex:1}}><span style={{width: WUTIL.pct(value) + "%"}}></span></div>
      <span className="mono dim" style={{fontSize: 11, minWidth: 32, textAlign: "right"}}>{WUTIL.pct(value)}%</span>
    </div>
  );
}

// Image placeholder (striped) — used for content cards in cluster previews
function Placeholder({ label = "preview", h = 120 }) {
  return (
    <div style={{
      height: h, borderRadius: 8,
      background: "repeating-linear-gradient(45deg, var(--surface-3), var(--surface-3) 8px, var(--surface-2) 8px, var(--surface-2) 16px)",
      display: "grid", placeItems: "center",
      color: "var(--ink-4)",
      fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".05em",
    }}>{label}</div>
  );
}

window.UI = { Modal, Toast, Topbar, Sidebar, PhaseChip, Pct, Placeholder };


// ═══════════════════════════════════════════════════════════════════
// FILE: 2d2aeb7f.js (10,943 bytes)
// ═══════════════════════════════════════════════════════════════════

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


// ═══════════════════════════════════════════════════════════════════
// FILE: 314abc03.js (30,947 bytes)
// ═══════════════════════════════════════════════════════════════════

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


// ═══════════════════════════════════════════════════════════════════
// FILE: 8ba314cc.js (25,178 bytes)
// ═══════════════════════════════════════════════════════════════════

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


// ═══════════════════════════════════════════════════════════════════
// FILE: 196b715e.js (28,430 bytes)
// ═══════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════
// FILE: 7b27f3d0.js (33,141 bytes)
// ═══════════════════════════════════════════════════════════════════

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
  const { go, tweaks, setTweak } = useApp();
  const variant = tweaks?.skillTreeVariant || "branching";
  const data = WINNIFY.clusters[CLUSTER_WINNIFY_KEY[cluster] || cluster] || WINNIFY.clusters.DSA;
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
              {t.status === "in-progress" && <span style={{width:8, height:8, borderRadius:99, background:"var(--accent)"}}></span>}
              {t.status === "todo" && <span style={{width:8, height:8, borderRadius:99, background:"var(--surface-3)", border: "1px solid var(--line-2)"}}></span>}
              <span style={{fontSize: 13.5}}>{t.name}</span>
            </div>
            <span style={{width: 110}}>
              <span className={`chip ${t.status === "done" ? "chip-success" : t.status === "focus" ? "chip-power" : t.status === "in-progress" ? "chip-accent" : ""}`}>
                {t.status === "done" ? "Completed" : t.status === "focus" ? "Focus" : t.status === "in-progress" ? "In progress" : "Not started"}
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
  const topic = clusterData.topics.find(t => t.id === topicId) || { id: topicId, name: topicId, status: "todo" };
  const meta = CLUSTER_META[cluster];
  const [tab, setTab] = useState("summary");

  const markComplete = () => {
    showToast("Marked complete (self-marked).");
  };

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
                <span className="chip chip-outline">{cluster.toUpperCase()}</span>
              </div>
              <h1 style={{margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em"}}>{topic.name}</h1>
            </div>
            <div className="row gap-2">
              <button className="btn" onClick={markComplete}><Icons.Check size={12}/> Mark complete</button>
              <button className="btn btn-primary"><Icons.Play size={12}/> Practice now</button>
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
            {tab === "summary" && <TopicSummary topic={topic}/>}
            {tab === "link" && <TopicLink topic={topic}/>}
            {tab === "cards" && <Flashcards topic={topic}/>}
            {tab === "practice" && <Practice/>}
          </div>

          <div className="row between mt-4">
            <button className="btn"><Icons.ArrowL size={12}/> Previous topic</button>
            <button className="btn">Next topic <Icons.ArrowR size={12}/></button>
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
  const [q, setQ] = useState(WINNIFY.quiz[0]);
  const [pick, setPick] = useState(null);
  const [shown, setShown] = useState(false);

  const reveal = (i) => {
    if (shown) return;
    setPick(i);
    setShown(true);
  };
  const next = () => { setPick(null); setShown(false); };

  return (
    <>
      <div className="row between">
        <div className="label">Adaptive practice · Q3 of 8</div>
        <div className="row gap-2">
          <span className="chip chip-power">Medium</span>
          <span className="chip">Streak · 4</span>
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


// ═══════════════════════════════════════════════════════════════════
// FILE: 34b08add.js (24,540 bytes)
// ═══════════════════════════════════════════════════════════════════

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


// ═══════════════════════════════════════════════════════════════════
// FILE: 6d396665.js (9,222 bytes)
// ═══════════════════════════════════════════════════════════════════

// SO-20 Mark complete · SO-22 Extend · SO-23 Duplicate · Low-completion phase switch warning
// + Offline / slow-connection banner (US-9.1, US-9.2)

function ModalRouter() {
  const { modal, closeModal } = useApp();
  if (!modal) return null;
  return (
    <UI.Modal open onClose={closeModal} size={modal.kind === "mark-complete" ? "modal-lg" : ""}>
      {modal.kind === "mark-complete" && <MarkCompleteModal modal={modal} onClose={closeModal}/>}
      {modal.kind === "extend"        && <ExtendModal modal={modal} onClose={closeModal}/>}
      {modal.kind === "duplicate"     && <DuplicateModal modal={modal} onClose={closeModal}/>}
      {modal.kind === "low-completion"&& <LowCompletionModal modal={modal} onClose={closeModal}/>}
      {modal.kind === "start-phase"   && <StartPhaseModal modal={modal} onClose={closeModal}/>}
    </UI.Modal>
  );
}

// SO-20
function MarkCompleteModal({ modal, onClose }) {
  const { state, setState, showToast } = useApp();
  const [reason, setReason] = useState("placed");
  const [note, setNote] = useState("");
  const s = state.sessions.find(x => x.id === modal.sid);

  const submit = () => {
    setState({
      sessions: state.sessions.map(x => x.id === modal.sid ? { ...x, status: "archived", closedReason: reason, closedAt: new Date().toISOString() } : x)
    });
    showToast(`${s?.role} session marked complete.`);
    onClose();
  };

  const reasons = [
    { id: "placed", label: "Got placed / accepted offer", icon: <Icons.Trophy size={16}/> },
    { id: "postponed", label: "Interview cancelled / postponed" },
    { id: "switching", label: "Switching target role" },
    { id: "uninterested", label: "No longer interested" },
    { id: "completed", label: "Completed prep" },
    { id: "other", label: "Other" },
  ];

  return (
    <>
      <div className="modal-head">
        <div className="label">SO-20 · Mark complete</div>
        <h2 className="h-2 mt-2">Close “{s?.role}” session</h2>
        <p className="muted mt-2" style={{fontSize: 13}}>
          Historical data — progress, mocks, tasks — is preserved in a read-only archive. You can reopen anytime from the archived list.
        </p>
      </div>
      <div className="modal-pad" style={{paddingTop: 0}}>
        <div className="label">Reason for closing</div>
        <div className="col gap-2 mt-2">
          {reasons.map(r => (
            <label key={r.id} className="row gap-3" style={{
              padding: "10px 12px",
              border: `1px solid ${reason === r.id ? "var(--ink-1)" : "var(--line-2)"}`,
              borderRadius: 8, cursor: "pointer",
              background: reason === r.id ? "var(--surface-2)" : "transparent",
            }}>
              <input type="radio" name="reason" checked={reason === r.id} onChange={() => setReason(r.id)}/>
              {r.icon}
              <span style={{fontSize: 13.5}}>{r.label}</span>
            </label>
          ))}
        </div>
        {reason === "other" && (
          <textarea className="textarea mt-3" rows="3" placeholder="Tell us what happened (optional)" value={note} onChange={e => setNote(e.target.value)}/>
        )}
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}>Mark complete</button>
      </div>
    </>
  );
}

// SO-22
function ExtendModal({ modal, onClose }) {
  const { state, setState, showToast } = useApp();
  const min = (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().slice(0,10); })();
  const [date, setDate] = useState(min);
  const s = state.sessions.find(x => x.id === modal.sid);
  const submit = () => {
    setState({
      sessions: state.sessions.map(x => x.id === modal.sid ? { ...x, targetDate: new Date(date).toISOString(), status: "active" } : x)
    });
    showToast(`Target date extended to ${WUTIL.fmtDate(new Date(date))}.`);
    onClose();
  };
  return (
    <>
      <div className="modal-head">
        <div className="label">SO-22 · Extend target date</div>
        <h2 className="h-2 mt-2">Pick a new interview date</h2>
        <p className="muted mt-2" style={{fontSize: 13}}>
          AI will resume Day View task assignment from the current phase. Foundation progress is preserved.
        </p>
      </div>
      <div className="modal-pad" style={{paddingTop: 0}}>
        <div className="field">
          <label>New target interview date</label>
          <input type="date" className="input" min={min} value={date} onChange={e => setDate(e.target.value)}/>
          <div className="hint">Minimum 3 days from today.</div>
        </div>
        <div className="banner info mt-4">
          <Icons.Info size={14}/>
          <span>You're extending an expired session. Your existing progress in {s && WUTIL.phaseLabel(s.activePhase)} is kept as-is.</span>
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}>Extend &amp; reactivate</button>
      </div>
    </>
  );
}

// SO-23
function DuplicateModal({ modal, onClose }) {
  return (
    <>
      <div className="modal-head">
        <div className="label">SO-23 · Duplicate role warning</div>
        <h2 className="h-2 mt-2">You already have a Slog Over for “{modal.role}”</h2>
        <p className="muted mt-2" style={{fontSize: 13}}>
          Running two sessions for the same role is supported — Foundation progress is shared, but Interview Prep and Resume gap lists stay separate. Are you sure?
        </p>
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { onClose(); modal.onContinue?.(); }}>Continue anyway</button>
      </div>
    </>
  );
}

// Low completion phase switch warning (US-4.2)
function LowCompletionModal({ modal, onClose }) {
  return (
    <>
      <div className="modal-head">
        <div className="label">Phase switch · low Foundation completion</div>
        <h2 className="h-2 mt-2">You may not be ready for Final Over</h2>
      </div>
      <div className="modal-pad" style={{paddingTop: 0}}>
        <div className="card card-pad" style={{background: "var(--warn-tint)", border: "1px solid #f5c89a"}}>
          <div className="row between">
            <div className="label">Foundation completion</div>
            <span className="mono" style={{fontSize: 22}}>{WUTIL.pct(modal.fcPct)}%</span>
          </div>
          <div className="progress thick mt-3" style={{height: 8}}><span style={{width: WUTIL.pct(modal.fcPct) + "%"}}></span></div>
        </div>
        <div className="muted mt-3" style={{fontSize: 13.5, lineHeight: 1.6}}>
          Final Over is designed for simulation and review. Mock interviews and company-specific scenarios assume you've covered the Powerplay foundations. Switching now may surface as wide gaps in your debrief.
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Stay in current phase</button>
        <button className="btn btn-danger" onClick={() => { onClose(); modal.onConfirm?.(); }}>Switch anyway</button>
      </div>
    </>
  );
}

// US-4.1 · Start Phase confirmation (replaces v1.1 card-tap switch)
function StartPhaseModal({ modal, onClose }) {
  return (
    <>
      <div className="modal-head">
        <div className="label">US-4.1 · Switch active phase</div>
        <h2 className="h-2 mt-2">Switch active phase to {WUTIL.phaseLabel(modal.to)}?</h2>
        <p className="muted mt-2" style={{fontSize: 13}}>
          Your current phase progress in <strong>{WUTIL.phaseLabel(modal.from)}</strong> is saved. No recalculation — existing progress in {WUTIL.phaseLabel(modal.to)} is preserved.
        </p>
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { onClose(); modal.onConfirm?.(); }}>Confirm switch</button>
      </div>
    </>
  );
}

// Offline banner (US-9.1, US-9.2)
function OfflineBanner() {
  const { state, setState } = useApp();
  if (!state.offline) return null;
  return (
    <div style={{
      position: "fixed", bottom: 16, left: 16,
      maxWidth: 320, padding: "10px 14px",
      borderRadius: 8, background: "var(--ink-1)", color: "var(--paper)",
      fontSize: 12.5, display: "flex", gap: 10, alignItems: "flex-start",
      boxShadow: "var(--shadow-pop)", zIndex: 40,
    }}>
      <Icons.WiFiOff size={14}/>
      <div className="col" style={{gap: 4}}>
        <strong>Slow / unreliable connection</strong>
        <span style={{opacity: .8}}>Practice disabled. Summaries and Flashcards available read-only. Last checkpoint auto-saved.</span>
        <button className="btn btn-sm" style={{marginTop: 6, alignSelf: "flex-start", background: "var(--paper)", color: "var(--ink-1)"}} onClick={() => setState({ offline: false })}>Retry</button>
      </div>
    </div>
  );
}

window.ModalRouter = ModalRouter;
window.OfflineBanner = OfflineBanner;


// ═══════════════════════════════════════════════════════════════════
// FILE: e2c6e3f6.js (52,165 bytes)
// ═══════════════════════════════════════════════════════════════════

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


// ═══════════════════════════════════════════════════════════════════
// FILE: cb7b75b0.js (17,141 bytes)
// ═══════════════════════════════════════════════════════════════════

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
  const { route, go, state } = useApp();
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
            <button className="btn"><Icons.Spark size={12}/>&nbsp;Flag AI feedback</button>
            <button className="btn" onClick={() => go("slog:phase", { sid, phase: "final-over" })}>Back to Final Over</button>
          </div>
        </div>
      </div>
    </>
  );
}

window.ScreenGDSimulation = ScreenGDSimulation;
window.ScreenGDDebrief = ScreenGDDebrief;


// ═══════════════════════════════════════════════════════════════════
// FILE: 5799e759.js (40,449 bytes)
// ═══════════════════════════════════════════════════════════════════

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


// ═══════════════════════════════════════════════════════════════════
// FILE: 03bacb41.js (73,559 bytes)
// ═══════════════════════════════════════════════════════════════════

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
            <button className="btn"><Icons.Spark size={12}/>&nbsp;Flag AI feedback</button>
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
  const { route, go, state } = useApp();
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
            <button className="btn"><Icons.Spark size={12}/>&nbsp;Flag AI feedback</button>
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


// ═══════════════════════════════════════════════════════════════════
// FILE: 7cbbf429.js (6,798 bytes)
// ═══════════════════════════════════════════════════════════════════

// Placeholder screens for other sidebar destinations + Tweaks panel

function ScreenPlaceholder({ title, icon, blurb }) {
  return (
    <>
      <UI.Topbar crumbs={[title]} />
      <div className="viewport">
        <div className="viewport-inner fade-in" style={{maxWidth: 720, padding: "64px 32px"}}>
          <div className="row gap-3">
            <div style={{width: 44, height: 44, borderRadius: 10, background: "var(--surface-3)", display: "grid", placeItems: "center"}}>{icon}</div>
            <div>
              <div className="label">Winnify module</div>
              <h1 style={{margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em"}}>{title}</h1>
            </div>
          </div>
          <p className="muted mt-4" style={{fontSize: 13.5, maxWidth: "55ch"}}>{blurb}</p>
          <div className="card card-pad mt-6" style={{background: "var(--surface-2)"}}>
            <div className="row gap-3">
              <Icons.Info size={16}/>
              <div>
                <strong>Outside this prototype.</strong>{" "}
                <span className="muted">This is a Slog Overs prototype — other Winnify modules are stubbed. Use the sidebar to return to Slog Overs.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ScreenHome() {
  const { go, state } = useApp();
  const sessions = state.sessions;
  return (
    <>
      <UI.Topbar crumbs={["Home"]}/>
      <div className="viewport">
        <div className="viewport-inner fade-in">
          <div className="label">Today</div>
          <h1 className="h-display mt-2" style={{fontSize: 36}}>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, Sameer.</h1>
          <p className="muted mt-2">{sessions.filter(s => s.status === "active").length} active Slog Overs · 4 tasks due today.</p>

          <div className="row gap-3 wrap mt-6">
            <button className="card card-hover" style={{flex: "1 1 280px", padding: 22, textAlign: "left", cursor: "pointer"}}
                    onClick={() => sessions[0] && go("slog:phase", { sid: sessions[0].id, phase: sessions[0].activePhase })}>
              <div className="label">Continue · Day view</div>
              <div className="h-3 mt-2">Today's tasks ({sessions[0]?.role})</div>
              <div className="muted mt-2" style={{fontSize: 12.5}}>Top 4 priorities re-ranked overnight.</div>
              <div className="row gap-2 mt-3"><span className="chip chip-power">DSA</span><span className="chip chip-accel">Interview Prep</span></div>
            </button>
            <button className="card card-hover" style={{flex: "1 1 280px", padding: 22, textAlign: "left", cursor: "pointer"}}
                    onClick={() => go("slog:list")}>
              <div className="label">Slog Overs</div>
              <div className="h-3 mt-2">All sessions</div>
              <div className="muted mt-2" style={{fontSize: 12.5}}>{sessions.length} total · {sessions.filter(s=>s.status==="active").length} active · {sessions.filter(s=>s.status==="expired").length} expired.</div>
            </button>
            <button className="card card-hover" style={{flex: "1 1 280px", padding: 22, textAlign: "left", cursor: "pointer"}}
                    onClick={() => go("slog:setup-1")}>
              <div className="label">New</div>
              <div className="h-3 mt-2">Start a new Slog Over</div>
              <div className="muted mt-2" style={{fontSize: 12.5}}>3 quick screens. AI generates a phase plan from your timeline.</div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Tweaks panel — uses the protocol described in the system prompt (manual implementation)
function TweaksPanel() {
  const { tweaks, setTweak, state, setState } = useApp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e?.data?.type === "__activate_edit_mode") setOpen(true);
      if (e?.data?.type === "__deactivate_edit_mode") setOpen(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  const close = () => {
    setOpen(false);
    window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
  };

  if (!open) return null;
  return (
    <div style={{
      position: "fixed", right: 16, bottom: 16, width: 300,
      background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line-1)",
      boxShadow: "var(--shadow-pop)", zIndex: 80, padding: 16,
      fontSize: 13,
    }}>
      <div className="row between" style={{marginBottom: 12}}>
        <div className="label">Tweaks</div>
        <button className="btn btn-sm btn-ghost" onClick={close}><Icons.Close size={12}/></button>
      </div>

      <Section label="Milestone view layout">
        <Seg value={tweaks.milestoneVariant} onChange={v => setTweak("milestoneVariant", v)}
             options={[["phases-cards","Cards"],["phases-timeline","Timeline"],["phases-rings","Rings"]]}/>
      </Section>

      <Section label="Skill tree layout">
        <Seg value={tweaks.skillTreeVariant} onChange={v => setTweak("skillTreeVariant", v)}
             options={[["branching","Branching"],["radial","Radial"],["linear","Linear"]]}/>
      </Section>

      <Section label="Day view layout">
        <Seg value={tweaks.heatmapPosition} onChange={v => setTweak("heatmapPosition", v)}
             options={[["bottom","Tasks · Heatmap"],["top","Heatmap · Tasks"]]}/>
      </Section>

      <Section label="Demo state">
        <div className="col gap-2">
          <button className="btn btn-sm" onClick={() => setState({ offline: !state.offline })}>
            {state.offline ? "Disable" : "Simulate"} offline mode
          </button>
          <button className="btn btn-sm" onClick={() => setState({ firstVisit: true, sessions: [] })}>
            Reset to first-time visit
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{padding: "10px 0", borderTop: "1px solid var(--line-1)"}}>
      <div className="label" style={{marginBottom: 6}}>{label}</div>
      {children}
    </div>
  );
}

function Seg({ value, onChange, options }) {
  return (
    <div className="segmented" style={{width: "100%"}}>
      {options.map(([v, lbl]) => (
        <button key={v} className={value === v ? "active" : ""} onClick={() => onChange(v)} style={{flex: 1, fontSize: 11.5}}>{lbl}</button>
      ))}
    </div>
  );
}

window.ScreenPlaceholder = ScreenPlaceholder;
window.ScreenHome = ScreenHome;
window.TweaksPanel = TweaksPanel;


// ═══════════════════════════════════════════════════════════════════
// FILE: 176bd1e1.js (5,170 bytes)
// ═══════════════════════════════════════════════════════════════════

// Root App: state, routing, providers
function App() {
  // Routing — internal state-based (no actual URL changes)
  const [route, setRoute] = useState({ screen: "slog:list", params: {} });
  const go = (screen, params = {}) => setRoute({ screen, params });

  // Tweaks — persisted via __edit_mode_set_keys protocol
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "milestoneVariant": "phases-cards",
    "skillTreeVariant": "branching",
    "heatmapPosition": "bottom"
  }/*EDITMODE-END*/;
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const setTweak = (key, value) => {
    setTweaks(prev => {
      const next = typeof key === "object" ? { ...prev, ...key } : { ...prev, [key]: value };
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: typeof key === "object" ? key : { [key]: value } }, "*");
      return next;
    });
  };

  // App state — sessions, modals, toasts
  const [state, _setState] = useState({
    sessions: WINNIFY.sessions,
    firstVisit: false,
    draft: null,
    generating: false,
    offline: false,
    quizDone: {},
    dismissed: [],
  });
  const setState = (patch) => _setState(prev => ({ ...prev, ...patch }));

  const [modal, setModal] = useState(null);
  const openModal = (m) => setModal(m);
  const closeModal = () => setModal(null);

  const [toast, setToast] = useState("");
  const showToast = (msg) => setToast(msg);

  const ctx = {
    user: WINNIFY.user,
    route, go,
    state, setState,
    modal, openModal, closeModal,
    tweaks, setTweak,
    showToast,
  };

  return (
    <AppCtx.Provider value={ctx}>
      <div className="app">
        <UI.Sidebar/>
        <main className="main">
          <ScreenRouter/>
        </main>
      </div>
      {state.generating && <GeneratingOverlay/>}
      <ModalRouter/>
      <OfflineBanner/>
      <UI.Toast msg={toast} onDone={() => setToast("")}/>
      <TweaksPanel/>
    </AppCtx.Provider>
  );
}

function ScreenRouter() {
  const { route } = useApp();
  switch (route.screen) {
    case "home":           return <ScreenHome/>;
    case "slog:list":      return <ScreenSessionsList/>;
    case "slog:setup-1":   return <ScreenSetup1/>;
    case "slog:setup-2":   return <ScreenSetup2/>;
    case "slog:setup-3":   return <ScreenSetup3/>;
    case "slog:dashboard": return <ScreenDashboard/>;
    case "slog:phase":     return <ScreenPhase/>;
    case "slog:cluster":   return <ScreenCluster/>;
    case "slog:topic":     return <ScreenTopic/>;
    case "slog:adaptive":  return <ScreenAdaptive/>;
    case "slog:interview": return <ScreenInterview/>;
    case "slog:mock":      return <ScreenMock/>;
    case "slog:mock-assessment":         return <ScreenMockAssessment/>;
    case "slog:mock-assessment-results": return <ScreenMockAssessmentResults/>;
    case "slog:fo-complete":     return <ScreenFOComplete/>;
    case "slog:gd-simulation":   return <ScreenGDSimulation/>;
    case "slog:gd-debrief":      return <ScreenGDDebrief/>;
    // v2.0 — Aptitude (Powerplay)
    case "slog:aptitude-hub":    return <ScreenAptitudeHub/>;
    case "slog:aptitude-sub":    return <ScreenAptitudeSub/>;
    case "slog:apt-topic":         return <ScreenAptTopic/>;
    // v2.0 — Acceleration
    case "slog:acc-topic":           return <ScreenAccTopic/>;
    case "slog:acc-subtopic":        return <ScreenAccSubtopic/>;
    case "slog:acc-mcq":             return <ScreenAccMCQ/>;
    case "slog:acc-cheatsheet":      return <ScreenAccCheatSheet/>;
    case "slog:acc-winspeak":        return <ScreenAccWinSpeak/>;
    case "slog:acc-winspeak-report": return <ScreenAccWinSpeakReport/>;
    case "slog:acc-behavioral":      return <ScreenAccBehavioral/>;
    case "slog:acc-beh-single":      return <ScreenAccBehSingle/>;
    case "slog:acc-beh-practice":    return <ScreenAccBehPractice/>;
    case "slog:acc-beh-report":      return <ScreenAccBehReport/>;
    case "slog:acc-apthub":          return <ScreenAccAptHub/>;
    case "slog:acc-apt-type":        return <ScreenAccAptType/>;
    // legacy/retired (kept for safety; if hit, route to new acceleration home)
    case "slog:blitz":           return <ScreenPhase/>;
    case "slog:accel-interview": return <ScreenPhase/>;
    case "slog:accel-triage":    return <ScreenPhase/>;
    case "slog:resume":    return <ScreenResume/>;
    case "winspeak":       return <ScreenPlaceholder title="WinSpeak" icon={<Icons.Mic/>} blurb="Standalone WinSpeak module — speech-first interview practice. Slog Overs embeds WinSpeak inside the Interview Prep cluster; progress here would be independent."/>;
    case "foundation":     return <ScreenPlaceholder title="Foundation" icon={<Icons.Book/>} blurb="Standalone Foundation content library — DSA, DBMS, OS, Networking, System Design. Slog Overs surfaces Foundation through phase-scoped clusters."/>;
    case "library":        return <ScreenPlaceholder title="Role Library" icon={<Icons.Folder/>} blurb="Catalog of roles and their default round structures. Used when you start a new Slog Over."/>;
    default:               return <ScreenSessionsList/>;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
