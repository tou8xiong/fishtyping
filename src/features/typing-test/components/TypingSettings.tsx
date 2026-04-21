"use client";

import React from 'react';
import { Difficulty, Length, Theme, ChallengeType } from '../utils/passageGenerator';

interface TypingSettingsProps {
  difficulty?: Difficulty;
  length?: Length;
  theme?: Theme;
  challengeType?: ChallengeType;
  onDifficultyChange?: (difficulty: Difficulty) => void;
  onLengthChange?: (length: Length) => void;
  onThemeChange?: (theme: Theme) => void;
  onChallengeTypeChange?: (challengeType: ChallengeType) => void;
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

const SettingSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="space-y-4">
    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 px-1">{title}</div>
    <div className="flex flex-wrap gap-2">
      {children}
    </div>
  </div>
);

const OptionButton: React.FC<{
  value: string;
  currentValue: string;
  onClick: () => void;
  label: string;
}> = ({ value, currentValue, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-5 py-3 text-xs font-bold rounded-md transition-all duration-300 ${
      value === currentValue
        ? 'bg-primary text-black shadow-[0_0_20px_rgba(11,175,231,0.3)]'
        : 'glass glass-hover text-foreground/40 hover:text-foreground/80'
    }`}
  >
    {label}
  </button>
);

export const TypingSettings: React.FC<TypingSettingsProps> = ({
  difficulty = 'intermediate',
  length = 'medium',
  theme = 'general',
  challengeType = 'standard',
  onDifficultyChange = () => {},
  onLengthChange = () => {},
  onThemeChange = () => {},
  onChallengeTypeChange = () => {},
}) => {
  return (
    <div className="space-y-12">
      <SettingSection title="Experience Level">
        {difficultyOptions.map((opt) => (
          <OptionButton
            key={opt.value}
            value={opt.value}
            currentValue={difficulty}
            onClick={() => onDifficultyChange(opt.value)}
            label={opt.label}
          />
        ))}
      </SettingSection>

      <SettingSection title="Test Duration">
        {lengthOptions.map((opt) => (
          <OptionButton
            key={opt.value}
            value={opt.value}
            currentValue={length}
            onClick={() => onLengthChange(opt.value)}
            label={opt.label}
          />
        ))}
      </SettingSection>

      <SettingSection title="Content Theme">
        {themeOptions.map((opt) => (
          <OptionButton
            key={opt.value}
            value={opt.value}
            currentValue={theme}
            onClick={() => onThemeChange(opt.value)}
            label={opt.label}
          />
        ))}
      </SettingSection>

      <SettingSection title="Challenge Modifier">
        {challengeOptions.map((opt) => (
          <OptionButton
            key={opt.value}
            value={opt.value}
            currentValue={challengeType}
            onClick={() => onChallengeTypeChange(opt.value)}
            label={opt.label}
          />
        ))}
      </SettingSection>
    </div>
  );
};
