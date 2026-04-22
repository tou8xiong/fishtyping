import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 relative overflow-hidden bg-[#1e1e1e]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2d3748_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-lg z-10 animate-fade-in">
        <div className="text-center mb-12 space-y-4">
          <Link href="/" className="inline-block w-16 h-16 bg-primary rounded-2xl rotate-12 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(11,175,231,0.4)] hover:rotate-6 hover:scale-110 transition-all duration-300">
            <span className="text-black font-black text-3xl -rotate-12">F</span>
          </Link>
          <h1 className="text-5xl font-black tracking-tight text-white">Welcome Back</h1>
          <p className="text-lg text-white/50 font-medium">Enter your credentials to continue your journey.</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 rounded-2xl blur opacity-30" />
          <div className="relative glass p-14 rounded-2xl space-y-10">
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-widest text-white/50 px-1">Email Address</label>
              <input 
                type="email" 
                placeholder="name@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-5 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-white/20 h-16 backdrop-blur"
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold uppercase tracking-widest text-white/50">Password</label>
                <a href="#" className="text-sm font-bold uppercase tracking-widest text-primary/70 hover:text-primary transition-colors">Forgot?</a>
              </div>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-5 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-white/20 h-16 backdrop-blur"
              />
            </div>
            <button className="w-full bg-gradient-to-r from-primary to-primary/80 text-black font-black py-5 rounded-xl shadow-[0_10px_40px_rgba(11,175,231,0.3)] hover:shadow-[0_10px_60px_rgba(11,175,231,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all text-lg">
              SIGN IN
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-sm font-bold uppercase tracking-widest text-white/30">
                <span className="bg-[#1e1e1e] px-6">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <button className="flex items-center justify-center gap-3 glass glass-hover py-5 rounded-xl text-base font-bold bg-white/5 hover:bg-white/10 transition-all">
                <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-2.108 4.024-1.2 1.2-3.128 1.944-5.732 1.944-4.828 0-8.8-3.972-8.8-8.8s3.972-8.8 8.8-8.8c2.612 0 4.56 1.032 5.952 2.368l2.32-2.32C18.664 1.344 15.936 0 12.48 0 5.856 0 0 5.856 0 12.48s5.856 12.48 12.48 12.48c3.504 0 6.144-1.152 8.16-3.264 2.088-2.088 2.748-5.004 2.748-7.392 0-.468-.036-.912-.108-1.344H12.48z"/></svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-3 glass glass-hover py-5 rounded-xl text-base font-bold bg-white/5 hover:bg-white/10 transition-all">
                <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                Github
              </button>
            </div>
          </div>
        </div>

        <p className="text-center mt-10 text-base text-white/50 font-medium">
          Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline underline-offset-4">Sign up for free</Link>
        </p>
      </div>
    </div>
  );
}