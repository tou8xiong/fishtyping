import {
  LuBell,
  LuCircleUserRound,
  LuCog,
  LuPalette,
  LuShield,
  LuUserRound,
} from "react-icons/lu";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import type { User } from "@/lib/supabase/types";

const sidebarItems = [
  { label: "Appearance", icon: LuPalette, active: true },
  { label: "Typing Prefs", icon: LuCircleUserRound, active: false },
  { label: "Notifications", icon: LuBell, active: false },
  { label: "Account", icon: LuShield, active: false },
];

interface SettingsUser extends User {
  email?: string;
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let user: SettingsUser | null = null;

  if (authUser) {
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    user = {
      ...(profile as User | null),
      id: authUser.id,
      username: profile?.username ?? authUser.user_metadata?.username ?? authUser.email?.split("@")[0] ?? null,
      display_name: profile?.display_name ?? authUser.user_metadata?.full_name ?? authUser.user_metadata?.username ?? authUser.email?.split("@")[0] ?? null,
      avatar_url: profile?.avatar_url ?? (typeof authUser.user_metadata?.avatar_url === "string" ? authUser.user_metadata.avatar_url : null),
      preferred_language: profile?.preferred_language ?? "english",
      created_at: profile?.created_at ?? new Date().toISOString(),
      updated_at: profile?.updated_at ?? new Date().toISOString(),
      email: authUser.email ?? undefined,
    };
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
                  className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-[0.22em] transition-all ${
                    item.active
                      ? "border-primary/40 bg-primary/20 text-primary shadow-[0_0_18px_rgba(11,175,231,0.18)]"
                      : "border-transparent text-foreground/75 hover:border-border hover:bg-white/[0.03] hover:text-foreground"
                  }`}
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

          <section className="glass rounded-xl border border-border/80 px-5 py-7 md:px-7">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <LuPalette className="h-5 w-5 text-primary/80" />
                <h2 className="text-2xl font-black tracking-tight text-foreground/65">Appearance</h2>
              </div>
              <p className="text-base text-foreground/40">Customize the look and feel.</p>
            </div>

            <div className="mt-5 h-px w-full bg-border/80" />
          </section>

          <section className="glass rounded-xl border border-border/80 px-5 py-7 md:px-7">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <LuCircleUserRound className="h-5 w-5 text-primary/80" />
                <h2 className="text-2xl font-black tracking-tight text-foreground/65">Typing Preferences</h2>
              </div>
              <p className="text-base text-foreground/40">Set your default typing settings.</p>
            </div>

            <div className="mt-5 h-px w-full bg-border/80" />
          </section>

          <section className="glass rounded-xl border border-border/80 px-5 py-7 md:px-7">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <LuBell className="h-5 w-5 text-primary/80" />
                <h2 className="text-2xl font-black tracking-tight text-foreground/65">Notifications</h2>
              </div>
              <p className="text-base text-foreground/40">Manage alerts and updates.</p>
            </div>

            <div className="mt-5 h-px w-full bg-border/80" />
          </section>

          {user && (
            <section className="glass rounded-xl border border-border/80 px-5 py-7 md:px-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-foreground/75">Account Session</h2>
                  <p className="mt-1 text-base text-foreground/45">Sign out of your current FishTyping session.</p>
                </div>

                <form action={signOut}>
                  <button className="inline-flex items-center justify-center gap-2 rounded-md border border-primary/45 bg-primary/10 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-primary transition-all hover:border-primary hover:bg-primary/15">
                    Log Out
                  </button>
                </form>
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}