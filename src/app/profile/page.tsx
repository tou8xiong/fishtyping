"use client";

import { LuActivity, LuBomb, LuGauge, LuHistory, LuLogOut, LuRotateCcw, LuSave, LuTarget, LuTrophy, LuUpload, LuUserRound } from "react-icons/lu";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { signOutAction } from "@/app/login/actions";
import { toast } from "sonner";

interface UserStats {
  totalSessions: number;
  totalWordsTyped: number;
  averageWpm: number;
  averageAccuracy: number;
  bestWpm: number;
  totalTimeMinutes: number;
}

const defaultStats: UserStats = {
  totalSessions: 0,
  totalWordsTyped: 0,
  averageWpm: 0,
  averageAccuracy: 0,
  bestWpm: 0,
  totalTimeMinutes: 0,
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatars = Array.from({ length: 9 }, (_, i) => `/avaatart-icon/av${i + 1}.png`);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/profile");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "");
      setUsername(user.username || "");
      setSelectedAvatar(user.avatar_url || "");

      // Fetch user stats
      console.log("Fetching stats for user ID:", user.id);
      fetch(`/api/user-stats?userId=${user.id}`)
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
          }
        })
        .catch((err) => console.error("Error fetching stats:", err));
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          username,
          displayName,
          avatarUrl: selectedAvatar,
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error("Failed to update profile");
      } else {
        toast.success("Profile updated successfully");
        setEditing(false);
        setShowAvatarPicker(false);
        // Refresh the page to get updated user data
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    await signOutAction();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setUploadedImage(base64String);
      setSelectedAvatar(base64String);
      toast.success("Image uploaded successfully");
    };
    reader.readAsDataURL(file);
  };

  const initials = (user?.display_name || user?.username || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  if (loading) {
    return (
      <section className="relative flex-1 overflow-hidden bg-background px-4 py-8 md:px-8 md:py-10">
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      </section>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <section className="relative flex-1 overflow-hidden bg-background px-4 py-8 md:px-8 md:py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/30" />
      <div className="pointer-events-none absolute left-20 top-32 h-56 w-56 rounded-full bg-primary/8 blur-[150px]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 animate-fade-in">
        <section className="glass rounded-xl border border-border/80 px-5 py-6 md:px-7 md:py-7">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <LuUserRound className="h-5 w-5 text-primary" />
              <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
                Diver Profile
              </h1>
            </div>
            <p className="text-base text-foreground/65">Your typing journey at a glance.</p>
          </div>

          <div className="mt-5 h-px w-full bg-border/80" />

          <div className="mt-5 flex flex-col gap-5">
            {/* Avatar Section - Always Visible */}
            <div className="glass rounded-lg border border-primary/40 p-5">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground/70 mb-4">Profile Avatar</h3>

              <div className="flex flex-col md:flex-row gap-5 items-start">
                {/* Current Avatar Display */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-32 w-32 items-center justify-center rounded-xl border-2 border-primary/60 bg-primary/10 shadow-[0_0_20px_rgba(11,175,231,0.18)] overflow-hidden">
                    {selectedAvatar || user?.avatar_url ? (
                      <img
                        src={selectedAvatar || user?.avatar_url || ""}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_30%,rgba(11,175,231,0.45),rgba(11,175,231,0.1)_45%,rgba(18,18,18,0.9)_85%)] text-5xl font-black text-foreground">
                        {initials}
                      </div>
                    )}
                  </div>

                  {editing && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 rounded-md border border-primary/60 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-primary transition-colors hover:bg-primary/20"
                      >
                        <LuUpload className="h-4 w-4" />
                        Upload
                      </button>
                      <button
                        onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                        className="flex items-center gap-2 rounded-md border border-border bg-white/[0.03] px-4 py-2 text-xs font-black uppercase tracking-wider text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        {showAvatarPicker ? "Hide" : "Choose"}
                      </button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Avatar Picker Grid */}
                {showAvatarPicker && editing && (
                  <div className="flex-1">
                    <p className="text-xs font-black uppercase tracking-wider text-foreground/60 mb-3">Select from presets</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {avatars.map((avatar) => (
                        <button
                          key={avatar}
                          onClick={() => {
                            setSelectedAvatar(avatar);
                            setUploadedImage(null);
                          }}
                          className={`relative h-20 w-20 rounded-lg border-2 overflow-hidden transition-all hover:scale-105 ${
                            selectedAvatar === avatar
                              ? "border-primary shadow-[0_0_20px_rgba(11,175,231,0.4)]"
                              : "border-border/60 hover:border-primary/60"
                          }`}
                        >
                          <img src={avatar} alt="Avatar option" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="flex flex-col md:flex-row gap-5">
              <div className="flex-1 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-[0.24em] text-foreground/55">
                  Callsign
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-md border border-primary/60 bg-white/[0.03] px-4 py-3 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] focus:border-primary/60 focus:outline-none"
                  />
                ) : (
                  <div className="rounded-md border border-border bg-white/[0.03] px-4 py-3 text-base text-foreground/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                    {user?.display_name || user?.username || "Not set"}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-[0.24em] text-foreground/55">
                  Comms Link
                </label>
                <div className="rounded-md border border-border bg-white/[0.03] px-4 py-3 text-base text-foreground/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                  {user?.email || "Not available"}
                </div>
              </div>

              <div className="flex gap-2">
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 rounded-md border border-primary/60 bg-primary/10 px-4 py-2 text-sm font-black text-primary transition-colors hover:bg-primary/20"
                    >
                      <LuSave className="h-4 w-4" />
                      SAVE
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setShowAvatarPicker(false);
                        setSelectedAvatar(user?.avatar_url || "");
                        setUploadedImage(null);
                      }}
                      className="flex items-center gap-2 rounded-md border border-border bg-white/[0.03] px-4 py-2 text-sm font-black text-foreground/80 transition-colors hover:border-red-500/40 hover:text-red-500"
                    >
                      CANCEL
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 rounded-md border border-border bg-white/[0.03] px-4 py-2 text-sm font-black text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <LuRotateCcw className="h-4 w-4" />
                    EDIT PROFILE
                  </button>
                )}
              </div>
            </div>
            </div>
          </div>
        </section>

        <section className="glass rounded-xl border border-border/80 px-5 py-6 md:px-7 md:py-7">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <LuTrophy className="h-5 w-5 text-primary/80" />
              <h2 className="text-2xl font-black tracking-tight text-foreground/65">Statistics</h2>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border/60 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-primary/60">
                <LuActivity className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-wider">Sessions</span>
              </div>
              <div className="mt-2 text-3xl font-black text-foreground">{stats.totalSessions}</div>
            </div>

            <div className="rounded-lg border border-border/60 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-primary/60">
                <LuGauge className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-wider">Avg WPM</span>
              </div>
              <div className="mt-2 text-3xl font-black text-foreground">{stats.averageWpm}</div>
            </div>

            <div className="rounded-lg border border-border/60 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-primary/60">
                <LuTarget className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-wider">Accuracy</span>
              </div>
              <div className="mt-2 text-3xl font-black text-foreground">{stats.averageAccuracy}%</div>
            </div>

            <div className="rounded-lg border border-border/60 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-primary/60">
                <LuBomb className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-wider">Best WPM</span>
              </div>
              <div className="mt-2 text-3xl font-black text-foreground">{stats.bestWpm}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-primary/60">
                <LuHistory className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-wider">Total Words</span>
              </div>
              <div className="mt-2 text-2xl font-black text-foreground">{stats.totalWordsTyped.toLocaleString()}</div>
            </div>

            <div className="rounded-lg border border-border/60 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-primary/60">
                <LuHistory className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-wider">Time Practiced</span>
              </div>
              <div className="mt-2 text-2xl font-black text-foreground">{Math.floor(stats.totalTimeMinutes / 60)}h {stats.totalTimeMinutes % 60}m</div>
            </div>
          </div>
        </section>

        <section className="glass rounded-xl border border-border/80 px-5 py-7 md:px-7">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <LuHistory className="h-5 w-5 text-primary/80" />
              <h2 className="text-2xl font-black tracking-tight text-foreground/65">Recent Activity</h2>
            </div>
            <p className="text-base text-foreground/40">No recent sessions. Start typing to see your history!</p>
          </div>

          <div className="mt-5 h-px w-full bg-border/80" />

          <div className="mt-5">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-md border border-red-500/60 bg-red-500/10 px-4 py-2 text-sm font-black text-red-500 transition-colors hover:bg-red-500/20"
            >
              <LuLogOut className="h-4 w-4" />
              SIGN OUT
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}