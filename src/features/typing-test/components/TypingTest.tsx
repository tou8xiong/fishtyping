"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { getUniquePassage, generatePassageWithGemini, Difficulty, Length, Theme, ChallengeType, Language } from '../utils/passageGenerator';
import { FaRotateRight } from "react-icons/fa6";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const TypingTest = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [length, setLength] = useState<Length>('medium');
  const [theme, setTheme] = useState<Theme>('general');
  const [challengeType, setChallengeType] = useState<ChallengeType>('standard');
  const [language, setLanguage] = useState<Language>('english');
  const [showPassage, setShowPassage] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const initialText = useCallback(() =>
    getUniquePassage(difficulty, length, theme, challengeType, language),
    [difficulty, length, theme, challengeType, language]
  );
  const [sampleText, setSampleText] = useState(() => initialText());

  const { userInput, stats, timeElapsed, handleInputChange, reset } = useTypingEngine(sampleText);

  useEffect(() => {
    setIsMounted(true);
    inputRef.current?.focus();
  }, []);

  const handleRegenerate = useCallback(async () => {
    setIsGenerating(true);
    setShowPassage(false);
    try {
      const passage = await generatePassageWithGemini({
        difficulty,
        length,
        theme,
        challengeType,
        language,
      });
      setSampleText(passage);
    } catch (error) {
      console.error('Failed to generate passage:', error);
      setSampleText(initialText());
    }
    setIsGenerating(false);
  }, [difficulty, length, theme, challengeType, language, initialText]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (!isMounted) return;
    setShowPassage(false);
    setIsGenerating(true);
    generatePassageWithGemini({
      difficulty,
      length,
      theme,
      challengeType,
      language,
    })
      .then((passage) => {
        setSampleText(passage);
        reset();
      })
      .catch((error) => {
        console.error('Failed to generate passage:', error);
        setSampleText(initialText());
      })
      .finally(() => {
        setIsGenerating(false);
      });
  // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [difficulty, length, theme, challengeType, language]);

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
  }, [language, reset]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isMounted) return null;

  return (
    <div className="w-full flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Top Controls Row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-xs font-bold text-white appearance-none cursor-pointer"
          >
            <option value="beginner" className="bg-black text-white">Beginner</option>
            <option value="intermediate" className="bg-black text-white">Intermediate</option>
            <option value="advanced" className="bg-black text-white">Advanced</option>
            <option value="expert" className="bg-black text-white">Expert</option>
          </select>
          <select
            value={length}
            onChange={(e) => setLength(e.target.value as Length)}
            className="px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-xs font-bold text-white appearance-none cursor-pointer"
          >
            <option value="short" className="bg-black text-white">Short</option>
            <option value="medium" className="bg-black text-white">Medium</option>
            <option value="long" className="bg-black text-white">Long</option>
          </select>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className="px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-xs font-bold text-white appearance-none cursor-pointer"
          >
            <option value="general" className="bg-black text-white">General</option>
            <option value="technology" className="bg-black text-white">Technology</option>
            <option value="nature" className="bg-black text-white">Nature</option>
            <option value="science" className="bg-black text-white">Science</option>
            <option value="history" className="bg-black text-white">History</option>
          </select>
          <select
            value={challengeType}
            onChange={(e) => setChallengeType(e.target.value as ChallengeType)}
            className="px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-xs font-bold text-white appearance-none cursor-pointer"
          >
            <option value="standard" className="bg-black text-white">Standard</option>
            <option value="punctuation" className="bg-black text-white">Punctuation</option>
            <option value="numbers" className="bg-black text-white">Numbers</option>
            <option value="speed" className="bg-black text-white">Speed</option>
          </select>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-xs font-bold text-white appearance-none cursor-pointer"
          >
            <option value="english" className="bg-black text-white">English</option>
            <option value="lao" className="bg-black text-white">Lao</option>
          </select>
        </div>

        {/* Right Stats */}
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest mb-1">WPM</span>
            <span className="text-4xl font-black text-secondary">{stats.wpm}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest mb-1">ACC</span>
            <span className="text-4xl font-black text-secondary">{stats.accuracy}%</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest mb-1">TIME</span>
            <span className="text-4xl font-black text-secondary">{formatTime(timeElapsed)}</span>
          </div>
        </div>
      </div>

      {/* Main Typing Area */}
      <div className="relative">
        {!showPassage ? (
          <div className="bg-[#1a2332] rounded-3xl p-16 md:p-20 min-h-[320px] flex flex-col items-center justify-center relative group cursor-text border border-white/5">
            <div className="flex-1 flex flex-col items-center justify-center w-full gap-8">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-medium leading-relaxed text-foreground/60">
                  {isGenerating ? 'Generating passage...' : sampleText.slice(0, 100)}...
                </p>
              </div>
              <button
                onClick={() => {
                  if (isGenerating) return;
                  setIsGenerating(true);
                  generatePassageWithGemini({
                    difficulty,
                    length,
                    theme,
                    challengeType,
                    language,
                  })
                    .then((passage) => {
                      setSampleText(passage);
                      setShowPassage(true);
                      reset();
                    })
                    .catch((error) => {
                      console.error('Failed to generate passage:', error);
                      setSampleText(initialText());
                      setShowPassage(true);
                      reset();
                    })
                    .finally(() => {
                      setIsGenerating(false);
                    });
                }}
                disabled={isGenerating}
                className="px-8 py-4 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaRotateRight className={`text-lg ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : 'Start Typing'}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="bg-[#1a2332] rounded-3xl p-16 md:p-20 min-h-[320px] flex flex-col items-center justify-center relative group cursor-text border border-white/5"
            onClick={() => inputRef.current?.focus()}
          >
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="max-w-3xl text-3xl md:text-3xl font-medium leading-[1.9] tracking-tight text-foreground/50 select-none whitespace-pre-wrap text-center">
                {sampleText.split('').map((char, index) => {
                  const isTyped = index < userInput.length;
                  const isCorrect = isTyped && userInput[index] === char;
                  const isCurrent = index === userInput.length;

                  return (
                    <span
                      key={index}
                      className={cn(
                        "transition-all duration-100 relative inline",
                        isTyped && (isCorrect ? "text-primary" : "text-red-400"),
                        isCurrent && "text-foreground/70"
                      )}
                    >
                      {char}
                      {isCurrent && (
                        <div className="absolute -bottom-0.5 left-0 w-full h-[3px] bg-primary shadow-[0_0_6px_rgba(11,175,231,0.6)] animate-pulse" />
                      )}
                    </span>
                  );
                })}
              </div>
            </div>

            <input
              ref={inputRef}
              type="text"
              className="opacity-0 absolute inset-0 w-full h-full cursor-default"
              value={userInput}
              onChange={handleInputChange}
              autoFocus
              autoComplete="off"
              spellCheck="false"
            />

            {/* Action Icons at Bottom */}
            <div className="flex items-center gap-6 mt-12">
              <button
                onClick={handleReset}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-foreground/60 hover:text-foreground transition-all border border-white/5 hover:border-white/10"
              >
                <FaRotateRight className="text-lg" />
              </button>

              <button
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-foreground/60 hover:text-foreground transition-all border border-white/5 hover:border-white/10"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};