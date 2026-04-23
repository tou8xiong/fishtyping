import { NextRequest, NextResponse } from 'next/server';

interface GeneratePassageRequest {
    theme: string;
    difficulty: string;
    length: string;
    challengeType: string;
    language: string;
}

async function callGemini(prompt: string, apiKey: string, retries = 3): Promise<string> {
    for (let attempt = 0; attempt < retries; attempt++) {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
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
            if (passage) {
                return passage;
            }
        }

        if (response.status === 429) {
            const waitTime = Math.pow(2, attempt) * 1000;
            console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
        }

        const errorData = await response.text();
        console.error('Gemini API Error:', response.status, errorData);
        throw new Error(`Gemini API error: ${response.status}`);
    }
    throw new Error('Max retries exceeded');
}

export async function POST(request: NextRequest) {
    try {
        const body: GeneratePassageRequest = await request.json();
        const { theme, difficulty, length, challengeType, language } = body;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set');
            throw new Error('API key not configured');
        }

        const prompt = buildPrompt(theme, difficulty, length, challengeType, language);

        const passage = await callGemini(prompt, apiKey);

        return NextResponse.json({ passage });
    } catch (error: unknown) {
        console.error('GeneratePassage API Error:', error instanceof Error ? error.message : String(error));
        return NextResponse.json(
            { error: 'Failed to generate passage' },
            { status: 500 }
        );
    }
}

function buildPrompt(
    theme: string,
    difficulty: string,
    length: string,
    challengeType: string,
    language: string
): string {
    const lengthGuide = {
        short: '50-80 words',
        medium: '100-150 words',
        long: '200-300 words',
    };

    const difficultyGuide = {
        beginner: 'simple and easy to understand words',
        intermediate: 'moderate vocabulary with some complex words',
        advanced: 'sophisticated vocabulary and complex sentence structures',
        expert: 'highly advanced and specialized vocabulary',
    };

    const challengeGuide = {
        standard: 'normal text with regular punctuation',
        punctuation: 'heavy use of commas, semicolons, dashes, and parentheses',
        numbers: 'include numbers, percentages, currency, and measurements throughout',
        speed: 'short sentences with simple structure for fast typing practice',
    };

    const langGuide = language === 'lao' ? 'in Lao language' : 'in English';

    return `Generate a ${length} typing passage (${lengthGuide[length as keyof typeof lengthGuide] || '100-150 words'}) ${langGuide}.

Theme: ${theme}
Difficulty: ${difficulty} (${difficultyGuide[difficulty as keyof typeof difficultyGuide]})
Challenge Type: ${challengeType} (${challengeGuide[challengeType as keyof typeof challengeGuide]})

Requirements:
- Generate only the passage text, no additional text or explanation
- Make sure the content is engaging and relevant to the theme
- ${challengeType === 'punctuation' ? 'Include abundant punctuation marks' : ''}
- ${challengeType === 'numbers' ? 'Incorporate numbers and numerical values naturally' : ''}
- ${challengeType === 'speed' ? 'Use short, simple sentences for rapid typing' : ''}
- No explanations, just the raw passage text`;
}
