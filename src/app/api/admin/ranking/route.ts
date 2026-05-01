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
    const limit = parseInt(searchParams.get("limit") || "100");
    const difficulty = searchParams.get("difficulty") || "expert";

    const supabase = await createClient();

    // Get all passage history with difficulty filter
    const { data: historyData, error: historyError } = await supabase
      .from("passage_history")
      .select("user_id, wpm, accuracy, attempted_at, difficulty")
      .eq("difficulty", difficulty)
      .order("wpm", { ascending: false })
      .limit(limit * 3);

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

    // Group by user and get their best score and total attempts
    const userStats = new Map();

    historyData?.forEach((entry: any) => {
      const userId = entry.user_id;
      const user = usersMap.get(userId);
      const existing = userStats.get(userId);

      if (!existing) {
        userStats.set(userId, {
          userId,
          username: user?.username || user?.display_name || "Anonymous",
          displayName: user?.display_name || user?.username || "Anonymous",
          avatarUrl: user?.avatar_url || null,
          preferredLanguage: user?.preferred_language || "english",
          createdAt: user?.created_at,
          bestWpm: entry.wpm,
          bestAccuracy: entry.accuracy,
          bestDate: entry.attempted_at,
          totalAttempts: 1,
          totalWpm: entry.wpm,
          totalAccuracy: entry.accuracy,
        });
      } else {
        existing.totalAttempts += 1;
        existing.totalWpm += entry.wpm;
        existing.totalAccuracy += entry.accuracy;

        if (entry.wpm > existing.bestWpm) {
          existing.bestWpm = entry.wpm;
          existing.bestAccuracy = entry.accuracy;
          existing.bestDate = entry.attempted_at;
        }
      }
    });

    // Convert to array and calculate averages
    const leaderboard = Array.from(userStats.values())
      .map((entry) => ({
        ...entry,
        avgWpm: Math.round(entry.totalWpm / entry.totalAttempts),
        avgAccuracy: Math.round(entry.totalAccuracy / entry.totalAttempts),
      }))
      .sort((a, b) => b.bestWpm - a.bestWpm)
      .slice(0, limit)
      .map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        username: entry.username,
        displayName: entry.displayName,
        avatarUrl: entry.avatarUrl,
        preferredLanguage: entry.preferredLanguage,
        createdAt: entry.createdAt,
        bestWpm: entry.bestWpm,
        bestAccuracy: entry.bestAccuracy,
        bestDate: entry.bestDate,
        avgWpm: entry.avgWpm,
        avgAccuracy: entry.avgAccuracy,
        totalAttempts: entry.totalAttempts,
      }));

    // Get stats
    const stats = {
      totalUsers: userStats.size,
      totalAttempts: historyData?.length || 0,
      avgWpm: leaderboard.length > 0
        ? Math.round(leaderboard.reduce((sum, u) => sum + u.avgWpm, 0) / leaderboard.length)
        : 0,
      topWpm: leaderboard.length > 0 ? leaderboard[0].bestWpm : 0,
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
