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
    const words = currentInput.length / 5; // Standard: 5 chars = 1 word
    const minutes = elapsed / 60000;
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;

    let errors = 0;
    for (let i = 0; i < currentInput.length; i++) {
      if (currentInput[i] !== text[i]) {
        errors++;
      }
    }

    const accuracy = currentInput.length > 0
      ? Math.round(((currentInput.length - errors) / currentInput.length) * 100)
      : 100;

    return { wpm, accuracy, errors };
  }, [text]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isFinished) return;

    if (!stats.startTime && value.length > 0) {
      setStats(prev => ({ ...prev, startTime: Date.now() }));
    }

    setUserInput(value);

    if (value.length >= text.length) {
      setStats(prev => ({ ...prev, endTime: Date.now() }));
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
