"use client";

import {
  LuActivity, LuBomb, LuCheck, LuGauge, LuHistory,
  LuLogOut, LuPencil, LuSave, LuTarget, LuTrophy, LuUpload, LuX,
} from "react-icons/lu";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { signOutAction } from "@/app/login/actions";
import { getAuthHeaders } from "@/lib/auth/getAuthHeaders";
import { toast } from "sonner";

interface UserStats {
  totalSessions: number;
  totalWordsTyped: number;
  averageWpm: number;
  averageAccuracy: number;
  bestWpm: number;
  totalTimeMinutes: number;
}

interface ActivityItem {
  id: string;
  attempted_at: string;
  difficulty: string | null;
  wpm: number | null;
  accuracy: number | null;
  duration_ms: number | null;
}

const defaultStats: UserStats = {
  totalSessions: 0,
  totalWordsTyped: 0,
  averageWpm: 0,
  averageAccuracy: 0,
  bestWpm: 0,
  totalTimeMinutes: 0,
};

type StatsLanguage = "all" | "english" | "lao";

export default function ProfilePage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [statsLanguage, setStatsLanguage] = useState<StatsLanguage>("all");
  const [statsLoading, setStatsLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatars = Array.from({ length: 9 }, (_, i) => `/avaatart-icon/av${i + 1}.png`);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "");
      setSelectedAvatar(user.avatar_url || "");
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams({ userId: user.id });
    if (statsLanguage !== "all") params.set("language", statsLanguage);
    setStatsLoading(true);
    getAuthHeaders().then((authHeaders) =>
    fetch(`/api/user-stats?${params.toString()}`, { headers: authHeaders }))
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setStats({
            totalSessions: data.totalSessions || 0,
            totalWordsTyped: data.totalWordsTyped || 0,
            averageWpm: data.averageWpm || 0,
            averageAccuracy: data.averageAccuracy || 0,
            bestWpm: data.bestWpm || 0,
            totalTimeMinutes: data.totalTimeMinutes || 0,
          });
          setRecentActivity(data.recentHistory || []);
        }
      })
      .catch((err) => console.error("Error fetching stats:", err))
      .finally(() => setStatsLoading(false));
  }, [user, statsLanguage]);

  const handleSave = async () => {
    if (!user) return;
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch("/api/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          displayName,
          avatarUrl: selectedAvatar,
        }),
      });
      const data = await response.json();
      if (data.error) {
        toast.error("Failed to update profile");
      } else {
        toast.success("Profile updated");
        setEditing(false);
        setShowAvatarPicker(false);
        window.location.reload();
      }
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setShowAvatarPicker(false);
    setDisplayName(user?.display_name || "");
    setSelectedAvatar(user?.avatar_url || "");
  };

  const handleSignOut = async () => {
    await signOut(auth);
    await signOutAction();
    toast.success("Signed out");
    router.push("/login");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Images only"); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedAvatar(reader.result as string);
      toast.success("Image ready");
    };
    reader.readAsDataURL(file);
  };

  const initials = (user?.display_name || user?.username || user?.email || "U")
    .charAt(0).toUpperCase();

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;

  if (loading) {
    return (
      <section className="relative flex-1 bg-background px-4 py-8 md:px-8 md:py-10">
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      </section>
    );
  }

  if (!user) return null;

  return (
    <section className="relative flex-1 overflow-hidden bg-background px-4 py-8 md:px-8 md:py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/30" />
      <div className="pointer-events-none absolute left-20 top-32 h-64 w-64 rounded-full bg-primary/6 blur-[180px]" />
      <div className="pointer-events-none absolute right-20 top-64 h-48 w-48 rounded-full bg-primary/4 blur-[140px]" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-5 animate-fade-in">

        {/* ── Hero Profile Card ── */}
        <div className="glass rounded-2xl border border-border/80 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0" />

          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">

              {/* Avatar column */}
              <div className="flex flex-col items-center gap-3 md:items-start">
                <div className="relative group">
                  <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl overflow-hidden border-2 border-primary/40 shadow-[0_0_28px_rgba(11,175,231,0.15)] bg-primary/10">
                    {selectedAvatar ? (
                      <img src={selectedAvatar} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_30%,rgba(11,175,231,0.5),rgba(11,175,231,0.1)_50%,rgba(18,18,18,0.95)_85%)] text-4xl font-black text-foreground">
                        {initials}
                      </div>
                    )}
                  </div>

                  {editing && (
                    <button
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                      className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Change avatar"
                    >
                      <LuPencil className="h-5 w-5 text-white" />
                    </button>
                  )}
                </div>

                {editing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-white/[0.03] px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-foreground/60 hover:border-primary/40 hover:text-foreground transition-all"
                  >
                    <LuUpload className="h-3 w-3" />
                    Upload
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>

              {/* Info column */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {editing ? (
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Display name"
                        className="w-full rounded-lg border border-primary/50 bg-white/[0.04] px-3 py-2 text-xl font-black text-foreground focus:border-primary focus:outline-none"
                      />
                    ) : (
                      <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground truncate">
                        {user.display_name || user.username || "Anonymous Diver"}
                      </h1>
                    )}

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {user.username && (
                        <span className="text-sm text-primary/70 font-medium">@{user.username}</span>
                      )}
                      <span className="text-sm text-foreground/40">{user.email}</span>
                    </div>

                    {memberSince && (
                      <p className="mt-2 text-[11px] font-black uppercase tracking-[0.2em] text-foreground/30">
                        Member since {memberSince}
                      </p>
                    )}
                  </div>

                  {/* Edit / Save / Cancel */}
                  <div className="flex items-center gap-2 shrink-0">
                    {editing ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-1.5 rounded-lg border border-primary/60 bg-primary/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-primary hover:bg-primary/20 transition-all"
                        >
                          <LuSave className="h-3.5 w-3.5" />
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-white/[0.03] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-foreground/60 hover:border-red-500/40 hover:text-red-400 transition-all"
                        >
                          <LuX className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-white/[0.03] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-foreground/60 hover:border-primary/40 hover:text-foreground transition-all"
                      >
                        <LuPencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick stat pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-white/[0.02] px-3 py-1">
                    <LuActivity className="h-3 w-3 text-primary/60" />
                    <span className="text-[11px] font-black text-foreground/60">{stats.totalSessions} sessions</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-white/[0.02] px-3 py-1">
                    <LuGauge className="h-3 w-3 text-primary/60" />
                    <span className="text-[11px] font-black text-foreground/60">{stats.averageWpm} avg WPM</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-white/[0.02] px-3 py-1">
                    <LuBomb className="h-3 w-3 text-yellow-500/70" />
                    <span className="text-[11px] font-black text-foreground/60">{stats.bestWpm} best WPM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Avatar picker — slides open below when editing */}
            {editing && showAvatarPicker && (
              <div className="mt-6 border-t border-border/60 pt-5">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-foreground/40 mb-3">Choose preset avatar</p>
                <div className="flex flex-wrap gap-3">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`relative h-16 w-16 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                        selectedAvatar === avatar
                          ? "border-primary shadow-[0_0_16px_rgba(11,175,231,0.4)]"
                          : "border-border/40 hover:border-primary/50"
                      }`}
                    >
                      <img src={avatar} alt="" className="h-full w-full object-cover" />
                      {selectedAvatar === avatar && (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                          <LuCheck className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Statistics ── */}
        <div className="glass rounded-2xl border border-border/80 p-6 md:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <LuTrophy className="h-5 w-5 text-primary/70" />
              <div>
                <h2 className="text-xl font-black tracking-tight text-foreground/80">Statistics</h2>
                <p className="text-[11px] text-foreground/35 mt-0.5">
                  All difficulties{statsLanguage !== "all" ? ` · ${statsLanguage === "english" ? "English" : "Lao"}` : ""}
                </p>
              </div>
            </div>
            <div className="inline-flex gap-1 rounded-lg border border-border/80 bg-white/[0.02] p-1">
              {(["all", "english", "lao"] as StatsLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setStatsLanguage(lang)}
                  className={`rounded-md px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] transition-all ${
                    statsLanguage === lang ? "bg-primary/15 text-primary" : "text-foreground/50 hover:text-foreground"
                  }`}
                >
                  {lang === "all" ? "All" : lang === "english" ? "EN" : "LA"}
                </button>
              ))}
            </div>
          </div>

          <div className={`mt-5 transition-opacity ${statsLoading ? "opacity-50" : ""}`}>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { icon: LuActivity, label: "Sessions", value: stats.totalSessions, color: "text-primary" },
                { icon: LuGauge, label: "Avg WPM", value: stats.averageWpm, color: "text-primary" },
                { icon: LuTarget, label: "Accuracy", value: `${stats.averageAccuracy}%`, color: "text-primary" },
                { icon: LuBomb, label: "Best WPM", value: stats.bestWpm, color: "text-yellow-400" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-xl border border-border/50 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-3.5 w-3.5 ${color} opacity-60`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">{label}</span>
                  </div>
                  <div className={`text-2xl font-black ${color}`}>{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/50 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <LuHistory className="h-3.5 w-3.5 text-primary/60" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Total Words</span>
                </div>
                <div className="text-2xl font-black text-foreground">{stats.totalWordsTyped.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-border/50 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <LuHistory className="h-3.5 w-3.5 text-primary/60" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Time Practiced</span>
                </div>
                <div className="text-2xl font-black text-foreground">
                  {Math.floor(stats.totalTimeMinutes / 60)}h {stats.totalTimeMinutes % 60}m
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Activity ── */}
        <div className="glass rounded-2xl border border-border/80 p-6 md:p-7">
          <div className="flex items-center gap-3 mb-5">
            <LuHistory className="h-5 w-5 text-primary/70" />
            <div>
              <h2 className="text-xl font-black tracking-tight text-foreground/80">Recent Activity</h2>
              <p className="text-[11px] text-foreground/35 mt-0.5">Last {recentActivity.length > 0 ? recentActivity.length : "10"} sessions</p>
            </div>
          </div>

          <div className={`transition-opacity ${statsLoading ? "opacity-50" : ""}`}>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-foreground/30">
                <LuHistory className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm font-black uppercase tracking-wider">No sessions yet</p>
                <p className="text-xs mt-1 text-foreground/25">Complete a typing test to see your history.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm min-w-[460px]">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left pb-3 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/35">Date</th>
                      <th className="text-left pb-3 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/35">Level</th>
                      <th className="text-right pb-3 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/35">WPM</th>
                      <th className="text-right pb-3 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/35">Accuracy</th>
                      <th className="text-right pb-3 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/35">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((item) => {
                      const date = new Date(item.attempted_at);
                      const dateStr = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                      const timeStr = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
                      const durationSec = item.duration_ms ? Math.round(item.duration_ms / 1000) : null;
                      const durationStr = durationSec != null
                        ? durationSec >= 60 ? `${Math.floor(durationSec / 60)}m ${durationSec % 60}s` : `${durationSec}s`
                        : "—";
                      const diff = item.difficulty;
                      return (
                        <tr key={item.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-2">
                            <span className="text-xs text-foreground/70">{dateStr}</span>
                            <span className="ml-2 text-[10px] text-foreground/30">{timeStr}</span>
                          </td>
                          <td className="py-3 px-2">
                            {diff ? (
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                diff === "beginner" ? "bg-green-500/10 text-green-400" :
                                diff === "advanced" ? "bg-yellow-500/10 text-yellow-400" :
                                "bg-red-500/10 text-red-400"
                              }`}>
                                {diff}
                              </span>
                            ) : <span className="text-foreground/20">—</span>}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <span className="font-black text-yellow-400 text-sm">{item.wpm ?? "—"}</span>
                          </td>
                          <td className="py-3 px-2 text-right text-xs text-foreground/70">
                            {item.accuracy != null ? `${item.accuracy}%` : "—"}
                          </td>
                          <td className="py-3 px-2 text-right text-[11px] text-foreground/50">{durationStr}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Account ── */}
        <div className="glass rounded-2xl border border-border/80 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-foreground/60">Account Session</p>
              <p className="text-xs text-foreground/35 mt-0.5">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/8 px-4 py-2 text-xs font-black uppercase tracking-wider text-red-400 hover:bg-red-500/15 transition-all"
            >
              <LuLogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
