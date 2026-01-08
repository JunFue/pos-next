import React, { useState } from "react";
import { User } from "lucide-react";
import { useCustomerStore } from "../store/useCustomerStore";
import { useCustomerData, useCustomerMutations } from "../hooks/useCustomerData";
import { createCustomer } from "../api/services"; // Ensure this import exists
import { CustomerFormValues } from "../lib/types";

export const RegisterCustomerModal = () => {
  const { isCustomerModalOpen, closeCustomerModal } = useCustomerStore();
  const { groups } = useCustomerData();
  const { refreshData } = useCustomerMutations();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CustomerFormValues>({
    full_name: "",
    phone_number: "",
    group_id: "",
  });

  if (!isCustomerModalOpen) return null;

  // Inside RegisterCustomerModal.tsx handle submit
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = { ...form };
      
      // Still required: Remove group_id if it's empty
      if (!payload.group_id) delete payload.group_id;

      // NO NEED to add store_id or admin_id here anymore
      await createCustomer(payload);
      
      await refreshData();
      setForm({ full_name: "", phone_number: "", group_id: "" });
      closeCustomerModal();
    } catch (error) {
      console.error("Failed to register customer", error);
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 w-[450px] shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Register Customer</h3>
          <button onClick={closeCustomerModal}>
            <User size={20} className="text-gray-500 hover:text-white transition" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Full Name
            </label>
            <input
              required
              autoFocus
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 focus:border-emerald-500 outline-none text-white"
              placeholder="Juan Dela Cruz"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Phone Number
            </label>
            <input
              value={form.phone_number}
              onChange={(e) =>
                setForm({ ...form, phone_number: e.target.value })
              }
              className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 focus:border-emerald-500 outline-none text-white"
              placeholder="0917..."
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Assign to Group
            </label>
            <select
              value={form.group_id}
              onChange={(e) => setForm({ ...form, group_id: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 focus:border-emerald-500 outline-none text-white appearance-none"
            >
              <option value="">-- Ungrouped --</option>
              {groups?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={closeCustomerModal}
              className="flex-1 py-3 bg-gray-700 rounded-xl font-bold text-gray-300 hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition flex justify-center items-center"
            >
              {loading ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};