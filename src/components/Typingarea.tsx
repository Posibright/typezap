// components/TypingArea.tsx
'use client';

import { useRef, useEffect } from 'react';
import { WordData, GameStatus } from '@/hooks/useTypingGame';

interface TypingAreaProps {
  words: WordData[];
  currentWordIndex: number;
  currentInput: string;
  status: GameStatus;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onInput: (value: string) => void;
  onFocus: () => void;
  ghostPosition: { wordIndex: number; charIndex: number } | null;
}

export default function TypingArea({
  words,
  currentWordIndex,
  currentInput,
  status,
  inputRef,
  onInput,
  onFocus,
  ghostPosition,
}: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  // Auto-scroll active word into view
  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      const container = containerRef.current;
      const word = activeWordRef.current;
      const wordTop = word.offsetTop;
      const containerHeight = container.clientHeight;
      const lineHeight = 48;
      if (wordTop > containerHeight / 2) {
        container.scrollTop = wordTop - lineHeight;
      }
    }
  }, [currentWordIndex]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
    onFocus();
  };

  return (
    <div className="relative w-full" onClick={handleContainerClick}>
      {/* Hidden input */}
      <input
        ref={inputRef}
        value={currentInput}
        onChange={(e) => onInput(e.target.value)}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
          opacity: 0,
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        disabled={status === 'finished' || status === 'loading'}
        aria-label="Typing input"
        tabIndex={0}
      />

      {/* "Start typing" prompt */}
      {status === 'idle' && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center cursor-text"
          style={{ borderRadius: '12px' }}
        >
          <div className="flex flex-col items-center gap-3" style={{ opacity: 0.5 }}>
            <span
              className="text-sm tracking-widest uppercase"
              style={{ color: 'var(--text-muted)', letterSpacing: '0.15em' }}
            >
              start typing to begin
            </span>
          </div>
        </div>
      )}

      {/* Loading shimmer */}
      {status === 'loading' && (
        <div className="flex flex-col gap-3 py-4">
          {[1, 2, 3].map((row) => (
            <div
              key={row}
              className="shimmer rounded-lg"
              style={{
                height: '28px',
                width: row === 3 ? '60%' : '100%',
              }}
            />
          ))}
        </div>
      )}

      {/* Words display */}
      {status !== 'loading' && (
        <div
          ref={containerRef}
          className="relative overflow-hidden select-none no-scrollbar"
          style={{
            height: '145px',
            filter: status === 'idle' ? 'blur(4px)' : 'none',
            opacity: status === 'idle' ? 0.4 : 1,
            transition: 'filter 0.3s ease, opacity 0.3s ease',
            scrollBehavior: 'smooth',
          }}
        >
          <div
            className="flex flex-wrap"
            style={{
              gap: '8px 12px',
              lineHeight: '45px',
            }}
          >
            {words.map((wordData, wIdx) => {
              const isActive = wIdx === currentWordIndex;
              const isCompleted = wIdx < currentWordIndex;
              const isGhostWord = ghostPosition?.wordIndex === wIdx;

              return (
                <span
                  key={wIdx}
                  ref={isActive ? activeWordRef : null}
                  className="relative inline-flex"
                  style={{
                    fontSize: '1.45rem',
                    letterSpacing: '0.03em',
                  }}
                >
                  {/* Active word underline */}
                  {isActive && (
                    <span
                      className="absolute left-0 right-0"
                      style={{
                        bottom: '2px',
                        height: '2px',
                        borderRadius: '1px',
                        background: 'var(--purple-bright)',
                        opacity: 0.25,
                      }}
                    />
                  )}

                  {wordData.chars.map((charData, cIdx) => {
                    let color = 'var(--text-untyped)';
                    if (isCompleted || (isActive && cIdx < currentInput.length)) {
                      color =
                        charData.state === 'correct'
                          ? 'var(--text-correct)'
                          : charData.state === 'incorrect'
                          ? 'var(--text-error)'
                          : 'var(--text-untyped)';
                    }

                    const isCursorHere = isActive && cIdx === currentInput.length;
                    const isGhostHere =
                      isGhostWord && ghostPosition?.charIndex === cIdx;

                    return (
                      <span
                        key={cIdx}
                        className="relative inline-block"
                        style={{
                          color,
                          transition: 'color 0.05s ease',
                        }}
                      >
                        {/* Main cursor */}
                        {isCursorHere && (
                          <span
                            className="cursor-blink absolute"
                            style={{
                              left: '-1px',
                              top: '6px',
                              bottom: '6px',
                              width: '2.5px',
                              borderRadius: '2px',
                              background: 'var(--cursor-color)',
                              zIndex: 5,
                            }}
                          />
                        )}

                        {/* Ghost cursor */}
                        {isGhostHere && status === 'running' && (
                          <span
                            className="ghost-cursor absolute"
                            style={{
                              left: '-1px',
                              top: '6px',
                              bottom: '6px',
                              width: '2.5px',
                              borderRadius: '2px',
                              background: 'var(--ghost-color)',
                              zIndex: 4,
                            }}
                          />
                        )}

                        {charData.char}
                      </span>
                    );
                  })}

                  {/* Cursor at end of word (overflow) */}
                  {isActive && currentInput.length >= wordData.chars.length && (
                    <span
                      className="cursor-blink inline-block rounded-full"
                      style={{
                        width: '2.5px',
                        height: '1.2em',
                        marginTop: '0.15em',
                        background: 'var(--cursor-color)',
                        alignSelf: 'center',
                        marginLeft: '1px',
                      }}
                    />
                  )}

                  {/* Extra characters typed */}
                  {isActive &&
                    currentInput.length > wordData.chars.length &&
                    currentInput
                      .slice(wordData.chars.length)
                      .split('')
                      .map((extraChar, eIdx) => (
                        <span
                          key={`extra-${eIdx}`}
                          style={{
                            color: 'var(--text-extra)',
                            opacity: 0.8,
                          }}
                        >
                          {extraChar}
                        </span>
                      ))}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0"
        style={{
          height: '30px',
          background: 'linear-gradient(to bottom, transparent, var(--bg-secondary))',
        }}
      />
    </div>
  );
}