import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const dims = [
  { name: 'Clarity',    score: 84, change: 8,  pos: true  },
  { name: 'Fluency',    score: 81, change: 6,  pos: true  },
  { name: 'Grammar',    score: 74, change: 2,  pos: false },
  { name: 'Structure',  score: 73, change: 14, pos: true  },
  { name: 'Vocabulary', score: 77, change: 4,  pos: true  },
  { name: 'Relevance',  score: 79, change: 3,  pos: true  },
];

const weeks = [
  { label: 'W10', h: 44 },
  { label: 'W11', h: 55 },
  { label: 'W12', h: 62 },
  { label: 'W13', h: 76 },
  { label: 'W14', h: 91, highlight: true },
];

export default function WinSpeakScoreDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Dark hero */}
      <div className="bg-primary">
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10 hover:bg-primary-foreground/15 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-primary-foreground" />
          </button>
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)] text-primary-foreground flex-1">WinSpeak Score</h1>
          <span className="text-[10px] text-primary-foreground/70">Last 5 challenges</span>
        </div>

        {/* Score + sparkline */}
        <div className="flex items-center gap-5 px-5 pb-5">
          <div>
            <div className="text-[10px] text-primary-foreground/70 uppercase tracking-wide mb-1.5">Overall Score</div>
            <div className="text-6xl font-bold text-primary-foreground leading-none mb-2">74</div>
            <div className="flex gap-2 items-center">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-w-green/20 text-w-green">
                ↑ 2 this week
              </span>
              <span className="text-[10px] text-primary-foreground/70">Top 5%</span>
            </div>
          </div>

          {/* Bar sparkline */}
          <div className="flex-1 flex items-end gap-1.5 h-15 justify-end">
            {weeks.map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex-1 w-full bg-primary-foreground/10 rounded-sm min-h-[18px] flex items-end">
                  <div 
                    className={`w-full rounded-sm ${w.highlight ? 'bg-w-amber' : 'bg-w-amber/40'}`}
                    style={{ height: `${w.h}%` }}
                  />
                </div>
                <span className={`text-[8px] ${w.highlight ? 'text-w-amber' : 'text-primary-foreground/70'}`}>{w.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Dimension Breakdown */}
        <div>
          <div className="ds-section-label mb-3">Dimension Breakdown</div>
          <div className="space-y-2.5">
            {dims.map(d => (
              <div
                key={d.name}
                onClick={() => navigate(`/home/winspeak/dimension/${d.name.toLowerCase()}`)}
                className="bg-card border border-border rounded-[20px] p-3.5 cursor-pointer hover:bg-muted/30 transition-colors flex items-center gap-3"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold">{d.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold ${d.pos ? 'text-w-green' : 'text-w-red'}`}>
                        {d.pos ? '↑' : '↓'} {d.change}
                      </span>
                      <span className="text-xs font-bold">{d.score}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${d.score}%` }} />
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* Your Ranking */}
        <div>
          <div className="ds-section-label mb-3">Your Ranking</div>
          <div className="flex bg-card border border-border rounded-[20px] overflow-hidden">
            {[['#12', 'text-w-amber', 'This week'], ['#9', 'text-foreground', 'Best ever'], ['Top 5%', 'text-foreground', 'Cohort']].map(([val, col, lbl], i) => (
              <div key={i} className={`flex-1 py-3 text-center ${i < 2 ? 'border-r border-border' : ''}`}>
                <div className={`text-lg font-bold ${col}`}>{val}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/home/winspeak/challenge')}
          className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
        >
          View Challenge History
        </button>
      </div>
    </div>
  );
}
