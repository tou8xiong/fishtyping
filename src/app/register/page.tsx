import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 relative overflow-hidden bg-[#020617]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1e293b,transparent)] pointer-events-none" />
      
      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="text-center mb-10 space-y-3">
          <Link href="/" className="inline-block w-12 h-12 bg-primary rounded-xl rotate-12 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(11,175,231,0.3)]">
            <span className="text-black font-black text-2xl -rotate-12">F</span>
          </Link>
          <h1 className="text-4xl font-black tracking-tight">Create Account</h1>
          <p className="text-foreground/40 font-medium">Join the elite circle of the world's fastest typists.</p>
        </div>

        <div className="glass p-8 rounded-md shadow-2xl border-white/5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-foreground/40 px-1">First Name</label>
              <input type="text" placeholder="John" className="w-full bg-white/5 border border-white/10 rounded-md px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-foreground/20" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-foreground/40 px-1">Last Name</label>
              <input type="text" placeholder="Doe" className="w-full bg-white/5 border border-white/10 rounded-md px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-foreground/20" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground/40 px-1">Email Address</label>
            <input type="email" placeholder="name@example.com" className="w-full bg-white/5 border border-white/10 rounded-md px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-foreground/20" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground/40 px-1">Password</label>
            <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-md px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-foreground/20" />
          </div>
          
          <div className="flex items-start gap-3 py-2 px-1">
            <input type="checkbox" className="mt-1 accent-primary" />
            <p className="text-[10px] font-bold text-foreground/30 leading-relaxed uppercase tracking-widest">
              I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </div>

          <button className="w-full bg-primary text-black font-black py-4 rounded-md shadow-[0_10px_30px_rgba(11,175,231,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all">
            CREATE ACCOUNT
          </button>
        </div>

        <p className="text-center mt-8 text-sm text-foreground/40 font-medium">
          Already a member? <Link href="/login" className="text-primary font-bold hover:underline underline-offset-4">Log in here</Link>
        </p>
      </div>
    </div>
  );
}
