"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@/lib/supabase/types";

interface AuthUser extends User {
  email?: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error?: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    console.log('useAuth: setting up auth listener');

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('useAuth: onAuthStateChange fired', { event, hasSession: !!session, hasUser: !!session?.user });

      if (!mounted) {
        console.log('useAuth: component unmounted, skipping');
        return;
      }

      if (session?.user) {
        console.log('useAuth: fetching profile for user', session.user.id);

        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        console.log('useAuth: profile fetch result', { hasProfile: !!profile, error: profileError?.message });

        const combinedUser: AuthUser = {
          ...(profile as User || {}),
          id: session.user.id,
          email: session.user.email || undefined,
          username: profile?.username || session.user.user_metadata?.username || session.user.email?.split("@")[0] || null,
          display_name: profile?.display_name || session.user.user_metadata?.full_name || session.user.user_metadata?.username || session.user.email?.split("@")[0] || null,
        };

        console.log('useAuth: onAuthStateChange setting user', { username: combinedUser.username, display_name: combinedUser.display_name });

        setAuthState({
          user: combinedUser,
          loading: false,
        });

        console.log('useAuth: state updated');
      } else {
        console.log('useAuth: onAuthStateChange clearing user (no session)');
        setAuthState({ user: null, loading: false });
      }
    });

    // Trigger initial auth check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      console.log('useAuth: initial session check', { hasSession: !!session });

      if (!session) {
        setAuthState({ user: null, loading: false });
      }
      // If session exists, onAuthStateChange will handle it
    }).catch(err => {
      console.error('useAuth: getSession error', err);
      if (mounted) {
        setAuthState({ user: null, loading: false });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return authState;
}