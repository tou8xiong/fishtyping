import type { Metadata } from "next";
import { Crimson_Text, EB_Garamond, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/Header";
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
  icons: {
    icon: "/project-Icon.svg",
  },
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
          <Header />

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
