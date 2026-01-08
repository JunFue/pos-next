import React from "react";
import { Search, UserPlus } from "lucide-react";
import { useCustomerStore } from "../store/useCustomerStore";
import { useCustomerData } from "../hooks/useCustomerData";

export const CustomerHeader = () => {
  const { customers, currentGroupName } = useCustomerData();
  const { searchTerm, setSearchTerm, openCustomerModal } = useCustomerStore();

  return (
    <div className="h-20 border-b border-gray-700 flex items-center justify-between px-8 bg-gray-800/30 backdrop-blur-sm">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{currentGroupName}</h1>
        <p className="text-sm text-gray-400 mt-1">{customers.length} records found</p>
      </div>

      <div className="flex gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name..."
            className="bg-gray-800 border border-gray-600 rounded-xl py-2.5 pl-10 pr-4 w-full text-sm focus:border-blue-500 outline-none transition-all text-white"
          />
        </div>
        <button onClick={openCustomerModal} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95">
          <UserPlus size={18} /> Add Customer
        </button>
      </div>
    </div>
  );
};