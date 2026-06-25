import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePlan } from '@/contexts/PlanContext';
import SkillsTimeline from '@/components/plan/SkillsTimeline';

export default function RevisionCourse() {
  const nav = useNavigate();
  const { } = usePlan(); // keep context alive for SkillsTimeline

  return (
    <div className="p-6 lg:p-8 space-y-6 min-w-0">
      <button onClick={() => nav('/home/90-day-plan')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        <ArrowLeft className="h-4 w-4" /> Back to Slog Overs
      </button>
      <SkillsTimeline />
    </div>
  );
}
