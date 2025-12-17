"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SessionMonitor() {
  useEffect(() => {
    // We create a client instance inside the effect to ensure browser context
    const supabase = createClient();

    const handleVisibilityChange = async () => {
      // Only run this when the user comes BACK to the tab
      if (document.visibilityState === "visible") {
        console.log("⚡ Tab woke up. Checking Supabase session...");
        
        // Check if session is valid; if not, force a refresh
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.warn("⚠️ Session stale. Attempting auto-refresh...");
          await supabase.auth.refreshSession();
        } else {
          // Optional: You can force a refresh anyway just to be safe
          // await supabase.auth.refreshSession();
          console.log("✅ Session is active.");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup the listener when the component unmounts
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null; // This component is invisible
}