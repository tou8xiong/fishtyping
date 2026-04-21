"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { getUniquePassage, Difficulty, Length, Theme, ChallengeType, Language } from '../utils/passageGenerator';
import { FaRotateRight, FaXmark, FaLanguage } from "react-icons/fa6";

export const TypingTest = () => {
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

  const { userInput, stats, isFinished, handleInputChange, reset, inputRef } = useTypingEngine(sampleText);

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

  if (!isMounted) return null;

  return (
    <div className="w-full flex flex-col gap-12">
      {/* Settings Bar / Language Switcher */}
      <div className="flex justify-center mb-4">
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
          <button
            onClick={() => setLanguage('english')}
            className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${language === 'english' ? 'bg-primary text-black' : 'text-foreground/40 hover:text-foreground'}`}
          >
            ENGLISH
          </button>
          <button
            onClick={() => setLanguage('lao')}
            className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${language === 'lao' ? 'bg-primary text-black' : 'text-foreground/40 hover:text-foreground'}`}
          >
            LAO (ພາສາລາວ)
          </button>
        </div>
      </div>

      {/* Stats Header */}
      <div className="flex justify-between items-center px-4">
        <div className="flex gap-10">
          <div className="group transition-all">
            <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/30 font-black mb-1 block group-hover:text-primary transition-colors">WPM</span>
            <span className="text-4xl font-black text-foreground tabular-nums leading-none tracking-tighter">
              {stats.wpm}
            </span>
          </div>
          <div className="group transition-all">
            <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/30 font-black mb-1 block group-hover:text-primary transition-colors">ACC</span>
            <span className="text-4xl font-black text-foreground tabular-nums leading-none tracking-tighter">
              {stats.accuracy}<span className="text-lg text-foreground/20 ml-1">%</span>
            </span>
          </div>
          <div className="group transition-all">
            <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/30 font-black mb-1 block group-hover:text-primary transition-colors">ERR</span>
            <span className="text-4xl font-black text-foreground tabular-nums leading-none tracking-tighter">
              {stats.errors}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 shadow-[0_0_8px_rgba(11,175,231,0.5)]"
              style={{ width: `${(userInput.length / sampleText.length) * 100}%` }}
            />
          </div>
          <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{Math.round((userInput.length / sampleText.length) * 100)}%</span>
        </div>
      </div>

      {/* Typing Area */}
      <div
        className="relative text-3xl md:text-4xl font-serif leading-relaxed text-foreground/30 cursor-text select-none min-h-[160px] max-w-4xl mx-auto px-4"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="relative z-10 break-words whitespace-pre-wrap">
          {sampleText.split('').map((char, index) => {
            const isTyped = index < userInput.length;
            const isCorrect = isTyped && userInput[index] === char;
            const isCurrent = index === userInput.length;

            let colorClass = 'text-foreground/20';
            if (isTyped) {
              colorClass = isCorrect ? 'text-foreground' : 'text-red-500 bg-red-500/10 rounded-sm';
            }

            return (
              <span key={index} className={`${colorClass} transition-colors duration-100 ${isCurrent ? 'typing-cursor' : ''}`}>
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

      {/* Actions */}
      <div className="flex justify-center items-center gap-6">
        <button
          onClick={handleRegenerate}
          className="group flex items-center gap-3 px-8 py-3.5 glass glass-hover rounded-xl transition-all"
        >
          <FaRotateRight className="text-primary group-hover:rotate-180 transition-transform duration-500 text-base" />
          <span className="text-xs font-black uppercase tracking-widest">New Passage</span>
        </button>

        <button
          onClick={reset}
          className="p-3.5 glass glass-hover rounded-xl text-foreground/40 hover:text-primary transition-all"
          title="Reset Test (Esc)"
        >
          <FaXmark className="text-lg" />
        </button>

        {isFinished && (
          <button
            className="px-10 py-4 bg-primary text-black font-black rounded-xl shadow-[0_15px_30px_rgba(11,175,231,0.2)] hover:scale-105 active:scale-95 transition-all animate-fade-in"
          >
            SAVE RESULT
          </button>
        )}
      </div>
    </div>
  );
};
