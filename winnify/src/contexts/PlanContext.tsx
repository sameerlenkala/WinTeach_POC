import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { allAoiSkillsForCalc } from './aoiSkillsData';
export { allAoiSkillsForCalc } from './aoiSkillsData';

/* ── Types ─────────────────────────────────────────────────────── */
export interface PlanSkill {
  name: string;
  slug: string;
  grouping: string;
  category: string;
  criticality: 'Mandatory' | 'Extra edge';
  proficiency: '1-Beginner' | '2-Intermediate';
  toolsets: string;
  prerequisite?: string;
  aoi: string;
}

export interface WeeklySkillGroup {
  week: number;
  label: string;
  skills: PlanSkill[];
}

export interface DurationInfo {
  id: string;
  label: string;
  days: number;
  totalWeeks: number;
}

/* ── Duration map ───────────────────────────────────────────────── */
const durationMap: Record<string, DurationInfo> = {
  '1w':   { id: '1w',   label: '1 Week',      days: 7,  totalWeeks: 1 },
  '15d':  { id: '15d',  label: '15 Days',     days: 15, totalWeeks: 2.1 },
  '1m':   { id: '1m',   label: '1 Month',     days: 30, totalWeeks: 4.3 },
  '1.5m': { id: '1.5m', label: '1.5 Months',  days: 45, totalWeeks: 6.4 },
  '2m':   { id: '2m',   label: '2 Months',    days: 60, totalWeeks: 8.6 },
  '3m':   { id: '3m',   label: '3 Months',    days: 90, totalWeeks: 12.9 },
};

/* ── Skill data ─────────────────────────────────────────────────── */
export const basicModuleSkills: PlanSkill[] = [
  // ── Computer Science Basic Module ──────────────────────────────
  {
    name: 'Core Programming Logic & Syntax',
    slug: 'core-programming-logic',
    grouping: 'Programming Foundations',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '1-Beginner',
    toolsets: 'Python / Java / C++ / C',
    aoi: 'Computer Science Basic',
  },
  {
    name: 'Data Structures & Algorithm Design',
    slug: 'dsa',
    grouping: 'Programming Foundations',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '1-Beginner',
    prerequisite: 'Core Programming Logic & Syntax',
    toolsets: 'Python Built-ins / Java Collections / C++ STL / LeetCode / HackerRank',
    aoi: 'Computer Science Basic',
  },
  {
    name: 'Version Control Systems (VCS)',
    slug: 'vcs',
    grouping: 'Programming Foundations',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '1-Beginner',
    toolsets: 'GitHub / GitLab / Bitbucket / Git / SVN',
    aoi: 'Computer Science Basic',
  },
  {
    name: 'REST API Design & Integration',
    slug: 'rest-api',
    grouping: 'Backend Development',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '2-Intermediate',
    toolsets: 'FastAPI / Express.js / Django REST Framework / Flask / Postman / Swagger',
    aoi: 'Computer Science Basic',
  },
  {
    name: 'Database Management System',
    slug: 'dbms',
    grouping: 'Data Foundations',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '1-Beginner',
    toolsets: 'PostgreSQL / MySQL / MongoDB / DynamoDB / Redis',
    aoi: 'Computer Science Basic',
  },
  {
    name: 'System Design & Architecture',
    slug: 'system-design',
    grouping: 'System Design & Architecture',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '2-Intermediate',
    prerequisite: 'Data Structures & Algorithm Design',
    toolsets: 'Microservices / Serverless / Lucidchart / Draw.io / UML',
    aoi: 'Computer Science Basic',
  },
  {
    name: 'Containerization & Deployment',
    slug: 'containerization',
    grouping: 'Cloud & Infrastructure',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '2-Intermediate',
    toolsets: 'Docker / Containerd / Kubernetes / Docker Swarm',
    aoi: 'Computer Science Basic',
  },
  {
    name: 'CI/CD',
    slug: 'cicd',
    grouping: 'Cloud & Infrastructure',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '2-Intermediate',
    toolsets: 'GitHub Actions / GitLab CI / Azure DevOps / Jenkins / CircleCI',
    aoi: 'Computer Science Basic',
  },
  {
    name: 'Cloud Fundamentals',
    slug: 'cloud-fundamentals',
    grouping: 'Cloud & Infrastructure',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '1-Beginner',
    toolsets: 'AWS / Azure / GCP / IBM Cloud / Oracle OCI',
    aoi: 'Computer Science Basic',
  },
  {
    name: 'SDLC & Agile Practices',
    slug: 'sdlc-agile',
    grouping: 'SDLC & Agile',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '1-Beginner',
    toolsets: 'GitHub / Azure DevOps / Jira / Confluence / Scrum / Kanban',
    aoi: 'Computer Science Basic',
  },
  {
    name: 'AI-Assisted Code Generation',
    slug: 'ai-code-gen',
    grouping: 'AI / ML Skills',
    category: 'AI/ML',
    criticality: 'Extra edge',
    proficiency: '1-Beginner',
    toolsets: 'GitHub Copilot / Cursor / Amazon CodeWhisperer',
    aoi: 'Computer Science Basic',
  },
  {
    name: 'Generative AI & Prompt Engineering',
    slug: 'gen-ai-prompt',
    grouping: 'AI / ML Skills',
    category: 'AI/ML',
    criticality: 'Extra edge',
    proficiency: '1-Beginner',
    toolsets: 'OpenAI API / Anthropic API / Gemini API / LangChain / LlamaIndex',
    aoi: 'Computer Science Basic',
  },
  {
    name: 'LLM Integration & Feature Development',
    slug: 'llm-integration',
    grouping: 'AI / ML Skills',
    category: 'AI/ML',
    criticality: 'Extra edge',
    proficiency: '2-Intermediate',
    toolsets: 'OpenAI API / LangChain / LlamaIndex / Pinecone / Weaviate / Milvus',
    aoi: 'Computer Science Basic',
  },
  {
    name: 'AI Governance & Ethics',
    slug: 'ai-governance',
    grouping: 'AI / ML Skills',
    category: 'AI/ML',
    criticality: 'Extra edge',
    proficiency: '1-Beginner',
    toolsets: 'NIST AI RMF / EU AI Act / MITRE ATLAS',
    aoi: 'Computer Science Basic',
  },
  {
    name: 'Statistical Analysis & Model Assessment',
    slug: 'statistical-analysis',
    grouping: 'Analysis & Statistics',
    category: 'Technical',
    criticality: 'Extra edge',
    proficiency: '2-Intermediate',
    toolsets: 'SciPy / Python Statsmodels / R / SQL / Excel',
    aoi: 'Computer Science Basic',
  },

  // ── Mechanical Basic Module ────────────────────────────────────
  {
    name: '3D Parametric Modeling & Mechanical Design',
    slug: '3d-parametric-modeling',
    grouping: 'CAD & Mechanical Design',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '1-Beginner',
    toolsets: 'SolidWorks / CATIA / Siemens NX / Autodesk Inventor',
    aoi: 'Mechanical Basic',
  },
  {
    name: 'Technical Drafting & GD&T',
    slug: 'technical-drafting-gdt',
    grouping: 'CAD & Mechanical Design',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '1-Beginner',
    toolsets: 'AutoCAD / DraftSight / CATIA Drafting',
    aoi: 'Mechanical Basic',
  },
  {
    name: 'Mechanism Design & Kinematic-Dynamic Simulation',
    slug: 'mechanism-design',
    grouping: 'CAD & Mechanical Design',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '2-Intermediate',
    toolsets: 'SolidWorks Motion / Siemens NX Motion',
    aoi: 'Mechanical Basic',
  },
  {
    name: 'Material Selection & Characterization',
    slug: 'material-selection',
    grouping: 'Materials & Selection',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '1-Beginner',
    toolsets: 'Ansys Granta MI / CES Selector / Granta EduPack',
    aoi: 'Mechanical Basic',
  },
  {
    name: 'Design for Manufacturing & Assembly (DfMA)',
    slug: 'dfma',
    grouping: 'Manufacturing Processes',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '2-Intermediate',
    toolsets: 'SolidWorks / CATIA / Siemens NX',
    aoi: 'Mechanical Basic',
  },
  {
    name: 'Reliability & Failure Analysis (FMEA)',
    slug: 'fmea',
    grouping: 'Reliability & Maintenance',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '2-Intermediate',
    toolsets: 'ReliaSoft / Isograph Reliability Workbench / PTC Windchill FTA',
    aoi: 'Mechanical Basic',
  },
  {
    name: 'Additive Manufacturing & Rapid Prototyping',
    slug: 'additive-manufacturing',
    grouping: 'Manufacturing Processes',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '1-Beginner',
    toolsets: 'Ultimaker Cura / PreForm / GrabCAD Print',
    aoi: 'Mechanical Basic',
  },
  {
    name: 'Jig, Fixture & Tooling Design',
    slug: 'jig-fixture-tooling',
    grouping: 'Manufacturing Processes',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '2-Intermediate',
    toolsets: 'SolidWorks / CATIA V5 / Autodesk Inventor',
    aoi: 'Mechanical Basic',
  },
  {
    name: 'Engineering Scripting & Automation',
    slug: 'engineering-scripting',
    grouping: 'Engineering Computing',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '1-Beginner',
    toolsets: 'Python / MATLAB',
    aoi: 'Mechanical Basic',
  },
  {
    name: 'Computational Fluid Dynamics (CFD)',
    slug: 'cfd',
    grouping: 'Fluid Dynamics & Thermal',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '2-Intermediate',
    toolsets: 'ANSYS Fluent / STAR-CCM+ / OpenFOAM / ANSYS CFX',
    aoi: 'Mechanical Basic',
  },
  {
    name: 'Statistical Process Control (SPC)',
    slug: 'spc',
    grouping: 'Quality & Metrology',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '1-Beginner',
    toolsets: 'Minitab / JMP / Python (Pandas/Pingouin)',
    aoi: 'Mechanical Basic',
  },
  {
    name: 'PLC Programming & Industrial Automation',
    slug: 'plc-programming',
    grouping: 'Industrial Automation & PLC',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '2-Intermediate',
    toolsets: 'Siemens TIA Portal / Rockwell Studio 5000 / Codesys',
    aoi: 'Mechanical Basic',
  },
  {
    name: 'HMI & SCADA Development',
    slug: 'hmi-scada',
    grouping: 'Industrial Automation & PLC',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '2-Intermediate',
    prerequisite: 'PLC Programming & Industrial Automation',
    toolsets: 'Ignition / Siemens WinCC / Wonderware AVEVA',
    aoi: 'Mechanical Basic',
  },
  {
    name: 'Python Programming for Engineering',
    slug: 'python-engineering',
    grouping: 'Engineering Computing',
    category: 'Technical',
    criticality: 'Mandatory',
    proficiency: '2-Intermediate',
    prerequisite: 'Engineering Scripting & Automation',
    toolsets: 'Python (Pandas/NumPy/SciPy) / VS Code / PyCharm / Jupyter Notebook',
    aoi: 'Mechanical Basic',
  },
  {
    name: 'Predictive Maintenance Modeling',
    slug: 'predictive-maintenance',
    grouping: 'AI / ML Skills',
    category: 'AI/ML',
    criticality: 'Extra edge',
    proficiency: '2-Intermediate',
    prerequisite: 'Engineering Scripting & Automation',
    toolsets: 'Python (Scikit-learn) / MATLAB Predictive Maintenance Toolbox',
    aoi: 'Mechanical Basic',
  },
  {
    name: 'Computer Vision for Quality Inspection',
    slug: 'computer-vision-quality',
    grouping: 'AI / ML Skills',
    category: 'AI/ML',
    criticality: 'Extra edge',
    proficiency: '2-Intermediate',
    prerequisite: 'Engineering Scripting & Automation',
    toolsets: 'PyTorch / TensorFlow / OpenCV',
    aoi: 'Mechanical Basic',
  },
];

/* ── Skill computation helper ────────────────────────────────────── */
function computePlan(areas: string[], durId: string | null) {
  const duration = durId ? (durationMap[durId] ?? null) : null;

  // Collect skills for selected areas
  let skills: PlanSkill[] = [];
  for (const area of areas) {
    if (area === 'Computer Science') {
      skills.push(...basicModuleSkills.filter((s) => s.aoi === 'Computer Science Basic'));
    } else if (area === 'Mechanical Engineering') {
      skills.push(...basicModuleSkills.filter((s) => s.aoi === 'Mechanical Basic'));
    } else {
      skills.push(...allAoiSkillsForCalc.filter((s) => s.aoi === area));
    }
  }

  // Deduplicate by slug
  const seen = new Set<string>();
  skills = skills.filter((s) => {
    if (seen.has(s.slug)) return false;
    seen.add(s.slug);
    return true;
  });

  // Sort: Mandatory first, then by proficiency
  skills.sort((a, b) => {
    if (a.criticality !== b.criticality) return a.criticality === 'Mandatory' ? -1 : 1;
    return a.proficiency.localeCompare(b.proficiency);
  });

  // Distribute skills into weekly groups
  const totalWeeks = duration ? Math.ceil(duration.totalWeeks) : Math.ceil(skills.length / 3);
  const skillsPerWeek = totalWeeks > 0 ? Math.ceil(skills.length / totalWeeks) : skills.length;

  const weeklySkills: WeeklySkillGroup[] = [];
  for (let w = 0; w < totalWeeks; w++) {
    const weekSkills = skills.slice(w * skillsPerWeek, (w + 1) * skillsPerWeek);
    if (weekSkills.length === 0) break;
    weeklySkills.push({
      week: w + 1,
      label: `Week ${w + 1}`,
      skills: weekSkills,
    });
  }

  return { selectedAreas: areas, duration, skills, weeklySkills };
}

/* ── Context ────────────────────────────────────────────────────── */
interface PlanContextValue {
  selectedAreas: string[];
  track: string;
  duration: DurationInfo | null;
  skills: PlanSkill[];
  weeklySkills: WeeklySkillGroup[];
  /** Call this after writing to sessionStorage to refresh the plan */
  refreshPlan: () => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

/* ── Provider ───────────────────────────────────────────────────── */
function readFromSession(): { areas: string[]; durId: string | null; track: string } {
  const domainRaw = sessionStorage.getItem('plan-domain') || '';
  const durId = sessionStorage.getItem('plan-duration') || null;
  const track = sessionStorage.getItem('plan-track') || 'CS';
  const areas = domainRaw
    ? domainRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  return { areas, durId, track };
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [planData, setPlanData] = useState(() => {
    const { areas, durId, track } = readFromSession();
    return { ...computePlan(areas, durId), track };
  });

  const refreshPlan = useCallback(() => {
    const { areas, durId, track } = readFromSession();
    setPlanData({ ...computePlan(areas, durId), track });
  }, []);

  const value = useMemo<PlanContextValue>(
    () => ({ ...planData, refreshPlan }),
    [planData, refreshPlan],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

/* ── Hook ───────────────────────────────────────────────────────── */
export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within a PlanProvider');
  return ctx;
}
