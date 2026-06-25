import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const events = [
  { id: 1, title: 'Faculty Meeting', time: '10:00 AM', date: 'May 7, 2026', type: 'meeting', color: '#3B82F6' },
  { id: 2, title: 'Course Review - DSA', time: '2:00 PM', date: 'May 7, 2026', type: 'review', color: '#8B5CF6' },
  { id: 3, title: 'Department Seminar', time: '11:00 AM', date: 'May 8, 2026', type: 'seminar', color: '#10B981' },
  { id: 4, title: 'Exam Schedule Planning', time: '3:00 PM', date: 'May 9, 2026', type: 'planning', color: '#F59E0B' },
];

export default function HODCalendar() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">Department schedule and events</p>
      </div>

      {/* Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Placeholder */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="h-96 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center">
                <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Calendar view</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold font-[family-name:var(--font-heading)]">Upcoming Events</h3>
          <div className="space-y-3">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden" style={{ borderLeft: `3px solid ${event.color}` }}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div 
                      className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                      style={{ backgroundColor: `${event.color}12`, color: event.color }}
                    >
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-1">{event.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{event.date}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{event.time}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{event.type}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
