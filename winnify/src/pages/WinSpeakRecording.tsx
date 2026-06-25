import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mic } from 'lucide-react';

export default function WinSpeakRecording() {
  const navigate = useNavigate();
  const [state, setState] = useState<'recording' | 'submit' | 'processing'>('recording');
  const [timeLeft, setTimeLeft] = useState(60);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (state === 'recording') {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setState('submit');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state]);

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState('submit');
  };

  const handleRecordAgain = () => {
    setTimeLeft(60);
    setState('recording');
  };

  const handleSubmit = () => {
    setState('processing');
    setTimeout(() => {
      navigate('/home/winspeak/report');
    }, 3000);
  };

  const progress = ((60 - timeLeft) / 60) * 327;

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      <style>{`
        @keyframes waveAnim {
          from { height: 4px; }
          to { height: var(--wave-height); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="w-9"></div>
        <span className="text-[10px] font-bold text-primary-foreground/70 uppercase tracking-wider">Weekly Challenge</span>
        <button 
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-primary-foreground/10 border border-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/15 transition-colors"
        >
          <X className="h-3.5 w-3.5 text-primary-foreground" />
        </button>
      </div>

      {/* Main content - centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-7">
        
        {/* STATE 1: RECORDING */}
        {state === 'recording' && (
          <div className="flex flex-col items-center w-full">
            {/* Timer ring */}
            <div className="relative w-30 h-30 mb-5">
              <svg viewBox="0 0 120 120" className="w-30 h-30 -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6"/>
                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-w-blue" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${progress} ${327 - progress}`}/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-primary-foreground tabular-nums leading-none">{timeLeft}</div>
                <div className="text-[10px] text-primary-foreground/70 mt-0.5">seconds</div>
              </div>
            </div>

            {/* Waveform */}
            <div className="flex gap-1 items-center justify-center mb-3.5 h-12">
              {[14, 26, 20, 38, 30, 46, 34, 50, 36, 42, 26, 34, 18].map((h, i) => (
                <div 
                  key={i} 
                  className="w-1 rounded-sm bg-w-blue"
                  style={{ 
                    animation: 'waveAnim 1s ease-in-out infinite alternate',
                    animationDelay: `${i * 0.08}s`,
                    '--wave-height': `${h}px`
                  } as React.CSSProperties}
                />
              ))}
            </div>

            {/* Recording indicator */}
            <div className="flex items-center gap-2 mb-7">
              <span className="w-2 h-2 rounded-full bg-w-red" style={{ animation: 'blink 1.2s ease-in-out infinite' }}></span>
              <span className="text-xs font-medium text-primary-foreground/70">Recording in progress</span>
            </div>

            {/* Stop button */}
            <button 
              onClick={handleStop} 
              className="w-full py-3.5 bg-primary-foreground/10 text-primary-foreground rounded-xl font-bold text-sm border border-primary-foreground/15 hover:bg-primary-foreground/15 transition-colors"
            >
              Stop Recording
            </button>
          </div>
        )}

        {/* STATE 2: SUBMIT / RETRY */}
        {state === 'submit' && (
          <div className="flex flex-col items-center w-full">
            {/* Mic icon */}
            <div className="w-21 h-21 rounded-full bg-w-blue/12 border-2 border-w-blue/30 flex items-center justify-center mb-4">
              <Mic className="h-8.5 w-8.5 text-w-blue" />
            </div>
            <div className="text-base font-bold text-primary-foreground mb-1.5">You spoke for {60 - timeLeft} seconds</div>
            <div className="text-xs text-primary-foreground/70 mb-6">Your response has been captured.</div>
            <div className="w-full space-y-2.5">
              <button 
                onClick={handleSubmit} 
                className="w-full py-3.5 bg-primary-foreground text-primary rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Submit Response
              </button>
              <button 
                onClick={handleRecordAgain} 
                className="w-full py-3.5 bg-primary-foreground/10 text-primary-foreground rounded-xl font-bold text-sm border border-primary-foreground/15 hover:bg-primary-foreground/15 transition-colors"
              >
                Record Again
              </button>
            </div>
          </div>
        )}

        {/* STATE 3: PROCESSING */}
        {state === 'processing' && (
          <div className="flex flex-col items-center w-full">
            {/* Processing dots */}
            <div className="flex gap-2 mb-5">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  className="w-2.5 h-2.5 rounded-full bg-w-blue"
                  style={{ 
                    animation: 'pulse 1.4s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
            <div className="text-base font-bold text-primary-foreground mb-1.5">Processing your response…</div>
            <div className="text-xs text-primary-foreground/70 text-center leading-relaxed max-w-[260px] mb-9">
              Evaluating across 6 dimensions. This usually takes 10–15 seconds.
            </div>
            <button 
              onClick={() => navigate('/home/winspeak/report')} 
              className="py-3.5 px-10 bg-primary-foreground/10 text-primary-foreground rounded-xl font-bold text-sm border border-primary-foreground/15 hover:bg-primary-foreground/15 transition-colors"
            >
              View Report →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
