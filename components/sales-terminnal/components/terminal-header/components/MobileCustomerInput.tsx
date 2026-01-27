// Mobile-specific customer input with search
import React, { useState } from "react";
import { Search, XCircle, User } from "lucide-react";

interface MobileCustomerInputProps {
  customerName: string;
  isCustomerSelected: boolean;
  onSearchOpen: () => void;
  onClearCustomer: () => void;
}

export const MobileCustomerInput = ({
  customerName,
  isCustomerSelected,
  onSearchOpen,
  onClearCustomer,
}: MobileCustomerInputProps) => {
  return (
    <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg border border-slate-700/50 px-2 py-1.5">
      <User className="w-4 h-4 text-slate-400 shrink-0" />
      <input
        type="text"
        readOnly
        placeholder="Walk-in Customer"
        value={customerName || ""}
        onClick={onSearchOpen}
        className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none cursor-pointer min-w-0"
      />
      {isCustomerSelected ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClearCustomer();
          }}
          className="p-1 hover:bg-red-500/20 rounded-full text-slate-400 hover:text-red-400 transition-colors"
        >
          <XCircle className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onSearchOpen}
          className="p-1 hover:bg-cyan-500/20 rounded-full text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
