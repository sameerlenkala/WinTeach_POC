import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Zap, Library, BookMarked,
  Building2, Settings, LogOut, GraduationCap, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import PageTopbar from '@/components/layout/PageTopbar';
import { WinTeachProvider, useWinTeach } from './WinTeachContext';
import { Toast } from './WinTeachUI';
import { pendingJobs, ADDITIONAL_LIBRARY } from './winteachData';
import { useAuth } from '@/contexts/AuthContext';

const PAGE_TITLES_WT: Record<string, string> = {
  '/winteach':              'Dashboard',
  '/winteach/courses':      'Courses',
  '/winteach/courses/new':  'Create New Course',
  '/winteach/generation':   'Content Generation',
  '/winteach/library':      'CO Library',
  '/winteach/add-library':  'Additional Course Library',
  '/winteach/institutes':   'Institute PO & PSO',
  '/winteach/settings':     'Settings',
};

function WinTeachSidebar() {
  const { courses, institutes } = useWinTeach();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const pending = pendingJobs(courses);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'FT';

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  const navItems = [
    { to: '/winteach',             label: 'Dashboard',           icon: LayoutDashboard, end: true },
    { to: '/winteach/courses',     label: 'Courses',             icon: BookOpen,   count: courses.length },
    { to: '/winteach/generation',  label: 'Content Generation',  icon: Zap,        count: pending },
    { to: '/winteach/library',     label: 'IO Library',          icon: Library },
    { to: '/winteach/add-library', label: 'Add. Course Library', icon: BookMarked, count: ADDITIONAL_LIBRARY.length },
    { to: '/winteach/institutes',  label: 'Institute PO & PSO',  icon: Building2,  count: institutes.length },
  ];

  return (
    <aside className="ws-shell fixed top-0 left-0 bottom-0 z-40 max-md:hidden">

      {/* Logo row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px 16px' }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <GraduationCap size={15} color="#fff" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.01em' }}>WinTeach</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Studio</span>
        </div>
      </div>

      {/* Profile */}
      <div className="ws-user-section">
        <div className="ws-avatar">{initials}</div>
        <div className="ws-user-info">
          <span className="ws-user-name">{user?.name ?? '—'}</span>
          <span className="ws-user-email">{user?.email ?? ''}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="ws-nav">
        <span className="ws-nav-group-label">Workspace</span>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end}
            className={({ isActive }) => isActive ? 'ws-nav-item ws-nav-item--active' : 'ws-nav-item'}
          >
            <item.icon className="ws-nav-icon" />
            <span className="ws-nav-label">{item.label}</span>
            {item.count !== undefined && (
              <span className="wt-nav-count" style={{ marginLeft: 'auto', fontFamily: 'var(--font-display)', fontSize: 10.5, fontWeight: 700, borderRadius: 999, padding: '1px 7px', background: 'var(--tint-brand-bg)', color: 'var(--tint-brand-fg)', fontVariantNumeric: 'tabular-nums' }}>
                {item.count}
              </span>
            )}
          </NavLink>
        ))}

        <span className="ws-nav-group-label" style={{ marginTop: 8 }}>Account</span>
        <NavLink to="/winteach/settings"
          className={({ isActive }) => isActive ? 'ws-nav-item ws-nav-item--active' : 'ws-nav-item'}
        >
          <Settings className="ws-nav-icon" />
          <span className="ws-nav-label">Settings</span>
        </NavLink>
        <button onClick={handleSignOut} className="ws-nav-item" style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', color: 'var(--text-2)', cursor: 'pointer' }}>
          <LogOut className="ws-nav-icon" size={20} />
          <span className="ws-nav-label">Sign Out</span>
        </button>
      </nav>
    </aside>
  );
}

// Inject WinTeach page titles into the topbar title map at runtime
function PageTitleInjector() {
  const location = useLocation();
  // Override the document title based on path
  const path = location.pathname;
  const title = PAGE_TITLES_WT[path] ?? (path.includes('/topic/') ? 'Topic' : path.includes('/courses/') ? 'Course Detail' : 'WinTeach');
  document.title = `${title} · WinTeach`;
  return null;
}

function LayoutInner() {
  const { toastMsg } = useWinTeach();
  const location = useLocation();

  // Focus mode: the generation studio and readers get the full page — the nav
  // auto-collapses on topic routes and can be toggled back at any time.
  const isFocusRoute = /\/winteach\/courses\/[^/]+\/topic\//.test(location.pathname);
  const [navHidden, setNavHidden] = useState(isFocusRoute);
  useEffect(() => { setNavHidden(isFocusRoute); }, [isFocusRoute]);

  return (
    <div className="wt-pro flex h-screen overflow-hidden" style={{ background: 'var(--app-bg)', fontFamily: 'var(--font-sans)', color: 'var(--text)' }}>
      {!navHidden && <WinTeachSidebar />}

      <button className="max-md:hidden" onClick={() => setNavHidden(h => !h)}
        title={navHidden ? 'Show navigation' : 'Hide navigation'}
        style={{
          position: 'fixed', bottom: 16, left: navHidden ? 12 : 264, zIndex: 45,
          width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)',
          background: 'var(--card)', color: 'var(--text-2)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-card)', transition: 'left .18s ease',
        }}>
        {navHidden ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
      </button>

      {/* Content column */}
      <div className={`flex flex-col flex-1 min-w-0 ${navHidden ? '' : 'md:ml-[252px]'}`} style={{ background: 'var(--app-bg)' }}>
        <PageTitleInjector />
        <PageTopbar />
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--app-bg)' }}>
          <Outlet />
        </main>
      </div>

      <Toast msg={toastMsg} />
    </div>
  );
}

export default function WinTeachLayout() {
  return (
    <WinTeachProvider>
      <LayoutInner />
    </WinTeachProvider>
  );
}

// Topbar + content helpers used by each WinTeach page
// These now simply wrap children — the real topbar is PageTopbar above
export function WinTopbar({ title: _title, actions }: { title: string; actions?: React.ReactNode }) {
  // Actions are rendered in a floating bar below the PageTopbar
  if (!actions) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      gap: 10, padding: '0 36px 0', height: 48,
      borderBottom: '1px solid var(--border)',
      background: 'var(--app-bg)',
    }}>
      {actions}
    </div>
  );
}

export function WinContent({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '0 36px 40px', flex: 1 }}>
      {children}
    </div>
  );
}
