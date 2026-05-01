"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { MdEmojiEvents, MdPerson, MdSpeed, MdCheckCircle } from "react-icons/md";

const ADMIN_EMAIL = "touxhk@gmail.com";
const ADMIN_ID = "8OZdxsSF8gY5ysBogP5yqkTMaZI3";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  preferredLanguage: string;
  createdAt: string;
  bestWpm: number;
  bestAccuracy: number;
  bestDate: string;
  avgWpm: number;
  avgAccuracy: number;
  totalAttempts: number;
}

interface Stats {
  totalUsers: number;
  totalAttempts: number;
  avgWpm: number;
  topWpm: number;
}

export default function AdminRankingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAttempts: 0,
    avgWpm: 0,
    topWpm: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("expert");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (!loading) {
      if (!user || (user.email !== ADMIN_EMAIL && user.id !== ADMIN_ID)) {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && (user.email === ADMIN_EMAIL || user.id === ADMIN_ID)) {
      fetchRankingData();
    }
  }, [user, difficultyFilter]);

  const fetchRankingData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/ranking?difficulty=${difficultyFilter}&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${user?.id}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch ranking data");

      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
      setStats(data.stats || { totalUsers: 0, totalAttempts: 0, avgWpm: 0, topWpm: 0 });
      setFilteredLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Failed to fetch ranking data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = leaderboard;

    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.userId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLeaderboard(filtered);
  }, [searchQuery, leaderboard]);

  if (loading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-xl text-white">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!user || (user.email !== ADMIN_EMAIL && user.id !== ADMIN_ID)) {
    return null;
  }

  const difficulties = ["beginner", "advanced", "expert"];

  return (
    <AdminLayout>
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black uppercase tracking-wider text-white mb-2">
              Ranking Management
            </h1>
            <p className="text-foreground/60">View and manage leaderboard rankings</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/3 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <MdPerson className="h-6 w-6 text-primary" />
                <div className="text-xs uppercase tracking-wider text-foreground/50">
                  Total Users
                </div>
              </div>
              <div className="text-3xl font-bold text-primary">{stats.totalUsers}</div>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <MdCheckCircle className="h-6 w-6 text-green-400" />
                <div className="text-xs uppercase tracking-wider text-foreground/50">
                  Total Attempts
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalAttempts}</div>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <MdSpeed className="h-6 w-6 text-blue-400" />
                <div className="text-xs uppercase tracking-wider text-foreground/50">
                  Average WPM
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{stats.avgWpm}</div>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <MdEmojiEvents className="h-6 w-6 text-yellow-400" />
                <div className="text-xs uppercase tracking-wider text-foreground/50">
                  Top WPM
                </div>
              </div>
              <div className="text-3xl font-bold text-primary">{stats.topWpm}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/3 border border-white/10 rounded-lg p-6 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username, name, or ID..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-foreground/40 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-2">
                  Difficulty
                </label>
                <div className="flex gap-2">
                  {difficulties.map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficultyFilter(diff)}
                      className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${difficultyFilter === diff
                        ? "bg-primary text-black"
                        : "bg-white/5 text-foreground/60 hover:bg-white/10"
                        }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white/3 border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Rank
                    </th>
                    <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      User
                    </th>
                    <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Language
                    </th>
                    <th className="text-right py-4 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Best WPM
                    </th>
                    <th className="text-right py-4 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Best Accuracy
                    </th>
                    <th className="text-right py-4 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Avg WPM
                    </th>
                    <th className="text-right py-4 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Avg Accuracy
                    </th>
                    <th className="text-right py-4 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Attempts
                    </th>
                    <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Best Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.map((entry) => (
                    <tr
                      key={entry.userId}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {entry.rank === 1 && (
                            <MdEmojiEvents className="h-5 w-5 text-yellow-400" />
                          )}
                          {entry.rank === 2 && (
                            <MdEmojiEvents className="h-5 w-5 text-gray-400" />
                          )}
                          {entry.rank === 3 && (
                            <MdEmojiEvents className="h-5 w-5 text-orange-400" />
                          )}
                          <span className="text-foreground/80 font-bold">#{entry.rank}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-foreground/80 font-medium">
                            {entry.displayName}
                          </div>
                          <div className="text-xs text-foreground/50">@{entry.username}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 rounded text-xs font-bold uppercase bg-primary/20 text-primary">
                          {entry.preferredLanguage}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-primary font-bold text-lg">{entry.bestWpm}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-foreground/80">
                        {entry.bestAccuracy}%
                      </td>
                      <td className="py-3 px-4 text-right text-foreground/80 font-medium">
                        {entry.avgWpm}
                      </td>
                      <td className="py-3 px-4 text-right text-foreground/80">
                        {entry.avgAccuracy}%
                      </td>
                      <td className="py-3 px-4 text-right text-foreground/80">
                        {entry.totalAttempts}
                      </td>
                      <td className="py-3 px-4 text-foreground/60 text-xs">
                        {new Date(entry.bestDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
