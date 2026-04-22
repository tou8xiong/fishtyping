import Link from "next/link";
import { FaRocket, FaChartLine, FaTrophy } from "react-icons/fa6";
import { FiArrowRight } from "react-icons/fi";
import { TypingTest } from "@/features/typing-test/components/TypingTest";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-6xl z-10 px-6 py-20 md:py-32 flex flex-col items-center text-center gap-16">

        {/* Live Typing Experience */}
        <div className="w-full animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <TypingTest />
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
