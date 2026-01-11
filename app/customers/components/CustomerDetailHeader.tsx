import React from "react";
import { ArrowLeft, Search, Edit, CreditCard } from "lucide-react";
import { useCustomerStore } from "../store/useCustomerStore";
import { useCustomerData } from "../hooks/useCustomerData";

export const CustomerDetailHeader = () => {
  const { selectedCustomer } = useCustomerData();
  const { setViewMode, setSelectedCustomerId } = useCustomerStore();

  const handleBack = () => {
    setViewMode("list");
    setSelectedCustomerId(null);
  };

  if (!selectedCustomer) return null;

  return (
    <div className="flex justify-between items-center bg-gray-800/30 backdrop-blur-sm p-2 px-6 border-gray-700 border-b h-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={handleBack}
          className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div>
          <h1 className="font-bold text-white text-2xl tracking-tight">
            {selectedCustomer.full_name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${selectedCustomer.group_id ? 'bg-blue-400' : 'bg-gray-500'}`} />
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">
              {selectedCustomer.group ? (selectedCustomer.group as any).name : "Ungrouped"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Dummy Invoice Search */}
        <div className="relative group">
          <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-500 group-focus-within:text-blue-400 -translate-y-1/2 transition-colors" />
          <input
            placeholder="Search invoices..."
            className="bg-gray-900 focus:bg-gray-800 py-2.5 pr-4 pl-10 border border-gray-700 focus:border-blue-500/50 rounded-xl outline-none w-64 text-white text-sm transition-all"
          />
        </div>

        <button
          onClick={() => console.log("Open Update Modal")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 shadow-lg px-5 py-2.5 rounded-xl font-bold text-white text-sm hover:scale-105 active:scale-95 transition-all"
        >
          <Edit size={16} /> Update Info
        </button>
      </div>
    </div>
  );
};