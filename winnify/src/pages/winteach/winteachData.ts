// ============================================================
// WinTeach Console — shared mock data & helpers
// ============================================================

export const BLOOM = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'] as const;
export type BloomLevel = typeof BLOOM[number];

export const ART_DEFS = [
  { k: 'notes', label: 'Teacher Notes', sub: 'Lecture notes' },
  { k: 'lesson_plan', label: 'Lesson Plan', sub: 'Structured plan' },
  { k: 'preassess', label: 'Pre-Assessment', sub: 'Readiness check' },
  { k: 'quiz', label: 'Student Quiz', sub: 'Bloom MCQs' },
  { k: 'flash', label: 'Flash Cards', sub: 'Spaced repetition' },
] as const;

export type ArtifactKey = 'notes' | 'lesson_plan' | 'preassess' | 'quiz' | 'flash';
export type Artifacts = Record<ArtifactKey, number>;

export function newArtifacts(): Artifacts {
  return { notes: 0, lesson_plan: 0, preassess: 0, quiz: 0, flash: 0 };
}

let uid = 100;
export const nid = () => 't' + (++uid);

export interface Topic {
  id: string;
  name: string;
  subs: string[];
  co: { text: string; bloom: string };
  coNumber?: number | null;
  artifacts: Artifacts;
  _unit?: Unit;
}

export interface Unit {
  n: string;
  title: string;
  hours?: number;
  topics: Topic[];
}

export interface CO {
  id: string;
  text: string;
  bloom: string;
}

export interface Course {
  id?: string;
  code: string;
  name: string;
  program: string;
  major: string;
  institute: string;
  sem: number | string;
  credits: number | string;
  regulation: string;
  status: string;
  cos: CO[];
  units: Unit[];
  coMapping?: Record<string, Record<string, number | string>>;
  libraryDelta?: Array<{ text: string; bloom: string; unit: string }>;
}

export interface PO {
  code: string;
  text: string;
}

export interface PSO {
  code: string;
  text: string;
  scope: 'common' | 'major';
  major: string | null;
}

export interface Institute {
  id: string;
  name: string;
  short: string;
  type: string;
  location: string;
  regulation: string;
  accreditation: string;
  pos: PO[];
  psos: PSO[];
}

export function bloomClass(b: string) {
  return 'bl-' + b.toLowerCase();
}

function topic(name: string, subs: string[], coText: string, bloom: string, art?: Artifacts): Topic {
  return { id: nid(), name, subs, co: { text: coText, bloom }, artifacts: art || newArtifacts() };
}

export const SAMPLE: Course = {
  code: 'CSE125', name: 'Python Programming', program: 'B.Tech CSE', major: 'CSE',
  institute: 'Winnify', sem: 3, credits: 3, regulation: 'CIET R24', status: 'active',
  cos: [
    { id: 'CO1', text: 'Understand program structure in the Python REPL shell environment.', bloom: 'Understand' },
    { id: 'CO2', text: 'Apply operators, control flow and functions to process data.', bloom: 'Apply' },
    { id: 'CO3', text: 'Implement modules, packages and data-science libraries to organize data.', bloom: 'Apply' },
    { id: 'CO4', text: 'Implement core data structures and object-oriented concepts.', bloom: 'Apply' },
    { id: 'CO5', text: 'Analyze runtime errors and implement file handling using exceptions.', bloom: 'Analyze' },
  ],
  units: [
    { n: 'I', title: 'Introduction & Operators', topics: [
      topic('Python Basics & REPL', ['History, features & applications', 'Python REPL (Shell)', 'Running scripts', 'Variables, keywords, assignment', 'Input-output & indentation'], 'Understand program structure in the Python REPL shell environment.', 'Understand'),
      topic('Operators & Type Conversion', ['Numeric, Boolean, Sequence, String types', 'Operators', 'Type conversions', 'Expressions'], 'Apply operators and type conversions to evaluate expressions.', 'Apply'),
    ]},
    { n: 'II', title: 'Control Flow & Functions', topics: [
      topic('Control Flow', ['if / if-elif-else', 'for & while loops', 'break, continue, pass'], 'Apply control-flow constructs to implement program logic.', 'Apply'),
      topic('Functions', ['Defining & calling functions', 'Argument types (keyword, default, var-length)', 'Fruitful functions & return values', 'Scope: global vs local', 'Lambdas, map / reduce / filter'], 'Implement functions for reusable data processing.', 'Apply'),
    ]},
    { n: 'III', title: 'Modules, Packages & DS Libraries', topics: [
      topic('Modules & Packages', ['Creating modules, import / from-import', 'Namespaces', 'Built-in modules: os, random, math, json, date, RegEx', 'PIP & installing packages'], 'Implement modules and packages to organize code.', 'Apply'),
      topic('Data Science Libraries', ['NumPy basics', 'Pandas basics', 'Matplotlib basics'], 'Apply NumPy, Pandas and Matplotlib to organize and visualize data.', 'Apply'),
    ]},
    { n: 'IV', title: 'Data Structures & OOP', topics: [
      topic('Strings & Data Structures', ['Strings & formatting', 'List & slicing', 'Tuple, Sets, Frozen sets', 'Dictionaries', 'Comprehensions & built-in methods'], 'Implement core data structures and their functionalities.', 'Apply'),
      topic('Object-Oriented Programming', ['Classes & self-variable', 'Methods & constructor', 'Inheritance', 'Polymorphism', 'Data abstraction'], 'Understand object-oriented concepts in Python.', 'Understand'),
    ]},
    { n: 'V', title: 'Files, Errors & Exceptions', topics: [
      topic('Files', ['Types of files; text data', 'File methods; binary files', 'Pickle module; CSV files', 'os & os.path modules'], 'Implement file handling for reading and writing data.', 'Apply'),
      topic('Errors & Exceptions', ['Syntax errors & exceptions', 'Exception handlers', 'Raising & user-defined exceptions'], 'Analyze runtime errors and handle them through exceptions.', 'Analyze'),
    ]},
  ],
  libraryDelta: [
    { text: 'Create and publish reusable packages using PIP.', bloom: 'Create', unit: 'III' },
    { text: 'Evaluate performance trade-offs between data structures.', bloom: 'Evaluate', unit: 'IV' },
  ],
};

export const CO_LIBRARY = [
  { text: 'Create and publish reusable Python packages using PIP for distribution.', bloom: 'Create' },
  { text: 'Evaluate performance trade-offs between core data structures for a given problem.', bloom: 'Evaluate' },
  { text: 'Design object-oriented solutions applying inheritance and polymorphism.', bloom: 'Create' },
  { text: 'Apply NumPy and Pandas to clean, manipulate and analyze datasets.', bloom: 'Apply' },
  { text: 'Analyze code using debugging tools and structured exception handling.', bloom: 'Analyze' },
  { text: 'Understand version control workflows for collaborative Python projects.', bloom: 'Understand' },
];

export const ADDITIONAL_LIBRARY = [
  { cat: 'AI', name: 'Generative AI & LLM Foundations', subs: ['What LLMs are', 'Tokens & embeddings', 'Capabilities & limits', 'Responsible AI'], co: 'Understand the foundations and limits of generative AI and LLMs.', bloom: 'Understand' },
  { cat: 'AI', name: 'Prompt Engineering with Python', subs: ['Prompt patterns', 'Few-shot prompting', 'Structured outputs', 'Calling LLM APIs'], co: 'Apply prompt-engineering techniques to build LLM-powered Python apps.', bloom: 'Apply' },
  { cat: 'AI', name: 'Intro to ML with scikit-learn', subs: ['Supervised vs unsupervised', 'Train/test split', 'Model fitting', 'Evaluation metrics'], co: 'Apply scikit-learn to train and evaluate basic ML models.', bloom: 'Apply' },
  { cat: 'Industry', name: 'Version Control with Git & GitHub', subs: ['Repos, commits, branches', 'Pull requests', 'Merge conflicts', 'CI basics'], co: 'Apply Git workflows for collaborative software development.', bloom: 'Apply' },
  { cat: 'Industry', name: 'Building & Consuming REST APIs', subs: ['HTTP methods', 'JSON payloads', 'requests library', 'Auth tokens'], co: 'Implement Python clients that consume REST APIs.', bloom: 'Apply' },
  { cat: 'Industry', name: 'Cloud Deployment Essentials', subs: ['Containers & Docker', 'Environment config', 'Deploying a Python app', 'Logging & monitoring'], co: 'Understand how to deploy Python applications to the cloud.', bloom: 'Understand' },
  { cat: 'Industry', name: 'Testing & Code Quality', subs: ['Unit testing with pytest', 'Fixtures & assertions', 'Linting & formatting', 'Coverage'], co: 'Apply automated testing to ensure code quality.', bloom: 'Apply' },
];

export const MAJORS = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'IT', 'AI & DS'];

let iid = 0;
const niid = () => 'inst' + (++iid);

export const INITIAL_INSTITUTES: Institute[] = [
  {
    id: niid(), name: 'Winnify', short: 'WIN', type: 'EdTech Platform', location: 'Bengaluru, IN',
    regulation: 'Winnify Core', accreditation: 'Internal',
    pos: [
      { code: 'PO1', text: 'Apply foundational computing and engineering knowledge to solve well-defined problems.' },
      { code: 'PO2', text: 'Analyze problems and identify requirements using data-driven reasoning.' },
      { code: 'PO3', text: 'Design and build digital solutions that meet learner needs.' },
      { code: 'PO4', text: 'Use modern tools and platforms effectively for self-directed learning.' },
      { code: 'PO5', text: 'Communicate and collaborate effectively in distributed teams.' },
    ],
    psos: [
      { code: 'PSO1', text: 'Demonstrate competency in platform-agnostic problem solving.', scope: 'common', major: null },
      { code: 'PSO2', text: 'Build and ship full-stack applications using modern frameworks.', scope: 'major', major: 'CSE' },
      { code: 'PSO3', text: 'Design embedded and signal-processing systems for real-world use.', scope: 'major', major: 'ECE' },
    ],
  },
  {
    id: niid(), name: 'CIET', short: 'CIET', type: 'Engineering College', location: 'Andhra Pradesh, IN',
    regulation: 'CIET R24', accreditation: 'NBA / NAAC',
    pos: [
      { code: 'PO1', text: 'Engineering knowledge: apply mathematics, science and engineering fundamentals.' },
      { code: 'PO2', text: 'Problem analysis: identify, formulate and analyze complex engineering problems.' },
      { code: 'PO3', text: 'Design/development of solutions for complex engineering problems.' },
      { code: 'PO4', text: 'Conduct investigations of complex problems using research methods.' },
      { code: 'PO5', text: 'Modern tool usage: apply appropriate techniques and engineering tools.' },
      { code: 'PO6', text: 'The engineer and society: assess societal, health and legal issues.' },
      { code: 'PO7', text: 'Environment and sustainability in engineering solutions.' },
      { code: 'PO8', text: 'Ethics: apply ethical principles and professional responsibilities.' },
      { code: 'PO9', text: 'Individual and team work in multidisciplinary settings.' },
      { code: 'PO10', text: 'Communication: communicate effectively on complex activities.' },
      { code: 'PO11', text: 'Project management and finance principles.' },
      { code: 'PO12', text: 'Life-long learning in the context of technological change.' },
    ],
    psos: [
      { code: 'PSO1', text: 'Apply standard practices and strategies in software project development.', scope: 'common', major: null },
      { code: 'PSO2', text: 'Design and develop computer programs in networking, web and data analytics for CSE.', scope: 'major', major: 'CSE' },
      { code: 'PSO3', text: 'Apply VLSI and embedded design principles to ECE systems.', scope: 'major', major: 'ECE' },
      { code: 'PSO4', text: 'Analyze power systems and electrical machines for EEE applications.', scope: 'major', major: 'EEE' },
    ],
  },
];

function seedCourse(code: string, name: string, sem: number, credits: number, status: string, fill: string, institute: string, major: string): Course {
  const c: Course = JSON.parse(JSON.stringify(SAMPLE));
  c.code = code; c.name = name; c.sem = sem; c.credits = credits;
  c.status = status; c.institute = institute; c.major = major;
  c.units.forEach(u => u.topics.forEach(t => {
    t.id = nid();
    if (fill === 'full') t.artifacts = { notes: 100, lesson_plan: 100, preassess: 100, quiz: 100, flash: 100 };
    else if (fill === 'partial') t.artifacts = Math.random() > 0.5
      ? { notes: 100, lesson_plan: 100, preassess: 100, quiz: 100, flash: 100 }
      : { notes: 100, lesson_plan: 60, preassess: 60, quiz: 40, flash: 20 };
    else t.artifacts = newArtifacts();
  }));
  delete c.libraryDelta;
  return c;
}

export const INITIAL_COURSES: Course[] = [
  seedCourse('CSE205', 'Data Structures', 3, 4, 'active', 'full', 'CIET', 'CSE'),
  seedCourse('CSE231', 'Database Management Systems', 4, 3, 'active', 'partial', 'CIET', 'CSE'),
  seedCourse('CSE118', 'Operating Systems', 5, 3, 'draft', 'none', 'Winnify', 'CSE'),
];

// ---- helpers ----
export function allTopics(c: Course): Array<{ unit: Unit; topic: Topic }> {
  return c.units.flatMap(u => u.topics.map(t => ({ unit: u, topic: t })));
}

export function topicPct(t: Topic): number {
  const a = t.artifacts;
  if (!a) return 0;
  return Math.round((a.notes + a.preassess + a.quiz + a.flash) / 4);
}

export function topicState(t: Topic): 'ready' | 'generating' | 'pending' {
  const p = topicPct(t);
  if (p >= 100) return 'ready';
  if (p > 0) return 'generating';
  return 'pending';
}

export function coursePct(c: Course): number {
  const ts = allTopics(c);
  if (!ts.length) return 0;
  return Math.round(ts.reduce((s, x) => s + topicPct(x.topic), 0) / ts.length);
}

export function pendingJobs(courses: Course[]): number {
  return courses.reduce((s, c) => s + allTopics(c).filter(x => topicState(x.topic) !== 'ready').length, 0);
}

export function instOf(c: Course, institutes: Institute[]): Institute {
  return institutes.find(i => i.name === (c.institute || 'Winnify')) || institutes[0];
}

export function applicablePsos(inst: Institute, major: string): PSO[] {
  return inst.psos.filter(p => p.scope === 'common' || p.major === major);
}

export function mapCols(c: Course, institutes: Institute[]): string[] {
  const inst = instOf(c, institutes);
  return [...inst.pos.map(p => p.code), ...applicablePsos(inst, c.major || 'CSE').map(p => p.code)];
}

export function ensureMapping(c: Course, institutes: Institute[]): Record<string, Record<string, number | string>> {
  const cols = mapCols(c, institutes);
  const cos = c.cos || [];
  if (!c.coMapping) c.coMapping = {};
  cos.forEach((co, ci) => {
    c.coMapping![co.id] = c.coMapping![co.id] || {};
    cols.forEach((col, xi) => {
      if (c.coMapping![co.id][col] === undefined) {
        const r = (ci * 3 + xi * 5 + (col.startsWith('PSO') ? 2 : 0)) % 4;
        c.coMapping![co.id][col] = r === 0 ? '' : r;
      }
    });
  });
  return c.coMapping!;
}

export function coRefFor(c: Course, unitIndex: number): string {
  return (c.cos && c.cos[unitIndex]) ? c.cos[unitIndex].id : 'CO' + (unitIndex + 1);
}

export function normCo(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export const SAMPLE_TEXT = `PYTHON PROGRAMMING (L3 T0 P0 C3)
Course Outcomes:
- Understand program structure python REPL shell environment.
- Implement iterators and functions for data processing.
- Implement different modules and objects to organize data.
- Implement different data structures and their functionalities.
- Understand OOP concepts and handle errors through exceptions.
UNIT I Introduction; Operators and Type Conversion ...
UNIT II Control Flow; Functions ...
UNIT III Modules; Packages; Data Science Libraries ...
UNIT IV Strings & Data Structures; OOP in Python ...
UNIT V Files; Errors and Exceptions ...`;

export function getElectivesUnit(c: Course): Unit {
  let u = c.units.find(x => x.n === 'E');
  if (!u) { u = { n: 'E', title: 'Industry & AI Electives', topics: [] }; c.units.push(u); }
  return u;
}

export function renumberCos(cos: CO[]): void {
  cos.forEach((co, i) => co.id = 'CO' + (i + 1));
}
