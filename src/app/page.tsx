import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-6xl z-10 px-6 py-20 flex flex-col items-center text-center gap-16">
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            Master the <br />
            <span className="bg-gradient-to-r from-primary via-white to-primary/40 bg-clip-text text-transparent italic">Art of Speed.</span>
          </h1>
          <p className="text-xl text-foreground/40 max-w-2xl mx-auto font-medium leading-relaxed">
            The minimalist, premium typing experience designed for those who demand precision and aesthetics. Test your limits, track your growth.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Link href="/typing" className="group relative px-10 py-5 bg-primary text-black rounded-md font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(11,175,231,0.2)] overflow-hidden">
              <span className="relative z-10">START TYPING NOW</span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
            </Link>
            <Link href="/login" className="px-10 py-5 glass glass-hover rounded-md font-bold text-lg text-foreground/80">
              CREATE ACCOUNT
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {[
            { title: "Pure Performance", desc: "No distractions. Just you, the keys, and your metrics in a beautifully focused environment.", icon: "⚡" },
            { title: "Deep Analytics", desc: "Understand your weak points with character-by-character analysis and heatmaps.", icon: "📊" },
            { title: "Global Arena", desc: "Compete in live seasons and climb the ranks of the world's fastest typists.", icon: "🏆" }
          ].map((feature, i) => (
            <div key={i} className="p-6 glass glass-hover rounded-md text-left flex flex-col gap-3">
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="font-black text-lg tracking-tight">{feature.title}</h3>
              <p className="text-sm text-foreground/40 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
