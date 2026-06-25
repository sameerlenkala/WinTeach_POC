import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Play, Home, BarChart3, FileDown, Volume2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const dimensions = [
  { label: 'Clarity', score: 84, change: 8, isDown: false },
  { label: 'Fluency', score: 81, change: 6, isDown: false },
  { label: 'Grammar', score: 74, change: -2, isDown: true },
  { label: 'Structure', score: 73, change: 14, isDown: false },
  { label: 'Vocabulary', score: 77, change: 4, isDown: false },
  { label: 'Relevance', score: 79, change: 3, isDown: false },
];

export default function WinSpeakReport() {
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
                <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Challenge Report</h1>
                <p className="text-[10px] text-muted-foreground mt-0.5">Week 14 · 24 Mar 2026</p>
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
            <div className="text-5xl font-bold font-[family-name:var(--font-heading)] text-primary-foreground leading-none">76</div>
            <div className="pb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-w-green/20 text-w-green">
                ↑ 3 vs last
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-foreground/10 text-primary-foreground/80 font-medium">Rank #11 this week</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-w-green/20 text-w-green">
              ↑ 1 place
            </span>
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
                Your response showed clear improvement in how you open difficult conversations. You acknowledged the delay immediately without hedging — that directness is exactly what leadership teams need.
              </p>
              <p>
                Structure improved most noticeably: you followed a clear <strong>Problem → Root Cause → Impact → Recovery</strong> path. Mentioning the contingency plan added real credibility.
              </p>
              <p>
                <strong>To focus on next:</strong> Your closing felt slightly rushed. Invest 8–10 seconds in a confident wrap-up reaffirming your team's commitment. Also watch for filler words ("kind of", "sort of") — 3 instances detected in the middle section.
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
                <div className="h-1 rounded-full bg-primary" style={{ width: '35%' }} />
                <div className="w-2 h-2 rounded-full bg-primary absolute top-1/2 -translate-y-1/2" style={{ left: '35%' }} />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">0:00 / 0:52</span>
            </div>
            
            {/* Transcript Content */}
            <div className="p-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Speech Transcript · 52s</span>
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
                "So <span className="bg-w-red/20 text-w-red px-0.5 rounded">um</span>, I wanted to give you all an important update — our project is going to be delayed by approximately two weeks. <span className="bg-muted px-1 py-0.5 rounded text-[10px] text-muted-foreground font-medium">[2.1s pause]</span> I know this isn't the news we wanted. The root cause is an unexpected <span className="bg-w-amber/20 border-b-2 border-w-amber px-0.5 rounded cursor-pointer">blocker</span> in the authentication module <span className="bg-w-amber/20 border-b-2 border-w-amber px-0.5 rounded cursor-pointer">which</span> we discovered on Wednesday. Our team has been working around the clock since then. We now have full scope clarity, <span className="bg-w-red/20 text-w-red px-0.5 rounded">kind of</span>, and two weeks is our confident revised timeline. Our mitigation includes bringing in two contract developers to accelerate the remaining work. <span className="bg-w-red/20 text-w-red px-0.5 rounded">Sort of</span> getting that in place now. I'll send a full timeline update by end of day today. I remain confident in the outcome and I'm available for any questions."
              </p>
              
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-border">
                {[
                  { label: 'Grammar', value: '2', color: 'text-w-red' },
                  { label: 'Avg Pause', value: '2.1s', color: 'text-foreground' },
                  { label: 'Fillers', value: '3', color: 'text-w-red' },
                  { label: 'Words', value: '152', color: 'text-foreground' }
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
                  'Acknowledged the delay directly and without hedging — strong professional opener.',
                  'Clear Problem → Root Cause → Impact → Recovery structure throughout.',
                  'Confident use of professional vocabulary: "mitigation", "contingency plan", "revised timeline".'
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
                  'Closing felt rushed — invest 8–10 seconds in a confident wrap-up reaffirmation.',
                  '3 filler words detected ("um", "kind of", "sort of") — replace with deliberate pauses.',
                  'Two tense inconsistencies in the recovery plan section — stay in past tense throughout.'
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
              <span className="text-xs text-muted-foreground font-medium">Model answer · 0:48</span>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              "I want to give you a direct update: we're pushing delivery by two weeks. The root cause is an authentication impediment we identified Wednesday — our team has been on it since. We've scoped the full fix, brought in two contract developers, and our revised timeline is firm. I'll send a detailed breakdown by EOD today. We remain fully committed to the outcome."
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="space-y-2 pt-2">
          <button 
            onClick={() => navigate('/home/winspeak')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Home size={14} />
            Back to Home
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => navigate('/home/winspeak/leaderboard')}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted transition-colors"
            >
              <BarChart3 size={12} />
              Leaderboard
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
