import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Play, Home, BarChart3, FileDown, Volume2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const dimensions = [
  { label: 'Clarity', score: 79, change: 5, isDown: false },
  { label: 'Fluency', score: 82, change: 7, isDown: false },
  { label: 'Grammar', score: 75, change: -1, isDown: true },
  { label: 'Structure', score: 68, change: 10, isDown: false },
  { label: 'Vocabulary', score: 80, change: 6, isDown: false },
  { label: 'Relevance', score: 75, change: 2, isDown: false },
];

export default function WinSpeakPracticeReport() {
  const navigate = useNavigate();
  const [activeDimension, setActiveDimension] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky header ─────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <ArrowLeft size={18} className="text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Practice Report</h1>
                <p className="text-[10px] text-muted-foreground mt-0.5">Free Practice · 24 Mar 2026</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted transition-colors cursor-pointer">
              <Share2 size={12} />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* ── Report Content ────────────────────────────────── */}
      <div className="p-5 space-y-5">
        {/* Hero Score Section */}
        <div className="bg-primary rounded-[20px] p-4">
          <div className="text-[10px] text-primary-foreground/70 uppercase tracking-wide mb-1">Overall Score</div>
          <div className="flex items-end gap-3 mb-2">
            <div className="text-5xl font-bold font-[family-name:var(--font-heading)] text-primary-foreground leading-none">72</div>
            <div className="pb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-w-green/20 text-w-green">
                ↑ Personal best
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-foreground/10 text-primary-foreground/80 font-medium">Free Practice · 1m 48s</span>
          </div>
        </div>
        
        {/* Dimension Breakdown */}
        <div>
          <p className="ds-section-label mb-3">Dimension Breakdown</p>
          <div className="space-y-2">
            {dimensions.map((dim, i) => (
              <div key={i} className="bg-card border border-border rounded-[20px] overflow-hidden">
                <button 
                  onClick={() => setActiveDimension(activeDimension === dim.label ? null : dim.label)}
                  className="w-full flex justify-between items-center p-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12">
                      <div className="h-1 bg-muted rounded-full mb-1">
                        <div className="h-1 rounded-full bg-primary" style={{ width: `${dim.score}%` }} />
                      </div>
                      <div className="text-xs font-bold text-foreground">{dim.score}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-foreground">{dim.label}</div>
                      <div className={cn("text-[10px] font-semibold", dim.isDown ? "text-w-red" : "text-w-green")}>
                        {dim.isDown ? '↓' : '↑'} {Math.abs(dim.change)} pts this session
                      </div>
                    </div>
                  </div>
                  <ChevronDown 
                    size={14} 
                    className={cn("text-muted-foreground transition-transform", activeDimension === dim.label && "rotate-180")}
                  />
                </button>
                {activeDimension === dim.label && (
                  <div className="px-3 pb-3 text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
                    Your {dim.label.toLowerCase()} has shown a {Math.abs(dim.change)} point {dim.isDown ? 'decrease' : 'increase'} compared to your previous attempt. Focus on maintaining a consistent pace to improve this further.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Winnify Analysis */}
        <div>
          <p className="ds-section-label mb-3">Winnify Analysis</p>
          <div className="bg-card border border-border rounded-[20px] p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Coach Feedback</span>
              <button className="p-1 hover:bg-muted rounded-lg transition-colors">
                <Volume2 size={14} className="text-muted-foreground" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 bg-muted rounded-[20px] p-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary-foreground">MR</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground">Mr. Ravi</div>
                <div className="text-[10px] text-muted-foreground">Tap play to hear feedback</div>
              </div>
              <button className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors shrink-0">
                <Play size={10} className="text-foreground ml-0.5" fill="currentColor" />
              </button>
            </div>
            
            <div className="text-xs text-foreground leading-relaxed space-y-2">
              <p>
                A confident, well-paced session. You used vivid language to describe the skill — the analogy to "assembling furniture without the manual" was a memorable choice.
              </p>
              <p>
                Your fluency and vocabulary stood out particularly well. You maintained a natural conversational tone while using precise technical terms where appropriate.
              </p>
              <p>
                <strong>To focus on next:</strong> Structure remains your growth area — the response felt like a set of observations rather than a story. Try opening with the outcome first, then explaining how you got there. Also consider adding a brief reflection on what this experience taught you.
              </p>
            </div>
          </div>
        </div>

        {/* Your Transcript */}
        <div>
          <p className="ds-section-label mb-3">Your Transcript</p>
          <div className="bg-card border border-border rounded-[20px] overflow-hidden">
            {/* Audio Player */}
            <div className="flex items-center gap-3 p-3 border-b border-border">
              <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0">
                <Play size={12} className="text-primary-foreground ml-0.5" fill="currentColor" />
              </button>
              <div className="flex-1 h-1 bg-muted rounded-full relative cursor-pointer">
                <div className="h-1 rounded-full bg-primary" style={{ width: '40%' }} />
                <div className="w-2 h-2 rounded-full bg-primary absolute top-1/2 -translate-y-1/2" style={{ left: '40%' }} />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">0:00 / 1:48</span>
            </div>
            
            {/* Transcript Content */}
            <div className="p-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Speech Transcript · 1m 48s</span>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-w-amber/30 border border-w-amber/50" />
                    <span className="text-[9px] text-muted-foreground">Grammar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-w-red/20 border border-w-red/40" />
                    <span className="text-[9px] text-muted-foreground">Filler</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-muted border border-border" />
                    <span className="text-[9px] text-muted-foreground">Pause</span>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-foreground leading-loose">
                "Recently I learned React hooks, and <span className="bg-w-red/20 text-w-red px-0.5 rounded">um</span>, it was quite different from what I expected. <span className="bg-muted px-1 py-0.5 rounded text-[10px] text-muted-foreground font-medium">[1.8s pause]</span> At first it felt like assembling furniture without the manual — you know the pieces fit together somehow but you're not sure how. <span className="bg-w-red/20 text-w-red px-0.5 rounded">Like</span>, I spent hours trying to understand useEffect dependencies. The breakthrough came when I stopped thinking of it as magic and started treating it as a subscription system. <span className="bg-muted px-1 py-0.5 rounded text-[10px] text-muted-foreground font-medium">[2.3s pause]</span> Now I can build complex state management <span className="bg-w-amber/20 border-b-2 border-w-amber px-0.5 rounded cursor-pointer">which</span> previously seemed impossible. The learning curve was steep but the payoff has been significant in my recent projects."
              </p>
              
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-border">
                {[
                  { label: 'Grammar', value: '1', color: 'text-w-green' },
                  { label: 'Avg Pause', value: '2.0s', color: 'text-foreground' },
                  { label: 'Fillers', value: '2', color: 'text-w-amber' },
                  { label: 'Words', value: '128', color: 'text-foreground' }
                ].map((stat, i) => (
                  <div key={i} className="bg-muted rounded-lg p-2 text-center">
                    <div className={cn("text-sm font-bold font-[family-name:var(--font-heading)]", stat.color)}>{stat.value}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Areas to Improve */}
        <div>
          <p className="ds-section-label mb-3">Strengths & Areas to Improve</p>
          <div className="bg-card border border-border rounded-[20px] overflow-hidden">
            <div className="p-4">
              <div className="text-[10px] font-bold text-w-green uppercase tracking-wider mb-2">Strengths</div>
              <div className="space-y-2">
                {[
                  'Excellent use of analogy — "assembling furniture without the manual" made the concept relatable.',
                  'Natural conversational tone with appropriate technical vocabulary.',
                  'Clear progression from confusion to understanding to application.'
                ].map((s, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="w-1 h-1 rounded-full bg-w-green mt-1.5 shrink-0" />
                    <span className="text-xs text-foreground leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-border p-4">
              <div className="text-[10px] font-bold text-w-red uppercase tracking-wider mb-2">Areas to Improve</div>
              <div className="space-y-2">
                {[
                  'Add a clear opening statement about the outcome before diving into the story.',
                  '2 filler words detected ("um", "like") — replace with deliberate pauses.',
                  'Consider adding a brief reflection on what this learning experience taught you about your approach to new technologies.'
                ].map((s, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="w-1 h-1 rounded-full bg-w-red mt-1.5 shrink-0" />
                    <span className="text-xs text-foreground leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Better Way to Say It */}
        <div>
          <p className="ds-section-label mb-3">Better Way to Say It</p>
          <div className="bg-card border border-border rounded-[20px] p-4">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Here's one way to approach this</div>
            
            <div className="flex items-center gap-3 bg-muted rounded-[20px] p-3 mb-3">
              <button className="w-7 h-7 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0">
                <Play size={10} className="text-primary-foreground ml-0.5" fill="currentColor" />
              </button>
              <span className="text-xs text-muted-foreground font-medium">Model answer · 1:35</span>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              "I recently mastered React hooks, and it transformed how I build applications. Initially, it felt like assembling furniture without instructions — the pieces clearly fit together, but the pattern wasn't obvious. The breakthrough came when I reframed useEffect as a subscription system rather than magic. That mental model unlocked everything. Now I build complex state management that previously seemed impossible. This experience taught me that struggling with new concepts is part of the learning process — the key is finding the right mental framework."
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="space-y-2 pt-2">
          <button 
            onClick={() => navigate('/home/winspeak/practice/setup')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Home size={14} />
            Practice Again
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => navigate('/home/winspeak')}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted transition-colors"
            >
              <BarChart3 size={12} />
              Dashboard
            </button>
            <button className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted transition-colors">
              <FileDown size={12} />
              Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
