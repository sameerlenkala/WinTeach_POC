import { useState } from 'react';
import { FileText, Upload, Download, Eye, X, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const initialResources = [
  { id: 1, title: 'Lecture 1 - Introduction to DSA', course: 'Data Structures', type: 'PDF', size: '2.4 MB', status: 'Published', date: 'May 1, 2026' },
  { id: 2, title: 'Lecture 2 - Arrays and Linked Lists', course: 'Data Structures', type: 'PDF', size: '3.1 MB', status: 'Draft', date: 'May 3, 2026' },
  { id: 3, title: 'Lab Assignment 1', course: 'Data Structures', type: 'ZIP', size: '1.8 MB', status: 'Published', date: 'May 2, 2026' },
  { id: 4, title: 'Lecture 1 - OS Fundamentals', course: 'Operating Systems', type: 'PDF', size: '2.9 MB', status: 'Draft', date: 'May 4, 2026' },
];

export default function FacultyResources() {
  const [resources, setResources] = useState(initialResources);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleViewResource = (resourceId: number) => {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
      // In a real app, this would open the resource in a viewer or download it
      window.open(`/resources/${resource.id}`, '_blank');
    }
  };

  const handleDownloadResource = (resourceId: number) => {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
      // In a real app, this would trigger a download
      const link = document.createElement('a');
      link.href = `/api/resources/${resource.id}/download`;
      link.download = resource.title;
      link.click();
    }
  };

  const handleUploadResource = () => {
    if (selectedFile) {
      // In a real app, this would upload to server
      const newResource = {
        id: resources.length + 1,
        title: selectedFile.name,
        course: 'Data Structures',
        type: selectedFile.type.split('/')[1].toUpperCase(),
        size: `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`,
        status: 'Draft' as const,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      setResources([newResource, ...resources]);
      setShowUploadDialog(false);
      setSelectedFile(null);
    }
  };
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Resources</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage course materials</p>
        </div>
        <Button size="sm" onClick={() => setShowUploadDialog(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Resource
        </Button>
      </div>

      {/* Resources List */}
      <div className="space-y-3">
        {resources.map((resource) => (
          <Card key={resource.id} className="overflow-hidden cursor-pointer hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-1">{resource.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{resource.course}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-[10px]">{resource.type}</Badge>
                      <span>•</span>
                      <span>{resource.size}</span>
                      <span>•</span>
                      <span>{resource.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={resource.status === 'Published' ? 'success' : 'secondary'} className="text-[10px]">
                    {resource.status}
                  </Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleViewResource(resource.id)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDownloadResource(resource.id)}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">
                  Upload Resource
                </h3>
                <Button size="sm" variant="ghost" onClick={() => setShowUploadDialog(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Select File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                  />
                  {selectedFile && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Course
                  </label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg text-sm">
                    <option>Data Structures</option>
                    <option>Operating Systems</option>
                    <option>Database Management</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowUploadDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleUploadResource}
                    disabled={!selectedFile}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
