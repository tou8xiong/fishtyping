"use client";

import { createClient } from "@/lib/supabase/client";
import { getAvailablePassage, releasePassage, savePassageHistory } from "@/lib/supabase/db";
import type { Difficulty, Length, Language, Passage } from "@/lib/supabase/types";
import { WORD_COUNT_BY_DIFFICULTY } from "@/lib/supabase/types";

export type { Difficulty, Length, Language, Passage };
export { WORD_COUNT_BY_DIFFICULTY };

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
