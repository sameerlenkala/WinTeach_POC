import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Bell, Search, ChevronDown, User, Settings, HelpCircle, LogOut, Sun, Moon, X,
  Home, Mic, Briefcase, Target, ClipboardList, Zap, BookOpen, CalendarDays, FileText, BarChart3, GraduationCap,
} from 'lucide-react';
import logo from '@/assets/winnify-logo.png';

/* ── Search items ─────────────────────────────────────────────── */
interface SearchItem {
  label: string;
  path: string;
  icon: typeof Home;
  category: string;
}

const searchItems: SearchItem[] = [
  { label: 'Home', path: '/home', icon: Home, category: 'Pages' },
  { label: 'Academic LMS', path: '/academic', icon: GraduationCap, category: 'Pages' },
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
  { label: 'Aptitude Tests', path: '/home/mocktest/aptitude', icon: Zap, category: 'Mocktest' },
  { label: 'Technical Tests', path: '/home/mocktest/technical', icon: Zap, category: 'Mocktest' },
  { label: 'Company OA', path: '/home/mocktest/company-oa', icon: Briefcase, category: 'Mocktest' },
  { label: 'WinSpeak Challenge', path: '/home/winspeak/challenge', icon: Mic, category: 'WinSpeak' },
  { label: 'WinSpeak Leaderboard', path: '/home/winspeak/leaderboard', icon: BarChart3, category: 'WinSpeak' },
  { label: 'WinSpeak Practice', path: '/home/winspeak/practice', icon: Mic, category: 'WinSpeak' },
  { label: 'Score Dashboard', path: '/home/winspeak/scores', icon: BarChart3, category: 'WinSpeak' },
  { label: 'Badges', path: '/home/profile/badges', icon: Target, category: 'Profile' },
  { label: 'AI Chat', path: '/home/ai-chat', icon: Mic, category: 'Pages' },
  { label: 'Revision Course', path: '/home/90-day-plan/revision', icon: BookOpen, category: 'Slog Overs' },
];

export default function Navbar() {
  const { isAuthenticated, user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K to open search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [searchOpen]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return searchItems.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return searchItems.filter((item) =>
      item.label.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Reset selected index when results change
  useEffect(() => { setSelectedIndex(0); }, [filteredItems]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      navigate(filteredItems[selectedIndex].path);
      setSearchOpen(false);
    }
  };

  const handleSelectItem = (path: string) => {
    navigate(path);
    setSearchOpen(false);
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 h-14"
        style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex h-full items-center">
          {/* Left strip — matches sidebar width; shows logo on mobile, blank violet on desktop */}
          <div
            className="w-[248px] shrink-0 flex items-center h-full px-5 max-md:w-auto max-md:px-4"
            style={{ background: 'var(--sidebar-bg)' }}
          >
            {/* Mobile only: show logo */}
            <Link to="/" className="max-md:flex hidden items-center">
              <img src={logo} alt="Winnify" className="h-7 w-auto object-contain" />
            </Link>
          </div>

          {/* Center + Right */}
          <div className="flex-1 flex items-center justify-between px-6 max-md:px-3" style={{ background: 'var(--card)' }}>
            {/* Search bar trigger */}
            <div className="flex items-center flex-1">
              {isAuthenticated && (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="navbar-search flex items-center gap-2 h-8 px-3 rounded-lg cursor-pointer max-w-xs w-full transition-colors"
                  style={{
                    border: '1px solid var(--border)',
                    background: 'var(--surface-muted)',
                    color: 'var(--text-subtle)',
                  }}
                >
                  <Search className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs flex-1 text-left">Search pages...</span>
                  <kbd
                    className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded px-1.5 text-[10px] font-medium"
                    style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text-subtle)' }}
                  >
                    ⌘K
                  </kbd>
                </button>
              )}
            </div>

            {/* Right actions */}
            {isAuthenticated ? (
              <div className="flex items-center">
                <Link
                  to="/home/notifications"
                  className="navbar-icon-btn relative flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Notifications"
                >
                  <Bell className="h-[15px] w-[15px]" />
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full" style={{ background: '#DC2133' }} />
                </Link>

                <button
                  onClick={toggleTheme}
                  className="navbar-icon-btn flex h-8 w-8 items-center justify-center rounded-md transition-colors cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <Sun className="h-[15px] w-[15px]" /> : <Moon className="h-[15px] w-[15px]" />}
                </button>

                <div className="mx-3 h-5 w-px" style={{ background: 'var(--border)' }} />

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="navbar-search flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors cursor-pointer"
                  >
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shrink-0"
                      style={{ background: 'color-mix(in oklab, var(--brand) 12%, transparent)', color: 'var(--brand)', fontFamily: 'var(--font-heading)' }}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden text-[13px] font-medium sm:inline" style={{ color: 'var(--text)' }}>
                      {user?.name}
                    </span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 w-56 rounded-lg py-1 z-50"
                      style={{ border: '1px solid var(--border)', background: 'var(--card)', boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)' }}
                    >
                      <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                        <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)' }}>{user?.name}</p>
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
                            className="navbar-menu-item flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors"
                            style={{ color: 'var(--text)' }}
                          >
                            <Icon className="h-4 w-4" style={{ color: 'var(--text-muted)' }} /> {label}
                          </Link>
                        ))}
                      </div>
                      <div className="py-1" style={{ borderTop: '1px solid var(--border)' }}>
                        <button
                          onClick={() => { signOut(); setDropdownOpen(false); }}
                          className="navbar-menu-item flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors w-full cursor-pointer"
                          style={{ color: '#DC2133' }}
                        >
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="navbar-icon-btn flex h-8 w-8 items-center justify-center rounded-md transition-colors cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <Sun className="h-[15px] w-[15px]" /> : <Moon className="h-[15px] w-[15px]" />}
                </button>
                <Link
                  to="/signin"
                  className="px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >Log In</Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 text-[13px] font-semibold rounded-lg transition-opacity hover:opacity-90"
                  style={{ background: 'var(--brand)', color: 'var(--brand-fg)', fontFamily: 'var(--font-heading)' }}
                >Join for Free</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Search Modal (Command Palette) ────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />

          <div
            ref={searchRef}
            className="relative w-full max-w-lg rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border)', background: 'var(--card)', boxShadow: '0 24px 48px -12px rgba(0,0,0,0.20)' }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <Search className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search pages, features, settings..."
                className="flex-1 h-12 bg-transparent text-sm focus:outline-none"
                style={{ color: 'var(--text)' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex h-5 items-center rounded px-1.5 text-[10px] font-medium" style={{ border: '1px solid var(--border)', background: 'var(--surface-muted)', color: 'var(--text-subtle)' }}>
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {filteredItems.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No results for "{searchQuery}"</p>
                </div>
              ) : (
                filteredItems.map((item, i) => (
                  <button
                    key={item.path}
                    onClick={() => handleSelectItem(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer"
                    style={{
                      background: i === selectedIndex ? 'color-mix(in oklab, var(--brand) 10%, transparent)' : 'transparent',
                      color: i === selectedIndex ? 'var(--brand)' : 'var(--text)',
                    }}
                    onMouseEnter={(e) => { if (i !== selectedIndex) (e.currentTarget as HTMLElement).style.background = 'var(--surface-muted)'; }}
                    onMouseLeave={(e) => { if (i !== selectedIndex) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <item.icon className="h-4 w-4 shrink-0" style={{ color: i === selectedIndex ? 'var(--brand)' : 'var(--text-muted)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                    </div>
                    <span className="text-[10px] shrink-0" style={{ color: 'var(--text-subtle)' }}>{item.category}</span>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 text-[10px]" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-subtle)' }}>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><kbd className="rounded px-1" style={{ border: '1px solid var(--border)', background: 'var(--surface-muted)' }}>↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="rounded px-1" style={{ border: '1px solid var(--border)', background: 'var(--surface-muted)' }}>↵</kbd> Open</span>
              </div>
              <span className="flex items-center gap-1"><kbd className="rounded px-1" style={{ border: '1px solid var(--border)', background: 'var(--surface-muted)' }}>ESC</kbd> Close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
