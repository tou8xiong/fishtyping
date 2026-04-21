import { TypingTest } from "@/features/typing-test/components/TypingTest";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl z-10 flex flex-col gap-12">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Typing at the <span className="text-primary italic">speed</span> of light.
          </h1>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Test your skills, improve your accuracy, and join the elite ranks of the world's fastest typists.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border p-8 rounded-3xl shadow-2xl">
          <TypingTest />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-card/30 border border-border rounded-2xl">
            <h3 className="font-bold text-lg mb-2">Real-time Analytics</h3>
            <p className="text-sm text-foreground/60">Track your WPM, accuracy, and consistency in real-time as you type.</p>
          </div>
          <div className="p-6 bg-card/30 border border-border rounded-2xl">
            <h3 className="font-bold text-lg mb-2">Custom Themes</h3>
            <p className="text-sm text-foreground/60">Choose from dozens of premium themes or create your own perfect workspace.</p>
          </div>
          <div className="p-6 bg-card/30 border border-border rounded-2xl">
            <h3 className="font-bold text-lg mb-2">Competitive Play</h3>
            <p className="text-sm text-foreground/60">Race against friends or the community to climb the global leaderboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
