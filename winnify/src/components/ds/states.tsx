import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, Inbox, RotateCcw } from 'lucide-react';

/* ── Skeleton — shimmer placeholder (low-bandwidth first paint) ─────────── */
export function Skeleton({ height = 16, width = '100%', radius }: { height?: number | string; width?: number | string; radius?: number }) {
  return <div className="ds-skeleton" aria-hidden style={{ height, width, borderRadius: radius }} />;
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--w-r5)', padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={i === 0 ? 18 : 12} width={i === 0 ? '55%' : `${88 - i * 14}%`} />
      ))}
    </div>
  );
}

/* ── EmptyState — first-run and zero-data surfaces ──────────────────────── */
export function EmptyState({
  icon: Icon = Inbox, title, hint, action,
}: { icon?: LucideIcon; title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div role="status" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      gap: 'var(--sp-2)', padding: 'var(--sp-8) var(--sp-6)',
      background: 'var(--card)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--w-r5)',
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--tint-brand-bg)', color: 'var(--tint-brand-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} />
      </div>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-h3)', color: 'var(--text)', margin: '6px 0 0' }}>{title}</p>
      {hint && <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)', margin: 0, maxWidth: 360, fontFamily: 'var(--font-sans)' }}>{hint}</p>}
      {action && <div style={{ marginTop: 'var(--sp-3)' }}>{action}</div>}
    </div>
  );
}

/* ── ErrorState — recoverable failure with retry ────────────────────────── */
export function ErrorState({
  title = 'Something went wrong', hint = 'Check your connection and try again.', onRetry,
}: { title?: string; hint?: string; onRetry?: () => void }) {
  return (
    <div role="alert" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      gap: 'var(--sp-2)', padding: 'var(--sp-7) var(--sp-6)',
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--w-r5)',
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--tint-red-bg)', color: 'var(--tint-red-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AlertTriangle size={22} />
      </div>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-h3)', color: 'var(--text)', margin: '6px 0 0' }}>{title}</p>
      <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-sans)' }}>{hint}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: 'var(--sp-3)', display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 38, padding: '0 18px', borderRadius: 'var(--w-r4)',
            background: 'var(--brand)', color: 'var(--brand-fg)', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-small)',
          }}
        >
          <RotateCcw size={14} /> Retry
        </button>
      )}
    </div>
  );
}
