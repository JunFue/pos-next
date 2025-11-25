"use client";

import { TrendingDown, Brain } from "lucide-react";

export function DashboardStats() {
  return (
    <div className="gap-8 grid grid-cols-1 md:grid-cols-2 mt-10">
      {/* LEFT COLUMN */}
      <div className="flex flex-col gap-6">
        <div className="bg-slate-900/50 hover:bg-slate-900/80 p-8 border border-slate-800 rounded-2xl transition-colors glass-effect">
          <h3 className="font-semibold text-slate-400 text-sm uppercase tracking-wider">
            Total Customers
          </h3>
          <p className="mt-4 font-bold text-white text-6xl tracking-tighter">
            10,238
          </p>
          <p className="flex items-center gap-2 mt-3 font-medium text-green-400 text-base">
            <TrendingDown className="w-5 h-5 rotate-180" />
            +12% from last month
          </p>
        </div>

        <div className="bg-slate-900/50 hover:bg-slate-900/80 p-8 border border-slate-800 rounded-2xl transition-colors glass-effect">
          <h3 className="font-semibold text-slate-400 text-sm uppercase tracking-wider">
            Daily Sales
          </h3>
          <p className="mt-4 font-bold text-white text-6xl tracking-tighter">
            $73,495
          </p>
          <p className="flex items-center gap-2 mt-3 text-slate-400 text-base">
            <span className="bg-yellow-500 rounded-full w-2 h-2"></span>
            Pending validation: 4
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col gap-6">
        <div className="flex-1 bg-gradient-to-b from-slate-900/50 to-slate-900/80 p-8 border border-slate-800 rounded-2xl glass-effect">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-cyan-400" />
            <h3 className="font-semibold text-slate-200">JunFue Chat</h3>
          </div>
          <div className="space-y-4 text-slate-300">
            <div className="flex items-start gap-3">
              <div className="bg-cyan-500 mt-2 rounded-full w-1.5 h-1.5 shrink-0"></div>
              <p className="text-sm leading-relaxed">
                System optimization recommended for inventory module.
              </p>
            </div>
          </div>
        </div>

        <button className="group hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(6,189,212,0.15)] p-4 border border-slate-700 hover:border-cyan-500 rounded-xl w-full font-semibold text-white text-lg transition-all glass-effect">
          See More Details
        </button>
      </div>
    </div>
  );
}
