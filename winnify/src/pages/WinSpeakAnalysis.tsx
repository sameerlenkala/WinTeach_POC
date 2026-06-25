import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Activity, PenTool, Search, Book, Play, Layout, Sparkles } from 'lucide-react';

interface Metric {
  name: string;
  score: number;
  icon: React.ReactNode;
  gradient: string;
}

export default function WinSpeakAnalysis() {
  const navigate = useNavigate();

  const metrics: Metric[] = [
    { name: 'Fluency', score: 84, icon: <Activity size={12} />, gradient: 'from-primary to-primary/80' },
    { name: 'Grammar', score: 72, icon: <PenTool size={12} />, gradient: 'from-w-amber to-w-amber/80' },
    { name: 'Clarity', score: 81, icon: <Search size={12} />, gradient: 'from-w-green to-w-green/80' },
    { name: 'Vocabulary', score: 78, icon: <Book size={12} />, gradient: 'from-w-blue to-w-blue/80' },
    { name: 'Pacing', score: 90, icon: <Play size={12} />, gradient: 'from-w-green to-w-green/80' },
    { name: 'Structure', score: 68, icon: <Layout size={12} />, gradient: 'from-w-red to-w-red/80' },
  ];

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
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)] flex-1">Full Analysis</h1>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">Session</span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Score Hero */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-[20px] p-6 text-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          
          <p className="text-primary-foreground/70 text-xs mb-2 relative z-10 font-medium">Session Score</p>
          <div className="text-6xl font-bold text-primary-foreground leading-none mb-2 drop-shadow-lg relative z-10">
            79
          </div>
          <p className="text-primary-foreground/60 text-xs mb-4 relative z-10 font-bold">/ 100 · Good</p>
          
          <div className="inline-block bg-primary-foreground/15 border border-primary-foreground/20 rounded-[20px] px-4 py-1.5 backdrop-blur-sm relative z-10">
            <span className="text-primary-foreground/90 text-xs font-bold">2 min 47 sec</span>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div>
          <h3 className="ds-section-label mb-3">Detailed Metrics</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {metrics.map((m) => (
              <div key={m.name} className="bg-card p-3.5 rounded-[20px] border border-border shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                  {m.icon}
                  {m.name}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold">{m.score}</span>
                  <span className="text-[10px] text-muted-foreground font-bold">/ 100</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${m.gradient} rounded-full`} style={{ width: `${m.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transcript Analysis */}
        <div>
          <h3 className="ds-section-label mb-3">Transcript Analysis</h3>
          <div className="bg-card rounded-[20px] p-4 shadow-sm border border-border space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground mb-1">Key Phrases & Corrections</h4>
            
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-w-red mt-1.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="italic font-medium">"I was went to the office"</span>
                <span className="mx-2">→</span>
                <span className="font-bold text-foreground">"I went to the office"</span>
              </p>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-w-amber mt-1.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-bold text-foreground">"Like, you know"</span>
                <span className="ml-2">(6 uses) — reduce filler words</span>
              </p>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-w-green mt-1.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-w-green font-bold uppercase text-[10px] tracking-wider bg-w-green/10 px-1.5 py-0.5 rounded">Good</span>
                <span className="ml-2">Strong opening: "Tell me about a time..."</span>
              </p>
            </div>
          </div>
        </div>

        {/* AI Tip */}
        <div className="bg-w-blue/10 rounded-[20px] p-4 border-l-4 border-w-blue">
          <h5 className="text-xs font-bold text-w-blue uppercase tracking-wider mb-1">AI Tip</h5>
          <p className="text-xs leading-relaxed font-medium">
            Your pacing is excellent! Work on structuring answers with a clear intro, middle, and conclusion to boost your structure score.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/home/winspeak/recording')}
              className="py-3.5 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/15 transition-colors"
            >
              Practice Again
            </button>
            <button 
              onClick={() => navigate('/home/winspeak/practice')}
              className="py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-opacity"
            >
              Back to Scenarios
            </button>
          </div>
          
          <button 
            onClick={() => navigate('/home/ai-chat')}
            className="w-full py-3.5 bg-muted text-muted-foreground rounded-xl font-bold text-xs border border-border flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors"
          >
            <Sparkles size={14} />
            Chat with AI Coach
          </button>
        </div>
      </div>
    </div>
  );
}
