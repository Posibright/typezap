// app/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAttemptHistory, type AttemptRecord } from '@/hooks/useTypingGame';

export default function AnalyticsPage() {
  const [history, setHistory] = useState<AttemptRecord[]>([]);

  useEffect(() => {
    setHistory(getAttemptHistory());
  }, []);

  const last20 = history.slice(-20);
  const last10 = history.slice(-10);

  // Computed stats
  const avgWpm = last10.length > 0
    ? Math.round(last10.reduce((a, b) => a + b.wpm, 0) / last10.length)
    : 0;
  const avgAccuracy = last10.length > 0
    ? Math.round(last10.reduce((a, b) => a + b.accuracy, 0) / last10.length)
    : 0;
  const bestWpm = history.length > 0
    ? Math.max(...history.map((h) => h.wpm))
    : 0;
  const totalTests = history.length;
  const totalWords = history.reduce((a, b) => a + b.completedWords, 0);
  const totalTime = history.reduce((a, b) => a + b.elapsedTime, 0);

  // Max WPM for chart scaling
  const chartMax = Math.max(bestWpm + 20, 80);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <header
        className="w-full flex items-center justify-between px-8 py-5"
        style={{ borderBottom: '1px solid rgba(74, 69, 96, 0.15)' }}
      >
        <Link href="/" className="flex items-center gap-3">
          <span style={{ color: 'var(--purple-bright)', fontSize: '1.4rem', fontWeight: 700 }}>
            &gt;_
          </span>
          <span style={{ color: 'var(--purple-glow)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            typezap
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs tracking-wider uppercase"
          style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--purple-bright)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          ← back to typing
        </Link>
      </header>

      <main className="flex-1 flex justify-center px-6 py-12">
        <div className="w-full fade-in-up" style={{ maxWidth: '860px' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--purple-glow)',
              margin: '0 0 32px 0',
            }}
          >
            Analytics
          </h1>

          {totalTests === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-8">
              {/* Summary cards */}
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
              >
                <SummaryCard label="avg wpm" value={String(avgWpm)} sub="last 10 tests" accent />
                <SummaryCard label="best wpm" value={String(bestWpm)} sub="all time" />
                <SummaryCard label="avg accuracy" value={`${avgAccuracy}%`} sub="last 10 tests" />
                <SummaryCard label="total tests" value={String(totalTests)} sub="all time" />
                <SummaryCard label="total words" value={String(totalWords)} sub="all time" />
                <SummaryCard label="total time" value={formatTime(totalTime)} sub="all time" />
              </div>

              {/* WPM Chart */}
              <div
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid rgba(74, 69, 96, 0.15)',
                }}
              >
                <h2
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    margin: '0 0 20px 0',
                  }}
                >
                  WPM over last {last20.length} tests
                </h2>

                {/* Bar chart */}
                <div
                  className="flex items-end gap-1"
                  style={{
                    height: '180px',
                    borderBottom: '1px solid rgba(74, 69, 96, 0.2)',
                    paddingBottom: '4px',
                  }}
                >
                  {last20.map((attempt, i) => {
                    const heightPct = Math.max((attempt.wpm / chartMax) * 100, 4);
                    const isLatest = i === last20.length - 1;
                    return (
                      <div
                        key={i}
                        className="relative flex-1 group"
                        style={{ height: '100%', display: 'flex', alignItems: 'flex-end' }}
                      >
                        {/* Tooltip */}
                        <div
                          className="absolute bottom-full left-1/2 mb-2 pointer-events-none"
                          style={{
                            transform: 'translateX(-50%)',
                            opacity: 0,
                            transition: 'opacity 0.15s ease',
                            zIndex: 10,
                          }}
                        >
                          <div
                            style={{
                              background: 'var(--bg-card)',
                              border: '1px solid rgba(74, 69, 96, 0.3)',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              whiteSpace: 'nowrap',
                              fontSize: '0.7rem',
                              color: 'var(--text-correct)',
                            }}
                          >
                            {attempt.wpm} wpm · {attempt.accuracy}%
                          </div>
                        </div>
                        <div
                          className="chart-bar w-full rounded-t"
                          style={{
                            height: `${heightPct}%`,
                            background: isLatest
                              ? 'linear-gradient(to top, var(--purple-mid), var(--purple-glow))'
                              : 'var(--purple-dim)',
                            opacity: isLatest ? 1 : 0.6,
                            minHeight: '4px',
                            transition: 'opacity 0.15s ease',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            const tooltip = e.currentTarget.parentElement?.querySelector('div') as HTMLElement;
                            if (tooltip) tooltip.style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            if (!isLatest) e.currentTarget.style.opacity = '0.6';
                            const tooltip = e.currentTarget.parentElement?.querySelector('div') as HTMLElement;
                            if (tooltip) tooltip.style.opacity = '0';
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Chart labels */}
                <div className="flex justify-between" style={{ marginTop: '8px' }}>
                  <span className="text-xs" style={{ color: 'var(--text-untyped)' }}>oldest</span>
                  <span className="text-xs" style={{ color: 'var(--text-untyped)' }}>latest</span>
                </div>
              </div>

              {/* Accuracy timeline */}
              <div
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid rgba(74, 69, 96, 0.15)',
                }}
              >
                <h2
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    margin: '0 0 20px 0',
                  }}
                >
                  Accuracy trend
                </h2>

                {/* Line chart (SVG) */}
                <div style={{ position: 'relative', height: '140px' }}>
                  <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${last20.length * 40} 140`}
                    preserveAspectRatio="none"
                    style={{ overflow: 'visible' }}
                  >
                    {/* Grid lines */}
                    {[100, 75, 50].map((val) => (
                      <line
                        key={val}
                        x1="0"
                        y1={140 - (val / 100) * 130}
                        x2={last20.length * 40}
                        y2={140 - (val / 100) * 130}
                        stroke="rgba(74, 69, 96, 0.15)"
                        strokeDasharray="4 4"
                      />
                    ))}
                    {/* Line path */}
                    {last20.length > 1 && (
                      <>
                        {/* Fill area */}
                        <path
                          d={
                            `M 0 ${140 - (last20[0].accuracy / 100) * 130} ` +
                            last20
                              .map((a, i) => `L ${i * 40} ${140 - (a.accuracy / 100) * 130}`)
                              .join(' ') +
                            ` L ${(last20.length - 1) * 40} 140 L 0 140 Z`
                          }
                          fill="url(#accuracyGradient)"
                          opacity="0.2"
                        />
                        {/* Line */}
                        <path
                          d={last20
                            .map((a, i) => `${i === 0 ? 'M' : 'L'} ${i * 40} ${140 - (a.accuracy / 100) * 130}`)
                            .join(' ')}
                          fill="none"
                          stroke="var(--purple-bright)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <defs>
                          <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--purple-bright)" />
                            <stop offset="100%" stopColor="transparent" />
                          </linearGradient>
                        </defs>
                      </>
                    )}
                    {/* Dots */}
                    {last20.map((a, i) => (
                      <circle
                        key={i}
                        cx={i * 40}
                        cy={140 - (a.accuracy / 100) * 130}
                        r="3"
                        fill="var(--purple-bright)"
                        opacity={i === last20.length - 1 ? 1 : 0.5}
                      />
                    ))}
                  </svg>
                </div>

                <div className="flex justify-between" style={{ marginTop: '8px' }}>
                  <span className="text-xs" style={{ color: 'var(--text-untyped)' }}>0%</span>
                  <span className="text-xs" style={{ color: 'var(--text-untyped)' }}>100%</span>
                </div>
              </div>

              {/* Recent history table */}
              <div
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid rgba(74, 69, 96, 0.15)',
                }}
              >
                <h2
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    margin: '0 0 16px 0',
                  }}
                >
                  Recent tests
                </h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['#', 'WPM', 'Accuracy', 'Words', 'Time', 'Date'].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: '8px 12px',
                              textAlign: h === '#' ? 'center' : 'right',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              borderBottom: '1px solid rgba(74, 69, 96, 0.15)',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...last20].reverse().map((attempt, i) => (
                        <tr
                          key={i}
                          style={{ transition: 'background 0.1s ease' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ ...cellStyle, textAlign: 'center', color: 'var(--text-untyped)' }}>
                            {history.length - i}
                          </td>
                          <td style={{ ...cellStyle, color: 'var(--purple-glow)', fontWeight: 600 }}>
                            {attempt.wpm}
                          </td>
                          <td style={{ ...cellStyle, color: attempt.accuracy >= 95 ? 'var(--text-correct)' : attempt.accuracy >= 80 ? 'var(--text-muted)' : 'var(--text-error)' }}>
                            {attempt.accuracy}%
                          </td>
                          <td style={cellStyle}>{attempt.completedWords}</td>
                          <td style={cellStyle}>{attempt.elapsedTime}s</td>
                          <td style={{ ...cellStyle, color: 'var(--text-untyped)', fontSize: '0.75rem' }}>
                            {formatDate(attempt.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'right',
  fontSize: '0.85rem',
  color: 'var(--text-correct)',
  borderBottom: '1px solid rgba(74, 69, 96, 0.08)',
};

function SummaryCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '14px',
        background: 'var(--bg-secondary)',
        border: accent
          ? '1px solid rgba(167, 139, 250, 0.2)'
          : '1px solid rgba(74, 69, 96, 0.15)',
      }}
    >
      <div
        className="text-xs tracking-widest uppercase"
        style={{
          color: 'var(--text-muted)',
          letterSpacing: '0.15em',
          marginBottom: '8px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: accent ? 'var(--purple-glow)' : 'var(--text-correct)',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        className="text-xs"
        style={{ color: 'var(--text-untyped)', marginTop: '4px' }}
      >
        {sub}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      style={{ padding: '80px 0' }}
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-untyped)" strokeWidth="1.5">
        <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
        No test data yet
      </p>
      <p style={{ color: 'var(--text-untyped)', fontSize: '0.85rem' }}>
        Complete a typing test to see your analytics here.
      </p>
      <Link
        href="/"
        style={{
          marginTop: '8px',
          padding: '10px 24px',
          borderRadius: '10px',
          background: 'var(--bg-card)',
          color: 'var(--purple-bright)',
          border: '1px solid rgba(167, 139, 250, 0.2)',
          textDecoration: 'none',
          fontSize: '0.85rem',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Start typing
      </Link>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}
