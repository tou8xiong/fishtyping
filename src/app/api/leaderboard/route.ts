import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const supabase = await createClient();

    // Get best WPM for each user (expert level only)
    const { data: historyData, error: historyError } = await supabase
      .from("passage_history")
      .select("user_id, wpm, accuracy, attempted_at")
      .eq("difficulty", "expert")
      .order("wpm", { ascending: false })
      .limit(limit * 3); // Get more to account for duplicates

    if (historyError) {
      console.error("Error fetching passage history:", historyError);
      return NextResponse.json({ error: historyError.message }, { status: 500 });
    }

    // Get all unique user IDs
    const userIds = [...new Set(historyData?.map((entry) => entry.user_id) || [])];

    // Fetch user details
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, username, display_name, avatar_url")
      .in("id", userIds);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    // Create a map of user details
    const usersMap = new Map(usersData?.map((user) => [user.id, user]) || []);

    // Group by user and get their best score
    const userBestScores = new Map();

    historyData?.forEach((entry: any) => {
      const userId = entry.user_id;
      const user = usersMap.get(userId);
      const existing = userBestScores.get(userId);

      if (!existing || entry.wpm > existing.wpm) {
        userBestScores.set(userId, {
          userId,
          username: user?.username || user?.display_name || "Anonymous",
          displayName: user?.display_name || user?.username || "Anonymous",
          avatarUrl: user?.avatar_url || null,
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
        ...entry,
      }));

    return NextResponse.json({ leaderboard });
  } catch (error: any) {
    console.error("Error in leaderboard API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
