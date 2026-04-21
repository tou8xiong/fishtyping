"use client";

import React from 'react';
import { Difficulty, Length, Theme, ChallengeType } from '../utils/passageGenerator';

interface TypingSettingsProps {
  difficulty: Difficulty;
  length: Length;
  theme: Theme;
  challengeType: ChallengeType;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onLengthChange: (length: Length) => void;
  onThemeChange: (theme: Theme) => void;
  onChallengeTypeChange: (challengeType: ChallengeType) => void;
}

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const lengthOptions: { value: Length; label: string }[] = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
];

const themeOptions: { value: Theme; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'technology', label: 'Technology' },
  { value: 'nature', label: 'Nature' },
  { value: 'science', label: 'Science' },
  { value: 'history', label: 'History' },
];

const challengeOptions: { value: ChallengeType; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'punctuation', label: 'Punctuation' },
  { value: 'numbers', label: 'Numbers' },
  { value: 'speed', label: 'Speed Burst' },
];

const OptionButton: React.FC<{
  value: string;
  currentValue: string;
  onClick: () => void;
  label: string;
}> = ({ value, currentValue, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
      value === currentValue
        ? 'bg-primary text-background'
        : 'bg-foreground/5 hover:bg-foreground/10 border border-border'
    }`}
  >
    {label}
  </button>
);

export const TypingSettings: React.FC<TypingSettingsProps> = ({
  difficulty,
  length,
  theme,
  challengeType,
  onDifficultyChange,
  onLengthChange,
  onThemeChange,
  onChallengeTypeChange,
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center items-center p-4 bg-card/30 border border-border rounded-xl">
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-xs uppercase tracking-wider text-foreground/40 font-bold">Difficulty</span>
        <div className="flex gap-1">
          {difficultyOptions.map((opt) => (
            <OptionButton
              key={opt.value}
              value={opt.value}
              currentValue={difficulty}
              onClick={() => onDifficultyChange(opt.value)}
              label={opt.label}
            />
          ))}
        </div>
      </div>

      <div className="w-px h-12 bg-border hidden sm:block" />

      <div className="flex flex-col items-center gap-1.5">
        <span className="text-xs uppercase tracking-wider text-foreground/40 font-bold">Length</span>
        <div className="flex gap-1">
          {lengthOptions.map((opt) => (
            <OptionButton
              key={opt.value}
              value={opt.value}
              currentValue={length}
              onClick={() => onLengthChange(opt.value)}
              label={opt.label}
            />
          ))}
        </div>
      </div>

      <div className="w-px h-12 bg-border hidden sm:block" />

      <div className="flex flex-col items-center gap-1.5">
        <span className="text-xs uppercase tracking-wider text-foreground/40 font-bold">Theme</span>
        <div className="flex gap-1">
          {themeOptions.map((opt) => (
            <OptionButton
              key={opt.value}
              value={opt.value}
              currentValue={theme}
              onClick={() => onThemeChange(opt.value)}
              label={opt.label}
            />
          ))}
        </div>
      </div>

      <div className="w-px h-12 bg-border hidden sm:block" />

      <div className="flex flex-col items-center gap-1.5">
        <span className="text-xs uppercase tracking-wider text-foreground/40 font-bold">Challenge</span>
        <div className="flex gap-1">
          {challengeOptions.map((opt) => (
            <OptionButton
              key={opt.value}
              value={opt.value}
              currentValue={challengeType}
              onClick={() => onChallengeTypeChange(opt.value)}
              label={opt.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
};