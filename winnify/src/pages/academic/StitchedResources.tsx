import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, Presentation, BookOpen, Download, Eye, Layers, Zap, MessageSquare, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function StitchedResources() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const location = useLocation();
  const topic = location.state?.topic;

  const [activeTab, setActiveTab] = useState<'notes' | 'slides' | 'student-notes' | 'additional'>('notes');

  // Mock stitched content (in real app, fetch from backend)
  const stitchedContent = {
    notes: `# ${topic?.name || 'Topic'} - Comprehensive Faculty Notes

## Overview
This document contains comprehensive notes combining all lectures for this topic.

## Lecture 1: Introduction
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Key Concepts
- Concept 1: Definition and explanation
- Concept 2: Applications and use cases
- Concept 3: Implementation details

### Code Examples
\`\`\`python
def example_function():
    # Implementation
    pass
\`\`\`

## Lecture 2: Advanced Topics
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

### Important Points
1. Point one with detailed explanation
2. Point two with examples
3. Point three with applications

## Lecture 3: Practical Applications
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

### Real-world Examples
- Example 1: Industry application
- Example 2: Research application
- Example 3: Academic application

## Summary
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Practice Problems
1. Problem 1: Basic level
2. Problem 2: Intermediate level
3. Problem 3: Advanced level

## References
- Reference 1
- Reference 2
- Reference 3`,
    slides: `Slide 1: ${topic?.name || 'Topic'} - Introduction
- Overview of the topic
- Learning objectives
- Prerequisites

Slide 2: Key Concepts
- Concept 1
- Concept 2
- Concept 3

Slide 3: Detailed Explanation
- In-depth coverage
- Examples
- Diagrams

Slide 4: Applications
- Real-world use cases
- Industry examples
- Research applications

Slide 5: Summary
- Key takeaways
- Next steps
- Resources`,
    studentNotes: `# ${topic?.name || 'Topic'} - Student Notes

## Quick Summary
Simplified notes for easy understanding and revision.

## Main Topics Covered
1. Introduction to the concept
2. Core principles
3. Practical applications

## Key Points to Remember
- Point 1: Easy explanation
- Point 2: Simple example
- Point 3: Quick reference

## Practice Questions
1. Question 1
2. Question 2
3. Question 3

## Tips for Exam
- Tip 1
- Tip 2
- Tip 3`,
    additional: `# Additional Resources for ${topic?.name || 'Topic'}

## Video Tutorials
- Video 1: Introduction (15 mins)
- Video 2: Advanced concepts (20 mins)
- Video 3: Practical demo (25 mins)

## External Links
- Link 1: Official documentation
- Link 2: Tutorial website
- Link 3: Research papers

## Code Repositories
- Repository 1: Sample implementations
- Repository 2: Practice problems
- Repository 3: Project templates

## Recommended Reading
- Book 1: Comprehensive guide
- Book 2: Advanced topics
- Article 1: Latest research`,
  };

  const resources = [
    {
      id: 'notes',
      title: 'Faculty Notes',
      description: 'Comprehensive notes combining all lectures',
      icon: FileText,
      color: 'blue',
      content: stitchedContent.notes,
    },
    {
      id: 'slides',
      title: 'Presentation Slides',
      description: 'Combined slides for all lectures',
      icon: Presentation,
      color: 'purple',
      content: stitchedContent.slides,
    },
    {
      id: 'student-notes',
      title: 'Student Notes',
      description: 'Simplified notes for students',
      icon: BookOpen,
      color: 'green',
      content: stitchedContent.studentNotes,
    },
    {
      id: 'additional',
      title: 'Additional Resources',
      description: 'Supplementary materials and references',
      icon: Layers,
      color: 'indigo',
      content: stitchedContent.additional,
    },
  ];

  const activeResource = resources.find(r => r.id === activeTab);

  const handleDownload = (resourceId: string) => {
    alert(`Downloading ${resources.find(r => r.id === resourceId)?.title}...`);
  };

  const handlePreview = (resourceId: string) => {
    alert(`Opening ${resources.find(r => r.id === resourceId)?.title} in new tab...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Topic View
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
              Stitched Resources
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {topic?.name || 'Topic'} • Comprehensive materials from all lectures
            </p>
          </div>
          <Badge variant="success">
            <CheckCircle className="h-3 w-3 mr-1" />
            Published
          </Badge>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900">
              <strong>Stitched Resources:</strong> These materials combine content from all lectures in this topic, 
              providing a comprehensive view for better understanding and revision.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Resource List */}
          <div className="lg:col-span-1 space-y-3">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-3">
                  Available Resources
                </h3>
                <div className="space-y-2">
                  {resources.map((resource) => {
                    const Icon = resource.icon;
                    const isActive = activeTab === resource.id;
                    
                    return (
                      <button
                        key={resource.id}
                        onClick={() => setActiveTab(resource.id as any)}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
                          isActive
                            ? `bg-${resource.color}-50 border border-${resource.color}-200`
                            : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          isActive
                            ? `bg-${resource.color}-100 text-${resource.color}-600`
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{resource.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {resource.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate(`/academic/faculty/topic/${topicId}/flashcards`)}
                  >
                    <Zap className="h-3 w-3 mr-2" />
                    Flash Cards
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => alert('Opening WinSpeak Interview Questions...')}
                  >
                    <MessageSquare className="h-3 w-3 mr-2" />
                    Interview Questions
                  </Button>
                  <Separator className="my-2" />
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleDownload('all')}
                  >
                    <Download className="h-3 w-3 mr-2" />
                    Download All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Topic Info */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-3">
                  Topic Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Lectures</p>
                    <p className="font-medium">{topic?.totalLectures || 0} lectures</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground">Subtopics</p>
                    <p className="font-medium">{topic?.subtopics?.length || 0} subtopics</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant="success" className="mt-1">Published</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                {/* Resource Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {activeResource && (
                      <>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${activeResource.color}-100 text-${activeResource.color}-600`}>
                          <activeResource.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)]">
                            {activeResource.title}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {activeResource.description}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handlePreview(activeTab)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" onClick={() => handleDownload(activeTab)}>
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>

                <Separator className="mb-6" />

                {/* Content Preview */}
                <div className="bg-muted/30 rounded-lg p-6 max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {activeResource?.content}
                  </pre>
                </div>

                {/* Content Stats */}
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {topic?.totalLectures || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Lectures Combined</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">
                        {Math.floor(Math.random() * 50) + 20}
                      </p>
                      <p className="text-xs text-muted-foreground">Pages</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {Math.floor(Math.random() * 30) + 10}
                      </p>
                      <p className="text-xs text-muted-foreground">Key Concepts</p>
                    </div>
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
