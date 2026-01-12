import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Save, Loader2 } from "lucide-react";
import { Customer, customerSchema, CustomerFormValues } from "../lib/types";
import { updateCustomer } from "../api/services";
import { useCustomerData } from "../hooks/useCustomerData";

interface UpdateCustomerModalProps {
  customer: Customer;
  onClose: () => void;
}

export const UpdateCustomerModal = ({
  customer,
  onClose,
}: UpdateCustomerModalProps) => {
  const { refreshCustomers } = useCustomerData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      full_name: customer.full_name,
      phone_number: customer.phone_number || "",
      email: customer.email || "",
      address: customer.address || "",
      remarks: customer.remarks || "",
      group_id: customer.group_id || "",
      birthdate: customer.birthdate || "",
      date_of_registration: customer.date_of_registration || "",
    },
  });

  const onSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      // Clean up empty strings to null where appropriate if needed, 
      // but the schema allows empty strings for optional fields.
      // However, database might prefer nulls.
      // The service `updateCustomer` takes Partial<any>.
      
      const payload = {
        ...data,
        group_id: data.group_id === "" ? null : data.group_id,
        phone_number: data.phone_number === "" ? null : data.phone_number,
        email: data.email === "" ? null : data.email,
        address: data.address === "" ? null : data.address,
        remarks: data.remarks === "" ? null : data.remarks,
        birthdate: data.birthdate === "" ? null : data.birthdate,
      };

      await updateCustomer(customer.id, payload);
      refreshCustomers();
      onClose();
    } catch (error) {
      console.error("Failed to update customer:", error);
      // Ideally show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/80 backdrop-blur-sm p-4 animate-in duration-200 fade-in">
      <div className="bg-gray-800 shadow-2xl border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center bg-gray-900/50 p-6 border-b border-gray-700">
          <h2 className="font-bold text-white text-xl">Update Customer</h2>
          <button
            onClick={onClose}
            className="hover:bg-gray-700 p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
            {/* Full Name */}
            <div className="col-span-full">
              <label className="block mb-2 font-medium text-gray-300 text-sm">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("full_name")}
                className="bg-gray-900 px-4 py-2.5 border border-gray-600 focus:border-blue-500 rounded-xl w-full text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="John Doe"
              />
              {errors.full_name && (
                <p className="mt-1 text-red-400 text-xs">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-2 font-medium text-gray-300 text-sm">
                Phone Number
              </label>
              <input
                {...register("phone_number")}
                className="bg-gray-900 px-4 py-2.5 border border-gray-600 focus:border-blue-500 rounded-xl w-full text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="+63 900 000 0000"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 font-medium text-gray-300 text-sm">
                Email Address
              </label>
              <input
                {...register("email")}
                className="bg-gray-900 px-4 py-2.5 border border-gray-600 focus:border-blue-500 rounded-xl w-full text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-red-400 text-xs">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="col-span-full">
              <label className="block mb-2 font-medium text-gray-300 text-sm">
                Address
              </label>
              <input
                {...register("address")}
                className="bg-gray-900 px-4 py-2.5 border border-gray-600 focus:border-blue-500 rounded-xl w-full text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="123 Street, City"
              />
            </div>

            {/* Birthdate */}
            <div>
              <label className="block mb-2 font-medium text-gray-300 text-sm">
                Birthdate
              </label>
              <input
                type="date"
                {...register("birthdate")}
                className="bg-gray-900 px-4 py-2.5 border border-gray-600 focus:border-blue-500 rounded-xl w-full text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Registration Date */}
            <div>
              <label className="block mb-2 font-medium text-gray-300 text-sm">
                Date of Registration
              </label>
              <input
                type="date"
                {...register("date_of_registration")}
                className="bg-gray-900 px-4 py-2.5 border border-gray-600 focus:border-blue-500 rounded-xl w-full text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.date_of_registration && (
                <p className="mt-1 text-red-400 text-xs">
                  {errors.date_of_registration.message}
                </p>
              )}
            </div>

            {/* Remarks */}
            <div className="col-span-full">
              <label className="block mb-2 font-medium text-gray-300 text-sm">
                Remarks
              </label>
              <textarea
                {...register("remarks")}
                rows={3}
                className="bg-gray-900 px-4 py-2.5 border border-gray-600 focus:border-blue-500 rounded-xl w-full text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                placeholder="Additional notes..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="hover:bg-gray-700 px-4 py-2 rounded-xl font-medium text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 px-6 py-2 rounded-xl font-bold text-white transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
