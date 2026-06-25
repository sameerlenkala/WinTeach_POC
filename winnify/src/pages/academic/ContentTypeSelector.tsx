import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, ArrowRight, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ContentTypeSelector() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'standard' | 'accredited' | null>(null);

  const handleContinue = () => {
    if (selectedType) {
      navigate('/academic/hod/course/create', { state: { contentType: selectedType } });
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-base font-bold font-[family-name:var(--font-heading)] mb-2">
          Select Content Type
        </h1>
        <p className="text-xs text-muted-foreground">
          Choose the base content for your course
        </p>
      </div>

      {/* Content Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Winnify Standard Content */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-sm ${
            selectedType === 'standard'
              ? 'ring-2 ring-primary shadow-sm'
              : 'hover:ring-1 hover:ring-primary/50'
          }`}
          onClick={() => setSelectedType('standard')}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <BookOpen className="h-5 w-5" />
              </div>
              {selectedType === 'standard' && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>

            <h3 className="text-sm font-bold font-[family-name:var(--font-heading)] mb-2">
              Winnify Standard Content
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Based on AICTE curriculum guidelines
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs">
                <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <span>Pre-populated course structure</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <span>Standard topics and subtopics</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <span>AICTE-aligned learning outcomes</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <span>Ready-to-use question bank</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-[10px] text-muted-foreground">
                <strong>Best for:</strong> Courses following AICTE guidelines
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Accredited Content */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-sm ${
            selectedType === 'accredited'
              ? 'ring-2 ring-primary shadow-sm'
              : 'hover:ring-1 hover:ring-primary/50'
          }`}
          onClick={() => setSelectedType('accredited')}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Award className="h-5 w-5" />
              </div>
              {selectedType === 'accredited' && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>

            <h3 className="text-sm font-bold font-[family-name:var(--font-heading)] mb-2">
              Accredited Content
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Based on your institution's curriculum
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs">
                <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <span>Custom course structure</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <span>Institution-specific topics</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <span>Custom learning outcomes</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <span>Separate copy from standard</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-[10px] text-muted-foreground">
                <strong>Best for:</strong> Courses with custom curriculum
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Button */}
      <div className="flex justify-center">
        <Button
          size="sm"
          onClick={handleContinue}
          disabled={!selectedType}
          className="min-w-[200px]"
        >
          Continue
          <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Info Note */}
      <Card className="bg-blue-50 border-blue-200 max-w-4xl mx-auto">
        <CardContent className="p-4">
          <p className="text-xs text-blue-900">
            <strong>Note:</strong> You can switch between content types later, but it's recommended to choose the appropriate type from the start to ensure proper course structure alignment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
