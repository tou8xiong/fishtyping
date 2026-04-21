import type { Metadata } from "next";
import { Outfit, EB_Garamond, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { FaCog } from "react-icons/fa";
import { TypingSettingsProvider } from "@/features/typing-test/context/TypingSettingsContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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
  title: "The Kinetic Stream | Master Your Speed",
  description: "A premium typing experience designed for speed and accuracy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${ebGaramond.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased selection:bg-primary/30">
        <div className="flex flex-col min-h-screen bg-black">
          <header className="py-6 px-12 border-b border-white/5 backdrop-blur-2xl sticky top-0 z-50">
            <div className="max-w-[1400px] mx-auto flex justify-between items-center">
              <Link href="/" className="flex items-center gap-2 group transition-all duration-300">
                <span className="text-xl font-black tracking-tight text-primary">The Kinetic Stream</span>
              </Link>
              
              <nav className="hidden lg:flex items-center gap-8 text-[13px] font-medium tracking-wide text-white/50">
                <Link href="/typing" className="hover:text-white transition-all border-b-2 border-transparent hover:border-primary pb-1">Practice</Link>
                <Link href="#" className="hover:text-white transition-all pb-1">Multiplayer</Link>
                <Link href="/leaderboard" className="hover:text-white transition-all pb-1">Leaderboards</Link>
                <Link href="/settings" className="hover:text-white transition-all pb-1">Settings</Link>
              </nav>

              <div className="flex items-center gap-8">
                <Link href="/settings" className="text-white/40 hover:text-white transition-colors">
                  <FaCog className="text-lg" />
                </Link>
                <Link href="/login" className="text-sm font-bold text-white/80 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/typing" className="bg-primary text-black px-8 py-2.5 rounded-lg text-sm font-black hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(11,175,231,0.2)]">
                  Start Typing
                </Link>
              </div>
            </div>
          </header>
          
          <main className="flex-1 flex flex-col">
            <TypingSettingsProvider>
              {children}
            </TypingSettingsProvider>
          </main>

          <footer className="py-12 px-12 border-t border-white/5 text-[13px] text-white/40 font-medium">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col gap-1 items-center md:items-start">
                <span className="text-lg font-black text-white">The Kinetic Stream</span>
              </div>
              
              <div className="flex gap-10">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">API Docs</a>
                <a href="#" className="hover:text-white transition-colors">Discord Support</a>
              </div>

              <p>&copy; {new Date().getFullYear()} The Kinetic Stream. Performance typing evolved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
