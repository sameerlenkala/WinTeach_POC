import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ClipboardList, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

const rules = [
  'You cannot go back to a previous question once you move forward.',
  'Only one answer can be selected per question.',
  'The timer starts immediately when you begin the test.',
  'There is no negative marking for incorrect answers.',
  'Your results will be shown immediately after submission.',
];

interface BriefingState {
  company?: string;
  topic?: string;
  difficulty?: string;
}

export default function TestBriefing() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as BriefingState) || {};

  const topic = state.topic || 'Quantitative Aptitude';
  const difficulty = state.difficulty || 'Medium';
  const company = state.company;
  const fromDrive = !!company;

  const config = { topic, difficulty, questions: 20, time: '30 min' };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(fromDrive ? '/home/drives' : '/home/mocktest/config')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> {fromDrive ? `Back to Drives` : 'Back to Configuration'}
      </button>

      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-w-purple/10 mb-3">
            <ClipboardList className="h-7 w-7 text-w-purple" />
          </div>
          <CardTitle className="text-xl">{company ? `${company} — OA Mock` : 'Mock Assessment'}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Review the details before you begin</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted p-3">
              <span className="text-xs text-muted-foreground">Topic</span>
              <span className="text-sm font-bold font-[family-name:var(--font-heading)] text-center">{config.topic}</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted p-3">
              <span className="text-xs text-muted-foreground">Difficulty</span>
              <Badge variant="warning">{config.difficulty}</Badge>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted p-3">
              <span className="text-xs text-muted-foreground">Questions</span>
              <span className="text-sm font-bold font-[family-name:var(--font-heading)]">{config.questions}</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted p-3">
              <span className="text-xs text-muted-foreground">Time Limit</span>
              <span className="text-sm font-bold font-[family-name:var(--font-heading)] flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {config.time}
              </span>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-w-orange" />
              <h3 className="text-sm font-bold font-[family-name:var(--font-heading)]">Instructions</h3>
            </div>
            <ol className="space-y-2.5">
              {rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-w-purple/10 text-w-purple text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {rule}
                </li>
              ))}
            </ol>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full" onClick={() => navigate('/home/mocktest/test')}>
              <CheckCircle2 className="h-4 w-4" /> I&apos;m Ready — Start Test
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Old static config removed — now dynamic from location state ── */
