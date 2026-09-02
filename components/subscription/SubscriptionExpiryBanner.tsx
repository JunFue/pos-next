"use client";

import React, { useState, useEffect } from "react";
import { useSubscription } from "@/app/hooks/useSubscription";
import { AlertTriangle, Clock, ArrowRight, X, Sparkles } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";

export function SubscriptionExpiryBanner() {
  const { subscription, loading } = useSubscription();
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if dismissed in this session
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("pos_expiry_banner_dismissed");
      if (dismissed) {
        setIsDismissed(true);
      }
    }
  }, []);

  if (!mounted || loading || isDismissed || !subscription) {
    return null;
  }

  const status = (subscription.status || "").toUpperCase();
  const isActive = status === "PAID" || status === "TRIAL" || status === "ACTIVE";

  if (!isActive || !subscription.end_date) {
    return null;
  }

  const now = dayjs();
  const endDate = dayjs(subscription.end_date);
  const diffInHours = endDate.diff(now, "hour");
  const diffInDays = Math.ceil(endDate.diff(now, "hour") / 24);

  // Only alert if within 7 days (and not already past expiration)
  if (diffInHours < 0 || diffInDays > 7) {
    return null;
  }

  const isToday = diffInDays <= 0 || diffInHours <= 24;
  const isTomorrow = diffInDays === 1;
  const planType = (subscription.plan_type || "monthly").toUpperCase();
  const formattedEndDate = endDate.format("MMM D, YYYY");

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pos_expiry_banner_dismissed", "true");
    }
  };

  return (
    <div
      role="alert"
      className={`relative z-30 px-4 py-2.5 transition-all duration-300 border-b flex items-center justify-between gap-4 text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-top-2 shadow-sm ${
        isToday
          ? "bg-rose-500/15 border-rose-500/30 text-rose-300 backdrop-blur-md"
          : isTomorrow
          ? "bg-amber-500/15 border-amber-500/30 text-amber-300 backdrop-blur-md"
          : "bg-amber-500/10 border-amber-500/20 text-amber-400 backdrop-blur-md"
      }`}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            isToday
              ? "bg-rose-500/20 text-rose-400 animate-pulse"
              : "bg-amber-500/20 text-amber-400"
          }`}
        >
          {isToday ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <Clock className="w-4 h-4" />
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 truncate">
          <span className="font-bold uppercase tracking-wider text-[11px] px-1.5 py-0.5 rounded bg-black/30 border border-current/20 shrink-0">
            {isToday ? "Expires Today" : isTomorrow ? "Expires Tomorrow" : `${diffInDays} Days Left`}
          </span>

          <p className="truncate text-foreground/90">
            {isToday ? (
              <>
                <strong className="text-rose-400">Urgent Notice:</strong> Your{" "}
                <span className="font-bold text-foreground">{planType}</span> subscription expires today (
                {formattedEndDate}). Renew now to prevent POS downtime.
              </>
            ) : isTomorrow ? (
              <>
                <strong className="text-amber-400">Action Required:</strong> Your{" "}
                <span className="font-bold text-foreground">{planType}</span> subscription expires tomorrow (
                {formattedEndDate}). Renew early to ensure smooth operations.
              </>
            ) : (
              <>
                Your <span className="font-bold text-foreground">{planType}</span> subscription will expire in{" "}
                <strong className="text-amber-400">{diffInDays} days</strong> on{" "}
                <span className="font-semibold">{formattedEndDate}</span>.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/settings?tab=subscription"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 shadow-sm ${
            isToday
              ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
              : "bg-amber-600 hover:bg-amber-500 text-black shadow-amber-600/30"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Renew Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={handleDismiss}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          title="Dismiss banner for this session"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
