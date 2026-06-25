import { MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const doubts = [
  { id: 1, student: 'Rahul Sharma', question: 'Can you explain the difference between stack and queue?', course: 'Data Structures', time: '2 hours ago', status: 'Pending' },
  { id: 2, student: 'Priya Patel', question: 'What is the time complexity of binary search?', course: 'Data Structures', time: '5 hours ago', status: 'Pending' },
  { id: 3, student: 'Amit Kumar', question: 'How does process scheduling work in OS?', course: 'Operating Systems', time: '1 day ago', status: 'Resolved' },
  { id: 4, student: 'Sneha Reddy', question: 'Can you provide more examples of linked list operations?', course: 'Data Structures', time: '2 days ago', status: 'Resolved' },
];

export default function FacultyDoubts() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Student Doubts</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Answer student questions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Pending', value: 2, icon: Clock, color: '#F59E0B', bg: '#F59E0B12' },
          { label: 'Resolved Today', value: 5, icon: CheckCircle, color: '#10B981', bg: '#10B98112' },
          { label: 'Total Questions', value: 24, icon: MessageSquare, color: '#3B82F6', bg: '#3B82F612' },
        ].map((stat, index) => (
          <Card key={index} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                style={{ backgroundColor: stat.bg, color: stat.color }}
              >
                <stat.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Doubts List */}
      <div className="space-y-3">
        {doubts.map((doubt) => (
          <Card 
            key={doubt.id} 
            className="overflow-hidden hover:shadow-sm transition-shadow" 
            style={{ borderLeft: `3px solid ${doubt.status === 'Pending' ? '#F59E0B' : '#10B981'}` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">{doubt.student}</h3>
                    <Badge variant={doubt.status === 'Pending' ? 'warning' : 'success'} className="text-[10px]">
                      {doubt.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground mb-2">{doubt.question}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{doubt.course}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {doubt.time}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  {doubt.status === 'Pending' ? (
                    <Button size="sm">Reply</Button>
                  ) : (
                    <Button size="sm" variant="outline">View Thread</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
