import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, User, Palette, Sparkles, Bell, ChevronRight } from 'lucide-react';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { Card, Kicker, Btn } from './WinTeachUI';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { authApi } from '@/api/auth';
import type { UserProfile } from '@/api/types';

function SectionCard({ icon: Icon, kicker, title, sub, children, delay = 0 }: {
  icon: React.ElementType; kicker: string; title: string; sub: string;
  children: React.ReactNode; delay?: number;
}) {
  return (
    <Card style={{ marginBottom: 16, animationDelay: `${delay}ms` }} compact>
      <div className="ds-rise" style={{ animationDelay: `${delay}ms` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: W.brandTintBg, color: W.brandTintFg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={18} />
          </div>
          <div>
            <Kicker>{kicker}</Kicker>
            <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 16, color: W.text }}>{title}</div>
            <div style={{ fontSize: 13, color: W.text2, marginTop: 2 }}>{sub}</div>
          </div>
        </div>
        {children}
      </div>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${W.border}` }}>
      <span style={{ fontSize: 13, color: W.text2 }}>{label}</span>
      <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13.5, color: W.text }}>{value}</span>
    </div>
  );
}

export default function WinTeachSettings() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [me, setMe] = useState<UserProfile | null>(null);

  // Identity comes from /auth/me (source of truth) so this card stays in sync
  // with edits made on the account page; falls back to cached context on error.
  useEffect(() => { authApi.me().then(setMe).catch(() => { /* keep context */ }); }, []);

  const name = me?.full_name ?? user?.name ?? '—';
  const email = me?.email ?? user?.email ?? '';
  const role = me?.role ?? user?.role ?? 'author';
  const institute = me?.institute_name;
  const title = me?.designation;

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <>
      <WinTopbar title="Settings" />
      <WinContent>
        <div style={{ maxWidth: 720 }}>

          <SectionCard icon={User} kicker="Account" title="Profile" sub="Your WinTeach author identity" delay={0}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 10, background: W.surfaceMuted, marginBottom: 8 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: 'var(--app-bg-grad)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 17, flexShrink: 0,
              }}>
                {name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 15, color: W.text }}>{name}</div>
                <div style={{ fontSize: 12.5, color: W.text2 }}>{title || email}</div>
              </div>
              <span style={{
                marginLeft: 'auto', fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 11.5,
                background: W.brandTintBg, color: W.brandTintFg, borderRadius: 999, padding: '3px 12px',
                textTransform: 'capitalize', whiteSpace: 'nowrap',
              }}>
                {role}
              </span>
            </div>
            {institute && <InfoRow label="Institute" value={institute} />}
            <InfoRow label="Workspace" value="WinTeach Studio" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
              <Btn variant="primary" onClick={() => navigate('/winteach/account')}>
                Manage account <ChevronRight size={15} />
              </Btn>
            </div>
          </SectionCard>

          <SectionCard icon={Palette} kicker="Appearance" title="Theme" sub="Switch between light and dark mode" delay={60}>
            <div style={{ display: 'flex', gap: 10 }}>
              {([['light', 'Light', Sun], ['dark', 'Dark', Moon]] as const).map(([key, label, Icon]) => {
                const active = theme === key;
                return (
                  <button key={key} onClick={() => { if (!active) toggleTheme(); }} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    height: 48, borderRadius: 8, cursor: 'pointer',
                    border: active ? '1.5px solid var(--brand)' : `1.5px solid ${W.border}`,
                    background: active ? W.brandTintBg : W.card,
                    color: active ? W.brandTintFg : W.text2,
                    fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14,
                    transition: 'border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)',
                  }}>
                    <Icon size={16} /> {label}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard icon={Sparkles} kicker="Generation" title="Content defaults" sub="Applied when a new generation flow starts" delay={120}>
            {[
              ['Generation flow', 'Notes → Pre-assessment · Quiz · Flash cards'],
              ['Review mode', 'Approve each unit before fan-out'],
              ['Bloom tagging', 'Automatic, editable per CO'],
            ].map(([l, v]) => <InfoRow key={l} label={l} value={v} />)}
            <div style={{ fontSize: 12, color: W.text3, marginTop: 10 }}>
              Per-course overrides live in each course's Generation Studio.
            </div>
          </SectionCard>

          <SectionCard icon={Bell} kicker="Notifications" title="Alerts" sub="Job completions and approvals" delay={180}>
            {[
              ['Generation completed', 'In-app'],
              ['Approval required', 'In-app'],
            ].map(([l, v]) => <InfoRow key={l} label={l} value={v} />)}
            <div style={{ fontSize: 12, color: W.text3, marginTop: 10 }}>
              Alerts show in-app while you're in the studio. Email delivery isn't available yet.
            </div>
          </SectionCard>

          <Card compact style={{ borderColor: 'color-mix(in oklab, var(--tint-red-fg) 30%, transparent)' }}>
            <div className="ds-rise" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, animationDelay: '240ms' }}>
              <div>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 15, color: W.text }}>Sign out</div>
                <div style={{ fontSize: 13, color: W.text2, marginTop: 2 }}>End this session on this device.</div>
              </div>
              <Btn onClick={handleSignOut} style={{ color: W.redFg, borderColor: 'color-mix(in oklab, var(--tint-red-fg) 35%, transparent)' }}>
                <LogOut size={15} /> Sign out
              </Btn>
            </div>
          </Card>

        </div>
      </WinContent>
    </>
  );
}
