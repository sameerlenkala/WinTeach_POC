import { useState } from 'react';
import { BookOpen, Search, ChevronRight, Clock, Layers } from 'lucide-react';
import { useCourses } from '@/api/hooks';

const T = {
  brand: '#6C5CE7', brandBg: 'rgba(108,92,231,0.10)',
  card: '#fff', border: '#E6E5F0', text: '#1A1A22',
  text2: 'rgba(26,26,34,0.60)', text3: 'rgba(26,26,34,0.35)',
  green: '#00B894', greenBg: 'rgba(0,184,148,0.10)',
  orange: '#F6A623', orangeBg: 'rgba(246,166,35,0.10)',
  red: '#E84393', redBg: 'rgba(232,67,147,0.10)',
  fontD: 'var(--font-display)',
  r5: 20, shadow: '0 1px 2px rgba(20,20,50,.04),0 8px 24px -12px rgba(60,50,140,.12)',
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    active:  { bg: T.greenBg,  fg: T.green,  label: 'Active' },
    draft:   { bg: T.orangeBg, fg: T.orange, label: 'Draft' },
    locked:  { bg: 'rgba(108,92,231,0.10)', fg: T.brand, label: 'Locked' },
  };
  const s = map[status] ?? map.draft;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 8, background: s.bg, color: s.fg, fontSize: 11.5, fontWeight: 600, fontFamily: T.fontD }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {s.label}
    </span>
  );
}

export default function CollegeAdminCourses() {
  const { data: courses = [], isLoading } = useCourses();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'draft'>('all');

  const filtered = courses.filter(c => {
    const matchSearch = !search || `${c.code} ${c.name}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const activeCount = courses.filter(c => c.status === 'active').length;
  const draftCount = courses.filter(c => c.status === 'draft').length;

  return (
    <div style={{ padding: '0 36px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '28px 0 20px' }}>
        <div>
          <div style={{ fontFamily: T.fontD, fontWeight: 700, fontSize: 24, color: T.text, marginBottom: 4 }}>Courses</div>
          <div style={{ fontSize: 14, color: T.text2 }}>
            {courses.length} courses · {activeCount} active · {draftCount} draft
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ flex: 1, maxWidth: 360, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.text3 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by code or name…"
            style={{ width: '100%', paddingLeft: 36, paddingRight: 14, height: 38, border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13.5, outline: 'none', background: '#fff', boxSizing: 'border-box', color: T.text }}
          />
        </div>
        {(['all', 'active', 'draft'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '7px 16px', borderRadius: 10, border: `1.5px solid ${filter === f ? T.brand : T.border}`,
              background: filter === f ? T.brandBg : '#fff', color: filter === f ? T.brand : T.text2,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: T.fontD, textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Course list */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 130, borderRadius: T.r5, background: '#F3F3F8', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: T.card, borderRadius: T.r5, padding: '60px 24px', textAlign: 'center', border: `1px solid ${T.border}` }}>
          <BookOpen size={40} color={T.text3} style={{ margin: '0 auto 14px' }} />
          <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 18, color: T.text, marginBottom: 6 }}>
            {search ? 'No matching courses' : 'No courses yet'}
          </div>
          <div style={{ fontSize: 14, color: T.text2 }}>
            {search ? 'Try a different search.' : 'Courses created by faculty will appear here.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(course => {
            const unitCount = (course as any).units?.length ?? 0;
            const topicCount = ((course as any).units ?? []).reduce((s: number, u: any) => s + (u.topics?.length ?? 0), 0);

            return (
              <div key={course.id} style={{ background: T.card, borderRadius: T.r5, padding: '20px 22px', border: `1px solid ${T.border}`, boxShadow: T.shadow, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 12, color: T.brand, marginBottom: 3 }}>{course.code}</div>
                    <div style={{ fontFamily: T.fontD, fontWeight: 700, fontSize: 16, color: T.text, lineHeight: 1.3 }}>{course.name}</div>
                  </div>
                  <StatusBadge status={course.status ?? 'draft'} />
                </div>

                <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: T.text2 }}>
                  {(course as any).sem && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> Sem {(course as any).sem}
                    </span>
                  )}
                  {unitCount > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Layers size={12} /> {unitCount} units
                    </span>
                  )}
                  {topicCount > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {topicCount} topics
                    </span>
                  )}
                  {(course as any).credits && (
                    <span>{(course as any).credits} credits</span>
                  )}
                </div>

                {/* Progress bar (% of topics with artifacts) */}
                {topicCount > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: T.text2, marginBottom: 4 }}>
                      <span>Content progress</span>
                      <span>{Math.round((course as any).content_pct ?? 0)}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 999, background: '#EBEBF5', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 999, background: T.brand, width: `${(course as any).content_pct ?? 0}%`, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <span style={{ fontSize: 12.5, color: T.text2, flex: 1 }}>
                    {(course as any).programme && <span style={{ color: T.text2 }}>{(course as any).programme}</span>}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: T.text3 }}>
                    View in WinTeach <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
