import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "touxhk@gmail.com";
const ADMIN_ID = "8OZdxsSF8gY5ysBogP5yqkTMaZI3";

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return null;
  }

  const userId = authHeader.replace("Bearer ", "");
  return userId;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAdmin(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "1000");
    const difficulty = searchParams.get("difficulty") || "expert";

    const supabase = await createClient();

    // Get all passage history with difficulty filter
    const { data: historyData, error: historyError } = await supabase
      .from("passage_history")
      .select("user_id, wpm, accuracy, attempted_at, difficulty, passage_id")
      .eq("difficulty", difficulty)
      .order("attempted_at", { ascending: false })
      .limit(limit);

    if (historyError) {
      console.error("Error fetching passage history:", historyError);
      return NextResponse.json({ error: historyError.message }, { status: 500 });
    }

    // Get all unique user IDs
    const userIds = [...new Set(historyData?.map((entry) => entry.user_id) || [])];

    // Fetch user details
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, username, display_name, avatar_url, preferred_language, created_at")
      .in("id", userIds);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    // Create a map of user details
    const usersMap = new Map(usersData?.map((user) => [user.id, user]) || []);

    // Create leaderboard with all attempts
    const leaderboard = historyData?.map((entry: any, index: number) => {
      const user = usersMap.get(entry.user_id);
      return {
        rank: index + 1,
        userId: entry.user_id,
        username: user?.username || user?.display_name || "Anonymous",
        displayName: user?.display_name || user?.username || "Anonymous",
        avatarUrl: user?.avatar_url || null,
        preferredLanguage: user?.preferred_language || "english",
        createdAt: user?.created_at,
        wpm: entry.wpm,
        accuracy: entry.accuracy,
        attemptedAt: entry.attempted_at,
        passageId: entry.passage_id,
      };
    }) || [];

    // Get stats
    const uniqueUsers = new Set(historyData?.map((entry) => entry.user_id) || []);
    const stats = {
      totalUsers: uniqueUsers.size,
      totalAttempts: historyData?.length || 0,
      avgWpm: historyData && historyData.length > 0
        ? Math.round(historyData.reduce((sum: number, entry: any) => sum + entry.wpm, 0) / historyData.length)
        : 0,
      topWpm: historyData && historyData.length > 0
        ? Math.max(...historyData.map((entry: any) => entry.wpm))
        : 0,
    };

    return NextResponse.json({ leaderboard, stats });
  } catch (error: any) {
    console.error("GET /api/admin/ranking error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ranking data" },
      { status: 500 }
    );
  }
}
