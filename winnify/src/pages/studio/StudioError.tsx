// Studio error state with a way out. Every screen used to render a bare line
// of red text on failure — accurate, but a dead end on the exact screen where
// a student's connection is most likely to have blipped.
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function StudioError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="st-card" style={{ padding: '26px 20px', textAlign: 'center' }} role="alert">
      <AlertTriangle size={22} color="var(--st-text-3)" style={{ margin: '0 auto 9px' }} />
      <div style={{ font: '600 14px/1.5 var(--st-sans)', color: 'var(--st-text-2)' }}>{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="st-chip st-press" style={{ marginTop: 14 }}>
          <RotateCcw size={13} /> Try again
        </button>
      )}
    </div>
  );
}
