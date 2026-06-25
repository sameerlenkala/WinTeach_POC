import { Building2, Users, BookOpen, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HODDepartment() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Department</h1>
        <p className="text-sm text-muted-foreground mt-1">Department information and settings</p>
      </div>

      {/* Department Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-1">Computer Science and Engineering</h2>
              <p className="text-sm text-muted-foreground mb-4">Department of CSE • Established 2010</p>
              <Button size="sm" variant="outline">Edit Details</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Head of Department</p>
              <p className="font-semibold">Dr. Rajesh Kumar</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-semibold">hod.cse@university.edu</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Phone</p>
              <p className="font-semibold">+91 98765 43210</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Faculty', value: '3', icon: Users, color: '#3B82F6', bg: '#3B82F612' },
          { label: 'Active Courses', value: '2', icon: BookOpen, color: '#10B981', bg: '#10B98112' },
          { label: 'Total Students', value: '120', icon: Award, color: '#8B5CF6', bg: '#8B5CF612' },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg shrink-0"
                  style={{ backgroundColor: stat.bg, color: stat.color }}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold font-[family-name:var(--font-heading)]">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-3">Vision</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To be a center of excellence in computer science education and research, producing skilled professionals who contribute to technological advancement and societal development.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-3">Mission</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To provide quality education, foster innovation, and develop industry-ready graduates through comprehensive curriculum, research opportunities, and industry collaboration.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
