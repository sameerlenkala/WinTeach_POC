import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Upload, Database, Plus, FileText, Users, Target, Check, ChevronRight, Edit2, Trash2, ChevronDown, ChevronUp, Save, X as XIcon, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockAcademicYears, mockSemesters, mockRegulations, mockFaculty } from '../../data/mockAcademicData';

type CreationMethod = 'manual' | 'upload' | 'database';
type Step = 'method' | 'details' | 'configure' | 'faculty' | 'review';

interface ExtractedCourse {
  code: string;
  name: string;
  credits: number;
  type: string;
  semester: number;
  lectures: number;
  outcomes: Array<{ id: string; code: string; description: string; bloomLevel: string }>;
  topics: Array<{ name: string; subtopics: string[] }>;
}

interface CurriculumData {
  regulation: string;
  academicYear: string;
  department: string;
  courses: ExtractedCourse[];
}

export default function EnhancedCourseCreation() {
  const navigate = useNavigate();
  const location = useLocation();
  const contentType = location.state?.contentType || 'standard';

  const [currentStep, setCurrentStep] = useState<Step>('method');
  const [creationMethod, setCreationMethod] = useState<CreationMethod | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [curriculumData, setCurriculumData] = useState<CurriculumData | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [editingCourseIndex, setEditingCourseIndex] = useState<number | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());
  const [showBloomInfo, setShowBloomInfo] = useState(false);

  // Bloom's Taxonomy information
  const bloomLevels = [
    { level: 'Remember', description: 'Recall facts and basic concepts', examples: 'Define, List, Identify, Name, State' },
    { level: 'Understand', description: 'Explain ideas or concepts', examples: 'Describe, Explain, Summarize, Interpret' },
    { level: 'Apply', description: 'Use information in new situations', examples: 'Implement, Execute, Use, Solve, Demonstrate' },
    { level: 'Analyze', description: 'Draw connections among ideas', examples: 'Compare, Organize, Examine, Differentiate' },
    { level: 'Evaluate', description: 'Justify a decision or course of action', examples: 'Judge, Critique, Assess, Defend' },
    { level: 'Create', description: 'Produce new or original work', examples: 'Design, Construct, Develop, Formulate, Invent' },
  ];
  
  // Form data
  const [courseData, setCourseData] = useState({
    // Basic Info
    code: '',
    name: '',
    credits: 4,
    type: 'Theory',
    academicYearId: '',
    semesterId: '',
    regulationId: '',
    departmentId: 'dept-1',
    section: 'A',
    
    // Outcomes
    outcomes: [
      { id: 'co-1', code: 'CO1', description: '', bloomLevel: 'Understand' },
      { id: 'co-2', code: 'CO2', description: '', bloomLevel: 'Apply' },
      { id: 'co-3', code: 'CO3', description: '', bloomLevel: 'Analyze' },
    ],
    
    // Faculty
    primaryFacultyId: '',
    coFacultyIds: [] as string[],
    
    // Settings
    enableFacultyUpload: true,
    preLectureAssessment: 'optional' as 'optional' | 'mandatory' | 'disable',
    lecturesPerUnit: {} as Record<string, number>,
  });

  // Mock database templates
  const databaseTemplates = [
    { 
      id: 'template-1', 
      code: 'CS101', 
      name: 'Data Structures and Algorithms', 
      credits: 4, 
      type: 'Theory+Lab',
      outcomes: [
        { id: 'co-1', code: 'CO1', description: 'Understand fundamental data structures', bloomLevel: 'Understand' },
        { id: 'co-2', code: 'CO2', description: 'Implement various algorithms', bloomLevel: 'Apply' },
        { id: 'co-3', code: 'CO3', description: 'Analyze algorithm complexity', bloomLevel: 'Analyze' },
      ]
    },
    { 
      id: 'template-2', 
      code: 'CS102', 
      name: 'Database Management Systems', 
      credits: 3, 
      type: 'Theory',
      outcomes: [
        { id: 'co-1', code: 'CO1', description: 'Understand database concepts', bloomLevel: 'Understand' },
        { id: 'co-2', code: 'CO2', description: 'Design database schemas', bloomLevel: 'Create' },
        { id: 'co-3', code: 'CO3', description: 'Write SQL queries', bloomLevel: 'Apply' },
      ]
    },
    { 
      id: 'template-3', 
      code: 'CS103', 
      name: 'Operating Systems', 
      credits: 4, 
      type: 'Theory+Lab',
      outcomes: [
        { id: 'co-1', code: 'CO1', description: 'Understand OS concepts', bloomLevel: 'Understand' },
        { id: 'co-2', code: 'CO2', description: 'Implement process scheduling', bloomLevel: 'Apply' },
        { id: 'co-3', code: 'CO3', description: 'Analyze memory management', bloomLevel: 'Analyze' },
      ]
    },
    { 
      id: 'template-4', 
      code: 'CS104', 
      name: 'Computer Networks', 
      credits: 3, 
      type: 'Theory',
      outcomes: [
        { id: 'co-1', code: 'CO1', description: 'Understand network protocols', bloomLevel: 'Understand' },
        { id: 'co-2', code: 'CO2', description: 'Configure network devices', bloomLevel: 'Apply' },
        { id: 'co-3', code: 'CO3', description: 'Troubleshoot network issues', bloomLevel: 'Analyze' },
      ]
    },
  ];

  const steps: { id: Step; label: string }[] = [
    { id: 'method', label: 'Method' },
    { id: 'details', label: 'Details' },
    { id: 'configure', label: 'Configure' },
    { id: 'faculty', label: 'Faculty' },
    { id: 'review', label: 'Preview' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    } else {
      navigate(-1);
    }
  };

  const handleSelectTemplate = (template: typeof databaseTemplates[0]) => {
    setCourseData(prev => ({
      ...prev,
      code: template.code,
      name: template.name,
      credits: template.credits,
      type: template.type,
      outcomes: template.outcomes,
    }));
    setCreationMethod('database');
    setCurrentStep('details');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsProcessing(true);
      setCreationMethod('upload');
      
      // Simulate file processing and complete curriculum extraction
      setTimeout(() => {
        // Mock complete curriculum data
        const mockCurriculum: CurriculumData = {
          regulation: 'R22',
          academicYear: '2022-23',
          department: 'Computer Science and Engineering',
          courses: [
            {
              code: 'MA101BS',
              name: 'Matrices and Calculus',
              credits: 4,
              type: 'Theory',
              semester: 1,
              lectures: 48,
              topics: [
                { name: 'Matrices', subtopics: ['Rank of Matrix', 'Inverse of Matrices', 'System of Linear Equations'] },
                { name: 'Eigen Values', subtopics: ['Linear Transformation', 'Diagonalization', 'Cayley-Hamilton Theorem'] },
                { name: 'Calculus', subtopics: ['Mean Value Theorems', 'Taylor Series', 'Beta and Gamma Functions'] },
                { name: 'Partial Differentiation', subtopics: ['Euler Theorem', 'Total Derivative', 'Maxima and Minima'] },
                { name: 'Multiple Integrals', subtopics: ['Double Integrals', 'Triple Integrals', 'Applications'] },
              ],
              outcomes: [
                { id: 'co-1', code: 'CO1', description: 'Write matrix representation and analyze system of equations', bloomLevel: 'Apply' },
                { id: 'co-2', code: 'CO2', description: 'Find Eigenvalues and Eigenvectors', bloomLevel: 'Apply' },
                { id: 'co-3', code: 'CO3', description: 'Solve applications on mean value theorems', bloomLevel: 'Apply' },
                { id: 'co-4', code: 'CO4', description: 'Evaluate improper integrals using Beta and Gamma functions', bloomLevel: 'Apply' },
                { id: 'co-5', code: 'CO5', description: 'Find extreme values of functions', bloomLevel: 'Apply' },
                { id: 'co-6', code: 'CO6', description: 'Evaluate multiple integrals and apply to find areas, volumes', bloomLevel: 'Apply' },
              ]
            },
            {
              code: 'CH102BS',
              name: 'Engineering Chemistry',
              credits: 4,
              type: 'Theory',
              semester: 1,
              lectures: 40,
              topics: [
                { name: 'Water Treatment', subtopics: ['Hardness of Water', 'Potable Water Treatment', 'Boiler Troubles'] },
                { name: 'Battery Chemistry', subtopics: ['Primary Batteries', 'Secondary Batteries', 'Fuel Cells', 'Solar Cells'] },
                { name: 'Corrosion', subtopics: ['Electrochemical Corrosion', 'Types of Corrosion', 'Corrosion Control'] },
                { name: 'Polymeric Materials', subtopics: ['Classification', 'Plastics', 'Rubbers', 'Conducting Polymers'] },
                { name: 'Energy Sources', subtopics: ['Coal Analysis', 'Petroleum Refining', 'Gaseous Fuels', 'Biodiesel'] },
              ],
              outcomes: [
                { id: 'co-1', code: 'CO1', description: 'Acquire basic knowledge of electrochemical procedures', bloomLevel: 'Understand' },
                { id: 'co-2', code: 'CO2', description: 'Understand basic properties of water and its usage', bloomLevel: 'Understand' },
                { id: 'co-3', code: 'CO3', description: 'Learn fundamentals and properties of polymers', bloomLevel: 'Understand' },
                { id: 'co-4', code: 'CO4', description: 'Predict potential applications of chemistry', bloomLevel: 'Apply' },
              ]
            },
            {
              code: 'CS103ES',
              name: 'Programming for Problem Solving',
              credits: 3,
              type: 'Theory',
              semester: 1,
              lectures: 45,
              topics: [
                { name: 'Introduction to Programming', subtopics: ['Algorithms', 'Flowcharts', 'C Language Basics'] },
                { name: 'Arrays and Strings', subtopics: ['One-dimensional Arrays', 'Two-dimensional Arrays', 'String Handling'] },
                { name: 'Structures and Pointers', subtopics: ['Defining Structures', 'Pointers to Arrays', 'Self-referential Structures'] },
                { name: 'Functions', subtopics: ['Function Declaration', 'Recursion', 'Dynamic Memory Allocation'] },
                { name: 'Searching and Sorting', subtopics: ['Linear Search', 'Binary Search', 'Bubble Sort', 'Selection Sort'] },
              ],
              outcomes: [
                { id: 'co-1', code: 'CO1', description: 'Write algorithms and draw flowcharts', bloomLevel: 'Apply' },
                { id: 'co-2', code: 'CO2', description: 'Convert algorithms to C programs', bloomLevel: 'Apply' },
                { id: 'co-3', code: 'CO3', description: 'Code and test logic in C programming', bloomLevel: 'Apply' },
                { id: 'co-4', code: 'CO4', description: 'Develop modular reusable code', bloomLevel: 'Create' },
                { id: 'co-5', code: 'CO5', description: 'Use arrays, pointers, strings and structures', bloomLevel: 'Apply' },
                { id: 'co-6', code: 'CO6', description: 'Implement searching and sorting algorithms', bloomLevel: 'Apply' },
              ]
            },
            {
              code: 'EE104ES',
              name: 'Basic Electrical Engineering',
              credits: 2,
              type: 'Theory',
              semester: 1,
              lectures: 30,
              topics: [
                { name: 'DC Circuits', subtopics: ['Circuit Elements', 'KVL and KCL', 'Network Theorems'] },
                { name: 'AC Circuits', subtopics: ['Sinusoidal Waveforms', 'Single Phase Circuits', 'Three Phase Circuits'] },
                { name: 'Transformers', subtopics: ['Ideal Transformer', 'Losses', 'Efficiency', 'Auto-transformer'] },
                { name: 'Electrical Machines', subtopics: ['DC Machines', 'Induction Motors', 'Synchronous Generators'] },
                { name: 'Electrical Installations', subtopics: ['LT Switchgear', 'Wires and Cables', 'Earthing', 'Batteries'] },
              ],
              outcomes: [
                { id: 'co-1', code: 'CO1', description: 'Understand and analyze basic Electrical circuits', bloomLevel: 'Analyze' },
                { id: 'co-2', code: 'CO2', description: 'Study working principles of Electrical Machines', bloomLevel: 'Understand' },
                { id: 'co-3', code: 'CO3', description: 'Understand components of LV Electrical Installations', bloomLevel: 'Understand' },
              ]
            },
            {
              code: 'ME105ES',
              name: 'Computer Aided Engineering Graphics',
              credits: 3,
              type: 'Lab',
              semester: 1,
              lectures: 24,
              topics: [
                { name: 'Engineering Graphics Basics', subtopics: ['Scales', 'Conic Sections', 'Cycloid Curves'] },
                { name: 'Orthographic Projections', subtopics: ['Points and Lines', 'Plane Figures', 'Auxiliary Planes'] },
                { name: 'Projections of Solids', subtopics: ['Regular Solids', 'Sectional Views', 'Auxiliary Views'] },
                { name: 'Development of Surfaces', subtopics: ['Prism', 'Cylinder', 'Pyramid', 'Cone'] },
                { name: 'Isometric Projections', subtopics: ['Isometric Scale', 'Isometric Views', 'Conversion'] },
              ],
              outcomes: [
                { id: 'co-1', code: 'CO1', description: 'Apply CAD tools to create 2D and 3D objects', bloomLevel: 'Apply' },
                { id: 'co-2', code: 'CO2', description: 'Sketch conics and different types of solids', bloomLevel: 'Apply' },
                { id: 'co-3', code: 'CO3', description: 'Appreciate need of Sectional views and Development', bloomLevel: 'Understand' },
                { id: 'co-4', code: 'CO4', description: 'Read and interpret engineering drawings', bloomLevel: 'Understand' },
              ]
            },
          ]
        };
        
        setCurriculumData(mockCurriculum);
        setIsProcessing(false);
        setCurrentStep('details');
      }, 2500);
    }
  };

  const handleSubmit = () => {
    if (curriculumData) {
      // For curriculum upload - create multiple courses
      const selectedCourses = curriculumData.courses.filter(c => c.semester === selectedSemester);
      
      // For demo, we'll work with the first course but show all were created
      const firstCourse = selectedCourses[0];
      const newCourseId = 'course-' + Date.now();
      
      // Store all curriculum data for later use
      const fullCourseData = {
        ...courseData,
        code: firstCourse.code,
        name: firstCourse.name,
        credits: firstCourse.credits,
        type: firstCourse.type,
        outcomes: firstCourse.outcomes,
        topics: firstCourse.topics,
        lectures: firstCourse.lectures,
        // Keep curriculum context
        curriculumInfo: {
          regulation: curriculumData.regulation,
          department: curriculumData.department,
          semester: selectedSemester,
          totalCourses: selectedCourses.length,
          allCourses: selectedCourses.map(c => ({ code: c.code, name: c.name }))
        }
      };
      
      // Navigate with success state
      navigate(`/academic/hod/course/${newCourseId}/plan-options`, {
        state: { 
          courseData: fullCourseData,
          isNewlyCreated: true,
          creationMethod: 'upload',
          successMessage: `Successfully created ${selectedCourses.length} course${selectedCourses.length > 1 ? 's' : ''} for Semester ${selectedSemester}`
        }
      });
    } else {
      // For manual/database - create single course
      const newCourseId = 'course-' + Date.now();
      
      navigate(`/academic/hod/course/${newCourseId}/plan-options`, {
        state: { 
          courseData,
          isNewlyCreated: true,
          creationMethod: creationMethod || 'manual',
          successMessage: `Successfully created course: ${courseData.code} - ${courseData.name}`
        }
      });
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Create Course</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Content Type: <Badge variant="secondary" className="text-[10px]">{contentType === 'standard' ? 'Winnify Standard' : 'Accredited'}</Badge>
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                index === currentStepIndex
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.label}
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Processing State */}
        {isProcessing && (
          <Card>
            <CardContent className="p-12">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <div>
                  <h2 className="text-base font-bold font-[family-name:var(--font-heading)] mb-2">
                    Processing Curriculum Document...
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Extracting complete course structure from {uploadedFile?.name}
                  </p>
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Reading curriculum structure</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span>Extracting courses and topics</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                    <span>Parsing learning outcomes</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Method Selection */}
        {currentStep === 'method' && !isProcessing && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-base font-bold font-[family-name:var(--font-heading)] mb-2">
                How would you like to create the course?
              </h2>
              <p className="text-xs text-muted-foreground">
                Choose a method to get started
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Manual Entry */}
              <Card
                className="cursor-pointer hover:shadow-sm transition-all"
                onClick={() => {
                  setCreationMethod('manual');
                  setCurrentStep('details');
                }}
              >
                <CardContent className="p-5 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mx-auto mb-4">
                    <Plus className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-2">
                    Add New
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Manually enter all course details from scratch
                  </p>
                  <Button size="sm" className="w-full">Start Fresh</Button>
                </CardContent>
              </Card>

              {/* Upload */}
              <Card className="cursor-pointer hover:shadow-sm transition-all">
                <CardContent className="p-5 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600 mx-auto mb-4">
                    <Upload className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-2">
                    Upload
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Upload course structure from CSV or Excel file
                  </p>
                  <label htmlFor="file-upload">
                    <Button size="sm" className="w-full" type="button" onClick={() => document.getElementById('file-upload')?.click()}>
                      Choose File
                    </Button>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </CardContent>
              </Card>

              {/* Database */}
              <Card className="cursor-pointer hover:shadow-sm transition-all">
                <CardContent className="p-5 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-purple-600 mx-auto mb-4">
                    <Database className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-2">
                    From Database
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Select from existing course templates
                  </p>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setCreationMethod('database');
                      setCurrentStep('details');
                    }}
                  >
                    Browse Templates
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Database Templates (if method selected) */}
            {creationMethod === 'database' && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-4">
                    Select a Template
                  </h3>
                  <div className="space-y-3">
                    {databaseTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <div>
                          <p className="text-sm font-semibold">{template.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {template.code} • {template.credits} Credits • {template.type}
                          </p>
                        </div>
                        <Button size="sm">Select</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 2: Details (for uploaded curriculum) */}
        {currentStep === 'details' && curriculumData && (
          <Card>
            <CardContent className="p-5 space-y-5">
              <div>
                <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-2">Curriculum Details</h3>
                <p className="text-xs text-muted-foreground">Configure basic settings for the uploaded curriculum</p>
              </div>

              {/* Curriculum Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Regulation</p>
                    <p className="font-semibold">{curriculumData.regulation}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Department</p>
                    <p className="font-semibold">{curriculumData.department}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Total Courses</p>
                    <p className="font-semibold">{curriculumData.courses.length}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Select Semester */}
                <div>
                  <label className="block text-xs font-medium mb-2">Select Semester to Import *</label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  >
                    {Array.from(new Set(curriculumData.courses.map(c => c.semester))).sort().map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {curriculumData.courses.filter(c => c.semester === selectedSemester).length} courses in this semester
                  </p>
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-xs font-medium mb-2">Academic Year *</label>
                  <select
                    value={courseData.academicYearId}
                    onChange={(e) => setCourseData({ ...courseData, academicYearId: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  >
                    <option value="">Select Academic Year</option>
                    {mockAcademicYears.map(ay => (
                      <option key={ay.id} value={ay.id}>{ay.name}</option>
                    ))}
                  </select>
                </div>

                {/* Regulation */}
                <div>
                  <label className="block text-xs font-medium mb-2">Regulation *</label>
                  <select
                    value={courseData.regulationId}
                    onChange={(e) => setCourseData({ ...courseData, regulationId: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  >
                    <option value="">Select Regulation</option>
                    {mockRegulations.map(reg => (
                      <option key={reg.id} value={reg.id}>{reg.name}</option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label className="block text-xs font-medium mb-2">Section *</label>
                  <input
                    type="text"
                    value={courseData.section}
                    onChange={(e) => setCourseData({ ...courseData, section: e.target.value })}
                    placeholder="e.g., A"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" size="sm" onClick={handleBack}>Back</Button>
                <Button 
                  size="sm" 
                  onClick={handleNext}
                  disabled={!courseData.academicYearId || !courseData.regulationId}
                >
                  Next: Configure Courses
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Basic Info (for manual/database) */}
        {currentStep === 'details' && !curriculumData && (
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Course Code *</label>
                  <input
                    type="text"
                    value={courseData.code}
                    onChange={(e) => setCourseData({ ...courseData, code: e.target.value })}
                    placeholder="e.g., CS101"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Course Name *</label>
                  <input
                    type="text"
                    value={courseData.name}
                    onChange={(e) => setCourseData({ ...courseData, name: e.target.value })}
                    placeholder="e.g., Data Structures"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Credits *</label>
                  <input
                    type="number"
                    value={courseData.credits}
                    onChange={(e) => setCourseData({ ...courseData, credits: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type *</label>
                  <select
                    value={courseData.type}
                    onChange={(e) => setCourseData({ ...courseData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Lab">Lab</option>
                    <option value="Theory+Lab">Theory + Lab</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Academic Year *</label>
                  <select
                    value={courseData.academicYearId}
                    onChange={(e) => setCourseData({ ...courseData, academicYearId: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                  >
                    <option value="">Select Academic Year</option>
                    {mockAcademicYears.map(ay => (
                      <option key={ay.id} value={ay.id}>{ay.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Semester *</label>
                  <select
                    value={courseData.semesterId}
                    onChange={(e) => setCourseData({ ...courseData, semesterId: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                  >
                    <option value="">Select Semester</option>
                    {mockSemesters.map(sem => (
                      <option key={sem.id} value={sem.id}>{sem.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Regulation *</label>
                  <select
                    value={courseData.regulationId}
                    onChange={(e) => setCourseData({ ...courseData, regulationId: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                  >
                    <option value="">Select Regulation</option>
                    {mockRegulations.map(reg => (
                      <option key={reg.id} value={reg.id}>{reg.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Section *</label>
                  <input
                    type="text"
                    value={courseData.section}
                    onChange={(e) => setCourseData({ ...courseData, section: e.target.value })}
                    placeholder="e.g., A"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" size="sm" onClick={handleBack}>Back</Button>
                <Button size="sm" onClick={handleNext}>Next: Configure</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Configure (for uploaded curriculum) */}
        {currentStep === 'configure' && curriculumData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-1">
                  Configure Courses - Semester {selectedSemester}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Review and customize courses, topics, and outcomes. Click on any course to expand and edit.
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {curriculumData.courses.filter(c => c.semester === selectedSemester).length} Courses
              </Badge>
            </div>

            {/* Bloom's Taxonomy Info Panel */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 shrink-0">
                    <Info className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-blue-900">Bloom's Taxonomy Levels</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBloomInfo(!showBloomInfo)}
                      >
                        {showBloomInfo ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            Learn More
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-[10px] text-blue-800 mb-2">
                      Bloom's Taxonomy classifies learning objectives by cognitive complexity, from basic recall to advanced creation.
                    </p>
                    
                    {showBloomInfo && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                        {bloomLevels.map((bloom, idx) => (
                          <div key={idx} className="p-2 bg-white rounded border border-blue-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-[9px]">{bloom.level}</Badge>
                              <span className="text-[10px] text-blue-600 font-medium">Level {idx + 1}</span>
                            </div>
                            <p className="text-[10px] text-gray-700 mb-1">{bloom.description}</p>
                            <p className="text-[9px] text-muted-foreground">
                              <strong>Examples:</strong> {bloom.examples}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {curriculumData.courses
              .filter(course => course.semester === selectedSemester)
              .map((course, index) => {
                const isExpanded = expandedCourses.has(index);
                const isEditing = editingCourseIndex === index;
                
                return (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-0">
                      {/* Course Header - Always Visible */}
                      <div 
                        className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => {
                          const newExpanded = new Set(expandedCourses);
                          if (isExpanded) {
                            newExpanded.delete(index);
                          } else {
                            newExpanded.add(index);
                          }
                          setExpandedCourses(newExpanded);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-[10px]">{course.code}</Badge>
                              <Badge variant="outline" className="text-[10px]">{course.type}</Badge>
                              <Badge variant="outline" className="text-[10px]">{course.credits} Credits</Badge>
                              <Badge variant="outline" className="text-[10px]">{course.lectures} Lectures</Badge>
                              <Badge variant="outline" className="text-[10px]">{course.topics.length} Topics</Badge>
                              <Badge variant="outline" className="text-[10px]">{course.outcomes.length} Outcomes</Badge>
                            </div>
                            <h4 className="text-sm font-semibold font-[family-name:var(--font-heading)]">
                              {course.name}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCourseIndex(isEditing ? null : index);
                              }}
                            >
                              {isEditing ? (
                                <>
                                  <Save className="h-3.5 w-3.5 mr-1" />
                                  Save
                                </>
                              ) : (
                                <>
                                  <Edit2 className="h-3.5 w-3.5 mr-1" />
                                  Edit
                                </>
                              )}
                            </Button>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-border p-5 space-y-5 bg-muted/10">
                          {/* Basic Info - Editable */}
                          {isEditing && (
                            <div className="p-4 bg-white rounded-lg border border-border space-y-3">
                              <p className="text-xs font-semibold mb-3">Basic Information</p>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-medium mb-1">Course Code</label>
                                  <input
                                    type="text"
                                    value={course.code}
                                    onChange={(e) => {
                                      const newCourses = [...curriculumData.courses];
                                      newCourses[index].code = e.target.value;
                                      setCurriculumData({ ...curriculumData, courses: newCourses });
                                    }}
                                    className="w-full px-2 py-1.5 border border-border rounded text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-medium mb-1">Course Name</label>
                                  <input
                                    type="text"
                                    value={course.name}
                                    onChange={(e) => {
                                      const newCourses = [...curriculumData.courses];
                                      newCourses[index].name = e.target.value;
                                      setCurriculumData({ ...curriculumData, courses: newCourses });
                                    }}
                                    className="w-full px-2 py-1.5 border border-border rounded text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-medium mb-1">Credits</label>
                                  <input
                                    type="number"
                                    value={course.credits}
                                    onChange={(e) => {
                                      const newCourses = [...curriculumData.courses];
                                      newCourses[index].credits = parseInt(e.target.value);
                                      setCurriculumData({ ...curriculumData, courses: newCourses });
                                    }}
                                    className="w-full px-2 py-1.5 border border-border rounded text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-medium mb-1">Type</label>
                                  <select
                                    value={course.type}
                                    onChange={(e) => {
                                      const newCourses = [...curriculumData.courses];
                                      newCourses[index].type = e.target.value;
                                      setCurriculumData({ ...curriculumData, courses: newCourses });
                                    }}
                                    className="w-full px-2 py-1.5 border border-border rounded text-xs"
                                  >
                                    <option value="Theory">Theory</option>
                                    <option value="Lab">Lab</option>
                                    <option value="Theory+Lab">Theory+Lab</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-medium mb-1">Total Lectures</label>
                                  <input
                                    type="number"
                                    value={course.lectures}
                                    onChange={(e) => {
                                      const newCourses = [...curriculumData.courses];
                                      newCourses[index].lectures = parseInt(e.target.value);
                                      setCurriculumData({ ...curriculumData, courses: newCourses });
                                    }}
                                    className="w-full px-2 py-1.5 border border-border rounded text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Topics Section */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-xs font-semibold">Topics ({course.topics.length})</p>
                              {isEditing && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newCourses = [...curriculumData.courses];
                                    newCourses[index].topics.push({ name: 'New Topic', subtopics: [] });
                                    setCurriculumData({ ...curriculumData, courses: newCourses });
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Topic
                                </Button>
                              )}
                            </div>
                            <div className="space-y-2">
                              {course.topics.map((topic, topicIdx) => (
                                <div key={topicIdx} className="p-3 bg-white rounded-lg border border-border">
                                  <div className="flex items-start justify-between mb-2">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={topic.name}
                                        onChange={(e) => {
                                          const newCourses = [...curriculumData.courses];
                                          newCourses[index].topics[topicIdx].name = e.target.value;
                                          setCurriculumData({ ...curriculumData, courses: newCourses });
                                        }}
                                        className="flex-1 px-2 py-1 border border-border rounded text-xs font-medium"
                                      />
                                    ) : (
                                      <p className="text-xs font-medium">{topic.name}</p>
                                    )}
                                    {isEditing && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const newCourses = [...curriculumData.courses];
                                          newCourses[index].topics.splice(topicIdx, 1);
                                          setCurriculumData({ ...curriculumData, courses: newCourses });
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3 text-red-500" />
                                      </Button>
                                    )}
                                  </div>
                                  
                                  {/* Subtopics */}
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap gap-1">
                                      {topic.subtopics.map((subtopic, subIdx) => (
                                        <div key={subIdx} className="flex items-center gap-1">
                                          {isEditing ? (
                                            <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                                              <input
                                                type="text"
                                                value={subtopic}
                                                onChange={(e) => {
                                                  const newCourses = [...curriculumData.courses];
                                                  newCourses[index].topics[topicIdx].subtopics[subIdx] = e.target.value;
                                                  setCurriculumData({ ...curriculumData, courses: newCourses });
                                                }}
                                                className="w-32 px-1 py-0.5 border-0 bg-transparent text-[9px] focus:outline-none"
                                              />
                                              <button
                                                onClick={() => {
                                                  const newCourses = [...curriculumData.courses];
                                                  newCourses[index].topics[topicIdx].subtopics.splice(subIdx, 1);
                                                  setCurriculumData({ ...curriculumData, courses: newCourses });
                                                }}
                                              >
                                                <XIcon className="h-3 w-3 text-red-500" />
                                              </button>
                                            </div>
                                          ) : (
                                            <Badge variant="outline" className="text-[9px]">
                                              {subtopic}
                                            </Badge>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                    {isEditing && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const newCourses = [...curriculumData.courses];
                                          newCourses[index].topics[topicIdx].subtopics.push('New Subtopic');
                                          setCurriculumData({ ...curriculumData, courses: newCourses });
                                        }}
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add Subtopic
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Course Outcomes Section */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-xs font-semibold">Course Outcomes ({course.outcomes.length})</p>
                              {isEditing && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newCourses = [...curriculumData.courses];
                                    const newCONumber = course.outcomes.length + 1;
                                    newCourses[index].outcomes.push({
                                      id: `co-${newCONumber}`,
                                      code: `CO${newCONumber}`,
                                      description: '',
                                      bloomLevel: 'Understand'
                                    });
                                    setCurriculumData({ ...curriculumData, courses: newCourses });
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Outcome
                                </Button>
                              )}
                            </div>
                            <div className="space-y-2">
                              {course.outcomes.map((outcome, outcomeIdx) => (
                                <div key={outcome.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  {isEditing ? (
                                    <div className="space-y-2">
                                      <div className="flex items-start gap-2">
                                        <input
                                          type="text"
                                          value={outcome.code}
                                          onChange={(e) => {
                                            const newCourses = [...curriculumData.courses];
                                            newCourses[index].outcomes[outcomeIdx].code = e.target.value;
                                            setCurriculumData({ ...curriculumData, courses: newCourses });
                                          }}
                                          className="w-20 px-2 py-1 border border-border rounded text-[9px] font-bold"
                                        />
                                        <textarea
                                          value={outcome.description}
                                          onChange={(e) => {
                                            const newCourses = [...curriculumData.courses];
                                            newCourses[index].outcomes[outcomeIdx].description = e.target.value;
                                            setCurriculumData({ ...curriculumData, courses: newCourses });
                                          }}
                                          className="flex-1 px-2 py-1 border border-border rounded text-xs resize-none"
                                          rows={2}
                                        />
                                        <select
                                          value={outcome.bloomLevel}
                                          onChange={(e) => {
                                            const newCourses = [...curriculumData.courses];
                                            newCourses[index].outcomes[outcomeIdx].bloomLevel = e.target.value;
                                            setCurriculumData({ ...curriculumData, courses: newCourses });
                                          }}
                                          className="w-24 px-2 py-1 border border-border rounded text-[9px]"
                                        >
                                          <option value="Remember">Remember</option>
                                          <option value="Understand">Understand</option>
                                          <option value="Apply">Apply</option>
                                          <option value="Analyze">Analyze</option>
                                          <option value="Evaluate">Evaluate</option>
                                          <option value="Create">Create</option>
                                        </select>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const newCourses = [...curriculumData.courses];
                                            newCourses[index].outcomes.splice(outcomeIdx, 1);
                                            setCurriculumData({ ...curriculumData, courses: newCourses });
                                          }}
                                        >
                                          <Trash2 className="h-3 w-3 text-red-500" />
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-start gap-2 text-xs">
                                      <Badge variant="secondary" className="text-[9px] shrink-0">{outcome.code}</Badge>
                                      <p className="flex-1">{outcome.description}</p>
                                      <Badge variant="outline" className="text-[9px] shrink-0">{outcome.bloomLevel}</Badge>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" size="sm" onClick={handleBack}>Back</Button>
              <Button size="sm" onClick={handleNext}>Next: Assign Faculty</Button>
            </div>
          </div>
        )}

        {/* Step 3: Configure (for manual/database) */}
        {currentStep === 'configure' && !curriculumData && (
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">Course Outcomes</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newCO = {
                      id: `co-${courseData.outcomes.length + 1}`,
                      code: `CO${courseData.outcomes.length + 1}`,
                      description: '',
                      bloomLevel: 'Understand',
                    };
                    setCourseData({ ...courseData, outcomes: [...courseData.outcomes, newCO] });
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add CO
                </Button>
              </div>

              <div className="space-y-4">
                {courseData.outcomes.map((outcome, index) => (
                  <div key={outcome.id} className="p-4 border border-border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">CO Code</label>
                        <input
                          type="text"
                          value={outcome.code}
                          onChange={(e) => {
                            const newOutcomes = [...courseData.outcomes];
                            newOutcomes[index].code = e.target.value;
                            setCourseData({ ...courseData, outcomes: newOutcomes });
                          }}
                          className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <input
                          type="text"
                          value={outcome.description}
                          onChange={(e) => {
                            const newOutcomes = [...courseData.outcomes];
                            newOutcomes[index].description = e.target.value;
                            setCourseData({ ...courseData, outcomes: newOutcomes });
                          }}
                          placeholder="e.g., Understand fundamental data structures"
                          className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Bloom's Level</label>
                        <select
                          value={outcome.bloomLevel}
                          onChange={(e) => {
                            const newOutcomes = [...courseData.outcomes];
                            newOutcomes[index].bloomLevel = e.target.value;
                            setCourseData({ ...courseData, outcomes: newOutcomes });
                          }}
                          className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                        >
                          <option value="Remember">Remember</option>
                          <option value="Understand">Understand</option>
                          <option value="Apply">Apply</option>
                          <option value="Analyze">Analyze</option>
                          <option value="Evaluate">Evaluate</option>
                          <option value="Create">Create</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" size="sm" onClick={handleBack}>Back</Button>
                <Button size="sm" onClick={handleNext}>Next: Faculty</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Faculty Assignment */}
        {currentStep === 'faculty' && (
          <Card>
            <CardContent className="p-5 space-y-6">
              <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">Faculty Assignment</h3>
              
              {/* Primary Faculty */}
              <div>
                <label className="block text-sm font-medium mb-3">Primary Faculty *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockFaculty.map((faculty) => (
                    <div
                      key={faculty.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        courseData.primaryFacultyId === faculty.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setCourseData({ ...courseData, primaryFacultyId: faculty.id })}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                            {faculty.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{faculty.name}</p>
                            <p className="text-xs text-muted-foreground">{faculty.designation}</p>
                          </div>
                        </div>
                        {courseData.primaryFacultyId === faculty.id && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        <strong>Specialization:</strong> {faculty.specialization}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Current Courses:</strong> {faculty.courses.length}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Co-Faculty (Optional) */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Co-Faculty (Optional)
                  <span className="text-xs text-muted-foreground ml-2">Select multiple if needed</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockFaculty
                    .filter(f => f.id !== courseData.primaryFacultyId)
                    .map((faculty) => (
                      <div
                        key={faculty.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          courseData.coFacultyIds.includes(faculty.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => {
                          const isSelected = courseData.coFacultyIds.includes(faculty.id);
                          setCourseData({
                            ...courseData,
                            coFacultyIds: isSelected
                              ? courseData.coFacultyIds.filter(id => id !== faculty.id)
                              : [...courseData.coFacultyIds, faculty.id]
                          });
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                              {faculty.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{faculty.name}</p>
                              <p className="text-xs text-muted-foreground">{faculty.designation}</p>
                            </div>
                          </div>
                          {courseData.coFacultyIds.includes(faculty.id) && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          <strong>Specialization:</strong> {faculty.specialization}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Current Courses:</strong> {faculty.courses.length}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Selected Faculty Summary */}
              {courseData.primaryFacultyId && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Selected Faculty</p>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p>
                      <strong>Primary:</strong>{' '}
                      {mockFaculty.find(f => f.id === courseData.primaryFacultyId)?.name}
                    </p>
                    {courseData.coFacultyIds.length > 0 && (
                      <p>
                        <strong>Co-Faculty:</strong>{' '}
                        {courseData.coFacultyIds
                          .map(id => mockFaculty.find(f => f.id === id)?.name)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" size="sm" onClick={handleBack}>Back</Button>
                <Button 
                  size="sm"
                  onClick={handleNext}
                  disabled={!courseData.primaryFacultyId}
                >
                  Next: Review
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review */}
        {currentStep === 'review' && (
          <Card>
            <CardContent className="p-5 space-y-6">
              <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">Review Course Details</h3>
              
              <div className="space-y-6">
                {/* Creation Method */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-semibold mb-1">Creation Method</p>
                  <Badge variant="secondary">
                    {creationMethod === 'manual' && 'Manual Entry'}
                    {creationMethod === 'upload' && 'File Upload'}
                    {creationMethod === 'database' && 'Database Template'}
                  </Badge>
                </div>

                {/* For Curriculum Upload - Show all courses */}
                {curriculumData && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Curriculum Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                      <div>
                        <span className="text-muted-foreground">Regulation:</span>
                        <p className="font-medium">{curriculumData.regulation}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Department:</span>
                        <p className="font-medium">{curriculumData.department}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Academic Year:</span>
                        <p className="font-medium">
                          {mockAcademicYears.find(ay => ay.id === courseData.academicYearId)?.name || 'Not selected'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Selected Semester:</span>
                        <p className="font-medium">Semester {selectedSemester}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Section:</span>
                        <p className="font-medium">{courseData.section}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Courses:</span>
                        <p className="font-medium">
                          {curriculumData.courses.filter(c => c.semester === selectedSemester).length}
                        </p>
                      </div>
                    </div>

                    {/* List all courses */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold">Courses to be Created ({curriculumData.courses.filter(c => c.semester === selectedSemester).length})</p>
                      {curriculumData.courses
                        .filter(c => c.semester === selectedSemester)
                        .map((course, idx) => (
                          <div key={idx} className="p-4 bg-muted/20 rounded-lg border border-border">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary" className="text-[10px]">{course.code}</Badge>
                                  <Badge variant="outline" className="text-[10px]">{course.type}</Badge>
                                  <Badge variant="outline" className="text-[10px]">{course.credits} Credits</Badge>
                                </div>
                                <p className="text-sm font-semibold">{course.name}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">Topics:</span>
                                <Badge variant="outline" className="text-[9px]">{course.topics.length}</Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">Outcomes:</span>
                                <Badge variant="outline" className="text-[9px]">{course.outcomes.length}</Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">Lectures:</span>
                                <Badge variant="outline" className="text-[9px]">{course.lectures}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* For Manual/Database - Show single course */}
                {!curriculumData && (
                  <>
                    {/* Basic Information */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Basic Information
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm p-4 bg-muted/20 rounded-lg">
                        <div>
                          <span className="text-muted-foreground">Course Code:</span>
                          <p className="font-medium">{courseData.code || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Course Name:</span>
                          <p className="font-medium">{courseData.name || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Credits:</span>
                          <p className="font-medium">{courseData.credits}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <p className="font-medium">{courseData.type}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Academic Year:</span>
                          <p className="font-medium">
                            {mockAcademicYears.find(ay => ay.id === courseData.academicYearId)?.name || 'Not selected'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Semester:</span>
                          <p className="font-medium">
                            {mockSemesters.find(sem => sem.id === courseData.semesterId)?.name || 'Not selected'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Regulation:</span>
                          <p className="font-medium">
                            {mockRegulations.find(reg => reg.id === courseData.regulationId)?.name || 'Not selected'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Section:</span>
                          <p className="font-medium">{courseData.section}</p>
                        </div>
                      </div>
                    </div>

                    {/* Course Outcomes */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Course Outcomes ({courseData.outcomes.length})
                      </h4>
                      <div className="space-y-2">
                        {courseData.outcomes.map(co => (
                          <div key={co.id} className="p-3 bg-muted/20 rounded-lg text-sm">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold">{co.code}</p>
                                <p className="text-muted-foreground mt-1">
                                  {co.description || 'No description provided'}
                                </p>
                              </div>
                              <Badge variant="outline" className="ml-2">{co.bloomLevel}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Faculty Assignment */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Faculty Assignment
                  </h4>
                  <div className="space-y-3">
                    {/* Primary Faculty */}
                    {courseData.primaryFacultyId && (
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">Primary Faculty</p>
                        {(() => {
                          const faculty = mockFaculty.find(f => f.id === courseData.primaryFacultyId);
                          return faculty ? (
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                                {faculty.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{faculty.name}</p>
                                <p className="text-xs text-muted-foreground">{faculty.designation}</p>
                                <p className="text-xs text-muted-foreground">{faculty.specialization}</p>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}

                    {/* Co-Faculty */}
                    {courseData.coFacultyIds.length > 0 && (
                      <div className="p-4 bg-muted/20 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-3">Co-Faculty ({courseData.coFacultyIds.length})</p>
                        <div className="space-y-2">
                          {courseData.coFacultyIds.map(facultyId => {
                            const faculty = mockFaculty.find(f => f.id === facultyId);
                            return faculty ? (
                              <div key={facultyId} className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                  {faculty.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{faculty.name}</p>
                                  <p className="text-xs text-muted-foreground">{faculty.designation}</p>
                                </div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Validation Warnings */}
              {!curriculumData && (!courseData.code || !courseData.name || !courseData.academicYearId || !courseData.semesterId || !courseData.regulationId || !courseData.primaryFacultyId) && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm font-semibold text-orange-900 mb-2">Missing Required Information</p>
                  <ul className="text-sm text-orange-800 space-y-1">
                    {!courseData.code && <li>• Course code is required</li>}
                    {!courseData.name && <li>• Course name is required</li>}
                    {!courseData.academicYearId && <li>• Academic year is required</li>}
                    {!courseData.semesterId && <li>• Semester is required</li>}
                    {!courseData.regulationId && <li>• Regulation is required</li>}
                    {!courseData.primaryFacultyId && <li>• Primary faculty is required</li>}
                  </ul>
                </div>
              )}

              {/* Validation for curriculum upload */}
              {curriculumData && (!courseData.academicYearId || !courseData.regulationId || !courseData.primaryFacultyId) && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm font-semibold text-orange-900 mb-2">Missing Required Information</p>
                  <ul className="text-sm text-orange-800 space-y-1">
                    {!courseData.academicYearId && <li>• Academic year is required</li>}
                    {!courseData.regulationId && <li>• Regulation is required</li>}
                    {!courseData.primaryFacultyId && <li>• Primary faculty is required</li>}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" size="sm" onClick={handleBack}>Back</Button>
                <Button 
                  size="sm"
                  onClick={handleSubmit}
                  disabled={
                    curriculumData 
                      ? (!courseData.academicYearId || !courseData.regulationId || !courseData.primaryFacultyId)
                      : (!courseData.code || !courseData.name || !courseData.academicYearId || !courseData.semesterId || !courseData.regulationId || !courseData.primaryFacultyId)
                  }
                >
                  {curriculumData ? `Create ${curriculumData.courses.filter(c => c.semester === selectedSemester).length} Courses` : 'Create Course'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
