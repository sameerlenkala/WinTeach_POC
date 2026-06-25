import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Sun, Moon, Search, X, ChevronDown, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home, Mic, Briefcase, Target, ClipboardList, Zap,
  BookOpen, CalendarDays, FileText, BarChart3, GraduationCap,
} from 'lucide-react';

/* ── Page title map ───────────────────────────────────────────── */
const PAGE_TITLES: Record<string, string> = {
  '/home': 'Home',
  '/home/winspeak': 'WinSpeak',
  '/home/winspeak/challenge': 'Challenges',
  '/home/winspeak/leaderboard': 'Leaderboard',
  '/home/winspeak/practice': 'Practice',
  '/home/winspeak/scores': 'Score Dashboard',
  '/home/winspeak/analysis': 'Analysis',
  '/home/drives': 'Campus Drives',
  '/home/journey': 'Journey',
  '/home/mocktest': 'Mocktest Hub',
  '/home/mocktest/aptitude': 'Aptitude Tests',
  '/home/mocktest/technical': 'Technical Tests',
  '/home/mocktest/company-oa': 'Company OA',
  '/home/learning': 'Slog Overs',
  '/home/profile': 'Profile',
  '/home/notifications': 'Notifications',
  '/home/settings': 'Settings',
  '/home/support': 'Help & Support',
  '/home/resume': 'Resume Builder',
  '/home/90-day-plan': 'Slog Overs',
  '/home/ai-chat': 'AI Chat',
  '/judge0': 'DSA Practice',
  '/daily-co': 'Global Connect',
  // HOD portal
  '/academic/hod': 'Dashboard',
  '/academic/hod/courses': 'Courses',
  '/academic/hod/faculty': 'Faculty',
  '/academic/hod/students': 'Students',
  '/academic/hod/approvals': 'Approvals',
  '/academic/hod/analytics': 'Analytics',
  '/academic/hod/calendar': 'Calendar',
  '/academic/hod/reports': 'Reports',
  '/academic/hod/department': 'Department',
  '/academic/hod/settings': 'Settings',
  // Faculty portal
  '/academic/faculty': 'Dashboard',
  '/academic/faculty/courses': 'My Courses',
  '/academic/faculty/lectures': 'Lectures',
  '/academic/faculty/resources': 'Resources',
  '/academic/faculty/quizzes': 'Quizzes',
  '/academic/faculty/attendance': 'Attendance',
  '/academic/faculty/analytics': 'Analytics',
  '/academic/faculty/doubts': 'Doubts',
  '/academic/faculty/settings': 'Settings',
  // WinTeach Console
  '/winteach':              'Dashboard',
  '/winteach/courses':      'Courses',
  '/winteach/courses/new':  'Create New Course',
  '/winteach/generation':   'Content Generation',
  '/winteach/library':      'CO Library',
  '/winteach/add-library':  'Additional Course Library',
  '/winteach/institutes':   'Institute PO & PSO',
  '/winteach/settings':     'Settings',
};

/* ── Search items ─────────────────────────────────────────────── */
const searchItems = [
  { label: 'Home', path: '/home', icon: Home, category: 'Pages' },
  { label: 'WinSpeak', path: '/home/winspeak', icon: Mic, category: 'Pages' },
  { label: 'Campus Drives', path: '/home/drives', icon: Briefcase, category: 'Pages' },
  { label: 'Journey', path: '/home/journey', icon: Target, category: 'Pages' },
  { label: 'Assessments', path: '/home/assessments', icon: ClipboardList, category: 'Pages' },
  { label: 'Mocktest Hub', path: '/home/mocktest', icon: Zap, category: 'Pages' },
  { label: 'Slog Overs', path: '/home/90-day-plan', icon: CalendarDays, category: 'Pages' },
  { label: 'Courses', path: '/home/courses', icon: BookOpen, category: 'Pages' },
  { label: 'Profile', path: '/home/profile', icon: User, category: 'Pages' },
  { label: 'Resume Builder', path: '/home/resume', icon: FileText, category: 'Pages' },
  { label: 'Notifications', path: '/home/notifications', icon: Bell, category: 'Pages' },
  { label: 'Settings', path: '/home/settings', icon: Settings, category: 'Pages' },
  { label: 'Help & Support', path: '/home/support', icon: HelpCircle, category: 'Pages' },
  { label: 'Academic LMS', path: '/academic', icon: GraduationCap, category: 'Pages' },
  { label: 'DSA Practice', path: '/judge0', icon: Zap, category: 'Pages' },
  { label: 'WinSpeak Scores', path: '/home/winspeak/scores', icon: BarChart3, category: 'WinSpeak' },
  { label: 'Aptitude Tests', path: '/home/mocktest/aptitude', icon: Zap, category: 'Mocktest' },
  { label: 'Technical Tests', path: '/home/mocktest/technical', icon: Zap, category: 'Mocktest' },
];

export default function PageTopbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get page title from current path
  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (PAGE_TITLES[path]) return PAGE_TITLES[path];
    // Partial match for dynamic routes
    for (const [key, val] of Object.entries(PAGE_TITLES)) {
      if (path.startsWith(key + '/') || path === key) return val;
    }
    return 'Winnify';
  }, [location.pathname]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return searchItems.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return searchItems.filter(i => i.label.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }, [searchQuery]);

  useEffect(() => { setSelectedIndex(0); }, [filteredItems]);

  useEffect(() => {
    if (searchOpen) { setTimeout(() => searchInputRef.current?.focus(), 50); setSearchQuery(''); }
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape') { setSearchOpen(false); setDropdownOpen(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(p => Math.min(p + 1, filteredItems.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(p => Math.max(p - 1, 0)); }
    else if (e.key === 'Enter' && filteredItems[selectedIndex]) { navigate(filteredItems[selectedIndex].path); setSearchOpen(false); }
  };

  return (
    <>
      {/* ── Topbar ── */}
      <header className="ws-topbar shrink-0 flex items-center justify-between">
        {/* Left: page title */}
        <div className="flex items-center gap-3">
          <h1 className="ws-topbar-title">{pageTitle}</h1>
        </div>

        {/* Right: search + notifications + theme + user */}
        <div className="flex items-center gap-1">
          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="ws-topbar-btn flex items-center gap-2 px-3 h-8 rounded-lg text-[13px] mr-2"
            style={{ border: '1px solid var(--border)', background: 'var(--surface-muted)', color: 'var(--text-subtle)', fontFamily: 'var(--font-sans)' }}
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-flex h-4 items-center rounded px-1 text-[10px]" style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text-subtle)' }}>⌘K</kbd>
          </button>

          {/* Notifications */}
          <Link
            to="/home/notifications"
            className="ws-topbar-icon relative"
            aria-label="Notifications"
          >
            <Bell className="h-[17px] w-[17px]" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#DC2133]" />
          </Link>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="ws-topbar-icon" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-[17px] w-[17px]" /> : <Moon className="h-[17px] w-[17px]" />}
          </button>

          {/* User dropdown */}
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="ws-topbar-user flex items-center gap-2 rounded-lg px-2 py-1"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shrink-0"
                style={{ background: 'color-mix(in oklab, var(--brand) 15%, transparent)', color: 'var(--brand)', fontFamily: 'var(--font-display)' }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-[13px] font-medium" style={{ color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>
                {user?.name}
              </span>
              <ChevronDown className={`h-3 w-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-52 rounded-xl py-1 z-50"
                style={{ border: '1px solid var(--border)', background: 'var(--card)', boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)' }}
              >
                <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{user?.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                </div>
                <div className="py-1">
                  {[
                    { to: '/home/profile', icon: User, label: 'Profile' },
                    { to: '/home/notifications', icon: Bell, label: 'Notifications' },
                    { to: '/home/support', icon: HelpCircle, label: 'Help & Support' },
                    { to: '/home/settings', icon: Settings, label: 'Settings' },
                  ].map(({ to, icon: Icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setDropdownOpen(false)}
                      className="navbar-menu-item flex items-center gap-2.5 px-3 py-2 text-[13px]"
                      style={{ color: 'var(--text)', fontFamily: 'var(--font-sans)' }}
                    >
                      <Icon className="h-4 w-4" style={{ color: 'var(--text-muted)' }} /> {label}
                    </Link>
                  ))}
                </div>
                <div className="py-1" style={{ borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={async () => { setDropdownOpen(false); await signOut(); navigate('/signin'); }}
                    className="navbar-menu-item flex items-center gap-2.5 px-3 py-2 text-[13px] w-full cursor-pointer"
                    style={{ color: '#DC2133', fontFamily: 'var(--font-sans)' }}
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Search modal ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <div
            className="relative w-full max-w-lg rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border)', background: 'var(--card)', boxShadow: '0 24px 48px -12px rgba(0,0,0,0.20)' }}
          >
            <div className="flex items-center gap-3 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <Search className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKey}
                placeholder="Search pages, features..."
                className="flex-1 h-12 bg-transparent text-sm focus:outline-none"
                style={{ color: 'var(--text)', fontFamily: 'var(--font-sans)' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ color: 'var(--text-muted)' }}>
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex h-5 items-center rounded px-1.5 text-[10px]" style={{ border: '1px solid var(--border)', background: 'var(--surface-muted)', color: 'var(--text-subtle)' }}>ESC</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto py-2">
              {filteredItems.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No results for "{searchQuery}"</p>
              ) : filteredItems.map((item, i) => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setSearchOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer transition-colors"
                  style={{
                    background: i === selectedIndex ? 'color-mix(in oklab, var(--brand) 10%, transparent)' : 'transparent',
                    color: i === selectedIndex ? 'var(--brand)' : 'var(--text)',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onMouseEnter={e => { if (i !== selectedIndex) (e.currentTarget as HTMLElement).style.background = 'var(--surface-muted)'; }}
                  onMouseLeave={e => { if (i !== selectedIndex) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <item.icon className="h-4 w-4 shrink-0" style={{ color: i === selectedIndex ? 'var(--brand)' : 'var(--text-muted)' }} />
                  <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
                  <span className="text-[10px] shrink-0" style={{ color: 'var(--text-subtle)' }}>{item.category}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-2 text-[10px]" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-subtle)' }}>
              <span className="flex items-center gap-1"><kbd className="rounded px-1" style={{ border: '1px solid var(--border)', background: 'var(--surface-muted)' }}>↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="rounded px-1" style={{ border: '1px solid var(--border)', background: 'var(--surface-muted)' }}>↵</kbd> Open</span>
              <span className="flex items-center gap-1"><kbd className="rounded px-1" style={{ border: '1px solid var(--border)', background: 'var(--surface-muted)' }}>ESC</kbd> Close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
