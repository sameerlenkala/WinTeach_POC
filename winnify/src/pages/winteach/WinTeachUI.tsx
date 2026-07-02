// Shared UI primitives for WinTeach Console
import React from 'react';
import { W, bloomStyle } from './winteachStyles';
import type { Topic } from './winteachData';
import { topicState, topicPct } from './winteachData';

// ---- Badge ----
type BadgeVariant = 'green' | 'orange' | 'info' | 'red' | 'blue' | 'pink' | 'muted';
const variantMap: Record<BadgeVariant, React.CSSProperties> = {
  green: { background: W.greenBg, color: W.greenFg },
  orange: { background: W.orangeBg, color: W.orangeFg },
  info: { background: W.infoBg, color: W.infoFg },
  red: { background: W.redBg, color: W.redFg },
  blue: { background: W.blueBg, color: W.blueFg },
  pink: { background: W.pinkBg, color: W.pinkFg },
  muted: { background: W.surfaceMuted, color: W.text2 },
};

export function Badge({ variant, dot, children }: { variant: BadgeVariant; dot?: boolean; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13,
      borderRadius: W.r6, padding: '3px 11px', whiteSpace: 'nowrap',
      ...variantMap[variant],
    }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor' }} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  if (status === 'active') return <Badge variant="green" dot>Active</Badge>;
  if (status === 'draft') return <Badge variant="orange">Draft</Badge>;
  return <Badge variant="muted">{status}</Badge>;
}

export function TopicBadge({ topic }: { topic: Topic }) {
  const st = topicState(topic);
  if (st === 'ready') return <Badge variant="green" dot>Ready</Badge>;
  if (st === 'generating') return <Badge variant="info">Generating · {topicPct(topic)}%</Badge>;
  return <Badge variant="orange">Pending</Badge>;
}

export function BloomBadge({ bloom }: { bloom: string }) {
  return <span style={bloomStyle(bloom)}>{bloom}</span>;
}

// ---- Progress bar (ce-xp exact) ----
export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div style={{ height: 9, borderRadius: 999, background: '#eceef6', overflow: 'hidden' }}>
      <span style={{ display: 'block', height: '100%', width: `${value}%`, background: color || 'linear-gradient(90deg,#5b4bff,#00b39a)', borderRadius: 999, transition: 'width .4s ease' }} />
    </div>
  );
}

// ---- XpBar (ce-hcard__bar exact: 5px, #eceef6 track, #5b4bff fill) ----
export function XpBar({ value, color }: { value: number; color?: string }) {
  return (
    <div style={{ display: 'block', height: 5, background: '#eceef6', borderRadius: 99, overflow: 'hidden' }}>
      <i style={{ display: 'block', height: '100%', width: `${value}%`, background: color ?? '#5b4bff', borderRadius: 99 }} />
    </div>
  );
}

// ---- Card (ce-card exact) ----
export function Card({ children, style, compact }: { children: React.ReactNode; style?: React.CSSProperties; compact?: boolean }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e9eaf2', borderRadius: compact ? 14 : 18,
      padding: compact ? '18px 20px' : '28px 32px', boxShadow: '0 2px 10px rgba(28,32,48,.04)', ...style,
    }}>
      {children}
    </div>
  );
}

// ---- CE Kicker ----
export function Kicker({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#5b4bff', marginBottom: 3 }}>{children}</div>;
}

// ---- Button (ce-btn exact) ----
type BtnVariant = 'primary' | 'secondary' | 'ghost';
export function Btn({
  variant = 'secondary', sm, disabled, onClick, children, style,
}: {
  variant?: BtnVariant; sm?: boolean; disabled?: boolean;
  onClick?: () => void; children: React.ReactNode; style?: React.CSSProperties;
}) {
  const variants: Record<BtnVariant, React.CSSProperties> = {
    // ce-btn--big: linear-gradient(135deg, #5b4bff, #00b39a)
    primary:   { border: 'none', borderRadius: 11, padding: sm ? '7px 14px' : '13px 22px', fontSize: sm ? '.82rem' : '1rem',    fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg,#5b4bff,#00b39a)' },
    // ce-btn default
    secondary: { border: `1px solid ${W.borderStrong}`, borderRadius: 11, padding: sm ? '6px 14px' : '11px 18px', fontSize: sm ? '.82rem' : '.92rem', fontWeight: 600, color: W.text, background: 'transparent' },
    ghost:     { border: 'none', borderRadius: 11, padding: sm ? '6px 12px' : '11px 16px', fontSize: sm ? '.82rem' : '.92rem',  fontWeight: 500, color: W.text2, background: 'transparent' },
  };
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: W.fontDisplay,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      transition: 'filter .12s',
      whiteSpace: 'nowrap',
      ...variants[variant],
      ...style,
    }} disabled={disabled} onClick={onClick}
      onMouseEnter={e => { if (!disabled && variant === 'primary') (e.currentTarget as HTMLElement).style.filter = 'brightness(1.07)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ''; }}
    >
      {children}
    </button>
  );
}

// ---- IconBtn ----
export function IconBtn({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      width: 44, height: 44, borderRadius: 13, border: `1px solid ${W.border}`,
      background: W.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: W.text2, cursor: 'pointer',
    }}>
      <span style={{ width: 20, height: 20, display: 'flex' }}>{children}</span>
    </button>
  );
}

// ---- CoIcon (small icon button) ----
export function CoIcon({ danger, children, ...rest }: {
  danger?: boolean; children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} style={{
      width: 32, height: 32, borderRadius: 9, border: `1px solid ${W.border}`,
      background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: danger ? W.redFg : W.text2, cursor: 'pointer',
    }}>
      <span style={{ width: 16, height: 16, display: 'flex' }}>{children}</span>
    </button>
  );
}

// ---- Modal ----
export function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,26,34,.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: '#fff', borderRadius: W.r5, padding: 26, width: '100%',
        maxWidth: 520, boxShadow: W.shadowPop, maxHeight: '88vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 17 }}>{title}</div>
          <CoIcon onClick={onClose}>✕</CoIcon>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---- Toast ----
export function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      background: W.text, color: '#fff', padding: '12px 20px', borderRadius: W.r4,
      fontFamily: W.fontDisplay, fontWeight: 500, fontSize: 14, zIndex: 60,
      boxShadow: W.shadowPop, display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ color: '#7CE2A0', width: 18, height: 18, display: 'inline-flex' }}>✓</span>
      {msg}
    </div>
  );
}

// ---- DeltaBanner ----
export function DeltaBanner({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: W.blueBg, borderRadius: W.r4, padding: '14px 16px', marginBottom: 18,
    }}>
      <span style={{ width: 20, height: 20, color: W.blueFg, display: 'flex', flex: '0 0 20px' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
      </span>
      <div style={{ fontSize: 13.5, color: W.text, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

// ---- AicoBox ----
export function Aico({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 11, background: '#efeefe', color: '#5b4bff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 36px',
    }}>
      <span style={{ width: 18, height: 18, display: 'flex' }}>{children}</span>
    </div>
  );
}

// ---- CoRow ----
export function CoRow({ id, text, bloom, actions, style }: {
  id: string; text: string; bloom: string;
  actions?: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16,
      border: `1.5px solid ${W.border}`, borderRadius: 14, marginBottom: 12,
      background: '#fff', transition: 'border-color .15s, box-shadow .15s', ...style,
    }}>
      <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.brand, flex: '0 0 56px', paddingTop: 2 }}>{id}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 8 }}>{text}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <BloomBadge bloom={bloom} />
        </div>
      </div>
      {actions && <div style={{ display: 'flex', gap: 6, flex: '0 0 auto', alignItems: 'center' }}>{actions}</div>}
    </div>
  );
}

// ---- CoMapTag ----
export function CoMapTag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontWeight: 700, fontSize: '.68rem', textTransform: 'uppercase' as const, letterSpacing: '.08em',
      color: '#5b4bff', background: '#efeefe', borderRadius: 6, padding: '2px 8px',
    }}>
      {children}
    </span>
  );
}

// ---- SubChip ----
export function SubChip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, color: W.text2, background: W.surfaceMuted,
      borderRadius: 6, padding: '2px 8px', margin: '2px 4px 0 0',
    }}>
      {children}
    </span>
  );
}

// ---- SectionLabel ----
export function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text2, ...style }}>
      {children}
    </div>
  );
}

// ---- Field ----
export function Field({ label, optional, error, children }: { label: string; optional?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block' }}>
        {label}{optional && <span style={{ color: W.text3, fontWeight: 500 }}> (optional)</span>}
      </label>
      {children}
      {error && <div style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{error}</div>}
    </div>
  );
}

const inputBase: React.CSSProperties = {
  width: '100%', background: W.surfaceMuted, border: '1px solid transparent',
  borderRadius: W.r4, padding: '11px 14px', fontFamily: W.fontSans, fontSize: 14, color: W.text,
  outline: 'none',
};

export function Input({ id, value, onChange, placeholder, type }: {
  id?: string; value?: string | number; onChange?: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <input id={id} type={type} value={value} onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder} style={inputBase} />
  );
}

export function Select({ id, value, onChange, options }: {
  id?: string; value?: string; onChange?: (v: string) => void; options: string[];
}) {
  return (
    <select id={id} value={value} onChange={e => onChange?.(e.target.value)} style={inputBase}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

export function Textarea({ id, value, onChange, placeholder, rows }: {
  id?: string; value?: string; onChange?: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea id={id} value={value} onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder} rows={rows || 4}
      style={{ ...inputBase, minHeight: 88, resize: 'vertical', lineHeight: 1.6 }} />
  );
}

// ---- Breadcrumb ----
export function Breadcrumb({ items }: { items: Array<{ label: string; onClick?: () => void }> }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: W.text2, marginBottom: 18, flexWrap: 'wrap' }}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>}
          {it.onClick
            ? <a onClick={it.onClick} style={{ color: W.brand, textDecoration: 'none', fontWeight: 500, cursor: 'pointer' }}>{it.label}</a>
            : <span>{it.label}</span>
          }
        </React.Fragment>
      ))}
    </div>
  );
}

// ---- Stepper ----
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
      {steps.map((s, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: active ? W.text : done ? W.text2 : W.text3 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, flex: '0 0 28px',
                background: active ? W.brand : done ? W.greenBg : W.surfaceMuted,
                color: active ? '#fff' : done ? W.greenFg : W.text2,
              }}>
                {done ? '✓' : n}
              </div>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 500, fontSize: 14 }}>{s}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? W.greenFg : W.border, margin: '0 14px', minWidth: 24, opacity: done ? 0.4 : 1 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
