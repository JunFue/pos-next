import React from "react";
import { Folder, FolderPlus, Layers, Trash2, Users } from "lucide-react";
import { useCustomerStore } from "../store/useCustomerStore";
import { useCustomerData, useCustomerMutations } from "../hooks/useCustomerData";
import { deleteGroup } from "../api/services";

export const CustomerSidebar = () => {
  const { groups } = useCustomerData();
  const { refreshData } = useCustomerMutations();
  const { selectedGroupId, setSelectedGroupId, openGroupModal } = useCustomerStore();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete group?")) return;
    await deleteGroup(id);
    refreshData();
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-5 border-b border-gray-700 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-gray-100">Groups</h2>
          <button onClick={openGroupModal} className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition">
            <FolderPlus size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {/* Static Filters */}
        <button onClick={() => setSelectedGroupId("all")} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedGroupId === "all" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700"}`}>
          <Layers size={18} /> <span className="font-medium">All Customers</span>
        </button>
        <button onClick={() => setSelectedGroupId("ungrouped")} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedGroupId === "ungrouped" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700"}`}>
          <Users size={18} /> <span className="font-medium">Ungrouped</span>
        </button>

        <div className="border-t border-gray-700 my-4 mx-2"></div>
        
        {/* Dynamic Groups */}
        {groups.map((g) => (
          <div key={g.id} className="group relative flex items-center mb-1">
            <button
              onClick={() => setSelectedGroupId(g.id)}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${selectedGroupId === g.id ? "bg-gray-700 text-white border-l-4 border-blue-500" : "text-gray-400 hover:bg-gray-700/50"}`}
            >
              <Folder size={18} className={g.is_shared ? "text-yellow-500" : "text-emerald-500"} />
              <span className="truncate flex-1">{g.name}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDelete(g.id); }} className="absolute right-2 p-1 text-gray-500 hover:text-red-400 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};