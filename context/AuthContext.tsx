"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // 1. Initial Load
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error("Auth Init Error:", error);
      } finally {
        setIsAuthReady(true);
      }
    };

    initAuth();

    // 2. Listen for standard auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setIsAuthReady(true);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 3. Robust Sign Out with Storage Purge
  const signOut = async () => {
    try {
      // Race network vs 3s timer
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Logout request timed out")), 3000)
        )
      ]);
    } catch (error) {
      console.warn("Logout warning (likely network zombie):", error);
    } finally {
      // 1. Force React State Update
      setSession(null);

      // 2. CRITICAL: Manually purge Supabase tokens from LocalStorage
      // Supabase keys usually look like: sb-<project-id>-auth-token
      // We search for and remove any key starting with 'sb-'
      if (typeof window !== 'undefined') {
        Object.keys(window.localStorage).forEach((key) => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            window.localStorage.removeItem(key);
          }
        });
      }
    }
  };

  const value: AuthContextType = {
    session,
    user: session?.user || null,
    isAuthenticated: !!session,
    isAuthReady,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}