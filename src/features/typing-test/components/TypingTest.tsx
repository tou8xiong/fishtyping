"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { getUniquePassage, Difficulty, Length, Theme, ChallengeType, Language } from '../utils/passageGenerator';
import { FaRotateRight, FaFire, FaRocket, FaKeyboard } from "react-icons/fa6";
import { FiGlobe, FiActivity } from "react-icons/fi";

// Local helper for class names since src/lib/utils doesn't exist yet
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

type Mode = 'ZEN FLOW' | 'SPRINT' | 'ACCURACY';

export const TypingTest = () => {
  const [mode, setMode] = useState<Mode>('ZEN FLOW');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [length, setLength] = useState<Length>('medium');
  const [theme, setTheme] = useState<Theme>('general');
  const [challengeType, setChallengeType] = useState<ChallengeType>('standard');
  const [language, setLanguage] = useState<Language>('english');
  const [isMounted, setIsMounted] = useState(false);

  const initialText = useCallback(() =>
    getUniquePassage(difficulty, length, theme, challengeType, language),
    [difficulty, length, theme, challengeType, language]
  );
  const [sampleText, setSampleText] = useState(() => initialText());

  const { userInput, stats, isFinished, timeElapsed, handleInputChange, reset, inputRef } = useTypingEngine(sampleText);

  useEffect(() => {
    setIsMounted(true);
    inputRef.current?.focus();
  }, [inputRef]);

  useEffect(() => {
    setSampleText(initialText());
    reset();
  }, [initialText, reset]);

  const handleRegenerate = useCallback(() => {
    setSampleText(initialText());
    reset();
  }, [initialText, reset]);

  // Keyboard Shortcuts: Tab for language switch, Esc for restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const cycle: Language[] = ['english', 'lao'];
        const nextIndex = (cycle.indexOf(language) + 1) % cycle.length;
        setLanguage(cycle[nextIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        reset();
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

  const getLanguageLabel = () => {
    switch (language) {
      case 'english': return 'English';
      case 'lao': return 'Lao (ພາສາລາວ)';
      default: return 'English';
    }
  };

  if (!isMounted) return null;

  return (
    <div className="w-full flex flex-col gap-12 border-2 border-transparent max-w-5xl mx-auto mt-40">
      {/* Top Stats & Settings */}
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-start">
          <div className="flex gap-16">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2">Words Per Minute</span>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-primary leading-none tracking-tighter">{stats.wpm}</span>
                <span className="text-xl font-bold text-foreground/40">wpm</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2">Accuracy</span>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black text-foreground leading-none tracking-tighter">{stats.accuracy}</span>
                <span className="text-2xl font-bold text-foreground/40">%</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-full border border-white/5 shadow-inner transition-all hover:bg-white/10">
              <FaFire className={cn("text-sm transition-colors", stats.startTime ? "text-orange-400" : "text-foreground/20")} />
              <span className="text-sm font-bold tabular-nums">{formatTime(timeElapsed)}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-full border border-white/5 shadow-inner transition-all hover:bg-white/10">
              <FiGlobe className="text-primary text-sm" />
              <span className="text-sm font-bold">{getLanguageLabel()}</span>
            </div>
          </div>
        </div>

        {/* Mode Selection Tabs */}
        <div className="flex gap-8 border-b border-white/5 pb-2">
          {['ZEN FLOW', 'SPRINT', 'ACCURACY'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as Mode)}
              className={cn(
                "text-xs font-black tracking-widest transition-all relative pb-4",
                mode === m ? "text-primary" : "text-foreground/40 hover:text-foreground"
              )}
            >
              {m}
              {mode === m && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(11,175,231,0.5)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Typing Area */}
      <div className="relative">
        <div
          className="bg-[#121212] rounded-3xl p-16 md:p-24 min-h-[440px] flex flex-col items-center relative group cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="flex-1 flex items-center justify-center w-full mb-12">
            <div className="max-w-3xl text-3xl md:text-4xl font-medium leading-[1.6] tracking-tight text-foreground/20 select-none whitespace-pre-wrap text-left">
              {sampleText.split('').map((char, index) => {
                const isTyped = index < userInput.length;
                const isCorrect = isTyped && userInput[index] === char;
                const isCurrent = index === userInput.length;

                return (
                  <span
                    key={index}
                    className={cn(
                      "transition-all duration-150 relative inline",
                      isTyped && (isCorrect ? "text-foreground/80" : "text-red-400 bg-red-400/10 rounded-sm"),
                      isCurrent && "text-foreground/20"
                    )}
                  >
                    {char}
                    {isCurrent && (
                      <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-primary shadow-[0_0_8px_rgba(11,175,231,0.8)] animate-pulse" />
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

          {/* Action Buttons - Now in the flow, not absolute */}
          <div className="flex items-center gap-12 mt-auto">
            <button
              onClick={reset}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary transition-colors">
                <FaRotateRight className="text-foreground/40 group-hover:text-black text-sm transition-colors" />
              </div>
              <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest group-hover:text-foreground/60 transition-colors">Restart (Esc)</span>
            </button>

            <button
              onClick={() => {
                const cycle: Language[] = ['english', 'lao'];
                const nextIndex = (cycle.indexOf(language) + 1) % cycle.length;
                setLanguage(cycle[nextIndex]);
              }}
              className="flex items-center gap-4 px-10 py-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/20 transition-all group"
            >
              <div className="bg-white/10 px-3 py-1.5 rounded-lg text-[11px] font-black text-foreground/60 group-hover:bg-primary group-hover:text-black transition-colors">Tab</div>
              <span className="text-xs font-black text-foreground/40 uppercase tracking-widest group-hover:text-foreground/80 transition-colors">Switch Language</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        {[
          {
            title: "Power Mode",
            desc: "Reach 100 WPM to activate kinetic screen effects and double your experience points.",
            icon: <FaRocket className="text-primary text-xl" />
          },
          {
            title: "Flow State",
            desc: "Focus on the word center. Avoid looking at your stats until the timer finishes for maximum speed.",
            icon: <FiActivity className="text-secondary text-xl" />
          },
          {
            title: "Native Support",
            desc: "Full support for Lao and English scripts with zero-latency input mapping for maximum accuracy.",
            icon: <FaKeyboard className="text-primary text-xl" />
          }
        ].map((card, i) => (
          <div key={i} className="p-8 bg-[#121212] rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {card.icon}
            </div>
            <h3 className="text-lg font-black mb-3 tracking-tight">{card.title}</h3>
            <p className="text-sm text-foreground/40 font-medium leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
