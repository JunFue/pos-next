"use client";

import VoucherSettings from "./components/VoucherSettings";
import SubscriptionSettings from "./components/SubscriptionSettings";
import CurrencySelector from "./components/CurrencySelector";
import LowStockSettings from "./components/LowStockSettings";
import PriceEditingSettings from "./components/PriceEditingSettings";
import AccountSettings from "./components/AccountSettings";
import { Settings, CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 mb-4 px-4 py-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-200 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-cyan-500/50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <h1 className="flex items-center gap-3 font-bold text-3xl text-white">
          <Settings className="w-8 h-8 text-cyan-400" />
          Settings
        </h1>
        <p className="mt-2 text-slate-400">Manage your application preferences and configurations.</p>
      </div>
      
      <div className="space-y-8">
        {/* Account Settings Section */}
        <AccountSettings />

        {/* General Settings Section */}
        <section className="relative p-8 rounded-2xl">
          {/* Background with glass effect */}
          <div className="absolute inset-0 bg-slate-900/50 border border-slate-800 rounded-2xl glass-effect" />
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
              <div className="flex justify-center items-center bg-cyan-500/10 rounded-lg w-10 h-10 text-cyan-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-white">General Preferences</h2>
                <p className="text-slate-400 text-sm">Customize your viewing experience</p>
              </div>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2">
              <CurrencySelector />
            </div>
          </div>
        </section>

        {/* Subscription Settings Section */}
        <section className="bg-slate-900/50 p-8 border border-slate-800 rounded-2xl glass-effect">
           <SubscriptionSettings />
        </section>

        {/* Voucher Settings Section */}
        <section className="bg-slate-900/50 p-8 border border-slate-800 rounded-2xl glass-effect">
           <VoucherSettings />
        </section>

        {/* Low Stock Settings Section */}
        <section className="bg-slate-900/50 p-8 border border-slate-800 rounded-2xl glass-effect">
           <LowStockSettings />
        </section>

        {/* Price Editing Settings Section */}
        <section className="bg-slate-900/50 p-8 border border-slate-800 rounded-2xl glass-effect">
           <PriceEditingSettings />
        </section>
      </div>
    </div>
  );
}
