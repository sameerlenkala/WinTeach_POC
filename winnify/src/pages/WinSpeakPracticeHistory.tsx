import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function WinSpeakPracticeHistory() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'free', label: 'Free' },
    { id: 'debate', label: 'Debate' },
    { id: 'elevator', label: 'Elevator Pitch' },
    { id: 'interview', label: 'Interview' }
  ];

  const sessions = [
    { type: 'Free', title: "A skill you've recently learned", date: 'Today · 1m 48s', score: 72, highlight: true },
    { type: 'Debate', title: 'Remote work is more productive than office', date: '24 Mar · 2m 00s', score: 69 },
    { type: 'Free', title: 'Why I want to work at a tech startup', date: '22 Mar · 1m 55s', score: 70 },
    { type: 'Pitch', title: 'Pitch Winnify to a venture capitalist', date: '20 Mar · 60s', score: 68 },
    { type: 'Tech', title: 'Explain how a relational database works', date: '18 Mar · 2m 00s', score: 67 },
    { type: 'Free', title: 'My most challenging group project', date: '17 Mar · 1m 52s', score: 69 }
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
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Practice History</h1>
        </div>
      </div>

      {/* Filter chips */}
      <div className="overflow-x-auto px-5 py-3 flex gap-2 border-b border-border">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors ${
              activeFilter === filter.id 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        <div className="bg-card border border-border rounded-[20px] overflow-hidden">
          {sessions.map((session, index) => (
            <div
              key={index}
              onClick={() => navigate('/home/winspeak/report')}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors ${
                index < sessions.length - 1 ? 'border-b border-border' : ''
              } ${session.highlight ? 'bg-primary/5' : ''}`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[9px] font-bold text-center leading-tight ${
                session.highlight 
                  ? 'bg-primary/10 border border-primary/20 text-primary' 
                  : 'bg-muted border border-border text-muted-foreground'
              }`}>
                {session.type}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-bold truncate ${session.highlight ? 'text-primary' : ''}`}>
                  {session.title}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{session.date}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`text-xs font-bold ${session.highlight ? 'text-primary' : ''}`}>{session.score}</div>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
        <div className="text-center text-[10px] text-muted-foreground">31 sessions total</div>
      </div>
    </div>
  );
}
