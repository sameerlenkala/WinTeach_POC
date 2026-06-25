import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ArrowLeft, Settings as SettingsIcon, CheckCircle, AlertTriangle,
  User, Bell, Palette, Shield, Camera, Trash2, Download,
  Globe, Monitor, Sun, Smartphone,
} from 'lucide-react';
import { GitHubIcon } from '@/components/common/SocialIcons';

/* ── Toggle Switch ────────────────────────────────────────────── */
function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 pr-4">
        <p className="text-sm font-semibold">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 ${
          checked ? 'bg-w-green' : 'bg-gray-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          } mt-0.5`}
        />
      </button>
    </div>
  );
}

/* ── Success Message ──────────────────────────────────────────── */
function SuccessMessage({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="flex items-center gap-2 rounded-lg bg-w-green/10 border border-w-green/20 px-4 py-3 text-sm font-medium text-w-green">
      <CheckCircle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

/* ── Account Tab ──────────────────────────────────────────────── */
function AccountTab() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('Vellore Institute of Technology');
  const [degree, setDegree] = useState('B.Tech Computer Science');
  const [gradYear, setGradYear] = useState('2026');
  const [careerGoal, setCareerGoal] = useState('SDE at Product Company');
  const [successMsg, setSuccessMsg] = useState('');
  const [photoMsg, setPhotoMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const dismissSuccess = useCallback(() => setSuccessMsg(''), []);
  const dismissPhoto = useCallback(() => setPhotoMsg(''), []);

  return (
    <div className="space-y-6">
      {successMsg && <SuccessMessage message={successMsg} onDismiss={dismissSuccess} />}
      {photoMsg && <SuccessMessage message={photoMsg} onDismiss={dismissPhoto} />}

      {/* Profile Photo */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary font-[family-name:var(--font-heading)]">
              {initials}
            </div>
            <div>
              <p className="text-sm font-bold font-[family-name:var(--font-heading)]">{user?.name}</p>
              <p className="text-xs text-muted-foreground mb-2">{user?.email}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPhotoMsg('Photo updated')}
              >
                <Camera className="h-3.5 w-3.5" />
                Change Photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Phone</label>
              <Input type="tel" placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">University</label>
              <Input value={university} onChange={(e) => setUniversity(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Degree</label>
              <Input value={degree} onChange={(e) => setDegree(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Graduation Year</label>
              <Input value={gradYear} onChange={(e) => setGradYear(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Career Goal</label>
            <select
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary transition-colors"
            >
              <option>SDE at Product Company</option>
              <option>Data Scientist</option>
              <option>ML Engineer</option>
              <option>Full Stack Developer</option>
              <option>DevOps Engineer</option>
              <option>Other</option>
            </select>
          </div>

          <div className="pt-2">
            <Button onClick={() => setSuccessMsg('Profile updated successfully')}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions for your account</CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/5" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          ) : (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
              <p className="text-sm font-semibold text-destructive">Are you sure? This action cannot be undone.</p>
              <p className="text-xs text-muted-foreground">All your data, progress, and achievements will be permanently deleted.</p>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                <Button size="sm" variant="destructive">Delete</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Notifications Tab ────────────────────────────────────────── */
function NotificationsTab() {
  const [emailDrive, setEmailDrive] = useState(true);
  const [emailAssessment, setEmailAssessment] = useState(true);
  const [emailWinSpeak, setEmailWinSpeak] = useState(true);
  const [emailWeekly, setEmailWeekly] = useState(true);
  const [emailMarketing, setEmailMarketing] = useState(false);

  const [pushDrive, setPushDrive] = useState(true);
  const [pushDeadline, setPushDeadline] = useState(true);
  const [pushScore, setPushScore] = useState(false);
  const [pushLeaderboard, setPushLeaderboard] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const dismissSuccess = useCallback(() => setSuccessMsg(''), []);

  return (
    <div className="space-y-6">
      {successMsg && <SuccessMessage message={successMsg} onDismiss={dismissSuccess} />}

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Choose what emails you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <Toggle checked={emailDrive} onChange={() => setEmailDrive(!emailDrive)} label="Drive updates" description="Get notified about new placement drives" />
          <Separator />
          <Toggle checked={emailAssessment} onChange={() => setEmailAssessment(!emailAssessment)} label="Assessment reminders" description="Reminders for upcoming assessments" />
          <Separator />
          <Toggle checked={emailWinSpeak} onChange={() => setEmailWinSpeak(!emailWinSpeak)} label="WinSpeak challenge alerts" description="New speaking challenges and results" />
          <Separator />
          <Toggle checked={emailWeekly} onChange={() => setEmailWeekly(!emailWeekly)} label="Weekly progress report" description="Summary of your weekly activity" />
          <Separator />
          <Toggle checked={emailMarketing} onChange={() => setEmailMarketing(!emailMarketing)} label="Marketing & promotions" description="Product updates and special offers" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>Manage your push notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <Toggle checked={pushDrive} onChange={() => setPushDrive(!pushDrive)} label="New drive announcements" description="Instant alerts for new drives" />
          <Separator />
          <Toggle checked={pushDeadline} onChange={() => setPushDeadline(!pushDeadline)} label="Deadline reminders" description="Don't miss important deadlines" />
          <Separator />
          <Toggle checked={pushScore} onChange={() => setPushScore(!pushScore)} label="Score updates" description="When your scores are calculated" />
          <Separator />
          <Toggle checked={pushLeaderboard} onChange={() => setPushLeaderboard(!pushLeaderboard)} label="Leaderboard changes" description="When your ranking changes" />
        </CardContent>
      </Card>

      <Button onClick={() => setSuccessMsg('Notification preferences saved')}>
        Save Preferences
      </Button>
    </div>
  );
}

/* ── Appearance Tab ───────────────────────────────────────────── */
function AppearanceTab() {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  const [compactSidebar, setCompactSidebar] = useState(false);
  const [language, setLanguage] = useState('English');
  const [successMsg, setSuccessMsg] = useState('');
  const dismissSuccess = useCallback(() => setSuccessMsg(''), []);

  const themes = [
    { id: 'light', label: 'Light', icon: Sun, disabled: false },
    { id: 'dark', label: 'Dark', icon: Monitor, disabled: true },
    { id: 'system', label: 'System', icon: Smartphone, disabled: true },
  ];

  const fontSizes = [
    { id: 'small', label: 'Small' },
    { id: 'medium', label: 'Medium' },
    { id: 'large', label: 'Large' },
  ];

  return (
    <div className="space-y-6">
      {successMsg && <SuccessMessage message={successMsg} onDismiss={dismissSuccess} />}

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Select your preferred theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => !t.disabled && setTheme(t.id)}
                disabled={t.disabled}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all cursor-pointer ${
                  theme === t.id
                    ? 'border-primary bg-primary/5'
                    : t.disabled
                    ? 'border-border bg-muted/50 opacity-60 cursor-not-allowed'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                {t.disabled && (
                  <Badge variant="secondary" className="absolute -top-2 right-1 text-[10px]">
                    Coming Soon
                  </Badge>
                )}
                <t.icon className={`h-6 w-6 ${theme === t.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-semibold ${theme === t.id ? 'text-primary' : 'text-foreground'}`}>{t.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Font Size</CardTitle>
          <CardDescription>Adjust the text size across the app</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {fontSizes.map((f) => (
              <button
                key={f.id}
                onClick={() => setFontSize(f.id)}
                className={`flex items-center justify-center rounded-xl border-2 py-3 px-4 text-sm font-semibold transition-all cursor-pointer ${
                  fontSize === f.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layout</CardTitle>
          <CardDescription>Customize the app layout</CardDescription>
        </CardHeader>
        <CardContent>
          <Toggle checked={compactSidebar} onChange={() => setCompactSidebar(!compactSidebar)} label="Compact sidebar" description="Use a narrower sidebar with icons only" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Language</CardTitle>
          <CardDescription>Choose your preferred language</CardDescription>
        </CardHeader>
        <CardContent>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="flex h-10 w-full max-w-xs rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary transition-colors"
          >
            <option>English</option>
            <option>Hindi</option>
            <option>Telugu</option>
            <option>Tamil</option>
            <option>Kannada</option>
          </select>
        </CardContent>
      </Card>

      <Button onClick={() => setSuccessMsg('Appearance preferences saved')}>
        Save Preferences
      </Button>
    </div>
  );
}

/* ── Privacy Tab ──────────────────────────────────────────────── */
function PrivacyTab() {
  const [profilePublic, setProfilePublic] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const dismissSuccess = useCallback(() => setSuccessMsg(''), []);

  return (
    <div className="space-y-6">
      {successMsg && <SuccessMessage message={successMsg} onDismiss={dismissSuccess} />}

      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>Control who can see your information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <Toggle checked={profilePublic} onChange={() => setProfilePublic(!profilePublic)} label="Make profile public" description="Allow other students to view your profile" />
          <Separator />
          <Toggle checked={showLeaderboard} onChange={() => setShowLeaderboard(!showLeaderboard)} label="Show me on leaderboard" description="Appear in public leaderboard rankings" />
          <Separator />
          <Toggle checked={dataSharing} onChange={() => setDataSharing(!dataSharing)} label="Share anonymous usage data" description="Help us improve Winnify with anonymous analytics" />
          <Separator />
          <Toggle checked={onlineStatus} onChange={() => setOnlineStatus(!onlineStatus)} label="Show online status" description="Let others see when you're active" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Manage your linked accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                <Globe className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">Google</p>
                <p className="text-xs text-muted-foreground">Connected as student@gmail.com</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/5">
              Disconnect
            </Button>
          </div>
          <Separator />
          {/* GitHub */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <GitHubIcon className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <p className="text-sm font-semibold">GitHub</p>
                <p className="text-xs text-muted-foreground">Not connected</p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Data</CardTitle>
          <CardDescription>Download or manage your personal data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Download my data
          </Button>
        </CardContent>
      </Card>

      <Button onClick={() => setSuccessMsg('Privacy settings saved')}>
        Save Privacy Settings
      </Button>
    </div>
  );
}

/* ── Main Settings Page ───────────────────────────────────────── */
export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');

  const tabIcons: Record<string, typeof User> = {
    account: User,
    notifications: Bell,
    appearance: Palette,
    privacy: Shield,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Back Link */}
      <Link
        to="/home"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary" />
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Settings</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex overflow-x-auto">
          {['account', 'notifications', 'appearance', 'privacy'].map((tab) => {
            const Icon = tabIcons[tab];
            return (
              <TabsTrigger key={tab} value={tab} className="flex items-center gap-1.5 capitalize">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceTab />
        </TabsContent>
        <TabsContent value="privacy">
          <PrivacyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
