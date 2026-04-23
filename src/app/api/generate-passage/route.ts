import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAvailablePassage, saveGeneratedPassage } from '@/lib/supabase/db';
import type { Difficulty, Length, Theme, ChallengeType, Language } from '@/lib/supabase/types';
import { WORD_COUNT_BY_DIFFICULTY } from '@/lib/supabase/types';

interface GeneratePassageRequest {
    theme: Theme;
    difficulty: Difficulty;
    length: Length;
    challengeType: ChallengeType;
    language: Language;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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

        // Don't log errors - just continue to next attempt
    }
    throw new Error('Max retries exceeded');
}

export async function POST(request: NextRequest) {
    try {
        const body: GeneratePassageRequest = await request.json();
        const { theme, difficulty, length, challengeType, language } = body;

        console.log('Looking for passage:', { difficulty, length, theme, challengeType, language });

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Try to get passage from database first
        const passage = await getAvailablePassage({
            difficulty,
            length,
            theme,
            challengeType,
            language,
            userId: user?.id,
        });

        if (passage) {
            console.log('Found passage in DB:', passage.id);
            return NextResponse.json({
                passage: passage.content,
                passageId: passage.id,
                source: 'db'
            });
        }

        console.log('No passage found in DB, using fallback');

        // If no passage in DB, try to generate with Gemini
        try {
            const prompt = buildPrompt(theme, difficulty, length, challengeType, language);
            const generatedPassage = await callGemini(prompt);

            if (generatedPassage && user) {
                await saveGeneratedPassage({
                    content: generatedPassage,
                    language,
                    difficulty,
                    length,
                    theme,
                    challengeType,
                    aiModel: 'gemini-2.0-flash',
                });
            }

            return NextResponse.json({
                passage: generatedPassage,
                source: 'ai'
            });
        } catch (geminiError) {
            // Silently use fallback - don't log error to console
            const fallbackPassages: Record<Difficulty, string> = {
                beginner: 'The cat sat on the mat. It was a sunny day. Birds sang in the trees.',
                intermediate: 'The quick brown fox jumps over the lazy dog and then it ran away into the deep blue ocean to find some fish to eat but it could not swim very well.',
                advanced: 'Technology has revolutionized the way we communicate and interact with each other. From smartphones to social media platforms, digital innovation continues to shape our daily lives in unprecedented ways. The future promises even more exciting developments.',
                expert: 'Artificial intelligence and machine learning algorithms have become increasingly sophisticated, enabling computers to perform complex tasks that were once thought to be exclusively within the domain of human intelligence. These technological advancements are transforming industries ranging from healthcare to finance, creating new opportunities while also raising important ethical questions about privacy, automation, and the future of work in an increasingly digital world.'
            };

            return NextResponse.json({
                passage: fallbackPassages[difficulty],
                source: 'fallback'
            });
        }
    } catch (error) {
        console.error('GeneratePassage API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate passage' },
            { status: 500 }
        );
    }
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