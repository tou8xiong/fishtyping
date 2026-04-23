import { createClient } from "@/lib/supabase/server";
import { getAvailablePassage, releasePassage, savePassageHistory, saveGeneratedPassage } from "@/lib/supabase/db";
import type { Difficulty, Length, Theme, ChallengeType, Language, Passage } from "@/lib/supabase/types";

export async function fetchPassage(params: {
  difficulty?: Difficulty;
  length?: Length;
  theme?: Theme;
  challengeType?: ChallengeType;
  language?: Language;
}): Promise<Passage | null> {
  try {
    return await getAvailablePassage({
      difficulty: params.difficulty || 'intermediate',
      length: params.length || 'medium',
      theme: params.theme || 'general',
      challengeType: params.challengeType || 'standard',
      language: params.language || 'english',
    });
  } catch (error) {
    console.error('Error fetching passage:', error);
    return null;
  }
}

export async function releasePassageOnReturn(passageId: string): Promise<void> {
  try {
    await releasePassage(passageId);
  } catch (error) {
    console.error('Error releasing passage:', error);
  }
}

export async function trackHistory(data: {
  userId: string;
  passageId: string;
  wpm: number;
  accuracy: number;
  durationMs: number;
}): Promise<void> {
  try {
    await savePassageHistory({
      userId: data.userId,
      passageId: data.passageId,
      wpm: data.wpm,
      accuracy: data.accuracy,
      durationMs: data.durationMs,
    });
  } catch (error) {
    console.error('Error tracking history:', error);
  }
}

export async function storeGeneratedPassage(passage: {
  content: string;
  language: Language;
  difficulty: Difficulty;
  length: Length;
  theme: Theme;
  challengeType: ChallengeType;
}): Promise<string | null> {
  try {
    return await saveGeneratedPassage({
      ...passage,
      aiModel: 'gemini-2.0-flash',
    });
  } catch (error) {
    console.error('Error storing passage:', error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}