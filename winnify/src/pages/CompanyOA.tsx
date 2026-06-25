import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, ArrowLeft } from 'lucide-react';

/* ── Data ─────────────────────────────────────────────────────── */
type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface Company {
  id: number;
  name: string;
  domain: string;
  tests: number;
  difficulty: Difficulty;
}

const companies: Company[] = [
  { id: 1,  name: 'TCS',        domain: 'tcs.com',         tests: 12, difficulty: 'Easy'   },
  { id: 2,  name: 'Infosys',    domain: 'infosys.com',     tests: 10, difficulty: 'Easy'   },
  { id: 3,  name: 'Wipro',      domain: 'wipro.com',       tests: 8,  difficulty: 'Easy'   },
  { id: 4,  name: 'Cognizant',  domain: 'cognizant.com',   tests: 9,  difficulty: 'Medium' },
  { id: 5,  name: 'Accenture',  domain: 'accenture.com',   tests: 11, difficulty: 'Medium' },
  { id: 6,  name: 'HCL',        domain: 'hcltech.com',     tests: 7,  difficulty: 'Medium' },
  { id: 7,  name: 'Google',     domain: 'google.com',      tests: 15, difficulty: 'Hard'   },
  { id: 8,  name: 'Microsoft',  domain: 'microsoft.com',   tests: 14, difficulty: 'Hard'   },
  { id: 9,  name: 'Amazon',     domain: 'amazon.com',      tests: 16, difficulty: 'Hard'   },
  { id: 10, name: 'Razorpay',   domain: 'razorpay.com',    tests: 6,  difficulty: 'Medium' },
];

const diffStyles: Record<Difficulty, { variant: 'success' | 'warning' | 'destructive' }> = {
  Easy: { variant: 'success' },
  Medium: { variant: 'warning' },
  Hard: { variant: 'destructive' },
};

const filters: ('All' | Difficulty)[] = ['All', 'Easy', 'Medium', 'Hard'];

export default function CompanyOA() {
  const [activeFilter, setActiveFilter] = useState<'All' | Difficulty>('All');

  const filtered = activeFilter === 'All' ? companies : companies.filter((c) => c.difficulty === activeFilter);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ── Back Link ─────────────────────────────────────────── */}
      <Link to="/home/mocktest" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Mocktest Hub
      </Link>

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-primary" />
        <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Company OA Practice</h1>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Practice previous year OA questions from top companies</p>

      {/* ── Filter Pills ──────────────────────────────────────── */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold font-[family-name:var(--font-heading)] transition-colors cursor-pointer ${
              activeFilter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Company Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const ds = diffStyles[c.difficulty];
          return (
            <Card key={c.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white shrink-0 overflow-hidden p-1">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${c.domain}&sz=64`}
                      alt={c.name}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        const el = e.currentTarget;
                        el.style.display = 'none';
                        el.parentElement!.innerHTML = `<span class="text-sm font-extrabold text-muted-foreground">${c.name[0]}</span>`;
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold font-[family-name:var(--font-heading)]">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">{c.tests} tests available</p>
                  </div>
                  <Badge variant={ds.variant}>{c.difficulty}</Badge>
                </div>
                <Link to="/home/mocktest/config">
                  <Button size="sm" className="w-full">Practice</Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
