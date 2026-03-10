// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TypingArea from '@/components/Typingarea';
import ResultsCard from '@/components/ResultsCard';
import { useTypingGame } from '@/hooks/useTypingGame';
import { type Mode, type TimeOption, type WordCountOption } from '@/lib/words';

const TIME_OPTIONS: TimeOption[] = [15, 30, 60, 120];
const WORD_OPTIONS: WordCountOption[] = [10, 25, 50, 100];

export default function HomePage() {
  const [mode, setMode] = useState<Mode>('time');
  const [timeLimit, setTimeLimit] = useState<TimeOption>(30);
  const [wordCount, setWordCount] = useState<WordCountOption>(25);

  const {
    words,
    currentWordIndex,
    currentInput,
    status,
    timeLeft,
    elapsedTime,
    wpm,
    accuracy,
    completedWords,
    inputRef,
    handleInput,
    retrySame,
    redoParagraph,
    newParagraph,
    ghostPosition,
    hasGhostData,
  } = useTypingGame({ mode, timeLimit, wordCount });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Esc = new paragraph
      if (e.key === 'Escape') {
        newParagraph();
      }
      // Shift+Enter = retry same (with ghost) after finish
      if (e.key === 'Enter' && e.shiftKey && status === 'finished') {
        e.preventDefault();
        retrySame();
      }
      // Ctrl+Shift+R = redo paragraph (mid-game ragequit)
      if (e.key === 'r' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        redoParagraph();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [retrySame, redoParagraph, newParagraph, status]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="w-full flex flex-col gap-8" style={{ maxWidth: '800px' }}>

          {status !== 'finished' && (
            <>
              {/* ── Mode & options toolbar ── */}
              <div className="flex flex-col items-center gap-4">
                {/* Mode tabs */}
                <div
                  className="flex gap-1"
                  style={{
                    padding: '4px',
                    borderRadius: '12px',
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(74, 69, 96, 0.15)',
                  }}
                >
                  {(['time', 'words'] as Mode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      style={{
                        padding: '8px 20px',
                        borderRadius: '9px',
                        fontSize: '0.75rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase' as const,
                        fontWeight: mode === m ? 600 : 400,
                        background: mode === m ? 'var(--bg-hover)' : 'transparent',
                        color: mode === m ? 'var(--purple-glow)' : 'var(--text-muted)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {m === 'time' ? '⏱ time' : '⌨ words'}
                    </button>
                  ))}
                </div>

                {/* Sub-options */}
                <div className="flex gap-2">
                  {(mode === 'time' ? TIME_OPTIONS : WORD_OPTIONS).map((opt) => {
                    const isActive = mode === 'time' ? opt === timeLimit : opt === wordCount;
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          if (mode === 'time') setTimeLimit(opt as TimeOption);
                          else setWordCount(opt as WordCountOption);
                        }}
                        style={{
                          width: '48px',
                          padding: '6px 0',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? 'var(--purple-glow)' : 'var(--text-muted)',
                          background: isActive ? 'var(--bg-card)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Live stats bar ── */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-baseline gap-1">
                  <span
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                      color:
                        status === 'running'
                          ? 'var(--purple-glow)'
                          : 'var(--text-untyped)',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {mode === 'time' ? timeLeft : wpm}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}
                  >
                    {mode === 'time' ? 's' : 'wpm'}
                  </span>
                </div>

                {/* Accuracy */}
                {status === 'running' && (
                  <div className="flex items-baseline gap-1 fade-in-up">
                    <span
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                        color: 'var(--text-correct)',
                      }}
                    >
                      {accuracy}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      %
                    </span>
                  </div>
                )}

                {/* Progress (word mode) */}
                {mode === 'words' && status !== 'idle' && status !== 'loading' && (
                  <div className="flex items-center gap-2">
                    <div
                      className="overflow-hidden"
                      style={{
                        width: '96px',
                        height: '4px',
                        borderRadius: '2px',
                        background: 'var(--bg-card)',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          borderRadius: '2px',
                          width: `${(completedWords / wordCount) * 100}%`,
                          background: 'var(--purple-bright)',
                          transition: 'width 0.3s ease-out',
                        }}
                      />
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {completedWords}/{wordCount}
                    </span>
                  </div>
                )}

                {/* Live WPM (time mode) */}
                {mode === 'time' && status === 'running' && (
                  <div className="flex items-baseline gap-1">
                    <span
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: 600,
                        color: 'var(--text-correct)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {wpm}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      wpm
                    </span>
                  </div>
                )}
              </div>

              {/* ── Typing area ── */}
              <div
                className="cursor-text"
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid rgba(74, 69, 96, 0.15)',
                }}
                onClick={focusInput}
              >
                <TypingArea
                  words={words}
                  currentWordIndex={currentWordIndex}
                  currentInput={currentInput}
                  status={status}
                  inputRef={inputRef}
                  onInput={handleInput}
                  onFocus={focusInput}
                  ghostPosition={ghostPosition}
                />
              </div>

              {/* ── Ghost indicator ── */}
              {hasGhostData && status !== 'loading' && (
                <div className="flex justify-center">
                  <div
                    className="flex items-center gap-2"
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      background: 'rgba(167, 139, 250, 0.06)',
                    }}
                  >
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--ghost-color)',
                      }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: 'var(--purple-bright)', opacity: 0.6 }}
                    >
                      ghost active
                    </span>
                  </div>
                </div>
              )}

              {/* ── Redo button (visible when running, for ragequit restart) ── */}
              {status === 'running' && (
                <div className="flex justify-center fade-in-up">
                  <button
                    onClick={redoParagraph}
                    className="flex items-center gap-2"
                    style={{
                      padding: '8px 20px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase' as const,
                      fontWeight: 500,
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      border: '1px solid rgba(74, 69, 96, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-card)';
                      e.currentTarget.style.color = 'var(--purple-bright)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1 4 1 10 7 10" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    restart paragraph
                  </button>
                </div>
              )}

              {/* ── Keyboard hints ── */}
              <div className="flex justify-center gap-6">
                <Hint keys={['esc']} label="new quote" />
                <Hint keys={['ctrl', 'shift', 'r']} label="restart" />
                <Hint keys={['shift', 'enter']} label="retry (ghost)" note="after finish" />
              </div>
            </>
          )}

          {/* ── Results ── */}
          {status === 'finished' && (
            <ResultsCard
              wpm={wpm}
              accuracy={accuracy}
              elapsedTime={elapsedTime}
              completedWords={completedWords}
              onRetrySame={retrySame}
              onRedoParagraph={redoParagraph}
              onNewParagraph={newParagraph}
              hasGhostData={hasGhostData || completedWords > 0}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full flex justify-center pb-6 gap-6">
        <a
          href="https://github.com/posibright"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs tracking-wider uppercase"
          style={{
            color: 'var(--text-untyped)',
            textDecoration: 'none',
            letterSpacing: '0.08em',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--purple-bright)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-untyped)')}
        >
          github
        </a>
        <a
          href="/about"
          className="text-xs tracking-wider uppercase"
          style={{
            color: 'var(--text-untyped)',
            textDecoration: 'none',
            letterSpacing: '0.08em',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--purple-bright)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-untyped)')}
        >
          about
        </a>
      </footer>
    </div>
  );
}

function Hint({
  keys,
  label,
  note,
}: {
  keys: string[];
  label: string;
  note?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {keys.map((k, i) => (
        <span key={k}>
          <kbd>{k}</kbd>
          {i < keys.length - 1 && (
            <span
              className="text-xs mx-1"
              style={{ color: 'var(--text-untyped)' }}
            >
              +
            </span>
          )}
        </span>
      ))}
      <span className="text-xs ml-1" style={{ color: 'var(--text-untyped)' }}>
        {label}
      </span>
      {note && (
        <span className="text-xs" style={{ color: 'var(--text-untyped)', opacity: 0.5 }}>
          ({note})
        </span>
      )}
    </div>
  );
}