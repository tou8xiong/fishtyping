import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { ok, retryAfter } = rateLimit(ip, 30);
  if (!ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const { userId } = await params;

  try {
    const supabase = await createClient();

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, username, display_name, avatar_url, preferred_language, created_at")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: rawHistory, error: historyError } = await supabase
      .from("passage_history")
      .select("wpm, accuracy, duration_ms, attempted_at, passages(language, difficulty)")
      .eq("user_id", userId)
      .order("attempted_at", { ascending: false })
      .limit(100);

    if (historyError) {
      return NextResponse.json({ error: historyError.message }, { status: 500 });
    }

    const history = (rawHistory || []) as unknown as Array<{
      wpm: number | null;
      accuracy: number | null;
      duration_ms: number | null;
      attempted_at: string;
      passages: { language: string; difficulty: string } | null;
    }>;

    const valid = history.filter((h) => h.wpm && h.accuracy);

    const totalSessions = history.length;
    const bestWpm = valid.length > 0 ? Math.max(...valid.map((h) => h.wpm!)) : 0;
    const avgWpm = valid.length > 0 ? Math.round(valid.reduce((s, h) => s + h.wpm!, 0) / valid.length) : 0;
    const avgAccuracy = valid.length > 0 ? Math.round(valid.reduce((s, h) => s + h.accuracy!, 0) / valid.length) : 0;
    const totalWords = valid.reduce((s, h) => s + Math.round(h.wpm! * ((h.duration_ms || 0) / 60000)), 0);
    const totalTimeMinutes = Math.round(valid.reduce((s, h) => s + (h.duration_ms || 0), 0) / 60000);

    const expertHistory = valid.filter((h) => h.passages?.difficulty === "expert");
    const bestByLang = (lang: string) =>
      expertHistory
        .filter((h) => h.passages?.language === lang)
        .reduce<{ wpm: number; accuracy: number } | null>(
          (best, h) => (!best || h.wpm! > best.wpm ? { wpm: h.wpm!, accuracy: h.accuracy! } : best),
          null
        );

    return NextResponse.json(
      {
        profile: {
          id: profile.id,
          displayName: profile.display_name || profile.username || "Anonymous",
          username: profile.username,
          avatarUrl: profile.avatar_url,
          preferredLanguage: profile.preferred_language,
        },
        stats: { totalSessions, bestWpm, avgWpm, avgAccuracy, totalWords, totalTimeMinutes },
        bestScores: {
          english: bestByLang("english"),
          lao: bestByLang("lao"),
        },
      },
      { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
