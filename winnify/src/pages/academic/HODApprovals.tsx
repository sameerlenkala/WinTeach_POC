import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const approvals = [
  { id: 1, type: 'Course Plan', course: 'Operating Systems', faculty: 'Dr. Amit Singh', time: '2 hours ago', priority: 'high' },
  { id: 2, type: 'Timeline Revision', course: 'Database Management Systems', faculty: 'Dr. Sneha Patel', time: '1 day ago', priority: 'medium' },
  { id: 3, type: 'Resource Upload', course: 'Data Structures', faculty: 'Dr. Amit Singh', time: '2 days ago', priority: 'low' },
  { id: 4, type: 'Quiz Creation', course: 'Computer Networks', faculty: 'Dr. Priya Sharma', time: '3 days ago', priority: 'medium' },
];

export default function HODApprovals() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Pending Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and approve faculty requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: 4, icon: Clock, color: '#F59E0B', bg: '#F59E0B12' },
          { label: 'High Priority', value: 1, icon: AlertTriangle, color: '#EF4444', bg: '#EF444412' },
          { label: 'Approved Today', value: 3, icon: CheckCircle, color: '#10B981', bg: '#10B98112' },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                style={{ backgroundColor: stat.bg, color: stat.color }}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approvals List */}
      <div className="space-y-3">
        {approvals.map((approval) => (
          <Card 
            key={approval.id} 
            className="overflow-hidden" 
            style={{ borderLeft: `3px solid ${approval.priority === 'high' ? '#EF4444' : approval.priority === 'medium' ? '#F59E0B' : '#10B981'}` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={approval.priority === 'high' ? 'destructive' : approval.priority === 'medium' ? 'warning' : 'secondary'}>
                      {approval.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{approval.time}</span>
                  </div>
                  <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-1">{approval.course}</h3>
                  <p className="text-sm text-muted-foreground">Submitted by: {approval.faculty}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1">Approve</Button>
                <Button size="sm" variant="destructive" className="flex-1">Reject</Button>
                <Button size="sm" variant="outline">Review Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
