// Tiny inline icon set (stroke). All accept {size, className, color}.
const Icon = ({ d, size = 16, className = "", strokeWidth = 1.6, fill = "none", viewBox = "0 0 24 24", children }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke="currentColor"
       strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} className={className}>
    {children || <path d={d} />}
  </svg>
);

const Icons = {
  Home:    (p) => <Icon {...p}><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></Icon>,
  Target:  (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></Icon>,
  Mic:     (p) => <Icon {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></Icon>,
  Book:    (p) => <Icon {...p}><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z"/><path d="M19 19H6a2 2 0 0 0-2 2"/></Icon>,
  Folder:  (p) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></Icon>,
  Plus:    (p) => <Icon {...p}><path d="M12 5v14"/><path d="M5 12h14"/></Icon>,
  Search:  (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></Icon>,
  Bell:    (p) => <Icon {...p}><path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16z"/><path d="M10 20a2 2 0 0 0 4 0"/></Icon>,
  Chevron: (p) => <Icon {...p}><path d="M9 6l6 6-6 6"/></Icon>,
  ChevronL:(p) => <Icon {...p}><path d="M15 6l-6 6 6 6"/></Icon>,
  ChevronD:(p) => <Icon {...p}><path d="M6 9l6 6 6-6"/></Icon>,
  Check:   (p) => <Icon {...p}><path d="M4 12l5 5L20 6"/></Icon>,
  Close:   (p) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18"/></Icon>,
  Calendar:(p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></Icon>,
  Spark:   (p) => <Icon {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3"/></Icon>,
  Flame:   (p) => <Icon {...p}><path d="M12 3c2 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4 1-6 1-8z"/></Icon>,
  Clock:   (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  Upload:  (p) => <Icon {...p}><path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/></Icon>,
  File:    (p) => <Icon {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></Icon>,
  Tree:    (p) => <Icon {...p}><circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="12" r="2"/><path d="M8 6h6a2 2 0 0 1 2 2v2M8 18h6a2 2 0 0 0 2-2v-2"/></Icon>,
  Star:    (p) => <Icon {...p}><path d="M12 3l2.6 5.7L21 9.6l-4.7 4 1.4 6.4L12 17l-5.7 3 1.4-6.4L3 9.6l6.4-.9z"/></Icon>,
  Settings:(p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.4 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.4l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>,
  Trash:   (p) => <Icon {...p}><path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/><path d="M9 7V4h6v3"/></Icon>,
  Edit:    (p) => <Icon {...p}><path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/></Icon>,
  Play:    (p) => <Icon {...p}><path d="M6 4l14 8-14 8z"/></Icon>,
  ArrowR:  (p) => <Icon {...p}><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></Icon>,
  ArrowL:  (p) => <Icon {...p}><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></Icon>,
  Layers:  (p) => <Icon {...p}><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17l9 5 9-5"/></Icon>,
  Grid:    (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Icon>,
  List:    (p) => <Icon {...p}><path d="M4 6h16M4 12h16M4 18h16"/></Icon>,
  Info:    (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></Icon>,
  WiFiOff: (p) => <Icon {...p}><path d="M2 8a17 17 0 0 1 4-2.6"/><path d="M22 8a17 17 0 0 0-7-3.7"/><path d="M5 12a12 12 0 0 1 3-1.7"/><path d="M19 12a12 12 0 0 0-5-1.8"/><path d="M8.5 15.5a6 6 0 0 1 7 0"/><path d="M12 19h.01"/><path d="M3 3l18 18"/></Icon>,
  Refresh: (p) => <Icon {...p}><path d="M4 4v6h6"/><path d="M20 20v-6h-6"/><path d="M4 10a8 8 0 0 1 14-3"/><path d="M20 14a8 8 0 0 1-14 3"/></Icon>,
  Compass: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M16 8l-2 6-6 2 2-6z"/></Icon>,
  Trophy:  (p) => <Icon {...p}><path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M6 4H4v2a3 3 0 0 0 4 3M18 4h2v2a3 3 0 0 1-4 3"/><path d="M9 14h6l-1 4h-4z"/><path d="M8 22h8"/></Icon>,
  Sparkle: (p) => <Icon {...p}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 16l.7 2L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-1z"/></Icon>,
  Cpu:     (p) => <Icon {...p}><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3"/></Icon>,
  Brain:   (p) => <Icon {...p}><path d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5 3 3 0 0 0 0 4 3 3 0 0 0 2 4 3 3 0 0 0 3 0 3 3 0 0 0 3-2"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1 0 4 3 3 0 0 1-2 4 3 3 0 0 1-3 0 3 3 0 0 1-3-2"/><path d="M12 5v14"/></Icon>,
  Stack:   (p) => <Icon {...p}><rect x="3" y="3" width="18" height="5" rx="1"/><rect x="3" y="10" width="18" height="5" rx="1"/><rect x="3" y="17" width="18" height="4" rx="1"/></Icon>,
  Lightning:(p) => <Icon {...p}><path d="M13 3L4 14h7l-1 7 9-11h-7z"/></Icon>,
};

window.Icons = Icons;
