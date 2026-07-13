import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, BarChart3, Settings, LogOut, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PageTopbar from '@/components/layout/PageTopbar';

const NAV = [
  { to: '/admin',          label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/admin/users',    label: 'Users',     Icon: Users },
  { to: '/admin/courses',  label: 'Courses',   Icon: BookOpen },
  { to: '/admin/reports',  label: 'Reports',   Icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings',  Icon: Settings },
];

export default function CollegeAdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'CA';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--app-bg)' }}>
      <aside className="ws-shell fixed top-0 left-0 bottom-0 z-40 max-md:hidden">

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 16px 8px' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#00B894', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#1A1A22' }}>Winnify</div>
            <div style={{ fontSize: 10, color: '#00B894', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>College Admin</div>
          </div>
        </div>

        <NavLink to="/admin/account" className="ws-user-section" title="Account settings"
                 style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className="ws-avatar" style={{ background: 'linear-gradient(135deg, #00B894, #00916e)' }}>{initials}</div>
          <div className="ws-user-info">
            <span className="ws-user-name">{user?.name ?? 'Admin'}</span>
            <span className="ws-user-email">{user?.email}</span>
          </div>
        </NavLink>

        <nav className="ws-nav">
          <span className="ws-nav-group-label">College</span>
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => isActive ? 'ws-nav-item ws-nav-item--active' : 'ws-nav-item'}
            >
              <Icon className="ws-nav-icon" />
              <span className="ws-nav-label">{label}</span>
            </NavLink>
          ))}
          <span className="ws-nav-group-label" style={{ marginTop: 8 }}>Account</span>
          <button onClick={handleSignOut} className="ws-nav-item" style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', color: 'var(--text-2)', cursor: 'pointer' }}>
            <LogOut className="ws-nav-icon" size={20} />
            <span className="ws-nav-label">Sign Out</span>
          </button>
        </nav>
      </aside>

      <div className="flex flex-col flex-1 min-w-0 md:ml-[284px]" style={{ background: 'var(--app-bg)' }}>
        <PageTopbar />
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--app-bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
