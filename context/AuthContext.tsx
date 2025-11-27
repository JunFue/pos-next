"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Initialize session on mount
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        // Mark auth as ready regardless of success/failure
        setIsAuthReady(true);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    // --- NEW: Handle Tab Sleep / Wake Up ---
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log("Tab woke up. Verifying session...");
        
        // 1. Try to get the user with a short timeout to detect "zombie" connections
        const timeoutMs = 2000;
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("AUTH_TIMEOUT")), timeoutMs)
        );

        try {
          // Race the getUser call against the timeout
          await Promise.race([
            supabase.auth.getUser(),
            timeoutPromise
          ]);
          // If we get here, connection is likely okay.
          // We can optionally refresh the session just to be safe if it's close to expiry,
          // but getUser() usually handles validation.
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          if (!error && currentSession) {
             setSession(currentSession);
          }
        } catch (err: any) {
          if (err.message === "AUTH_TIMEOUT") {
            console.warn("Auth check timed out (Zombie connection). Forcing session refresh...");
            // Force a refresh if possible, or just let the user know they might need to reload
            // Attempting to refresh session might also hang if the socket is dead, 
            // but it's worth a try or we can rely on the next user action to trigger re-auth.
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
            if (!refreshError && refreshedSession) {
               setSession(refreshedSession);
               console.log("Session recovered.");
            } else {
               console.error("Failed to recover session:", refreshError);
            }
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, []);

  const value: AuthContextType = {
    session,
    user: session?.user || null,
    isAuthenticated: !!session,
    isAuthReady,
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
