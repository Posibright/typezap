// components/ResultsCard.tsx
'use client';

interface ResultsCardProps {
  wpm: number;
  accuracy: number;
  elapsedTime: number;
  completedWords: number;
  onRetrySame: () => void;
  onRedoParagraph: () => void;
  onNewParagraph: () => void;
  hasGhostData: boolean;
}

export default function ResultsCard({
  wpm,
  accuracy,
  elapsedTime,
  completedWords,
  onRetrySame,
  onRedoParagraph,
  onNewParagraph,
  hasGhostData,
}: ResultsCardProps) {
  const grade =
    wpm >= 100 ? 'S' : wpm >= 80 ? 'A' : wpm >= 60 ? 'B' : wpm >= 40 ? 'C' : 'D';

  const gradeColors: Record<string, string> = {
    S: '#c4b5fd',
    A: '#a78bfa',
    B: '#7c5cbf',
    C: '#6b6588',
    D: '#4a4560',
  };
  const gradeColor = gradeColors[grade] || '#4a4560';

  return (
    <div className="fade-in-up w-full flex flex-col items-center gap-10 py-4">
      {/* Grade badge */}
      <div className="flex flex-col items-center gap-2">
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.3em' }}
        >
          rank
        </span>
        <span
          style={{
            color: gradeColor,
            fontSize: '6rem',
            fontWeight: 800,
            lineHeight: 1,
            textShadow: `0 0 60px ${gradeColor}66, 0 0 120px ${gradeColor}22`,
          }}
        >
          {grade}
        </span>
      </div>

      {/* Stats grid */}
      <div
        className="flex gap-8 items-end"
        style={{
          padding: '20px 32px',
          borderRadius: '16px',
          background: 'var(--bg-card)',
          border: '1px solid rgba(74, 69, 96, 0.2)',
        }}
      >
        <StatBlock label="wpm" value={wpm} large color="var(--purple-glow)" />
        <Divider />
        <StatBlock label="accuracy" value={`${accuracy}%`} color="var(--text-correct)" />
        <Divider />
        <StatBlock label="time" value={`${elapsedTime}s`} color="var(--text-correct)" />
        <Divider />
        <StatBlock label="words" value={completedWords} color="var(--text-correct)" />
      </div>

      {/* WPM progress bar */}
      <div className="w-full" style={{ maxWidth: '440px' }}>
        <div
          className="overflow-hidden"
          style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-card)' }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: '3px',
              width: `${Math.min(wpm, 150) / 150 * 100}%`,
              background: 'linear-gradient(90deg, var(--purple-dim), var(--purple-glow))',
              transition: 'width 1s ease-out',
            }}
          />
        </div>
        <div className="flex justify-between" style={{ marginTop: '4px' }}>
          <span className="text-xs" style={{ color: 'var(--text-untyped)' }}>0</span>
          <span className="text-xs" style={{ color: 'var(--text-untyped)' }}>150+ wpm</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        <ActionButton
          onClick={onRetrySame}
          icon={<RetryIcon />}
          label={hasGhostData ? 'retry (ghost on)' : 'retry same'}
          variant="primary"
        />
        <ActionButton
          onClick={onRedoParagraph}
          icon={<RedoIcon />}
          label="redo paragraph"
          variant="secondary"
        />
        <ActionButton
          onClick={onNewParagraph}
          icon={<ArrowIcon />}
          label="next quote"
          variant="ghost"
        />
      </div>

      {/* Ghost hint */}
      {hasGhostData && (
        <div
          className="flex items-center gap-2"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'rgba(167, 139, 250, 0.08)',
            border: '1px solid rgba(167, 139, 250, 0.15)',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--ghost-color)',
            }}
          />
          <span className="text-xs" style={{ color: 'var(--purple-bright)', opacity: 0.8 }}>
            Ghost cursor will race your previous attempt
          </span>
        </div>
      )}
    </div>
  );
}

function Divider() {
  return (
    <div style={{ width: '1px', height: '50px', background: 'rgba(74, 69, 96, 0.25)' }} />
  );
}

function StatBlock({
  label,
  value,
  large,
  color,
}: {
  label: string;
  value: string | number;
  large?: boolean;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="text-xs tracking-widest uppercase"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.2em' }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: large ? '3rem' : '1.8rem',
          fontWeight: 700,
          lineHeight: 1,
          color,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  variant,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant: 'primary' | 'secondary' | 'ghost';
}) {
  const styles: Record<string, Record<string, string>> = {
    primary: {
      background: 'var(--bg-card)',
      color: 'var(--purple-glow)',
      border: '1px solid rgba(167, 139, 250, 0.25)',
    },
    secondary: {
      background: 'var(--bg-card)',
      color: 'var(--text-correct)',
      border: '1px solid rgba(74, 69, 96, 0.25)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
      border: '1px solid rgba(74, 69, 96, 0.2)',
    },
  };

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3"
      style={{
        padding: '12px 22px',
        borderRadius: '12px',
        fontSize: '0.78rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...styles[variant],
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-hover)';
        if (variant === 'primary') {
          e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.5)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = styles[variant].background;
        e.currentTarget.style.borderColor = styles[variant].border.replace('1px solid ', '');
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function RetryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="1 4 1 10 7 10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}