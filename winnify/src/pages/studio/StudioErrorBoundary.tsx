// Crash guard for the studio routes. Lesson content is model-generated, so a
// malformed artifact can throw mid-render; without this the whole app
// white-screens. Falls back to the studio's usual empty-state card and offers
// a reload, keyed on the route so navigating away clears the error.
import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props { children: ReactNode; resetKey?: string }
interface State { failed: boolean }

export default class StudioErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidUpdate(prev: Props) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey) {
      this.setState({ failed: false });
    }
  }

  componentDidCatch(error: unknown) {
    console.error('[studio] render failed', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div style={{ padding: 'calc(24px + env(safe-area-inset-top)) 20px 24px' }}>
        <div className="st-card" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <AlertTriangle size={26} color="var(--st-text-3)" style={{ margin: '0 auto 10px' }} />
          <div style={{ font: '700 16px var(--st-display)' }}>This page didn’t load</div>
          <div style={{ font: '500 13px var(--st-sans)', color: 'var(--st-text-2)', marginTop: 4 }}>
            Something went wrong rendering this content. Your progress is saved.
          </div>
          <button
            onClick={() => window.location.reload()}
            className="st-cta st-press"
            style={{ marginTop: 18 }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
