"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { Lock, Unlock } from "lucide-react";

export default function PriceEditingSettings() {
  const { isPriceEditingEnabled, setPriceEditingEnabled } = useSettingsStore();

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold mb-2 text-white">
        Custom Price Editing
      </h2>
      <p className="text-slate-400 mb-6 text-sm">
        Enable or disable the ability to edit unit prices directly in the sales terminal.
      </p>

      <div
        className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
          isPriceEditingEnabled
            ? "border-cyan-500/50 bg-cyan-500/10"
            : "border-slate-700 bg-slate-800/50 hover:bg-slate-800"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isPriceEditingEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-400'}`}>
            {isPriceEditingEnabled ? <Unlock size={20} /> : <Lock size={20} />}
          </div>
          <div>
            <p className={`font-medium ${isPriceEditingEnabled ? 'text-cyan-400' : 'text-slate-300'}`}>
              {isPriceEditingEnabled ? 'Price Editing Enabled' : 'Price Editing Disabled'}
            </p>
            <p className="text-xs text-slate-500">
              {isPriceEditingEnabled 
                ? 'Unit prices can be modified in the terminal' 
                : 'Unit prices are locked to inventory values'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setPriceEditingEnabled(!isPriceEditingEnabled)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isPriceEditingEnabled
              ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          {isPriceEditingEnabled ? 'Disable' : 'Enable'}
        </button>
      </div>
    </div>
  );
}
