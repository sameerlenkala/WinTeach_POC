// Shared UI primitives for WinTeach Console — DS v4
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
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: W.fontDisplay, fontWeight: 500, fontSize: 12,
      borderRadius: W.r6, padding: '2px 8px', whiteSpace: 'nowrap',
      ...variantMap[variant],
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />}
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

// ---- Progress bar ----
export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div style={{ height: 8, borderRadius: 999, background: 'var(--score-track)', overflow: 'hidden' }}>
      <span style={{ display: 'block', height: '100%', width: `${value}%`, background: color || 'var(--brand)', borderRadius: 999, transition: 'width var(--dur-slow) var(--ease-out)' }} />
    </div>
  );
}

// ---- XpBar (slim 5px bar) ----
export function XpBar({ value, color }: { value: number; color?: string }) {
  return (
    <div style={{ display: 'block', height: 5, background: 'var(--score-track)', borderRadius: 99, overflow: 'hidden' }}>
      <i style={{ display: 'block', height: '100%', width: `${value}%`, background: color ?? 'var(--brand)', borderRadius: 99, transition: 'width var(--dur-slow) var(--ease-out)' }} />
    </div>
  );
}

// ---- Card ----
export function Card({ children, style, compact, id, className }: {
  children: React.ReactNode; style?: React.CSSProperties; compact?: boolean; id?: string; className?: string;
}) {
  return (
    <div id={id} className={className} style={{
      background: W.card, border: `1px solid ${W.border}`, borderRadius: compact ? 10 : 12,
      padding: compact ? '16px 18px' : '22px 26px', boxShadow: W.shadowCard, ...style,
    }}>
      {children}
    </div>
  );
}

// ---- Kicker (uppercase section eyebrow) ----
export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: W.fontDisplay, fontSize: 'var(--fs-caption)', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '.1em', color: W.brandTintFg, marginBottom: 4,
    }}>
      {children}
    </div>
  );
}

// ---- Card header (kicker + title + optional aside) ----
export function CardHeader({ kicker, title, aside }: { kicker: string; title: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <Kicker>{kicker}</Kicker>
        <div style={{ fontFamily: W.fontDisplay, fontSize: 'var(--fs-h2)', fontWeight: 700, color: W.text, lineHeight: 'var(--lh-h2)' }}>{title}</div>
      </div>
      {aside}
    </div>
  );
}

// ---- Button ----
type BtnVariant = 'primary' | 'secondary' | 'ghost';
export function Btn({
  variant = 'secondary', sm, disabled, onClick, children, style,
}: {
  variant?: BtnVariant; sm?: boolean; disabled?: boolean;
  onClick?: () => void; children: React.ReactNode; style?: React.CSSProperties;
}) {
  const variants: Record<BtnVariant, React.CSSProperties> = {
    primary: {
      border: 'none', borderRadius: 7, padding: sm ? '5px 12px' : '8px 16px',
      fontSize: sm ? 13 : 13.5, fontWeight: 600, color: '#fff',
      background: 'var(--brand)',
      boxShadow: '0 1px 2px rgba(16,24,40,0.1)',
    },
    secondary: {
      border: `1px solid ${W.borderStrong}`, borderRadius: 7, padding: sm ? '4px 12px' : '7px 15px',
      fontSize: sm ? 13 : 13.5, fontWeight: 500, color: W.text, background: W.card,
      boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
    },
    ghost: {
      border: 'none', borderRadius: 7, padding: sm ? '4px 10px' : '7px 12px',
      fontSize: sm ? 13 : 13.5, fontWeight: 500, color: W.text2, background: 'transparent',
    },
  };
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: W.fontDisplay,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transition: 'filter var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)',
      whiteSpace: 'nowrap',
      ...variants[variant],
      ...style,
    }} disabled={disabled} onClick={onClick}
      onMouseEnter={e => {
        if (disabled) return;
        const el = e.currentTarget as HTMLElement;
        // A caller-supplied background (e.g. a red destructive button) must not
        // be clobbered by the variant hover color — darken it instead.
        if (style?.background != null || style?.backgroundColor != null) { el.style.filter = 'brightness(0.94)'; return; }
        if (variant === 'primary') el.style.background = 'var(--brand-hover)';
        if (variant === 'secondary') el.style.background = 'var(--surface-muted)';
        if (variant === 'ghost') el.style.background = 'var(--nav-hover)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        if (style?.background != null || style?.backgroundColor != null) { el.style.filter = ''; return; }
        if (variant === 'primary') el.style.background = 'var(--brand)';
        else el.style.background = variant === 'secondary' ? 'var(--card)' : '';
      }}
    >
      {children}
    </button>
  );
}

// ---- IconBtn ----
export function IconBtn({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      width: 34, height: 34, borderRadius: 7, border: `1px solid ${W.border}`,
      background: W.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: W.text2, cursor: 'pointer', transition: 'border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
    }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border-strong)'; el.style.color = 'var(--text)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = ''; el.style.color = ''; }}
    >
      <span style={{ width: 17, height: 17, display: 'flex' }}>{children}</span>
    </button>
  );
}

// ---- CoIcon (small icon button) ----
export function CoIcon({ danger, children, ...rest }: {
  danger?: boolean; children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} style={{
      width: 32, height: 32, borderRadius: 7, border: `1px solid ${W.border}`,
      background: W.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: danger ? W.redFg : W.text2, cursor: 'pointer',
      transition: 'border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)',
    }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = danger ? 'var(--tint-red-fg)' : 'var(--border-strong)'; el.style.background = danger ? 'var(--tint-red-bg)' : 'var(--surface-muted)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = ''; el.style.background = ''; }}
    >
      <span style={{ width: 16, height: 16, display: 'flex' }}>{children}</span>
    </button>
  );
}

// ---- Modal ----
export function Modal({ onClose, title, subtitle, maxWidth = 520, children }: {
  onClose: () => void; title: string; subtitle?: React.ReactNode; maxWidth?: number; children: React.ReactNode;
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(18,20,32,.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ds-pop" style={{
        background: W.card, border: `1px solid ${W.border}`, borderRadius: W.r5, padding: 28, width: '100%',
        maxWidth, boxShadow: W.shadowPop, maxHeight: '88vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 'var(--fs-h3)', color: W.text }}>{title}</div>
            {subtitle && <div style={{ fontSize: 13, color: W.text2, marginTop: 3 }}>{subtitle}</div>}
          </div>
          <CoIcon onClick={onClose} aria-label="Close">✕</CoIcon>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---- useClickOutside ----
// Returns a ref; calls onOutside when a mousedown lands outside the ref'd
// element while `active`. For closing custom dropdowns/popovers on outside click.
export function useClickOutside<T extends HTMLElement>(active: boolean, onOutside: () => void) {
  const ref = React.useRef<T>(null);
  const cb = React.useRef(onOutside);
  cb.current = onOutside;
  React.useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb.current();
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') cb.current(); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', esc); };
  }, [active]);
  return ref;
}

// ---- ConfirmModal ----
// Themed replacement for window.confirm — consistent with the app's dialog
// language, keyboard-dismissable, with a destructive variant.
export function ConfirmModal({ title, body, confirmLabel = 'Confirm', danger, onConfirm, onClose }: {
  title: string; body: React.ReactNode; confirmLabel?: string; danger?: boolean;
  onConfirm: () => void; onClose: () => void;
}) {
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <Modal onClose={onClose} title={title} maxWidth={440}>
      <div style={{ fontSize: 13.5, color: W.text2, lineHeight: 1.6, marginBottom: 22 }}>{body}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={() => { onConfirm(); onClose(); }}
          style={danger ? { background: 'var(--status-red, #DC2133)' } : undefined}>
          {confirmLabel}
        </Btn>
      </div>
    </Modal>
  );
}

// ---- Skeleton ----
// Shimmer placeholder for loading states. `lines` stacks bars; `height`/`width`
// size a single block.
export function Skeleton({ lines = 1, height = 14, width = '100%', style }: {
  lines?: number; height?: number; width?: number | string; style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="ds-skeleton" style={{
          height, width: i === lines - 1 && lines > 1 ? '70%' : width,
          borderRadius: 6,
        }} />
      ))}
    </div>
  );
}

// ---- Toast ----
export function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="ds-rise" style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--text)', color: 'var(--card)', padding: '12px 20px', borderRadius: W.r4,
      fontFamily: W.fontDisplay, fontWeight: 500, fontSize: 14, zIndex: 60,
      boxShadow: W.shadowPop, display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ color: 'var(--score-good)', width: 18, height: 18, display: 'inline-flex' }}>✓</span>
      {msg}
    </div>
  );
}

// ---- DeltaBanner ----
export function DeltaBanner({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: W.blueBg, border: '1px solid color-mix(in oklab, var(--tint-blue-fg) 14%, transparent)',
      borderRadius: W.r4, padding: '14px 16px', marginBottom: 18,
    }}>
      <span style={{ width: 20, height: 20, color: W.blueFg, display: 'flex', flex: '0 0 20px' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
      </span>
      <div style={{ fontSize: 13.5, color: W.text, lineHeight: 1.5, fontFamily: W.fontSans }}>{children}</div>
    </div>
  );
}

// ---- AicoBox ----
export function Aico({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 8, background: W.brandTintBg, color: W.brandTintFg,
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
      border: `1.5px solid ${W.border}`, borderRadius: 10, marginBottom: 12,
      background: W.card, transition: 'border-color .15s, box-shadow .15s', ...style,
    }}>
      <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.brandTintFg, flex: '0 0 56px', paddingTop: 2 }}>{id}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 8, color: W.text, fontFamily: W.fontSans }}>{text}</div>
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
      color: W.brandTintFg, background: W.brandTintBg, borderRadius: 6, padding: '2px 8px',
      fontFamily: W.fontDisplay,
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
      borderRadius: 6, padding: '2px 8px', margin: '2px 4px 0 0', fontFamily: W.fontSans,
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
      <label style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block', color: W.text }}>
        {label}{optional && <span style={{ color: W.text3, fontWeight: 500 }}> (optional)</span>}
      </label>
      {children}
      {error && <div style={{ fontSize: 12, color: 'var(--status-red)', marginTop: 4 }}>{error}</div>}
    </div>
  );
}

const inputBase: React.CSSProperties = {
  width: '100%', background: 'var(--input-bg)', border: `1.5px solid ${W.border}`,
  borderRadius: W.r4, padding: '10px 14px', fontFamily: W.fontSans, fontSize: 14, color: 'var(--input-fg)',
  outline: 'none', transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: W.text2, marginBottom: 18, flexWrap: 'wrap', fontFamily: W.fontSans }}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>}
          {it.onClick
            ? <a onClick={it.onClick} style={{ color: W.brandTintFg, textDecoration: 'none', fontWeight: 500, cursor: 'pointer' }}>{it.label}</a>
            : <span>{it.label}</span>
          }
        </React.Fragment>
      ))}
    </div>
  );
}

// ---- Stepper ----
// Completed steps are clickable when `onStepClick` is provided, so users can
// jump back without hunting for a Back button.
export function Stepper({ steps, current, onStepClick }: { steps: string[]; current: number; onStepClick?: (n: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
      {steps.map((s, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        const clickable = done && !!onStepClick;
        return (
          <React.Fragment key={i}>
            <div
              onClick={clickable ? () => onStepClick!(n) : undefined}
              title={clickable ? `Back to ${s}` : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 10, color: active ? W.text : done ? W.text2 : W.text3, cursor: clickable ? 'pointer' : 'default', borderRadius: 8, padding: '4px 6px', margin: '-4px -6px', transition: 'background var(--dur-fast) var(--ease-out)' }}
              onMouseEnter={clickable ? e => (e.currentTarget.style.background = 'var(--surface-muted)') : undefined}
              onMouseLeave={clickable ? e => (e.currentTarget.style.background = 'transparent') : undefined}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, flex: '0 0 28px',
                background: active ? 'var(--brand)' : done ? W.greenBg : W.surfaceMuted,
                color: active ? '#fff' : done ? W.greenFg : W.text2,
                boxShadow: 'none',
              }}>
                {done ? '✓' : n}
              </div>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 500, fontSize: 14 }}>{s}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? W.greenFg : W.border, margin: '0 14px', minWidth: 24, opacity: done ? 0.4 : 1, borderRadius: 2 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
