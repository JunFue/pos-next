// SignIn.tsx (Refactored with useMutation)

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// 1. Import useMutation from TanStack Query
import { useMutation } from "@tanstack/react-query";

import { Mail, Lock, LogIn, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// Import schema and type from types.ts
import { signInSchema, SignInFormValues } from "@/lib/types";

interface SignInProps {
  onSwitchToSignUp: () => void;
  onSuccess: () => void;
}

// 2. Define the asynchronous sign-in function outside the component
const signInUser = async (values: SignInFormValues) => {
  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (error) {
    // TanStack Query relies on thrown errors to set the 'isError' state
    throw error;
  }
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
      console.log("Sign in successful.");
      onSuccess();
    },
    onError: (err: Error) => {
      // 5. Use RHF's setError to show the server-side error message
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
