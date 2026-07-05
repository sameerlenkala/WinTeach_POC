import { NavLink } from 'react-router-dom';
import { Home, Mic, Briefcase, Map, Zap, User, Code2, Video, Target, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/winnify-logo.png';

const navItems = [
  { to: '/home',          label: 'Home',          icon: Home },
  { to: '/home/courses',  label: 'Courses',       icon: BookOpen },
  { to: '/home/winspeak', label: 'WinSpeak',      icon: Mic },
  { to: '/home/drives',   label: 'Drives',        icon: Briefcase },
  { to: '/home/journey',  label: 'Journey',       icon: Map },
  { to: '/home/mocktest', label: 'Mocktest Hub',  icon: Zap },
  { to: '/home/learning', label: 'Slog Overs',    icon: Target },
  { to: '/home/profile',  label: 'Profile',       icon: User },
  { to: '/judge0',        label: 'DSA Practice',  icon: Code2 },
  { to: '/daily-co',      label: 'Global Connect',icon: Video },
];

export default function Sidebar() {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside className="ws-shell fixed top-0 left-0 bottom-0 z-40 max-md:hidden">

      {/* Profile header */}
      <div className="ws-user-section">
        <div className="ws-avatar">{initials}</div>
        <div className="ws-user-info">
          <span className="ws-user-name">{user?.name ?? 'Student'}</span>
          <span className="ws-user-email">{user?.email ?? ''}</span>
        </div>
      </div>

      {/* College pill */}
      <div className="ws-college-pill">CIET College</div>

      {/* Nav list */}
      <nav className="ws-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/home'}
            className={({ isActive }) =>
              isActive ? 'ws-nav-item ws-nav-item--active' : 'ws-nav-item'
            }
          >
            <item.icon className="ws-nav-icon" />
            <span className="ws-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Wordmark — always orange per spec */}
      <div className="ws-logo-row">
        <img src={logo} alt="Winnify" className="ws-logo" />
      </div>
    </aside>
  );
}
