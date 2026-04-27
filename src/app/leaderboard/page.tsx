"use client";

import { useEffect, useState } from "react";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  wpm: number;
  accuracy: number;
  date: string;
}

const filters = ["Today", "This Week", "All Time"];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("All Time");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setLeaderboard(data.leaderboard || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching leaderboard:", err);
        setLoading(false);
      });
  }, []);

  const filterLeaderboardByTime = (data: LeaderboardEntry[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (activeFilter === "Today") {
      return data.filter((entry) => new Date(entry.date) >= today);
    } else if (activeFilter === "This Week") {
      return data.filter((entry) => new Date(entry.date) >= weekAgo);
    }
    return data; // All Time
  };

  const filteredLeaderboard = filterLeaderboardByTime(leaderboard);
  const topThree = filteredLeaderboard.slice(0, 3);
  const restOfLeaderboard = filteredLeaderboard.slice(3);

  // Placeholder data for empty leaderboard
  const placeholderTopThree = [
    { rank: 2, displayName: "???", avatarUrl: undefined, wpm: 0, accuracy: 0 },
    { rank: 1, displayName: "???", avatarUrl: undefined, wpm: 0, accuracy: 0 },
    { rank: 3, displayName: "???", avatarUrl: undefined, wpm: 0, accuracy: 0 },
  ];

  const placeholderList = Array.from({ length: 5 }, (_, i) => ({
    rank: i + 4,
    displayName: "???",
    avatarUrl: undefined,
    wpm: 0,
    accuracy: 0,
    date: new Date().toISOString(),
  }));

  // Map ranks to display positions: [left (rank 2), middle (rank 1), right (rank 3)]
  const displayTopThree = topThree.length > 0
    ? [
        topThree.find(p => p.rank === 2) || null,  // Left position
        topThree.find(p => p.rank === 1) || null,  // Middle position
        topThree.find(p => p.rank === 3) || null   // Right position
      ]
    : placeholderTopThree;
  const displayList = restOfLeaderboard.length > 0 ? restOfLeaderboard : (topThree.length === 0 ? placeholderList : []);

  const getInitials = (name: string | undefined | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  const getAccent = (rank: number) => {
    if (rank === 1) return "border-secondary/70 shadow-[0_0_28px_rgba(255,195,56,0.18)]";
    if (rank === 2) return "border-white/20";
    if (rank === 3) return "border-secondary/40";
    return "border-border/80";
  };

  if (loading) {
    return (
      <section className="relative flex-1 overflow-hidden bg-background px-4 py-10 md:px-8 md:py-14">
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex-1 overflow-hidden bg-background px-4 py-10 md:px-8 md:py-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/30" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 top-24 h-64 w-64 rounded-full bg-secondary/8 blur-[160px]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 animate-fade-in">
        <div className="glass rounded-xl px-5 py-6 md:px-8 md:py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-primary/70">Leaderboard</p>
              <div className="space-y-2">
                <h1 className="text-4xl font-black uppercase tracking-tight text-primary drop-shadow-[0_0_18px_rgba(11,175,231,0.25)] md:text-6xl">
                  Global Rankings
                </h1>
                <p className="max-w-xl text-base text-foreground/70 md:text-lg">
                  The fastest fingers in the deep sea.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
              {filters.map((filter) => {
                const active = filter === activeFilter;

                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-md border px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.25em] transition-all ${active
                      ? "border-primary bg-primary/15 text-primary shadow-[0_0_22px_rgba(11,175,231,0.22)]"
                      : "border-border bg-white/3 text-foreground/55 hover:border-primary/40 hover:text-foreground"
                      }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {/* Rank 2 - Left */}
          <article
            className={`glass group relative flex min-h-64 flex-col justify-between rounded-xl border px-6 py-7 transition-all duration-300 hover:-translate-y-1 ${getAccent(2)}`}
          >
            <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top,rgba(248,250,252,0.04),transparent_60%)] opacity-70" />
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border text-base font-black border-primary/40 bg-primary/10 text-primary overflow-hidden">
                  {displayTopThree[0]?.avatarUrl ? (
                    <img src={displayTopThree[0].avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    displayTopThree[0] ? getInitials(displayTopThree[0].displayName) : "?"
                  )}
                </div>
                <div className="space-y-1">
                  <div className="inline-flex rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-black text-secondary">
                    {getBadge(2)} #2
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-foreground">
                    {displayTopThree[0]?.displayName || "???"}
                  </h2>
                </div>
              </div>
              <span className="text-2xl text-foreground/20">🏆</span>
            </div>

            <div className="relative mt-8 flex items-end justify-between gap-4">
              <div>
                <div className="text-4xl font-black tabular-nums text-primary/90">
                  {displayTopThree[0]?.wpm || "—"}
                </div>
                <div className="mt-1 text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40">
                  WPM
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black tabular-nums text-secondary">{displayTopThree[0]?.accuracy ? Math.round(displayTopThree[0].accuracy) + "%" : "—"}</div>
                <div className="mt-1 text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40">
                  ACC
                </div>
              </div>
            </div>
          </article>

          {/* Rank 1 - Middle (Elevated) */}
          <article
            className={`glass group relative flex min-h-64 flex-col justify-between rounded-xl border px-6 py-7 transition-all duration-300 hover:-translate-y-1 md:-translate-y-3 ${getAccent(1)}`}
          >
            <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top,rgba(248,250,252,0.04),transparent_60%)] opacity-70" />
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border text-base font-black border-secondary bg-secondary/10 text-secondary shadow-[0_0_18px_rgba(255,195,56,0.2)] overflow-hidden">
                  {displayTopThree[1]?.avatarUrl ? (
                    <img src={displayTopThree[1].avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    displayTopThree[1] ? getInitials(displayTopThree[1].displayName) : "?"
                  )}
                </div>
                <div className="space-y-1">
                  <div className="inline-flex rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-black text-secondary">
                    {getBadge(1)} #1
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-secondary">
                    {displayTopThree[1]?.displayName || "???"}
                  </h2>
                </div>
              </div>
              <span className="text-2xl text-secondary/60">🏆</span>
            </div>

            <div className="relative mt-8 flex items-end justify-between gap-4">
              <div>
                <div className="text-4xl font-black tabular-nums text-primary">
                  {displayTopThree[1]?.wpm || "—"}
                </div>
                <div className="mt-1 text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40">
                  WPM
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black tabular-nums text-secondary">{displayTopThree[1]?.accuracy ? Math.round(displayTopThree[1].accuracy) + "%" : "—"}</div>
                <div className="mt-1 text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40">
                  ACC
                </div>
              </div>
            </div>
          </article>

          {/* Rank 3 - Right */}
          <article
            className={`glass group relative flex min-h-64 flex-col justify-between rounded-xl border px-6 py-7 transition-all duration-300 hover:-translate-y-1 ${getAccent(3)}`}
          >
            <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top,rgba(248,250,252,0.04),transparent_60%)] opacity-70" />
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border text-base font-black border-primary/40 bg-primary/10 text-primary overflow-hidden">
                  {displayTopThree[2]?.avatarUrl ? (
                    <img src={displayTopThree[2].avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    displayTopThree[2] ? getInitials(displayTopThree[2].displayName) : "?"
                  )}
                </div>
                <div className="space-y-1">
                  <div className="inline-flex rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-black text-secondary">
                    {getBadge(3)} #3
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-foreground">
                    {displayTopThree[2]?.displayName || "???"}
                  </h2>
                </div>
              </div>
              <span className="text-2xl text-foreground/20">🏆</span>
            </div>

            <div className="relative mt-8 flex items-end justify-between gap-4">
              <div>
                <div className="text-4xl font-black tabular-nums text-primary/90">
                  {displayTopThree[2]?.wpm || "—"}
                </div>
                <div className="mt-1 text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40">
                  WPM
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black tabular-nums text-secondary">{displayTopThree[2]?.accuracy ? Math.round(displayTopThree[2].accuracy) + "%" : "—"}</div>
                <div className="mt-1 text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40">
                  ACC
                </div>
              </div>
            </div>
          </article>
        </div>

        {displayList.length > 0 && (
          <div className="glass overflow-hidden rounded-xl border border-border/80">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="border-b border-white/5 bg-white/1.5">
                    <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.3em] text-foreground/35 md:px-7">
                      Rank
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.3em] text-foreground/35 md:px-7">
                      Player
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.3em] text-foreground/35 md:px-7">
                      Speed (WPM)
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.3em] text-foreground/35 md:px-7">
                      Accuracy
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.3em] text-foreground/35 md:px-7">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayList.map((player) => (
                    <tr key={player.rank} className="leaderboard-row">
                      <td className="border-t border-white/5 px-6 py-5 md:px-7">
                        <span className="inline-flex min-w-12 justify-center rounded-full border border-white/8 bg-white/2 px-3 py-1 text-sm font-medium text-foreground/75">
                          {String(player.rank).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="border-t border-white/5 px-6 py-5 md:px-7">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-sm font-black text-primary overflow-hidden">
                            {player.avatarUrl ? (
                              <img src={player.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                              player.displayName === "???" ? "?" : getInitials(player.displayName)
                            )}
                          </div>
                          <span className="text-base font-bold text-foreground">{player.displayName}</span>
                        </div>
                      </td>
                      <td className="border-t border-white/5 px-6 py-5 md:px-7">
                        <span className="text-2xl font-black tabular-nums text-primary">{player.wpm || "—"}</span>
                      </td>
                      <td className="border-t border-white/5 px-6 py-5 md:px-7">
                        <span className="text-lg font-black tabular-nums text-secondary">{player.accuracy ? Math.round(player.accuracy) + "%" : "—"}</span>
                      </td>
                      <td className="border-t border-white/5 px-6 py-5 md:px-7">
                        <span className="text-sm font-medium text-foreground/55">{player.displayName === "???" ? "—" : formatDate(player.date)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-10 py-4">
          <div className="text-center">
            <div className="text-xl font-black uppercase tracking-tight text-primary">FishTyping</div>
            <div className="mt-4 flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">
              <span>Discord</span>
              <span>Github</span>
              <span>Twitter</span>
            </div>
            <p className="mt-5 text-[10px] uppercase tracking-[0.24em] text-foreground/20">
              © 2026 FishTyping. High-velocity aquatic inputs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
