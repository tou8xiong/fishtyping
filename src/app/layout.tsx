import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        <div className="flex flex-col min-h-screen">
          <header className="py-6 px-8 border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg rotate-12 flex items-center justify-center">
                  <span className="text-background font-bold -rotate-12">F</span>
                </div>
                <span className="text-xl font-bold tracking-tight">FishTyping</span>
              </div>
              <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/60">
                <a href="#" className="hover:text-foreground transition-colors">Practice</a>
                <a href="#" className="hover:text-foreground transition-colors">Leaderboard</a>
                <a href="#" className="hover:text-foreground transition-colors">Settings</a>
              </nav>
              <button className="bg-foreground text-background px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
                Sign In
              </button>
            </div>
          </header>
          
          <main className="flex-1 flex flex-col">
            {children}
          </main>

          <footer className="py-8 px-8 border-t border-border/40 text-center text-sm text-foreground/40">
            <p>&copy; {new Date().getFullYear()} FishTyping. All rights reserved.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
