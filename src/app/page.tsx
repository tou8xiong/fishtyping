import { TypingTest } from "@/features/typing-test/components/TypingTest";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center px-4 pt-14 md:pt-20">
      {/* Typing Test Component */}
      <TypingTest />
    </div>
  );
}
