"use client";

import { createClient } from "@/lib/supabase/client";
import { getAvailablePassage, releasePassage, savePassageHistory } from "@/lib/supabase/db";
import type { Difficulty, Length, Language, Passage } from "@/lib/supabase/types";
import { WORD_COUNT_BY_DIFFICULTY } from "@/lib/supabase/types";

export type { Difficulty, Length, Language, Passage };
export { WORD_COUNT_BY_DIFFICULTY };

interface GeneratePassageParams {
  difficulty?: Difficulty;
  length?: Length;
  language?: Language;
}

export async function generatePassageWithGemini(params: GeneratePassageParams): Promise<string> {
  // This function is deprecated - passages should come from the API
  // Fallback to simple passage if called
  const { difficulty = 'beginner' } = params;

  const fallbackPassages: Record<Difficulty, string> = {
    beginner: 'The cat sat on the mat. It was a sunny day. Birds sang in the trees.',
    advanced: 'Technology has revolutionized the way we communicate and interact with each other. From smartphones to social media platforms, digital innovation continues to shape our daily lives in unprecedented ways. The future promises even more exciting developments.',
    expert: 'Artificial intelligence and machine learning algorithms have become increasingly sophisticated, enabling computers to perform complex tasks that were once thought to be exclusively within the domain of human intelligence. These technological advancements are transforming industries ranging from healthcare to finance, creating new opportunities while also raising important ethical questions about privacy, automation, and the future of work in an increasingly digital world.'
  };

  return fallbackPassages[difficulty];
}

const usedPassages = new Set<string>();

export async function fetchPassageFromDB(params: {
  difficulty?: Difficulty;
  length?: Length;
  language?: Language;
}): Promise<Passage | null> {
  try {
    return await getAvailablePassage({
      difficulty: params.difficulty || 'beginner',
      length: params.length || 'medium',
      language: params.language || 'english',
    });
  } catch {
    return null;
  }
}

export async function returnPassageToPool(passageId: string): Promise<void> {
  try {
    await releasePassage(passageId);
  } catch {
    // Silently fail if DB is unavailable
  }
}

export async function trackPassageResult(data: {
  passageId: string;
  wpm: number;
  accuracy: number;
  durationMs: number;
}): Promise<void> {
  try {
    if (typeof window === "undefined") return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await savePassageHistory({
      userId: user.id,
      passageId: data.passageId,
      wpm: data.wpm,
      accuracy: data.accuracy,
      durationMs: data.durationMs,
    });
  } catch {
    // Silently fail if DB is unavailable
  }
}
