import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, Trash2, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Message {
  id: number;
  role: 'agent' | 'user';
  text: string;
}

const initialMessage: Message = {
  id: 1,
  role: 'agent',
  text: 'Hi! I\'m Winni, your career companion. Ask me anything about your Slog Overs plan, mock tests, WinSpeak, resume building, or placement preparation.',
};

const agentResponses: Record<string, string> = {
  'slog overs': 'Your Slog Overs plan is a personalized roadmap with 6 milestones: Revision Course → Resume Validation → Company Assessments → WinSpeak Challenges → Employability Interview → In-Person Interview. Each milestone has a target score you need to hit before moving forward. You can reconfigure your plan anytime from the Slog Overs page.',
  'winspeak': 'WinSpeak is your communication training module. It scores you across 6 dimensions: Fluency, Grammar, Clarity, Structure, Vocabulary, and Relevance. You can practice with Free Practice, Elevator Pitch, Tech Interview, or Debate modes. Complete weekly challenges to earn XP and climb the leaderboard.',
  'mock test': 'The Mocktest Hub has 3 categories: Aptitude (Quantitative, Verbal, Logical, Data Interpretation), Technical (DSA, DBMS, OS, CN, OOP, Web Dev), and Company OA (TCS, Infosys, Wipro, Google, Microsoft, Amazon, and more). Each test is configurable — choose your topic, difficulty, question count, and time limit.',
  'resume': 'The Resume Builder lets you create and customize your resume with sections for Personal Info, Education, Skills, Experience, Projects, and Certifications. The ATS Review tab scores your resume across 6 dimensions and gives AI-powered suggestions. You can preview your resume in 3 templates: Classic, Modern, and Minimal.',
  'drives': 'The Campus Drives portal shows all open placement drives with company details, CTC, location, eligibility, and deadlines. You can filter by On Campus / Off Campus and track your application status. Each drive has a match percentage based on your profile.',
  'score': 'Your Winnify Score (0-100) is calculated from: Mock Test performance (30%), WinSpeak scores (25%), Course completion (20%), Consistency/streaks (15%), and Community participation (10%). Check your detailed breakdown on the Profile page.',
  'help': 'You can find help in several places:\n• **Support page** — FAQ, contact form, live chat\n• **Settings** — Account, notifications, appearance, privacy\n• **AI Chat** — Full AI assistant for career guidance\n• Or just ask me here!',
};

function getAgentReply(userText: string): string {
  const lower = userText.toLowerCase();
  for (const [key, response] of Object.entries(agentResponses)) {
    if (lower.includes(key)) return response;
  }
  return 'That\'s a great question! Based on your current progress, I\'d recommend focusing on your weakest areas first. Check your Score Dashboard for a detailed breakdown, or visit Slog Overs to see your next milestone. Is there something specific you\'d like help with?';
}

export default function AskAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(2);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');

    const userMsg: Message = { id: nextId.current++, role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    setTimeout(() => {
      const reply = getAgentReply(text);
      setMessages((prev) => [...prev, { id: nextId.current++, role: 'agent', text: reply }]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };

  const handleClear = () => {
    setMessages([initialMessage]);
    nextId.current = 2;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Floating button when closed — hidden
  if (!open) {
    return null;
  }

  // Chat panel when open
  return (
    <div
      className="fixed bottom-8 right-8 z-50 flex flex-col rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
      style={{ width: 'min(480px, calc(100vw - 32px))', height: 'min(580px, calc(100vh - 80px))' }}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="26" fill="none" viewBox="0 0 32 26" className="h-5 w-5">
            <path fill="url(#aw-grad2)" d="M30.886 12.313 19.355.785a.96.96 0 0 0-1.366 0l-1.985 1.986L14.015.783a.962.962 0 0 0-1.362 0L1.113 12.322a.966.966 0 0 0 0 1.365l11.529 11.528c.38.38.988.38 1.368 0l1.985-1.982 1.986 1.985a.971.971 0 0 0 1.365 0l11.54-11.54a.966.966 0 0 0 0-1.365Z" />
            <path fill="currentColor" className="text-card" d="M16.794 4.536A12.977 12.977 0 0 0 24.46 12.2c.74.274.74 1.32 0 1.594a12.977 12.977 0 0 0-7.665 7.665c-.274.74-1.32.74-1.594 0a12.977 12.977 0 0 0-7.665-7.665c-.74-.274-.74-1.32 0-1.595A12.977 12.977 0 0 0 15.2 4.537c.274-.74 1.32-.74 1.594 0Z" />
            <defs>
              <linearGradient id="aw-grad2" x1=".831" x2="35.167" y1="2.063" y2="13.6" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2563EB" />
                <stop offset="1" stopColor="#64E4D0" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-sm font-bold font-[family-name:var(--font-heading)]">Agent Winni</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClear}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Messages ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ overscrollBehavior: 'contain' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-transparent text-foreground'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>
            </div>
            {/* Feedback buttons for agent messages */}
            {msg.role === 'agent' && msg.id > 1 && (
              <div className="flex items-center gap-1.5 mt-1 px-1">
                <button className="text-muted-foreground/40 hover:text-primary transition-colors cursor-pointer">
                  <ThumbsUp className="h-3.5 w-3.5" />
                </button>
                <button className="text-muted-foreground/40 hover:text-primary transition-colors cursor-pointer">
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}

        {typing && (
          <div className="flex items-start">
            <div className="bg-transparent text-muted-foreground text-sm flex items-center gap-1.5 px-4 py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Winni is thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ─────────────────────────────────────────────── */}
      <div className="px-4 pb-3">
        <div className="flex items-end gap-2 rounded-lg border border-border bg-card shadow-sm px-3 py-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your placement prep..."
            rows={1}
            className="flex-1 resize-none border-none bg-transparent text-sm leading-5 placeholder:text-muted-foreground focus:outline-none"
            style={{ minHeight: '24px', maxHeight: '96px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shrink-0"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground/60 mt-2">
          Powered by Winnify AI · Responses are for guidance only
        </p>
      </div>
    </div>
  );
}
