import type { Metadata } from "next";
import { Crimson_Text, EB_Garamond, JetBrains_Mono, Noto_Sans_Lao } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/ToastProvider";
import { SettingsProvider } from "@/contexts/SettingsContext";
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

const notoSansLao = Noto_Sans_Lao({
  variable: "--font-noto-sans-lao",
  subsets: ["lao"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" className={`${crimsonText.variable} ${ebGaramond.variable} ${jetbrainsMono.variable} ${notoSansLao.variable}`}>
      <body className="antialiased">
        <SettingsProvider>
          <ToastProvider />
          <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 flex flex-col">
              {children}
            </main>

            <Footer />
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
