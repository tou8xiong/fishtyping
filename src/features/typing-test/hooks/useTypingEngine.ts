"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  startTime: number | null;
  endTime: number | null;
}

export interface TypingSample {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

// Word count that matches the WPM scoring convention (5 chars = 1 word) for
// languages without reliable word boundaries (e.g. Lao). For Latin scripts we
// still use space-delimited word counts since users expect that.
function countPassageWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const hasLao = /[຀-໿]/.test(trimmed);
  if (hasLao) {
    return Math.max(1, Math.round(trimmed.length / 5));
  }
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export const useTypingEngine = (text: string) => {
  const [userInput, setUserInput] = useState('');

  // Calculate default WPM based on passage word count
  const passageWordCount = countPassageWords(text);

  const [stats, setStats] = useState<TypingStats>({
    wpm: passageWordCount,
    accuracy: 100,
    errors: 0,
    startTime: null,
    endTime: null,
  });
  const [isFinished, setIsFinished] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTime, setPausedTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastInputTimeRef = useRef<number>(Date.now());
  const pauseStartTimeRef = useRef<number | null>(null);
  const typingHistoryRef = useRef<Array<{ chars: number; time: number }>>([]);
  const [samples, setSamples] = useState<TypingSample[]>([]);
  const lastSampleSecondRef = useRef<number>(0);
  const lastSampleCharsRef = useRef<number>(0);
  const lastSampleErrorsRef = useRef<number>(0);

  const calculateStats = useCallback((currentInput: string, elapsed: number) => {
    const minutes = elapsed / 60000;

    // Count uncorrected errors (characters that don't match the target)
    let uncorrectedErrors = 0;
    for (let i = 0; i < currentInput.length; i++) {
      if (currentInput[i] !== text[i]) {
        uncorrectedErrors++;
      }
    }

    // Use sliding window for WPM calculation (last 10 seconds of typing)
    const now = Date.now();
    const windowSize = 10000; // 10 seconds

    // Filter history to only include recent entries
    const recentHistory = typingHistoryRef.current.filter(
      entry => now - entry.time < windowSize
    );

    let wpm: number;
    if (recentHistory.length >= 2) {
      // Calculate WPM based on recent typing speed
      const oldestEntry = recentHistory[0];
      const newestEntry = recentHistory[recentHistory.length - 1];
      const charsDiff = newestEntry.chars - oldestEntry.chars;
      const timeDiff = (newestEntry.time - oldestEntry.time) / 60000; // minutes

      if (timeDiff > 0) {
        const grossWpm = Math.round((charsDiff / 5) / timeDiff);
        const errorRate = timeDiff > 0 ? uncorrectedErrors / minutes : 0;
        wpm = Math.max(0, Math.round(grossWpm - errorRate));
      } else {
        wpm = 0;
      }
    } else {
      // Fallback to total time calculation for initial typing
      const grossWpm = minutes > 0 ? Math.round((currentInput.length / 5) / minutes) : 0;
      const errorRate = minutes > 0 ? uncorrectedErrors / minutes : 0;
      wpm = Math.max(0, Math.round(grossWpm - errorRate));
    }

    // Accuracy calculation
    const grossWpm = minutes > 0 ? Math.round((currentInput.length / 5) / minutes) : 0;
    const accuracy = grossWpm > 0 ? Math.round((wpm / grossWpm) * 100) : 100;

    return { wpm, accuracy, errors: uncorrectedErrors };
  }, [text]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isFinished) return;

    if (!stats.startTime && value.length > 0) {
      setStats(prev => ({ ...prev, startTime: Date.now() }));
    }

    // Resume if paused
    if (isPaused && value.length > 0 && pauseStartTimeRef.current) {
      const pauseDuration = Date.now() - pauseStartTimeRef.current;
      setPausedTime(prev => prev + pauseDuration);
      setIsPaused(false);
      pauseStartTimeRef.current = null;
    }

    // Update last input time
    lastInputTimeRef.current = Date.now();

    // Track typing history for sliding window calculation
    typingHistoryRef.current.push({
      chars: value.length,
      time: Date.now()
    });

    // Keep only last 20 entries to avoid memory bloat
    if (typingHistoryRef.current.length > 20) {
      typingHistoryRef.current.shift();
    }

    setUserInput(value);

    // Update stats after each word (when space is typed)
    if (stats.startTime && value.endsWith(' ')) {
      const elapsed = Date.now() - stats.startTime - pausedTime;
      const { wpm, accuracy, errors } = calculateStats(value, elapsed);
      setStats(prev => ({ ...prev, wpm, accuracy, errors }));
      setTimeElapsed(elapsed);
    }

    if (value.length >= text.length) {
      const endTime = Date.now();
      const elapsed = endTime - (stats.startTime || endTime) - pausedTime;
      const finalStats = calculateStats(value, elapsed);
      setStats(prev => ({
        ...prev,
        endTime,
        wpm: finalStats.wpm,
        accuracy: finalStats.accuracy,
        errors: finalStats.errors
      }));
      setTimeElapsed(elapsed);
      setIsFinished(true);
    }
  };

  // Keep the displayed WPM in sync with the current passage word count
  // until the user actually starts typing.
  useEffect(() => {
    if (userInput.length === 0 && !stats.startTime && !isFinished) {
      const wordCount = countPassageWords(text);
      setStats(prev => (prev.wpm === wordCount ? prev : { ...prev, wpm: wordCount }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // Check for pause (no typing for 2 seconds)
  useEffect(() => {
    if (!stats.startTime || isFinished) return;

    const checkPause = setInterval(() => {
      const timeSinceLastInput = Date.now() - lastInputTimeRef.current;
      if (timeSinceLastInput >= 2000 && !isPaused) {
        setIsPaused(true);
        pauseStartTimeRef.current = Date.now();
      }
    }, 100);

    return () => clearInterval(checkPause);
  }, [stats.startTime, isFinished, isPaused]);

  // Update timer and stats only when not paused
  useEffect(() => {
    if (stats.startTime && !isFinished && !isPaused) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - (stats.startTime || 0) - pausedTime;
        setTimeElapsed(elapsed);
        const { wpm, accuracy, errors } = calculateStats(userInput, elapsed);
        setStats(prev => ({ ...prev, wpm, accuracy, errors }));

        // Push one sample per crossed second boundary.
        const second = Math.floor(elapsed / 1000);
        if (second > lastSampleSecondRef.current) {
          const charsNow = userInput.length;
          const charsThisSecond = charsNow - lastSampleCharsRef.current;
          const errorsThisSecond = Math.max(0, errors - lastSampleErrorsRef.current);
          const rawWpm = Math.max(0, Math.round((charsThisSecond / 5) * 60));
          lastSampleSecondRef.current = second;
          lastSampleCharsRef.current = charsNow;
          lastSampleErrorsRef.current = errors;
          setSamples(prev => [
            ...prev,
            { second, wpm, rawWpm, errors: errorsThisSecond },
          ]);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [stats.startTime, isFinished, isPaused, userInput, calculateStats, pausedTime]);

  const reset = useCallback(() => {
    setUserInput('');
    const passageWordCount = countPassageWords(text);
    setStats({
      wpm: passageWordCount,
      accuracy: 100,
      errors: 0,
      startTime: null,
      endTime: null,
    });
    setTimeElapsed(0);
    setIsFinished(false);
    setIsPaused(false);
    setPausedTime(0);
    pauseStartTimeRef.current = null;
    lastInputTimeRef.current = Date.now();
    typingHistoryRef.current = [];
    setSamples([]);
    lastSampleSecondRef.current = 0;
    lastSampleCharsRef.current = 0;
    lastSampleErrorsRef.current = 0;
    inputRef.current?.focus();
  }, [text]);

  // Externally-triggered pause (e.g. when the user moves the mouse).
  // Safe to call repeatedly; only enters the paused state once until input resumes.
  const pause = useCallback(() => {
    if (!stats.startTime || isFinished || isPaused) return;
    pauseStartTimeRef.current = Date.now();
    setIsPaused(true);
  }, [stats.startTime, isFinished, isPaused]);

  return {
    userInput,
    stats,
    samples,
    isFinished,
    isPaused,
    timeElapsed,
    handleInputChange,
    reset,
    pause,
    inputRef,
  };
};
