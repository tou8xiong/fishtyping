"use client";

import Link from "next/link";
import { useState } from "react";
import { LuLock, LuMail, LuUserRound, LuUserRoundPlus } from "react-icons/lu";
import { signup, signInWithOAuth } from "./actions";

function FishMark() {
  return (
    <svg width="42" height="48" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1 12.5L9 1V12.5H1ZM4.825 10.5H7V7.375L4.825 10.5ZM10.5 12.5C10.7 12.0333 10.9167 11.2167 11.15 10.05C11.3833 8.88333 11.5 7.7 11.5 6.5C11.5 5.3 11.3875 4.06667 11.1625 2.8C10.9375 1.53333 10.7167 0.6 10.5 0C11.5167 0.3 12.5292 0.858333 13.5375 1.675C14.5458 2.49167 15.4542 3.46667 16.2625 4.6C17.0708 5.73333 17.7292 6.97917 18.2375 8.3375C18.7458 9.69583 19 11.0833 19 12.5H10.5ZM13.1 10.5H16.8C16.5167 9.21667 16.0542 8.04167 15.4125 6.975C14.7708 5.90833 14.0917 5 13.375 4.25C13.4083 4.6 13.4375 4.9625 13.4625 5.3375C13.4875 5.7125 13.5 6.1 13.5 6.5C13.5 7.28333 13.4625 8.00833 13.3875 8.675C13.3125 9.34167 13.2167 9.95 13.1 10.5ZM7 18C6.4 18 5.84167 17.8583 5.325 17.575C4.80833 17.2917 4.36667 16.9333 4 16.5C3.76667 16.75 3.5125 16.9833 3.2375 17.2C2.9625 17.4167 2.65833 17.5917 2.325 17.725C1.74167 17.2917 1.24583 16.7542 0.8375 16.1125C0.429167 15.4708 0.15 14.7667 0 14H20C19.85 14.7667 19.5708 15.4708 19.1625 16.1125C18.7542 16.7542 18.2583 17.2917 17.675 17.725C17.3417 17.5917 17.0375 17.4167 16.7625 17.2C16.4875 16.9833 16.2333 16.75 16 16.5C15.6167 16.9333 15.1708 17.2917 14.6625 17.575C14.1542 17.8583 13.6 18 13 18C12.4 18 11.8417 17.8583 11.325 17.575C10.8083 17.2917 10.3667 16.9333 10 16.5C9.63333 16.9333 9.19167 17.2917 8.675 17.575C8.15833 17.8583 7.6 18 7 18ZM0 22V20H1C1.53333 20 2.05417 19.9167 2.5625 19.75C3.07083 19.5833 3.55 19.3333 4 19C4.45 19.3333 4.92917 19.5792 5.4375 19.7375C5.94583 19.8958 6.46667 19.975 7 19.975C7.53333 19.975 8.05 19.8958 8.55 19.7375C9.05 19.5792 9.53333 19.3333 10 19C10.45 19.3333 10.9292 19.5792 11.4375 19.7375C11.9458 19.8958 12.4667 19.975 13 19.975C13.5333 19.975 14.05 19.8958 14.55 19.7375C15.05 19.5792 15.5333 19.3333 16 19C16.4667 19.3333 16.95 19.5833 17.45 19.75C17.95 19.9167 18.4667 20 19 20H20V22H19C18.4833 22 17.975 21.9375 17.475 21.8125C16.975 21.6875 16.4833 21.5 16 21.25C15.5167 21.5 15.025 21.6875 14.525 21.8125C14.025 21.9375 13.5167 22 13 22C12.4833 22 11.975 21.9375 11.475 21.8125C10.975 21.6875 10.475 21.5 10 21.25C9.525 21.5 9.025 21.6875 8.525 21.8125C8.025 21.9375 7.51667 22 7 22C6.48333 22 5.975 21.9375 5.475 21.8125C4.975 21.6875 4.48333 21.5 4 21.25C3.51667 21.5 3.025 21.6875 2.525 21.8125C2.025 21.9375 1.51667 22 1 22H0Z"
        fill="var(--primary)"
      />
    </svg>
  );
}

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/45">
      {children}
    </span>
  );
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const result = await signup(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result?.success) {
      setSuccess(result.message || "Account created successfully.");
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setLoading(true);
    setError("");
    setSuccess("");
    await signInWithOAuth(provider);
  };

  return (
    <section className="relative flex-1 overflow-hidden bg-background px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(11,175,231,0.08),transparent_38%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-10rem)] max-w-md items-center justify-center animate-fade-in">
        <div className="glass w-full rounded-xl border border-primary/35 px-6 py-8 shadow-[0_0_46px_rgba(11,175,231,0.08)] sm:px-7">
          <div className="mb-6 text-center">
            <div className="mb-3 flex justify-center">
              <FishMark />
            </div>
            <h1 className="text-5xl font-black leading-none tracking-tight text-foreground">
              Join the
              <br />
              Depths
            </h1>
            <p className="mt-3 text-base text-foreground/65">Create your FishTyping account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-[0.24em] text-foreground/65">
                Username
              </label>
              <div className="relative">
                <FieldIcon>
                  <LuUserRound className="h-4 w-4" />
                </FieldIcon>
                <input
                  name="username"
                  type="text"
                  required
                  placeholder="CaptainNemo"
                  className="w-full rounded-sm border border-border bg-white/[0.05] py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground/30 focus:border-primary/60 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-[0.24em] text-foreground/65">
                Email
              </label>
              <div className="relative">
                <FieldIcon>
                  <LuMail className="h-4 w-4" />
                </FieldIcon>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="captain@nautilus.com"
                  className="w-full rounded-sm border border-border bg-white/[0.05] py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground/30 focus:border-primary/60 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-[0.24em] text-foreground/65">
                Password
              </label>
              <div className="relative">
                <FieldIcon>
                  <LuLock className="h-4 w-4" />
                </FieldIcon>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full rounded-sm border border-border bg-white/[0.05] py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground/30 focus:border-primary/60 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-[0.24em] text-foreground/65">
                Confirm Password
              </label>
              <div className="relative">
                <FieldIcon>
                  <LuLock className="h-4 w-4" />
                </FieldIcon>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full rounded-sm border border-border bg-white/[0.05] py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground/30 focus:border-primary/60 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            {success && (
              <p className="rounded-sm border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
                {success}
              </p>
            )}

            <label className="flex items-start gap-3 pt-1 text-[11px] text-foreground/60">
              <input name="terms" type="checkbox" required className="mt-0.5 h-3.5 w-3.5 accent-[var(--primary)]" />
              <span>
                I agree to the{" "}
                <a href="#" className="font-bold text-primary hover:text-primary/80">
                  Terms & Privacy Policy.
                </a>
              </span>
            </label>

            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-primary/55 bg-primary/5 px-4 py-3 text-[11px] font-black uppercase tracking-[0.24em] text-primary shadow-[0_0_22px_rgba(11,175,231,0.08)] transition-all hover:bg-primary/10 disabled:opacity-50"
            >
              {loading ? "Creating..." : <><LuUserRoundPlus className="h-4 w-4" /> Create Account</>}
            </button>
          </form>

          <div className="my-8 h-px bg-white/6" />

          <div className="space-y-2.5">
            <button
              onClick={() => handleOAuth("google")}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-border bg-transparent px-4 py-3 text-sm text-foreground/80 transition-colors hover:border-primary/35 hover:text-foreground disabled:opacity-50"
            >
              <LuUserRound className="h-4 w-4" />
              Sign up with Google
            </button>
            <button
              onClick={() => handleOAuth("github")}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-border bg-transparent px-4 py-3 text-sm text-foreground/80 transition-colors hover:border-primary/35 hover:text-foreground disabled:opacity-50"
            >
              <LuUserRound className="h-4 w-4" />
              Sign up with GitHub
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-foreground/65">
            Already a typist?{" "}
            <Link href="/login" className="text-primary transition-colors hover:text-primary/80">
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
