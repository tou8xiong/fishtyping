import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchPassage } from '@/lib/supabase/server-db';
import type { Difficulty, Length, Language } from '@/lib/supabase/types';

interface GeneratePassageRequest {
    difficulty: Difficulty;
    length: Length;
    language: Language;
}

export async function POST(request: NextRequest) {
    try {
        const body: GeneratePassageRequest = await request.json();
        const { difficulty, length, language } = body;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Try to get passage from database
        const passage = await fetchPassage({
            difficulty,
            length,
            language,
            userId: user?.id,
        });

        if (passage) {
            return NextResponse.json({
                passage: passage.content,
                passageId: passage.id,
                source: 'db'
            });
        }

        // No passage in DB, use local fallback
        const fallbackPassages: Record<Difficulty, string> = {
            beginner: 'The cat sat on the mat. It was a sunny day. Birds sang in the trees.',
            advanced: 'Technology has revolutionized the way we communicate and interact with each other. From smartphones to social media platforms, digital innovation continues to shape our daily lives in unprecedented ways. The future promises even more exciting developments.',
            expert: 'Artificial intelligence and machine learning algorithms have become increasingly sophisticated, enabling computers to perform complex tasks that were once thought to be exclusively within the domain of human intelligence. These technological advancements are transforming industries ranging from healthcare to finance, creating new opportunities while also raising important ethical questions about privacy, automation, and the future of work in an increasingly digital world.'
        };

        return NextResponse.json({
            passage: fallbackPassages[difficulty],
            source: 'fallback'
        });
    } catch (error) {
        console.error('GeneratePassage API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate passage' },
            { status: 500 }
        );
    }
}
