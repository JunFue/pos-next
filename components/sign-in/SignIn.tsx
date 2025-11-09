"use client";

import { useState } from "react";
// 1. Import Supabase client and new icons

import { Mail, Lock, LogIn, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// 2. Add 'onSuccess' to the props
interface SignInProps {
  onSwitchToSignUp: () => void;
  onSuccess: () => void; // This will be the 'closeModal' function
}

export function SignIn({ onSwitchToSignUp, onSuccess }: SignInProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 3. Add loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 4. Update handleSubmit to be async and use Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      console.log("Sign in successful:", data.session);
      onSuccess(); // Call the function to close the modal
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error creating store:", err);
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-6">
      <div className="p-8 rounded-2xl w-full max-w-md glass-effect">
        <h2 className="mb-8 font-bold text-white text-3xl text-center">
          Sign In
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            {/* ... (email input is unchanged) ... */}
            <label
              htmlFor="email"
              className="block mb-2 font-medium text-slate-300 text-sm"
            >
              Email
            </label>
            <div className="relative">
              <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                <Mail className="w-5 h-5 text-slate-400" />
              </span>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full input-dark" // Use pl-10 for icon padding
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            {/* ... (password input is unchanged) ... */}
            <label
              htmlFor="password"
              className="block mb-2 font-medium text-slate-300 text-sm"
            >
              Password
            </label>
            <div className="relative">
              <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                <Lock className="w-5 h-5 text-slate-400" />
              </span>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full input-dark" // Use pl-10 for icon padding
                required
              />
            </div>
          </div>

          {/* 5. Show error message if it exists */}
          {error && (
            <div className="flex items-center gap-2 text-red-300 text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* 6. Update Submit Button to show loading state */}
          <button
            type="submit"
            className="flex justify-center items-center gap-2 w-full btn-3d-glass"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span>{loading ? "Signing In..." : "Sign In"}</span>
          </button>
        </form>

        {/* 2. Add the "Switch to Sign Up" link (unchanged) */}
        <p className="pt-6 text-slate-300 text-sm text-center">
          First time user?{" "}
          <button
            onClick={onSwitchToSignUp}
            className="font-medium text-blue-300 hover:text-blue-200"
          >
            Sign up with your company code.
          </button>
        </p>
      </div>
    </div>
  );
}
