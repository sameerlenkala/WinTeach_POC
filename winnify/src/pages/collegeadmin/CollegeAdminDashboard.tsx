import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Zap, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardSummary, useCourses } from '@/api/hooks';

const T = { brand: '#6C5CE7', brandBg: 'rgba(108,92,231,0.10)', card: '#fff', border: '#E6E5F0', text: '#1A1A22', text2: 'rgba(26,26,34,0.60)', fontD: 'var(--font-display)', r5: 20, shadow: '0 1px 2px rgba(20,20,50,.04),0 8px 24px -12px rgba(60,50,140,.12)' };

export default function CollegeAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const { data: summary, isLoading: sumLoading } = useDashboardSummary();
  const { data: courses = [], isLoading: coursesLoading } = useCourses();

  const courseCount = summary?.course_count ?? courses.length;
  const activeCourses = courses.filter(c => c.status === 'active').length;
  const draftCourses = courses.filter(c => c.status === 'draft').length;
  const genPct = courseCount > 0 ? Math.round((activeCourses / courseCount) * 100) : 0;

  const kpis = [
    { icon: Users,         label: 'Students',  value: '—',                            sub: 'Managed by institute',           color: '#6C5CE7', bg: 'rgba(108,92,231,0.10)', path: '/admin/users' },
    { icon: GraduationCap, label: 'Faculty',   value: '—',                            sub: 'Invite faculty below',           color: '#F6A623', bg: 'rgba(246,166,35,0.12)', path: '/admin/users' },
    { icon: BookOpen,      label: 'Courses',   value: sumLoading ? '…' : courseCount, sub: `${activeCourses} active · ${draftCourses} draft`, color: '#00B894', bg: 'rgba(0,184,148,0.12)', path: '/admin/courses' },
    { icon: Zap,           label: 'Generated', value: sumLoading ? '…' : `${genPct}%`, sub: 'Content pipeline progress',    color: '#E84393', bg: 'rgba(232,67,147,0.10)', path: '/admin/courses' },
  ];

  return (
    <div style={{ padding: '0 36px 40px' }}>
      <div style={{ height: 8 }} />
      <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 28, marginBottom: 4 }}>College Overview</div>
      <div style={{ fontSize: 14, color: T.text2, marginBottom: 28 }}>{greet}, {user?.name?.split(' ')[0]} — here's your college at a glance.</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {kpis.map(({ icon: Icon, label, value, sub, color, bg, path }) => (
          <button key={label} onClick={() => navigate(path)} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.r5, padding: 20, boxShadow: T.shadow, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', width: '100%', cursor: 'pointer' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} color={color} />
            </div>
            <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 30 }}>{value}</div>
            <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 13.5 }}>{label}</div>
            <div style={{ fontSize: 12, color: T.text2 }}>{sub}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent courses */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.r5, padding: 28, boxShadow: T.shadow }}>
          <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 17, marginBottom: 16 }}>Recent courses</div>
          {coursesLoading ? (
            <div style={{ color: T.text2, fontSize: 14 }}>Loading…</div>
          ) : courses.length === 0 ? (
            <div style={{ color: T.text2, fontSize: 14 }}>No courses yet. Ask faculty to create one.</div>
          ) : (
            courses.slice(0, 4).map((c, i) => (
              <div key={c.id} style={{ padding: '12px 0', borderTop: i > 0 ? `1px solid ${T.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 14 }}>{c.code}</div>
                  <div style={{ fontSize: 12.5, color: T.text2 }}>{c.name}</div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 48, fontSize: 12, fontWeight: 600, background: c.status === 'active' ? 'rgba(0,184,148,0.12)' : 'rgba(246,166,35,0.12)', color: c.status === 'active' ? '#00B894' : '#D4850A' }}>
                  {c.status ?? 'draft'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Quick actions */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.r5, padding: 28, boxShadow: T.shadow }}>
          <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 17, marginBottom: 16 }}>Quick actions</div>
          {[
            { label: 'Invite faculty member', onClick: () => navigate('/admin/users') },
            { label: 'View all courses',       onClick: () => navigate('/admin/courses') },
            { label: 'Manage students',        onClick: () => navigate('/admin/users') },
          ].map(({ label, onClick }) => (
            <button key={label} onClick={onClick} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${T.border}`, background: '#F8F7FF', marginBottom: 8, fontFamily: T.fontD, fontWeight: 600, fontSize: 14, cursor: 'pointer', color: T.text }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
