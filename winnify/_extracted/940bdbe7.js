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
