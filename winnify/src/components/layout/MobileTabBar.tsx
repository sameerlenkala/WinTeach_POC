// FotMob-style bottom tab bar — mobile only (sidebar covers md+).
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Mic, Map, User } from 'lucide-react';

const tabs = [
  { to: '/home',          label: 'Home',     icon: Home },
  { to: '/home/courses',  label: 'Courses',  icon: BookOpen },
  { to: '/home/winspeak', label: 'WinSpeak', icon: Mic },
  { to: '/home/journey',  label: 'Journey',  icon: Map },
  { to: '/home/profile',  label: 'Profile',  icon: User },
];

export default function MobileTabBar() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'var(--card)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', height: 60 }}>
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/home'}
            className="flex-1"
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 3, textDecoration: 'none',
              color: isActive ? 'var(--brand)' : 'var(--text-3)',
            })}
          >
            {({ isActive }) => (
              <>
                <t.icon size={21} strokeWidth={isActive ? 2.4 : 1.9} />
                <span style={{
                  fontSize: 10.5, fontWeight: isActive ? 700 : 500,
                  fontFamily: 'var(--font-sans)', letterSpacing: 0.1,
                }}>
                  {t.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
