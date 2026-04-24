"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  startTime: number | null;
  endTime: number | null;
}

export const useTypingEngine = (text: string) => {
  const [userInput, setUserInput] = useState('');
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    errors: 0,
    startTime: null,
    endTime: null,
  });
  const [isFinished, setIsFinished] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const calculateStats = useCallback((currentInput: string, elapsed: number) => {
    const minutes = elapsed / 60000;

    // Count uncorrected errors (characters that don't match the target)
    let uncorrectedErrors = 0;
    for (let i = 0; i < currentInput.length; i++) {
      if (currentInput[i] !== text[i]) {
        uncorrectedErrors++;
      }
    }

    // Gross WPM = (Total Characters Typed ÷ 5) ÷ Minutes
    const grossWpm = minutes > 0 ? Math.round((currentInput.length / 5) / minutes) : 0;

    // Error Rate = uncorrected errors ÷ minutes
    const errorRate = minutes > 0 ? uncorrectedErrors / minutes : 0;

    // Net WPM = Gross WPM − Error Rate
    const netWpm = Math.max(0, Math.round(grossWpm - errorRate));

    // Accuracy = (Net WPM ÷ Gross WPM) × 100
    const accuracy = grossWpm > 0 ? Math.round((netWpm / grossWpm) * 100) : 100;

    return { wpm: netWpm, accuracy, errors: uncorrectedErrors };
  }, [text]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isFinished) return;

    if (!stats.startTime && value.length > 0) {
      setStats(prev => ({ ...prev, startTime: Date.now() }));
    }

    setUserInput(value);

    if (value.length >= text.length) {
      const endTime = Date.now();
      const elapsed = endTime - (stats.startTime || endTime);
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

  useEffect(() => {
    if (stats.startTime && !isFinished) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - (stats.startTime || 0);
        setTimeElapsed(elapsed);
        const { wpm, accuracy, errors } = calculateStats(userInput, elapsed);
        setStats(prev => ({ ...prev, wpm, accuracy, errors }));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [stats.startTime, isFinished, userInput, calculateStats]);

  const reset = useCallback(() => {
    setUserInput('');
    setStats({
      wpm: 0,
      accuracy: 100,
      errors: 0,
      startTime: null,
      endTime: null,
    });
    setTimeElapsed(0);
    setIsFinished(false);
    inputRef.current?.focus();
  }, []);

  return {
    userInput,
    stats,
    isFinished,
    timeElapsed,
    handleInputChange,
    reset,
    inputRef,
  };
};
