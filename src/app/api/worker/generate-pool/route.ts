import { NextRequest, NextResponse } from 'next/server';
import { checkPoolThresholds } from '@/lib/supabase/db';

const MIN_POOL_SIZE = 5; // Minimum passages per combination

export async function POST(request: NextRequest) {
  try {
    const poolStatus = await checkPoolThresholds();

    return NextResponse.json({
      success: true,
      generated: 0,
      message: 'AI generation disabled. Passages must be added manually to the database.',
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
