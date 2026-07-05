import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, GraduationCap,
  CheckCircle, BarChart3, Calendar, Settings, FileText, Building2,
} from 'lucide-react';
import logo from '@/assets/winnify-logo.png';

const navItems = [
  { to: '/academic/hod',            label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/academic/hod/courses',    label: 'Courses',    icon: BookOpen },
  { to: '/academic/hod/faculty',    label: 'Faculty',    icon: Users },
  { to: '/academic/hod/students',   label: 'Students',   icon: GraduationCap },
  { to: '/academic/hod/approvals',  label: 'Approvals',  icon: CheckCircle, badge: 2 },
  { to: '/academic/hod/analytics',  label: 'Analytics',  icon: BarChart3 },
  { to: '/academic/hod/calendar',   label: 'Calendar',   icon: Calendar },
  { to: '/academic/hod/reports',    label: 'Reports',    icon: FileText },
  { to: '/academic/hod/department', label: 'Department', icon: Building2 },
  { to: '/academic/hod/settings',   label: 'Settings',   icon: Settings },
];

export default function HODSidebar() {
  const user = { name: 'Dr. Rajesh Kumar', role: 'Head of Department' };
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
