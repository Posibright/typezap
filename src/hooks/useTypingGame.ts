// hooks/useTypingGame.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchQuoteWords,
  generateFallbackWords,
  calculateWPM,
  calculateAccuracy,
  type Mode,
  type TimeOption,
  type WordCountOption,
} from '@/lib/words';

export type CharState = 'untyped' | 'correct' | 'incorrect';

export interface WordData {
  word: string;
  chars: { char: string; state: CharState }[];
}

export type GameStatus = 'idle' | 'running' | 'finished' | 'loading';

// Ghost cursor data
export interface GhostData {
  charTimestamps: number[];
  totalChars: number;
}

// Per-attempt stats snapshot for analytics
export interface AttemptRecord {
  wpm: number;
  accuracy: number;
  elapsedTime: number;
  completedWords: number;
  timestamp: number; // Date.now()
}

interface UseTypingGameProps {
  mode: Mode;
  timeLimit: TimeOption;
  wordCount: WordCountOption;
}

function buildWords(raw: string[]): WordData[] {
  return raw.map((w) => ({
    word: w,
    chars: w.split('').map((c) => ({ char: c, state: 'untyped' as CharState })),
  }));
}

// Persist analytics to localStorage
function saveAttempt(record: AttemptRecord) {
  try {
    const key = 'typezap_history';
    const raw = localStorage.getItem(key);
    const history: AttemptRecord[] = raw ? JSON.parse(raw) : [];
    history.push(record);
    // Keep last 200 attempts
    if (history.length > 200) history.splice(0, history.length - 200);
    localStorage.setItem(key, JSON.stringify(history));
  } catch {
    // localStorage unavailable
  }
}

export function getAttemptHistory(): AttemptRecord[] {
  try {
    const raw = localStorage.getItem('typezap_history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useTypingGame({ mode, timeLimit, wordCount }: UseTypingGameProps) {
  const [words, setWords] = useState<WordData[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [status, setStatus] = useState<GameStatus>('loading');
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [completedWords, setCompletedWords] = useState(0);

  // Ghost cursor state
  const [ghostData, setGhostData] = useState<GhostData | null>(null);
  const [ghostCharIndex, setGhostCharIndex] = useState(-1);

  // Paragraph fingerprint
  const [paragraphId, setParagraphId] = useState('');

  // Current attempt timestamps for ghost
  const currentAttemptTimestamps = useRef<number[]>([]);
  const globalCharCounter = useRef(0);

  // Buffer of extra words fetched for infinite mode
  const wordBufferRef = useRef<string[]>([]);
  const isFetchingMore = useRef(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const ghostIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Refs for stale closures
  const wordsRef = useRef(words);
  wordsRef.current = words;
  const currentWordIndexRef = useRef(currentWordIndex);
  currentWordIndexRef.current = currentWordIndex;
  const statusRef = useRef(status);
  statusRef.current = status;
  const completedWordsRef = useRef(completedWords);
  completedWordsRef.current = completedWords;
  const correctKeystrokesRef = useRef(0);
  const totalKeystrokesRef = useRef(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopGhostTimer = useCallback(() => {
    if (ghostIntervalRef.current) {
      clearInterval(ghostIntervalRef.current);
      ghostIntervalRef.current = null;
    }
  }, []);

  const startGhostTimer = useCallback(
    (ghost: GhostData) => {
      stopGhostTimer();
      const ghostStart = Date.now();
      ghostIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - ghostStart;
        let idx = -1;
        for (let i = 0; i < ghost.charTimestamps.length; i++) {
          if (ghost.charTimestamps[i] <= elapsed) {
            idx = i;
          } else {
            break;
          }
        }
        setGhostCharIndex(idx);
        if (idx >= ghost.totalChars - 1) {
          stopGhostTimer();
        }
      }, 50);
    },
    [stopGhostTimer]
  );

  // ── Fetch more words and append them ──
  const appendMoreWords = useCallback(async () => {
    if (isFetchingMore.current) return;
    isFetchingMore.current = true;
    try {
      // Use buffer first
      if (wordBufferRef.current.length >= 50) {
        const extra = wordBufferRef.current.splice(0, 80);
        const extraWords = buildWords(extra);
        setWords((prev) => [...prev, ...extraWords]);
        isFetchingMore.current = false;
        return;
      }
      // Fetch fresh
      const result = await fetchQuoteWords();
      const newWordStrings = result.words;
      // Take some for immediate use, buffer the rest
      const immediate = newWordStrings.slice(0, 80);
      wordBufferRef.current.push(...newWordStrings.slice(80));
      const extraWords = buildWords(immediate);
      setWords((prev) => [...prev, ...extraWords]);
    } catch {
      // Fallback
      const extra = generateFallbackWords(80);
      const extraWords = buildWords(extra);
      setWords((prev) => [...prev, ...extraWords]);
    }
    isFetchingMore.current = false;
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
      setElapsedTime(elapsed);

      const charsTyped = wordsRef.current
        .slice(0, completedWordsRef.current)
        .reduce((acc, w) => acc + w.word.length + 1, 0);
      setWpm(calculateWPM(charsTyped, elapsed || 1));

      if (modeRef.current === 'time') {
        const remaining = timeLimit - elapsed;
        setTimeLeft(remaining);
        if (remaining <= 0) {
          stopTimer();
          // Save attempt
          const finalWpm = calculateWPM(charsTyped, elapsed || 1);
          const finalAcc = totalKeystrokesRef.current > 0
            ? calculateAccuracy(correctKeystrokesRef.current, totalKeystrokesRef.current)
            : 100;
          saveAttempt({
            wpm: finalWpm,
            accuracy: finalAcc,
            elapsedTime: elapsed,
            completedWords: completedWordsRef.current,
            timestamp: Date.now(),
          });
          setStatus('finished');
        }
      }
    }, 200);
  }, [timeLimit, stopTimer]);

  // Fetch initial quotes
  const loadQuotes = useCallback(
    async (retainGhost: boolean = false) => {
      setStatus('loading');
      stopTimer();
      stopGhostTimer();

      let wordStrings: string[];
      let newParagraphId: string;

      try {
        const result = await fetchQuoteWords();
        const count = mode === 'words' ? wordCount : 200;
        wordStrings = result.words.slice(0, count);
        if (wordStrings.length < count) {
          const extra = generateFallbackWords(count - wordStrings.length);
          wordStrings = [...wordStrings, ...extra];
        }
        // Buffer extras
        wordBufferRef.current = result.words.slice(count);
        newParagraphId = wordStrings.slice(0, 20).join('-');
      } catch {
        const count = mode === 'words' ? wordCount : 200;
        wordStrings = generateFallbackWords(count);
        newParagraphId = wordStrings.slice(0, 20).join('-');
      }

      const freshWords = buildWords(wordStrings);

      if (!retainGhost || newParagraphId !== paragraphId) {
        setGhostData(null);
        setGhostCharIndex(-1);
      }

      setParagraphId(newParagraphId);
      setWords(freshWords);
      setCurrentWordIndex(0);
      setCurrentInput('');
      setTimeLeft(timeLimit);
      setElapsedTime(0);
      setWpm(0);
      setAccuracy(100);
      setCompletedWords(0);
      correctKeystrokesRef.current = 0;
      totalKeystrokesRef.current = 0;
      currentAttemptTimestamps.current = [];
      globalCharCounter.current = 0;
      startTimeRef.current = null;
      setStatus('idle');
      setTimeout(() => inputRef.current?.focus(), 80);
    },
    [mode, timeLimit, wordCount, paragraphId, stopTimer, stopGhostTimer]
  );

  // Redo = restart the exact same paragraph from scratch (mid-game ragequit or after finish)
  const redoParagraph = useCallback(() => {
    stopTimer();
    stopGhostTimer();

    const freshWords = wordsRef.current.map((w) => ({
      word: w.word,
      chars: w.word.split('').map((c) => ({ char: c, state: 'untyped' as CharState })),
    }));

    setGhostData(null);
    setGhostCharIndex(-1);
    setWords(freshWords);
    setCurrentWordIndex(0);
    setCurrentInput('');
    setTimeLeft(timeLimit);
    setElapsedTime(0);
    setWpm(0);
    setAccuracy(100);
    setCompletedWords(0);
    correctKeystrokesRef.current = 0;
    totalKeystrokesRef.current = 0;
    currentAttemptTimestamps.current = [];
    globalCharCounter.current = 0;
    startTimeRef.current = null;
    setStatus('idle');
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [stopTimer, stopGhostTimer, timeLimit]);

  // Retry same = restart but keep ghost
  const retrySame = useCallback(() => {
    stopTimer();
    stopGhostTimer();

    if (currentAttemptTimestamps.current.length > 0) {
      setGhostData({
        charTimestamps: [...currentAttemptTimestamps.current],
        totalChars: globalCharCounter.current,
      });
    }

    const freshWords = wordsRef.current.map((w) => ({
      word: w.word,
      chars: w.word.split('').map((c) => ({ char: c, state: 'untyped' as CharState })),
    }));

    setWords(freshWords);
    setCurrentWordIndex(0);
    setCurrentInput('');
    setTimeLeft(timeLimit);
    setElapsedTime(0);
    setWpm(0);
    setAccuracy(100);
    setCompletedWords(0);
    correctKeystrokesRef.current = 0;
    totalKeystrokesRef.current = 0;
    currentAttemptTimestamps.current = [];
    globalCharCounter.current = 0;
    startTimeRef.current = null;
    setStatus('idle');
    setGhostCharIndex(-1);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [stopTimer, stopGhostTimer, timeLimit]);

  // New paragraph
  const newParagraph = useCallback(() => {
    setGhostData(null);
    setGhostCharIndex(-1);
    loadQuotes(false);
  }, [loadQuotes]);

  // Initial load
  useEffect(() => {
    loadQuotes(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset on settings change
  useEffect(() => {
    setGhostData(null);
    setGhostCharIndex(-1);
    loadQuotes(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, timeLimit, wordCount]);

  // ── Auto-append: when user is within 30 words of the end in time mode ──
  useEffect(() => {
    if (mode !== 'time') return;
    if (status !== 'running') return;
    const remaining = words.length - currentWordIndex;
    if (remaining < 30) {
      appendMoreWords();
    }
  }, [currentWordIndex, words.length, mode, status, appendMoreWords]);

  const handleInput = useCallback(
    (value: string) => {
      const currentStatus = statusRef.current;
      if (currentStatus === 'finished' || currentStatus === 'loading') return;

      // Start on first keystroke
      if (currentStatus === 'idle' && value.length > 0) {
        setStatus('running');
        startTimer();
        if (ghostData) {
          startGhostTimer(ghostData);
        }
      }

      const wIdx = currentWordIndexRef.current;
      const currentWord = wordsRef.current[wIdx]?.word ?? '';

      // Space = submit word
      if (value.endsWith(' ')) {
        const typed = value.trimEnd();
        if (typed.length === 0) {
          setCurrentInput('');
          return;
        }

        // Record timestamps
        const now = Date.now() - (startTimeRef.current ?? Date.now());
        for (let i = 0; i < typed.length; i++) {
          if (globalCharCounter.current + i >= currentAttemptTimestamps.current.length) {
            currentAttemptTimestamps.current.push(now);
          }
        }
        currentAttemptTimestamps.current.push(now);
        globalCharCounter.current += typed.length + 1;

        // Mark chars
        const updatedWords = [...wordsRef.current];
        updatedWords[wIdx] = {
          ...updatedWords[wIdx],
          chars: currentWord.split('').map((c, i) => ({
            char: c,
            state: typed[i] === c ? 'correct' : 'incorrect',
          })),
        };
        setWords(updatedWords);

        // Accuracy
        const correct = currentWord.split('').filter((c, i) => typed[i] === c).length;
        correctKeystrokesRef.current += correct;
        totalKeystrokesRef.current += Math.max(typed.length, currentWord.length);
        setAccuracy(
          calculateAccuracy(correctKeystrokesRef.current, totalKeystrokesRef.current)
        );

        const newCompleted = wIdx + 1;
        setCompletedWords(newCompleted);
        setCurrentWordIndex(newCompleted);
        setCurrentInput('');

        // End condition: words mode only (time mode runs until timer)
        if (modeRef.current === 'words' && newCompleted >= wordCount) {
          stopTimer();
          stopGhostTimer();
          const elapsed = Math.floor(
            (Date.now() - (startTimeRef.current ?? Date.now())) / 1000
          );
          setElapsedTime(elapsed);
          const charsTyped = updatedWords
            .slice(0, newCompleted)
            .reduce((acc, w) => acc + w.word.length + 1, 0);
          const finalWpm = calculateWPM(charsTyped, elapsed || 1);
          setWpm(finalWpm);
          saveAttempt({
            wpm: finalWpm,
            accuracy: calculateAccuracy(correctKeystrokesRef.current, totalKeystrokesRef.current),
            elapsedTime: elapsed,
            completedWords: newCompleted,
            timestamp: Date.now(),
          });
          setStatus('finished');
        }
        return;
      }

      // Live coloring
      const updatedWords = [...wordsRef.current];
      updatedWords[wIdx] = {
        ...updatedWords[wIdx],
        chars: currentWord.split('').map((c, i) => ({
          char: c,
          state:
            i >= value.length
              ? 'untyped'
              : value[i] === c
              ? 'correct'
              : 'incorrect',
        })),
      };
      setWords(updatedWords);
      setCurrentInput(value);
    },
    [wordCount, startTimer, stopTimer, stopGhostTimer, ghostData, startGhostTimer]
  );

  // Ghost position computation
  const ghostPosition = useRef<{ wordIndex: number; charIndex: number } | null>(null);
  if (ghostCharIndex >= 0 && words.length > 0) {
    let remaining = ghostCharIndex;
    let found = false;
    for (let w = 0; w < words.length; w++) {
      const wordLen = words[w].word.length;
      if (remaining < wordLen) {
        ghostPosition.current = { wordIndex: w, charIndex: remaining };
        found = true;
        break;
      }
      remaining -= wordLen + 1;
      if (remaining < 0) {
        ghostPosition.current = { wordIndex: w, charIndex: wordLen };
        found = true;
        break;
      }
    }
    if (!found) ghostPosition.current = null;
  } else {
    ghostPosition.current = null;
  }

  return {
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
    ghostPosition: ghostPosition.current,
    hasGhostData: ghostData !== null,
  };
}