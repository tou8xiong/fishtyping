"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { trackPassageResult, Difficulty, Language, WORD_COUNT_BY_DIFFICULTY, DEFAULT_PASSAGES } from '../utils/passageGenerator';
import { getBeginnerPhase, getLetterPracticeText, trackBeginnerProgress } from '../utils/beginnerProgress';
import { FaRotateRight } from "react-icons/fa6";
import { useSettings } from '@/contexts/SettingsContext';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const TypingTest = () => {
  const { settings } = useSettings();
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.defaultDifficulty);
  const [language, setLanguage] = useState<Language>(settings.defaultLanguage);
  const [isMounted, setIsMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPassageId, setCurrentPassageId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [lastTypingTime, setLastTypingTime] = useState<number>(Date.now());
  const [beginnerPhase, setBeginnerPhase] = useState<'letters' | 'words'>('letters');

  const inputRef = useRef<HTMLInputElement>(null);

  const [sampleText, setSampleText] = useState('');

  const { userInput, stats, timeElapsed, isFinished, handleInputChange, reset } = useTypingEngine(sampleText);

  // Update difficulty and language when settings change
  useEffect(() => {
    setDifficulty(settings.defaultDifficulty);
    setLanguage(settings.defaultLanguage);
  }, [settings.defaultDifficulty, settings.defaultLanguage]);

  // Check beginner phase on mount
  useEffect(() => {
    if (difficulty === 'beginner') {
      setBeginnerPhase(getBeginnerPhase());
    }
  }, [difficulty]);

  // Track when user starts typing and update last typing time
  useEffect(() => {
    if (userInput.length > 0 && !isFinished) {
      setIsTyping(true);
      setLastTypingTime(Date.now());
    } else if (userInput.length === 0) {
      setIsTyping(false);
    }
  }, [userInput, isFinished]);

  // Auto-exit focus mode after 5 seconds of inactivity
  useEffect(() => {
    if (!isTyping || isFinished) return;

    const checkInactivity = setInterval(() => {
      const timeSinceLastTyping = Date.now() - lastTypingTime;
      if (timeSinceLastTyping >= 5000) {
        setIsTyping(false);
      }
    }, 100);

    return () => clearInterval(checkInactivity);
  }, [isTyping, lastTypingTime, isFinished]);

  useEffect(() => {
    setIsMounted(true);
    inputRef.current?.focus();
  }, []);

  // Save results when typing is finished (only for Expert level)
  useEffect(() => {
    if (isFinished && currentPassageId && stats.wpm > 0 && difficulty === 'expert') {
      trackPassageResult({
        passageId: currentPassageId,
        difficulty: difficulty,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        durationMs: timeElapsed,
      }).catch(err => console.error('Failed to save result:', err));
    }

    // Track beginner progress
    if (isFinished && difficulty === 'beginner' && beginnerPhase === 'letters') {
      const correctLetters = userInput.split('').filter((char, i) => char === sampleText[i]).length;
      trackBeginnerProgress(userInput.length, correctLetters);

      // Check if user should transition to words
      const newPhase = getBeginnerPhase();
      if (newPhase === 'words') {
        setBeginnerPhase('words');
      }
    }
  }, [isFinished, currentPassageId, stats.wpm, stats.accuracy, timeElapsed, difficulty, beginnerPhase, userInput, sampleText]);

  const loadNewPassage = useCallback(async () => {
    setIsGenerating(true);
    try {
      // For beginner level in letters phase, use letter practice
      if (difficulty === 'beginner' && beginnerPhase === 'letters') {
        setSampleText(getLetterPracticeText(language));
        setCurrentPassageId(null);
        setIsGenerating(false);
        return;
      }

      const response = await fetch('/api/generate-passage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty,
          length: 'medium',
          language,
          excludePassageId: currentPassageId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSampleText(data.passage);
        setCurrentPassageId(data.passageId || null);
      } else {
        // Use default passages
        setSampleText(DEFAULT_PASSAGES[difficulty][language]);
        setCurrentPassageId(null);
      }
    } catch (error) {
      // Use default passages on error
      setSampleText(DEFAULT_PASSAGES[difficulty][language]);
      setCurrentPassageId(null);
    }
    setIsGenerating(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, language, beginnerPhase]);

  const handleReset = useCallback(async () => {
    reset();
    await loadNewPassage();
  }, [reset, loadNewPassage]);

  // Load initial passage on mount and when settings change
  useEffect(() => {
    if (!isMounted) return;

    // Reset typing state when difficulty or language changes
    reset();
    loadNewPassage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, difficulty, language, beginnerPhase]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const cycle: Language[] = ['english', 'lao'];
        const nextIndex = (cycle.indexOf(language) + 1) % cycle.length;
        setLanguage(cycle[nextIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [language, handleReset]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get font family class based on settings
  const getFontClass = () => {
    switch (settings.fontFamily) {
      case 'jetbrains':
        return 'font-mono';
      case 'crimson':
        return 'font-serif';
      case 'garamond':
        return 'font-serif';
      default:
        return 'font-mono';
    }
  };

  // Get font size class based on settings
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small':
        return isTyping ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl';
      case 'medium':
        return isTyping ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl';
      case 'large':
        return isTyping ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl';
      default:
        return isTyping ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl';
    }
  };

  if (!isMounted) return null;

  return (
    <div className="w-[calc(100%-190px)] mx-auto h-full flex flex-col gap-6 px-2">
      {/* Fish Icon - Always visible at top */}
      <div className="flex items-center justify-center">
        <svg width="48" height="52" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 12.5L9 1V12.5H1ZM4.825 10.5H7V7.375L4.825 10.5ZM10.5 12.5C10.7 12.0333 10.9167 11.2167 11.15 10.05C11.3833 8.88333 11.5 7.7 11.5 6.5C11.5 5.3 11.3875 4.06667 11.1625 2.8C10.9375 1.53333 10.7167 0.6 10.5 0C11.5167 0.3 12.5292 0.858333 13.5375 1.675C14.5458 2.49167 15.4542 3.46667 16.2625 4.6C17.0708 5.73333 17.7292 6.97917 18.2375 8.3375C18.7458 9.69583 19 11.0833 19 12.5H10.5ZM13.1 10.5H16.8C16.5167 9.21667 16.0542 8.04167 15.4125 6.975C14.7708 5.90833 14.0917 5 13.375 4.25C13.4083 4.6 13.4375 4.9625 13.4625 5.3375C13.4875 5.7125 13.5 6.1 13.5 6.5C13.5 7.28333 13.4625 8.00833 13.3875 8.675C13.3125 9.34167 13.2167 9.95 13.1 10.5ZM7 18C6.4 18 5.84167 17.8583 5.325 17.575C4.80833 17.2917 4.36667 16.9333 4 16.5C3.76667 16.75 3.5125 16.9833 3.2375 17.2C2.9625 17.4167 2.65833 17.5917 2.325 17.725C1.74167 17.2917 1.24583 16.7542 0.8375 16.1125C0.429167 15.4708 0.15 14.7667 0 14H20C19.85 14.7667 19.5708 15.4708 19.1625 16.1125C18.7542 16.7542 18.2583 17.2917 17.675 17.725C17.3417 17.5917 17.0375 17.4167 16.7625 17.2C16.4875 16.9833 16.2333 16.75 16 16.5C15.6167 16.9333 15.1708 17.2917 14.6625 17.575C14.1542 17.8583 13.6 18 13 18C12.4 18 11.8417 17.8583 11.325 17.575C10.8083 17.2917 10.3667 16.9333 10 16.5C9.63333 16.9333 9.19167 17.2917 8.675 17.575C8.15833 17.8583 7.6 18 7 18ZM0 22V20H1C1.53333 20 2.05417 19.9167 2.5625 19.75C3.07083 19.5833 3.55 19.3333 4 19C4.45 19.3333 4.92917 19.5792 5.4375 19.7375C5.94583 19.8958 6.46667 19.975 7 19.975C7.53333 19.975 8.05 19.8958 8.55 19.7375C9.05 19.5792 9.53333 19.3333 10 19C10.45 19.3333 10.9292 19.5792 11.4375 19.7375C11.9458 19.8958 12.4667 19.975 13 19.975C13.5333 19.975 14.05 19.8958 14.55 19.7375C15.05 19.5792 15.5333 19.3333 16 19C16.4667 19.3333 16.95 19.5833 17.45 19.75C17.95 19.9167 18.4667 20 19 20H20V22H19C18.4833 22 17.975 21.9375 17.475 21.8125C16.975 21.6875 16.4833 21.5 16 21.25C15.5167 21.5 15.025 21.6875 14.525 21.8125C14.025 21.9375 13.5167 22 13 22C12.4833 22 11.975 21.9375 11.475 21.8125C10.975 21.6875 10.4833 21.5 10 21.25C9.51667 21.5 9.025 21.6875 8.525 21.8125C8.025 21.9375 7.51667 22 7 22C6.48333 22 5.975 21.9375 5.475 21.8125C4.975 21.6875 4.48333 21.5 4 21.25C3.51667 21.5 3.025 21.6875 2.525 21.8125C2.025 21.9375 1.51667 22 1 22H0Z" fill="#0BAFE7" />
        </svg>
      </div>

      {/* Controls and Stats Row - Hide when typing */}
      {!isTyping && (
        <div className="w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Level and Language Controls */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Difficulty Level */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider text-center">Level</span>
              <div className="flex gap-2">
                {(['beginner', 'advanced', 'expert'] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={cn(
                      "px-6 py-2.5 text-xs font-bold rounded-lg transition-all duration-75 border",
                      difficulty === level
                        ? "bg-primary text-black border-primary shadow-[0_0_12px_rgba(11,175,231,0.4)]"
                        : "bg-white/5 text-white/60 border-white/10 hover:border-primary/50 hover:text-white/90"
                    )}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider text-center">Language</span>
              <div className="flex gap-2">
                {(['english', 'lao'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={cn(
                      "px-6 py-2.5 text-xs font-bold rounded-lg transition-all duration-75 border",
                      language === lang
                        ? "bg-primary text-black border-primary shadow-[0_0_12px_rgba(11,175,231,0.4)]"
                        : "bg-white/5 text-white/60 border-white/10 hover:border-primary/50 hover:text-white/90"
                    )}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider mb-1">WPM</span>
              <span className="text-3xl font-black text-yellow-500">{stats.wpm}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider mb-1">ACC</span>
              <span className="text-3xl font-black text-yellow-500">{stats.accuracy}%</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider mb-1">TIME</span>
              <span className="text-3xl font-black text-yellow-500">{formatTime(timeElapsed)}</span>
            </div>
          </div>
        </div>
      )}

      {/* WPM Display - Show when typing */}
      {isTyping && !isFinished && settings.showLiveWpm && (
        <div className="w-full mx-auto flex justify-end animate-fade-in">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider mb-1">WPM</span>
            <span className="text-5xl font-black text-yellow-500">{stats.wpm}</span>
          </div>
        </div>
      )}

      {/* Main Typing Area */}
      <div className="w-full mx-auto">
        {isGenerating ? (
          <div className="bg-[#0a1929]/80 backdrop-blur-sm rounded-2xl p-12 md:p-16 min-h-[400px] flex flex-col items-center justify-center relative border border-primary/10">
            <div className="flex flex-col items-center justify-center gap-4">
              <FaRotateRight className="text-4xl text-primary animate-spin" />
              <p className="text-xl text-foreground/50">Loading passage...</p>
            </div>
          </div>
        ) : isFinished ? (
          <div className="bg-[#0a1929]/20 backdrop-blur-sm rounded-2xl p-12 md:p-16 min-h-[400px] flex flex-col items-center justify-center relative border border-primary/20">
            <div className="flex flex-col items-center justify-center gap-8">
              <h2 className="text-3xl font-bold text-primary">Test Complete!</h2>

              <div className="grid grid-cols-3 gap-8">
                <div className="flex flex-col items-center">
                  <span className="text-sm text-foreground/60 mb-2">WPM</span>
                  <span className="text-5xl font-black text-yellow-500">{stats.wpm}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm text-foreground/60 mb-2">Accuracy</span>
                  <span className="text-5xl font-black text-yellow-500">{stats.accuracy}%</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm text-foreground/60 mb-2">Time</span>
                  <span className="text-5xl font-black text-yellow-500">{formatTime(timeElapsed)}</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-8 py-4 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-all text-lg"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "bg-[#0a1929]/20 backdrop-blur-sm rounded-2xl p-12 md:p-16 flex items-center justify-center relative group cursor-text border border-primary/10 transition-all duration-500",
              isTyping ? "min-h-[50vh]" : "min-h-[400px]"
            )}
            onClick={() => inputRef.current?.focus()}
          >
            <div className="w-full">
              <div className={cn(
                "w-full font-normal leading-loose tracking-wide text-foreground/40 select-none whitespace-pre-wrap transition-all duration-500",
                difficulty === 'beginner' ? 'text-center' : 'text-left',
                getFontClass(),
                getFontSizeClass()
              )}>
                {sampleText.split('').map((char, index) => {
                  const isTyped = index < userInput.length;
                  const isCorrect = isTyped && userInput[index] === char;
                  const isCurrent = index === userInput.length;

                  return (
                    <span
                      key={index}
                      className={cn(
                        "transition-all relative inline",
                        settings.smoothCaret ? "duration-75" : "duration-0",
                        isTyped && (isCorrect ? "text-primary" : "text-red-400"),
                        isCurrent && "text-foreground/60"
                      )}
                    >
                      {char}
                      {isCurrent && (
                        <div className={cn(
                          "absolute -bottom-0.5 left-0 w-full h-0.5 bg-primary shadow-[0_0_4px_rgba(11,175,231,0.5)]",
                          settings.smoothCaret ? "animate-pulse" : ""
                        )} />
                      )}
                    </span>
                  );
                })}
              </div>
            </div>

            <input
              ref={inputRef}
              type="text"
              className="opacity-0 border-2 absolute inset-0 w-full h-full cursor-default"
              value={userInput}
              onChange={handleInputChange}
              autoFocus
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        )}
      </div>

      {/* Action Icons Below Typing Area - Hide when typing */}
      {!isTyping && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground/50 hover:text-foreground transition-all border border-white/10 hover:border-white/20"
            title="New Passage"
          >
            <FaRotateRight className="text-base" />
          </button>

          <button
            onClick={() => window.location.href = '/settings'}
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground/50 hover:text-foreground transition-all border border-white/10 hover:border-white/20"
            title="Settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};