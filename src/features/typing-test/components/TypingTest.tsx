"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { TypingSettings } from './TypingSettings';
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

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
  };

  const handleLengthChange = (newLength: Length) => {
    setLength(newLength);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handleChallengeTypeChange = (newChallengeType: ChallengeType) => {
    setChallengeType(newChallengeType);
  };

  if (!isMounted) return null;

  return (
    <div className="w-full flex flex-col gap-8">
      <TypingSettings
        difficulty={difficulty}
        length={length}
        theme={theme}
        challengeType={challengeType}
        onDifficultyChange={handleDifficultyChange}
        onLengthChange={handleLengthChange}
        onThemeChange={handleThemeChange}
        onChallengeTypeChange={handleChallengeTypeChange}
      />

      <div className="flex justify-center gap-12 text-center">
        <div>
          <span className="block text-4xl font-black text-primary">{stats.wpm}</span>
          <span className="text-xs uppercase tracking-widest text-foreground/40 font-bold">WPM</span>
        </div>
        <div>
          <span className="block text-4xl font-black text-primary">{stats.accuracy}%</span>
          <span className="text-xs uppercase tracking-widest text-foreground/40 font-bold">Accuracy</span>
        </div>
        <div>
          <span className="block text-4xl font-black text-primary">{stats.errors}</span>
          <span className="text-xs uppercase tracking-widest text-foreground/40 font-bold">Errors</span>
        </div>
      </div>

      <div 
        className="relative text-2xl font-mono leading-relaxed text-foreground/30 cursor-text select-none min-h-[120px]"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {sampleText.split('').map((char, index) => {
            const colorClass = index < userInput.length
              ? (userInput[index] === char ? 'text-foreground' : 'text-red-500 bg-red-500/10')
              : 'text-foreground/20';
            const isCursor = index === userInput.length;

            return (
              <span key={index} className={`${colorClass} ${isCursor ? 'typing-cursor' : ''}`}>
                {char}
              </span>
            );
          })}
        </div>

        <input
          ref={inputRef}
          type="text"
          className="opacity-0 absolute inset-0 w-full h-full cursor-default"
          value={userInput}
          onChange={handleInputChange}
          autoFocus
        />
      </div>

      <div className="flex justify-center gap-4">
        <button 
          onClick={handleRegenerate}
          className="px-6 py-2 bg-foreground/5 hover:bg-foreground/10 border border-border rounded-xl transition-all text-sm font-semibold"
        >
          New Passage
        </button>
        <button 
          onClick={reset}
          className="px-6 py-2 bg-foreground/5 hover:bg-foreground/10 border border-border rounded-xl transition-all text-sm font-semibold"
        >
          Reset Test
        </button>
        {isFinished && (
          <button 
            className="px-6 py-2 bg-primary text-background hover:opacity-90 rounded-xl transition-all text-sm font-semibold animate-bounce"
          >
            Save Result
          </button>
        )}
      </div>
    </div>
  );
};