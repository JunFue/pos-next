"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

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

  // CHANGED: Create the client inside the component (or use a singleton helper)
  // This uses the browser's cookies automatically.
  const supabase = createClient();

  useEffect(() => {
    // 1. Initial Load
    const initAuth = async () => {
      try {
        // CHANGED: Use getUser() instead of getSession() for security
        // getSession() just checks the cookie/localstorage structure.
        // getUser() validates the token with the Supabase server.
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (user) {
          // If we have a user, get the session to match the type signature
          // (Though in many apps you just need the user)
          const {
            data: { session },
          } = await supabase.auth.getSession();
          setSession(session);
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error("Auth Init Error:", error);
      } finally {
        setIsAuthReady(true);
      }
    };

    initAuth();

    // 2. Listen for standard auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsAuthReady(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 3. Sign Out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      // NOTE: With the cookie-based SSR setup, you no longer need the
      // complex LocalStorage purge logic. The server/middleware will
      // handle cookie removal automatically on the next request.
    } catch (error) {
      console.error("Error signing out:", error);
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
