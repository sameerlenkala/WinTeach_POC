import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function WinSpeakDimensionDetail() {
  const navigate = useNavigate();
  const weeklyBreakdown = [
    { week: 'W14', challenge: 'Communicating a Delay', score: 73, change: 14, positive: true },
    { week: 'W13', challenge: 'Persuading a Manager', score: 59, change: 1, positive: true },
    { week: 'W12', challenge: 'Interview Introduction', score: 58, change: 4, positive: false }
  ];

  const weeklyTrend = [
    { week: 'W10', value: 48, height: 48 },
    { week: 'W11', value: 55, height: 55 },
    { week: 'W12', value: 58, height: 58 },
    { week: 'W13', value: 59, height: 59 },
    { week: 'W14', value: 73, height: 73, highlight: true }
  ];

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
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)] text-primary-foreground">Structure · Trend</h1>
        </div>

        {/* Score and trend chart */}
        <div className="px-5 pb-5 flex items-end gap-5">
          <div>
            <div className="text-[10px] text-primary-foreground/60 uppercase tracking-wide mb-1.5">Current</div>
            <div className="text-5xl font-bold text-primary-foreground leading-none">73</div>
            <div className="mt-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-w-green/20 text-w-green">
                ↑ 14 this week
              </span>
            </div>
          </div>

          {/* 5-week bar chart */}
          <div className="flex-1 flex items-end gap-2 h-18">
            {weeklyTrend.map((week) => (
              <div key={week.week} className="flex-1 flex flex-col items-center gap-1.5">
                <span className={`text-[8.5px] font-bold ${week.highlight ? 'text-primary-foreground' : 'text-primary-foreground/70'}`}>{week.value}</span>
                <div className="flex-1 w-full bg-primary-foreground/10 rounded-sm relative flex items-end">
                  <div 
                    className={`w-full rounded-sm ${week.highlight ? 'bg-primary-foreground' : 'bg-w-amber/40'}`}
                    style={{ height: `${week.height}%` }}
                  ></div>
                </div>
                <span className={`text-[8px] ${week.highlight ? 'text-primary-foreground' : 'text-primary-foreground/60'}`}>{week.week}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* AI Insight */}
        <div>
          <div className="ds-section-label mb-3">AI Insight</div>
          <div className="bg-card border border-border rounded-[20px] p-3.5">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Structure Coach</div>
            <div className="text-xs leading-relaxed">
              Your biggest single-week improvement this month. You adopted a clear opening → context → resolution → ask pattern in Week 14. Keep this framework — it's working.
              <br/><br/>
              The remaining gap to 80+ is in your transitions. Practice signposting phrases like "Let me move on to…" and "The reason this matters is…"
            </div>
          </div>
        </div>

        {/* Weekly Breakdown */}
        <div>
          <div className="ds-section-label mb-3">Weekly Breakdown</div>
          <div className="bg-card border border-border rounded-[20px] overflow-hidden">
            {weeklyBreakdown.map((item, index) => (
              <div
                key={item.week}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors ${
                  index < weeklyBreakdown.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="w-8 text-center text-[10px] font-bold text-muted-foreground">{item.week}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{item.challenge}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="text-xs font-bold">{item.score}</div>
                  <div className={`text-[10px] font-bold ${item.positive ? 'text-w-green' : 'text-w-red'}`}>
                    {item.positive ? '↑' : '↓'}{item.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip callout */}
        <div className="bg-w-green/10 border-l-4 border-w-green rounded-r-xl p-3">
          <div className="text-xs leading-relaxed">
            <strong>Drill suggestion:</strong> Practice "Elevator Pitch" mode to tighten your opening hook. Aim for a 10-second statement of intent in every response.
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/home/winspeak/practice/setup')}
          className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Practice Structure →
        </button>
      </div>
    </div>
  );
}
