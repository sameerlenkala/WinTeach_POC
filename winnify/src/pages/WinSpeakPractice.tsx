import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mic } from 'lucide-react';

export default function WinSpeakPractice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-5 py-4 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)] flex-1">Practice Arena</h1>
          <button 
            onClick={() => navigate('/home/winspeak/practice/history')}
            className="text-xs font-bold text-primary hover:opacity-80"
          >
            History
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Quick stats */}
        <div className="flex bg-card border border-border rounded-[20px] overflow-hidden">
          <div className="flex-1 py-3 text-center border-r border-border">
            <div className="text-lg font-bold">31</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Sessions</div>
          </div>
          <div className="flex-1 py-3 text-center border-r border-border">
            <div className="text-lg font-bold">4.2h</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Practice time</div>
          </div>
          <div className="flex-1 py-3 text-center">
            <div className="text-lg font-bold text-primary">
              ↑ 12%
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">This week</div>
          </div>
        </div>

        <div className="ds-section-label">Choose a Mode</div>

        {/* Mode cards */}
        <div className="space-y-2.5">
          {/* Featured: Casual Talk */}
          <div 
            onClick={() => navigate('/home/winspeak/practice/setup')}
            className="bg-primary rounded-xl p-4 cursor-pointer flex justify-between items-center hover:opacity-90 transition-opacity"
          >
            <div>
              <div className="text-[10px] text-primary-foreground/60 uppercase tracking-wide font-bold mb-1.5">Most Popular</div>
              <div className="text-sm font-bold text-primary-foreground mb-1">Casual Talk</div>
              <div className="text-[10px] text-primary-foreground/70">Any topic · 2 min · No pressure</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <Mic className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
          </div>

          {/* Row 1: Debate + Pitch Your Idea */}
          <div className="grid grid-cols-2 gap-2.5">
            <button 
              onClick={() => navigate('/home/winspeak/practice/setup')}
              className="bg-primary rounded-xl p-3.5 cursor-pointer hover:opacity-90 transition-opacity flex flex-col justify-between text-left"
            >
              <div>
                <div className="text-xs font-bold text-primary-foreground mb-1">Debate</div>
                <div className="text-[10px] text-primary-foreground/70">Argue a position · 2 min</div>
              </div>
              <div className="text-[10px] text-primary-foreground/30 mt-2">13 sessions</div>
            </button>
            <button 
              onClick={() => navigate('/home/winspeak/practice/setup')}
              className="bg-primary rounded-xl p-3.5 cursor-pointer hover:opacity-90 transition-opacity flex flex-col justify-between text-left"
            >
              <div>
                <div className="text-xs font-bold text-primary-foreground mb-1">Pitch Your Idea</div>
                <div className="text-[10px] text-primary-foreground/70">High-impact · 60 sec</div>
              </div>
              <div className="text-[10px] text-primary-foreground/30 mt-2">7 sessions</div>
            </button>
          </div>

          {/* Row 2: Give a Presentation + Explain a Concept */}
          <div className="grid grid-cols-2 gap-2.5">
            <button 
              onClick={() => navigate('/home/winspeak/practice/setup')}
              className="bg-primary rounded-xl p-3.5 cursor-pointer hover:opacity-90 transition-opacity flex flex-col justify-between text-left"
            >
              <div>
                <div className="text-xs font-bold text-primary-foreground mb-1">Give a Presentation</div>
                <div className="text-[10px] text-primary-foreground/70">Structured talk · 2 min</div>
              </div>
              <div className="text-[10px] text-primary-foreground/30 mt-2">5 sessions</div>
            </button>
            <button 
              onClick={() => navigate('/home/winspeak/practice/setup')}
              className="bg-primary rounded-xl p-3.5 cursor-pointer hover:opacity-90 transition-opacity flex flex-col justify-between text-left"
            >
              <div>
                <div className="text-xs font-bold text-primary-foreground mb-1">Explain a Concept</div>
                <div className="text-[10px] text-primary-foreground/70">Simplify ideas · 2 min</div>
              </div>
              <div className="text-[10px] text-primary-foreground/30 mt-2">4 sessions</div>
            </button>
          </div>
        </div>

        {/* Interview Practice Modes */}
        <div className="flex gap-2.5">
          <button 
            onClick={() => navigate('/home/winspeak/practice/setup', { state: { mode: 'technical-interview' } })}
            className="flex-1 bg-card border border-primary rounded-[20px] p-4 cursor-pointer hover:bg-muted/50 transition-colors flex flex-col justify-between text-left"
          >
            <div>
              <div className="text-sm font-bold text-foreground mb-1">Technical Interview</div>
              <div className="text-xs text-muted-foreground">Explain concepts · 5 min</div>
            </div>
            <div className="text-xs text-muted-foreground mt-3">2 sessions</div>
          </button>
          <button 
            onClick={() => navigate('/home/winspeak/practice/setup', { state: { mode: 'behavioural-interview' } })}
            className="flex-1 bg-card border border-primary rounded-[20px] p-4 cursor-pointer hover:bg-muted/50 transition-colors flex flex-col justify-between text-left"
          >
            <div>
              <div className="text-sm font-bold text-foreground mb-1">Behavioural Interview</div>
              <div className="text-xs text-muted-foreground">STAR method · 5 min</div>
            </div>
            <div className="text-xs text-muted-foreground mt-3">1 session</div>
          </button>
        </div>
      </div>
    </div>
  );
}
