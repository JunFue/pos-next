"use client";

import { ShieldAlert, ArrowRight, LifeBuoy, Clock, Smartphone } from "lucide-react";
import Link from "next/link";

const SubscriptionRequired = () => {
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
        To access this feature and continue using PUNCH POS, you need an active subscription. 
        Pay via GCash and get approved within 30 minutes to 1 hour.
      </p>

      <div className="grid gap-4 w-full max-w-sm">
        {/* How it works */}
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
            onClick={() => window.location.reload()} 
            className="text-blue-500 hover:underline font-medium"
          >
            Refresh page
          </button>
        </p>
      </div>
    </div>
  );
};

export { SubscriptionRequired };
