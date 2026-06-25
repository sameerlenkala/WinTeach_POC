import { Users, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const attendanceRecords = [
  { id: 1, lecture: 'Lecture 5 - Trees', course: 'Data Structures', date: 'May 5, 2026', present: 58, absent: 2, total: 60, status: 'Marked' },
  { id: 2, lecture: 'Lecture 4 - Stacks & Queues', course: 'Data Structures', date: 'May 3, 2026', present: 57, absent: 3, total: 60, status: 'Marked' },
  { id: 3, lecture: 'Lecture 2 - Process Management', course: 'Operating Systems', date: 'May 4, 2026', present: 0, absent: 0, total: 60, status: 'Pending' },
  { id: 4, lecture: 'Lecture 1 - OS Introduction', course: 'Operating Systems', date: 'May 1, 2026', present: 0, absent: 0, total: 60, status: 'Pending' },
];

export default function FacultyAttendance() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Attendance</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Track student attendance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Pending', value: 2, icon: Calendar, color: '#F59E0B', bg: '#F59E0B12' },
          { label: 'Avg Attendance', value: '96%', icon: CheckCircle, color: '#10B981', bg: '#10B98112' },
          { label: 'Total Students', value: 120, icon: Users, color: '#3B82F6', bg: '#3B82F612' },
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

      {/* Attendance Records */}
      <div className="space-y-3">
        {attendanceRecords.map((record) => (
          <Card 
            key={record.id} 
            className="overflow-hidden hover:shadow-sm transition-shadow" 
            style={{ borderLeft: `3px solid ${record.status === 'Pending' ? '#F59E0B' : '#10B981'}` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">{record.lecture}</h3>
                    <Badge variant={record.status === 'Marked' ? 'success' : 'warning'} className="text-[10px]">
                      {record.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span>{record.course}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {record.date}
                    </span>
                  </div>
                  {record.status === 'Marked' && (
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Present: {record.present}
                      </span>
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle className="h-3.5 w-3.5" />
                        Absent: {record.absent}
                      </span>
                      <span className="text-muted-foreground">
                        Total: {record.total}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  {record.status === 'Pending' ? (
                    <Button size="sm">Mark Attendance</Button>
                  ) : (
                    <Button size="sm" variant="outline">View Details</Button>
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
