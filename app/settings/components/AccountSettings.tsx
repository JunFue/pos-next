"use client";

import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, User, Mail } from "lucide-react";

const AccountSettings = () => {
  const { user, signOut } = useAuthStore();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header Section - Matches SubscriptionSettings Header */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-slate-800 border-b">
        <div className="flex justify-center items-center bg-cyan-500/10 rounded-lg w-10 h-10 text-cyan-400">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-white text-lg">Account</h2>
          <p className="text-slate-400 text-sm">
            Manage your account and session
          </p>
        </div>
      </div>

      {/* Content Card - Matches the 'Status Card' style in SubscriptionSettings */}
      <div className="bg-slate-800/50 p-6 border border-slate-700 rounded-xl">
        <div className="flex md:flex-row flex-col justify-between md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 border border-slate-800 rounded-full text-cyan-400">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-slate-400 text-sm uppercase tracking-wider">
                Email Address
              </p>
              <p className="font-semibold text-white text-lg">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="flex justify-center items-center gap-2 bg-red-500/10 hover:bg-red-500/20 px-6 py-3 border border-red-500/20 rounded-lg font-medium text-red-500 active:scale-[0.98] transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
