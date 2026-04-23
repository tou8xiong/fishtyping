# Complete Updated Code - April 23, 2026

## Summary of Changes

1. **Word count now based on difficulty** (not separate length setting)
2. **Removed "Start Typing" button** - passages load automatically
3. **Better error handling** - fallback passages if API fails
4. **Simplified UI** - removed Length selector

---

## File 1: src/lib/supabase/types.ts

```typescript
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type Length = 'short' | 'medium' | 'long';
export type Theme = 'technology' | 'nature' | 'science' | 'history' | 'general';
export type ChallengeType = 'standard' | 'punctuation' | 'numbers' | 'speed';
export type Language = 'english' | 'lao';
export type PassageStatus = 'generating' | 'ready' | 'in_use' | 'archived';
export type GeneratedBy = 'manual' | 'ai';

// Word count ranges by difficulty
export const WORD_COUNT_BY_DIFFICULTY = {
  beginner: { min: 15, max: 30, description: 'Short, builds confidence, simple words' },
  intermediate: { min: 40, max: 80, description: 'Enough to build rhythm and flow' },
  advanced: { min: 100, max: 150, description: 'Tests sustained focus and stamina' },
  expert: { min: 200, max: 300, description: 'For serious practice only' },
} as const;

export interface User {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface Passage {
  id: string;
  content: string;
  language: Language;
  difficulty: Difficulty;
  length: Length;
  theme: Theme;
  challenge_type: ChallengeType;
  status: PassageStatus;
  generated_by: GeneratedBy;
  ai_model: string | null;
  ai_prompt_id: string | null;
  used_count: number;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface AiPrompt {
  id: string;
  template: string;
  category: string | null;
  difficulty: string | null;
  version: number;
  is_active: boolean;
  success_rate: number | null;
  created_at: string;
}

export interface PassageHistory {
  id: string;
  user_id: string;
  passage_id: string;
  attempted_at: string;
  wpm: number | null;
  accuracy: number | null;
  duration_ms: number | null;
}

export interface GenerationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  language: Language;
  difficulty: Difficulty | null;
  length: Length | null;
  theme: Theme | null;
  challenge_type: ChallengeType | null;
  attempts: number;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}
```

---

## File 2: src/features/typing-test/utils/passageGenerator.ts

Add this export at the top:

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import { getAvailablePassage, releasePassage, savePassageHistory } from "@/lib/supabase/db";
import type { Difficulty, Length, Theme, ChallengeType, Language, Passage } from "@/lib/supabase/types";
import { WORD_COUNT_BY_DIFFICULTY } from "@/lib/supabase/types";

export type { Difficulty, Length, Theme, ChallengeType, Language, Passage };
export { WORD_COUNT_BY_DIFFICULTY };

// ... rest of the file stays the same
```

---

## File 3: src/features/typing-test/components/TypingTest.tsx

**COMPLETE FILE - Replace entire file:**

```typescript
"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { trackPassageResult, Difficulty, Theme, ChallengeType, Language, WORD_COUNT_BY_DIFFICULTY } from '../utils/passageGenerator';
import { FaRotateRight } from "react-icons/fa6";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const TypingTest = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [theme, setTheme] = useState<Theme>('general');
  const [challengeType, setChallengeType] = useState<ChallengeType>('standard');
  const [language, setLanguage] = useState<Language>('english');
  const [isMounted, setIsMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPassageId, setCurrentPassageId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const [sampleText, setSampleText] = useState('');

  const { userInput, stats, timeElapsed, isFinished, handleInputChange, reset } = useTypingEngine(sampleText);

  useEffect(() => {
    setIsMounted(true);
    inputRef.current?.focus();
  }, []);

  // Save results when typing is finished
  useEffect(() => {
    if (isFinished && currentPassageId && stats.wpm > 0) {
      trackPassageResult({
        passageId: currentPassageId,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        durationMs: timeElapsed,
      }).catch(err => console.error('Failed to save result:', err));
    }
  }, [isFinished, currentPassageId, stats.wpm, stats.accuracy, timeElapsed]);

  const loadNewPassage = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Call API to get passage from DB or generate new one
      const response = await fetch('/api/generate-passage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty,
          length: 'medium', // Still send length for backward compatibility with DB
          theme,
          challengeType,
          language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSampleText(data.passage);
        setCurrentPassageId(data.passageId || null);
      } else {
        // Fallback: use a simple default passage
        setSampleText('The quick brown fox jumps over the lazy dog and then it ran away into the deep blue ocean to find some fish to eat.');
        setCurrentPassageId(null);
      }
    } catch (error) {
      console.error('Failed to load passage:', error);
      // Fallback: use a simple default passage
      setSampleText('The quick brown fox jumps over the lazy dog and then it ran away into the deep blue ocean to find some fish to eat.');
      setCurrentPassageId(null);
    }
    setIsGenerating(false);
  }, [difficulty, theme, challengeType, language]);

  const handleRegenerate = useCallback(async () => {
    await loadNewPassage();
  }, [loadNewPassage]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  // Load initial passage on mount and when settings change
  useEffect(() => {
    if (!isMounted) return;
    loadNewPassage();
  }, [isMounted, difficulty, theme, challengeType, language, loadNewPassage]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const cycle: Language[] = ['english', 'lao'];
        const nextIndex = (cycle.indexOf(language) + 1) % cycle.length;
        setLanguage(cycle[nextIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleReset();
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

  if (!isMounted) return null;

  return (
    <div className="w-full flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Fish Icon */}
      <div className="flex items-center justify-center">
        <svg width="48" height="52" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 12.5L9 1V12.5H1ZM4.825 10.5H7V7.375L4.825 10.5ZM10.5 12.5C10.7 12.0333 10.9167 11.2167 11.15 10.05C11.3833 8.88333 11.5 7.7 11.5 6.5C11.5 5.3 11.3875 4.06667 11.1625 2.8C10.9375 1.53333 10.7167 0.6 10.5 0C11.5167 0.3 12.5292 0.858333 13.5375 1.675C14.5458 2.49167 15.4542 3.46667 16.2625 4.6C17.0708 5.73333 17.7292 6.97917 18.2375 8.3375C18.7458 9.69583 19 11.0833 19 12.5H10.5ZM13.1 10.5H16.8C16.5167 9.21667 16.0542 8.04167 15.4125 6.975C14.7708 5.90833 14.0917 5 13.375 4.25C13.4083 4.6 13.4375 4.9625 13.4625 5.3375C13.4875 5.7125 13.5 6.1 13.5 6.5C13.5 7.28333 13.4625 8.00833 13.3875 8.675C13.3125 9.34167 13.2167 9.95 13.1 10.5ZM7 18C6.4 18 5.84167 17.8583 5.325 17.575C4.80833 17.2917 4.36667 16.9333 4 16.5C3.76667 16.75 3.5125 16.9833 3.2375 17.2C2.9625 17.4167 2.65833 17.5917 2.325 17.725C1.74167 17.2917 1.24583 16.7542 0.8375 16.1125C0.429167 15.4708 0.15 14.7667 0 14H20C19.85 14.7667 19.5708 15.4708 19.1625 16.1125C18.7542 16.7542 18.2583 17.2917 17.675 17.725C17.3417 17.5917 17.0375 17.4167 16.7625 17.2C16.4875 16.9833 16.2333 16.75 16 16.5C15.6167 16.9333 15.1708 17.2917 14.6625 17.575C14.1542 17.8583 13.6 18 13 18C12.4 18 11.8417 17.8583 11.325 17.575C10.8083 17.2917 10.3667 16.9333 10 16.5C9.63333 16.9333 9.19167 17.2917 8.675 17.575C8.15833 17.8583 7.6 18 7 18ZM0 22V20H1C1.53333 20 2.05417 19.9167 2.5625 19.75C3.07083 19.5833 3.55 19.3333 4 19C4.45 19.3333 4.92917 19.5792 5.4375 19.7375C5.94583 19.8958 6.46667 19.975 7 19.975C7.53333 19.975 8.05 19.8958 8.55 19.7375C9.05 19.5792 9.53333 19.3333 10 19C10.45 19.3333 10.9292 19.5792 11.4375 19.7375C11.9458 19.8958 12.4667 19.975 13 19.975C13.5333 19.975 14.05 19.8958 14.55 19.7375C15.05 19.5792 15.5333 19.3333 16 19C16.4667 19.3333 16.95 19.5833 17.45 19.75C17.95 19.9167 18.4667 20 19 20H20V22H19C18.4833 22 17.975 21.9375 17.475 21.8125C16.975 21.6875 16.4833 21.5 16 21.25C15.5167 21.5 15.025 21.6875 14.525 21.8125C14.025 21.9375 13.5167 22 13 22C12.4833 22 11.975 21.9375 11.475 21.8125C10.975 21.6875 10.4833 21.5 10 21.25C9.51667 21.5 9.025 21.6875 8.525 21.8125C8.025 21.9375 7.51667 22 7 22C6.48333 22 5.975 21.9375 5.475 21.8125C4.975 21.6875 4.48333 21.5 4 21.25C3.51667 21.5 3.025 21.6875 2.525 21.8125C2.025 21.9375 1.51667 22 1 22H0Z" fill="#0BAFE7" />
        </svg>
      </div>

      {/* Top Controls Row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="px-3 py-1.5 bg-black/40 border border-primary/30 rounded text-[10px] font-bold text-white/80 appearance-none cursor-pointer hover:border-primary/50 transition-colors"
          >
            <option value="beginner" className="bg-black text-white">Beginner (15-30 words)</option>
            <option value="intermediate" className="bg-black text-white">Intermediate (40-80 words)</option>
            <option value="advanced" className="bg-black text-white">Advanced (100-150 words)</option>
            <option value="expert" className="bg-black text-white">Expert (200-300 words)</option>
          </select>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="px-3 py-1.5 bg-black/40 border border-primary/30 rounded text-[10px] font-bold text-white/80 appearance-none cursor-pointer hover:border-primary/50 transition-colors"
          >
            <option value="english" className="bg-black text-white">English</option>
            <option value="lao" className="bg-black text-white">Lao</option>
          </select>
        </div>

        {/* Right Stats */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-2xl font-black text-yellow-500">{stats.wpm}</span>
          </div>
          <div className="text-center">
            <span className="text-2xl font-black text-yellow-500">{stats.accuracy}%</span>
          </div>
          <div className="text-center">
            <span className="text-2xl font-black text-yellow-500">{formatTime(timeElapsed)}</span>
          </div>
        </div>
      </div>

      {/* Main Typing Area */}
      <div className="relative">
        {isGenerating ? (
          <div className="bg-[#0a1929]/80 backdrop-blur-sm rounded-2xl p-12 md:p-16 min-h-70 flex flex-col items-center justify-center relative border border-primary/20">
            <div className="flex flex-col items-center justify-center gap-4">
              <FaRotateRight className="text-4xl text-primary animate-spin" />
              <p className="text-xl text-foreground/50">Loading passage...</p>
            </div>
          </div>
        ) : (
          <div
            className="bg-[#0a1929]/80 backdrop-blur-sm rounded-2xl p-12 md:p-16 min-h-70 flex flex-col items-center justify-center relative group cursor-text border border-primary/20"
            onClick={() => inputRef.current?.focus()}
          >
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="max-w-3xl text-2xl md:text-2xl font-normal leading-[1.8] tracking-normal text-foreground/40 select-none whitespace-pre-wrap text-left">
                {sampleText.split('').map((char, index) => {
                  const isTyped = index < userInput.length;
                  const isCorrect = isTyped && userInput[index] === char;
                  const isCurrent = index === userInput.length;

                  return (
                    <span
                      key={index}
                      className={cn(
                        "transition-all duration-75 relative inline",
                        isTyped && (isCorrect ? "text-primary" : "text-red-400"),
                        isCurrent && "text-foreground/60"
                      )}
                    >
                      {char}
                      {isCurrent && (
                        <div className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-primary shadow-[0_0_4px_rgba(11,175,231,0.5)] animate-pulse" />
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

            {/* Action Icons at Bottom */}
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={handleReset}
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground/50 hover:text-foreground transition-all border border-white/10 hover:border-white/20"
              >
                <FaRotateRight className="text-base" />
              </button>

              <button
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground/50 hover:text-foreground transition-all border border-white/10 hover:border-white/20"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## File 4: scripts/seed-passages.sql

**Run this in Supabase SQL Editor:**

```sql
-- SQL Script to Insert Initial Passages
-- Run this in your Supabase SQL Editor to populate the database with initial passages

-- Beginner passages (15-30 words)
INSERT INTO passages (content, language, difficulty, length, theme, challenge_type, status, generated_by, word_count)
VALUES
('The cat sat on the mat. It was warm and sunny. Birds sang in the trees nearby.', 'english', 'beginner', 'short', 'general', 'standard', 'ready', 'manual', 18),
('I like to read books. They are fun and interesting. Reading helps me learn new things every day.', 'english', 'beginner', 'short', 'general', 'standard', 'ready', 'manual', 20),
('The dog runs fast. It plays in the park. Children laugh and have fun with their pets.', 'english', 'beginner', 'short', 'general', 'standard', 'ready', 'manual', 19),
('We go to school. We learn math and science. Teachers help us understand new concepts and ideas.', 'english', 'beginner', 'short', 'general', 'standard', 'ready', 'manual', 20),
('The sun is bright. It gives us light and warmth. Plants need sunshine to grow tall and strong.', 'english', 'beginner', 'short', 'nature', 'standard', 'ready', 'manual', 21);

-- Intermediate passages (40-80 words)
INSERT INTO passages (content, language, difficulty, length, theme, challenge_type, status, generated_by, word_count)
VALUES
('The quick brown fox jumps over the lazy dog and then runs away into the deep blue ocean to find some fish to eat. The water is cold but the fox is brave and determined to catch its dinner before sunset arrives.', 'english', 'intermediate', 'medium', 'general', 'standard', 'ready', 'manual', 50),
('Technology has changed our lives in many ways. We use computers and smartphones every day to communicate with friends and family. The internet connects people from all around the world, making it easier to share ideas and information instantly.', 'english', 'intermediate', 'medium', 'technology', 'standard', 'ready', 'manual', 45),
('Nature is full of beautiful sights and sounds. Birds sing in the morning while flowers bloom in colorful gardens. Trees provide shade and fresh air for everyone to enjoy. Taking time to appreciate nature helps us feel peaceful and relaxed.', 'english', 'intermediate', 'medium', 'nature', 'standard', 'ready', 'manual', 48),
('Learning new skills takes practice and patience. Whether you are studying a language or playing an instrument, consistent effort leads to improvement. Setting small goals and celebrating progress along the way keeps you motivated to continue learning.', 'english', 'intermediate', 'medium', 'general', 'standard', 'ready', 'manual', 45),
('Exercise is important for staying healthy and strong. Regular physical activity improves your mood and energy levels. You can walk, run, swim, or play sports to keep your body active. Even small amounts of movement each day make a big difference.', 'english', 'intermediate', 'medium', 'general', 'standard', 'ready', 'manual', 48);

-- Advanced passages (100-150 words)
INSERT INTO passages (content, language, difficulty, length, theme, challenge_type, status, generated_by, word_count)
VALUES
('Artificial intelligence has become an integral part of modern society, transforming industries and reshaping how we interact with technology. Machine learning algorithms analyze vast amounts of data to identify patterns and make predictions with remarkable accuracy. From virtual assistants to autonomous vehicles, AI applications continue to expand into new domains. However, these advancements also raise important ethical questions about privacy, bias, and the future of employment. As AI systems become more sophisticated, society must carefully consider how to harness their potential while mitigating potential risks. Developing responsible AI requires collaboration between technologists, policymakers, and ethicists to ensure these powerful tools benefit humanity as a whole.', 'english', 'advanced', 'long', 'technology', 'standard', 'ready', 'manual', 115),
('Climate change represents one of the most pressing challenges facing our planet today. Rising global temperatures are causing ice caps to melt, sea levels to rise, and weather patterns to become increasingly unpredictable. Scientists warn that without significant action to reduce greenhouse gas emissions, the consequences could be catastrophic for future generations. Renewable energy sources such as solar and wind power offer promising alternatives to fossil fuels. Governments, businesses, and individuals all have important roles to play in addressing this crisis. By making sustainable choices and supporting environmental policies, we can work together to protect our planet and ensure a livable world for those who come after us.', 'english', 'advanced', 'long', 'science', 'standard', 'ready', 'manual', 120),
('The history of human civilization is marked by remarkable achievements and profound challenges. Ancient societies developed complex systems of writing, mathematics, and governance that laid the foundation for modern culture. The Renaissance sparked an explosion of artistic and scientific innovation that transformed European society. The Industrial Revolution brought unprecedented technological progress but also created new social problems. Throughout history, people have struggled with questions of justice, equality, and human rights. Understanding our past helps us navigate present challenges and build a better future. By studying history, we gain perspective on the forces that shape our world and the choices that define our collective destiny.', 'english', 'advanced', 'long', 'history', 'standard', 'ready', 'manual', 125);

-- Expert passages (200-300 words)
INSERT INTO passages (content, language, difficulty, length, theme, challenge_type, status, generated_by, word_count)
VALUES
('The intersection of quantum mechanics and computer science has given rise to quantum computing, a revolutionary paradigm that promises to solve problems currently intractable for classical computers. Unlike traditional bits that exist in states of zero or one, quantum bits or qubits can exist in superposition, simultaneously representing multiple states. This fundamental property, combined with quantum entanglement, enables quantum computers to perform certain calculations exponentially faster than their classical counterparts. Researchers are exploring applications in cryptography, drug discovery, financial modeling, and optimization problems. However, significant technical challenges remain before quantum computers can achieve practical utility at scale. Maintaining quantum coherence requires extremely low temperatures and isolation from environmental interference. Error correction in quantum systems is fundamentally different from classical computing and requires sophisticated protocols. Despite these obstacles, major technology companies and research institutions are investing heavily in quantum computing development. The race to achieve quantum supremacy has intensified, with various organizations claiming milestones in demonstrating quantum advantage for specific tasks. As the field matures, quantum computing may fundamentally transform industries and scientific research, opening new frontiers in our understanding of computation and information processing.', 'english', 'expert', 'long', 'technology', 'standard', 'ready', 'manual', 210),
('Neuroscience has made remarkable strides in understanding the intricate workings of the human brain, yet many mysteries remain unsolved. The brain contains approximately eighty-six billion neurons, each forming thousands of connections with other neurons, creating a network of staggering complexity. Recent advances in neuroimaging techniques such as functional magnetic resonance imaging and positron emission tomography have allowed researchers to observe brain activity in real time, revealing how different regions coordinate to produce thoughts, emotions, and behaviors. Studies of neuroplasticity demonstrate that the brain retains remarkable capacity for adaptation and reorganization throughout life, challenging earlier assumptions about fixed neural architecture. Understanding consciousness remains one of the greatest challenges in neuroscience, with competing theories attempting to explain how subjective experience emerges from physical processes. Research into neurodegenerative diseases like Alzheimers and Parkinsons seeks to identify mechanisms of neuronal death and develop therapeutic interventions. The emerging field of computational neuroscience uses mathematical models and computer simulations to understand neural systems at multiple scales, from individual neurons to large-scale brain networks. As technology advances and interdisciplinary collaboration increases, neuroscience continues to illuminate the biological basis of human cognition and behavior.', 'english', 'expert', 'long', 'science', 'standard', 'ready', 'manual', 220);

-- Add some passages with punctuation challenge
INSERT INTO passages (content, language, difficulty, length, theme, challenge_type, status, generated_by, word_count)
VALUES
('The cat—fluffy, orange, and utterly fearless—stared at the dog; the dog, surprised, backed away slowly. "What courage!" thought the owner, watching from the window.', 'english', 'intermediate', 'medium', 'general', 'punctuation', 'ready', 'manual', 28),
('Technology evolves rapidly: smartphones, tablets, laptops—all connected seamlessly. Users (young and old) adapt quickly; however, privacy concerns remain significant. "Is convenience worth the cost?" many ask.', 'english', 'intermediate', 'medium', 'technology', 'punctuation', 'ready', 'manual', 30);

-- Add some passages with numbers
INSERT INTO passages (content, language, difficulty, length, theme, challenge_type, status, generated_by, word_count)
VALUES
('The project cost $150,000 and affected 8 million people across 50 different countries. Test scores increased by 25% in just 3 months, showing significant improvement in student performance.', 'english', 'intermediate', 'medium', 'general', 'numbers', 'ready', 'manual', 32),
('In 2024, the company reported revenue of $2.5 billion, a 15% increase from the previous year. The stock price rose from $45 to $67, representing a 48.9% gain for investors.', 'english', 'intermediate', 'medium', 'general', 'numbers', 'ready', 'manual', 35);

-- Add some speed passages
INSERT INTO passages (content, language, difficulty, length, theme, challenge_type, status, generated_by, word_count)
VALUES
('The sun is hot. The sky is blue. I like to run. We have fun. Time flies by. Work is good. Life is great. Try your best.', 'english', 'beginner', 'short', 'general', 'speed', 'ready', 'manual', 30),
('She can type fast. He writes code well. They work hard. Come see us. Read more books. Write every day. Think positive. Stay strong and be kind.', 'english', 'beginner', 'short', 'general', 'speed', 'ready', 'manual', 30);
```

---

## Quick Setup Steps

1. **Update types.ts** - Copy File 1 content
2. **Update passageGenerator.ts** - Add the export line from File 2
3. **Replace TypingTest.tsx** - Copy entire File 3
4. **Run SQL** - Copy File 4 into Supabase SQL Editor and run it

That's it! Your app will now work with the new word count system.
