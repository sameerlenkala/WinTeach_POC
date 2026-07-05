import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, FileText, ClipboardList,
  Users, BookOpen, BarChart3, MessageSquare, Settings,
} from 'lucide-react';
import logo from '@/assets/winnify-logo.png';

const navItems = [
  { to: '/academic/faculty',            label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/academic/faculty/courses',    label: 'My Courses', icon: BookOpen },
  { to: '/academic/faculty/lectures',   label: 'Lectures',   icon: Calendar },
  { to: '/academic/faculty/resources',  label: 'Resources',  icon: FileText, badge: 3 },
  { to: '/academic/faculty/quizzes',    label: 'Quizzes',    icon: ClipboardList },
  { to: '/academic/faculty/attendance', label: 'Attendance', icon: Users, badge: 2 },
  { to: '/academic/faculty/analytics',  label: 'Analytics',  icon: BarChart3 },
  { to: '/academic/faculty/doubts',     label: 'Doubts',     icon: MessageSquare },
  { to: '/academic/faculty/settings',   label: 'Settings',   icon: Settings },
];

export default function FacultySidebar() {
  const user = { name: 'Dr. Amit Singh', role: 'Faculty' };
  const initials = user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className="ws-shell fixed top-0 left-0 bottom-0 z-40 max-md:hidden">
      <div className="ws-user-section">
        <div className="ws-avatar">{initials}</div>
        <div className="ws-user-info">
          <span className="ws-user-name">{user.name}</span>
          <span className="ws-user-email">{user.role}</span>
        </div>
      </div>
      <div className="ws-college-pill">CIET College</div>
      <nav className="ws-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => isActive ? 'ws-nav-item ws-nav-item--active' : 'ws-nav-item'}
          >
            <item.icon className="ws-nav-icon" />
            <span className="ws-nav-label">{item.label}</span>
            {item.badge && (
              <span style={{ background: 'rgba(246,166,35,0.25)', color: 'var(--wordmark)', fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '1px 5px' }}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="ws-logo-row">
        <img src={logo} alt="Winnify" className="ws-logo" />
      </div>
    </aside>
  );
}
