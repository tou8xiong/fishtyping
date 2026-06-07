import Link from "next/link";
import { notFound } from "next/navigation";

interface RankData {
  rank: number;
  totalPlayers: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  passageLanguage: string;
  wpm: number;
  accuracy: number;
  date: string;
}

function getSpeedTier(wpm: number) {
  if (wpm >= 130) return { label: "Legend", color: "text-purple-300", glow: "rgba(168,85,247,0.4)", border: "border-purple-400/40", bg: "bg-purple-500/10" };
  if (wpm >= 100) return { label: "Elite", color: "text-[#0BAFE7]", glow: "rgba(11,175,231,0.4)", border: "border-[#0BAFE7]/40", bg: "bg-[#0BAFE7]/10" };
  if (wpm >= 70)  return { label: "Pro", color: "text-green-400", glow: "rgba(74,222,128,0.4)", border: "border-green-400/40", bg: "bg-green-500/10" };
  if (wpm >= 45)  return { label: "Average", color: "text-yellow-400", glow: "rgba(250,204,21,0.4)", border: "border-yellow-400/40", bg: "bg-yellow-500/10" };
  return { label: "Rising", color: "text-white/50", glow: "rgba(255,255,255,0.1)", border: "border-white/20", bg: "bg-white/5" };
}

function getRankSuffix(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

async function fetchRankData(userId: string, lang: string): Promise<RankData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/rank/${userId}?lang=${lang}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function RankSharePage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { userId } = await params;
  const { lang = "english" } = await searchParams;

  const data = await fetchRankData(userId, lang);
  if (!data) notFound();

  const tier = getSpeedTier(data.wpm);
  const suffix = getRankSuffix(data.rank);
  const initials = (data.displayName || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const formattedDate = new Date(data.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-background px-4 py-16">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,175,231,0.07),transparent_55%)]" />
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full blur-[180px]" style={{ background: `${tier.glow.replace("0.4", "0.04")}` }} />

      <div className="relative w-full max-w-md animate-fade-in">

        {/* Back link */}
        <Link href="/leaderboard" className="mb-6 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-primary/70 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Leaderboard
        </Link>

        {/* Main card */}
        <div
          className="relative overflow-hidden rounded-3xl border bg-[#0a0a0f] p-8"
          style={{ borderColor: tier.glow.replace("0.4", "0.2"), boxShadow: `0 0 80px ${tier.glow.replace("0.4", "0.08")}, 0 0 0 1px ${tier.glow.replace("0.4", "0.05")}, inset 0 1px 0 rgba(255,255,255,0.04)` }}
        >
          {/* Subtle inner glow arc */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${tier.glow.replace("0.4", "0.6")}, transparent)` }} />

          {/* Header row */}
          <div className="mb-8 flex items-center justify-between">
            {/* FishTyping brand */}
            <div className="flex items-center gap-2">
              <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12.5L9 1V12.5H1ZM4.825 10.5H7V7.375L4.825 10.5ZM10.5 12.5C10.7 12.0333 10.9167 11.2167 11.15 10.05C11.3833 8.88333 11.5 7.7 11.5 6.5C11.5 5.3 11.3875 4.06667 11.1625 2.8C10.9375 1.53333 10.7167 0.6 10.5 0C11.5167 0.3 12.5292 0.858333 13.5375 1.675C14.5458 2.49167 15.4542 3.46667 16.2625 4.6C17.0708 5.73333 17.7292 6.97917 18.2375 8.3375C18.7458 9.69583 19 11.0833 19 12.5H10.5ZM13.1 10.5H16.8C16.5167 9.21667 16.0542 8.04167 15.4125 6.975C14.7708 5.90833 14.0917 5 13.375 4.25C13.4083 4.6 13.4375 4.9625 13.4625 5.3375C13.4875 5.7125 13.5 6.1 13.5 6.5C13.5 7.28333 13.4625 8.00833 13.3875 8.675C13.3125 9.34167 13.2167 9.95 13.1 10.5ZM7 18C6.4 18 5.84167 17.8583 5.325 17.575C4.80833 17.2917 4.36667 16.9333 4 16.5C3.76667 16.75 3.5125 16.9833 3.2375 17.2C2.9625 17.4167 2.65833 17.5917 2.325 17.725C1.74167 17.2917 1.24583 16.7542 0.8375 16.1125C0.429167 15.4708 0.15 14.7667 0 14H20C19.85 14.7667 19.5708 15.4708 19.1625 16.1125C18.7542 16.7542 18.2583 17.2917 17.675 17.725C17.3417 17.5917 17.0375 17.4167 16.7625 17.2C16.4875 16.9833 16.2333 16.75 16 16.5C15.6167 16.9333 15.1708 17.2917 14.6625 17.575C14.1542 17.8583 13.6 18 13 18C12.4 18 11.8417 17.8583 11.325 17.575C10.8083 17.2917 10.3667 16.9333 10 16.5C9.63333 16.9333 9.19167 17.2917 8.675 17.575C8.15833 17.8583 7.6 18 7 18ZM0 22V20H1C1.53333 20 2.05417 19.9167 2.5625 19.75C3.07083 19.5833 3.55 19.3333 4 19C4.45 19.3333 4.92917 19.5792 5.4375 19.7375C5.94583 19.8958 6.46667 19.975 7 19.975C7.53333 19.975 8.05 19.8958 8.55 19.7375C9.05 19.5792 9.53333 19.3333 10 19C10.45 19.3333 10.9292 19.5792 11.4375 19.7375C11.9458 19.8958 12.4667 19.975 13 19.975C13.5333 19.975 14.05 19.8958 14.55 19.7375C15.05 19.5792 15.5333 19.3333 16 19C16.4667 19.3333 16.95 19.5833 17.45 19.75C17.95 19.9167 18.4667 20 19 20H20V22H19C18.4833 22 17.975 21.9375 17.475 21.8125C16.975 21.6875 16.4833 21.5 16 21.25C15.5167 21.5 15.025 21.6875 14.525 21.8125C14.025 21.9375 13.5167 22 13 22C12.4833 22 11.975 21.9375 11.475 21.8125C10.975 21.6875 10.4833 21.5 10 21.25C9.51667 21.5 9.025 21.6875 8.525 21.8125C8.025 21.9375 7.51667 22 7 22C6.48333 22 5.975 21.9375 5.475 21.8125C4.975 21.6875 4.48333 21.5 4 21.25C3.51667 21.5 3.025 21.6875 2.525 21.8125C2.025 21.9375 1.51667 22 1 22H0Z" fill="#0BAFE7"/>
              </svg>
              <span className="text-xs font-black tracking-[0.18em] uppercase text-foreground/40">FishTyping</span>
            </div>
            {/* Language pill */}
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-foreground/40">
              {data.passageLanguage} · Expert
            </span>
          </div>

          {/* Rank hero */}
          <div className="mb-6 text-center">
            <div className="mb-1 text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30">Global Rank</div>
            <div className="flex items-start justify-center gap-1 leading-none">
              <span className="mt-3 text-3xl font-black text-foreground/20">#</span>
              <span className="text-8xl font-black tabular-nums text-foreground">{data.rank}</span>
              <span className="mt-3 text-2xl font-black text-foreground/30">{suffix}</span>
            </div>
            <div className="mt-1 text-xs text-foreground/25">
              out of {data.totalPlayers} players
            </div>
          </div>

          {/* Avatar + name */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 text-xl font-black overflow-hidden"
              style={{ borderColor: tier.glow.replace("0.4", "0.5"), boxShadow: `0 0 24px ${tier.glow.replace("0.4", "0.25")}` }}
            >
              {data.avatarUrl ? (
                <img src={data.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span className={tier.color}>{initials}</span>
              )}
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-foreground">{data.displayName}</div>
              <span className={`mt-1 inline-flex items-center rounded-full border px-3 py-0.5 text-[9px] font-black uppercase tracking-[0.25em] ${tier.color} ${tier.border} ${tier.bg}`}>
                {tier.label}
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="mb-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
              <div className="text-[9px] font-black uppercase tracking-[0.35em] text-foreground/30 mb-2">Speed</div>
              <div className={`text-5xl font-black tabular-nums leading-none ${tier.color}`} style={{ textShadow: `0 0 30px ${tier.glow}` }}>
                {data.wpm}
              </div>
              <div className="mt-1 text-[9px] font-black uppercase tracking-[0.25em] text-foreground/25">WPM</div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
              <div className="text-[9px] font-black uppercase tracking-[0.35em] text-foreground/30 mb-2">Accuracy</div>
              <div className="text-5xl font-black tabular-nums leading-none text-foreground">
                {Math.round(data.accuracy)}
              </div>
              <div className="mt-1 text-[9px] font-black uppercase tracking-[0.25em] text-foreground/25">%</div>
            </div>
          </div>

          {/* Date */}
          <div className="mb-8 text-center text-[10px] text-foreground/25">
            Achieved on {formattedDate}
          </div>

          {/* CTA */}
          <Link
            href="/typing"
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black uppercase tracking-[0.18em] transition-all hover:scale-[1.02]"
            style={{ background: `linear-gradient(90deg, ${tier.glow.replace("0.4", "0.9")}, ${tier.glow.replace("0.4", "0.6")})`, color: "#000", boxShadow: `0 0 24px ${tier.glow.replace("0.4", "0.3")}` }}
          >
            Beat This Score
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>

        {/* Bottom note */}
        <p className="mt-4 text-center text-[10px] text-foreground/20">
          fishtyping.com · Expert difficulty · {data.passageLanguage === "lao" ? "Lao" : "English"}
        </p>
      </div>
    </div>
  );
}
