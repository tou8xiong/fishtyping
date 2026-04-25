"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function ensureUserProfile(userId: string, email: string | null, displayName: string | null) {
  const supabase = await createClient();

  const username = displayName || email?.split("@")[0] || `user_${userId.slice(0, 8)}`;
  const display_name = displayName || username;

  console.log('ensureUserProfile: creating profile', { id: userId, username, display_name });

  const { error } = await supabase.from("users").upsert(
    {
      id: userId,
      username,
      display_name,
      preferred_language: "english",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error('ensureUserProfile: failed to create profile', error);
  } else {
    console.log('ensureUserProfile: profile created successfully');
  }
}

export async function createUserProfile(userId: string, email: string | null, displayName: string | null) {
  await ensureUserProfile(userId, email, displayName);
  revalidatePath("/", "layout");
}

export async function signOutAction() {
  revalidatePath("/", "layout");
  redirect("/login");
}
