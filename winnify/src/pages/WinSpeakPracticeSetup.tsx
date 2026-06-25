import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Mic } from 'lucide-react';

export default function WinSpeakPracticeSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = (location.state?.mode as 'free-practice' | 'technical-interview' | 'behavioural-interview') || 'free-practice';
  const [selectedPrompt, setSelectedPrompt] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');

  const modeConfigs = {
    'free-practice': {
      title: 'Free Practice',
      label: 'Free Practice',
      description: 'Speak freely on any topic you choose. You\'ll be evaluated across all 6 dimensions. Great for warming up or practising a specific scenario in your own words.',
      duration: '2 minutes',
      prompts: [
        "A skill you've recently learned and how it surprised you",
        "Your most challenging group project and what you'd do differently",
        "Why you're interested in the industry you're targeting"
      ]
    },
    'technical-interview': {
      title: 'Technical Interview Practice',
      label: 'Technical Interview',
      description: 'Practice explaining technical concepts clearly and concisely. Focus on clarity, accuracy, and communication skills. You\'ll be evaluated on your ability to simplify complex ideas.',
      duration: '5 minutes',
      prompts: [
        "Explain how a binary search algorithm works",
        "Describe the difference between TCP and UDP protocols",
        "How does garbage collection work in programming languages?",
        "Explain the concept of recursion with an example",
        "What is the difference between SQL and NoSQL databases?"
      ]
    },
    'behavioural-interview': {
      title: 'Behavioural Interview Practice',
      label: 'Behavioural Interview',
      description: 'Practice using the STAR method (Situation, Task, Action, Result) to answer behavioural questions. Structure your responses clearly and focus on demonstrating your skills and experiences.',
      duration: '5 minutes',
      prompts: [
        "Tell me about a time you faced a significant challenge at work",
        "Describe a situation where you had to work with a difficult team member",
        "Tell me about a project where you took initiative",
        "Describe a time when you had to learn something new quickly",
        "Tell me about a mistake you made and how you handled it"
      ]
    }
  };

  const config = modeConfigs[mode];
  const prompts = config.prompts;

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
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">{config.title}</h1>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Mode description */}
        <div className="bg-muted rounded-[20px] p-4 border border-border">
          <div className="text-[10px] text-primary uppercase tracking-wide font-bold mb-1.5">{config.label}</div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            {config.description}
          </div>
        </div>

        {/* Prompt selection */}
        <div>
          <div className="ds-section-label mb-2">Choose a Prompt</div>
          <div className="text-[10px] font-bold text-muted-foreground mb-2">AI-suggested topics</div>
          
          {/* Suggested prompt chips */}
          <div className="space-y-2 mb-3.5">
            {prompts.map((prompt: string, index: number) => (
              <button
                key={prompt}
                onClick={() => setSelectedPrompt(index)}
                className={`bg-card rounded-[20px] p-3 cursor-pointer transition-all text-left ${selectedPrompt === index ? 'border-2 border-primary' : 'border border-border'}`}
              >
                <div className="text-xs font-bold">{prompt}</div>
              </button>
            ))}
          </div>

          <div className="text-[10px] font-bold text-muted-foreground mb-1.5">Or write your own</div>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Type your own topic or question here…"
            className="bg-card border border-border rounded-[20px] p-3.5 text-xs outline-none resize-none min-h-[80px] w-full leading-relaxed focus:border-primary transition-colors"
          />
        </div>

        {/* Duration */}
        <div>
          <div className="ds-section-label mb-2">Duration</div>
          <div className="bg-card border border-border rounded-[20px] p-3.5 flex justify-between items-center">
            <span className="text-xs font-bold">{config.duration}</span>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold">Recommended</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/home/winspeak/practice/recording')}
          className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Mic className="h-4 w-4" />
          Start Practice
        </button>
      </div>
    </div>
  );
}
