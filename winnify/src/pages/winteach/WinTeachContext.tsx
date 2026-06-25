import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCourses, useInstitutes } from '@/api/hooks';
import type { Course as ApiCourse, Institute as ApiInstitute } from '@/api/types';
import type { Course, Institute, Topic } from './winteachData';
import { allTopics, topicState, coursePct, topicPct, newArtifacts } from './winteachData';

// Re-export utilities so pages can import from either module
export { allTopics, topicState, coursePct, topicPct };

// Map API course → local Course shape used by all WinTeach pages
function mapApiCourse(c: ApiCourse): Course {
  const units = (c.units ?? []).map((u, ui) => ({
    n: String(ui + 1),
    title: u.title,
    topics: (u.topics ?? []).map(t => ({
      id: t.id,
      name: t.title,
      subs: (t.subtopics ?? []).map(s => s.title),
      co: { text: '', bloom: t.bloom_level ?? 'Apply' },
      artifacts: newArtifacts(),
    })),
  }));

  return {
    id: c.id,
    code: c.code,
    name: c.name,
    status: (c.status as 'draft' | 'active' | 'archived') ?? 'draft',
    institute: '',
    program: '',
    major: '',
    sem: c.semester ?? '',
    credits: c.credits ?? 0,
    regulation: c.regulation ?? '',
    cos: [],
    units,
  } as unknown as Course;
}

function mapApiInstitute(i: ApiInstitute): Institute {
  return {
    id: String(i.id ?? ''),
    name: i.name,
    short: (i as any).short_name ?? (i as any).short ?? '',
    type: (i as any).type ?? 'Engineering',
    location: (i as any).location ?? '',
    regulation: (i as any).regulation ?? '',
    accreditation: (i as any).accreditation ?? '',
    pos: [],
    psos: [],
  };
}

export interface DraftDetails {
  code: string; name: string; institute: string; program: string;
  major: string; sem: string | number; credits: string | number; regulation: string;
}

export interface Draft {
  mode: 'create' | 'edit';
  step: number;
  target?: Course;
  details: DraftDetails;
  method: 'upload' | 'paste';
  fileName: string;
  extracted: Course | null;
  delta: Array<{ text: string; bloom: string; unit: string; state: string }>;
  coSuggest?: Array<{ text: string; bloom: string; state: string }>;
  coSuggestOpen?: boolean;
  addTopics?: Array<{ cat: string; name: string; subs: string[]; co: string; bloom: string; state: string }>;
  addTopicsOpen?: boolean;
  uploadId?: string;
}

interface WinTeachContextValue {
  courses: Course[];
  coursesLoading: boolean;
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  institutes: Institute[];
  institutesLoading: boolean;
  setInstitutes: React.Dispatch<React.SetStateAction<Institute[]>>;
  currentCourse: Course | null;
  setCurrentCourse: React.Dispatch<React.SetStateAction<Course | null>>;
  currentTopic: Topic | null;
  setCurrentTopic: React.Dispatch<React.SetStateAction<Topic | null>>;
  currentInst: string | null;
  setCurrentInst: React.Dispatch<React.SetStateAction<string | null>>;
  draft: Draft | null;
  setDraft: React.Dispatch<React.SetStateAction<Draft | null>>;
  toast: (msg: string) => void;
  toastMsg: string;
  runTopicFlow: (t: Topic, onTick?: () => void) => void;
}

const WinTeachContext = createContext<WinTeachContextValue | null>(null);

export function WinTeachProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();

  const { data: apiCourses = [], isLoading: coursesLoading } = useCourses();
  const { data: apiInstitutes = [], isLoading: institutesLoading } = useInstitutes();

  // Local override state — used while mutations are in-flight or backend unavailable
  const [localCourses, setLocalCourses] = useState<Course[] | null>(null);
  const [localInstitutes, setLocalInstitutes] = useState<Institute[] | null>(null);

  const courses: Course[] = localCourses ?? apiCourses.map(mapApiCourse);
  const institutes: Institute[] = localInstitutes ?? apiInstitutes.map(mapApiInstitute);

  const setCourses: React.Dispatch<React.SetStateAction<Course[]>> = (action) => {
    setLocalCourses(prev => {
      const base = prev ?? apiCourses.map(mapApiCourse);
      return typeof action === 'function' ? action(base) : action;
    });
  };
  const setInstitutes: React.Dispatch<React.SetStateAction<Institute[]>> = (action) => {
    setLocalInstitutes(prev => {
      const base = prev ?? apiInstitutes.map(mapApiInstitute);
      return typeof action === 'function' ? action(base) : action;
    });
  };

  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [currentInst, setCurrentInst] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2600);
  }, []);

  const runTopicFlow = useCallback((t: Topic, onTick?: () => void) => {
    t.artifacts.notes = Math.max(t.artifacts.notes, 5);
    onTick?.();
    const n = setInterval(() => {
      t.artifacts.notes = Math.min(100, t.artifacts.notes + 20);
      onTick?.();
      if (t.artifacts.notes >= 100) {
        clearInterval(n);
        (['preassess', 'quiz', 'flash'] as const).forEach(k => {
          t.artifacts[k] = Math.max(t.artifacts[k], 5);
          const iv = setInterval(() => {
            t.artifacts[k] = Math.min(100, Math.round(t.artifacts[k] + 14 + Math.random() * 10));
            onTick?.();
            if (t.artifacts[k] >= 100) {
              t.artifacts[k] = 100;
              clearInterval(iv);
              if (topicState(t) === 'ready') {
                toast(`${t.name} · all artifacts ready`);
                qc.invalidateQueries({ queryKey: ['courses'] });
              }
            }
          }, 360 + Math.random() * 200);
        });
      }
    }, 380);
  }, [toast, qc]);

  return (
    <WinTeachContext.Provider value={{
      courses, coursesLoading, setCourses,
      institutes, institutesLoading, setInstitutes,
      currentCourse, setCurrentCourse,
      currentTopic, setCurrentTopic,
      currentInst, setCurrentInst,
      draft, setDraft,
      toast, toastMsg,
      runTopicFlow,
    }}>
      {children}
    </WinTeachContext.Provider>
  );
}

export function useWinTeach() {
  const ctx = useContext(WinTeachContext);
  if (!ctx) throw new Error('useWinTeach must be inside WinTeachProvider');
  return ctx;
}
