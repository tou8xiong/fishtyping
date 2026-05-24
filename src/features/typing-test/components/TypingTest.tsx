"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { trackPassageResult, Difficulty, Language, WORD_COUNT_BY_DIFFICULTY, DEFAULT_PASSAGES } from '../utils/passageGenerator';
import { getBeginnerPhase, getLetterPracticeText, trackBeginnerProgress } from '../utils/beginnerProgress';
import { FaRotateRight } from "react-icons/fa6";
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner';
import { ResultChart } from './ResultChart';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const TypingTest = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.defaultDifficulty);
  const [language, setLanguage] = useState<Language>(settings.defaultLanguage);
  const [isMounted, setIsMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPassageId, setCurrentPassageId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [lastTypingTime, setLastTypingTime] = useState<number>(Date.now());
  const [beginnerPhase, setBeginnerPhase] = useState<'letters' | 'words'>('letters');

  const inputRef = useRef<HTMLInputElement>(null);
  const typingAudioRef = useRef<HTMLAudioElement | null>(null);
  const prevInputLengthRef = useRef(0);
  const soundIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSoundActive, setIsSoundActive] = useState(false);

  const [sampleText, setSampleText] = useState('');

  const { userInput, stats, samples, timeElapsed, isFinished, isPaused, handleInputChange, reset, pause } = useTypingEngine(sampleText);

  // Preload the typing sound effect once and let it loop
  useEffect(() => {
    const audio = new Audio('/audio/virtualzero-mechanical-keyboard-typing-hd-372290.mp3');
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = 0.45;
    typingAudioRef.current = audio;
    return () => {
      audio.pause();
      typingAudioRef.current = null;
    };
  }, []);

  // Mark the sound as active on each new keystroke; idle it after ~1s of no typing.
  useEffect(() => {
    const grew = userInput.length > prevInputLengthRef.current;
    prevInputLengthRef.current = userInput.length;
    if (!grew || isFinished) return;

    setIsSoundActive(true);
    if (soundIdleTimerRef.current) clearTimeout(soundIdleTimerRef.current);
    soundIdleTimerRef.current = setTimeout(() => setIsSoundActive(false), 1000);
  }, [userInput, isFinished]);

  // Drive playback off the active flag — start when active, pause when idle/finished.
  useEffect(() => {
    const audio = typingAudioRef.current;
    if (!audio) return;
    if (isSoundActive && settings.soundEffects && !isFinished) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isSoundActive, settings.soundEffects, isFinished]);

  // Stop the sound the moment the passage is completed.
  useEffect(() => {
    if (!isFinished) return;
    setIsSoundActive(false);
    if (soundIdleTimerRef.current) {
      clearTimeout(soundIdleTimerRef.current);
      soundIdleTimerRef.current = null;
    }
    typingAudioRef.current?.pause();
  }, [isFinished]);

  // Pause the test when the user moves the mouse (typing auto-resumes).
  useEffect(() => {
    if (!stats.startTime || isFinished) return;
    let lastX = -1;
    let lastY = -1;
    const handleMouseMove = (e: MouseEvent) => {
      // Ignore the first event so initial cursor position doesn't trigger a pause.
      if (lastX === -1) {
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
      const dx = Math.abs(e.clientX - lastX);
      const dy = Math.abs(e.clientY - lastY);
      lastX = e.clientX;
      lastY = e.clientY;
      // Only react to non-trivial movements so micro-jitter doesn't pause.
      if (dx + dy > 4) {
        pause();
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [stats.startTime, isFinished, pause]);

  // Keep the hidden input focused at all times so the user can just type
  // without clicking. Re-focus on blur and on tab visibility changes.
  useEffect(() => {
    if (isFinished) return;
    const refocus = () => {
      if (!isFinished && inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    };
    const handleBlur = () => setTimeout(refocus, 0);
    const handleClick = () => refocus();
    const handleVisibility = () => { if (!document.hidden) refocus(); };
    refocus();
    inputRef.current?.addEventListener('blur', handleBlur);
    window.addEventListener('click', handleClick);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      inputRef.current?.removeEventListener('blur', handleBlur);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isFinished, isMounted, sampleText]);

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

  // Saving is deferred to the "Next" button on the completion screen — see
  // handleNext below. This avoids saving partial results when the user resets
  // mid-test, and lets the run be recorded for every difficulty (including
  // beginner/letters, which has a null passage_id).

  // Track beginner progress
  useEffect(() => {
    if (isFinished && difficulty === 'beginner' && beginnerPhase === 'letters') {
      const correctLetters = userInput.split('').filter((char, i) => char === sampleText[i]).length;
      trackBeginnerProgress(userInput.length, correctLetters);

      // Check if user should transition to words
      const newPhase = getBeginnerPhase();
      if (newPhase === 'words') {
        setBeginnerPhase('words');
      }
    }
  }, [isFinished, beginnerPhase, userInput, sampleText]);

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

      console.log('Loading new passage, currentPassageId:', currentPassageId);
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
        console.log('API response:', data);
        setSampleText(data.passage);
        setCurrentPassageId(data.passageId || null);
      } else {
        // Use default passages
        setSampleText(DEFAULT_PASSAGES[difficulty][language]);
        setCurrentPassageId(null);
      }
    } catch (error) {
      console.error('API error:', error);
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

  // Called by the "Next" button on the completion screen. Persists the run
  // for every difficulty (passage_id may be null for fallback/letters runs)
  // and then advances to a fresh passage.
  const handleNext = useCallback(async () => {
    if (isFinished && stats.wpm >= 0 && user?.id) {
      try {
        await trackPassageResult({
          passageId: currentPassageId,
          difficulty,
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          durationMs: timeElapsed,
          userId: user.id,
        });
      } catch (err) {
        console.error('Failed to save result:', err);
        toast.error('Failed to save your result');
      }
    }
    await handleReset();
  }, [isFinished, stats.wpm, stats.accuracy, timeElapsed, currentPassageId, difficulty, user?.id, handleReset]);

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
        return 'text-xl md:text-2xl';
      case 'medium':
        return 'text-2xl md:text-3xl';
      case 'large':
        return 'text-3xl md:text-4xl';
      default:
        return 'text-2xl md:text-3xl';
    }
  };

  if (!isMounted) return null;

  return (
    <div className="w-[calc(100%-190px)] mx-auto h-full flex flex-col gap-6 px-2">
      {/* Controls and Stats Row - Hide when typing */}
      {!isTyping && (
        <div className="w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Level and Language Controls */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Difficulty Level */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider text-center">Level</span>
              <div className="flex gap-2">
                {(['beginner', 'advanced', 'expert'] as Difficulty[]).map((level) => {
                  const isActive = difficulty === level;
                  const isExpert = level === 'expert';
                  const handleClick = () => {
                    if (level !== difficulty && level === 'expert') {
                      toast('Expert mode', {
                        description: 'Only Expert runs are ranked on the leaderboard.',
                        icon: '🏆',
                      });
                    }
                    setDifficulty(level);
                  };
                  return (
                    <button
                      key={level}
                      onClick={handleClick}
                      className={cn(
                        "px-6 py-2.5 text-xs font-bold rounded-lg transition-all duration-75 border",
                        isActive && isExpert &&
                          "bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.5)]",
                        isActive && !isExpert &&
                          "bg-primary text-black border-primary shadow-[0_0_12px_rgba(11,175,231,0.4)]",
                        !isActive && isExpert &&
                          "bg-amber-500/5 text-amber-300/80 border-amber-400/30 hover:border-amber-400/70 hover:text-amber-200",
                        !isActive && !isExpert &&
                          "bg-white/5 text-white/60 border-white/10 hover:border-primary/50 hover:text-white/90"
                      )}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  );
                })}
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
          <div className="rounded-2xl px-4 md:px-8 py-4 min-h-[300px] flex flex-col items-center justify-center relative">
            <div className="flex flex-col items-center justify-center gap-4">
              <FaRotateRight className="text-4xl text-primary animate-spin" />
              <p className="text-xl text-foreground/50">Loading passage...</p>
            </div>
          </div>
        ) : isFinished ? (
          <div className="rounded-2xl px-4 md:px-8 py-6 min-h-[300px] relative">
            <div className="flex flex-col md:flex-row md:items-stretch gap-8">
              {/* Left: large WPM + ACC */}
              <div className="flex md:flex-col gap-8 md:gap-4 md:min-w-[140px] md:pr-4 md:border-r md:border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs lowercase tracking-wider text-foreground/50">wpm</span>
                  <span className="text-6xl md:text-7xl font-light text-yellow-400 leading-none">
                    {stats.wpm}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs lowercase tracking-wider text-foreground/50">acc</span>
                  <span className="text-6xl md:text-7xl font-light text-yellow-400 leading-none">
                    {stats.accuracy}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs lowercase tracking-wider text-foreground/50">time</span>
                  <span className="text-2xl font-light text-foreground/80 leading-none">
                    {formatTime(timeElapsed)}
                  </span>
                </div>
              </div>

              {/* Right: chart */}
              <div className="flex-1 min-w-0">
                <ResultChart samples={samples} />
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-all"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl px-4 md:px-8 py-4 min-h-[300px] flex items-center justify-center relative group cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            <div className="w-full">
              <div className={cn(
                "w-full font-normal leading-relaxed tracking-wide text-foreground/40 select-none break-words [overflow-wrap:anywhere]",
                difficulty === 'beginner' ? 'text-center' : 'text-left',
                language === 'lao' ? 'font-lao' : getFontClass(),
                getFontSizeClass()
              )}>
                {(() => {
                  const tokens = sampleText.split(/(\s+|[—–])/);
                  let charIndex = 0;
                  return tokens.map((token, tokenIdx) => {
                    if (!token) return null;
                    const isBreakable = /^(\s+|[—–])$/.test(token);
                    const chars = token.split('').map((char) => {
                      const index = charIndex++;
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
                          {/* Subtle line behind text the user has already typed */}
                          {isTyped && (
                            <span className={cn(
                              "absolute left-0 right-0 bottom-[0.05em] h-[2px] pointer-events-none",
                              isCorrect ? "bg-primary/25" : "bg-red-400/30"
                            )} />
                          )}
                          {char}
                          {isCurrent && (
                            <span className={cn(
                              "absolute left-0 top-[0.1em] bottom-[0.1em] w-[2px] bg-primary rounded-full shadow-[0_0_10px_rgba(11,175,231,0.7)]",
                              settings.smoothCaret ? "animate-pulse" : ""
                            )} />
                          )}
                        </span>
                      );
                    });

                    if (isBreakable) {
                      return <React.Fragment key={`br-${tokenIdx}`}>{chars}</React.Fragment>;
                    }
                    return (
                      <span key={`w-${tokenIdx}`} className="inline-block whitespace-nowrap">
                        {chars}
                      </span>
                    );
                  });
                })()}
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

        {/* Paused indicator — sits below the passage so it never overlaps the text */}
        {isPaused && !isFinished && (
          <div className="flex justify-center mt-4">
            <div className="px-4 py-2 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-xs uppercase tracking-[0.3em] text-foreground/70">
              Paused — type to resume
            </div>
          </div>
        )}
      </div>

      {/* Action Icons Below Typing Area - Hide when actively typing, show when idle or paused */}
      {(!isTyping || isPaused) && !isFinished && (
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