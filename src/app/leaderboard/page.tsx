import Link from "next/link";

const mockLeaderboard = [
  { rank: 1, name: "SwiftFinger", wpm: 184, accuracy: 99.8, avatar: "SF", level: 82 },
  { rank: 2, name: "NeonTypist", wpm: 176, accuracy: 99.2, avatar: "NT", level: 75 },
  { rank: 3, name: "VelocityX", wpm: 172, accuracy: 98.5, avatar: "VX", level: 68 },
  { rank: 4, name: "GhostKeys", wpm: 168, accuracy: 99.0, avatar: "GK", level: 91 },
  { rank: 5, name: "ShadowType", wpm: 165, accuracy: 97.8, avatar: "ST", level: 44 },
  { rank: 6, name: "BlazeMaster", wpm: 162, accuracy: 98.2, avatar: "BM", level: 56 },
  { rank: 7, name: "EtherSpeed", wpm: 159, accuracy: 99.5, avatar: "ES", level: 39 },
  { rank: 8, name: "QuantumStrike", wpm: 155, accuracy: 96.9, avatar: "QS", level: 52 },
  { rank: 9, name: "ZephyrLink", wpm: 152, accuracy: 98.0, avatar: "ZL", level: 41 },
  { rank: 10, name: "NovaPulse", wpm: 148, accuracy: 97.5, avatar: "NP", level: 33 },
];    

export default function LeaderboardPage() {
  return (
    <div className="flex-1 flex flex-col items-center py-20 px-8 relative overflow-hidden bg-[#020617]">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[20%] w-[60%] h-[40%] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-5xl z-10 space-y-12 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tighter italic bg-gradient-to-r from-primary to-white/40 bg-clip-text text-transparent">Hall of Fame</h1>
            <p className="text-lg text-foreground/40 font-medium">The fastest minds in the digital ocean.</p>
          </div>

          <div className="flex gap-2 p-1.5 glass rounded-2xl">
            {['Global', 'Friends', 'Local'].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'Global' ? 'bg-primary text-black shadow-lg' : 'hover:bg-white/5 text-foreground/40'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Top 3 Podium Cards */}
          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockLeaderboard.slice(0, 3).map((user, i) => (
              <div key={user.rank} className={`p-8 glass rounded-2xl relative overflow-hidden group transition-all hover:scale-[1.02] border ${i === 0 ? 'border-primary shadow-[0_20px_50px_rgba(11,175,231,0.2)] hover:shadow-[0_25px_60px_rgba(11,175,231,0.3)]' : 'border-white/10 hover:border-white/20 hover:shadow-lg'}`}>
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity font-black text-8xl italic">#{user.rank}</div>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${i === 0 ? 'bg-primary text-black' : 'bg-white/5 text-primary'}`}>
                    {user.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">{user.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">LEVEL {user.level}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-3xl font-black text-foreground tabular-nums">{user.wpm}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">WPM</span>
                  </div>
                  <div>
                    <span className="block text-3xl font-black text-foreground/60 tabular-nums">{user.accuracy}%</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">Accuracy</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* List Table */}
          <div className="lg:col-span-4 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 hover:border-white/20 transition-all">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-foreground/20">Rank</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-foreground/20">User</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-foreground/20">Speed</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-foreground/20">Accuracy</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-foreground/20 text-right">Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {mockLeaderboard.slice(3).map((user) => (
                    <tr key={user.rank} className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <span className="text-lg font-black text-foreground/40 group-hover:text-primary transition-colors italic">#{user.rank}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-xs text-foreground/40 group-hover:bg-primary group-hover:text-black transition-all">
                            {user.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-foreground/80 group-hover:text-foreground transition-colors">{user.name}</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-foreground/20">PRO MEMBER</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xl font-black tabular-nums">{user.wpm}</span>
                        <span className="ml-1 text-[10px] font-black text-foreground/20 uppercase tracking-widest">WPM</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xl font-black text-foreground/40 tabular-nums">{user.accuracy}%</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="inline-flex gap-1">
                          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <div key={i} className={`w-1.5 h-4 rounded-full ${i > 4 ? 'bg-primary/20' : 'bg-primary shadow-[0_0_8px_rgba(11,175,231,0.4)]'}`} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 pt-8">
          <p className="text-sm text-foreground/40 font-medium">Want to see yourself here?</p>
          <Link href="/typing" className="px-12 py-5 bg-white text-black rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
            GO TO PRACTICE
          </Link>
        </div>
      </div>
    </div>
  );
}
