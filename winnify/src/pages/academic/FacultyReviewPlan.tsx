import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Edit3, Send, Calendar, Clock, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function FacultyReviewPlan() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  const [feedback, setFeedback] = useState('');
  const [canEdit] = useState(true); // From HOD settings

  // Mock plan data
  const plan = {
    courseCode: 'CS101',
    courseName: 'Data Structures and Algorithms',
    totalLectures: 45,
    totalHours: 90,
    startDate: '2024-08-05',
    endDate: '2024-12-20',
    hodName: 'Dr. Rajesh Kumar',
    sentDate: '2024-07-28',
    topics: [
      { name: 'Introduction to Data Structures', lectures: 3, hours: 6, status: 'planned' },
      { name: 'Arrays and Linked Lists', lectures: 6, hours: 12, status: 'planned' },
      { name: 'Stacks and Queues', lectures: 5, hours: 10, status: 'planned' },
      { name: 'Trees', lectures: 8, hours: 16, status: 'planned' },
      { name: 'Graphs', lectures: 7, hours: 14, status: 'planned' },
      { name: 'Hashing', lectures: 4, hours: 8, status: 'planned' },
      { name: 'Sorting Algorithms', lectures: 6, hours: 12, status: 'planned' },
      { name: 'Searching Algorithms', lectures: 4, hours: 8, status: 'planned' },
      { name: 'Advanced Topics', lectures: 2, hours: 4, status: 'planned' },
    ],
  };

  const handleApprove = () => {
    alert('Plan approved! You can now start teaching.');
    navigate('/academic/faculty');
  };

  const handleRequestChanges = () => {
    if (!feedback.trim()) {
      alert('Please provide feedback for requested changes');
      return;
    }
    alert('Feedback sent to HOD for review');
    navigate('/academic/faculty');
  };

  const handleEditPlan = () => {
    navigate(`/academic/faculty/course/${courseId}/timeline`, {
      state: { mode: 'edit', canEdit: true, plan }
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
              Review Course Plan
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review and approve the plan created by HOD
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          Pending Review
        </Badge>
      </div>

      {/* Course Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-2">
                {plan.courseCode} - {plan.courseName}
              </h2>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{plan.totalLectures} Lectures</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{plan.totalHours} Hours</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Sent by</p>
              <p className="font-semibold">{plan.hodName}</p>
              <p className="text-xs text-muted-foreground">{new Date(plan.sentDate).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Lectures</p>
                <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                  {plan.totalLectures}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                  {plan.totalHours}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Topics</p>
                <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                  {plan.topics.length}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Hours/Topic</p>
                <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                  {(plan.totalHours / plan.topics.length).toFixed(1)}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic Distribution */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
            Topic Distribution
          </h3>
          <div className="space-y-3">
            {plan.topics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex-1">
                  <p className="font-medium">{topic.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {topic.lectures} lectures • {topic.hours} hours
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{topic.lectures}L</Badge>
                  <Badge variant="outline">{topic.hours}H</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Permission Notice */}
      {canEdit && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Edit3 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Edit Permission Granted</p>
                <p className="text-sm text-green-700">
                  HOD has allowed you to edit this plan. You can modify lecture hours, dates, and topics before approval.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
            Feedback & Comments
          </h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Add your feedback or suggestions for the HOD..."
            className="w-full min-h-[120px] px-4 py-3 border border-border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Optional: Provide feedback if you want to request changes
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        {canEdit && (
          <Button variant="outline" className="flex-1" onClick={handleEditPlan}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Plan in Kanban
          </Button>
        )}
        <Button variant="outline" className="flex-1" onClick={handleRequestChanges}>
          <Send className="h-4 w-4 mr-2" />
          Request Changes
        </Button>
        <Button className="flex-1" onClick={handleApprove}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve & Start Teaching
        </Button>
      </div>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Once you approve this plan, you can start creating lectures and resources. 
            You can still make minor adjustments later through the Kanban board if needed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
