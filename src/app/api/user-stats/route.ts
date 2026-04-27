import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch passage history for all difficulty levels
    const { data: history, error } = await supabase
      .from("passage_history")
      .select("*")
      .eq("user_id", userId)
      .order("attempted_at", { ascending: false });

    if (error) {
      console.error("Error fetching passage history:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate stats
    const totalSessions = history?.length || 0;
    const validSessions = history?.filter((h) => h.wpm && h.accuracy) || [];

    const totalWpm = validSessions.reduce((sum, h) => sum + (h.wpm || 0), 0);
    const totalAccuracy = validSessions.reduce((sum, h) => sum + (h.accuracy || 0), 0);
    const totalDuration = validSessions.reduce((sum, h) => sum + (h.duration_ms || 0), 0);

    const averageWpm = validSessions.length > 0 ? Math.round(totalWpm / validSessions.length) : 0;
    const averageAccuracy = validSessions.length > 0 ? Math.round(totalAccuracy / validSessions.length) : 0;
    const bestWpm = validSessions.length > 0 ? Math.max(...validSessions.map((h) => h.wpm || 0)) : 0;
    const totalTimeMinutes = Math.round(totalDuration / 60000);

    // Estimate total words typed (rough calculation: wpm * duration in minutes)
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
      recentHistory: history?.slice(0, 10) || [],
    });
  } catch (error: any) {
    console.error("Error in user stats API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
