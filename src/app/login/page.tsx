import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 relative overflow-hidden bg-[#020617]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e293b,transparent)] pointer-events-none" />
      
      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="text-center mb-10 space-y-3">
          <Link href="/" className="inline-block w-12 h-12 bg-primary rounded-xl rotate-12 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(11,175,231,0.3)]">
            <span className="text-black font-black text-2xl -rotate-12">F</span>
          </Link>
          <h1 className="text-4xl font-black tracking-tight">Welcome Back</h1>
          <p className="text-foreground/40 font-medium">Enter your credentials to continue your journey.</p>
        </div>

        <div className="glass p-8 rounded-md shadow-2xl border-white/5 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground/40 px-1">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-md px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-foreground/20"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-black uppercase tracking-widest text-foreground/40">Password</label>
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary">Forgot?</a>
            </div>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-md px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-foreground/20"
            />
          </div>
          <button className="w-full bg-primary text-black font-black py-4 rounded-md shadow-[0_10px_30px_rgba(11,175,231,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all">
            SIGN IN
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-foreground/20">
              <span className="bg-[#0f172a] px-4">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 glass glass-hover py-3 rounded-md text-xs font-bold">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-2.108 4.024-1.2 1.2-3.128 1.944-5.732 1.944-4.828 0-8.8-3.972-8.8-8.8s3.972-8.8 8.8-8.8c2.612 0 4.56 1.032 5.952 2.368l2.32-2.32C18.664 1.344 15.936 0 12.48 0 5.856 0 0 5.856 0 12.48s5.856 12.48 12.48 12.48c3.504 0 6.144-1.152 8.16-3.264 2.088-2.088 2.748-5.004 2.748-7.392 0-.468-.036-.912-.108-1.344H12.48z"/></svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-3 glass glass-hover py-3 rounded-md text-xs font-bold">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              Github
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-foreground/40 font-medium">
          Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline underline-offset-4">Sign up for free</Link>
        </p>
      </div>
    </div>
  );
}
