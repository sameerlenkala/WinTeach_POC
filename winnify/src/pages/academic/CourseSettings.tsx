import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, FileCheck, Edit3, AlertCircle, BookOpen, Plus, Minus, SquarePen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function CourseSettings() {
  const navigate = useNavigate();
  const { courseId: _courseId } = useParams();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [courseName, setCourseName] = useState('Data Structures and Algorithms');
  const [courseCode, setCourseCode] = useState('CS201');
  const [courseDescription, setCourseDescription] = useState('Comprehensive course on data structures and algorithms');

  // Mock course units/topics
  const courseUnits = [
    { id: 'unit-1', name: 'Unit 1: Introduction to Data Structures', topics: ['Arrays', 'Linked Lists', 'Stacks', 'Queues'] },
    { id: 'unit-2', name: 'Unit 2: Trees and Graphs', topics: ['Binary Trees', 'BST', 'AVL Trees', 'Graph Representation', 'BFS', 'DFS'] },
    { id: 'unit-3', name: 'Unit 3: Sorting and Searching', topics: ['Bubble Sort', 'Quick Sort', 'Merge Sort', 'Binary Search', 'Hashing'] },
    { id: 'unit-4', name: 'Unit 4: Advanced Data Structures', topics: ['Heaps', 'Priority Queues', 'Tries', 'Segment Trees'] },
    { id: 'unit-5', name: 'Unit 5: Algorithm Analysis', topics: ['Time Complexity', 'Space Complexity', 'Dynamic Programming', 'Greedy Algorithms'] },
  ];

  // Settings state
  const [enableFacultyUpload, setEnableFacultyUpload] = useState(true);
  const [preLectureAssessment, setPreLectureAssessment] = useState<'optional' | 'mandatory' | 'disable'>('optional');
  const [facultyEditPermission, setFacultyEditPermission] = useState(true);
  const [autoPublishResources, setAutoPublishResources] = useState(false);
  const [requireResourceReview, setRequireResourceReview] = useState(true);
  
  // Lectures per unit state
  const [lecturesPerUnit, setLecturesPerUnit] = useState<Record<string, number>>({
    'unit-1': 8,
    'unit-2': 10,
    'unit-3': 9,
    'unit-4': 8,
    'unit-5': 10,
  });

  const handleSave = () => {
    const settings = {
      enableFacultyUpload,
      preLectureAssessment,
      facultyEditPermission,
      autoPublishResources,
      requireResourceReview,
      lecturesPerUnit,
    };
    
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
    navigate(-1);
  };

  const handleEditCourse = () => {
    setShowEditDialog(true);
  };

  const handleSaveCourseDetails = () => {
    console.log('Saving course details:', { courseName, courseCode, courseDescription });
    alert('Course details updated successfully!');
    setShowEditDialog(false);
  };

  const updateLecturesForUnit = (unitId: string, value: number) => {
    setLecturesPerUnit(prev => ({
      ...prev,
      [unitId]: Math.max(1, Math.min(20, value)) // Min 1, Max 20
    }));
  };

  const getTotalLectures = () => {
    return Object.values(lecturesPerUnit).reduce((sum, val) => sum + val, 0);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">
              Course Settings
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure permissions and preferences for this course
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEditCourse}>
            <SquarePen className="h-4 w-4 mr-2" />
            Edit Course
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      {/* Content Control */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">
                Content Control
              </h3>
              <p className="text-xs text-muted-foreground">
                Manage faculty content upload permissions
              </p>
            </div>
          </div>

          <Separator className="mb-5" />

          <div className="space-y-5">
            {/* Enable Faculty Upload */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold">Enable Faculty Uploaded Content</h4>
                  <Badge variant={enableFacultyUpload ? 'success' : 'secondary'} className="text-[10px]">
                    {enableFacultyUpload ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Allow faculty to upload custom notes, slides, and additional resources
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={enableFacultyUpload}
                  onChange={(e) => setEnableFacultyUpload(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {!enableFacultyUpload && (
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-orange-900">Content Upload Disabled</p>
                      <p className="text-xs text-orange-700">
                        Faculty will only be able to use AI-generated content. They cannot upload custom materials.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Auto Publish Resources */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold">Auto-Publish Resources</h4>
                  <Badge variant={autoPublishResources ? 'success' : 'secondary'} className="text-[10px]">
                    {autoPublishResources ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Automatically publish generated resources without manual review
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={autoPublishResources}
                  onChange={(e) => setAutoPublishResources(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Require Resource Review */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold">Require Resource Review</h4>
                  <Badge variant={requireResourceReview ? 'success' : 'secondary'} className="text-[10px]">
                    {requireResourceReview ? 'Required' : 'Not Required'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Faculty must review all resources before publishing to students
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={requireResourceReview}
                  onChange={(e) => setRequireResourceReview(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Settings */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 shrink-0">
              <FileCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">
                Pre-Lecture Assessment
              </h3>
              <p className="text-xs text-muted-foreground">
                Configure faculty readiness assessment before lectures
              </p>
            </div>
          </div>

          <Separator className="mb-5" />

          <div className="space-y-4">
            <p className="text-xs text-muted-foreground mb-4">
              Require faculty to complete a readiness assessment before starting each lecture
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card
                className={`cursor-pointer transition-all ${
                  preLectureAssessment === 'optional'
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setPreLectureAssessment('optional')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-[10px]">Optional</Badge>
                    {preLectureAssessment === 'optional' && (
                      <div className="h-4 w-4 rounded-full bg-primary text-white flex items-center justify-center">
                        <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold mb-1">Optional</h4>
                  <p className="text-[10px] text-muted-foreground">
                    Faculty can choose to complete assessment
                  </p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  preLectureAssessment === 'mandatory'
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setPreLectureAssessment('mandatory')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="destructive" className="text-[10px]">Mandatory</Badge>
                    {preLectureAssessment === 'mandatory' && (
                      <div className="h-4 w-4 rounded-full bg-primary text-white flex items-center justify-center">
                        <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold mb-1">Mandatory</h4>
                  <p className="text-[10px] text-muted-foreground">
                    Must complete before starting lecture
                  </p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  preLectureAssessment === 'disable'
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setPreLectureAssessment('disable')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-[10px]">Disabled</Badge>
                    {preLectureAssessment === 'disable' && (
                      <div className="h-4 w-4 rounded-full bg-primary text-white flex items-center justify-center">
                        <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold mb-1">Disabled</h4>
                  <p className="text-[10px] text-muted-foreground">
                    No assessment required
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Permissions */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 shrink-0">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">
                Faculty Permissions
              </h3>
              <p className="text-xs text-muted-foreground">
                Control what faculty can edit and modify
              </p>
            </div>
          </div>

          <Separator className="mb-5" />

          <div className="space-y-5">
            {/* Faculty Edit Permission */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold">Allow Timeline Editing</h4>
                  <Badge variant={facultyEditPermission ? 'success' : 'secondary'} className="text-[10px]">
                    {facultyEditPermission ? 'Allowed' : 'Not Allowed'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Faculty can edit lecture dates, hours, and topics in the timeline
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={facultyEditPermission}
                  onChange={(e) => setFacultyEditPermission(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {!facultyEditPermission && (
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-orange-900">Timeline Editing Disabled</p>
                      <p className="text-xs text-orange-700">
                        Faculty can only view the timeline. They cannot make any changes to lecture schedule.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lectures per Unit */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">
                  Lectures per Unit
                </h3>
                <p className="text-xs text-muted-foreground">
                  Configure number of lectures for each unit/topic
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Lectures</p>
              <p className="text-xl font-bold text-indigo-600">{getTotalLectures()}</p>
            </div>
          </div>

          <Separator className="mb-5" />

          <div className="space-y-3">
            {courseUnits.map((unit) => (
              <div key={unit.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold mb-1">{unit.name}</h4>
                    <p className="text-[10px] text-muted-foreground">
                      Topics: {unit.topics.join(', ')}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {unit.topics.length} topics • ~{Math.round(lecturesPerUnit[unit.id] / unit.topics.length * 10) / 10} lectures per topic
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateLecturesForUnit(unit.id, lecturesPerUnit[unit.id] - 1)}
                      disabled={lecturesPerUnit[unit.id] <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <div className="flex flex-col items-center min-w-[60px]">
                      <input
                        type="number"
                        value={lecturesPerUnit[unit.id]}
                        onChange={(e) => updateLecturesForUnit(unit.id, parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 text-center border border-border rounded text-sm font-semibold"
                        min="1"
                        max="20"
                      />
                      <span className="text-[10px] text-muted-foreground mt-1">lectures</span>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateLecturesForUnit(unit.id, lecturesPerUnit[unit.id] + 1)}
                      disabled={lecturesPerUnit[unit.id] >= 20}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Progress bar showing lecture distribution */}
                <div className="mt-3">
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${(lecturesPerUnit[unit.id] / getTotalLectures()) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {Math.round((lecturesPerUnit[unit.id] / getTotalLectures()) * 100)}% of total lectures
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Card className="bg-blue-50 border-blue-200 mt-5">
            <CardContent className="p-4">
              <p className="text-xs text-blue-900">
                <strong>Note:</strong> These lecture counts will be used when generating the course timeline. 
                You can adjust individual lecture dates later in the timeline view.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      {/* Edit Course Dialog */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full">
            <CardContent className="p-5 space-y-5">
              <div>
                <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-2">
                  Edit Course Details
                </h3>
                <p className="text-xs text-muted-foreground">
                  Update course name, code, and description
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter course name"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter course code"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                    Description
                  </label>
                  <textarea
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Enter course description"
                    rows={3}
                  />
                </div>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <p className="text-[10px] text-blue-900">
                    <strong>Note:</strong> Changes to course details will be reflected across all pages and reports.
                  </p>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSaveCourseDetails}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
