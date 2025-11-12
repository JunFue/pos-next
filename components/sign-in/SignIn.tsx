// SignIn.tsx (Refactored with useMutation and Role-Check)

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Mail, Lock, LogIn, AlertTriangle, Loader2 } from "lucide-react";
// Fix: Use relative paths for imports as aliases are not resolving

import { signInSchema, SignInFormValues } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";

interface SignInProps {
  onSwitchToSignUp: () => void;
  onSuccess: () => void;
}

// 2. Define the asynchronous sign-in function
const signInUser = async (values: SignInFormValues) => {
  // 2a. Define the required role for this app
  const APP_TYPE = "member";

  // 2b. Sign in the user
  const { data: sessionData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

  if (signInError) {
    // If sign-in fails (e.g., wrong password), throw the error
    throw signInError;
  }

  if (!sessionData?.user) {
    // This should be impossible if signInError is null, but good to check
    throw new Error("Sign in successful but no user data found.");
  }

  // 2c. POST-LOGIN CHECK: Immediately fetch the user's role from public.users
  const { data: userData, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", sessionData.user.id)
    .single();

  if (profileError) {
    // User is signed in, but we can't get their profile. Sign them out.
    await supabase.auth.signOut();
    console.error("Error fetching user profile:", profileError.message);
    throw new Error("Could not verify user role. Please try again.");
  }

  // 2d. PERFORM THE ROLE CHECK
  if (userData.role !== APP_TYPE) {
    // Role mismatch! Sign the user out immediately.
    await supabase.auth.signOut();

    // Throw a specific error to be caught by useMutation's onError
    if (userData.role === "admin") {
      throw new Error("Access denied. Admins must sign in via the admin app.");
    } else {
      throw new Error(
        `Access denied. Your role (${userData.role}) is not 'member'.`
      );
    }
  }

  // 2e. If we get here, sign-in was successful AND role check passed.
  // The useMutation's onSuccess will now be called.
};

export function SignIn({ onSwitchToSignUp, onSuccess }: SignInProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 3. Setup useMutation
  const mutation = useMutation({
    mutationFn: signInUser,
    onSuccess: () => {
      // 4. Close the modal on successful sign-in
      console.log("Sign in successful and role verified.");
      onSuccess();
    },
    onError: (err: Error) => {
      // 5. Use RHF's setError to show the server-side error message
      // This will now catch both "Invalid login" and our custom "Access denied" errors
      console.error("Error signing in:", err);
      setFormError("root.serverError", {
        type: "server",
        message: err.message,
      });
    },
  });

  // 6. The onSubmit handler is simplified to just call mutation.mutate
  const onSubmit = (values: SignInFormValues) => {
    // Clear any previous server errors before submitting
    setFormError("root.serverError", { message: "" });
    mutation.mutate(values);
  };

  return (
    <div className="flex justify-center items-center p-6">
      <div className="p-8 rounded-2xl w-full max-w-md glass-effect">
        <h2 className="mb-8 font-bold text-white text-3xl text-center">
          Sign In
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Input */}
          <div>
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
                {...register("email")}
                className={`pl-10 w-full input-dark ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-red-300 text-sm">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
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
                {...register("password")}
                className={`pl-10 w-full input-dark ${
                  errors.password ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-2 text-red-300 text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* 7. Use mutation.isError and RHF errors for displaying the server message */}
          {mutation.isError && errors.root?.serverError && (
            <div className="flex items-center gap-2 text-red-300 text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>{errors.root.serverError.message}</span>
            </div>
          )}

          {/* 8. Use mutation.isPending for the button state */}
          <button
            type="submit"
            className="flex justify-center items-center gap-2 w-full btn-3d-glass"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span>{mutation.isPending ? "Signing In..." : "Sign In"}</span>
          </button>
        </form>

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
