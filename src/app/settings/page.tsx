"use client";

import {
  LuBell,
  LuCircleUserRound,
  LuCog,
  LuLogOut,
  LuMoon,
  LuPalette,
  LuShield,
  LuSun,
  LuMonitor,
} from "react-icons/lu";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useSettings } from "@/contexts/SettingsContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { signOutAction } from "@/app/login/actions";
import { toast } from "sonner";
import { useEffect } from "react";

const sidebarItems = [
  { label: "Appearance", icon: LuPalette, id: "appearance" },
  { label: "Typing Prefs", icon: LuCircleUserRound, id: "typing" },
  { label: "Notifications", icon: LuBell, id: "notifications" },
];

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { settings, updateSettings } = useSettings();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/settings");
    }
  }, [loading, user, router]);

  const handleSignOut = async () => {
    await signOut(auth);
    await signOutAction();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  const handleThemeChange = (theme: "dark" | "light" | "system") => {
    updateSettings({ theme });
    toast.success(`Theme changed to ${theme}`);
  };

  const handleFontFamilyChange = (fontFamily: "jetbrains" | "crimson" | "garamond") => {
    updateSettings({ fontFamily });
    toast.success("Font family updated");
  };

  const handleFontSizeChange = (fontSize: "small" | "medium" | "large") => {
    updateSettings({ fontSize });
    toast.success("Font size updated");
  };

  const handleLanguageChange = (language: "english" | "lao") => {
    updateSettings({ defaultLanguage: language });
    toast.success(`Default language set to ${language}`);
  };

  const handleDifficultyChange = (difficulty: "beginner" | "advanced" | "expert") => {
    updateSettings({ defaultDifficulty: difficulty });
    toast.success(`Default difficulty set to ${difficulty}`);
  };

  const toggleSetting = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
    toast.success(`${key} ${!settings[key] ? "enabled" : "disabled"}`);
  };

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

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 animate-fade-in lg:flex-row lg:items-start">
        <aside className="glass w-full rounded-xl border border-border/80 p-4 lg:sticky lg:top-24 lg:w-44 lg:shrink-0">
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-[0.22em] text-foreground/75 transition-all hover:border-border hover:bg-white/[0.03] hover:text-foreground"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <section className="glass rounded-xl border border-border/80 px-5 py-6 md:px-7 md:py-7">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <LuCog className="h-5 w-5 text-primary" />
                <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
                  Settings
                </h1>
              </div>
              <p className="text-base text-foreground/65">Configure your typing experience.</p>
            </div>

            <div className="mt-5 h-px w-full bg-border/80" />
          </section>

          {/* Appearance Section */}
          <section className="glass rounded-xl border border-border/80 px-5 py-7 md:px-7">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <LuPalette className="h-5 w-5 text-primary/80" />
                <h2 className="text-2xl font-black tracking-tight text-foreground/65">Appearance</h2>
              </div>
              <p className="text-base text-foreground/40">Customize the look and feel.</p>
            </div>

            <div className="mt-5 h-px w-full bg-border/80" />

            <div className="mt-5 space-y-6">
              {/* Theme */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.24em] text-foreground/55 mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                      settings.theme === "dark"
                        ? "border-primary/60 bg-primary/10 shadow-[0_0_20px_rgba(11,175,231,0.18)]"
                        : "border-border/60 bg-white/[0.02] hover:border-primary/40"
                    }`}
                  >
                    <LuMoon className="h-5 w-5 text-foreground/80" />
                    <span className="text-xs font-black uppercase tracking-wider text-foreground/80">Dark</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                      settings.theme === "light"
                        ? "border-primary/60 bg-primary/10 shadow-[0_0_20px_rgba(11,175,231,0.18)]"
                        : "border-border/60 bg-white/[0.02] hover:border-primary/40"
                    }`}
                  >
                    <LuSun className="h-5 w-5 text-foreground/80" />
                    <span className="text-xs font-black uppercase tracking-wider text-foreground/80">Light</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange("system")}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                      settings.theme === "system"
                        ? "border-primary/60 bg-primary/10 shadow-[0_0_20px_rgba(11,175,231,0.18)]"
                        : "border-border/60 bg-white/[0.02] hover:border-primary/40"
                    }`}
                  >
                    <LuMonitor className="h-5 w-5 text-foreground/80" />
                    <span className="text-xs font-black uppercase tracking-wider text-foreground/80">System</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Typing Preferences Section */}
          <section className="glass rounded-xl border border-border/80 px-5 py-7 md:px-7">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <LuCircleUserRound className="h-5 w-5 text-primary/80" />
                <h2 className="text-2xl font-black tracking-tight text-foreground/65">Typing Preferences</h2>
              </div>
              <p className="text-base text-foreground/40">Configure your typing test experience.</p>
            </div>

            <div className="mt-5 h-px w-full bg-border/80" />

            <div className="mt-5 space-y-6">
              {/* Default Language */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.24em] text-foreground/55 mb-3">
                  Default Language
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["english", "lao"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`rounded-lg border p-4 text-xs font-black uppercase tracking-wider transition-all ${
                        settings.defaultLanguage === lang
                          ? "border-primary/60 bg-primary/10 text-foreground shadow-[0_0_20px_rgba(11,175,231,0.18)]"
                          : "border-border/60 bg-white/[0.02] text-foreground/70 hover:border-primary/40"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Difficulty */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.24em] text-foreground/55 mb-3">
                  Default Difficulty
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["beginner", "advanced", "expert"] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => handleDifficultyChange(diff)}
                      className={`rounded-lg border p-4 text-xs font-black uppercase tracking-wider transition-all ${
                        settings.defaultDifficulty === diff
                          ? "border-primary/60 bg-primary/10 text-foreground shadow-[0_0_20px_rgba(11,175,231,0.18)]"
                          : "border-border/60 bg-white/[0.02] text-foreground/70 hover:border-primary/40"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family - Moved from Appearance */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.24em] text-foreground/55 mb-3">
                  Typing Font Family
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleFontFamilyChange("jetbrains")}
                    className={`rounded-lg border p-4 text-sm font-medium transition-all ${
                      settings.fontFamily === "jetbrains"
                        ? "border-primary/60 bg-primary/10 text-foreground shadow-[0_0_20px_rgba(11,175,231,0.18)]"
                        : "border-border/60 bg-white/[0.02] text-foreground/70 hover:border-primary/40"
                    }`}
                    style={{ fontFamily: "var(--font-geist-mono)" }}
                  >
                    JetBrains Mono
                  </button>
                  <button
                    onClick={() => handleFontFamilyChange("crimson")}
                    className={`rounded-lg border p-4 text-sm font-medium transition-all ${
                      settings.fontFamily === "crimson"
                        ? "border-primary/60 bg-primary/10 text-foreground shadow-[0_0_20px_rgba(11,175,231,0.18)]"
                        : "border-border/60 bg-white/[0.02] text-foreground/70 hover:border-primary/40"
                    }`}
                    style={{ fontFamily: "var(--font-crimson-text)" }}
                  >
                    Crimson Text
                  </button>
                  <button
                    onClick={() => handleFontFamilyChange("garamond")}
                    className={`rounded-lg border p-4 text-sm font-medium transition-all ${
                      settings.fontFamily === "garamond"
                        ? "border-primary/60 bg-primary/10 text-foreground shadow-[0_0_20px_rgba(11,175,231,0.18)]"
                        : "border-border/60 bg-white/[0.02] text-foreground/70 hover:border-primary/40"
                    }`}
                    style={{ fontFamily: "var(--font-eb-garamond)" }}
                  >
                    EB Garamond
                  </button>
                </div>
              </div>

              {/* Font Size - Moved from Appearance */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.24em] text-foreground/55 mb-3">
                  Typing Font Size
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["small", "medium", "large"] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleFontSizeChange(size)}
                      className={`rounded-lg border p-4 text-xs font-black uppercase tracking-wider transition-all ${
                        settings.fontSize === size
                          ? "border-primary/60 bg-primary/10 text-foreground shadow-[0_0_20px_rgba(11,175,231,0.18)]"
                          : "border-border/60 bg-white/[0.02] text-foreground/70 hover:border-primary/40"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Settings */}
              <div className="space-y-3">
                {[
                  { key: "soundEffects" as const, label: "Sound Effects", description: "Play sounds during typing" },
                  { key: "showLiveWpm" as const, label: "Show Live WPM", description: "Display WPM while typing" },
                  { key: "smoothCaret" as const, label: "Smooth Caret", description: "Smooth caret animation" },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between rounded-lg border border-border/60 bg-white/[0.02] p-4">
                    <div>
                      <span className="text-sm font-medium text-foreground/80">{setting.label}</span>
                      <p className="text-xs text-foreground/50 mt-0.5">{setting.description}</p>
                    </div>
                    <button
                      onClick={() => toggleSetting(setting.key)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        settings[setting.key] ? "bg-primary" : "bg-foreground/20"
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                          settings[setting.key] ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="glass rounded-xl border border-border/80 px-5 py-7 md:px-7">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <LuBell className="h-5 w-5 text-primary/80" />
                <h2 className="text-2xl font-black tracking-tight text-foreground/65">Notifications</h2>
              </div>
              <p className="text-base text-foreground/40">Manage alerts and updates.</p>
            </div>

            <div className="mt-5 h-px w-full bg-border/80" />

            <div className="mt-5 space-y-3">
              {[
                { key: "achievementAlerts" as const, label: "Achievement Alerts" },
                { key: "personalBestAlerts" as const, label: "Personal Best Alerts" },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between rounded-lg border border-border/60 bg-white/[0.02] p-4">
                  <span className="text-sm font-medium text-foreground/80">{setting.label}</span>
                  <button
                    onClick={() => toggleSetting(setting.key)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      settings[setting.key] ? "bg-primary" : "bg-foreground/20"
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                        settings[setting.key] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Sign Out Section */}
          <section className="glass rounded-xl border border-border/80 px-5 py-7 md:px-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-foreground/75">Account Session</h2>
                <p className="mt-1 text-base text-foreground/45">Sign out of your current FishTyping session.</p>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-md border border-red-500/60 bg-red-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-red-500 transition-all hover:bg-red-500/20"
              >
                <LuLogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
