"use client";

import { TypingSettings } from "@/features/typing-test/components/TypingSettings";
import { useTypingSettings } from "@/features/typing-test/context/TypingSettingsContext";
import Link from "next/link";
import { FaArrowRight, FaCheck } from "react-icons/fa6";
import { Difficulty, Length, Theme, ChallengeType } from "@/features/typing-test/utils/passageGenerator";

export default function SettingsPage() {
  const { settings, setDifficulty, setLength, setTheme, setChallengeType } = useTypingSettings();

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
      className={`px-8 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 ${
        value === currentValue
          ? 'bg-primary text-black shadow-[0_10px_30px_rgba(11,175,231,0.2)]'
          : 'glass glass-hover text-foreground/40 hover:text-foreground/80'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex-1 flex flex-col items-center py-20 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-3xl z-10 space-y-12 animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter">Settings</h1>
          <p className="text-lg text-foreground/40 font-medium">Fine-tune your experience for maximum efficiency.</p>
        </div>

        <div className="glass p-10 rounded-2xl shadow-2xl space-y-10">
          <SettingSection title="Experience Level">
            {difficultyOptions.map((opt) => (
              <OptionButton
                key={opt.value}
                value={opt.value}
                currentValue={settings.difficulty}
                onClick={() => setDifficulty(opt.value)}
                label={opt.label}
              />
            ))}
          </SettingSection>

          <SettingSection title="Test Duration">
            {lengthOptions.map((opt) => (
              <OptionButton
                key={opt.value}
                value={opt.value}
                currentValue={settings.length}
                onClick={() => setLength(opt.value)}
                label={opt.label}
              />
            ))}
          </SettingSection>

          <SettingSection title="Content Theme">
            {themeOptions.map((opt) => (
              <OptionButton
                key={opt.value}
                value={opt.value}
                currentValue={settings.theme}
                onClick={() => setTheme(opt.value)}
                label={opt.label}
              />
            ))}
          </SettingSection>

          <SettingSection title="Challenge Modifier">
            {challengeOptions.map((opt) => (
              <OptionButton
                key={opt.value}
                value={opt.value}
                currentValue={settings.challengeType}
                onClick={() => setChallengeType(opt.value)}
                label={opt.label}
              />
            ))}
          </SettingSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 glass glass-hover rounded-xl space-y-3">
            <div className="text-primary font-black text-xs tracking-widest uppercase">Visuals</div>
            <h3 className="text-xl font-bold">Custom Themes</h3>
            <p className="text-sm text-foreground/40 leading-relaxed">Choose from our curated collection of themes or create your own CSS-based styles.</p>
            <button className="mt-4 text-sm font-bold text-primary underline underline-offset-4 decoration-2">Coming Soon</button>
          </div>
          <div className="p-8 glass glass-hover rounded-xl space-y-3">
            <div className="text-primary font-black text-xs tracking-widest uppercase">Controls</div>
            <h3 className="text-xl font-bold">Key Bindings</h3>
            <p className="text-sm text-foreground/40 leading-relaxed">Remap your keyboard shortcuts for resetting, navigating, and managing tests.</p>
            <button className="mt-4 text-sm font-bold text-primary underline underline-offset-4 decoration-2">Coming Soon</button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="/typing" className="flex items-center gap-3 bg-primary text-black px-8 py-4 rounded-xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(11,175,231,0.2)]">
            <span>START TYPING</span>
            <FaArrowRight className="text-sm" />
          </Link>
        </div>
      </div>
    </div>
  );
}