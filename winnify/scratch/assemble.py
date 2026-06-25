# Python compiler/assembler script for Learning.tsx
import os
import re

base_dir = r"D:\Projects\winnify\winnify_90day_plan\winnify\_extracted"
html_path = r"D:\Projects\winnify\winnify_90day_plan\winnify\Slog Overs _standalone_ (4) (1).html"
output_file = r"D:\Projects\winnify\winnify_90day_plan\winnify\src\pages\Learning.tsx"

files_in_order = [
    '940bdbe7.js',   # Data/WINNIFY globals  
    '5b83ac2a.js',   # Icons
    '008a4e42.js',   # Shared UI (Sidebar, Topbar, Modal, Toast, PhaseChip, Pct, Placeholder)
    '2d2aeb7f.js',   # SO-01/SO-02 Sessions list
    '314abc03.js',   # Setup wizard (slog:setup-1, slog:setup-2, slog:setup-3)
    '8ba314cc.js',   # Dashboard (slog:dashboard)
    '196b715e.js',   # Phase screens (slog:phase, PhaseBar, PowerplayBody, FinalOverBody)
    '7b27f3d0.js',   # Cluster/Powerplay detail (slog:cluster, slog:adaptive)
    '34b08add.js',   # Interview Prep (slog:interview-prep, slog:powerplay-topic)
    '6d396665.js',   # Utilities (WUTIL, FO helpers)
    'e2c6e3f6.js',   # Acceleration (slog:acceleration, AccelerationBody)
    'cb7b75b0.js',   # Final Over extras (slog:mock, slog:mock-assessment, slog:gd-simulation)
    '5799e759.js',   # Resume (slog:resume)
    '03bacb41.js',   # Modals + misc screens (Day View, FO complete, etc.)
    '7cbbf429.js',   # App root / router
    '176bd1e1.js',   # Interview Cues (slog:interview-cues)
]

print("Extracting SLOG_CSS from current Learning.tsx...")
css_content = ""
current_file = r"D:\Projects\winnify\winnify_90day_plan\winnify\src\pages\Learning.tsx"
if os.path.exists(current_file):
    with open(current_file, "r", encoding="utf-8") as f:
        content = f.read()
    match = re.search(r"const SLOG_CSS = `(.*?)`;", content, re.DOTALL)
    if match:
        css_content = match.group(1).strip()
        print(f"Extracted {len(css_content)} bytes of CSS from current Learning.tsx.")
    else:
        print("Could not find SLOG_CSS in current Learning.tsx!")
else:
    print("Current Learning.tsx does not exist!")

# Write TypeScript/React header
header = """// @ts-nocheck
import React, { useState, useEffect, useContext, createContext, useCallback, useMemo, useRef } from 'react';

/* ── CSS ─────────────────────────────────────────────────────── */
const SLOG_CSS = `
""" + css_content + """
`;

/* ── Types ──────────────────────────────────────────────────── */
interface Round { id: string; name: string; kind: 'OA'|'Technical'|'Behavioural'|'GD'; }
interface Phase { start: number; end: number; progress: number; skipped?: boolean; }
interface FoundationCluster { progress: number; lastActive: string; }
interface ResumeGap { id: string; text: string; status: 'open'|'resolved'; }

interface FinalOverState {
  cuesViewed: boolean;
  quickTipsViewed: boolean;
  mockAssessment: {
    complete: boolean;
    score: number|null;
    aptitudeScore: number|null;
    technicalScore: number|null;
    lastRunAt: string|null;
  };
  mockInterview: {
    runCount: number;
    completedRounds: string[];
    lastRoundIndex: number;
    lastRunAt: string|null;
    lastDebrief: any;
    roundScores: Record<string, number>;
  };
  gdSimulation: {
    complete: boolean;
    runCount: number;
    lastDebrief: any;
    lastRunAt: string|null;
  };
}

interface AccelState {
  checked: string[];
  lastTriageScore: number|null;
  listOrderVersion: number;
  technicalProgress: number;
  behavioralProgress: number;
  aptitudeProgress: number;
  flags: string[];
  adHocCompleted: string[];
}

interface Session {
  id: string; role: string; company: string; targetDate: string; createdAt: string;
  status: 'active'|'expired'|'archived'; activePhase: string;
  rounds: Round[];
  oaSubType?: string|null;
  startingPhase?: string;
  aiRecommendedPhase?: string;
  phases: { powerplay: Phase; acceleration: Phase; finalOver: Phase; };
  foundation: { dsa: FoundationCluster; dbms: FoundationCluster; os: FoundationCluster; networking: FoundationCluster; systemDesign: FoundationCluster; };
  interviewPrep: { technical: number; behavioural: number; };
  resume: { uploaded: boolean; gaps: ResumeGap[]; };
  heatmap: number[];
  finalOver: FinalOverState;
  acceleration: AccelState;
}

interface AccelItem { id: string; topic: string; cluster: string; type: 'Foundation'|'InterviewPrep'; freq: 'High'|'Medium'; rank: number; focus?: boolean; prevCompleted?: boolean; round?: string; }
interface AppRoute { screen: string; params: Record<string,any>; }
interface AppState {
  sessions: Session[]; draft: any; generating: boolean; quizDone: Record<string,any>; dismissed: string[]; offline: boolean;
  firstVisit?: boolean;
}
interface ModalState { kind: string; [key: string]: any; }
interface AppCtxType {
  route: AppRoute; go: (screen: string, params?: Record<string,any>) => void;
  state: AppState; setState: (patch: Partial<AppState>) => void;
  modal: ModalState|null; openModal: (m: ModalState) => void; closeModal: () => void;
  toast: string; showToast: (msg: string) => void;
  tweaks: Record<string,string>; setTweak: (k: string, v: string) => void;
}
"""

body_parts = []

for fname in files_in_order:
    fpath = os.path.join(base_dir, fname)
    if not os.path.exists(fpath):
        print(f"WARNING: File {fname} not found!")
        continue
    print(f"Processing {fname}...")
    with open(fpath, "r", encoding="utf-8") as f:
        code = f.read()

    # Apply file-specific cleanups
    if fname == '940bdbe7.js':
        # Data file: extract addDays and seedHeatmap and put them at the top
        add_days_original = """function addDays(n) {
  const d = new Date();
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() + n);
  return d.toISOString();
}"""
        seed_heatmap_original = """function seedHeatmap(bias = 0.45) {
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
}"""
        add_days_code = """function addDays(n: number): string {
  const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+n); return d.toISOString();
}"""
        seed_heatmap_code = """function seedHeatmap(bias = 0.45): number[] {
  const cells: number[] = [];
  for (let i = 0; i < 20 * 7; i++) {
    const r = Math.random();
    let v = 0;
    if (r < bias - 0.25) v = 0;
    else if (r < bias) v = 1;
    else if (r < bias + 0.18) v = 2;
    else if (r < bias + 0.30) v = 3;
    else v = 4;
    cells.push(v);
  }
  return cells;
}"""
        # Remove original definitions from code
        code = code.replace(add_days_original, "")
        code = code.replace(seed_heatmap_original, "")
        
        # Change window.WINNIFY to const WINNIFY
        code = code.replace("window.WINNIFY = {", "const WINNIFY: any = {")
        code = code.replace("window.WUTIL = {", "const WUTIL: any = {")
        
        # Append window bindings
        code = add_days_code + "\n" + seed_heatmap_code + "\n" + code
        code += "\n(window as any).WINNIFY = WINNIFY;\n(window as any).WUTIL = WUTIL;\n"

    elif fname == '34b08add.js':
        # Interview Prep
        code = code.replace("function ScreenMock(", "function ScreenMockLegacy(")
        code = code.replace("window.ScreenMock = ScreenMock;", "(window as any).ScreenMockLegacy = ScreenMockLegacy;")

    elif fname == '03bacb41.js':
        # Acceleration
        code = code.replace("window.ACC = {", "const ACC: any = {")
        code += "\n(window as any).ACC = ACC;\n"

    elif fname == '008a4e42.js':
        # Shared UI
        code = re.sub(r"const\s*\{\s*useState.*\}\s*=\s*React\s*;", "", code)
        code = code.replace("const AppCtx = createContext(null);", "const AppCtx = createContext<any>(null);")
        code = code.replace("window.AppCtx = AppCtx;", "(window as any).AppCtx = AppCtx;")
        code = code.replace("window.useApp = useApp;", "(window as any).useApp = useApp;")
        code = code.replace("window.UI = { Modal, Toast, Topbar, Sidebar, PhaseChip, Pct, Placeholder };",
                            "const UI: any = { Modal, Toast, Topbar, Sidebar, PhaseChip, Pct, Placeholder }; (window as any).UI = UI;")

    # Comment out standard React destructurings
    code = re.sub(r"const\s*\{\s*useState.*\}\s*=\s*React\s*;", "", code)
    code = re.sub(r"const\s*\{\s*useState.*\}\s*=\s*React\s*", "", code)

    # Cast window.Name = Name to (window as any).Name = Name
    code = re.sub(r'window\.([a-zA-Z0-9_]+)\s*=\s*\1\b', r'(window as any).\1 = \1', code)

    # Convert JS function component parameters to any-typed
    code = re.sub(r"function\s+([A-Z][a-zA-Z0-9_]*)\s*\(\s*\{\s*([^}]+)\}\s*\)", r"function \1({\2}: any)", code)
    code = re.sub(r"function\s+([A-Z][a-zA-Z0-9_]*)\s*\(\s*([a-zA-Z0-9_]+)\s*\)", r"function \1(\2: any)", code)

    # Strip App root rendering and export App from 176bd1e1.js
    if fname == '176bd1e1.js':
        code = code.replace('ReactDOM.createRoot(document.getElementById("root")).render(<App/>);', "")
        code = code.replace("function App() {", "export default function Learning() {")
        code = code.replace('<div className="app">\n        <UI.Sidebar/>\n        <main className="main">\n          <ScreenRouter/>\n        </main>\n      </div>\n      {state.generating && <GeneratingOverlay/>}\n      <ModalRouter/>\n      <OfflineBanner/>\n      <UI.Toast msg={toast} onDone={() => setToast("")}/>\n      <TweaksPanel/>',
                            '<style>{SLOG_CSS}</style>\n      <div className="slog-root">\n        <div className="main">\n          <ScreenRouter/>\n        </div>\n        {state.generating && <GeneratingOverlay/>}\n        <ModalRouter/>\n        <OfflineBanner/>\n        <UI.Toast msg={toast} onDone={() => setToast("")}/>\n        <TweaksPanel/>\n      </div>')

    body_parts.append(code)

# Combine everything
full_code = header + "\n" + "\n".join(body_parts)

# Let's perform a few global fixups
# 1. Any stray 'window.FO' in e2c6e3f6.js is already compiled but let's make sure 'FO' is locally referenced too
full_code = full_code.replace("window.FO = {", "const FO: any = {")
full_code += "\n(window as any).FO = FO;\n"

# 2. Rename h-2 and h-3 to slog-h2 and slog-h3 to avoid clashes with Tailwind CSS height utility classes
print("Renaming h-2/h-3 classes to slog-h2/slog-h3 to prevent Tailwind clashes...")
full_code = full_code.replace(".h-2{", ".slog-h2{").replace(".h-3{", ".slog-h3{")
full_code = full_code.replace(".h-2 {", ".slog-h2 {").replace(".h-3 {", ".slog-h3 {")
full_code = re.sub(r'className="([^"]*)\bh-2\b([^"]*)"', r'className="\1slog-h2\2"', full_code)
full_code = re.sub(r'className="([^"]*)\bh-3\b([^"]*)"', r'className="\1slog-h3\2"', full_code)

# Let's write the file out
with open(output_file, "w", encoding="utf-8") as f:
    f.write(full_code)

print("Learning.tsx generated successfully.")
