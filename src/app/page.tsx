import Link from "next/link";
import { FaRocket, FaChartLine, FaTrophy } from "react-icons/fa6";
import { FiArrowRight } from "react-icons/fi";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-6xl z-10 px-6 py-20 flex flex-col items-center text-center gap-16">
        <div className="space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass border-white/5 text-xs font-black tracking-[0.2em] text-primary uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Now Live: Version 2.0
          </div>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none">
            Master the <br />
            <span className="bg-gradient-to-r from-primary via-white to-primary/40 bg-clip-text text-transparent italic">Art of Speed.</span>
          </h1>
          <p className="text-2xl text-foreground/40 max-w-2xl mx-auto font-medium leading-relaxed">
            The minimalist, premium typing experience designed for those who demand precision and aesthetics. Test your limits, track your growth.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
            <Link href="/typing" className="group relative px-14 py-7 bg-primary text-black rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_25px_60px_rgba(11,175,231,0.3)] overflow-hidden flex items-center gap-4">
              <span className="relative z-10">START TYPING NOW</span>
              <FiArrowRight className="relative z-10 text-2xl group-hover:translate-x-2 transition-transform" />
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            </Link>
            <Link href="/login" className="px-14 py-7 glass glass-hover rounded-2xl font-bold text-xl text-foreground/80">
              CREATE ACCOUNT
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-5xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {[
            { title: "Pure Performance", desc: "No distractions. Just you, the keys, and your metrics in a beautifully focused environment.", icon: <FaRocket className="text-primary" /> },
            { title: "Deep Analytics", desc: "Understand your weak points with character-by-character analysis and heatmaps.", icon: <FaChartLine className="text-primary" /> },
            { title: "Global Arena", desc: "Compete in live seasons and climb the ranks of the world's fastest typists.", icon: <FaTrophy className="text-primary" /> }
          ].map((feature, i) => (
            <div key={i} className="p-10 glass glass-hover rounded-3xl text-left flex flex-col gap-6">
              <div className="text-5xl">{feature.icon}</div>
              <h3 className="font-black text-2xl tracking-tight">{feature.title}</h3>
              <p className="text-base text-foreground/40 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
