import { Footer } from "@/components/Footer";

export default function RankLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
