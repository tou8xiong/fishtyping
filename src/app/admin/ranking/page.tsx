"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import TablePagination from "@/components/TablePagination";
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
  wpm: number;
  accuracy: number;
  attemptedAt: string;
  passageId: string;
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
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
        `/api/admin/ranking?difficulty=${difficultyFilter}&limit=1000`,
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

    if (languageFilter !== "all") {
      filtered = filtered.filter((entry) => entry.preferredLanguage === languageFilter);
    }

    setFilteredLeaderboard(filtered);
    setPage(1);
  }, [searchQuery, languageFilter, leaderboard]);

  const paginatedLeaderboard = filteredLeaderboard.slice((page - 1) * pageSize, page * pageSize);

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
  const languages = ["all", "english", "lao"];

  return (
    <AdminLayout>
      <div className="py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <AdminBreadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Ranking" }]} />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <div className="bg-white/3 border border-white/10 rounded-md px-3 py-2">
              <div className="flex items-center gap-2 mb-0.5">
                <MdPerson className="h-3.5 w-3.5 text-primary" />
                <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Users</div>
              </div>
              <div className="text-lg font-bold text-primary">{stats.totalUsers}</div>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-md px-3 py-2">
              <div className="flex items-center gap-2 mb-0.5">
                <MdCheckCircle className="h-3.5 w-3.5 text-green-400" />
                <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Attempts</div>
              </div>
              <div className="text-lg font-bold text-white">{stats.totalAttempts}</div>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-md px-3 py-2">
              <div className="flex items-center gap-2 mb-0.5">
                <MdSpeed className="h-3.5 w-3.5 text-blue-400" />
                <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Avg WPM</div>
              </div>
              <div className="text-lg font-bold text-white">{stats.avgWpm}</div>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-md px-3 py-2">
              <div className="flex items-center gap-2 mb-0.5">
                <MdEmojiEvents className="h-3.5 w-3.5 text-yellow-400" />
                <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Top WPM</div>
              </div>
              <div className="text-lg font-bold text-primary">{stats.topWpm}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/3 border border-white/10 rounded-md px-3 py-2 mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username, name, or ID..."
              className="flex-1 min-w-[200px] px-2.5 py-1 bg-white/5 border border-white/10 rounded text-white text-xs placeholder-foreground/40 focus:border-primary focus:outline-none"
            />

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Difficulty</span>
              <div className="flex gap-1">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${difficultyFilter === diff
                      ? "bg-primary text-black"
                      : "bg-white/5 text-foreground/60 hover:bg-white/10"
                      }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Language</span>
              <div className="flex gap-1">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguageFilter(lang)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${languageFilter === lang
                      ? "bg-primary text-black"
                      : "bg-white/5 text-foreground/60 hover:bg-white/10"
                      }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white/3 border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#1e1e1e] border-b border-white/10">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      User
                    </th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Language
                    </th>
                    <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      WPM
                    </th>
                    <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Accuracy
                    </th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Attempted At
                    </th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-foreground/50 font-black">
                      Passage ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeaderboard.map((entry, index) => (
                    <tr
                      key={`${entry.userId}-${entry.attemptedAt}-${index}`}
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
                        <span className="text-primary font-bold text-lg">{entry.wpm}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-foreground/80">
                        {entry.accuracy}%
                      </td>
                      <td className="py-3 px-4 text-foreground/60 text-xs">
                        {new Date(entry.attemptedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-foreground/60 text-xs font-mono">
                        {entry.passageId ? `${entry.passageId.slice(0, 8)}...` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              page={page}
              pageSize={pageSize}
              totalRows={filteredLeaderboard.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
