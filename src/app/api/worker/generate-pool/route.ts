import { NextRequest, NextResponse } from 'next/server';
import { checkPoolThresholds } from '@/lib/supabase/db';
import { verifyAdmin, unauthorized } from '@/lib/auth/verifyAuth';

const MIN_POOL_SIZE = 5;

export async function POST(request: NextRequest) {
  const adminUser = await verifyAdmin(request);
  if (!adminUser) return unauthorized();

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
    return NextResponse.json({ error: 'Failed to check pool status' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const adminUser = await verifyAdmin(request);
  if (!adminUser) return unauthorized();

  try {
    const poolStatus = await checkPoolThresholds();
    return NextResponse.json({ poolStatus, minPoolSize: MIN_POOL_SIZE });
  } catch (error) {
    console.error('Worker API Error:', error);
    return NextResponse.json({ error: 'Failed to check pool status' }, { status: 500 });
  }
}
