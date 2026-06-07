"use client";

import {
  LuActivity,
  LuBell,
  LuCheck,
  LuCog,
  LuKeyboard,
  LuLogOut,
  LuMoon,
  LuMonitor,
  LuPalette,
  LuShield,
  LuStar,
  LuSun,
  LuTrophy,
  LuVolume2,
} from "react-icons/lu";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter } from "next/navigation";
import { useSettings } from "@/contexts/SettingsContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { signOutAction } from "@/app/login/actions";
import { toast } from "sonner";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type SectionId = "appearance" | "typing" | "notifications" | "account";

const NAV: { label: string; icon: React.ComponentType<{ className?: string }>; id: SectionId }[] = [
  { label: "Appearance", icon: LuPalette, id: "appearance" },
  { label: "Typing", icon: LuKeyboard, id: "typing" },
  { label: "Notifications", icon: LuBell, id: "notifications" },
  { label: "Account", icon: LuShield, id: "account" },
];

// ─── Primitives ──────────────────────────────────────────────────────────────

function SectionCard({ id, children }: { id: SectionId; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className="glass rounded-2xl border border-white/10 p-6 md:p-7 scroll-mt-24"
    >
      {children}
    </section>
  );
}

function SectionHead({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-7">
      <div className="shrink-0 p-2 rounded-xl bg-primary/12 text-primary mt-0.5">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h2 className="text-lg font-black tracking-tight text-foreground">{title}</h2>
        <p className="text-sm text-foreground/45 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-3 flex items-baseline gap-2">
      <span className="text-[11px] font-black uppercase tracking-[0.22em] text-foreground/50">
        {children}
      </span>
      {hint && <span className="text-[10px] text-foreground/30">{hint}</span>}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
        active
          ? "bg-primary text-background shadow-[0_0_16px_rgba(11,175,231,0.3)]"
          : "bg-white/5 text-foreground/55 hover:bg-white/8 hover:text-foreground/80 border border-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-pressed={on}
      className={`relative shrink-0 h-6 w-11 rounded-full transition-colors duration-200 ${
        on ? "bg-primary shadow-[0_0_10px_rgba(11,175,231,0.35)]" : "bg-white/15"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200 ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  on,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  on: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`p-2 rounded-lg shrink-0 transition-colors ${
            on ? "bg-primary/15 text-primary" : "bg-white/5 text-foreground/35"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground/90">{label}</div>
          <div className="text-xs text-foreground/40 mt-0.5">{description}</div>
        </div>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const [active, setActive] = useState<SectionId>("appearance");

  useEffect(() => {
    if (!user) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id as SectionId);
        });
      },
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 }
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [user]);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    await signOutAction();
    toast.success("Signed out");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }
  if (!user) return null;

  const initial = ((user.display_name ?? user.email ?? "?")[0] ?? "?").toUpperCase();

  return (
    <section className="relative flex-1 bg-background px-4 py-8 md:px-8 md:py-10 overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="pointer-events-none absolute left-1/3 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-[180px]" />

      <div className="relative mx-auto max-w-6xl animate-fade-in">
        {/* ── Page header ── */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LuCog className="h-5 w-5 text-primary" />
              <h1 className="text-3xl font-black tracking-tighter md:text-4xl">Settings</h1>
            </div>
            <p className="text-sm text-foreground/45">Customize your FishTyping experience</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 glass rounded-xl border border-white/10 shrink-0">
            <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
            <span className="text-xs text-foreground/50 font-bold max-w-[180px] truncate">{user.email}</span>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          {/* ── Sticky sidebar ── */}
          <aside className="sticky top-24 w-48 shrink-0 hidden lg:block">
            <nav className="glass rounded-2xl border border-white/10 p-2 space-y-0.5">
              {NAV.map(({ label, icon: Icon, id }) => {
                const isActive = active === id;
                return (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-[11px] font-black uppercase tracking-[0.18em] transition-all ${
                      isActive
                        ? "bg-primary/12 text-primary"
                        : "text-foreground/50 hover:bg-white/5 hover:text-foreground/80"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ── Scrollable content ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* ── APPEARANCE ── */}
            <SectionCard id="appearance">
              <SectionHead icon={LuPalette} title="Appearance" description="Customize the look and feel" />

              {/* Theme picker */}
              <div className="mb-7">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      { value: "dark", label: "Dark", Icon: LuMoon },
                      { value: "light", label: "Light", Icon: LuSun },
                      { value: "system", label: "System", Icon: LuMonitor },
                    ] as const
                  ).map(({ value, label, Icon }) => {
                    const isActive = settings.theme === value;
                    return (
                      <button
                        key={value}
                        onClick={() => {
                          updateSettings({ theme: value });
                          toast.success(`Theme: ${label}`);
                        }}
                        className={`relative rounded-xl border p-3 text-left transition-all ${
                          isActive
                            ? "border-primary/50 bg-primary/8 shadow-[0_0_24px_rgba(11,175,231,0.12)]"
                            : "border-white/8 bg-white/2 hover:border-white/18 hover:bg-white/4"
                        }`}
                      >
                        {/* Mini browser preview */}
                        <div
                          className={`h-16 rounded-lg mb-3 overflow-hidden ${
                            value === "system"
                              ? ""
                              : value === "dark"
                              ? "bg-[#111]"
                              : "bg-[#efefef]"
                          }`}
                          style={
                            value === "system"
                              ? { background: "linear-gradient(135deg, #111 50%, #efefef 50%)" }
                              : {}
                          }
                        >
                          <div className="p-2 h-full flex flex-col justify-between">
                            <div className="space-y-1">
                              <div
                                className={`h-1.5 w-12 rounded-full ${
                                  value === "light" ? "bg-black/20" : "bg-white/25"
                                }`}
                              />
                              <div
                                className={`h-1 w-8 rounded-full ${
                                  value === "light" ? "bg-black/10" : "bg-white/10"
                                }`}
                              />
                            </div>
                            <div className="flex gap-1">
                              <div className="h-2 w-8 rounded-sm bg-primary/70" />
                              <div
                                className={`h-2 w-5 rounded-sm ${
                                  value === "light" ? "bg-black/10" : "bg-white/10"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Icon
                              className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "text-foreground/50"}`}
                            />
                            <span
                              className={`text-xs font-black uppercase tracking-wider ${
                                isActive ? "text-primary" : "text-foreground/60"
                              }`}
                            >
                              {label}
                            </span>
                          </div>
                          {isActive && (
                            <div className="bg-primary/20 rounded-full p-0.5">
                              <LuCheck className="h-3 w-3 text-primary" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font family */}
              <div>
                <Label>Typing Font</Label>
                <div className="space-y-2">
                  {(
                    [
                      { value: "jetbrains", name: "JetBrains Mono", css: "var(--font-geist-mono)" },
                      { value: "crimson", name: "Crimson Text", css: "var(--font-crimson-text)" },
                      { value: "garamond", name: "EB Garamond", css: "var(--font-eb-garamond)" },
                    ] as const
                  ).map(({ value, name, css }) => {
                    const isActive = settings.fontFamily === value;
                    return (
                      <button
                        key={value}
                        onClick={() => {
                          updateSettings({ fontFamily: value });
                          toast.success("Font updated");
                        }}
                        className={`w-full flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                          isActive
                            ? "border-primary/50 bg-primary/8"
                            : "border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/3"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-1.5">
                            {name}
                          </div>
                          <div
                            className="text-xl text-foreground/80 truncate"
                            style={{ fontFamily: css }}
                          >
                            The quick brown fox
                          </div>
                        </div>
                        {isActive && (
                          <div className="ml-3 shrink-0 bg-primary/20 rounded-full p-1">
                            <LuCheck className="h-3.5 w-3.5 text-primary" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </SectionCard>

            {/* ── TYPING ── */}
            <SectionCard id="typing">
              <SectionHead
                icon={LuKeyboard}
                title="Typing Preferences"
                description="Set your default test configuration"
              />

              <div className="space-y-6">
                {/* Language */}
                <div>
                  <Label>Default Language</Label>
                  <div className="flex flex-wrap gap-2">
                    {(["english", "lao"] as const).map((v) => (
                      <Pill
                        key={v}
                        active={settings.defaultLanguage === v}
                        onClick={() => {
                          updateSettings({ defaultLanguage: v });
                          toast.success(`Language: ${v}`);
                        }}
                      >
                        {v}
                      </Pill>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <Label>Default Difficulty</Label>
                  <div className="flex flex-wrap gap-2">
                    {(["beginner", "advanced", "expert"] as const).map((v) => (
                      <Pill
                        key={v}
                        active={settings.defaultDifficulty === v}
                        onClick={() => {
                          updateSettings({ defaultDifficulty: v });
                          toast.success(`Difficulty: ${v}`);
                        }}
                      >
                        {v}
                      </Pill>
                    ))}
                  </div>
                </div>

                {/* Length */}
                <div>
                  <Label>Passage Length</Label>
                  <div className="flex flex-wrap gap-2">
                    {(["short", "medium", "long"] as const).map((v) => (
                      <Pill
                        key={v}
                        active={settings.defaultLength === v}
                        onClick={() => {
                          updateSettings({ defaultLength: v });
                          toast.success(`Length: ${v}`);
                        }}
                      >
                        {v}
                      </Pill>
                    ))}
                  </div>
                </div>

                {/* Font size */}
                <div>
                  <Label>Typing Font Size</Label>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { v: "small", label: "Small" },
                        { v: "medium", label: "Medium" },
                        { v: "large", label: "Large" },
                      ] as const
                    ).map(({ v, label }) => (
                      <Pill
                        key={v}
                        active={settings.fontSize === v}
                        onClick={() => {
                          updateSettings({ fontSize: v });
                          toast.success(`Font size: ${v}`);
                        }}
                      >
                        {label}
                      </Pill>
                    ))}
                  </div>
                </div>

                {/* Behavior toggles */}
                <div>
                  <Label>Behavior</Label>
                  <div className="rounded-xl border border-white/8 bg-white/2 px-4 divide-y divide-white/5">
                    <ToggleRow
                      icon={LuVolume2}
                      label="Sound Effects"
                      description="Play key sounds while typing"
                      on={settings.soundEffects}
                      onChange={() => {
                        updateSettings({ soundEffects: !settings.soundEffects });
                        toast.success(`Sound ${!settings.soundEffects ? "on" : "off"}`);
                      }}
                    />
                    <ToggleRow
                      icon={LuActivity}
                      label="Live WPM"
                      description="Show words-per-minute while typing"
                      on={settings.showLiveWpm}
                      onChange={() => {
                        updateSettings({ showLiveWpm: !settings.showLiveWpm });
                        toast.success(`Live WPM ${!settings.showLiveWpm ? "on" : "off"}`);
                      }}
                    />
                    <ToggleRow
                      icon={LuCog}
                      label="Smooth Caret"
                      description="Animate the typing cursor movement"
                      on={settings.smoothCaret}
                      onChange={() => {
                        updateSettings({ smoothCaret: !settings.smoothCaret });
                        toast.success(`Smooth caret ${!settings.smoothCaret ? "on" : "off"}`);
                      }}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── NOTIFICATIONS ── */}
            <SectionCard id="notifications">
              <SectionHead
                icon={LuBell}
                title="Notifications"
                description="Choose what to be notified about"
              />
              <div className="rounded-xl border border-white/8 bg-white/2 px-4 divide-y divide-white/5">
                <ToggleRow
                  icon={LuTrophy}
                  label="Achievement Alerts"
                  description="Get notified when you unlock achievements"
                  on={settings.achievementAlerts}
                  onChange={() => {
                    updateSettings({ achievementAlerts: !settings.achievementAlerts });
                    toast.success(`Achievement alerts ${!settings.achievementAlerts ? "on" : "off"}`);
                  }}
                />
                <ToggleRow
                  icon={LuStar}
                  label="Personal Best Alerts"
                  description="Get notified when you beat your record"
                  on={settings.personalBestAlerts}
                  onChange={() => {
                    updateSettings({ personalBestAlerts: !settings.personalBestAlerts });
                    toast.success(`PB alerts ${!settings.personalBestAlerts ? "on" : "off"}`);
                  }}
                />
              </div>
            </SectionCard>

            {/* ── ACCOUNT ── */}
            <SectionCard id="account">
              <SectionHead
                icon={LuShield}
                title="Account"
                description="Manage your session and account"
              />

              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/3 border border-white/8">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-primary">{initial}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-foreground/90 truncate">
                      {user.display_name ?? "—"}
                    </div>
                    <div className="text-xs text-foreground/50 truncate">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/40 bg-red-500/8 text-red-400 text-xs font-black uppercase tracking-[0.18em] transition-all hover:bg-red-500/15 hover:border-red-500/60"
                >
                  <LuLogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </SectionCard>

          </div>
        </div>
      </div>
    </section>
  );
}
