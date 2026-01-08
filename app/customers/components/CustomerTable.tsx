import React from "react";
import { Edit2 } from "lucide-react";
import { useCustomerData, useCustomerMutations } from "../hooks/useCustomerData";
import { updateCustomerGroup } from "../api/services";

export const CustomerTable = () => {
  const { customers, groups, isLoading } = useCustomerData();
  const { refreshData } = useCustomerMutations();

  const handleGroupChange = async (customerId: string, groupId: string) => {
    // Optimistic update could go here, but keeping it simple with refresh
    await updateCustomerGroup(customerId, groupId);
    refreshData();
  };

  if (isLoading) return <div className="text-gray-500 text-center mt-20">Loading...</div>;

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden flex flex-col">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-900/50 text-gray-400 text-xs font-bold uppercase">
            <tr>
              <th className="p-5">Name</th>
              <th className="p-5">Contact</th>
              <th className="p-5">Group</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-700/30 transition">
                <td className="p-5 font-medium text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                    {c.full_name.charAt(0).toUpperCase()}
                  </div>
                  {c.full_name}
                </td>
                <td className="p-5 text-gray-400">{c.phone_number || "-"}</td>
                <td className="p-5">
                  <select
                    value={c.group_id || "ungrouped"}
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
            {customers.length === 0 && (
              <tr><td colSpan={4} className="p-10 text-center text-gray-500">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};