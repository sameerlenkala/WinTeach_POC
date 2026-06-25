import { useState } from 'react';
import { ChevronDown, ArrowLeft, X } from 'lucide-react';

interface WinSpeakCueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const cueSteps = [
  { 
    num: 1, 
    name: 'Strong Opening', 
    timing: '5–10 sec', 
    purpose: 'Confident, specific hook — not a generic intro.', 
    example: '"I want to update the team on a two-week delay and walk you through exactly what we\'re doing about it."' 
  },
  { 
    num: 2, 
    name: 'Context / Background', 
    timing: '10–15 sec', 
    purpose: 'Framing so the listener understands the topic.', 
    example: '"We hit an authentication blocker during integration testing — not a skill gap, an unplanned dependency."' 
  },
  { 
    num: 3, 
    name: 'Core Point / Argument', 
    timing: '15–20 sec', 
    purpose: 'The student\'s main idea or position.', 
    example: '"Revised delivery is confirmed for the 24th. We\'ve restructured the sprint and the rest of the backlog stays on track."' 
  },
  { 
    num: 4, 
    name: 'Example or Experience', 
    timing: '15–20 sec', 
    purpose: 'A specific instance that supports the core point.', 
    example: '"We handled a similar blocker in Q2 — isolated it in 48 hours. We\'re applying the same containment approach here."' 
  },
  { 
    num: 5, 
    name: 'Confident Close', 
    timing: '5–10 sec', 
    purpose: 'Restate position, end cleanly — no trailing off.', 
    example: '"We\'re on top of this. I\'ll send a written update by EOD and flag immediately if anything changes."' 
  },
];

const deliveryTips = [
  'Understand the structure, then speak naturally — do not memorise word-for-word.',
  'Vary your pace — slow down on key words, do not rush the close.',
  'Pause 1–2 seconds between sections — signals structure and confidence.',
  'Use specific examples — "my internship project" beats "something I did".',
  'Keep tone conversational but professional.',
];

const chipLabels = ['Opening', 'Context', 'Core Point', 'Example', 'Close'];

export function WinSpeakCueModal({ isOpen, onClose }: WinSpeakCueModalProps) {
  const [activeChip, setActiveChip] = useState(0);
  const [tipsOpen, setTipsOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background animate-in fade-in duration-200">
      <div className="h-full overflow-y-auto">
        <div className="px-6 py-6 space-y-6">
          {/* Top Navigation */}
          <div className="flex items-center justify-between">
            <button 
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Header Section */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-xl font-bold font-[family-name:var(--font-heading)] text-foreground mb-1">WinSpeak Cue</h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A simple structure to get you started. This framework helps you organize your thoughts and deliver a clear, confident response in any speaking challenge.
              </p>
              <div className="mt-3 inline-block">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">1st Year</span>
              </div>
            </div>
          </div>

          {/* Chip Navigation */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-bold font-[family-name:var(--font-heading)]">Quick Navigation</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {chipLabels.map((c, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveChip(i)} 
                  className={`flex-shrink-0 text-[11px] font-bold rounded-xl px-3.5 py-2 whitespace-nowrap transition-all ${
                    activeChip === i 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-muted border border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Cue Steps */}
          <div className="space-y-3">
            {cueSteps.map((s, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {s.num}
                  </div>
                  <span className="text-sm font-bold flex-1">{s.name}</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground flex-shrink-0">
                    {s.timing}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">
                  {s.purpose}
                </p>
                <div className="bg-muted/50 rounded-lg p-3 border-l-2 border-primary">
                  <p className="text-xs italic leading-relaxed text-foreground">
                    {s.example}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Tips */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <button 
              onClick={() => setTipsOpen(p => !p)} 
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <span className="text-sm font-bold">Delivery Tips</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${tipsOpen ? 'rotate-180' : ''}`} />
            </button>
            {tipsOpen && (
              <div className="px-4 pb-4 border-t border-border pt-4 space-y-2.5">
                {deliveryTips.map((t, i) => (
                  <div key={i} className="flex gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-xs leading-relaxed text-foreground flex-1">
                      {t}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
