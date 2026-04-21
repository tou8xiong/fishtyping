"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { useTimer, TimerMode } from '../hooks/useTimer';
import { getUniquePassage, Difficulty, Length, Theme, ChallengeType, Language } from '../utils/passageGenerator';
import { FaRotateRight, FaClock, FaGlobe, FaCheck, FaX } from "react-icons/fa6";

export type TypingMode = 'zen' | 'sprint' | 'accuracy';

interface TypingTestProps {
  initialDifficulty?: Difficulty;
  initialLength?: Length;
  initialTheme?: Theme;
  initialChallengeType?: ChallengeType;
  initialLanguage?: Language;
  initialMode?: TypingMode;
  onModeChange?: (mode: TypingMode) => void;
  onLanguageChange?: (language: Language) => void;
  onDifficultyChange?: (difficulty: Difficulty) => void;
  onLengthChange?: (length: Length) => void;
  onThemeChange?: (theme: Theme) => void;
  onChallengeTypeChange?: (challengeType: ChallengeType) => void;
}

const getDurationForModeAndLength = (mode: TypingMode, length: Length): number => {
  if (mode === 'sprint') {
    return { short: 15, medium: 30, long: 60 }[length];
  }
  return { short: 30, medium: 60, long: 120 }[length];
};

const getTimerMode = (mode: TypingMode): TimerMode => {
  return mode === 'sprint' ? 'sprint' : mode === 'zen' ? 'zen' : 'countdown';
};

const getTimerDuration = (mode: TypingMode, length: Length): number => {
  return getDurationForModeAndLength(mode, length);
};

export const TypingTest: React.FC<TypingTestProps> = ({
  initialDifficulty = 'intermediate',
  initialLength = 'medium',
  initialTheme = 'general',
  initialChallengeType = 'standard',
  initialLanguage = 'english',
  initialMode = 'zen',
  onModeChange,
  onLanguageChange,
  onDifficultyChange,
  onLengthChange,
  onThemeChange,
  onChallengeTypeChange,
}) => {
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [length, setLength] = useState<Length>(initialLength);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [challengeType, setChallengeType] = useState<ChallengeType>(initialChallengeType);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [mode, setMode] = useState<TypingMode>(initialMode);
  const [isMounted, setIsMounted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const initialText = useCallback(() =>
    getUniquePassage(difficulty, length, theme, challengeType, language),
    [difficulty, length, theme, challengeType, language]
  );
  const [sampleText, setSampleText] = useState(() => initialText());

  const { userInput, stats, isFinished, handleInputChange, reset, inputRef } = useTypingEngine(sampleText);

  const timerDuration = getTimerDuration(mode, length);
  const timerMode = getTimerMode(mode);

  const { formattedTime, isRunning: timerRunning, start: startTimer, reset: resetTimer } = useTimer(
    { mode: timerMode, durationSeconds: timerDuration },
    () => setIsTimeUp(true)
  );

  useEffect(() => {
    setIsMounted(true);
    inputRef.current?.focus();
  }, [inputRef]);

  useEffect(() => {
    setSampleText(initialText());
    setShowResults(false);
    setIsTimeUp(false);
    resetTimer();
  }, [initialText, difficulty, length, theme, challengeType, language, resetTimer, reset]);

  useEffect(() => {
    if (userInput.length > 0 && !timerRunning && mode !== 'zen' && !isTimeUp) {
      startTimer();
    }
  }, [userInput.length, timerRunning, mode, startTimer, isTimeUp]);

  useEffect(() => {
    if (isTimeUp || (isFinished && mode !== 'zen')) {
      setShowResults(true);
    }
  }, [isTimeUp, isFinished, mode]);

  const handleRegenerate = useCallback(() => {
    setSampleText(initialText());
    reset();
    setShowResults(false);
    setIsTimeUp(false);
    resetTimer();
  }, [initialText, reset, resetTimer]);

  const handleModeChange = useCallback((newMode: TypingMode) => {
    setMode(newMode);
    onModeChange?.(newMode);
  }, [onModeChange]);

  const handleLanguageToggle = useCallback(() => {
    const newLanguage = language === 'english' ? 'lao' : 'english';
    setLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  }, [language, onLanguageChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleRegenerate();
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        handleLanguageToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRegenerate, handleLanguageToggle]);

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    onDifficultyChange?.(newDifficulty);
  };

  const handleLengthChange = (newLength: Length) => {
    setLength(newLength);
    onLengthChange?.(newLength);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const handleChallengeTypeChange = (newChallengeType: ChallengeType) => {
    setChallengeType(newChallengeType);
    onChallengeTypeChange?.(newChallengeType);
  };

  if (!isMounted) return null;

  const displayTime = mode === 'zen' 
    ? stats.wpm > 0 
      ? `${Math.floor((Date.now() - (stats.startTime || 0)) / 60000)}:${String(Math.floor(((Date.now() - (stats.startTime || 0)) % 60000) / 1000)).padStart(2, '0')}`
      : '00:00'
    : formattedTime;

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-fade-in">
      <div className="flex justify-between items-end mb-12 px-4">
        <div className="space-y-6">
          <div className="flex gap-16">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Words Per Minute</span>
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-black text-primary tabular-nums tracking-tighter">{stats.wpm}</span>
                <span className="text-xl font-bold text-white/20 uppercase tracking-widest">wpm</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Accuracy</span>
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-black text-white tabular-nums tracking-tighter">{stats.accuracy}</span>
                <span className="text-xl font-bold text-white/20 uppercase tracking-widest">%</span>
              </div>
            </div>
          </div>

          <div className="flex gap-6 text-[11px] font-black tracking-[0.2em] uppercase">
            <button 
              onClick={() => handleModeChange('zen')}
              className={`pb-1 border-b-2 transition-colors ${mode === 'zen' ? 'text-primary border-primary' : 'text-white/20 hover:text-white/40 border-transparent'}`}
            >
              Zen Flow
            </button>
            <button 
              onClick={() => handleModeChange('sprint')}
              className={`pb-1 border-b-2 transition-colors ${mode === 'sprint' ? 'text-primary border-primary' : 'text-white/20 hover:text-white/40 border-transparent'}`}
            >
              Sprint
            </button>
            <button 
              onClick={() => handleModeChange('accuracy')}
              className={`pb-1 border-b-2 transition-colors ${mode === 'accuracy' ? 'text-primary border-primary' : 'text-white/20 hover:text-white/40 border-transparent'}`}
            >
              Accuracy
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-2">
          {mode !== 'zen' && (
            <div className={`flex items-center gap-3 px-6 py-2.5 glass rounded-lg border-white/5 bg-white/[0.03] ${isTimeUp ? 'animate-pulse' : ''}`}>
              <FaClock className={`text-sm ${isTimeUp ? 'text-[#f43f5e]' : 'text-primary/60'}`} />
              <span className={`text-sm font-bold tabular-nums ${isTimeUp ? 'text-[#f43f5e]' : 'text-white/70'}`}>{displayTime}</span>
            </div>
          )}
          <div className="flex items-center gap-3 px-6 py-2.5 glass rounded-lg border-white/5 bg-white/[0.03]">
            <FaGlobe className="text-primary/60 text-sm" />
            <span className="text-sm font-bold text-white/70 uppercase tracking-wider">{language === 'lao' ? 'English + Lao' : 'English Only'}</span>
          </div>
        </div>
      </div>

      <div className="glass rounded-[32px] p-20 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative group overflow-hidden border-white/[0.03] bg-gradient-to-br from-white/[0.02] to-transparent min-h-[400px] flex flex-col justify-center">
        <div
          className="relative text-4xl md:text-5xl font-medium leading-relaxed text-white/10 cursor-text select-none max-w-5xl mx-auto text-left"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="relative z-10 break-words whitespace-pre-wrap">
            {sampleText.split('').map((char, index) => {
              const isTyped = index < userInput.length;
              const isCorrect = isTyped && userInput[index] === char;
              const isCurrent = index === userInput.length;

              let colorClass = 'text-white/10';
              if (isTyped) {
                colorClass = isCorrect ? 'text-white' : 'text-[#f43f5e] underline decoration-[#f43f5e]/50 underline-offset-8';
              }

              if (isCurrent) {
                colorClass = 'text-primary brightness-125 transition-all duration-300';
              }

              return (
                <span key={index} className={`${colorClass} transition-colors duration-150 ${isCurrent ? 'typing-cursor' : ''}`}>
                  {char}
                </span>
              );
            })}
          </div>

          <input
            ref={inputRef}
            type="text"
            className="opacity-0 absolute inset-0 w-full h-full cursor-default caret-transparent"
            value={userInput}
            onChange={handleInputChange}
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>

        <div className="absolute bottom-12 left-0 w-full flex justify-center items-center gap-12 text-white/20">
          <button
            onClick={handleRegenerate}
            className="flex flex-col items-center gap-2 hover:text-white transition-all group"
          >
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
              <FaRotateRight className="text-sm group-hover:rotate-180 transition-transform duration-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Restart (Esc)</span>
          </button>

          <button
            onClick={handleLanguageToggle}
            className="flex flex-col items-center gap-2 hover:text-white transition-all group"
          >
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
              <span className="text-xs font-black">EN</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Switch Language (Tab)</span>
          </button>

          <button
            onClick={() => {
              setDifficulty(d => d === 'beginner' ? 'intermediate' : d === 'intermediate' ? 'advanced' : d === 'advanced' ? 'expert' : 'beginner');
            }}
            className="flex flex-col items-center gap-2 hover:text-white transition-all group"
          >
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
              <span className="text-xs font-black">{difficulty[0].toUpperCase()}</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Difficulty</span>
          </button>
        </div>
      </div>

      {showResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111] p-12 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/10 max-w-md w-full mx-4">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  {isTimeUp ? (
                    <FaX className="text-4xl text-primary" />
                  ) : (
                    <FaCheck className="text-4xl text-primary" />
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">{isTimeUp ? 'Time\'s Up!' : 'Completed!'}</h2>
                <p className="text-white/40 mt-2">
                  {mode === 'zen' ? 'You finished the passage!' : mode === 'sprint' ? 'Sprint completed!' : 'Accuracy run finished!'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="p-4 bg-white/5 rounded-2xl">
                  <div className="text-4xl font-black text-primary">{stats.wpm}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20">WPM</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl">
                  <div className="text-4xl font-black text-white">{stats.accuracy}%</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Accuracy</div>
                </div>
              </div>
              <button
                onClick={() => setShowResults(false)}
                className="w-full bg-primary text-black font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(11,175,231,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};