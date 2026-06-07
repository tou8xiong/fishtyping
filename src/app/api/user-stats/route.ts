import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, unauthorized } from "@/lib/auth/verifyAuth";

export async function GET(request: NextRequest) {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const language = searchParams.get("language");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Users can only fetch their own stats
    if (userId !== authUser.uid) {
      return unauthorized("Forbidden");
    }

    const supabase = await createClient();

    const wantsLanguage = language === "english" || language === "lao";
    const selectClause = wantsLanguage ? "*, passages!inner(language)" : "*";
    let query = supabase
      .from("passage_history")
      .select(selectClause)
      .eq("user_id", userId);

    if (wantsLanguage) {
      query = query.eq("passages.language", language!);
    }

    const { data: rawHistory, error } = await query.order("attempted_at", { ascending: false });
    const history = (rawHistory as unknown as Array<{
      wpm: number | null;
      accuracy: number | null;
      duration_ms: number | null;
    }> | null) || [];

    if (error) {
      console.error("Error fetching passage history:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalSessions = history.length;
    const validSessions = history.filter((h) => h.wpm && h.accuracy);

    const totalWpm = validSessions.reduce((sum, h) => sum + (h.wpm || 0), 0);
    const totalAccuracy = validSessions.reduce((sum, h) => sum + (h.accuracy || 0), 0);
    const totalDuration = validSessions.reduce((sum, h) => sum + (h.duration_ms || 0), 0);

    const averageWpm = validSessions.length > 0 ? Math.round(totalWpm / validSessions.length) : 0;
    const averageAccuracy = validSessions.length > 0 ? Math.round(totalAccuracy / validSessions.length) : 0;
    const bestWpm = validSessions.length > 0 ? Math.max(...validSessions.map((h) => h.wpm || 0)) : 0;
    const totalTimeMinutes = Math.round(totalDuration / 60000);

    const totalWordsTyped = validSessions.reduce((sum, h) => {
      const minutes = (h.duration_ms || 0) / 60000;
      return sum + Math.round((h.wpm || 0) * minutes);
    }, 0);

    return NextResponse.json({
      totalSessions,
      totalWordsTyped,
      averageWpm,
      averageAccuracy,
      bestWpm,
      totalTimeMinutes,
      recentHistory: history.slice(0, 10),
    });
  } catch (error: any) {
    console.error("Error in user stats API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
