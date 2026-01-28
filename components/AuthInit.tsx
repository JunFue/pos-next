"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthInit({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  
  useEffect(() => {
    // 1. Run initial auth check
    initializeAuth();

    // Removed aggressive focus listener that was causing page reloads
  }, [initializeAuth]);

  return <>{children}</>;
}