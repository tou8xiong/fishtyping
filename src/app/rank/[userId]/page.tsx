"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LuArrowLeft, LuKeyboard, LuTarget, LuTrendingUp, LuClock, LuType } from "react-icons/lu";



interface Profile {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  preferredLanguage?: string;
}

interface Stats {
  totalSessions: number;
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
  totalWords: number;
  totalTimeMinutes: number;
}

interface BestScore {
  wpm: number;
  accuracy: number;
}

function getSpeedTier(wpm: number) {
  if (wpm >= 130) return { label: "Legend", color: "text-purple-300", border: "border-purple-500/40", bg: "bg-purple-500/10" };
  if (wpm >= 100) return { label: "Elite", color: "text-primary", border: "border-primary/40", bg: "bg-primary/10" };
  if (wpm >= 70)  return { label: "Pro", color: "text-green-400", border: "border-green-500/40", bg: "bg-green-500/10" };
  if (wpm >= 45)  return { label: "Average", color: "text-yellow-400", border: "border-yellow-500/40", bg: "bg-yellow-500/10" };
  return { label: "Rising", color: "text-foreground/50", border: "border-white/15", bg: "bg-white/5" };
}

function getInitials(name: string | undefined | null) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}


export default function RankPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = params.userId as string;
  const highlightLang = searchParams.get("lang") || "english";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [bestScores, setBestScores] = useState<{ english: BestScore | null; lao: BestScore | null }>({ english: null, lao: null });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/rank/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setNotFound(true); setLoading(false); return; }
        setProfile(data.profile);
        setStats(data.stats);
        setBestScores(data.bestScores);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [userId]);

  if (loading) {
    return (
      <section className="relative flex-1 bg-background px-4 py-10 md:px-8 md:py-14">
        <div className="flex flex-col items-center justify-center gap-4 py-32">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/40">Loading profile…</p>
        </div>
      </section>
    );
  }

  if (notFound || !profile || !stats) {
    return (
      <section className="relative flex-1 bg-background px-4 py-10 md:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6 py-32 text-center">
          <div className="text-5xl">🐟</div>
          <p className="text-xl font-black uppercase tracking-wider text-foreground/50">Player not found</p>
          <Link href="/leaderboard" className="text-sm text-primary hover:text-primary/80 transition-colors">
            ← Back to leaderboard
          </Link>
        </div>
      </section>
    );
  }

  const tier = getSpeedTier(stats.bestWpm);

  return (
    <section className="relative flex-1 overflow-hidden bg-background px-4 py-10 md:px-8 md:py-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/30" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/6 blur-[160px]" />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-8">

        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="animate-fade-in flex items-center gap-2 self-start text-[11px] font-black uppercase tracking-[0.25em] text-foreground/40 transition-colors hover:text-foreground/70"
        >
          <LuArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        {/* ── Hero ── */}
        <div className="animate-scale-in glass flex flex-col gap-6 rounded-2xl border border-white/8 p-6 sm:flex-row sm:items-center sm:gap-8 md:p-8">
          {/* Avatar */}
          <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-2 text-2xl font-black overflow-hidden ${tier.border} ${tier.bg}`}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              getInitials(profile.displayName)
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] ${tier.border} ${tier.bg} ${tier.color}`}>
                {tier.label}
              </span>
            </div>
            <h1 className="truncate text-4xl font-black tracking-tight text-foreground md:text-5xl">
              {profile.displayName}
            </h1>
            {profile.username && profile.username !== profile.displayName && (
              <p className="mt-1 text-sm text-foreground/40">@{profile.username}</p>
            )}
          </div>

          {/* Best WPM highlight */}
          <div className="shrink-0 text-center">
            <div className="text-5xl font-black tabular-nums text-primary md:text-6xl">{stats.bestWpm || "—"}</div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.35em] text-foreground/35">Best WPM</div>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="animate-slide-up delay-200 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {[
            { icon: LuKeyboard, label: "Sessions", value: stats.totalSessions.toLocaleString() },
            { icon: LuTrendingUp, label: "Avg WPM", value: stats.avgWpm || "—" },
            { icon: LuTarget, label: "Avg Acc", value: stats.avgAccuracy ? `${stats.avgAccuracy}%` : "—" },
            { icon: LuType, label: "Words Typed", value: stats.totalWords.toLocaleString() },
            { icon: LuClock, label: "Time Typed", value: stats.totalTimeMinutes >= 60 ? `${Math.floor(stats.totalTimeMinutes / 60)}h ${stats.totalTimeMinutes % 60}m` : `${stats.totalTimeMinutes}m` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="glass flex flex-col gap-1 rounded-xl border border-white/8 p-4">
              <Icon className="h-4 w-4 text-primary/60" />
              <div className="mt-1 text-2xl font-black tabular-nums text-foreground">{value}</div>
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/35">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Best Expert Scores ── */}
        {(bestScores.english || bestScores.lao) && (
          <div className="animate-slide-up delay-300">
            <h2 className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-foreground/35">Best Expert Scores</h2>
            <div className="grid grid-cols-2 gap-3">
              {(["english", "lao"] as const).map((lang) => {
                const score = bestScores[lang];
                const isHighlight = highlightLang === lang;
                return (
                  <div
                    key={lang}
                    className={`glass rounded-xl border p-5 transition-all ${isHighlight ? "border-primary/40 shadow-[0_0_24px_rgba(11,175,231,0.1)]" : "border-white/8"}`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 capitalize">{lang}</span>
                      {isHighlight && (
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary">Featured</span>
                      )}
                    </div>
                    {score ? (
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-4xl font-black tabular-nums text-primary">{score.wpm}</div>
                          <div className="mt-0.5 text-[9px] font-black uppercase tracking-[0.35em] text-foreground/35">WPM</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-black tabular-nums ${score.accuracy >= 95 ? "text-green-400" : score.accuracy >= 85 ? "text-yellow-400" : "text-foreground/50"}`}>
                            {Math.round(score.accuracy)}%
                          </div>
                          <div className="mt-0.5 text-[9px] font-black uppercase tracking-[0.35em] text-foreground/35">Accuracy</div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/25">No expert runs yet</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="animate-slide-up delay-400 pb-4 text-center">
          <Link href="/leaderboard" className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/25 transition-colors hover:text-foreground/50">
            ← Global Leaderboard
          </Link>
        </div>
      </div>
    </section>
  );
}
