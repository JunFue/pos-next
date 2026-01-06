"use client";

import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, User, Mail } from "lucide-react";

const AccountSettings = () => {
  const { user, signOut } = useAuthStore();

  if (!user) return null;

  return (
    <section className="relative p-8 rounded-2xl">
      {/* Background with glass effect */}
      <div className="absolute inset-0 bg-slate-900/50 border border-slate-800 rounded-2xl glass-effect" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
          <div className="flex justify-center items-center bg-blue-500/10 rounded-lg w-10 h-10 text-blue-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-white">Account</h2>
            <p className="text-slate-400 text-sm">Manage your account and session</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-800 rounded-full">
              <Mail className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Email Address</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all active:scale-[0.98] font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </section>
  );
};

export default AccountSettings;
