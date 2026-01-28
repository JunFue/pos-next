"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Hash, Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { linkUserToStore } from "@/app/actions/onboarding";

const onboardingSchema = z.object({
  enrollmentId: z.string().min(1, "Enrollment ID is required"),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const [isPending, setIsPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
  });

  const onSubmit = async (values: OnboardingFormValues) => {
    setFormError("root.serverError", { message: "" });
    setIsPending(true);
    try {
      const result = await linkUserToStore(values.enrollmentId);
      if (!result.success) {
        throw new Error(result.error);
      }
      // Redirect handled by server action or client side
      window.location.href = "/";
    } catch (err) {
      console.error("Error linking to store:", err);
      setFormError("root.serverError", {
        type: "server",
        message: (err as Error).message,
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1120] p-6 text-white">
      <div className="w-full max-w-md p-8 rounded-2xl glass-effect">
        <h2 className="mb-2 font-bold text-3xl text-center">
          Welcome! 👋
        </h2>
        <p className="mb-8 text-slate-400 text-center">
          To complete your setup, please enter your Company Code (Enrollment ID).
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="enrollmentId"
              className="block mb-2 font-medium text-slate-300 text-sm"
            >
              Company Code
            </label>
            <div className="relative">
              <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                <Hash className="w-5 h-5 text-slate-400" />
              </span>
              <input
                type="text"
                id="enrollmentId"
                placeholder="e.g. A7B2C9"
                {...register("enrollmentId")}
                className={`pl-10! w-full input-dark ${
                  errors.enrollmentId ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.enrollmentId && (
              <p className="mt-2 text-red-300 text-sm">
                {errors.enrollmentId.message}
              </p>
            )}
          </div>

          {errors.root?.serverError && (
            <div className="flex items-center gap-2 text-red-300 text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>{errors.root.serverError.message}</span>
            </div>
          )}

          <button
            type="submit"
            className="flex justify-center items-center gap-2 w-full btn-3d-glass"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
            <span>{isPending ? "Joining..." : "Join Store"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
