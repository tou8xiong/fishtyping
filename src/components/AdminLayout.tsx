"use client";

import { usePathname, useRouter } from "next/navigation";
import { MdArticle, MdPeople, MdLeaderboard } from "react-icons/md";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      name: "Passages",
      path: "/admin",
      icon: MdArticle,
    },
    {
      name: "User Management",
      path: "/admin/users",
      icon: MdPeople,
    },
    {
      name: "Ranking",
      path: "/admin/ranking",
      icon: MdLeaderboard,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin" || pathname.startsWith("/admin/passages");
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Sidebar */}
      <aside className="relative z-10 w-64 bg-white/3 border-r border-white/10 p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-black uppercase tracking-wider text-white">
            Admin Panel
          </h2>
          <p className="text-xs text-foreground/60 mt-1">Management Dashboard</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${active
                    ? "bg-primary text-black"
                    : "bg-white/5 text-foreground/60 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
