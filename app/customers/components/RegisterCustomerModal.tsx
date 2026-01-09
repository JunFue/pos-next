import { useState } from "react";
import {
  User,
  Upload,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
} from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCustomerStore } from "../store/useCustomerStore";
import {
  useCustomerData,
  useCustomerMutations,
} from "../hooks/useCustomerData";
import { createCustomer } from "../api/services";
import { CustomerFormValues, customerSchema } from "../lib/types";

export const RegisterCustomerModal = () => {
  const { isCustomerModalOpen, closeCustomerModal } = useCustomerStore();
  const { groups } = useCustomerData();
  const { refreshData } = useCustomerMutations();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      email: "",
      address: "",
      remarks: "",
      group_id: "",
      birthdate: "",
      date_of_registration: new Date().toISOString().split("T")[0],
    },
  });

  if (!isCustomerModalOpen) return null;

  const onSubmit: SubmitHandler<CustomerFormValues> = async (data) => {
    setLoading(true);
    try {
      // Create a copy to manipulate
      const payload: Partial<CustomerFormValues> = { ...data };

      // Prevent Supabase from throwing error on empty string foreign key
      if (!payload.group_id) {
        delete payload.group_id;
      }

      await createCustomer(payload);
      await refreshData();
      reset();
      closeCustomerModal();
    } catch (error) {
      console.error("Failed to register customer:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-gray-800 shadow-2xl my-auto border border-gray-700 rounded-2xl w-full max-w-2xl overflow-hidden animate-in duration-200 zoom-in-95">
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-800/50 p-6 border-gray-700 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <User className="text-emerald-500" size={24} />
            </div>
            <h3 className="font-bold text-white text-xl">
              Register New Customer
            </h3>
          </div>
          <button
            onClick={closeCustomerModal}
            className="hover:bg-gray-700 p-1 rounded-md text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8">
          {/* Main Info Grid */}
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-bold text-gray-400 text-xs uppercase tracking-wider">
                Full Name <span className="text-emerald-500">*</span>
              </label>
              <input
                {...register("full_name")}
                className={`w-full bg-gray-900 border ${
                  errors.full_name ? "border-red-500" : "border-gray-600"
                } rounded-xl p-3 text-white focus:border-emerald-500 outline-none transition-all`}
                placeholder="Juan Dela Cruz"
              />
              {errors.full_name && (
                <p className="text-red-500 text-xs">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-bold text-gray-400 text-xs uppercase tracking-wider">
                <Phone size={12} /> Phone Number
              </label>
              <input
                {...register("phone_number")}
                className="bg-gray-900 p-3 border border-gray-600 focus:border-emerald-500 rounded-xl outline-none w-full text-white transition-all"
                placeholder="0917-000-0000"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-bold text-gray-400 text-xs uppercase tracking-wider">
                <Mail size={12} /> Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                className={`w-full bg-gray-900 border ${
                  errors.email ? "border-red-500" : "border-gray-600"
                } rounded-xl p-3 text-white focus:border-emerald-500 outline-none transition-all`}
                placeholder="juan@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-bold text-gray-400 text-xs uppercase tracking-wider">
                Assign Group
              </label>
              <select
                {...register("group_id")}
                className="bg-gray-900 p-3 border border-gray-600 focus:border-emerald-500 rounded-xl outline-none w-full text-white appearance-none cursor-pointer"
              >
                <option value="">-- Ungrouped --</option>
                {groups?.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates Grid */}
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-bold text-gray-400 text-xs uppercase tracking-wider">
                <Calendar size={12} /> Birthdate
              </label>
              <input
                {...register("birthdate")}
                type="date"
                className="bg-gray-900 p-3 border border-gray-600 focus:border-emerald-500 rounded-xl outline-none w-full text-white color-scheme-dark"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-bold text-gray-400 text-xs uppercase tracking-wider">
                Registration Date
              </label>
              <input
                {...register("date_of_registration")}
                type="date"
                className="bg-gray-900 p-3 border border-gray-600 focus:border-emerald-500 rounded-xl outline-none w-full text-white color-scheme-dark"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 font-bold text-gray-400 text-xs uppercase tracking-wider">
              <MapPin size={12} /> Address
            </label>
            <textarea
              {...register("address")}
              rows={2}
              className="bg-gray-900 p-3 border border-gray-600 focus:border-emerald-500 rounded-xl outline-none w-full text-white resize-none"
              placeholder="Full street address..."
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 font-bold text-gray-400 text-xs uppercase tracking-wider">
              <FileText size={12} /> Remarks
            </label>
            <textarea
              {...register("remarks")}
              rows={2}
              className="bg-gray-900 p-3 border border-gray-600 focus:border-emerald-500 rounded-xl outline-none w-full text-white resize-none"
              placeholder="Any internal notes or special requests..."
            />
          </div>

          {/* Document Upload Section */}
          <div className="space-y-2">
            <label className="font-bold text-gray-400 text-xs uppercase tracking-wider">
              Documents / ID Images
            </label>
            <div className="group relative hover:bg-emerald-500/5 p-6 border-2 border-gray-600 hover:border-emerald-500/50 border-dashed rounded-2xl transition-all cursor-pointer">
              <div className="flex flex-col justify-center items-center space-y-2">
                <div className="bg-gray-700 group-hover:bg-emerald-500/20 p-3 rounded-full transition-colors">
                  <Upload
                    className="text-gray-400 group-hover:text-emerald-500"
                    size={24}
                  />
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-300 text-sm">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-gray-500 text-xs">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              </div>
              <input
                type="file"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={closeCustomerModal}
              className="flex-1 bg-gray-700 hover:bg-gray-600 py-4 rounded-xl font-bold text-gray-200 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 shadow-emerald-900/20 shadow-lg py-4 rounded-xl font-bold text-white active:scale-95 transition-all disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="border-2 border-white/30 border-t-white rounded-full w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                "Register Customer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
