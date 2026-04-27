export type Difficulty = 'beginner' | 'advanced' | 'expert';
export type Length = 'short' | 'medium' | 'long';
export type Language = 'english' | 'lao';
export type PassageStatus = 'generating' | 'ready' | 'in_use' | 'archived';
export type GeneratedBy = 'manual' | 'ai';
export type Theme = 'general' | 'technology' | 'nature' | 'science' | 'history';
export type ChallengeType = 'standard' | 'punctuation' | 'numbers' | 'speed';

// Word count ranges by difficulty
export const WORD_COUNT_BY_DIFFICULTY = {
  beginner: { min: 15, max: 25, description: 'Progressive: letters → short words' },
  advanced: { min: 25, max: 30, description: 'Regular words, no complex symbols' },
  expert: { min: 30, max: 45, description: 'Includes symbols and punctuation' },
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
  attempts: number;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}