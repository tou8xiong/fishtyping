import type { Metadata } from "next";
import { Crimson_Text, EB_Garamond, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const crimsonText = Crimson_Text({
  variable: "--font-crimson-text",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FishTyping | Master Your Speed",
  description: "A premium typing experience designed for speed and accuracy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${crimsonText.variable} ${ebGaramond.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        <div className="flex flex-col min-h-screen">
          <header className="py-6 px-8 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <Link href="/" className="flex items-center gap-3 group transition-all duration-300">
                <div className="w-10 h-10 bg-primary rounded-xl rotate-12 flex items-center justify-center shadow-[0_0_20px_rgba(11,175,231,0.3)] group-hover:rotate-0 transition-transform duration-300">
                  <span className="text-black font-black text-xl -rotate-12 group-hover:rotate-0 transition-transform duration-300">F</span>
                </div>
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">FishTyping</span>
              </Link>

              <nav className="hidden md:flex items-center gap-10 text-sm font-semibold tracking-wide">
                <Link href="/typing" className="text-foreground/60 hover:text-primary transition-all duration-200">PRACTICE</Link>
                <Link href="/leaderboard" className="text-foreground/60 hover:text-primary transition-all duration-200">LEADERBOARD</Link>
                <Link href="/settings" className="text-foreground/60 hover:text-primary transition-all duration-200">SETTINGS</Link>
              </nav>

              <div className="flex items-center gap-4">
                <Link href="/login" className="px-6 py-2.5 rounded-full text-sm font-bold text-foreground/80 hover:text-foreground transition-colors">
                  Log In
                </Link>
                <Link href="/register" className="bg-primary text-black px-6 py-2.5 rounded-full text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(11,175,231,0.2)]">
                  GET STARTED
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col">
            {children}
          </main>

          <footer className="py-12 px-8 border-t border-white/5 text-center">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-sm text-foreground/40 font-medium">
                &copy; {new Date().getFullYear()} FishTyping. Precision matters.
              </p>
              <div className="flex gap-8 text-xs font-bold text-foreground/20 tracking-widest uppercase">
                <a href="#" className="hover:text-foreground/60 transition-colors">Twitter</a>
                <a href="#" className="hover:text-foreground/60 transition-colors">Discord</a>
                <a href="#" className="hover:text-foreground/60 transition-colors">Github</a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
