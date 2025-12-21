// LowStockSettings.tsx

"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { AlertTriangle, Save } from "lucide-react";
import { useState, useEffect } from "react";

export default function LowStockSettings() {
  const { lowStockThreshold, setLowStockThreshold } = useSettingsStore();
  const [localValue, setLocalValue] = useState<string>(lowStockThreshold.toString());

  // Sync local state if store changes externally
  useEffect(() => {
    setLocalValue(lowStockThreshold.toString());
  }, [lowStockThreshold]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleSave = () => {
    const parsed = parseInt(localValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setLowStockThreshold(parsed);
      alert("Settings saved successfully!"); 
    } else {
      // Reset if invalid
      setLocalValue(lowStockThreshold.toString());
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
        <div className="flex justify-center items-center bg-orange-500/10 rounded-lg w-10 h-10 text-orange-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-lg text-white">Inventory Alerts</h2>
          <p className="text-slate-400 text-sm">Manage low stock notifications</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <label className="block mb-2 font-medium text-slate-400 text-sm">
            Global Low Stock Threshold
          </label>
          <div className="flex items-end gap-4">
            <div className="flex-1">
                <input
                type="number"
                min="0"
                value={localValue}
                onChange={handleChange}
                className="bg-slate-800/50 focus:bg-slate-800 border border-slate-700 focus:border-cyan-500/50 px-4 py-3 rounded-xl w-full text-slate-200 transition-all outline-none"
                />
            </div>
            
            <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 px-4 py-3 border border-cyan-500/50 rounded-xl font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
                <Save className="w-4 h-4" />
                Save
            </button>
          </div>
          <p className="mt-3 text-slate-500 text-sm">
            Items with stock below this value will be flagged as low stock. This value will be used as the default for new items.
          </p>
        </div>
      </div>
    </div>
  );
}