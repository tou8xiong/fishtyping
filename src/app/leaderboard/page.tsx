const topPlayers = [
  { rank: 2, name: "CyberMako", wpm: 185, accuracy: 99.4, avatar: "CM", badge: "🥈", accent: "border-white/20" },
  { rank: 1, name: "ApexPredator", wpm: 212, accuracy: 99.8, avatar: "AP", badge: "🥇", accent: "border-secondary/70 shadow-[0_0_28px_rgba(255,195,56,0.18)]" },
  { rank: 3, name: "SquidType", wpm: 178, accuracy: 98.9, avatar: "ST", badge: "🥉", accent: "border-secondary/40" },
];

const leaderboardPlayers = [
  { rank: 4, name: "DeepBlue", wpm: 165, accuracy: 98.2, date: "Apr 23, 2026", avatar: "DB" },
  { rank: 5, name: "NemoTypist", wpm: 162, accuracy: 96.5, date: "Apr 22, 2026", avatar: "NT" },
  { rank: 6, name: "KeystrokeKraken", wpm: 158, accuracy: 99.1, date: "Apr 22, 2026", avatar: "KK" },
  { rank: 7, name: "TidalDash", wpm: 154, accuracy: 97.9, date: "Apr 21, 2026", avatar: "TD" },
  { rank: 8, name: "WaveRunner", wpm: 151, accuracy: 98.4, date: "Apr 21, 2026", avatar: "WR" },
];

const filters = ["Today", "This Week", "All Time"];

export default function LeaderboardPage() {
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
                const active = filter === "All Time";

                return (
                  <button
                    key={filter}
                    className={`rounded-md border px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.25em] transition-all ${
                      active
                        ? "border-primary bg-primary/15 text-primary shadow-[0_0_22px_rgba(11,175,231,0.22)]"
                        : "border-border bg-white/[0.03] text-foreground/55 hover:border-primary/40 hover:text-foreground"
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
          {topPlayers.map((player) => {
            const featured = player.rank === 1;

            return (
              <article
                key={player.rank}
                className={`glass group relative flex min-h-64 flex-col justify-between rounded-xl border px-6 py-7 transition-all duration-300 hover:-translate-y-1 ${player.accent} ${
                  featured ? "md:-translate-y-3" : ""
                }`}
              >
                <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top,rgba(248,250,252,0.04),transparent_60%)] opacity-70" />
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl border text-base font-black ${
                        featured
                          ? "border-secondary bg-secondary/10 text-secondary shadow-[0_0_18px_rgba(255,195,56,0.2)]"
                          : "border-primary/40 bg-primary/10 text-primary"
                      }`}
                    >
                      {player.avatar}
                    </div>
                    <div className="space-y-1">
                      <div className="inline-flex rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-black text-secondary">
                        {player.badge} #{player.rank}
                      </div>
                      <h2 className={`text-2xl font-black tracking-tight ${featured ? "text-secondary" : "text-foreground"}`}>
                        {player.name}
                      </h2>
                    </div>
                  </div>
                  <span className={`text-2xl ${featured ? "text-secondary/60" : "text-foreground/20"}`}>🏆</span>
                </div>

                <div className="relative mt-8 flex items-end justify-between gap-4">
                  <div>
                    <div className={`text-4xl font-black tabular-nums ${featured ? "text-primary" : "text-primary/90"}`}>
                      {player.wpm}
                    </div>
                    <div className="mt-1 text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40">
                      WPM
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black tabular-nums text-secondary">{player.accuracy}%</div>
                    <div className="mt-1 text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40">
                      ACC
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="glass overflow-hidden rounded-xl border border-border/80">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.015]">
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
                {leaderboardPlayers.map((player) => (
                  <tr key={player.rank} className="leaderboard-row">
                    <td className="border-t border-white/5 px-6 py-5 md:px-7">
                      <span className="inline-flex min-w-12 justify-center rounded-full border border-white/8 bg-white/[0.02] px-3 py-1 text-sm font-medium text-foreground/75">
                        {String(player.rank).padStart(2, "0")}
                      </span>
                    </td>
                    <td className="border-t border-white/5 px-6 py-5 md:px-7">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-sm font-black text-primary">
                          {player.avatar}
                        </div>
                        <span className="text-base font-bold text-foreground">{player.name}</span>
                      </div>
                    </td>
                    <td className="border-t border-white/5 px-6 py-5 md:px-7">
                      <span className="text-2xl font-black tabular-nums text-primary">{player.wpm}</span>
                    </td>
                    <td className="border-t border-white/5 px-6 py-5 md:px-7">
                      <span className="text-lg font-black tabular-nums text-secondary">{player.accuracy}%</span>
                    </td>
                    <td className="border-t border-white/5 px-6 py-5 md:px-7">
                      <span className="text-sm font-medium text-foreground/55">{player.date}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col items-center gap-10 py-4">
          <button className="rounded-md border border-primary/60 bg-primary/10 px-8 py-3 text-xs font-black uppercase tracking-[0.28em] text-primary shadow-[0_0_18px_rgba(11,175,231,0.16)] transition-all hover:scale-[1.02] hover:bg-primary/15">
            Load More
          </button>

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
