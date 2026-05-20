"use client";

import { useState } from "react";
import { ShieldAlert, ArrowRight, LifeBuoy, Clock, Smartphone, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { requestFreeTrial } from "@/app/actions/subscription";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface SubscriptionRequiredProps {
  storeId: string;
  hasPendingTrial: boolean;
  hasPendingSubscription: boolean;
}

const SubscriptionRequired = ({ storeId, hasPendingTrial, hasPendingSubscription }: SubscriptionRequiredProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRequestingTrial, setIsRequestingTrial] = useState(false);
  const [trialRequested, setTrialRequested] = useState(hasPendingTrial);
  const [errorObj, setErrorObj] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const supabase = createClient();
      await supabase.auth.refreshSession();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  const handleRequestTrial = async () => {
    setIsRequestingTrial(true);
    setErrorObj(null);
    try {
      const result = await requestFreeTrial(storeId);
      if (result.success) {
        setTrialRequested(true);
      } else {
        setErrorObj("Failed to request trial. Please try again.");
      }
    } catch (err: any) {
      setErrorObj(err.message || "An error occurred");
    } finally {
      setIsRequestingTrial(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="relative bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl">
          <ShieldAlert className="w-16 h-16 text-blue-500" />
        </div>
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-white mb-4 font-lexend">
        Subscription Required
      </h1>
      
      <p className="text-zinc-400 max-w-md text-lg mb-10 leading-relaxed">
        To access this feature and continue using PUNCH POS, you need an active subscription or a free trial.
      </p>

      <div className="grid gap-4 w-full max-w-sm">
        {trialRequested ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl text-center mb-2 animate-fade-in">
            <div className="flex justify-center mb-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold text-emerald-400 mb-2">Trial Request Submitted</h3>
            <p className="text-xs text-emerald-500/80">
              Your 7-day free trial request is pending approval. You will gain access once approved by our team.
            </p>
          </div>
        ) : hasPendingSubscription ? (
          <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-xl text-center mb-2 animate-fade-in">
            <div className="flex justify-center mb-3">
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-sm font-bold text-blue-400 mb-2">Subscription Request Pending</h3>
            <p className="text-xs text-blue-500/80">
              Your subscription request is being reviewed. Access will be granted shortly after approval.
            </p>
          </div>
        ) : (
          <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-xl text-left mb-2">
            <h3 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-500" />
              Quick &amp; Easy Setup
            </h3>
            <div className="space-y-2 text-sm text-zinc-500">
              <div className="flex gap-3 items-start">
                <span className="text-blue-500 font-bold text-xs mt-0.5">1</span>
                <span>Choose your plan (Monthly or Annual)</span>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-blue-500 font-bold text-xs mt-0.5">2</span>
                <span>Send payment to our GCash number</span>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-blue-500 font-bold text-xs mt-0.5">3</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  Approved within 30 min – 1 hour
                </span>
              </div>
            </div>
          </div>
        )}

        {errorObj && (
          <p className="text-red-500 text-sm">{errorObj}</p>
        )}

        {!trialRequested && !hasPendingSubscription && (
          <button
            onClick={handleRequestTrial}
            disabled={isRequestingTrial}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 px-6 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {isRequestingTrial ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            Request 7-Day Free Trial
          </button>
        )}

        <Link 
          href="/settings?tab=subscription" 
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-6 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20"
        >
          Go to Subscription Settings
          <ArrowRight className="w-5 h-5" />
        </Link>
        
        <Link 
          href="mailto:junelfuentes.02@gmail.com" 
          className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-semibold py-4 px-6 rounded-xl transition-all active:scale-[0.98]"
        >
          <LifeBuoy className="w-5 h-5" />
          Contact Support
        </Link>
      </div>

      <div className="mt-12 pt-8 border-t border-zinc-800/50 w-full max-w-xs">
        <p className="text-zinc-500 text-sm">
          Already submitted payment?{" "}
          <button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="text-blue-500 hover:underline font-medium disabled:opacity-50"
          >
            {isRefreshing ? "Refreshing..." : "Refresh page"}
          </button>
        </p>
      </div>
    </div>
  );
};

export { SubscriptionRequired };
