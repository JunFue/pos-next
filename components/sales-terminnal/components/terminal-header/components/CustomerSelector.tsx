import { User, Users, XCircle, Search } from "lucide-react";

interface CustomerSelectorProps {
  customerName: string;
  isCustomerSelected: boolean;
  onSearchOpen: () => void;
  onClearCustomer: (e: React.MouseEvent) => void;
}

export const CustomerSelector = ({
  customerName,
  isCustomerSelected,
  onSearchOpen,
  onClearCustomer,
}: CustomerSelectorProps) => {
  return (
    <div className="group flex flex-col my-3">
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold text-[10px] text-slate-500 uppercase tracking-widest">
          Customer
        </span>
        <span className="hidden group-hover:inline-block text-[9px] text-cyan-500/50 animate-pulse">
          ALT + F1 to Search
        </span>
      </div>

      <button
        onClick={onSearchOpen}
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-dashed transition-all duration-200 text-left ${
          isCustomerSelected
            ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-200"
            : "bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/80 hover:border-cyan-500/30 hover:text-cyan-100"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {isCustomerSelected ? (
            <Users className="w-4 h-4 shrink-0" />
          ) : (
            <User className="opacity-50 w-4 h-4 shrink-0" />
          )}
          <span
            className={`text-xs font-medium truncate ${
              isCustomerSelected ? "" : "italic"
            }`}
          >
            {customerName || "Walk-in Customer"}
          </span>
        </div>

        {isCustomerSelected ? (
          <div
            role="button"
            onClick={onClearCustomer}
            className="hover:bg-red-500/20 p-1 rounded-full text-cyan-500/50 hover:text-red-400 transition-colors"
          >
            <XCircle className="w-3 h-3" />
          </div>
        ) : (
          <Search className="opacity-0 group-hover:opacity-50 w-3 h-3" />
        )}
      </button>
    </div>
  );
};
