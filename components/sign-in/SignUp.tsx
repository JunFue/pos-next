"use client";

import { useState } from "react";

import {
  Mail,
  Lock,
  User,
  Hash,
  LogIn,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// Prop to allow switching back to the sign-in modal
interface SignUpProps {
  onSwitchToSignIn: () => void;
}

export function SignUp({ onSwitchToSignIn }: SignUpProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState(""); // Added Job Title state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enrollmentId, setEnrollmentId] = useState(""); // Renamed from companyCode

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Step 1: Sign up the new user and pass ALL custom data (including enrollment ID)
      // The Supabase trigger will use this 'data' object to populate the members table.
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            signup_type: "member", // Crucial for the SQL trigger function
            role: "member", // Assign member role in public.users
            first_name: firstName,
            last_name: lastName,
            contact_email: email, // Use email as contact_email for member
            job_title: jobTitle,
            enrollment_id: enrollmentId, // This is the company code/ID needed
          },
        },
      });

      if (authError) {
        // Supabase error messages often indicate the exact problem (e.g., invalid enrollment_id)
        throw authError;
      }

      // If signup is successful, the trigger has already run and created the member record.

      // All steps successful!
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error creating account:", err);
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
          Create Member Account
        </h2>

        {success ? (
          <div className="text-green-300 text-center">
            <p className="font-semibold">Success!</p>
            <p>
              A confirmation email has been sent. You can sign in once
              confirmed.
            </p>
            <button
              onClick={onSwitchToSignIn}
              className="mt-4 font-medium text-blue-300 hover:text-blue-200"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div className="relative">
              <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                <User className="w-5 h-5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="pl-10 w-full input-dark"
                required
              />
            </div>

            {/* Last Name */}
            <div className="relative">
              <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                <User className="w-5 h-5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="pl-10 w-full input-dark"
                required
              />
            </div>

            {/* Job Title */}
            <div className="relative">
              <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                {/* Reusing User icon, or maybe a Briefcase icon if available */}
                <User className="w-5 h-5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Job Title (e.g., Sales Associate)"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="pl-10 w-full input-dark"
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                <Mail className="w-5 h-5 text-slate-400" />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full input-dark"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                <Lock className="w-5 h-5 text-slate-400" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full input-dark"
                required
              />
            </div>

            {/* Enrollment ID (previously Company Code) */}
            <div className="relative">
              <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                <Hash className="w-5 h-5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Enrollment ID (e.g., A7B2C9)"
                value={enrollmentId}
                onChange={(e) => setEnrollmentId(e.target.value)}
                className="pl-10 w-full input-dark"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-300 text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
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
              <span>{loading ? "Creating..." : "Create Account"}</span>
            </button>

            {/* Switch to Sign In */}
            <p className="pt-4 text-slate-300 text-sm text-center">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="font-medium text-blue-300 hover:text-blue-200"
              >
                Sign In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
