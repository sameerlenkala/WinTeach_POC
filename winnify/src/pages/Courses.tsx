import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Code, BarChart3, Globe, Bot, Cloud, Palette, BookOpen, Search, Clock, TrendingUp, Sparkles, CheckCircle } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

/* ── Data ─────────────────────────────────────────────────────── */
interface Category {
  label: string;
  icon: LucideIcon;
}

const categories: Category[] = [
  { label: 'All', icon: Package },
  { label: 'Programming', icon: Code },
  { label: 'Data Science', icon: BarChart3 },
  { label: 'Web Dev', icon: Globe },
  { label: 'AI & ML', icon: Bot },
  { label: 'Cloud', icon: Cloud },
  { label: 'Design', icon: Palette },
];

const platforms = ['All', 'NPTEL', 'Coursera', 'Udemy', 'edX', 'YouTube'];

interface Course {
  id: number;
  title: string;
  platform: string;
  instructor: string;
  match: number;
  description: string;
  tags: string[];
  duration: string;
  level: string;
  rating: number;
  xp: number;
  recommended: boolean;
  category: string;
}

const courses: Course[] = [
  {
    id: 1, title: 'Data Structures & Algorithms in Python', platform: 'NPTEL', instructor: 'Prof. Madhavan Mukund',
    match: 95, description: 'Comprehensive course covering arrays, linked lists, trees, graphs, sorting, and dynamic programming with Python implementations.',
    tags: ['Python', 'DSA', 'Algorithms', 'Competitive'], duration: '12 weeks', level: 'Intermediate', rating: 4.8, xp: 300, recommended: true, category: 'Programming',
  },
  {
    id: 2, title: 'Machine Learning Specialization', platform: 'Coursera', instructor: 'Andrew Ng',
    match: 88, description: 'Learn the fundamentals of machine learning including supervised learning, unsupervised learning, and best practices.',
    tags: ['ML', 'Python', 'TensorFlow', 'Neural Networks'], duration: '8 weeks', level: 'Beginner', rating: 4.9, xp: 250, recommended: true, category: 'AI & ML',
  },
  {
    id: 3, title: 'The Complete Web Developer Bootcamp', platform: 'Udemy', instructor: 'Dr. Angela Yu',
    match: 82, description: 'Full-stack web development from HTML/CSS to React, Node.js, and MongoDB. Build 16+ real-world projects.',
    tags: ['React', 'Node.js', 'MongoDB', 'HTML/CSS'], duration: '65 hours', level: 'Beginner', rating: 4.7, xp: 400, recommended: false, category: 'Web Dev',
  },
  {
    id: 4, title: 'Introduction to Cloud Computing', platform: 'edX', instructor: 'IBM Team',
    match: 75, description: 'Understand cloud computing concepts, deployment models, and services including IaaS, PaaS, and SaaS.',
    tags: ['AWS', 'Azure', 'Docker', 'Kubernetes'], duration: '6 weeks', level: 'Beginner', rating: 4.5, xp: 200, recommended: false, category: 'Cloud',
  },
  {
    id: 5, title: 'Python for Data Science', platform: 'YouTube', instructor: 'freeCodeCamp',
    match: 90, description: 'Learn Python programming for data analysis, visualization with matplotlib, and pandas for data manipulation.',
    tags: ['Python', 'Pandas', 'Matplotlib', 'NumPy'], duration: '4 hours', level: 'Beginner', rating: 4.6, xp: 150, recommended: true, category: 'Data Science',
  },
  {
    id: 6, title: 'UI/UX Design Fundamentals', platform: 'Coursera', instructor: 'Google UX Team',
    match: 70, description: 'Master the foundations of user experience design including research, wireframing, prototyping, and usability testing.',
    tags: ['Figma', 'Wireframing', 'Prototyping', 'Research'], duration: '10 weeks', level: 'Beginner', rating: 4.7, xp: 280, recommended: false, category: 'Design',
  },
];

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
}

export default function Courses() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activePlatform, setActivePlatform] = useState('All');
  const [addedToPlan, setAddedToPlan] = useState<Set<number>>(new Set());

  const filtered = courses.filter((c) => {
    const catMatch = activeCategory === 'All' || c.category === activeCategory;
    const platMatch = activePlatform === 'All' || c.platform === activePlatform;
    return catMatch && platMatch;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Course Library</h1>
        <span className="text-sm text-muted-foreground">· 42 Courses · 5 Enrolled · 1,250 XP</span>
      </div>

      {/* ── Search ────────────────────────────────────────────── */}
      <div className="flex gap-2">
        <Input type="text" placeholder="Search courses..." className="flex-1" />
        <Button variant="outline" size="icon" aria-label="Filter"><Search className="h-4 w-4" /></Button>
      </div>

      {/* ── Category Pills ────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.label}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold font-[family-name:var(--font-heading)] transition-colors cursor-pointer ${
              activeCategory === cat.label
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            onClick={() => setActiveCategory(cat.label)}
          >
            <cat.icon className="h-3.5 w-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Platform Pills ────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {platforms.map((p) => (
          <button
            key={p}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold font-[family-name:var(--font-heading)] transition-colors cursor-pointer ${
              activePlatform === p
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            onClick={() => setActivePlatform(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* ── Course Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <Card key={c.id} className="relative overflow-hidden">
            {c.recommended && (
              <Badge variant="warning" className="absolute top-3 right-3 text-[10px]">Recommended</Badge>
            )}
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm font-bold font-[family-name:var(--font-heading)] pr-20">{c.title}</h3>
                <Badge variant="info" className="shrink-0 text-[10px]">{c.match}% match</Badge>
              </div>

              <p className="text-xs text-muted-foreground mb-2">{c.platform} · {c.instructor}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{c.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {c.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {c.duration}</span>
                <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {c.level}</span>
                <span className="text-w-amber">{renderStars(c.rating)} {c.rating}</span>
                <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> {c.xp} XP</span>
              </div>

              <div className="flex gap-2">
                <a href={c.platform === 'NPTEL' ? 'https://nptel.ac.in' : c.platform === 'Coursera' ? 'https://coursera.org' : c.platform === 'Udemy' ? 'https://udemy.com' : c.platform === 'edX' ? 'https://edx.org' : 'https://youtube.com'} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button size="sm" className="w-full">View Course</Button>
                </a>
                <Button
                  variant={addedToPlan.has(c.id) ? 'secondary' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setAddedToPlan((prev) => { const next = new Set(prev); if (next.has(c.id)) next.delete(c.id); else next.add(c.id); return next; })}
                >
                  {addedToPlan.has(c.id) ? <><CheckCircle className="h-3.5 w-3.5" /> Added</> : 'Add to Plan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
