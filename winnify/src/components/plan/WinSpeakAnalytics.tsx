import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

/* ── Static data (mirrors WinSpeakAnalyticsV2 reference) ─────── */
const activityPoints = [110,95,105,85,100,90,75,80,70,95,85,60,75,55,65];
const xLabels = ['Mar 1','Mar 8','Mar 15','Mar 22','Mar 29'];

const metrics = [
  { label: 'Fluency',    score: 84, delta: '+6', color: '#5B4BDB', bars: [60,72,68,78,84], trend: 'Last 5 sessions · Trending up',        trendRed: false, badge: null,          badgeGreen: false },
  { label: 'Grammar',    score: 72, delta: '+3', color: '#5B4BDB', bars: [60,66,68,69,72], trend: 'Last 5 sessions · Trending up',         trendRed: false, badge: null,          badgeGreen: false },
  { label: 'Vocabulary', score: 78, delta: '+4', color: '#10B981', bars: [65,70,72,74,78], trend: 'Last 5 sessions · Steady growth',       trendRed: false, badge: null,          badgeGreen: false },
  { label: 'Clarity',    score: 81, delta: '+3', color: '#5B4BDB', bars: [70,76,78,79,81], trend: 'Last 5 sessions · Improving',           trendRed: false, badge: null,          badgeGreen: false },
  { label: 'Structure',  score: 68, delta: '-2', color: '#EF4444', bars: [75,70,72,68,68], trend: 'Declining — needs attention this week', trendRed: true,  badge: 'Focus area',  badgeGreen: false },
  { label: 'Relevancy',  score: 90, delta: null, color: '#10B981', bars: [82,86,85,88,90], trend: 'Consistently strong — keep it up',      trendRed: false, badge: 'Best metric', badgeGreen: true  },
];

/* ── SVG polyline helpers ─────────────────────────────────────── */
const W = 320, H = 140;
// Normalize points: map data values (55–110) to SVG y coords (10–130)
const dataMin = Math.min(...activityPoints);
const dataMax = Math.max(...activityPoints);
const normalize = (v: number) => 10 + ((dataMax - v) / (dataMax - dataMin)) * 120;
const svgPoints = activityPoints.map((v, i) => ({
  x: Math.round((i / (activityPoints.length - 1)) * W),
  y: Math.round(normalize(v)),
}));
const pts = svgPoints.map((p) => `${p.x},${p.y}`).join(' ');
const areaPts = `${svgPoints[0].x},${H} ${pts} ${svgPoints[svgPoints.length - 1].x},${H}`;

export default function WinSpeakAnalytics() {
  return (
    <div className="space-y-4">
      {/* Activity chart */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold font-[family-name:var(--font-heading)]">Activity — March 2026</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Practice sessions per day</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-primary">18</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide">This Week</p>
            </div>
          </div>

          {/* SVG line chart */}
          <div className="relative h-[140px] mb-3">
            <svg width="100%" height="140" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
              {[0.25, 0.5, 0.75, 1].map((t) => {
                const y = Math.round(10 + t * 120);
                return <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />;
              })}
              <defs>
                <linearGradient id="wsa-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#5B4BDB" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#5B4BDB" stopOpacity="0.03" />
                </linearGradient>
              </defs>
              <polygon points={areaPts} fill="url(#wsa-grad)" />
              <polyline points={pts} fill="none" stroke="#5B4BDB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {svgPoints.map((p, i) => {
                const isLatest = i === svgPoints.length - 2;
                return isLatest ? (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="5" fill="#5B4BDB" />
                    <circle cx={p.x} cy={p.y} r="9" fill="none" stroke="#5B4BDB" strokeWidth="2" opacity="0.3" />
                  </g>
                ) : (
                  <circle key={i} cx={p.x} cy={p.y} r="3" fill="#5B4BDB" opacity="0.4" />
                );
              })}
            </svg>
          </div>

          {/* X labels */}
          <div className="flex justify-between px-1 mb-3">
            {xLabels.map((l) => (
              <span key={l} className="text-[9px] text-muted-foreground font-semibold">{l}</span>
            ))}
          </div>

          {/* Footer stats */}
          <div className="flex gap-3 pt-3 border-t border-border/60">
            {[
              { label: 'Avg/Day', val: '2.4', color: 'text-foreground' },
              { label: 'Best Day', val: '5',   color: 'text-foreground' },
            ].map((s) => (
              <div key={s.label} className="flex-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
                <p className={cn('text-base font-bold font-[family-name:var(--font-heading)]', s.color)}>{s.val}</p>
              </div>
            ))}
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Streak</p>
              <div className="flex items-center gap-1">
                <p className="text-base font-bold font-[family-name:var(--font-heading)] text-w-orange">7</p>
                <Flame className="h-3.5 w-3.5 text-w-orange" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric Deep-Dive */}
      <p className="text-sm font-bold font-[family-name:var(--font-heading)]">Metric Deep-Dive</p>
      <div className="space-y-2">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border bg-card p-3.5"
            style={{ borderColor: m.trendRed ? 'rgba(239,68,68,0.25)' : undefined }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: m.color }} />
                <span className="text-[13px] font-semibold">{m.label}</span>
                {m.badge && (
                  <span
                    className="text-[10px] font-bold rounded-full px-2 py-0.5"
                    style={{
                      color: m.color,
                      background: m.trendRed ? '#FEF2F2' : m.badgeGreen ? '#ECFDF5' : '#EEF0FF',
                    }}
                  >
                    {m.badge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold font-[family-name:var(--font-heading)]">{m.score}</span>
                {m.delta && (
                  <span
                    className="text-[11px] font-semibold rounded-full px-2 py-0.5"
                    style={{
                      color: m.delta.startsWith('+') ? '#10B981' : '#EF4444',
                      background: m.delta.startsWith('+') ? '#ECFDF5' : '#FEF2F2',
                    }}
                  >
                    {m.delta}
                  </span>
                )}
              </div>
            </div>
            {/* Sparkline */}
            <div className="flex items-end gap-1 h-7 mb-1.5">
              {m.bars.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${h}%`,
                    background: i === m.bars.length - 1
                      ? m.color
                      : `${m.color}${Math.round(20 + i * 15).toString(16).padStart(2, '0')}`,
                  }}
                />
              ))}
            </div>
            <p className="text-[10px]" style={{ color: m.trendRed ? '#EF4444' : '#9CA3AF' }}>{m.trend}</p>
          </div>
        ))}
      </div>

      {/* AI Recommendation */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-w-green/5 p-4">
        <p className="text-[11px] font-bold text-primary uppercase tracking-wide mb-1.5">AI Recommendation</p>
        <p className="text-xs text-foreground leading-relaxed mb-3">
          Your <strong>Structure</strong> score has been dropping for 3 weeks. Try the "Intro-Body-Close" framework: spend 20% introducing your point, 60% developing it, and 20% wrapping up strongly.
        </p>
        <Link
          to="/home/winspeak/practice"
          className="block w-full text-center rounded-xl bg-primary text-primary-foreground text-xs font-bold py-3 hover:bg-primary/90 transition-colors"
        >
          Practice Structure Now
        </Link>
      </div>
    </div>
  );
}
