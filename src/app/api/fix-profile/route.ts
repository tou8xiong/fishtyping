import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`;
    const displayName = user.user_metadata?.full_name || user.user_metadata?.username || username;
    const avatarUrl = user.user_metadata?.avatar_url || null;

    console.log('Fixing profile for user:', { id: user.id, username, displayName, avatarUrl });

    const { error: upsertError } = await supabase.from('users').upsert(
      {
        id: user.id,
        username,
        display_name: displayName,
        avatar_url: avatarUrl,
        preferred_language: 'english',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (upsertError) {
      console.error('Failed to fix profile:', upsertError);
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: { username, displayName, avatarUrl }
    });
  } catch (error: any) {
    console.error('Fix profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
