"use client";

import { TypingTest, TypingMode } from "@/features/typing-test/components/TypingTest";
import { useTypingSettings } from "@/features/typing-test/context/TypingSettingsContext";
import { Difficulty, Length, Theme, ChallengeType, Language } from "@/features/typing-test/utils/passageGenerator";
import { useEffect } from "react";

export default function TypingPage() {
  const { settings, setDifficulty, setLength, setTheme, setChallengeType, setLanguage, setMode } = useTypingSettings();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl max-h-[600px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
      
      <div className="w-full max-w-5xl z-10 space-y-8 animate-fade-in">
        <div className="flex justify-between items-end px-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter">Practice Mode</h2>
            <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest">Focused Session</p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 glass rounded-xl text-xs font-bold">
              <span className="text-foreground/40 mr-2">SESSION ID:</span>
              <span className="text-primary">#FT-{Math.floor(Math.random() * 9000) + 1000}</span>
            </div>
          </div>
        </div>

        <div className="glass p-12 md:p-20 rounded-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <div className="w-24 h-24 border-4 border-white rounded-full flex items-center justify-center font-black text-4xl italic">F</div>
          </div>
          <TypingTest 
            initialDifficulty={settings.difficulty}
            initialLength={settings.length}
            initialTheme={settings.theme}
            initialChallengeType={settings.challengeType}
            initialLanguage={settings.language}
            initialMode={settings.mode}
            onModeChange={setMode}
            onLanguageChange={setLanguage}
            onDifficultyChange={setDifficulty}
            onLengthChange={setLength}
            onThemeChange={setTheme}
            onChallengeTypeChange={setChallengeType}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'Esc', action: 'Reset' },
            { key: 'Tab', action: 'Switch Language' },
            { key: 'Ctrl+R', action: 'New Test' },
            { key: 'Alt+S', action: 'Share' },
          ].map((hint, i) => (
            <div key={i} className="px-6 py-4 glass glass-hover rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground/30 flex items-center justify-center">
              {hint.key} - {hint.action}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}