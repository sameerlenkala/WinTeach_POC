import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, ChevronRight, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChallengeTimeline } from '@/components/ChallengeTimeline';

export default function WinSpeak() {
  const navigate = useNavigate();
  const [showDimensions, setShowDimensions] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'challenge'>('overview');

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky header ─────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">WinSpeak</h1>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 mt-3 -mb-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                "px-3 py-2 text-xs font-semibold transition-all border-b-2",
                activeTab === 'overview' 
                  ? 'text-primary border-primary' 
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              )}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('challenge')}
              className={cn(
                "px-3 py-2 text-xs font-semibold transition-all border-b-2",
                activeTab === 'challenge' 
                  ? 'text-primary border-primary' 
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              )}
            >
              Challenge Timeline
            </button>
          </div>
        </div>
      </div>

      {/* ── WinSpeak Content ────────────────────────────────── */}
      <div className="p-5 space-y-5">
        {activeTab === 'overview' ? (
          <>
            {/* This Week's Challenge */}
            <div>
              <p className="text-sm font-semibold text-muted-foreground font-[family-name:var(--font-display)] mb-3">This Week's Challenge</p>
              <div 
                onClick={() => navigate('/home/winspeak/challenge/detail')}
                className="bg-primary rounded-[20px] p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-semibold text-primary-foreground/70 uppercase tracking-wide">Week 14 · Workplace</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-foreground/10 text-primary-foreground/80 font-medium">3 days left</span>
                </div>
                <p className="text-sm font-medium text-primary-foreground/95 leading-relaxed mb-3">
                  "How would you communicate a 2-week project delay to your leadership team?"
                </p>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-card text-muted-foreground font-medium">Not Attempted</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/home/winspeak/challenge/detail'); }}
                    className="px-3 py-1.5 rounded-[20px] text-xs font-bold bg-card text-primary hover:opacity-90 transition-opacity"
                  >
                    Take Challenge
                  </button>
                </div>
              </div>
            </div>

            {/* Score Card */}
            <div>
              <p className="text-sm font-semibold text-muted-foreground font-[family-name:var(--font-display)] mb-3">Your WinSpeak Score</p>
              <div className="bg-primary border border-w-amber/30 rounded-[20px] p-4">
                <div 
                  onClick={() => navigate('/home/winspeak/scores')}
                  className="flex items-center gap-4 cursor-pointer"
                >
                  {/* Progress Ring */}
                  <div className="relative w-16 h-16 shrink-0">
                    <svg viewBox="0 0 76 76" className="w-full h-full -rotate-90">
                      <circle cx="38" cy="38" r="32" fill="none" stroke="currentColor" className="text-primary-foreground/15" strokeWidth="5"/>
                      <circle cx="38" cy="38" r="32" fill="none" stroke="currentColor" className="text-w-amber" strokeWidth="5" strokeLinecap="round" strokeDasharray="149 52"/>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-base font-bold text-primary-foreground">74</div>
                      <div className="text-[8px] text-primary-foreground/60">/100</div>
                    </div>
                  </div>
                  
                  {/* Score Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-primary-foreground/70 uppercase tracking-wide mb-1">Overall Score</div>
                    <div className="text-3xl font-bold font-[family-name:var(--font-heading)] text-primary-foreground leading-none mb-2">74</div>
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-w-green/20 text-w-green">
                        ↑ 2 this week
                      </span>
                      <span className="text-[10px] text-primary-foreground/60">Rank #12</span>
                    </div>
                  </div>
                  
                  {/* Dropdown Arrow */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDimensions(!showDimensions); }}
                    className="shrink-0 p-1 transition-transform"
                    style={{ transform: showDimensions ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <ChevronRight className="h-4 w-4 text-primary-foreground/60 rotate-90" />
                  </button>
                </div>

                {/* Dimension Mini-Grid */}
                {showDimensions && (
                  <div className="grid grid-cols-3 gap-3 border-t border-primary-foreground/15 pt-3 mt-3">
                    {[
                      { label: 'Fluency', value: 81 },
                      { label: 'Grammar', value: 74 },
                      { label: 'Clarity', value: 84 },
                      { label: 'Structure', value: 73 },
                      { label: 'Vocabulary', value: 77 },
                      { label: 'Relevance', value: 79 }
                    ].map((dim, i) => {
                      let colorClass = 'bg-w-red';
                      if (dim.value >= 76) colorClass = 'bg-w-green';
                      else if (dim.value >= 51) colorClass = 'bg-w-amber';
                      
                      return (
                        <button 
                          key={i} 
                          onClick={() => navigate(`/home/winspeak/dimension/${dim.label.toLowerCase()}`)}
                          className="text-left hover:bg-primary-foreground/5 rounded-lg p-2 transition-colors"
                        >
                          <div className="text-[10px] text-primary-foreground/60 mb-1 uppercase tracking-wide">{dim.label}</div>
                          <div className="h-1 bg-primary-foreground/15 rounded-full mb-1">
                            <div className={cn("h-1 rounded-full", colorClass)} style={{ width: `${dim.value}%` }} />
                          </div>
                          <div className="text-xs font-semibold text-primary-foreground">{dim.value}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Stats Strip */}
            <div>
              <p className="text-sm font-semibold text-muted-foreground font-[family-name:var(--font-display)] mb-3">Performance Stats</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: '14', label: 'Challenges' },
                  { value: '31', label: 'Sessions' },
                  { value: '#12', label: 'This week', highlight: true }
                ].map((stat, i) => (
                  <div 
                    key={i} 
                    className="bg-card border border-border rounded-[20px] p-3 text-center"
                  >
                    <div className={cn(
                      "text-xl font-bold font-[family-name:var(--font-heading)]",
                      stat.highlight ? "text-primary" : "text-foreground"
                    )}>{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard Snippet */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-semibold text-muted-foreground font-[family-name:var(--font-display)]">Leaderboard · Week 14</p>
                <button 
                  onClick={() => navigate('/home/winspeak/leaderboard')}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  See All
                </button>
              </div>
              <div className="bg-card border border-border rounded-[20px] overflow-hidden divide-y divide-border">
                {[
                  { rank: 1, name: 'Priya Sharma', school: 'BITS Pilani · CSE', score: 891, gold: true },
                  { rank: 2, name: 'Arjun Mehta', school: 'IIT Bombay · CS', score: 856, gold: true },
                  { rank: 12, name: 'You · Sameer', school: 'CBIT Hyderabad', score: 742, isMe: true }
                ].map((user, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "flex items-center gap-3 p-3",
                      user.isMe && "bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                      user.gold || user.isMe ? "bg-primary/10 text-primary border border-primary/20" :
                      "bg-muted text-muted-foreground border border-border"
                    )}>
                      {user.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-xs font-semibold truncate",
                        user.isMe ? "text-primary" : "text-foreground"
                      )}>{user.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{user.school}</div>
                    </div>
                    <div className={cn(
                      "text-xs font-bold shrink-0",
                      user.isMe ? "text-primary" : "text-foreground"
                    )}>{user.score}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice Modes */}
            <div>
              <p className="text-sm font-semibold text-muted-foreground font-[family-name:var(--font-display)] mb-3">Practice Modes</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: 'Casual Talk', subtitle: 'Any topic · 2 min' },
                  { title: 'Debate', subtitle: '2 min · Challenge' },
                  { title: 'Pitch Your Idea', subtitle: 'High-impact · 60 sec' },
                  { title: 'Give a Presentation', subtitle: 'Structured talk · 2 min' },
                ].map((mode, i) => (
                  <button 
                    key={i}
                    onClick={() => navigate('/home/winspeak/practice')}
                    className="bg-primary rounded-[20px] p-3 text-left hover:shadow-md transition-shadow"
                  >
                    <div className="text-xs font-semibold text-primary-foreground mb-1">{mode.title}</div>
                    <div className="text-[10px] text-primary-foreground/70">{mode.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips Card */}
            <div>
              <p className="text-sm font-semibold text-muted-foreground font-[family-name:var(--font-display)] mb-3">This Week's Tip</p>
              <div 
                onClick={() => navigate('/home/winspeak/tips')}
                className="bg-w-amber/10 border border-w-amber/20 rounded-[20px] p-3 flex gap-3 items-start cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <Lightbulb size={16} className="text-primary-foreground" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground mb-1">Improve your Structure score</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">Use the PREP framework. Your last 3 attempts lacked a clear closing statement.</div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-w-amber/20 text-w-amber font-semibold">Structure</span>
                  <ChevronRight size={14} className="text-primary" strokeWidth={2} />
                </div>
              </div>
            </div>
          </>
        ) : (
          // Challenge Tab Content
          <>
            {/* Compact Leaderboard Card */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-semibold text-muted-foreground font-[family-name:var(--font-display)]">Leaderboard · Week 14</p>
                <button 
                  onClick={() => navigate('/home/winspeak/leaderboard')}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  See All
                </button>
              </div>
              <div className="bg-card border border-border rounded-[20px] overflow-hidden divide-y divide-border">
                {[
                  { rank: 1, name: 'Priya Sharma', school: 'BITS Pilani', score: 89 },
                  { rank: 2, name: 'Arjun Mehta', school: 'IIT Bombay', score: 86 },
                  { rank: 12, name: 'You', school: 'CBIT Hyderabad', score: 74, isMe: true }
                ].map((entry, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "flex items-center gap-3 p-3",
                      entry.isMe && "bg-primary/5"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 bg-primary/10 text-primary border border-primary/20">
                      {entry.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-xs font-semibold truncate",
                        entry.isMe ? "text-primary" : "text-foreground"
                      )}>{entry.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{entry.school}</div>
                    </div>
                    <div className={cn(
                      "text-xs font-bold shrink-0",
                      entry.isMe ? "text-primary" : "text-foreground"
                    )}>{entry.score}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Challenge Timeline */}
            <ChallengeTimeline />
          </>
        )}
      </div>
    </div>
  );
}
