import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, User, Lightbulb, FileText, Briefcase } from 'lucide-react';

/* ── Data ─────────────────────────────────────────────────────── */
interface Message {
  id: number;
  role: 'ai' | 'user';
  text: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: 'ai',
    text: "Hi there! I'm your AI career assistant. I can help you with interview preparation, resume reviews, career advice, and more. What would you like to work on today?",
  },
];

const quickActions = [
  { label: 'Interview Tips', icon: Lightbulb },
  { label: 'Resume Review', icon: FileText },
  { label: 'Career Advice', icon: Briefcase },
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'ai',
        text: "That's a great question! Let me think about that for a moment. Based on your profile and goals, here's what I'd recommend...\n\nFocus on strengthening your DSA fundamentals first, then move to system design. Practice at least 2 problems daily and review your solutions.",
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  const handleQuickAction = (label: string) => {
    const userMsg: Message = { id: Date.now(), role: 'user', text: label };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const responses: Record<string, string> = {
        'Interview Tips': "Here are my top interview tips:\n\n1. Practice the STAR method for behavioral questions\n2. Think out loud during coding interviews\n3. Ask clarifying questions before diving in\n4. Review common system design patterns\n5. Prepare 2-3 questions to ask the interviewer",
        'Resume Review': "I'd be happy to review your resume! Here are some general tips:\n\n• Keep it to 1 page for entry-level positions\n• Quantify your achievements (e.g., 'Improved load time by 40%')\n• Tailor your resume for each application\n• Use action verbs: Built, Designed, Implemented, Optimized",
        'Career Advice': "Based on your profile, here's my career advice:\n\n• Focus on building strong DSA and system design skills\n• Contribute to open-source projects for visibility\n• Network with alumni at target companies\n• Build 2-3 solid projects that demonstrate your skills\n• Start preparing for interviews 3 months in advance",
      };
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'ai',
        text: responses[label] || "I'd be happy to help with that!",
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 800);
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col h-[calc(100vh-80px)]">
      {/* ── Header ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-w-purple to-w-indigo p-6 text-white mb-6 shrink-0">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
        <h1 className="relative z-10 text-2xl font-extrabold font-[family-name:var(--font-heading)] flex items-center gap-2">
          <Bot className="h-6 w-6" /> AI Career Assistant
        </h1>
        <p className="relative z-10 text-sm opacity-80 mt-1">Your personal guide to career success</p>
      </section>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      {messages.length <= 1 && (
        <div className="flex gap-2 mb-4 shrink-0">
          {quickActions.map((qa) => (
            <Button
              key={qa.label}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
              onClick={() => handleQuickAction(qa.label)}
            >
              <qa.icon className="h-3.5 w-3.5" />
              {qa.label}
            </Button>
          ))}
        </div>
      )}

      {/* ── Messages ──────────────────────────────────────────── */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardContent className="p-4 flex-1 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
                  msg.role === 'ai' ? 'bg-w-purple/10 text-w-purple' : 'bg-muted text-muted-foreground'
                }`}
              >
                {msg.role === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'ai'
                    ? 'bg-muted text-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          ))}
        </CardContent>

        {/* ── Input ─────────────────────────────────────────── */}
        <div className="p-4 border-t border-border">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <Input
              type="text"
              placeholder="Ask me anything about your career..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
