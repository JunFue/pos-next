// Mobile-specific customer input with search
import React from "react";
import { Search, XCircle, User } from "lucide-react";

interface MobileCustomerInputProps {
  customerName: string;
  isCustomerSelected: boolean;
  onSearchOpen: () => void;
  onClearCustomer: () => void;
  onCustomerNameChange: (name: string) => void;
}

export const MobileCustomerInput = ({
  customerName,
  isCustomerSelected,
  onSearchOpen,
  onClearCustomer,
  onCustomerNameChange,
}: MobileCustomerInputProps) => {
  return (
    <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg border border-slate-700/50 px-2 py-1.5 w-full">
      <User className="w-4 h-4 text-slate-400 shrink-0" />
      <input
        type="text"
        placeholder="Walk-in Customer"
        value={customerName || ""}
        onChange={(e) => onCustomerNameChange(e.target.value)}
        className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none min-w-0"
      />
      {isCustomerSelected || (customerName && customerName !== "Walk-in Customer") ? (
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
      ) : null}
      
      <button
        type="button"
        onClick={onSearchOpen}
        className="p-1 hover:bg-cyan-500/20 rounded-full text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <Search className="w-4 h-4" />
      </button>
    </div>
  );
};
