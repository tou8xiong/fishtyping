import { TypingTest } from "@/features/typing-test/components/TypingTest";

export default function TypingPage() {
  return (
    <div className="flex-1 flex flex-col border-2 items-center py-12 md:py-20 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl max-h-[800px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-5xl z-10 animate-fade-in">
        <TypingTest />
      </div>
    </div>
  );
}
