import { TrendingUp, Users, BookOpen, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function FacultyAnalytics() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Analytics</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Your teaching performance insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { label: 'Avg Coverage', value: '46%', change: '+5%', icon: TrendingUp, color: '#10B981' },
          { label: 'Student Attendance', value: '96%', change: '+2%', icon: Users, color: '#3B82F6' },
          { label: 'Lectures Delivered', value: '58', change: '+12', icon: BookOpen, color: '#8B5CF6' },
          { label: 'Avg Quiz Score', value: '78%', change: '+3%', icon: Award, color: '#F59E0B' },
        ].map((metric, index) => (
          <Card key={index} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="h-4 w-4" style={{ color: metric.color }} />
                <span className="text-[10px] font-medium text-green-600">{metric.change}</span>
              </div>
              <p className="text-xl font-bold font-[family-name:var(--font-heading)]" style={{ color: metric.color }}>
                {metric.value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-3">Lecture Coverage Trend</h3>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Chart visualization</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-3">Student Performance</h3>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Chart visualization</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-3">Attendance Trend</h3>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Chart visualization</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-3">Quiz Performance</h3>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Chart visualization</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
