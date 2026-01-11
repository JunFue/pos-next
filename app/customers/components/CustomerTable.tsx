import React from "react";
import { Edit2 } from "lucide-react";
import { useCustomerData, useCustomerMutations } from "../hooks/useCustomerData";
import { useCustomerStore } from "../store/useCustomerStore"; // Import Store
import { updateCustomerGroup } from "../api/services";

export const CustomerTable = () => {
  const { customers, groups, isLoading } = useCustomerData();
  const { refreshData } = useCustomerMutations();
  
  // [NEW] Destructure actions
  const { setViewMode, setSelectedCustomerId } = useCustomerStore(); 

  const handleGroupChange = async (customerId: string, groupId: string) => {
    await updateCustomerGroup(customerId, groupId);
    refreshData();
  };

  // [NEW] Click Handler
  const handleCustomerClick = (id: string) => {
    setSelectedCustomerId(id);
    setViewMode("detail");
  };

  if (isLoading) return <div className="text-gray-500 text-center mt-20">Loading...</div>;

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden flex flex-col h-full"> {/* Added h-full */}
      <div className="overflow-x-auto w-full h-full">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-900/50 text-gray-400 text-xs font-bold uppercase sticky top-0 z-10 backdrop-blur-sm"> {/* Added sticky header */}
            <tr>
              <th className="p-5">Name</th>
              <th className="p-5">Contact</th>
              <th className="p-5">Group</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-700/30 transition group">
                <td className="p-5 font-medium text-white">
                  {/* [NEW] Button wrapper for name */}
                  <button 
                    onClick={() => handleCustomerClick(c.id)}
                    className="flex items-center gap-3 text-left w-full hover:text-blue-400 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {c.full_name.charAt(0).toUpperCase()}
                    </div>
                    {c.full_name}
                  </button>
                </td>
                <td className="p-5 text-gray-400">{c.phone_number || "-"}</td>
                {/* ... existing rows ... */}
                <td className="p-5">
                   <select
                    value={c.group_id || "ungrouped"}
                    onClick={(e) => e.stopPropagation()} // Prevent row click
                    onChange={(e) => handleGroupChange(c.id, e.target.value)}
                    className="bg-gray-900 border border-gray-700 text-xs text-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                  >
                    <option value="ungrouped">Ungrouped</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </td>
                <td className="p-5 text-right">
                  <button className="text-gray-400 hover:text-white"><Edit2 size={16} /></button>
                </td>
              </tr>
            ))}
            {/* ... */}
          </tbody>
        </table>
      </div>
    </div>
  );
};