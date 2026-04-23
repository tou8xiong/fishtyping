import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { saveGeneratedPassage, checkPoolThresholds } from '@/lib/supabase/db';
import type { Difficulty, Length, Theme, ChallengeType, Language } from '@/lib/supabase/types';
import { WORD_COUNT_BY_DIFFICULTY } from '@/lib/supabase/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MIN_POOL_SIZE = 5; // Minimum passages per combination

async function callGemini(prompt: string, retries = 3): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const passage = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (passage) return passage;
    }

    if (response.status === 429) {
      const waitTime = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      continue;
    }

    const errorData = await response.text();
    console.error('Gemini API Error:', response.status, errorData);
  }
  throw new Error('Max retries exceeded');
}

function buildPrompt(theme: Theme, difficulty: Difficulty, length: Length, challengeType: ChallengeType, language: Language): string {
  const wordCountRange = WORD_COUNT_BY_DIFFICULTY[difficulty];
  const wordCountGuide = `${wordCountRange.min}-${wordCountRange.max} words`;

  const difficultyGuide: Record<Difficulty, string> = {
    beginner: 'simple and easy to understand words',
    intermediate: 'moderate vocabulary with some complex words',
    advanced: 'sophisticated vocabulary and complex sentence structures',
    expert: 'highly advanced and specialized vocabulary',
  };
  const challengeGuide: Record<ChallengeType, string> = {
    standard: 'normal text with regular punctuation',
    punctuation: 'heavy use of commas, semicolons, dashes, and parentheses',
    numbers: 'include numbers, percentages, currency, and measurements throughout',
    speed: 'short sentences with simple structure for fast typing practice',
  };
  const langGuide = language === 'lao' ? 'in Lao language' : 'in English';

  return `Generate a typing passage (${wordCountGuide}) ${langGuide}.

Theme: ${theme}
Difficulty: ${difficulty} (${difficultyGuide[difficulty]})
Challenge Type: ${challengeType} (${challengeGuide[challengeType]})

Requirements:
- Generate EXACTLY between ${wordCountRange.min} and ${wordCountRange.max} words
- Generate only the passage text, no additional text or explanation
- Make sure the content is engaging and relevant to the theme
- ${challengeType === 'punctuation' ? 'Include abundant punctuation marks' : ''}
- ${challengeType === 'numbers' ? 'Incorporate numbers and numerical values naturally' : ''}
- ${challengeType === 'speed' ? 'Use short, simple sentences for rapid typing' : ''}
- No explanations, just the raw passage text`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Optional: Add authentication check for admin users only
    // if (!user || user.email !== 'admin@example.com') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Check pool thresholds
    const poolStatus = await checkPoolThresholds();

    const difficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    const lengths: Length[] = ['short', 'medium', 'long'];
    const themes: Theme[] = ['general', 'technology', 'nature', 'science', 'history'];
    const challengeTypes: ChallengeType[] = ['standard', 'punctuation', 'numbers', 'speed'];
    const languages: Language[] = ['english', 'lao'];

    let generated = 0;
    const maxGenerate = 10; // Generate max 10 passages per run

    // Find combinations that need more passages
    for (const difficulty of difficulties) {
      for (const length of lengths) {
        for (const theme of themes) {
          for (const challengeType of challengeTypes) {
            for (const language of languages) {
              if (generated >= maxGenerate) break;

              const existing = poolStatus.find(
                p => p.difficulty === difficulty &&
                     p.length === length &&
                     p.theme === theme &&
                     p.challengeType === challengeType
              );

              const count = existing?.count || 0;

              if (count < MIN_POOL_SIZE) {
                try {
                  const prompt = buildPrompt(theme, difficulty, length, challengeType, language);
                  const passage = await callGemini(prompt);

                  await saveGeneratedPassage({
                    content: passage,
                    language,
                    difficulty,
                    length,
                    theme,
                    challengeType,
                    aiModel: 'gemini-2.0-flash',
                  });

                  generated++;
                  console.log(`Generated passage: ${difficulty}-${length}-${theme}-${challengeType}-${language}`);
                } catch (error) {
                  console.error('Failed to generate passage:', error);
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      generated,
      message: `Generated ${generated} passages`,
    });
  } catch (error) {
    console.error('Worker API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate passages' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const poolStatus = await checkPoolThresholds();

    return NextResponse.json({
      poolStatus,
      minPoolSize: MIN_POOL_SIZE,
    });
  } catch (error) {
    console.error('Worker API Error:', error);
    return NextResponse.json(
      { error: 'Failed to check pool status' },
      { status: 500 }
    );
  }
}
