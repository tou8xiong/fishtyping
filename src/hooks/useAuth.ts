"use client";

import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/lib/supabase/types";

interface AuthUser extends User {
  email?: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error?: string;
}

let cachedProfile: User | null = null;
let lastUserId: string | null = null;

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    console.log('useAuth: setting up Firebase auth listener');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('useAuth: Firebase auth state changed', { hasUser: !!firebaseUser });

      if (!mounted) {
        console.log('useAuth: component unmounted, skipping');
        return;
      }

      if (firebaseUser) {
        console.log('useAuth: fetching profile for user', firebaseUser.uid);

        const shouldRefresh = !cachedProfile ||
                             cachedProfile.id !== firebaseUser.uid ||
                             lastUserId !== firebaseUser.uid;

        let profile = cachedProfile;

        if (shouldRefresh) {
          console.log('useAuth: refreshing profile from database');
          try {
            const { data: fetchedProfile, error: profileError } = await supabase
              .from("users")
              .select("*")
              .eq("id", firebaseUser.uid)
              .maybeSingle();

            console.log('useAuth: profile fetch result', {
              hasProfile: !!fetchedProfile,
              error: profileError?.message,
              profile: fetchedProfile
            });

            if (profileError) {
              console.error('useAuth: profile fetch error', profileError);
            } else if (fetchedProfile) {
              profile = fetchedProfile as User;
              cachedProfile = profile;
              lastUserId = firebaseUser.uid;
            }
          } catch (fetchError: any) {
            console.error('useAuth: profile fetch failed', fetchError);
          }
        } else {
          console.log('useAuth: using cached profile');
        }

        const combinedUser: AuthUser = {
          ...(profile as User || {}),
          id: firebaseUser.uid,
          email: firebaseUser.email || undefined,
          username: profile?.username || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || null,
          display_name: profile?.display_name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || null,
        };

        console.log('useAuth: setting user', {
          username: combinedUser.username,
          display_name: combinedUser.display_name,
          fullUser: combinedUser
        });

        setAuthState({
          user: combinedUser,
          loading: false,
        });
      } else {
        console.log('useAuth: clearing user (no Firebase session)');
        cachedProfile = null;
        lastUserId = null;
        setAuthState({ user: null, loading: false });
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return authState;
}
