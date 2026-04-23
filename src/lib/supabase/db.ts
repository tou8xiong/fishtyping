import { createClient as createSupabaseClient } from "./client";
import type { Passage, PassageHistory, User, GenerationJob, Difficulty, Length, Theme, ChallengeType, Language } from "./types";

let client: ReturnType<typeof createSupabaseClient> | null = null;

function getClient() {
  if (!client) {
    client = createSupabaseClient();
  }
  return client;
}

export async function getAvailablePassage(params: {
  difficulty?: Difficulty;
  length?: Length;
  theme?: Theme;
  challengeType?: ChallengeType;
  language?: Language;
  userId?: string;
}): Promise<Passage | null> {
  const supabase = getClient();
  const { difficulty = 'intermediate', length = 'medium', theme = 'general', challengeType = 'standard', language = 'english', userId } = params;

  let query = supabase
    .from('passages')
    .select('*')
    .eq('status', 'ready')
    .eq('difficulty', difficulty)
    .eq('length', length)
    .eq('language', language)
    .order('used_count', { ascending: true })
    .limit(20);

  if (theme && theme !== 'general') {
    query = query.eq('theme', theme);
  }

  if (challengeType && challengeType !== 'standard') {
    query = query.eq('challenge_type', challengeType);
  }

  const { data: passages, error } = await query;

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
      return random;
    }
  }

  const random = passages[Math.floor(Math.random() * passages.length)];
  await supabase.from('passages').update({ used_count: random.used_count + 1, status: 'in_use' }).eq('id', random.id);
  return random;
}

export async function releasePassage(passageId: string): Promise<void> {
  const supabase = getClient();
  await supabase
    .from('passages')
    .update({ status: 'ready' })
    .eq('id', passageId);
}

export async function savePassageHistory(data: {
  userId: string;
  passageId: string;
  wpm?: number;
  accuracy?: number;
  durationMs?: number;
}): Promise<void> {
  const supabase = getClient();
  await supabase.from('passage_history').insert({
    user_id: data.userId,
    passage_id: data.passageId,
    wpm: data.wpm,
    accuracy: data.accuracy,
    duration_ms: data.durationMs,
  });
}

export async function getUserProfile(userId: string): Promise<User | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as User;
}

export async function updateUserProfile(userId: string, updates: Partial<Pick<User, 'username' | 'display_name' | 'avatar_url' | 'preferred_language'>>): Promise<void> {
  const supabase = getClient();
  await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);
}

export async function createGenerationJob(job: {
  language?: Language;
  difficulty?: Difficulty;
  length?: Length;
  theme?: Theme;
  challengeType?: ChallengeType;
  priority?: number;
}): Promise<string> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('generation_jobs')
    .insert({
      language: job.language || 'english',
      difficulty: job.difficulty,
      length: job.length,
      theme: job.theme,
      challenge_type: job.challengeType,
      priority: job.priority || 0,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data?.id;
}

export async function getPendingGenerationJobs(limit = 10): Promise<GenerationJob[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('generation_jobs')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) return [];
  return (data || []) as GenerationJob[];
}

export async function markJobProcessing(jobId: string): Promise<void> {
  const supabase = getClient();
  await supabase
    .from('generation_jobs')
    .update({ status: 'processing', processed_at: new Date().toISOString() })
    .eq('id', jobId);
}

export async function markJobCompleted(jobId: string): Promise<void> {
  const supabase = getClient();
  await supabase
    .from('generation_jobs')
    .update({ status: 'completed', processed_at: new Date().toISOString() })
    .eq('id', jobId);
}

export async function markJobFailed(jobId: string, errorMessage: string): Promise<void> {
  const supabase = getClient();
  await supabase
    .from('generation_jobs')
    .update({ status: 'failed', error_message: errorMessage, processed_at: new Date().toISOString() })
    .eq('id', jobId);
}

export async function saveGeneratedPassage(passage: {
  content: string;
  language: Language;
  difficulty: Difficulty;
  length: Length;
  theme: Theme;
  challengeType: ChallengeType;
  aiModel: string;
  jobId?: string;
}): Promise<string> {
  const supabase = getClient();
  const wordCount = passage.content.split(/\s+/).filter(Boolean).length;

  const { data, error } = await supabase
    .from('passages')
    .insert({
      content: passage.content,
      language: passage.language,
      difficulty: passage.difficulty,
      length: passage.length,
      theme: passage.theme,
      challenge_type: passage.challengeType,
      status: 'ready',
      generated_by: 'ai',
      ai_model: passage.aiModel,
      ai_prompt_id: passage.jobId,
      word_count: wordCount,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data?.id;
}

export async function checkPoolThresholds(): Promise<{ difficulty: Difficulty; length: Length; theme: Theme; challengeType: ChallengeType; count: number }[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('passages')
    .select('difficulty, length, theme, challenge_type')
    .eq('status', 'ready');

  if (error || !data) return [];

  const counts = new Map<string, number>();
  data.forEach(p => {
    const key = `${p.difficulty}-${p.length}-${p.theme}-${p.challenge_type}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const result: { difficulty: Difficulty; length: Length; theme: Theme; challengeType: ChallengeType; count: number }[] = [];
  counts.forEach((count, key) => {
    const [difficulty, length, theme, challengeType] = key.split('-') as [Difficulty, Length, Theme, ChallengeType];
    result.push({ difficulty, length, theme, challengeType, count });
  });

  return result;
}