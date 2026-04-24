import { createClient } from "@/lib/supabase/server";
import { releasePassage, savePassageHistory, saveGeneratedPassage } from "@/lib/supabase/db";
import type { Difficulty, Length, Language, Passage } from "@/lib/supabase/types";

export async function fetchPassage(params: {
  difficulty?: Difficulty;
  length?: Length;
  language?: Language;
  userId?: string;
}): Promise<Passage | null> {
  try {
    const supabase = await createClient();
    const { difficulty = 'beginner', length = 'medium', language = 'english', userId } = params;

    let query = supabase
      .from('passages')
      .select('*')
      .eq('status', 'ready')
      .eq('difficulty', difficulty)
      .eq('length', length)
      .eq('language', language)
      .order('used_count', { ascending: true })
      .limit(20);

    const { data: passages, error } = await query;

    console.log('DB Query Result:', {
      difficulty,
      length,
      language,
      passagesFound: passages?.length || 0,
      error: error?.message
    });

    if (error || !passages || passages.length === 0) {
      return null;
    }

    if (userId) {
      const { data: history } = await supabase
        .from('passage_history')
        .select('passage_id')
        .eq('user_id', userId);

      const usedIds = new Set(history?.map(h => h.passage_id) || []);
      const available = passages.filter(p => !usedIds.has(p.id));

      if (available.length > 0) {
        const random = available[Math.floor(Math.random() * available.length)];
        await supabase.from('passages').update({ used_count: random.used_count + 1, status: 'in_use' }).eq('id', random.id);
        return random as Passage;
      }
    }

    const random = passages[Math.floor(Math.random() * passages.length)];
    await supabase.from('passages').update({ used_count: random.used_count + 1, status: 'in_use' }).eq('id', random.id);
    return random as Passage;
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