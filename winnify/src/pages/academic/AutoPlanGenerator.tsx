import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, Calendar, BookOpen, Clock, Send, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AutoPlanGenerator() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const courseData = location.state?.courseData;

  const [generating, setGenerating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const steps = [
    { id: 1, label: 'Analyzing course structure', duration: 1200 },
    { id: 2, label: `Loading ${courseData?.topics?.length || 5} topics from curriculum`, duration: 1500 },
    { id: 3, label: `Distributing ${courseData?.lectures || 45} lectures`, duration: 1800 },
    { id: 4, label: 'Checking academic calendar', duration: 1000 },
    { id: 5, label: 'Mapping course outcomes to topics', duration: 1400 },
    { id: 6, label: 'Finalizing plan', duration: 1000 },
  ];

  useEffect(() => {
    let currentProgress = 0;
    let stepIndex = 0;

    const generatePlan = () => {
      if (stepIndex < steps.length) {
        setCurrentStep(steps[stepIndex].label);
        setCurrentStepIndex(stepIndex);
        
        const stepProgress = 100 / steps.length;
        const interval = setInterval(() => {
          currentProgress += 2;
          setProgress(Math.min(currentProgress, (stepIndex + 1) * stepProgress));
        }, steps[stepIndex].duration / 50);

        setTimeout(() => {
          clearInterval(interval);
          stepIndex++;
          if (stepIndex < steps.length) {
            generatePlan();
          } else {
            // Generation complete
            setProgress(100);
            setCurrentStep('Plan generated successfully!');
            
            // Generate realistic plan using actual course data
            const totalLectures = courseData?.lectures || 45;
            const topics = courseData?.topics || [];
            
            let generatedTopics;
            if (topics.length > 0) {
              // Distribute lectures across actual topics
              const basePerTopic = Math.floor(totalLectures / topics.length);
              const remainder = totalLectures % topics.length;
              
              generatedTopics = topics.map((topic: any, idx: number) => {
                const lectures = basePerTopic + (idx < remainder ? 1 : 0);
                return {
                  name: topic.name,
                  lectures: lectures,
                  hours: lectures * 2,
                  subtopics: topic.subtopics || []
                };
              });
            } else {
              // Fallback to mock data
              generatedTopics = [
                { name: 'Introduction', lectures: 3, hours: 6, subtopics: [] },
                { name: 'Core Concepts', lectures: 8, hours: 16, subtopics: [] },
                { name: 'Advanced Topics', lectures: 6, hours: 12, subtopics: [] },
              ];
            }
            
            const plan = {
              totalLectures: totalLectures,
              totalHours: totalLectures * 2,
              topics: generatedTopics,
              startDate: '2024-08-05',
              endDate: '2024-12-20',
              holidays: 8,
              workingDays: Math.ceil(totalLectures * 1.5), // Assuming some buffer
              courseOutcomes: courseData?.outcomes || [],
            };
            
            setGeneratedPlan(plan);
            setTimeout(() => setGenerating(false), 500);
          }
        }, steps[stepIndex].duration);
      }
    };

    generatePlan();
  }, []);

  const handleSendToFaculty = () => {
    alert('Plan sent to faculty for review!');
    navigate(`/academic/hod/course/${courseId}/timeline`);
  };

  const handleEditPlan = () => {
    navigate(`/academic/hod/course/${courseId}/timeline`, {
      state: { 
        generatedPlan,
        courseData,
        fromAutoGenerate: true
      }
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">
            Auto-Generate Course Plan
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            AI is creating an optimized lecture schedule
          </p>
        </div>
      </div>

      {/* Course Info Summary */}
      {courseData && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Course</p>
                <p className="text-sm font-semibold">{courseData.code} - {courseData.name}</p>
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
                  <span className="text-muted-foreground">Lectures: </span>
                  <span className="font-medium">{courseData.lectures || 45}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {generating ? (
        /* Generating State */
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-base font-bold font-[family-name:var(--font-heading)] mb-2">
                  Generating Your Course Plan
                </h2>
                <p className="text-xs text-muted-foreground">{currentStep}</p>
              </div>

              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg border text-xs ${
                      index < currentStepIndex
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : index === currentStepIndex
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-muted border-border text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {index < currentStepIndex ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : index === currentStepIndex ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border-2" />
                      )}
                      <span className="text-[10px] font-medium">{step.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Generated State */
        <div className="space-y-6">
          {/* Success Header */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-white shrink-0">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-bold font-[family-name:var(--font-heading)] text-green-900">
                    Plan Generated Successfully!
                  </h2>
                  <p className="text-xs text-green-700">Your course plan is ready for review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Summary */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-4">
                Plan Summary
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-[10px] text-blue-600 font-medium uppercase tracking-wide">Total Lectures</span>
                  </div>
                  <p className="text-xl font-bold text-blue-900">{generatedPlan?.totalLectures}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-3.5 w-3.5 text-purple-600" />
                    <span className="text-[10px] text-purple-600 font-medium uppercase tracking-wide">Total Hours</span>
                  </div>
                  <p className="text-xl font-bold text-purple-900">{generatedPlan?.totalHours}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-[10px] text-green-600 font-medium uppercase tracking-wide">Working Days</span>
                  </div>
                  <p className="text-xl font-bold text-green-900">{generatedPlan?.workingDays}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-3.5 w-3.5 text-orange-600" />
                    <span className="text-[10px] text-orange-600 font-medium uppercase tracking-wide">Holidays</span>
                  </div>
                  <p className="text-xl font-bold text-orange-900">{generatedPlan?.holidays}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold mb-3">Topic Distribution</h4>
                {generatedPlan?.topics.map((topic: any, index: number) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-xs font-medium">{topic.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {topic.lectures} lectures • {topic.hours} hours
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{topic.lectures}L</Badge>
                    </div>
                    {topic.subtopics && topic.subtopics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {topic.subtopics.map((subtopic: string, subIdx: number) => (
                          <Badge key={subIdx} variant="outline" className="text-[9px]">
                            {subtopic}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Course Outcomes */}
              {generatedPlan?.courseOutcomes && generatedPlan.courseOutcomes.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-xs font-semibold mb-3">Course Outcomes Covered</h4>
                  <div className="space-y-2">
                    {generatedPlan.courseOutcomes.map((outcome: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-blue-50 rounded text-xs">
                        <Badge variant="secondary" className="text-[9px] shrink-0">{outcome.code}</Badge>
                        <p className="flex-1 text-[10px]">{outcome.description}</p>
                        <Badge variant="outline" className="text-[9px] shrink-0">{outcome.bloomLevel}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-4">
            {/* Faculty Edit Permission */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold mb-1">Faculty Edit Permission</h4>
                    <p className="text-[10px] text-muted-foreground">
                      Allow faculty to edit this plan before finalizing
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="sr-only peer"
                      id="faculty-edit-toggle"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleEditPlan}>
                Edit Plan in Kanban
              </Button>
              <Button size="sm" className="flex-1" onClick={handleSendToFaculty}>
                <Send className="h-3.5 w-3.5 mr-2" />
                Send to Faculty for Review
              </Button>
            </div>
          </div>

          {/* Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="space-y-2">
                <p className="text-xs text-blue-900 font-semibold">
                  📋 Next Steps
                </p>
                <ul className="text-xs text-blue-800 space-y-1 ml-4">
                  <li>• Review the generated lecture distribution across {generatedPlan?.topics.length} topics</li>
                  <li>• Edit the plan in Kanban view to adjust dates and sequence</li>
                  <li>• Send to faculty for review and feedback</li>
                  <li>• Faculty can make final adjustments before semester begins</li>
                </ul>
                {courseData?.curriculumInfo && (
                  <p className="text-[10px] text-blue-700 mt-2 pt-2 border-t border-blue-200">
                    💡 This is 1 of {courseData.curriculumInfo.totalCourses} courses from your {courseData.curriculumInfo.regulation} curriculum upload
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
