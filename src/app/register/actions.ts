"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  );
}

async function ensureUserProfile(supabase: Awaited<ReturnType<typeof createClient>>, user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const username =
    typeof user.user_metadata?.username === "string" && user.user_metadata.username.trim()
      ? user.user_metadata.username.trim()
      : user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`;

  const displayName =
    typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : username;

  console.log('ensureUserProfile: creating profile', { id: user.id, username, displayName });

  const { error } = await supabase.from("users").upsert(
    {
      id: user.id,
      username,
      display_name: displayName,
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

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await ensureUserProfile(supabase, data.user);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await ensureUserProfile(supabase, {
      ...data.user,
      user_metadata: {
        ...data.user.user_metadata,
        username,
        full_name: username,
      },
    });
  }

  if (!data.session) {
    return {
      success: true,
      requiresEmailConfirmation: true,
      message: "Account created. Confirm your email, then log in.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function signInWithOAuth(provider: "google" | "github") {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${getAppUrl()}/auth/callback`,
      scopes: provider === "google" ? "email profile" : "user:email",
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}
