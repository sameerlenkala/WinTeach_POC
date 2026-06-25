import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, Presentation, BookOpen, HelpCircle, FolderPlus, CheckCircle, Upload, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type ResourceType = 'faculty-notes' | 'slides' | 'student-notes' | 'quiz' | 'additional';

interface ResourceData {
  type: ResourceType;
  title: string;
  status: string;
  content: string;
  generatedBy: 'AI' | 'Faculty';
  version: number;
  lastModified: string;
}

export default function ResourceReviewPanel() {
  const navigate = useNavigate();
  const { lectureId, resourceType } = useParams();
  const location = useLocation();
  const lectureData = location.state?.lecture;

  const resourceIcons: Record<ResourceType, any> = {
    'faculty-notes': FileText,
    'slides': Presentation,
    'student-notes': BookOpen,
    'quiz': HelpCircle,
    'additional': FolderPlus,
  };

  // Mock resource data (in real app, fetch from backend)
  const [resource, setResource] = useState<ResourceData>({
    type: resourceType as ResourceType,
    title: resourceType === 'faculty-notes' ? 'Faculty Notes' :
           resourceType === 'slides' ? 'Presentation Slides' :
           resourceType === 'student-notes' ? 'Student Notes' :
           resourceType === 'quiz' ? 'Student Quiz' :
           'Additional Resources',
    status: 'Not Reviewed',
    content: `# ${lectureData?.title || 'Lecture'} - ${resourceType}\n\n## Overview\n\nThis is AI-generated content for the lecture.\n\n## Key Points\n\n1. Introduction to the topic\n2. Core concepts and definitions\n3. Practical examples\n4. Summary and takeaways\n\n## Detailed Content\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n### Section 1\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\n### Section 2\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\n### Section 3\n\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
    generatedBy: 'AI',
    version: 1,
    lastModified: new Date().toISOString(),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(resource.content);
  const [reviewNotes, setReviewNotes] = useState('');

  const Icon = resourceIcons[resource.type];

  const handleApprove = () => {
    setResource(prev => ({ ...prev, status: 'Reviewed' }));
    alert('Resource approved and marked as reviewed!');
  };

  const handlePublish = () => {
    setResource(prev => ({ ...prev, status: 'Published' }));
    alert('Resource published to students!');
    navigate(`/academic/faculty/lecture/${lectureId}`);
  };

  const handleSaveEdits = () => {
    setResource(prev => ({
      ...prev,
      content: editedContent,
      version: prev.version + 1,
      lastModified: new Date().toISOString(),
      generatedBy: 'Faculty',
    }));
    setIsEditing(false);
    alert('Changes saved successfully!');
  };

  const handleReplace = () => {
    // In real app, open file upload dialog
    alert('Upload your custom file to replace this resource');
  };

  const handleDownload = () => {
    // In real app, trigger file download
    alert('Downloading resource...');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      alert('Resource deleted');
      navigate(`/academic/faculty/lecture/${lectureId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lecture
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Review Resource</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {lectureData?.title || 'Lecture'} • {resource.title}
            </p>
          </div>
          <Badge variant={
            resource.status === 'Published' ? 'success' :
            resource.status === 'Reviewed' ? 'default' :
            'warning'
          }>
            {resource.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resource Info */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)]">
                      {resource.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Version {resource.version} • Generated by {resource.generatedBy} • 
                      Last modified {new Date(resource.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Content Preview/Edit */}
                {isEditing ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">Edit Content</label>
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      rows={20}
                      className="w-full px-4 py-3 border border-border rounded-lg font-mono text-sm"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdits}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setEditedContent(resource.content);
                        setIsEditing(false);
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium">Content Preview</label>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm font-mono">{resource.content}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review Notes */}
            {resource.status === 'Not Reviewed' && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-3">
                    Review Notes (Optional)
                  </h3>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-border rounded-lg"
                    placeholder="Add any notes about this resource review..."
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardContent className="p-5">
                <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-4">
                  Actions
                </h3>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleReplace}>
                    <Upload className="h-4 w-4 mr-2" />
                    Replace with Custom File
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => alert('Preview in new tab')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Separator className="my-2" />
                  <Button className="w-full justify-start" variant="destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Resource
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Review Actions */}
            <Card>
              <CardContent className="p-5">
                <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-4">
                  Review Status
                </h3>
                <div className="space-y-3">
                  {resource.status === 'Not Reviewed' && (
                    <>
                      <Button className="w-full" onClick={handleApprove}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve & Mark Reviewed
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Review the content and approve it before publishing to students
                      </p>
                    </>
                  )}
                  
                  {resource.status === 'Reviewed' && (
                    <>
                      <Button className="w-full" onClick={handlePublish}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Publish to Students
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Students will be notified and can access this resource
                      </p>
                    </>
                  )}
                  
                  {resource.status === 'Published' && (
                    <>
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-semibold text-green-900">Published</p>
                          <p className="text-xs text-green-700">Students can access this resource</p>
                        </div>
                      </div>
                      <Button className="w-full" variant="outline" onClick={() => setResource(prev => ({ ...prev, status: 'Reviewed' }))}>
                        Unpublish
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resource Info */}
            <Card>
              <CardContent className="p-5">
                <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-4">
                  Resource Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">{resource.title}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground">Generated By</p>
                    <p className="font-medium">{resource.generatedBy}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground">Version</p>
                    <p className="font-medium">v{resource.version}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground">Last Modified</p>
                    <p className="font-medium">
                      {new Date(resource.lastModified).toLocaleString()}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground">Lecture</p>
                    <p className="font-medium">{lectureData?.title || 'Unknown'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
