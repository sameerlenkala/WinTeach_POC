import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Wand2, Edit3, ArrowLeft, ArrowRight, Calendar, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PlanGenerationOptions() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const courseData = location.state?.courseData;
  const isNewlyCreated = location.state?.isNewlyCreated;
  const successMessage = location.state?.successMessage;

  const handleAutoGenerate = () => {
    navigate(`/academic/hod/course/${courseId}/generate-plan`, {
      state: { method: 'auto', courseData }
    });
  };

  const handleManualCreate = () => {
    navigate(`/academic/hod/course/${courseId}/timeline`, {
      state: { method: 'manual', courseData }
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/academic/hod/courses')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        <div className="flex-1">
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">
            Generate Course Plan
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose how you want to create the lecture schedule
          </p>
        </div>
      </div>

      {/* Success Message */}
      {isNewlyCreated && successMessage && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-white shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold font-[family-name:var(--font-heading)] text-green-900 mb-1">
                  Course Created Successfully!
                </h3>
                <p className="text-xs text-green-700">{successMessage}</p>
                {courseData?.curriculumInfo && (
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-[9px]">
                      {courseData.curriculumInfo.regulation}
                    </Badge>
                    <Badge variant="secondary" className="text-[9px]">
                      {courseData.curriculumInfo.department}
                    </Badge>
                    <Badge variant="secondary" className="text-[9px]">
                      Semester {courseData.curriculumInfo.semester}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Info Summary */}
      {courseData && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Course</p>
                <p className="text-sm font-semibold">{courseData.code} - {courseData.name}</p>
                {courseData.curriculumInfo && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Part of {courseData.curriculumInfo.totalCourses} courses from curriculum upload
                  </p>
                )}
              </div>
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Credits: </span>
                  <span className="font-medium">{courseData.credits}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type: </span>
                  <span className="font-medium">{courseData.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Section: </span>
                  <span className="font-medium">{courseData.section}</span>
                </div>
                {courseData.lectures && (
                  <div>
                    <span className="text-muted-foreground">Lectures: </span>
                    <span className="font-medium">{courseData.lectures}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auto Generate */}
        <Card className="cursor-pointer hover:shadow-sm transition-all">
          <CardContent className="p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-4">
              <Wand2 className="h-5 w-5" />
            </div>

            <h3 className="text-sm font-bold font-[family-name:var(--font-heading)] mb-2">
              Auto-Generate Plan
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Let AI create an optimized lecture schedule based on your course structure and academic calendar
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-50 text-green-600 mt-0.5 shrink-0">
                  <ArrowRight className="h-2.5 w-2.5" />
                </div>
                <div>
                  <p className="text-xs font-medium">Smart Distribution</p>
                  <p className="text-[10px] text-muted-foreground">Topics distributed based on complexity</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-50 text-green-600 mt-0.5 shrink-0">
                  <ArrowRight className="h-2.5 w-2.5" />
                </div>
                <div>
                  <p className="text-xs font-medium">Calendar Integration</p>
                  <p className="text-[10px] text-muted-foreground">Avoids holidays and conflicts</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-50 text-green-600 mt-0.5 shrink-0">
                  <ArrowRight className="h-2.5 w-2.5" />
                </div>
                <div>
                  <p className="text-xs font-medium">Prerequisite Aware</p>
                  <p className="text-[10px] text-muted-foreground">Maintains topic dependencies</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="text-[10px]">
                <Calendar className="h-3 w-3 mr-1" />
                ~5 minutes
              </Badge>
              <Badge variant="outline" className="text-[10px]">Recommended</Badge>
            </div>

            <Button className="w-full" size="sm" onClick={handleAutoGenerate}>
              Generate Automatically
              <Wand2 className="ml-2 h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>

        {/* Manual Create */}
        <Card className="cursor-pointer hover:shadow-sm transition-all">
          <CardContent className="p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-purple-600 mb-4">
              <Edit3 className="h-5 w-5" />
            </div>

            <h3 className="text-sm font-bold font-[family-name:var(--font-heading)] mb-2">
              Create Manually
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Build your lecture schedule from scratch using our intuitive Kanban board interface
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-50 text-purple-600 mt-0.5 shrink-0">
                  <ArrowRight className="h-2.5 w-2.5" />
                </div>
                <div>
                  <p className="text-xs font-medium">Full Control</p>
                  <p className="text-[10px] text-muted-foreground">Customize every lecture detail</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-50 text-purple-600 mt-0.5 shrink-0">
                  <ArrowRight className="h-2.5 w-2.5" />
                </div>
                <div>
                  <p className="text-xs font-medium">Drag & Drop</p>
                  <p className="text-[10px] text-muted-foreground">Easy reorganization</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-50 text-purple-600 mt-0.5 shrink-0">
                  <ArrowRight className="h-2.5 w-2.5" />
                </div>
                <div>
                  <p className="text-xs font-medium">Flexible Scheduling</p>
                  <p className="text-[10px] text-muted-foreground">Adjust dates and topics freely</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="text-[10px]">
                <BookOpen className="h-3 w-3 mr-1" />
                ~15-20 minutes
              </Badge>
              <Badge variant="outline" className="text-[10px]">Advanced</Badge>
            </div>

            <Button className="w-full" size="sm" variant="outline" onClick={handleManualCreate}>
              Create Manually
              <Edit3 className="ml-2 h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-xs text-blue-900">
            <strong>Note:</strong> You can always edit the generated plan later using the Kanban board. 
            The auto-generated plan serves as a starting point that you can customize to your needs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
