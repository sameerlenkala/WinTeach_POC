import { useNavigate } from 'react-router-dom';
import { Building2, Users, Zap, PlusCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardSummary, useInstitutes } from '@/api/hooks';

const T = { brand: '#E84393', brandBg: 'rgba(232,67,147,0.10)', card: '#fff', border: '#E6E5F0', text: '#1A1A22', text2: 'rgba(26,26,34,0.60)', fontD: 'var(--font-display)', r5: 20, shadow: '0 1px 2px rgba(20,20,50,.04),0 8px 24px -12px rgba(60,50,140,.12)' };

const KPI = ({ icon: Icon, label, value, sub, color, bg, onClick }: { icon: React.ElementType; label: string; value: string | number; sub: string; color: string; bg: string; onClick?: () => void }) => (
  <button onClick={onClick} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.r5, padding: 20, boxShadow: T.shadow, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', width: '100%', cursor: onClick ? 'pointer' : 'default' }}>
    <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={20} color={color} />
    </div>
    <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 30 }}>{value}</div>
    <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 13.5 }}>{label}</div>
    <div style={{ fontSize: 12, color: T.text2 }}>{sub}</div>
  </button>
);

function Skeleton({ w = '100%', h = 20 }: { w?: string | number; h?: number }) {
  return <div style={{ width: w, height: h, borderRadius: 8, background: 'rgba(100,90,180,0.08)', animation: 'pulse 1.5s ease-in-out infinite' }} />;
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const { data: summary, isLoading: sumLoading } = useDashboardSummary();
  const { data: institutes = [], isLoading: instLoading } = useInstitutes();

  const courseCount = summary?.course_count ?? 0;
  const instCount = summary?.institute_count ?? institutes.length;
  const generatingCount = summary?.generating_count ?? 0;

  return (
    <div style={{ padding: '0 36px 40px' }}>
      <div style={{ height: 8 }} />
      <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 28, marginBottom: 4 }}>Platform Overview</div>
      <div style={{ fontSize: 14, color: T.text2, marginBottom: 28 }}>
        {greet}, {user?.name?.split(' ')[0]} — here's the Winnify platform at a glance.
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPI icon={Building2} label="Colleges" value={sumLoading ? '…' : instCount} sub={`${instCount} active`} color={T.brand} bg={T.brandBg} onClick={() => navigate('/superadmin/colleges')} />
        <KPI icon={Users} label="Total Users" value="—" sub="View by college" color="#5B4BDB" bg="rgba(91,75,219,0.10)" onClick={() => navigate('/superadmin/users')} />
        <KPI icon={Zap} label="Courses" value={sumLoading ? '…' : courseCount} sub={`${generatingCount} generating now`} color="#F6A623" bg="rgba(246,166,35,0.12)" />
        <KPI icon={ShieldCheck} label="Admins" value="—" sub="Invite via Users tab" color="#00B894" bg="rgba(0,184,148,0.12)" onClick={() => navigate('/superadmin/users')} />
      </div>

      {/* Quick actions */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.r5, padding: 24, boxShadow: T.shadow, marginBottom: 24 }}>
        <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 17, marginBottom: 16 }}>Quick actions</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Add college',       Icon: Building2,   onClick: () => navigate('/superadmin/colleges') },
            { label: 'Invite admin',      Icon: PlusCircle,  onClick: () => navigate('/superadmin/users') },
            { label: 'Invite superadmin', Icon: ShieldCheck, onClick: () => navigate('/superadmin/users') },
          ].map(({ label, Icon, onClick }) => (
            <button key={label} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 18px', borderRadius: 10, background: T.brandBg, border: `1.5px solid ${T.brand}`, color: T.brand, fontFamily: T.fontD, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Colleges table */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.r5, padding: '8px 12px', boxShadow: T.shadow }}>
        <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 14, color: T.text2, padding: '14px 8px 6px' }}>Registered colleges</div>
        {instLoading ? (
          <div style={{ padding: '24px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} h={18} />)}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['College', 'City', 'Regulation', 'Affiliation'].map(h => (
                <th key={h} style={{ textAlign: 'left', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(26,26,34,0.45)', padding: '0 16px 12px', borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {institutes.length ? institutes.map((inst, i) => (
                <tr key={inst.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/superadmin/colleges')}>
                  <td style={{ padding: 16, borderBottom: i < institutes.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                    <div style={{ fontFamily: T.fontD, fontWeight: 700, fontSize: 14 }}>{inst.name}</div>
                    <div style={{ fontSize: 12, color: T.text2 }}>{inst.short_name}</div>
                  </td>
                  <td style={{ padding: 16, borderBottom: i < institutes.length - 1 ? `1px solid ${T.border}` : 'none', fontSize: 13, color: T.text2 }}>{inst.city || '—'}</td>
                  <td style={{ padding: 16, borderBottom: i < institutes.length - 1 ? `1px solid ${T.border}` : 'none', fontSize: 13, color: T.text2 }}>{inst.regulation || '—'}</td>
                  <td style={{ padding: 16, borderBottom: i < institutes.length - 1 ? `1px solid ${T.border}` : 'none', fontSize: 13, color: T.text2 }}>{inst.affiliation || '—'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{ padding: 24, textAlign: 'center', fontSize: 14, color: T.text2 }}>
                    No colleges yet.{' '}
                    <button onClick={() => navigate('/superadmin/colleges')} style={{ color: T.brand, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Add one →</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
