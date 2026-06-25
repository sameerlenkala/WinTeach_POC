import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, FileText, Presentation, BookOpen, HelpCircle, FolderPlus, Wand2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type ResourceType = 'faculty-notes' | 'slides' | 'student-notes' | 'quiz' | 'additional';

interface GeneratedResource {
  type: ResourceType;
  title: string;
  status: 'generating' | 'generated' | 'error';
  progress: number;
  content?: string;
  url?: string;
}

export default function ResourceGenerator() {
  const navigate = useNavigate();
  const { lectureId } = useParams();
  const location = useLocation();
  const lectureData = location.state?.lecture;

  const [generating, setGenerating] = useState(true);
  const [currentResource, setCurrentResource] = useState<ResourceType>('faculty-notes');
  const [resources, setResources] = useState<GeneratedResource[]>([
    { type: 'faculty-notes', title: 'Faculty Notes', status: 'generating', progress: 0 },
    { type: 'slides', title: 'Presentation Slides', status: 'generating', progress: 0 },
    { type: 'student-notes', title: 'Student Notes', status: 'generating', progress: 0 },
    { type: 'quiz', title: 'Student Quiz', status: 'generating', progress: 0 },
    { type: 'additional', title: 'Additional Resources', status: 'generating', progress: 0 },
  ]);

  const resourceIcons: Record<ResourceType, any> = {
    'faculty-notes': FileText,
    'slides': Presentation,
    'student-notes': BookOpen,
    'quiz': HelpCircle,
    'additional': FolderPlus,
  };

  useEffect(() => {
    const generateResources = async () => {
      const resourceOrder: ResourceType[] = ['faculty-notes', 'slides', 'student-notes', 'quiz', 'additional'];
      
      for (let i = 0; i < resourceOrder.length; i++) {
        const resourceType = resourceOrder[i];
        setCurrentResource(resourceType);

        // Simulate generation progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          setResources(prev => prev.map(r => 
            r.type === resourceType 
              ? { ...r, progress, status: progress === 100 ? 'generated' : 'generating' }
              : r
          ));
        }

        // Mark as generated
        setResources(prev => prev.map(r => 
          r.type === resourceType 
            ? { 
                ...r, 
                status: 'generated',
                content: `Generated ${r.title} content for ${lectureData?.title || 'lecture'}`,
                url: `/resources/${resourceType}-${lectureId}.pdf`
              }
            : r
        ));
      }

      // All done
      setTimeout(() => setGenerating(false), 500);
    };

    generateResources();
  }, [lectureId, lectureData]);

  const handleViewResources = () => {
    navigate(`/academic/faculty/lecture/${lectureId}`, {
      state: { resourcesGenerated: true }
    });
  };

  const getResourceColor = (type: ResourceType) => {
    const colors: Record<ResourceType, string> = {
      'faculty-notes': 'blue',
      'slides': 'purple',
      'student-notes': 'green',
      'quiz': 'orange',
      'additional': 'pink',
    };
    return colors[type];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-6">
        {generating ? (
          /* Generating State */
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <Wand2 className="h-16 w-16 text-primary animate-pulse" />
                    <div className="absolute -top-2 -right-2">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-2">
                    Generating Lecture Resources
                  </h2>
                  <p className="text-muted-foreground">
                    AI is creating comprehensive resources for your lecture
                  </p>
                </div>

                {/* Lecture Info */}
                {lectureData && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <p className="text-sm font-semibold text-blue-900">{lectureData.title}</p>
                      <p className="text-xs text-blue-700">
                        {lectureData.topics?.join(', ')}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Resource Progress */}
                <div className="space-y-3 pt-4">
                  {resources.map((resource) => {
                    const Icon = resourceIcons[resource.type];
                    const color = getResourceColor(resource.type);
                    const isActive = resource.type === currentResource;
                    const isCompleted = resource.status === 'generated';

                    return (
                      <div
                        key={resource.type}
                        className={`p-4 rounded-lg border transition-all ${
                          isCompleted
                            ? 'bg-green-50 border-green-200'
                            : isActive
                            ? `bg-${color}-50 border-${color}-200`
                            : 'bg-muted border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isActive
                              ? `bg-${color}-500 text-white`
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : isActive ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold">{resource.title}</p>
                              <span className="text-xs font-medium">
                                {resource.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  isCompleted
                                    ? 'bg-green-500'
                                    : isActive
                                    ? `bg-${color}-500`
                                    : 'bg-muted-foreground'
                                }`}
                                style={{ width: `${resource.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Generated State */
          <div className="space-y-6">
            {/* Success Header */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-green-900">
                      Resources Generated Successfully!
                    </h2>
                    <p className="text-green-700">All lecture resources are ready for review</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generated Resources */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
                  Generated Resources
                </h3>
                <div className="space-y-3">
                  {resources.map((resource) => {
                    const Icon = resourceIcons[resource.type];
                    const color = getResourceColor(resource.type);

                    return (
                      <div
                        key={resource.type}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${color}-100 text-${color}-600`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{resource.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {resource.type === 'student-notes' 
                                ? 'Auto-generated from Faculty Notes'
                                : 'AI-generated content'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="success">Generated</Badge>
                          <Badge variant="secondary">Not Reviewed</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <p className="text-sm text-blue-900">
                  <strong>Next Steps:</strong> Review each resource, make any necessary edits, 
                  and publish them to students. You can also replace any resource with your own uploaded version.
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-center">
              <Button size="lg" onClick={handleViewResources}>
                View & Review Resources
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
