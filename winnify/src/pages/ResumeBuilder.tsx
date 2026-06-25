import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  CheckCircle, XCircle, AlertCircle, Lightbulb,
  Download, Share2, Plus, Mail,
  GraduationCap, Briefcase, Code, Award, Link2,
} from 'lucide-react';

/* ── Types ────────────────────────────────────────────────────── */
interface Experience {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  techStack: string[];
}

/* ── Component ────────────────────────────────────────────────── */
export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState('builder');
  const [template, setTemplate] = useState<'classic' | 'modern' | 'minimal'>('classic');
  const [saved, setSaved] = useState(false);

  /* Personal Info */
  const [fullName, setFullName] = useState('Student');
  const [location, setLocation] = useState('Hyderabad, Telangana');
  const [email, setEmail] = useState('student@university.edu');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [linkedinUrl, setLinkedinUrl] = useState('linkedin.com/in/student');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl] = useState('');
  const [summary, setSummary] = useState('Aspiring Software Developer with strong foundations in data structures, algorithms, and full-stack development. Skilled in React, Python, Node.js, and cloud technologies. Proven track record of building scalable applications and collaborating in cross-functional teams.');

  /* Education */
  const [degree, setDegree] = useState('B.Tech Computer Science');
  const [university, setUniversity] = useState('Vellore Institute of Technology');
  const [year, setYear] = useState('2022 - 2026');
  const [cgpa, setCgpa] = useState('8.2');

  /* Skills */
  const [skills, setSkills] = useState<string[]>([
    'React', 'TypeScript', 'Python', 'Node.js', 'SQL', 'Git', 'Docker', 'AWS',
  ]);
  const [newSkill, setNewSkill] = useState('');

  /* Experience */
  const [experiences, setExperiences] = useState<Experience[]>([
    { id: 1, role: 'Software Engineering Intern', company: 'TechCorp', period: 'Jun 2025 - Aug 2025', description: 'Designed and implemented RESTful APIs for the internal dashboard using Node.js and Express.\nOptimized database queries reducing response time by 35%.\nCollaborated with frontend team to integrate React components with backend services.\nWrote unit tests achieving 85% code coverage.' },
  ]);

  /* Projects */
  const [projects, setProjects] = useState<Project[]>([
    { id: 1, name: 'Winnify — Career Intelligence Platform', description: 'Built a full-stack career preparation platform with React, TypeScript, and Tailwind CSS.\nImplemented personalized learning plans with AI-powered recommendations.\nDesigned and developed 35+ interactive screens including mock test engine and resume builder.', techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'] },
    { id: 2, name: 'E-Commerce API', description: 'Developed a RESTful API for an e-commerce platform using Node.js and MongoDB.\nImplemented JWT authentication, payment integration, and order management.', techStack: ['Node.js', 'Express', 'MongoDB', 'JWT'] },
  ]);

  /* Certifications */
  const [certifications, setCertifications] = useState<string[]>([
    'AWS Cloud Practitioner',
    'DSA with Python (NPTEL)',
  ]);
  const [newCert, setNewCert] = useState('');

  /* ── Helpers ──────────────────────────────────────────────── */
  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const addExperience = () =>
    setExperiences([...experiences, { id: Date.now(), role: '', company: '', period: '', description: '' }]);

  const updateExperience = (id: number, field: keyof Experience, value: string) =>
    setExperiences(experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const addProject = () =>
    setProjects([...projects, { id: Date.now(), name: '', description: '', techStack: [] }]);

  const updateProject = (id: number, field: keyof Project, value: string | string[]) =>
    setProjects(projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)));

  const addCertification = () => {
    const trimmed = newCert.trim();
    if (trimmed && !certifications.includes(trimmed)) {
      setCertifications([...certifications, trimmed]);
      setNewCert('');
    }
  };

  const removeCertification = (cert: string) => setCertifications(certifications.filter((c) => c !== cert));

  /* ── ATS Data ─────────────────────────────────────────────── */
  const atsScore = 72;
  const sectionScores = [
    { label: 'Format & Structure', score: 85, status: 'good' as const },
    { label: 'Keyword Optimization', score: 65, status: 'bad' as const },
    { label: 'Content Quality', score: 78, status: 'ok' as const },
    { label: 'Readability', score: 82, status: 'good' as const },
    { label: 'Contact Info', score: 90, status: 'good' as const },
    { label: 'Skills Match', score: 58, status: 'bad' as const },
  ];

  const suggestions = [
    "Add more quantifiable achievements (e.g., 'Improved API response time by 40%')",
    "Include keywords: 'data structures', 'algorithms', 'system design' for SDE roles",
    "Your skills section is missing 'problem solving' and 'teamwork' — add soft skills",
    'Add a professional summary at the top (2-3 sentences)',
    'Ensure consistent date formatting throughout',
  ];

  const attemptHistory = [
    { attempt: 1, date: 'Apr 10', score: 58, status: 'First attempt' },
    { attempt: 2, date: 'Apr 15', score: 67, status: '+9% improved' },
    { attempt: 3, date: 'Apr 20', score: 72, status: '+5% improved' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="ats-review">ATS Review</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* ═══════════════ TAB 1: BUILDER ═══════════════ */}
        <TabsContent value="builder">
          <div className="space-y-5">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-primary" /> Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Location</label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Email</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><Link2 className="h-3 w-3" /> LinkedIn URL</label>
                    <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="linkedin.com/in/..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><Code className="h-3 w-3" /> GitHub URL</label>
                    <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="github.com/..." />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Professional Summary</label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="2-3 sentences about your experience and goals..."
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary transition-colors min-h-[80px] resize-y"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-primary" /> Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Degree</label>
                    <Input value={degree} onChange={(e) => setDegree(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">University</label>
                    <Input value={university} onChange={(e) => setUniversity(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Year</label>
                    <Input value={year} onChange={(e) => setYear(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">CGPA</label>
                    <Input value={cgpa} onChange={(e) => setCgpa(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Code className="h-4 w-4 text-primary" /> Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="default" className="gap-1.5 cursor-pointer" onClick={() => removeSkill(skill)}>
                      {skill}
                      <XCircle className="h-3 w-3 opacity-60 hover:opacity-100" />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    className="max-w-xs"
                  />
                  <Button size="sm" variant="outline" onClick={addSkill}>
                    <Plus className="h-3.5 w-3.5" /> Add Skill
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-primary" /> Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {experiences.map((exp, idx) => (
                  <div key={exp.id} className="space-y-3">
                    {idx > 0 && <Separator />}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Role</label>
                        <Input value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} placeholder="Job title" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Company</label>
                        <Input value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} placeholder="Company name" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Period</label>
                        <Input value={exp.period} onChange={(e) => updateExperience(exp.id, 'period', e.target.value)} placeholder="Jun 2025 - Aug 2025" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        placeholder="Describe your responsibilities and achievements..."
                        className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary transition-colors min-h-[80px] resize-y"
                      />
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={addExperience}>
                  <Plus className="h-3.5 w-3.5" /> Add Experience
                </Button>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Code className="h-4 w-4 text-primary" /> Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={proj.id} className="space-y-3">
                    {idx > 0 && <Separator />}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Project Name</label>
                      <Input value={proj.name} onChange={(e) => updateProject(proj.id, 'name', e.target.value)} placeholder="Project name" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Description</label>
                      <textarea
                        value={proj.description}
                        onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                        placeholder="Describe the project, your role, and impact..."
                        className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary transition-colors min-h-[80px] resize-y"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Tech Stack</label>
                      <div className="flex flex-wrap gap-1.5">
                        {proj.techStack.map((tech) => (
                          <Badge key={tech} variant="info" className="text-[10px]">{tech}</Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add tech (press Enter)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val && !proj.techStack.includes(val)) {
                              updateProject(proj.id, 'techStack', [...proj.techStack, val]);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                        className="max-w-xs"
                      />
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={addProject}>
                  <Plus className="h-3.5 w-3.5" /> Add Project
                </Button>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-primary" /> Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert) => (
                    <Badge key={cert} variant="success" className="gap-1.5 cursor-pointer" onClick={() => removeCertification(cert)}>
                      {cert}
                      <XCircle className="h-3 w-3 opacity-60 hover:opacity-100" />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    placeholder="Add a certification..."
                    onKeyDown={(e) => e.key === 'Enter' && addCertification()}
                    className="max-w-xs"
                  />
                  <Button size="sm" variant="outline" onClick={addCertification}>
                    <Plus className="h-3.5 w-3.5" /> Add Certification
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            {saved && (
              <div className="flex items-center gap-2 rounded-lg bg-w-green/10 border border-w-green/20 px-4 py-3 text-sm font-medium text-w-green">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Resume saved successfully
              </div>
            )}
            <Button size="lg" className="w-full" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}>
              Save Resume
            </Button>
          </div>
        </TabsContent>

        {/* ═══════════════ TAB 2: ATS REVIEW ═══════════════ */}
        <TabsContent value="ats-review">
          <div className="space-y-5">
            {/* Overall ATS Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>Overall ATS Score</span>
                  <Badge variant={atsScore >= 80 ? 'success' : 'warning'}>
                    {atsScore >= 80 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-extrabold font-[family-name:var(--font-heading)] text-foreground">{atsScore}</span>
                  <span className="text-lg text-muted-foreground font-semibold mb-1">/100</span>
                </div>
                <Progress value={atsScore} indicatorColor={atsScore >= 80 ? '#88B033' : '#ED9035'} className="h-3" />
              </CardContent>
            </Card>

            {/* Section Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Section Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sectionScores.map((section) => (
                  <div key={section.label} className="flex items-center gap-3">
                    <span className="text-sm w-44 shrink-0">{section.label}</span>
                    <Progress
                      value={section.score}
                      indicatorColor={section.status === 'good' ? '#88B033' : section.status === 'bad' ? '#F2353C' : '#ED9035'}
                      className="flex-1 h-2"
                    />
                    <span className={cn(
                      'text-xs font-bold w-10 text-right',
                      section.status === 'good' ? 'text-w-green' : section.status === 'bad' ? 'text-w-red' : 'text-w-orange',
                    )}>
                      {section.score}%
                    </span>
                    <span className="w-5 shrink-0">
                      {section.status === 'good' && <CheckCircle className="h-4 w-4 text-w-green" />}
                      {section.status === 'bad' && <XCircle className="h-4 w-4 text-w-red" />}
                      {section.status === 'ok' && <AlertCircle className="h-4 w-4 text-w-orange" />}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Lightbulb className="h-4 w-4 text-w-amber" /> AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-muted-foreground">{suggestion}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Attempt History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Attempt History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {/* Header row */}
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span className="w-16">Attempt</span>
                    <span className="w-20">Date</span>
                    <span className="w-16 text-right">Score</span>
                    <span className="flex-1">Status</span>
                  </div>
                  {attemptHistory.map((a) => (
                    <div key={a.attempt} className="flex items-center gap-3 text-sm">
                      <span className="w-16 font-semibold font-[family-name:var(--font-heading)]">#{a.attempt}</span>
                      <span className="w-20 text-muted-foreground">{a.date}</span>
                      <span className="w-16 text-right font-bold">{a.score}%</span>
                      <span className="flex-1">
                        <Badge variant={a.status.includes('improved') ? 'success' : 'secondary'} className="text-[10px]">
                          {a.status}
                        </Badge>
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>Verification Status</span>
                  <Badge variant={atsScore >= 80 ? 'success' : 'warning'}>Resume Reviewed</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Reviewer</p>
                    <p className="font-semibold">AI Resume Analyzer</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Last Reviewed</p>
                    <p className="font-semibold">Apr 20, 2026</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Target Score</p>
                    <p className="font-semibold">85%</p>
                  </div>
                </div>
                <Separator />
                <p className="text-sm text-muted-foreground">
                  Your resume needs improvement in keyword optimization and skills matching. Target score: 85%
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════════════ TAB 3: PREVIEW ═══════════════ */}
        <TabsContent value="preview">
          <div className="space-y-5">
            {/* Template Selector */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold font-[family-name:var(--font-heading)]">Choose Template</h2>
              <div className="flex gap-2">
                {(['classic', 'modern', 'minimal'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTemplate(t)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-semibold font-[family-name:var(--font-heading)] border transition-all cursor-pointer capitalize',
                      template === t
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* A4 Resume Page */}
            <div className="flex justify-center">
              <div
                className="bg-white shadow-xl border border-border/40 overflow-hidden"
                style={{ width: '210mm', maxWidth: '100%', minHeight: '297mm', fontFamily: template === 'modern' ? 'var(--font-heading)' : template === 'minimal' ? 'var(--font-body)' : 'Georgia, serif' }}
              >
                {/* ── CLASSIC TEMPLATE ─────────────────────────── */}
                {template === 'classic' && (
                  <div style={{ padding: '48px 56px', color: '#1a1a1a', fontSize: '11px', lineHeight: '1.5' }}>
                    {/* Name */}
                    <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                      <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#D4574A', margin: 0, letterSpacing: '0.5px' }}>
                        {fullName || 'Your Name'}
                      </h1>
                    </div>

                    {/* Contact line */}
                    <div style={{ textAlign: 'center', fontSize: '10.5px', color: '#444', marginBottom: '20px' }}>
                      {[location, phone, email, linkedinUrl].filter(Boolean).join(' • ')}
                    </div>

                    {/* Professional Summary */}
                    {summary && (
                      <div style={{ marginBottom: '18px' }}>
                        <h2 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>Professional Summary</h2>
                        <p style={{ fontSize: '11px', color: '#333', lineHeight: '1.6' }}>{summary}</p>
                      </div>
                    )}

                    {/* Work Experience */}
                    {experiences.some(e => e.role) && (
                      <div style={{ marginBottom: '18px' }}>
                        <h2 style={{ fontSize: '11px', fontWeight: 700, color: '#D4574A', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
                          Work Experience
                        </h2>
                        {experiences.map((exp) => (
                          <div key={exp.id} style={{ marginBottom: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <div>
                                <span style={{ fontSize: '12px', fontWeight: 700 }}>{exp.company || 'Company'}</span>
                                <span style={{ fontSize: '11px', color: '#444', marginLeft: '8px' }}>{exp.period}</span>
                              </div>
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                              {exp.role || 'Role'} • Full-time
                            </div>
                            {exp.description && (
                              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                {exp.description.split('\n').filter(Boolean).map((line, i) => (
                                  <li key={i} style={{ fontSize: '10.5px', color: '#333', lineHeight: '1.55', marginBottom: '2px', listStyleType: 'disc' }}>
                                    {line}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Education */}
                    <div style={{ marginBottom: '18px' }}>
                      <h2 style={{ fontSize: '11px', fontWeight: 700, color: '#D4574A', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
                        Education
                      </h2>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: 700, margin: 0 }}>{degree}</p>
                          <p style={{ fontSize: '10.5px', color: '#444', margin: 0 }}>{university}</p>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '10.5px', color: '#444' }}>
                          <p style={{ margin: 0 }}>{year}</p>
                          <p style={{ margin: 0, fontWeight: 600 }}>CGPA: {cgpa}</p>
                        </div>
                      </div>
                    </div>

                    {/* Projects */}
                    {projects.some(p => p.name) && (
                      <div style={{ marginBottom: '18px' }}>
                        <h2 style={{ fontSize: '11px', fontWeight: 700, color: '#D4574A', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
                          Projects
                        </h2>
                        {projects.map((proj) => (
                          <div key={proj.id} style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700 }}>{proj.name}</span>
                            </div>
                            {proj.techStack.length > 0 && (
                              <p style={{ fontSize: '10px', color: '#666', margin: '2px 0 4px', fontStyle: 'italic' }}>
                                {proj.techStack.join(', ')}
                              </p>
                            )}
                            {proj.description && (
                              <ul style={{ margin: '2px 0 0 16px', padding: 0 }}>
                                {proj.description.split('\n').filter(Boolean).map((line, i) => (
                                  <li key={i} style={{ fontSize: '10.5px', color: '#333', lineHeight: '1.55', marginBottom: '2px', listStyleType: 'disc' }}>
                                    {line}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Skills */}
                    <div style={{ marginBottom: '18px' }}>
                      <h2 style={{ fontSize: '11px', fontWeight: 700, color: '#D4574A', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
                        Skills
                      </h2>
                      <p style={{ fontSize: '10.5px', color: '#333', lineHeight: '1.7' }}>
                        <span style={{ fontWeight: 700 }}>Technical:</span> {skills.join(', ')}
                      </p>
                    </div>

                    {/* Certifications */}
                    {certifications.length > 0 && (
                      <div>
                        <h2 style={{ fontSize: '11px', fontWeight: 700, color: '#D4574A', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
                          Certifications
                        </h2>
                        <ul style={{ margin: '0 0 0 16px', padding: 0 }}>
                          {certifications.map((cert) => (
                            <li key={cert} style={{ fontSize: '10.5px', color: '#333', marginBottom: '2px', listStyleType: 'disc' }}>
                              {cert}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* ── MODERN TEMPLATE ──────────────────────────── */}
                {template === 'modern' && (
                  <div className="flex min-h-[297mm]">
                    {/* Left sidebar */}
                    <div className="w-[72mm] p-6 text-white" style={{ background: '#5B4BDB' }}>
                      {/* Avatar placeholder */}
                      <div className="w-20 h-20 rounded-full bg-white/20 mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                        {(fullName || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>

                      {/* Contact */}
                      <div className="mb-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3 opacity-70">Contact</h3>
                        <div className="space-y-2 text-xs opacity-90">
                          {email && <p>{email}</p>}
                          {phone && <p>{phone}</p>}
                          {linkedinUrl && <p>LinkedIn</p>}
                          {githubUrl && <p>GitHub</p>}
                          {portfolioUrl && <p>Portfolio</p>}
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mb-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3 opacity-70">Skills</h3>
                        <div className="space-y-1.5">
                          {skills.map((skill) => (
                            <div key={skill}>
                              <p className="text-xs mb-0.5">{skill}</p>
                              <div className="h-1 rounded-full bg-white/20">
                                <div className="h-full rounded-full bg-white/70" style={{ width: `${60 + Math.random() * 35}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certifications */}
                      {certifications.length > 0 && (
                        <div>
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3 opacity-70">Certifications</h3>
                          <ul className="text-xs space-y-1.5 opacity-90">
                            {certifications.map((cert) => (
                              <li key={cert}>• {cert}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Right content */}
                    <div className="flex-1 p-8">
                      <h1 className="text-3xl font-extrabold mb-1" style={{ color: '#5B4BDB' }}>
                        {fullName || 'Your Name'}
                      </h1>
                      <p className="text-sm mb-6" style={{ color: '#888' }}>{degree} · {university}</p>

                      {/* Education */}
                      <div className="mb-6">
                        <h2 className="text-xs font-bold uppercase tracking-[0.15em] mb-3 pb-1 border-b-2" style={{ color: '#5B4BDB', borderColor: '#5B4BDB' }}>Education</h2>
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm font-semibold">{degree}</p>
                            <p className="text-xs" style={{ color: '#666' }}>{university}</p>
                          </div>
                          <div className="text-right text-xs" style={{ color: '#666' }}>
                            <p>{year}</p>
                            <p className="font-semibold">CGPA: {cgpa}</p>
                          </div>
                        </div>
                      </div>

                      {/* Experience */}
                      {experiences.some(e => e.role) && (
                        <div className="mb-6">
                          <h2 className="text-xs font-bold uppercase tracking-[0.15em] mb-3 pb-1 border-b-2" style={{ color: '#5B4BDB', borderColor: '#5B4BDB' }}>Experience</h2>
                          {experiences.map((exp) => (
                            <div key={exp.id} className="mb-3">
                              <div className="flex justify-between">
                                <p className="text-sm font-semibold">{exp.role} <span className="font-normal" style={{ color: '#666' }}>at {exp.company}</span></p>
                                <p className="text-xs shrink-0" style={{ color: '#888' }}>{exp.period}</p>
                              </div>
                              {exp.description && <p className="text-xs mt-1 leading-relaxed" style={{ color: '#555' }}>{exp.description}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Projects */}
                      {projects.some(p => p.name) && (
                        <div className="mb-6">
                          <h2 className="text-xs font-bold uppercase tracking-[0.15em] mb-3 pb-1 border-b-2" style={{ color: '#5B4BDB', borderColor: '#5B4BDB' }}>Projects</h2>
                          {projects.map((proj) => (
                            <div key={proj.id} className="mb-3">
                              <p className="text-sm font-semibold">{proj.name}</p>
                              {proj.description && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#555' }}>{proj.description}</p>}
                              {proj.techStack.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {proj.techStack.map((tech) => (
                                    <span key={tech} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#5B4BDB15', color: '#5B4BDB' }}>{tech}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── MINIMAL TEMPLATE ─────────────────────────── */}
                {template === 'minimal' && (
                  <div className="p-10">
                    {/* Header */}
                    <div className="mb-8">
                      <h1 className="text-3xl font-light tracking-wide" style={{ color: '#1a1a1a' }}>
                        {fullName || 'Your Name'}
                      </h1>
                      <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: '#999' }}>
                        {email && <span>{email}</span>}
                        {phone && <><span>·</span><span>{phone}</span></>}
                        {linkedinUrl && <><span>·</span><span>LinkedIn</span></>}
                        {githubUrl && <><span>·</span><span>GitHub</span></>}
                      </div>
                    </div>

                    {/* Education */}
                    <div className="mb-6">
                      <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: '#999' }}>Education</h2>
                      <p className="text-sm">{degree}</p>
                      <p className="text-xs" style={{ color: '#777' }}>{university} · {year} · CGPA: {cgpa}</p>
                    </div>

                    {/* Skills */}
                    <div className="mb-6">
                      <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: '#999' }}>Skills</h2>
                      <p className="text-xs leading-relaxed" style={{ color: '#444' }}>{skills.join(', ')}</p>
                    </div>

                    {/* Experience */}
                    {experiences.some(e => e.role) && (
                      <div className="mb-6">
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: '#999' }}>Experience</h2>
                        {experiences.map((exp) => (
                          <div key={exp.id} className="mb-4">
                            <div className="flex justify-between items-baseline">
                              <p className="text-sm"><span className="font-semibold">{exp.role}</span> — {exp.company}</p>
                              <p className="text-xs shrink-0" style={{ color: '#999' }}>{exp.period}</p>
                            </div>
                            {exp.description && <p className="text-xs mt-1 leading-relaxed" style={{ color: '#555' }}>{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Projects */}
                    {projects.some(p => p.name) && (
                      <div className="mb-6">
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: '#999' }}>Projects</h2>
                        {projects.map((proj) => (
                          <div key={proj.id} className="mb-4">
                            <p className="text-sm font-semibold">{proj.name}</p>
                            {proj.description && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#555' }}>{proj.description}</p>}
                            {proj.techStack.length > 0 && (
                              <p className="text-xs mt-1" style={{ color: '#888' }}>{proj.techStack.join(' · ')}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                      <div>
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: '#999' }}>Certifications</h2>
                        {certifications.map((cert) => (
                          <p key={cert} className="text-xs mb-1" style={{ color: '#444' }}>{cert}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button size="lg" variant="outline" className="flex-1" disabled>
                <Download className="h-4 w-4" /> Download PDF
              </Button>
              <Button size="lg" variant="outline" className="flex-1" disabled>
                <Share2 className="h-4 w-4" /> Share Resume
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}