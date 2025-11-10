// SignUp.tsx (Refactored with useMutation)

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// 1. Import useMutation from TanStack Query
import { useMutation } from "@tanstack/react-query";

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

// Import schema and type from types.ts
import { signUpSchema, SignUpFormValues } from "@/lib/types";

interface SignUpProps {
  onSwitchToSignIn: () => void;
}

// 2. Define the asynchronous sign-up function outside the component
const signUpUser = async (values: SignUpFormValues) => {
  const { error: authError } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        signup_type: "member",
        role: "member",
        first_name: values.firstName,
        last_name: values.lastName,
        contact_email: values.email,
        job_title: values.jobTitle,
        enrollment_id: values.enrollmentId,
      },
    },
  });

  if (authError) {
    // TanStack Query relies on thrown errors to set the 'isError' state
    throw authError;
  }
};

export function SignUp({ onSwitchToSignIn }: SignUpProps) {
  // We keep the success state to show the post-signup message
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      jobTitle: "",
      email: "",
      password: "",
      enrollmentId: "",
    },
  });

  // 3. Setup useMutation
  const mutation = useMutation({
    mutationFn: signUpUser,
    onSuccess: () => {
      // 4. Show success message on successful sign-up
      setSuccess(true);
    },
    onError: (err: Error) => {
      // 5. Use RHF's setError to show the server-side error message
      console.error("Error creating account:", err);
      setFormError("root.serverError", {
        type: "server",
        message: err.message,
      });
    },
  });

  // 6. The onSubmit handler is simplified to just call mutation.mutate
  const onSubmit = (values: SignUpFormValues) => {
    // Clear any previous server errors and success state before submitting
    setFormError("root.serverError", { message: "" });
    setSuccess(false);
    mutation.mutate(values);
  };

  return (
    <div className="flex justify-center items-center p-6">
      <div className="p-8 rounded-2xl w-full max-w-md glass-effect">
        <h2 className="mb-8 font-bold text-white text-3xl text-center">
          Create Member Account
        </h2>

        {success ? (
          <div className="text-green-300 text-center">
            <p className="font-semibold">Success! 🎉</p>
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name */}
            <div>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <User className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="First Name"
                  {...register("firstName")}
                  className="pl-10 w-full input-dark"
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-red-300 text-sm">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <User className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Last Name"
                  {...register("lastName")}
                  className="pl-10 w-full input-dark"
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-red-300 text-sm">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Job Title */}
            <div>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <User className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Job Title (e.g., Sales Associate)"
                  {...register("jobTitle")}
                  className="pl-10 w-full input-dark"
                />
              </div>
              {errors.jobTitle && (
                <p className="mt-1 text-red-300 text-sm">
                  {errors.jobTitle.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="pl-10 w-full input-dark"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-red-300 text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <Lock className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="pl-10 w-full input-dark"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-red-300 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Enrollment ID */}
            <div>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <Hash className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Enrollment ID (e.g., A7B2C9)"
                  {...register("enrollmentId")}
                  className="pl-10 w-full input-dark"
                />
              </div>
              {errors.enrollmentId && (
                <p className="mt-1 text-red-300 text-sm">
                  {errors.enrollmentId.message}
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
              <span>
                {mutation.isPending ? "Creating..." : "Create Account"}
              </span>
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
