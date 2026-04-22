"use client";

import { TypingTest } from "@/features/typing-test/components/TypingTest";

type PracticeVariant = "fullscreen" | "embedded" | "compact";

interface PracticeSectionProps {
  variant?: PracticeVariant;
  className?: string;
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const variantStyles: Record<PracticeVariant, string> = {
  fullscreen: "min-h-screen py-8 px-4 relative overflow-hidden bg-[#1e1e1e]",
  embedded: "w-full flex flex-col items-center relative overflow-hidden pt-20",
  compact: "w-full flex flex-col items-center",
};

const backgroundElements: Record<PracticeVariant, React.ReactNode> = {
  fullscreen: (
    <>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2d3748_0%,transparent_70%)] pointer-events-none" />
    </>
  ),
  embedded: (
    <>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
    </>
  ),
  compact: null,
};

const containerStyles: Record<PracticeVariant, string> = {
  fullscreen: "w-full max-w-6xl z-10",
  embedded: "w-full max-w-5xl",
  compact: "w-full",
};

export function PracticeSection({ variant = "embedded", className }: PracticeSectionProps) {
  return (
    <div className={cn(variantStyles[variant], className)}>
      {backgroundElements[variant]}
      <div className={containerStyles[variant]}>
        <TypingTest />
      </div>
    </div>
  );
}