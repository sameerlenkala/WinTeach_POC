import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, ChevronRight } from 'lucide-react';

export default function WinSpeakTips() {
  const navigate = useNavigate();
  const [expandedDimension, setExpandedDimension] = React.useState<string | null>('Structure');

  const dimensions = [
    { name: 'Clarity', you: 84, cohort: 72 },
    { name: 'Fluency', you: 81, cohort: 69 },
    { name: 'Grammar', you: 74, cohort: 77 },
    { name: 'Structure', you: 73, cohort: 75 },
    { name: 'Vocabulary', you: 77, cohort: 71 },
    { name: 'Relevance', you: 79, cohort: 73 }
  ];

  const dimensionTips: Record<string, Array<{ title: string; content: string; example: string }>> = {
    'Structure': [
      { 
        title: 'Use the PREP framework', 
        content: 'Point → Reason → Example → Point. Start with your main point, explain why, give an example, then restate your point.',
        example: 'Try: "I believe remote work increases productivity [P]. Teams save commute time [R]. At my internship, our team delivered 20% faster remotely [E]. So remote work clearly boosts output [P]."'
      },
      {
        title: 'Signal transitions clearly',
        content: 'Use explicit phrases like "First," "Additionally," "In conclusion" to guide your listener through your response structure.',
        example: 'Try: "First, let me explain the problem. Additionally, here\'s how we solved it. In conclusion, this approach saved us 3 weeks."'
      },
      {
        title: 'Always close with a summary',
        content: 'End every response by restating your main point in one sentence. This creates a sense of completion.',
        example: 'Try: "So in summary, effective communication is the key to successful project management."'
      }
    ],
    'Grammar': [
      {
        title: 'Watch subject-verb agreement under pressure',
        content: 'Common error: "The team have decided" → Correct: "The team has decided". Collective nouns take singular verbs.',
        example: 'Practice: "The company is growing" not "The company are growing"'
      },
      {
        title: 'Use present perfect for recent actions',
        content: 'When describing recent experiences, use "have/has + past participle" instead of simple past.',
        example: 'Try: "I have completed three projects" instead of "I completed three projects" when the timeframe is recent/ongoing.'
      }
    ],
    'Fluency': [
      {
        title: 'Reduce filler words',
        content: 'Replace "um," "like," "you know" with brief pauses. Silence is better than fillers.',
        example: 'Instead of: "So, um, like, I think..." → Try: "So... [pause] I think..."'
      },
      {
        title: 'Practice pacing with breath control',
        content: 'Take a breath at natural sentence breaks. This prevents rushed speech and reduces fillers.',
        example: 'Try: Speak one complete thought → Breathe → Next thought. Don\'t rush through multiple ideas.'
      }
    ],
    'Clarity': [
      {
        title: 'Emphasize key words',
        content: 'Stress important words in each sentence to help your listener follow your main points.',
        example: 'Try: "The PROJECT was DELAYED by TWO weeks" (emphasize capitals)'
      },
      {
        title: 'Vary your pitch',
        content: 'Use rising pitch for questions, falling pitch for statements. Monotone speech loses attention.',
        example: 'Practice: "Should we proceed? [rising] Yes, we should. [falling]"'
      }
    ],
    'Vocabulary': [
      {
        title: 'Replace weak intensifiers',
        content: 'Instead of "very important," use: critical, essential, vital, pivotal, consequential.',
        example: 'Weak: "This is very important" → Strong: "This is critical to our success"'
      },
      {
        title: 'Use precise action verbs',
        content: 'Replace generic verbs with specific ones: "did" → executed, implemented, orchestrated.',
        example: 'Weak: "I did the project" → Strong: "I orchestrated the project delivery"'
      }
    ],
    'Relevance': [
      {
        title: 'Answer the question directly first',
        content: 'State your answer in the first sentence, then provide supporting details.',
        example: 'Question: "Why this role?" → Start with: "I\'m pursuing this role because..." not "Let me tell you about my background..."'
      },
      {
        title: 'Stay on topic',
        content: 'Every sentence should connect back to the original question. Avoid tangents.',
        example: 'If asked about leadership, don\'t spend 30 seconds on technical skills.'
      }
    ]
  };

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
          <div className="flex-1">
            <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Your WinSpeak Tips</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <CheckCircle className="h-2.5 w-2.5 text-w-green" />
              <span className="text-[10px] text-w-green font-bold">Refreshed today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Your Focus This Week */}
        <div>
          <div className="ds-section-label mb-3">Your Focus This Week</div>
          
          {/* Personalized greeting */}
          <div className="bg-primary rounded-xl p-4">
            <div className="text-[10px] text-primary-foreground/60 uppercase tracking-wide font-bold mb-1.5">Week 14 · AI-Personalized</div>
            <div className="text-xs text-primary-foreground/90 leading-relaxed">
              Based on your last 5 challenges, here's what to focus on this week. Structure and Grammar are your highest-leverage dimensions.
            </div>
          </div>
        </div>

        {/* Top Personalized Tip */}
        <div>
          <div className="ds-section-label mb-3">This Week's Tips</div>

          <div className="bg-card border border-border rounded-[20px] overflow-hidden">
            <div className="p-4 pb-2.5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Tip 1 · Structure</span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-w-red/10 text-w-red font-medium">Weakest this week</span>
              </div>
              <div className="text-xs font-bold mb-1.5">Use the PREP framework in every response</div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                Start with your Point, give the Reason, add an Example, then restate your Point. Your last 3 challenges showed strong content but weak framing — this framework will fix that in one practice session.
              </div>
            </div>
            <div className="border-t border-border p-2.5 px-4">
              <button
                onClick={() => navigate('/home/winspeak/practice/setup')}
                className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold hover:opacity-90"
              >
                Practice Structure →
              </button>
            </div>
          </div>
        </div>

        {/* You vs Peers chart */}
        <div>
          <div className="ds-section-label mb-3">You vs Your Peers</div>
          <div className="bg-card border border-border rounded-[20px] p-4">
            <div className="space-y-2.5">
              {dimensions.map((dim) => (
                <div key={dim.name}>
                  <div className="text-[10px] font-bold text-muted-foreground mb-1">{dim.name}</div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${dim.you}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold min-w-[24px] text-right">{dim.you}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dimension Tip Library */}
        <div>
          <div className="ds-section-label mb-3">All Dimension Tips</div>
          <div className="space-y-2.5">
            {Object.keys(dimensionTips).map((dimName) => {
              const isExpanded = expandedDimension === dimName;
              
              return (
                <div key={dimName} className="bg-card border border-border rounded-[20px] overflow-hidden">
                  <div
                    onClick={() => setExpandedDimension(isExpanded ? null : dimName)}
                    className="p-3.5 cursor-pointer flex justify-between items-center hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-xs font-bold">{dimName}</span>
                    <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 border-t border-border pt-3">
                      <div className="space-y-3">
                        {dimensionTips[dimName].map((tip, i) => (
                          <div key={i}>
                            <div className="text-xs font-bold mb-1">{tip.title}</div>
                            <div className="text-[10px] text-muted-foreground leading-relaxed mb-1.5">{tip.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
