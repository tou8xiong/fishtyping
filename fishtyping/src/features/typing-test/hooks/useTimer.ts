"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerMode = 'zen' | 'countdown' | 'sprint';

interface TimerConfig {
  mode: TimerMode;
  durationSeconds: number;
}

const getDuration = (length: string, mode: TimerMode): number => {
  const durations: Record<TimerMode, Record<string, number>> = {
    countdown: { short: 30, medium: 60, long: 120 },
    sprint: { short: 15, medium: 30, long: 60 },
    zen: { short: 0, medium: 0, long: 0 },
  };
  return durations[mode]?.[length] ?? 0;
};

export const useTimer = (config: TimerConfig, onTimeUp?: () => void) => {
  const [timeLeft, setTimeLeft] = useState(() => config.durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  const durationRef = useRef(config.durationSeconds);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      durationRef.current = config.durationSeconds;
      setTimeLeft(config.durationSeconds);
    }
  }, [isInitialized, config.durationSeconds]);

  const resetTime = useCallback((duration?: number) => {
    const newDuration = duration ?? durationRef.current;
    setTimeLeft(newDuration);
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0 && config.mode !== 'zen') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (onTimeUpRef.current) {
              onTimeUpRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timeLeft, config.mode]);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeLeft,
    isRunning,
    isPaused,
    formattedTime: formatTime(timeLeft),
    start,
    pause,
    resume,
    reset: () => resetTime(config.durationSeconds),
    stop,
  };
};