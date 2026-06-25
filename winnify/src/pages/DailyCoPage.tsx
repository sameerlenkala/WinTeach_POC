import './DailyCoRoot.css';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – DailyTestDashboard is a plain .jsx file with no type declarations
import DailyTestDashboard from './DailyTestDashboard';

/**
 * Thin wrapper that mounts the original DailyTestDashboard component
 * inside a scoped container (.dailyco-root) so it doesn't bleed
 * Tailwind/Winnify styles into it.
 */
export default function DailyCoPage() {
  return (
    /* flex-1 + h-full so the Daily.co root fills the scrollable main area */
    <div className="dailyco-root" style={{ height: '100%', minHeight: 0 }}>
      <DailyTestDashboard />
    </div>
  );
}
