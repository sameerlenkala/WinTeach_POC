import { TrendingUp, Users, Calendar, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function HODAnalytics() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Department performance insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Coverage', value: '46%', change: '+5%', trend: 'up', icon: TrendingUp, color: '#10B981' },
          { label: 'Faculty Utilization', value: '87%', change: '+2%', trend: 'up', icon: Users, color: '#3B82F6' },
          { label: 'Student Attendance', value: '82%', change: '-3%', trend: 'down', icon: Calendar, color: '#F59E0B' },
          { label: 'Course Completion', value: '68%', change: '+8%', trend: 'up', icon: Award, color: '#8B5CF6' },
        ].map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="h-5 w-5" style={{ color: metric.color }} />
                <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: metric.color }}>
                {metric.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-4">Course Coverage Trend</h3>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Chart visualization</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-4">Faculty Performance</h3>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Chart visualization</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-4">Student Attendance</h3>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Chart visualization</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-4">Department Overview</h3>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Chart visualization</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
