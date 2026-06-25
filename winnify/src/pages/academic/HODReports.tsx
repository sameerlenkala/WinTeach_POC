import { FileText, Download, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const reports = [
  { id: 1, title: 'Monthly Coverage Report', date: 'April 2026', type: 'Coverage', status: 'Ready' },
  { id: 2, title: 'Faculty Performance Report', date: 'Q1 2026', type: 'Performance', status: 'Ready' },
  { id: 3, title: 'Student Attendance Report', date: 'April 2026', type: 'Attendance', status: 'Ready' },
  { id: 4, title: 'Course Completion Report', date: 'Semester 1', type: 'Completion', status: 'Generating' },
  { id: 5, title: 'Department Analytics', date: 'April 2026', type: 'Analytics', status: 'Ready' },
];

export default function HODReports() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and download reports</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {reports.map((report) => (
          <Card key={report.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-1">{report.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {report.date}
                      </span>
                      <Badge variant="outline" className="text-xs">{report.type}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={report.status === 'Ready' ? 'success' : 'secondary'}>
                    {report.status}
                  </Badge>
                  {report.status === 'Ready' && (
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
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
