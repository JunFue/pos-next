"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle, AlertCircle, Clock, Sparkles } from "lucide-react";
import { useSubscription } from "@/app/hooks/useSubscription";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { subscription } = useSubscription();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute subscription expiry alert
  const status = (subscription?.status || "").toUpperCase();
  const isActive = status === "PAID" || status === "TRIAL" || status === "ACTIVE";
  const endDate = subscription?.end_date ? dayjs(subscription.end_date) : null;
  const daysRemaining = endDate
    ? Math.max(0, Math.ceil(endDate.diff(dayjs(), "hour") / 24))
    : 999;
  const isExpiringSoon = isActive && daysRemaining <= 7 && endDate && endDate.isAfter(dayjs().subtract(1, "day"));

  const alerts = [
    ...(isExpiringSoon && endDate
      ? [
          {
            id: "sub-expiry",
            title:
              daysRemaining === 0
                ? "⚠️ Subscription Expires Today!"
                : `⏳ Subscription Expiring in ${daysRemaining} Day${daysRemaining === 1 ? "" : "s"}`,
            time: `Expires on ${endDate.format("MMM D, YYYY")}`,
            type: daysRemaining <= 1 ? "alert" : "warning",
            action: () => {
              setIsOpen(false);
              router.push("/settings?tab=subscription");
            },
          },
        ]
      : []),
    { id: "mock-1", title: "New Order Received", time: "2 min ago", type: "success" },
    {
      id: "mock-2",
      title: "Inventory Low: Keycaps",
      time: "1 hour ago",
      type: "alert",
    },
    {
      id: "mock-3",
      title: "System Update Completed",
      time: "3 hours ago",
      type: "info",
    },
  ];

  const hasUrgent = isExpiringSoon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-slate-800/60 p-2 rounded-xl text-slate-400 hover:text-cyan-400 transition-all active:scale-95"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {hasUrgent && (
          <span className="top-1.5 right-1.5 absolute bg-red-500 border-2 border-[#0B1120] rounded-full w-2.5 h-2.5 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="right-0 z-50 absolute bg-[#0f172a]/95 backdrop-blur-xl shadow-2xl mt-4 border border-slate-700/50 rounded-2xl w-80 overflow-hidden origin-top-right animate-in duration-200 fade-in zoom-in-95 slide-in-from-top-2">
          <div className="flex justify-between items-center bg-slate-800/40 px-4 py-3 border-slate-700/50 border-b">
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
            <span className="text-xs text-slate-400">
              {alerts.length} alert{alerts.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={alert.action}
                className={`flex gap-3 px-4 py-3 border-slate-800/50 border-b last:border-0 transition-colors cursor-pointer group ${
                  alert.id === "sub-expiry"
                    ? "bg-amber-500/10 hover:bg-amber-500/20"
                    : "hover:bg-foreground/5"
                }`}
              >
                <div className="mt-1 shrink-0">
                  {alert.type === "success" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : alert.type === "alert" ? (
                    <AlertCircle className="w-4 h-4 text-rose-400 animate-pulse" />
                  ) : alert.type === "warning" ? (
                    <Clock className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Bell className="w-4 h-4 text-sky-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm transition-colors ${
                      alert.id === "sub-expiry"
                        ? "text-amber-300 group-hover:text-amber-200 font-bold"
                        : "text-slate-200 group-hover:text-white"
                    }`}
                  >
                    {alert.title}
                  </p>
                  <p className="mt-0.5 text-slate-500 text-xs flex items-center justify-between">
                    <span>{alert.time}</span>
                    {alert.id === "sub-expiry" && (
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        Renew →
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-slate-800/20 p-2 border-slate-700/50 border-t text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/settings?tab=subscription");
              }}
              className="w-full py-1.5 text-slate-400 hover:text-white text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Manage Subscription Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { Notifications };
