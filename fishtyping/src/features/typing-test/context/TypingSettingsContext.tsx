"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Difficulty, Length, Theme, ChallengeType, Language } from '../utils/passageGenerator';

export type TypingMode = 'zen' | 'sprint' | 'accuracy';

interface TypingSettings {
  difficulty: Difficulty;
  length: Length;
  theme: Theme;
  challengeType: ChallengeType;
  language: Language;
  mode: TypingMode;
}

interface TypingSettingsContextType {
  settings: TypingSettings;
  updateSettings: (updates: Partial<TypingSettings>) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setLength: (length: Length) => void;
  setTheme: (theme: Theme) => void;
  setChallengeType: (challengeType: ChallengeType) => void;
  setLanguage: (language: Language) => void;
  setMode: (mode: TypingMode) => void;
}

const defaultSettings: TypingSettings = {
  difficulty: 'intermediate',
  length: 'medium',
  theme: 'general',
  challengeType: 'standard',
  language: 'english',
  mode: 'zen',
};

const TypingSettingsContext = createContext<TypingSettingsContextType | null>(null);

export const TypingSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<TypingSettings>(defaultSettings);

  const updateSettings = useCallback((updates: Partial<TypingSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    setSettings(prev => ({ ...prev, difficulty }));
  }, []);

  const setLength = useCallback((length: Length) => {
    setSettings(prev => ({ ...prev, length }));
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    setSettings(prev => ({ ...prev, theme }));
  }, []);

  const setChallengeType = useCallback((challengeType: ChallengeType) => {
    setSettings(prev => ({ ...prev, challengeType }));
  }, []);

  const setLanguage = useCallback((language: Language) => {
    setSettings(prev => ({ ...prev, language }));
  }, []);

  const setMode = useCallback((mode: TypingMode) => {
    setSettings(prev => ({ ...prev, mode }));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typingSettings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings(prev => ({ ...prev, ...parsed }));
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typingSettings', JSON.stringify(settings));
    }
  }, [settings]);

  return (
    <TypingSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        setDifficulty,
        setLength,
        setTheme,
        setChallengeType,
        setLanguage,
        setMode,
      }}
    >
      {children}
    </TypingSettingsContext.Provider>
  );
};

export const useTypingSettings = () => {
  const context = useContext(TypingSettingsContext);
  if (!context) {
    throw new Error('useTypingSettings must be used within TypingSettingsProvider');
  }
  return context;
};