import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mic, Info } from 'lucide-react';
import { WinSpeakCueModal } from '@/components/WinSpeakCueModal';

export default function WinSpeakChallengeDetail() {
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)] flex-1">Challenge Detail</h1>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">Week 14</span>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto p-5 space-y-5">
        {/* Video Section */}
        <div className="bg-card border border-border rounded-[20px] overflow-hidden max-w-2xl mx-auto lg:max-w-xl xl:max-w-2xl">
          <div className="relative w-full bg-gray-900" style={{ paddingBottom: '56.25%' }}>
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-contain"
            >
              <source src="/ai-coach.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        {/* Challenge Card */}
        <div className="bg-primary rounded-xl p-4 lg:p-3 xl:p-5 max-w-2xl mx-auto lg:max-w-xl xl:max-w-2xl">
          <div className="flex justify-between items-center mb-2 lg:mb-1.5 xl:mb-3">
            <span className="text-[10px] font-bold text-primary-foreground/60 uppercase tracking-wide">Week 14 · Workplace</span>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground/70 font-medium">3 days left</span>
          </div>
          <div className="text-xs lg:text-[11px] xl:text-xs text-primary-foreground/70 leading-relaxed mb-2 lg:mb-1.5 xl:mb-3">
            You're a project manager at a tech firm. Your team hit an unforeseen authentication blocker, pushing delivery by two weeks.
          </div>
          <div className="text-base lg:text-sm xl:text-base italic text-primary-foreground leading-relaxed my-2 lg:my-1.5 xl:my-3 font-medium">
            "How would you communicate a 2-week project delay to your leadership team?"
          </div>
          <div className="flex gap-2 flex-wrap mt-2 lg:mt-1.5 xl:mt-3">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground/70 font-medium">60 seconds</span>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground/70 font-medium">Official · Leaderboard</span>
          </div>
        </div>

        {/* WinSpeak Cue trigger */}
        <div className="flex justify-center py-2">
          <button
            onClick={() => setSheetOpen(true)}
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity"
          >
            <Info className="h-4 w-4" />
            Not sure where to start?
          </button>
        </div>

        {/* Start Challenge button */}
        <button
          onClick={() => navigate('/home/winspeak/recording')}
          className="w-full lg:w-auto lg:mx-auto lg:px-10 xl:w-full xl:px-0 py-2.5 lg:py-2 xl:py-4 bg-primary text-primary-foreground rounded-xl font-bold text-xs lg:text-xs xl:text-base flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-lg"
        >
          <Mic className="h-3.5 w-3.5 lg:h-3.5 lg:w-3.5 xl:h-5 xl:w-5" />
          Start Challenge
        </button>
      </div>

      {/* WinSpeak Cue Modal */}
      <WinSpeakCueModal isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
