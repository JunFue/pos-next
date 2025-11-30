// handlers/terminal/logout.ts
// (This is the content you provided, placed in the correct directory)

import { supabase } from "@/lib/supabaseClient";

/**
 * Handles the user log out process using Supabase.
 * @returns {Promise<boolean>} True if logout was successful, false otherwise.
 */
export const handleLogOut = async (): Promise<boolean> => {
  console.log("Logout initiated: Starting handleLogOut...");

  const forceLogout = () => {
    console.warn("Logout timed out or failed. Forcing manual cleanup...");
    // Manually clear Supabase tokens from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sb-")) {
        localStorage.removeItem(key);
      }
    });
    // Force reload to clear memory state and redirect to login
    window.location.href = "/";
    return true;
  };

  try {
    console.log("Calling supabase.auth.signOut({ scope: 'local' })...");
    
    // Race the signOut against a 500ms timeout
    const signOutPromise = supabase.auth.signOut({ scope: 'local' });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Logout timed out")), 500)
    );

    await Promise.race([signOutPromise, timeoutPromise]);

    console.log("Logged out successfully. supabase.auth.signOut() returned no error.");
    // Even if successful, we might want to reload to be safe, but let's return true for now
    // and let the caller handle redirection if needed, or just reload here.
    // Given the issues, a reload is safest.
    window.location.href = "/";
    return true;

  } catch (err) {
    console.error("Log Out Error (or Timeout):", err);
    return forceLogout();
  }
};
