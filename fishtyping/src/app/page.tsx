"use client";

import { TypingTest } from "@/features/typing-test/components/TypingTest";
import { useTypingSettings } from "@/features/typing-test/context/TypingSettingsContext";
import { FaRocket, FaBrain, FaKeyboard } from "react-icons/fa6";

export default function Home() {
  const { settings, setDifficulty, setMode } = useTypingSettings();

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-black pb-20">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl bg-primary/5 rounded-full blur-[180px] pointer-events-none" />
      
      <div className="w-full max-w-[1400px] z-10 px-6 py-20 flex flex-col items-center gap-24">
        <section className="w-full">
          <TypingTest 
            initialDifficulty={settings.difficulty}
            initialLength={settings.length}
            initialTheme={settings.theme}
            initialChallengeType={settings.challengeType}
            initialLanguage={settings.language}
            initialMode={settings.mode}
            onDifficultyChange={setDifficulty}
            onModeChange={setMode}
          />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1200px] animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {[
            { 
              title: "Power Mode", 
              desc: "Reach 100 WPM to activate kinetic screen effects and double your experience points.", 
              icon: <FaRocket className="text-primary" /> 
            },
            { 
              title: "Flow State", 
              desc: "Focus on the word center. Avoid looking at your stats until the timer finishes for maximum speed.", 
              icon: <FaBrain className="text-primary" /> 
            },
            { 
              title: "Multi-Script", 
              desc: "Our engine handles Lao and English scripts simultaneously with zero-latency input mapping.", 
              icon: <FaKeyboard className="text-primary" /> 
            }
          ].map((feature, i) => (
            <div key={i} className="p-10 glass glass-hover rounded-[24px] text-left flex flex-col gap-6 group border-white/[0.03] bg-white/[0.02]">
              <div className="text-3xl bg-primary/10 w-fit p-4 rounded-xl group-hover:bg-primary/20 transition-colors">
                {feature.icon}
              </div>
              <div className="space-y-3">
                <h3 className="font-black text-xl tracking-tight text-white">{feature.title}</h3>
                <p className="text-sm text-white/40 font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}