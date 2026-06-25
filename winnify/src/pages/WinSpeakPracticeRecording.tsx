import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mic, Keyboard } from 'lucide-react';

interface Message {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export default function WinSpeakPracticeRecording() {
  const navigate = useNavigate();
  const [messages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: "Hi! I'm your AI practice partner. Tell me about a time you had to communicate a complex idea to someone unfamiliar with the topic.",
      timestamp: '9:41 AM'
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: number | null = null;
    if (isRecording) {
      interval = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMicToggle = () => {
    setIsRecording(!isRecording);
  };

  const handleEndSession = () => {
    navigate('/home/winspeak/practice/report');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <style>{`
        @keyframes waveBar {
          0%, 100% { height: 4px; }
          50% { height: 28px; }
        }
        .wave-bar {
          animation: waveBar 0.8s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border flex-shrink-0">
        <button 
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-background border border-border/50 flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold flex-1">Casual Talk</span>
        <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2.5 py-1 font-medium">
          {formatTime(elapsedTime)}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-2 items-end ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                <Mic className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
            <div className={`max-w-[75%] flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`rounded-[20px] px-3.5 py-2.5 ${
                  msg.sender === 'ai' 
                    ? 'bg-primary/5 border border-primary/10 rounded-bl-sm' 
                    : 'bg-primary text-primary-foreground rounded-br-sm'
                }`}
              >
                <p className="text-xs leading-relaxed m-0">{msg.text}</p>
              </div>
              <span className="text-[9px] text-muted-foreground px-1">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Controls */}
      <div className="px-4 py-3 pb-6 flex-shrink-0 border-t border-border bg-background">
        <div className="flex flex-col items-center gap-1.5">
          {/* Audio Visualizer */}
          <div className="flex items-center gap-1 h-9">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div
                key={i}
                className={`w-[3px] rounded-sm bg-primary transition-all ${
                  isRecording ? 'wave-bar' : 'h-1 opacity-20'
                }`}
                style={{
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>

          {/* Mic Button */}
          <button
            onClick={handleMicToggle}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isRecording 
                ? 'bg-primary shadow-[0_0_0_8px_rgba(54,37,149,0.1)]' 
                : 'bg-primary shadow-[0_0_0_8px_rgba(54,37,149,0.1)]'
            }`}
          >
            <Mic className="h-6 w-6 text-primary-foreground" />
          </button>

          {/* Label */}
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {isRecording ? 'Recording...' : 'Tap to Speak'}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 mt-0.5">
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-[11px] font-bold text-primary hover:bg-primary/10 transition-colors">
              <Keyboard className="h-3 w-3" />
              Type Response
            </button>
            <button 
              onClick={handleEndSession}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-[11px] font-bold text-white hover:from-red-600 hover:to-red-700 transition-all shadow-[0_4px_12px_rgba(239,68,68,0.25)]"
            >
              End Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
