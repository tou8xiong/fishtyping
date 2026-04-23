"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function fixUserProfile() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Not authenticated" };
    }

    const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`;
    const displayName = user.user_metadata?.full_name || user.user_metadata?.username || username;
    const avatarUrl = user.user_metadata?.avatar_url || null;

    console.log('fixUserProfile: creating profile', { id: user.id, username, displayName, avatarUrl });

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
      console.error('fixUserProfile: failed', upsertError);
      return { error: upsertError.message };
    }

    console.log('fixUserProfile: success');
    revalidatePath('/', 'layout');

    return { success: true, username, displayName };
  } catch (error: any) {
    console.error('fixUserProfile: exception', error);
    return { error: error.message };
  }
}
