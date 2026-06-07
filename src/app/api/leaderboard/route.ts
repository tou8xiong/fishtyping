import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { ok, retryAfter } = rateLimit(ip, 20);
  if (!ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const supabase = await createClient();

    // Get best WPM for each user, expert-level only, with a LEFT join to
    // passages so we still include runs whose passage row was deleted
    // (passage_id may be null). passage_history.passage_id -> passages.id FK
    // makes the embedding resolve.
    const { data: historyData, error: historyError } = await supabase
      .from("passage_history")
      .select("user_id, wpm, accuracy, attempted_at, passages(language)")
      .eq("difficulty", "expert")
      .order("wpm", { ascending: false })
      .limit(limit * 6); // Get more to account for duplicates per user/lang

    if (historyError) {
      console.error("Error fetching passage history:", historyError);
      return NextResponse.json({ error: historyError.message }, { status: 500 });
    }

    // Get all unique user IDs
    const userIds = [...new Set(historyData?.map((entry: any) => entry.user_id) || [])];

    // Fetch user details
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, username, display_name, avatar_url, preferred_language")
      .in("id", userIds);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    // Create a map of user details
    const usersMap = new Map(usersData?.map((user) => [user.id, user]) || []);

    // Group by (user, passage language) and keep each user's best score per
    // language. This lets a single user appear in both English and Lao tabs
    // with separate best scores.
    const userBestScores = new Map<string, any>();

    historyData?.forEach((entry: any) => {
      const userId: string = entry.user_id;
      const user = usersMap.get(userId);
      // Prefer the passage's language; fall back to the user's profile
      // language when the passage row is missing (orphaned passage_id).
      const passageLanguage: string =
        entry.passages?.language === "lao"
          ? "lao"
          : entry.passages?.language === "english"
            ? "english"
            : user?.preferred_language === "lao"
              ? "lao"
              : "english";
      const key = `${userId}::${passageLanguage}`;
      const existing = userBestScores.get(key);

      if (!existing || entry.wpm > existing.wpm) {
        userBestScores.set(key, {
          userId,
          username: user?.username || user?.display_name || "Anonymous",
          displayName: user?.display_name || user?.username || "Anonymous",
          avatarUrl: user?.avatar_url || null,
          preferredLanguage: user?.preferred_language || "english",
          passageLanguage,
          wpm: entry.wpm,
          accuracy: entry.accuracy,
          date: entry.attempted_at,
        });
      }
    });

    // Convert to array and sort by WPM
    const leaderboard = Array.from(userBestScores.values())
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, limit)
      .map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        username: entry.username,
        displayName: entry.displayName,
        avatarUrl: entry.avatarUrl,
        preferredLanguage: entry.preferredLanguage,
        passageLanguage: entry.passageLanguage,
        wpm: entry.wpm,
        accuracy: entry.accuracy,
        date: entry.date,
      }));

    return NextResponse.json({ leaderboard });
  } catch (error: any) {
    console.error("Error in leaderboard API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
