"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="py-4 md:py-5 border-b border-white/5  backdrop-blur-xl sticky top-0 z-50 bg-black/80">
      <div className="w-full px-4 md:px-8 flex justify-between items-center border-2 border-white">
        <Link href="/" className="flex items-center gap-3 group transition-all duration-300">
          <div className="w-10 h-10 bg-primary rounded-xl rotate-12 flex items-center justify-center shadow-[0_0_20px_rgba(11,175,231,0.3)] group-hover:rotate-0 transition-transform duration-300">
            <span className="text-black font-black text-xl -rotate-12 group-hover:rotate-0 transition-transform duration-300">F</span>
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent italic">FishTyping</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-semibold tracking-wide">
          <Link href="/typing" className="text-foreground/60 hover:text-primary transition-all duration-200">PRACTICE</Link>
          <Link href="/leaderboard" className="text-foreground/60 hover:text-primary transition-all duration-200">LEADERBOARD</Link>
          <Link href="/settings" className="text-foreground/60 hover:text-primary transition-all duration-200">SETTINGS</Link>
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/login" className="hidden sm:block px-5 py-2 md:px-6 md:py-2.5 rounded-full text-sm font-bold text-foreground/80 hover:text-foreground transition-colors">
            Log In
          </Link>
          <Link href="/register" className="inline-flex bg-primary text-black px-6 py-2.5 md:py-3 rounded-sm text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(11,175,231,0.2)]">
            GET STARTED
          </Link>
          <button
            className="md:hidden p-2 text-foreground/60 hover:text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-white/10 pt-4">
          <Link href="/typing" className="block py-2 text-foreground/80 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>PRACTICE</Link>
          <Link href="/leaderboard" className="block py-2 text-foreground/80 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>LEADERBOARD</Link>
          <Link href="/settings" className="block py-2 text-foreground/80 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>SETTINGS</Link>
          <Link href="/login" className="block py-2 text-foreground/80 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
        </div>
      )}
    </header>
  );
}