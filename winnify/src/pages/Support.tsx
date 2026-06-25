import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, HelpCircle, Search, ChevronDown, ChevronUp,
  Mail, MessageCircle, BookOpen, Users, Bug,
  Send, CheckCircle, Loader2,
} from 'lucide-react';

/* ── Data ─────────────────────────────────────────────────────── */
interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: 1,
    question: 'How do I use the Slog Overs plan?',
    answer: 'The Slog Overs plan is your personalized roadmap to placement success. Navigate to Journey → Slog Overs to see your weekly tasks, milestones, and progress. Each week focuses on specific skills — complete the tasks to stay on track. You can also customize the plan based on your target companies.',
  },
  {
    id: 2,
    question: 'How does the scoring system work?',
    answer: 'Your Winnify Score (0-100) is calculated from multiple dimensions: Mock Test performance (30%), WinSpeak scores (25%), Course completion (20%), Consistency/streaks (15%), and Community participation (10%). Each dimension is updated in real-time as you complete activities.',
  },
  {
    id: 3,
    question: 'How should I prepare for placement drives?',
    answer: 'Start by checking the Drives page for upcoming opportunities. Use Mock Tests to practice aptitude and technical skills. Complete WinSpeak challenges to improve communication. Review company-specific OA patterns in the Company OA section. Aim to complete your Slog Overs milestones before your target drive dates.',
  },
  {
    id: 4,
    question: 'What are WinSpeak tips for better scores?',
    answer: 'Practice daily with short 1-2 minute sessions. Focus on one dimension at a time (e.g., fluency one week, structure the next). Use the AI Coach recommendations after each session. Record yourself and listen back to identify patterns. Participate in weekly challenges to benchmark against peers.',
  },
  {
    id: 5,
    question: 'How do I update my account settings?',
    answer: 'Go to Profile from the bottom navigation. You can update your personal information, change your target career goal, manage notification preferences, and view your badges and certifications. For password changes or account deletion, contact support directly.',
  },
  {
    id: 6,
    question: 'How do I reset my password?',
    answer: "Go to the Sign In page and click 'Forgot password?'. Enter your registered email and we'll send a reset link. The link expires in 24 hours.",
  },
  {
    id: 7,
    question: 'Can I change my track after generating a plan?',
    answer: "Yes! Click 'Reconfigure Plan' at the top of your Slog Overs page. You can change your track and domain anytime. Your progress on completed tasks will be preserved.",
  },
  {
    id: 8,
    question: 'How is the ATS resume score calculated?',
    answer: 'The ATS score evaluates 6 dimensions: Format & Structure, Keyword Optimization, Content Quality, Readability, Contact Information, and Skills Match. Each dimension is scored 0-100 and weighted equally.',
  },
];

const quickLinks = [
  { icon: BookOpen, label: 'Documentation', href: '#' },
  { icon: Users, label: 'Community', href: '#' },
  { icon: Bug, label: 'Report a Bug', href: '#' },
];

/* ── Chat Message Type ────────────────────────────────────────── */
interface ChatMessage {
  id: number;
  sender: 'bot' | 'user';
  text: string;
}

const botResponses: Record<string, string> = {
  'Slog Overs Help': "Great question! Your Slog Overs plan is fully customizable. Head to Journey → Slog Overs to view your weekly tasks. You can reconfigure your track anytime. Need anything else?",
  'Technical Issue': "I'm sorry you're experiencing issues! Could you describe what's happening? In the meantime, try clearing your browser cache and refreshing. If the problem persists, our engineering team will look into it.",
  'Account Question': "For account-related queries, you can update most settings from the Settings page. For password resets, use the 'Forgot password?' link on the Sign In page. What specifically do you need help with?",
};

const defaultBotReply = "Thanks for reaching out! A support agent will review your message shortly. In the meantime, check our FAQ section above.";

/* ── Contact Form ─────────────────────────────────────────────── */
function ContactForm() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setSubject('');
      setCategory('General');
      setMessage('');
    }, 1000);
  };

  if (sent) {
    return (
      <Card className="border-l-4 border-l-w-green">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-w-green shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold font-[family-name:var(--font-heading)]">Message sent!</p>
              <p className="text-xs text-muted-foreground mt-1">
                We'll get back to you within 24 hours. Ticket <span className="font-semibold text-foreground">#WNF-2847</span>
              </p>
              <Button size="sm" variant="ghost" className="mt-2 text-xs" onClick={() => setSent(false)}>
                Send another message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Subject</label>
            <Input
              placeholder="Brief description of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary transition-colors"
            >
              <option>General</option>
              <option>Technical Issue</option>
              <option>Billing</option>
              <option>Feature Request</option>
              <option>Bug Report</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Message</label>
            <textarea
              rows={4}
              placeholder="Describe your issue in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary transition-colors resize-none"
            />
          </div>
          <Button type="submit" loading={sending}>
            {sending ? 'Sending...' : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/* ── Live Chat ────────────────────────────────────────────────── */
function LiveChat() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'bot', text: "Hi! I'm Winni, your support assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  const addBotReply = useCallback((text: string) => {
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextId.current++, sender: 'bot', text }]);
      setTyping(false);
    }, 800);
  }, []);

  const handleQuickReply = (label: string) => {
    setMessages((prev) => [...prev, { id: nextId.current++, sender: 'user', text: label }]);
    addBotReply(botResponses[label] ?? defaultBotReply);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { id: nextId.current++, sender: 'user', text }]);
    addBotReply(defaultBotReply);
  };

  if (!chatOpen) {
    return (
      <Card>
        <CardContent className="p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-w-blue/10">
            <MessageCircle className="h-6 w-6 text-w-blue" />
          </div>
          <div>
            <p className="text-sm font-bold font-[family-name:var(--font-heading)]">Chat Support</p>
            <p className="text-xs text-muted-foreground mb-1">Talk to our support assistant</p>
            <Button size="sm" variant="outline" onClick={() => setChatOpen(true)}>Start Chat</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const quickReplies = ['Slog Overs Help', 'Technical Issue', 'Account Question'];
  const showQuickReplies = messages.length === 1;

  return (
    <Card className="overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-bold font-[family-name:var(--font-heading)]">Winnify Support</span>
          <span className="flex items-center gap-1 text-[10px] font-medium bg-white/20 rounded-full px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-w-green" />
            Online
          </span>
        </div>
        <button onClick={() => setChatOpen(false)} className="text-xs font-medium hover:underline cursor-pointer">
          Close
        </button>
      </div>

      {/* Messages */}
      <div className="h-72 overflow-y-auto p-4 space-y-3 bg-muted/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-card border border-border rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-xl rounded-bl-sm px-3.5 py-2.5 text-sm text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Winni is typing...
            </div>
          </div>
        )}

        {showQuickReplies && (
          <div className="flex flex-wrap gap-2 pt-1">
            {quickReplies.map((label) => (
              <button
                key={label}
                onClick={() => handleQuickReply(label)}
                className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-border">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}

/* ── Main Support Page ────────────────────────────────────────── */
export default function Support() {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaqs = search.trim()
    ? faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(search.toLowerCase()) ||
          f.answer.toLowerCase().includes(search.toLowerCase())
      )
    : faqs;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ── Back Link ─────────────────────────────────────────── */}
      <Link to="/home" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-primary" />
        <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Help &amp; Support</h1>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Find answers and get help</p>

      {/* ── Search ────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for help..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* ── FAQ Accordion ─────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4">Frequently Asked Questions</h2>
        <Card>
          <CardContent className="p-0">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No results found. Try a different search term.</p>
              </div>
            ) : (
              filteredFaqs.map((faq, i) => (
                <div key={faq.id}>
                  {i > 0 && <Separator />}
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  >
                    <span className="text-sm font-semibold pr-4">{faq.question}</span>
                    {openFaq === faq.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  {openFaq === faq.id && (
                    <div className="px-5 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Contact Form ──────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4">Send us a Message</h2>
        <ContactForm />
      </section>

      {/* ── Contact ───────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4">Contact Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-w-purple/10">
                <Mail className="h-6 w-6 text-w-purple" />
              </div>
              <div>
                <p className="text-sm font-bold font-[family-name:var(--font-heading)]">Email Support</p>
                <p className="text-xs text-muted-foreground">support@winnify.app</p>
              </div>
            </CardContent>
          </Card>
          <LiveChat />
        </div>
      </section>

      {/* ── Quick Links ───────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4">Quick Links</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickLinks.map((link) => (
            <Card key={link.label} className="cursor-pointer hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                <link.icon className="h-6 w-6 text-w-purple" />
                <span className="text-xs font-bold font-[family-name:var(--font-heading)]">{link.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
