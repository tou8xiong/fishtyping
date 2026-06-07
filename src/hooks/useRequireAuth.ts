"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

const ADMIN_EMAIL = "touxhk@gmail.com";
const ADMIN_ID = "8OZdxsSF8gY5ysBogP5yqkTMaZI3";

/** Redirects unauthenticated users to /login with a toast and preserves the return URL. */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const fired = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user && !fired.current) {
      fired.current = true;
      toast.error("Please sign in to continue.");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  return { user, loading };
}

/**
 * Like useRequireAuth but also checks admin role.
 * Unauthenticated → /login with redirect.
 * Authenticated but not admin → /login with "no permission" toast.
 */
export function useRequireAdmin() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const fired = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (fired.current) return;

    if (!user) {
      fired.current = true;
      toast.error("Please sign in to continue.");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user.email !== ADMIN_EMAIL && user.id !== ADMIN_ID) {
      fired.current = true;
      toast.error("You don't have permission to access this page.");
      router.push("/login");
    }
  }, [loading, user, router, pathname]);

  return { user, loading };
}
