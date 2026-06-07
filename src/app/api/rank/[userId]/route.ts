import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "english";

    const supabase = await createClient();

    // Fetch the full expert leaderboard (same logic as /api/leaderboard)
    const { data: historyData, error: historyError } = await supabase
      .from("passage_history")
      .select("user_id, wpm, accuracy, attempted_at, passages(language)")
      .eq("difficulty", "expert")
      .order("wpm", { ascending: false })
      .limit(500);

    if (historyError) {
      return NextResponse.json({ error: historyError.message }, { status: 500 });
    }

    const userIds = [...new Set(historyData?.map((e: any) => e.user_id) || [])];
    const { data: usersData } = await supabase
      .from("users")
      .select("id, username, display_name, avatar_url, preferred_language")
      .in("id", userIds);

    const usersMap = new Map(usersData?.map((u) => [u.id, u]) || []);

    // Build best-per-user-per-language map
    const bestScores = new Map<string, any>();
    historyData?.forEach((entry: any) => {
      const uid: string = entry.user_id;
      const user = usersMap.get(uid);
      const passageLanguage: string =
        entry.passages?.language === "lao" ? "lao"
        : entry.passages?.language === "english" ? "english"
        : user?.preferred_language === "lao" ? "lao"
        : "english";
      const key = `${uid}::${passageLanguage}`;
      const existing = bestScores.get(key);
      if (!existing || entry.wpm > existing.wpm) {
        bestScores.set(key, {
          userId: uid,
          displayName: user?.display_name || user?.username || "Anonymous",
          avatarUrl: user?.avatar_url || null,
          passageLanguage,
          wpm: entry.wpm,
          accuracy: entry.accuracy,
          date: entry.attempted_at,
        });
      }
    });

    // Sort by WPM for the requested language to determine rank
    const ranked = Array.from(bestScores.values())
      .filter((e) => e.passageLanguage === lang)
      .sort((a, b) => b.wpm - a.wpm)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    const entry = ranked.find((e) => e.userId === userId);
    if (!entry) {
      return NextResponse.json({ error: "User not found on leaderboard" }, { status: 404 });
    }

    return NextResponse.json({ ...entry, totalPlayers: ranked.length });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
