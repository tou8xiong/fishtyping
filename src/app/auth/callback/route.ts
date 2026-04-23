import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";

async function ensureUserProfile(
  supabase: ReturnType<typeof createServerClient>,
  user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  }
) {
  const username =
    typeof user.user_metadata?.username === "string" && user.user_metadata.username.trim()
      ? user.user_metadata.username.trim()
      : user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`;

  const displayName =
    typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : username;

  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null;

  console.log('ensureUserProfile (callback): creating profile', { id: user.id, username, displayName, avatarUrl });

  const { error } = await supabase.from("users").upsert(
    {
      id: user.id,
      username,
      display_name: displayName,
      avatar_url: avatarUrl,
      preferred_language: "english",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error('ensureUserProfile (callback): failed to create profile', error);
  } else {
    console.log('ensureUserProfile (callback): profile created successfully');
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  // Check for hash parameters (Supabase default callback uses hash)
  const hash = requestUrl.hash;
  if (hash && hash.includes("access_token")) {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const expiresIn = params.get("expires_in");
    const tokenType = params.get("token_type");
    const idToken = params.get("id_token");

    if (accessToken) {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch {
                // Ignore
              }
            },
          },
        }
      );

      const { data: { user }, error } = await supabase.auth.getUser(accessToken);

      if (!error && user) {
        await ensureUserProfile(supabase, user);
      }

      redirect("http://localhost:3000/");
    }
  }

  // Check for error in query parameters
  const errorCode = requestUrl.searchParams.get("error_code");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (errorCode) {
    console.error("OAuth error:", errorCode, errorDescription);
    redirect("/login?error=oauth");
  }

  // Check for code in query parameters (Supabase callback with ?code=)
  const code = requestUrl.searchParams.get("code");
  if (!code) {
    console.error("No code in callback");
    redirect("/login?error=no_code");
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Exchange error:", error.message);
    if (error.message.includes("already been used")) {
      redirect("http://localhost:3000/");
    }
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data?.user) {
    await ensureUserProfile(supabase, data.user);
  }

  redirect("http://localhost:3000/");
}