import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, BarChart3, Bell, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PageTopbar from '@/components/layout/PageTopbar';

const NAV = [
  { to: '/superadmin',         label: 'Dashboard',  Icon: LayoutDashboard, end: true },
  { to: '/superadmin/colleges', label: 'Colleges',   Icon: Building2 },
  { to: '/superadmin/users',    label: 'Users',      Icon: Users },
  { to: '/superadmin/stats',    label: 'Analytics',  Icon: BarChart3 },
  { to: '/superadmin/announcements', label: 'Announcements', Icon: Bell },
  { to: '/superadmin/settings', label: 'Settings',   Icon: Settings },
];

export default function SuperAdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'SA';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--app-bg)' }}>

      {/* Sidebar */}
      <aside className="ws-shell fixed top-0 left-0 bottom-0 z-40 max-md:hidden">

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 16px 8px' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#E84393', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#1A1A22' }}>Winnify</div>
            <div style={{ fontSize: 10, color: '#E84393', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Super Admin</div>
          </div>
        </div>

        {/* Profile */}
        <div className="ws-user-section">
          <div className="ws-avatar" style={{ background: 'linear-gradient(135deg, #E84393, #c0306e)' }}>{initials}</div>
          <div className="ws-user-info">
            <span className="ws-user-name">{user?.name ?? 'Super Admin'}</span>
            <span className="ws-user-email">{user?.email}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="ws-nav">
          <span className="ws-nav-group-label">Platform</span>
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

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 md:ml-[284px]" style={{ background: 'var(--app-bg)' }}>
        <PageTopbar />
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--app-bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
