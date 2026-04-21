"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { getUniquePassage, Difficulty, Length, Theme, ChallengeType } from '../utils/passageGenerator';

export const TypingTest = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [length, setLength] = useState<Length>('medium');
  const [theme, setTheme] = useState<Theme>('general');
  const [challengeType, setChallengeType] = useState<ChallengeType>('standard');
  const [isMounted, setIsMounted] = useState(false);

  const initialText = useCallback(() => getUniquePassage(difficulty, length, theme, challengeType), [difficulty, length, theme, challengeType]);
  const [sampleText, setSampleText] = useState(() => initialText());

  const { userInput, stats, isFinished, handleInputChange, reset, inputRef } = useTypingEngine(sampleText);

  useEffect(() => {
    setIsMounted(true);
    inputRef.current?.focus();
  }, [inputRef]);

  useEffect(() => {
    setSampleText(initialText());
  }, [initialText]);

  const handleRegenerate = useCallback(() => {
    setSampleText(initialText());
    reset();
  }, [initialText, reset]);

  if (!isMounted) return null;

  return (
    <div className="w-full flex flex-col gap-16">
      {/* Stats Header */}
      <div className="flex justify-between items-center px-4">
        <div className="flex gap-12">
          <div className="group transition-all">
            <span className="text-xs uppercase tracking-[0.2em] text-foreground/30 font-black mb-1 block group-hover:text-primary transition-colors">WPM</span>
            <span className="text-5xl font-black text-foreground tabular-nums leading-none tracking-tighter">
              {stats.wpm}
            </span>
          </div>
          <div className="group transition-all">
            <span className="text-xs uppercase tracking-[0.2em] text-foreground/30 font-black mb-1 block group-hover:text-primary transition-colors">ACC</span>
            <span className="text-5xl font-black text-foreground tabular-nums leading-none tracking-tighter">
              {stats.accuracy}<span className="text-xl text-foreground/20 ml-1">%</span>
            </span>
          </div>
          <div className="group transition-all">
            <span className="text-xs uppercase tracking-[0.2em] text-foreground/30 font-black mb-1 block group-hover:text-primary transition-colors">ERR</span>
            <span className="text-5xl font-black text-foreground tabular-nums leading-none tracking-tighter">
              {stats.errors}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-2 w-24 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_rgba(11,175,231,0.5)]" 
              style={{ width: `${(userInput.length / sampleText.length) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">{Math.round((userInput.length / sampleText.length) * 100)}%</span>
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
          className="group flex items-center gap-3 px-8 py-4 glass glass-hover rounded-md transition-all"
        >
          <svg className="w-4 h-4 text-primary group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          <span className="text-xs font-black uppercase tracking-widest">New Passage</span>
        </button>
        
        <button 
          onClick={reset}
          className="p-4 glass glass-hover rounded-md text-foreground/40 hover:text-primary transition-all"
          title="Reset Test (Esc)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {isFinished && (
          <button 
            className="px-10 py-4 bg-primary text-black font-black rounded-md shadow-[0_15px_40px_rgba(11,175,231,0.3)] hover:scale-105 active:scale-95 transition-all animate-fade-in"
          >
            SAVE RESULT
          </button>
        )}
      </div>
    </div>
  );
};
