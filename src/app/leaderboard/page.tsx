"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { LuShare2, LuCheck } from "react-icons/lu";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  preferredLanguage?: string;
  passageLanguage?: string;
  wpm: number;
  accuracy: number;
  date: string;
}

const filters = ["Today", "This Week", "All Time"];
const languages = ["English", "Lao"];

function getSpeedTier(wpm: number) {
  if (wpm >= 130) return { label: "Legend", bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30" };
  if (wpm >= 100) return { label: "Elite", bg: "bg-primary/20", text: "text-primary", border: "border-primary/30" };
  if (wpm >= 70)  return { label: "Pro", bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" };
  if (wpm >= 45)  return { label: "Average", bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" };
  return { label: "Rising", bg: "bg-white/5", text: "text-foreground/40", border: "border-white/10" };
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("All Time");
  const [activeLanguage, setActiveLanguage] = useState<string>("English");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setLeaderboard(data.leaderboard || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filterLeaderboardByTime = (data: LeaderboardEntry[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let filtered = data;
    if (activeFilter === "Today") {
      filtered = data.filter((e) => new Date(e.date) >= today);
    } else if (activeFilter === "This Week") {
      filtered = data.filter((e) => new Date(e.date) >= weekAgo);
    }

    const langFilter = activeLanguage.toLowerCase();
    filtered = filtered.filter((e) => e.passageLanguage === langFilter);
    return filtered.map((e, i) => ({ ...e, rank: i + 1 }));
  };

  const filteredLeaderboard = filterLeaderboardByTime(leaderboard);
  const topThree = filteredLeaderboard.slice(0, 3);
  const restOfLeaderboard = filteredLeaderboard.slice(3);

  const maxWpm = filteredLeaderboard[0]?.wpm || 1;

  const getInitials = (name: string | undefined | null) => {
    if (!name || name === "???") return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const podiumOrder = [
    { entry: topThree[1] || null, pos: 2 },
    { entry: topThree[0] || null, pos: 1 },
    { entry: topThree[2] || null, pos: 3 },
  ];

  const myEntry = user ? filteredLeaderboard.find((e) => e.userId === user.id) : null;

  const handleShare = async () => {
    if (!myEntry) return;
    const lang = activeLanguage.toLowerCase();
    const url = `${window.location.origin}/rank/${myEntry.userId}?lang=${lang}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy your rank link:", url);
    }
  };

  const podiumConfig = {
    1: {
      badge: "🥇",
      label: "1ST",
      avatarRing: "border-amber-400 shadow-[0_0_28px_rgba(251,191,36,0.35)]",
      avatarBg: "bg-amber-400/15 text-amber-300",
      nameCls: "text-amber-300",
      rankBg: "bg-amber-400/20 border-amber-400/40 text-amber-300",
      elevate: "md:-translate-y-6",
      glow: "shadow-[0_0_40px_rgba(251,191,36,0.12)]",
      border: "border-amber-400/40",
      barColor: "bg-amber-400",
    },
    2: {
      badge: "🥈",
      label: "2ND",
      avatarRing: "border-slate-300/60 shadow-[0_0_18px_rgba(203,213,225,0.2)]",
      avatarBg: "bg-slate-300/10 text-slate-300",
      nameCls: "text-slate-200",
      rankBg: "bg-slate-300/15 border-slate-300/30 text-slate-300",
      elevate: "md:-translate-y-2",
      glow: "",
      border: "border-white/15",
      barColor: "bg-slate-300",
    },
    3: {
      badge: "🥉",
      label: "3RD",
      avatarRing: "border-orange-400/60 shadow-[0_0_18px_rgba(251,146,60,0.2)]",
      avatarBg: "bg-orange-400/10 text-orange-400",
      nameCls: "text-orange-300",
      rankBg: "bg-orange-400/15 border-orange-400/30 text-orange-400",
      elevate: "",
      glow: "",
      border: "border-orange-400/25",
      barColor: "bg-orange-400",
    },
  } as const;

  if (loading) {
    return (
      <section className="relative flex-1 overflow-hidden bg-background px-4 py-10 md:px-8 md:py-14">
        <div className="flex flex-col items-center justify-center gap-4 py-32">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/40">Loading rankings…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex-1 overflow-hidden bg-background px-4 py-10 md:px-8 md:py-14">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/30" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/8 blur-[160px]" />
      <div className="pointer-events-none absolute right-10 top-40 h-64 w-64 rounded-full bg-amber-400/5 blur-[160px]" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10">

        {/* ── Header ── */}
        <div className="animate-slide-up flex flex-col gap-6">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Global Rankings</span>
                <span className="inline-flex items-center rounded-full border border-amber-300/40 bg-amber-400/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.25em] text-amber-300">
                  Expert only
                </span>
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tight text-foreground drop-shadow-[0_0_24px_rgba(11,175,231,0.2)] md:text-7xl">
                Leader<span className="text-primary">board</span>
              </h1>
              {filteredLeaderboard.length > 0 && (
                <p className="mt-2 text-sm text-foreground/50">
                  <span className="font-bold text-foreground/70">{filteredLeaderboard.length}</span> entries · top speed{" "}
                  <span className="font-bold text-primary">{filteredLeaderboard[0]?.wpm} WPM</span>
                </p>
              )}
            </div>

            {/* Right side: Share (top) + Time filters (bottom) */}
            <div className="flex flex-col items-end gap-3">
              {myEntry && (
                <button
                  onClick={handleShare}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                    copied
                      ? "border-green-400/50 bg-green-500/10 text-green-400"
                      : "border-primary/40 bg-primary/10 text-primary hover:border-primary hover:bg-primary/20"
                  }`}
                  title="Share your rank"
                >
                  {copied ? (
                    <><LuCheck className="h-3.5 w-3.5" /> Copied!</>
                  ) : (
                    <><LuShare2 className="h-3.5 w-3.5" /> Share Rank</>
                  )}
                </button>
              )}

              <div className="flex gap-1.5">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`rounded-lg border px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                      activeFilter === f
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-white/8 bg-white/3 text-foreground/45 hover:border-white/15 hover:text-foreground/70"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Language tabs */}
          <div className="flex gap-1 rounded-xl border border-white/8 bg-white/2 p-1 w-fit">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLanguage(lang)}
                className={`rounded-lg px-6 py-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                  activeLanguage === lang
                    ? "bg-primary text-black shadow-[0_0_18px_rgba(11,175,231,0.3)]"
                    : "text-foreground/45 hover:text-foreground/70"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* ── Podium ── */}
        <div className="grid grid-cols-3 items-end gap-3">
          {podiumOrder.map(({ entry, pos }, i) => {
            const cfg = podiumConfig[pos as 1 | 2 | 3];
            const isEmpty = !entry;
            const delayClass = i === 0 ? "delay-200" : i === 1 ? "delay-100" : "delay-300";

            return (
              <article
                key={pos}
                onClick={() => entry && router.push(`/rank/${entry.userId}`)}
                className={`animate-scale-in ${delayClass} glass relative flex flex-col rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 ${cfg.elevate} ${cfg.border} ${cfg.glow} ${entry ? "cursor-pointer" : ""}`}
              >
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.04),transparent_55%)]" />

                {/* Rank badge */}
                <div className={`relative mb-4 self-start rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] ${cfg.rankBg}`}>
                  {cfg.badge} {cfg.label}
                </div>

                {/* Avatar */}
                <div className={`relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-sm font-black overflow-hidden ${cfg.avatarRing} ${cfg.avatarBg}`}>
                  {entry?.avatarUrl ? (
                    <img src={entry.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    isEmpty ? pos : getInitials(entry?.displayName)
                  )}
                </div>

                {/* Name */}
                <div className={`relative text-lg font-black tracking-tight truncate ${cfg.nameCls}`}>
                  {entry?.displayName || "—"}
                </div>

                {/* Stats */}
                <div className="relative mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-black tabular-nums text-foreground">
                      {entry?.wpm || "—"}
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-[0.35em] text-foreground/35 mt-0.5">WPM</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black tabular-nums text-foreground/70">
                      {entry?.accuracy ? Math.round(entry.accuracy) + "%" : "—"}
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-[0.35em] text-foreground/35 mt-0.5">ACC</div>
                  </div>
                </div>

                {/* WPM bar */}
                {entry && (
                  <div className="relative mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${cfg.barColor}`}
                      style={{ width: `${Math.round((entry.wpm / maxWpm) * 100)}%` }}
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* ── Table (rank 4+) ── */}
        {restOfLeaderboard.length > 0 && (
          <div className="animate-slide-up delay-400 glass overflow-hidden rounded-2xl border border-white/8">
            <div className="border-b border-white/5 px-6 py-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-foreground/40">Full Rankings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.35em] text-foreground/30 w-16">#</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.35em] text-foreground/30">Player</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.35em] text-foreground/30">Speed</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.35em] text-foreground/30 hidden md:table-cell">Accuracy</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.35em] text-foreground/30 hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {restOfLeaderboard.map((player) => {
                    const tier = getSpeedTier(player.wpm);
                    const barWidth = Math.round((player.wpm / maxWpm) * 100);
                    return (
                      <tr key={player.rank} onClick={() => router.push(`/rank/${player.userId}`)} className="group cursor-pointer border-t border-white/4 transition-colors hover:bg-white/3">
                        <td className="px-6 py-4">
                          <span className="text-sm font-black tabular-nums text-foreground/30">
                            {String(player.rank).padStart(2, "0")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-xs font-black text-primary overflow-hidden">
                              {player.avatarUrl ? (
                                <img src={player.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                              ) : (
                                getInitials(player.displayName)
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-foreground">{player.displayName}</div>
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${tier.bg} ${tier.text} ${tier.border}`}>
                                {tier.label}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xl font-black tabular-nums text-primary">{player.wpm}</span>
                            <div className="h-1 w-24 overflow-hidden rounded-full bg-white/5">
                              <div
                                className="h-full rounded-full bg-primary/70 transition-all duration-500"
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-6 py-4 md:table-cell">
                          <span className={`text-base font-black tabular-nums ${player.accuracy >= 95 ? "text-green-400" : player.accuracy >= 85 ? "text-yellow-400" : "text-foreground/50"}`}>
                            {Math.round(player.accuracy)}%
                          </span>
                        </td>
                        <td className="hidden px-6 py-4 lg:table-cell">
                          <span className="text-xs text-foreground/35">{formatDate(player.date)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredLeaderboard.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="text-5xl">🏆</div>
            <p className="text-lg font-black uppercase tracking-wider text-foreground/40">No scores yet</p>
            <p className="text-sm text-foreground/25">Be the first to claim the top spot.</p>
          </div>
        )}
      </div>
    </section>
  );
}
