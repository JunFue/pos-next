// app/inventory/components/item-registration/ItemForm.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Controller } from "react-hook-form"; 
import {
  XCircle,
  Users,
  User,
} from "lucide-react";
import { Item } from "../utils/itemTypes";
import { useItemForm } from "./hooks/useItemForm";
import { useItemBatchUpload } from "./hooks/useItemBatchUpload";
import { CategorySelect } from "../utils/CategorySelect";

// 1. IMPORT THE STORE
import { useSettingsStore } from "@/store/useSettingsStore"; 

interface ItemFormProps {
  itemToEdit?: Item;
  onFormSubmit: (data: Item) => void;
  onCancelEdit: () => void;
}

type RegisterView = "single" | "batch";

export const ItemForm: React.FC<ItemFormProps> = ({
  itemToEdit,
  onFormSubmit,
  onCancelEdit,
}) => {
  // 2. GET THE GLOBAL THRESHOLD
  const { lowStockThreshold: globalThreshold } = useSettingsStore();

  const {
    isEditing,
    register,
    control,
    handleRHFSubmit,
    handleKeyDown,
    errors,
    isSubmitting,
    onCancelEdit: onCancelEditFromHook,
    // 3. DESTRUCTURE SETVALUE FROM YOUR HOOK
    setValue, 
  } = useItemForm({
    itemToEdit,
    onFormSubmit,
    onCancelEdit,
  });

  // 4. PRE-FILL THRESHOLD FOR NEW ITEMS
  useEffect(() => {
    // If we are NOT editing (creating new) and there is no existing value
    if (!isEditing && !itemToEdit) {
        setValue("lowStockThreshold", globalThreshold);
    }
  }, [globalThreshold, isEditing, itemToEdit, setValue]);

  const batchUpload = useItemBatchUpload();
  const [view, setView] = useState<RegisterView>("single");

  return (
    <>
      <div>
        <h2 className="mb-6 font-semibold text-xl">
          {isEditing ? "Edit Item" : "Register New Item"}
        </h2>
        {!isEditing && (
          <div className="flex items-center gap-4 bg-gray-900/50 mb-6 p-2 rounded-lg">
             <button onClick={() => setView("single")} className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium rounded-2xl ${view === "single" ? "bg-blue-500/30 border-blue-500/50" : "text-gray-400 hover:text-white"}`}>
                <User className="w-4 h-4" /> Single Item
             </button>
             <button onClick={() => setView("batch")} className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium rounded-2xl ${view === "batch" ? "bg-blue-500/30 border-blue-500/50" : "text-gray-400 hover:text-white"}`}>
                <Users className="w-4 h-4" /> Batch Upload
             </button>
          </div>
        )}
      </div>

      {(isEditing || view === "single") && (
        <div>
          <form
            onSubmit={handleRHFSubmit}
            onKeyDown={handleKeyDown}
            className="gap-6 grid grid-cols-1 md:grid-cols-2 bg-slate-900 shadow-lg p-4 rounded-lg"
          >
            {/* Item Name */}
            <div className="relative pb-5">
               <label htmlFor="item-name" className="block mb-2 font-medium text-slate-300 text-sm">Item Name</label>
               <input type="text" className={`w-full input-dark ${errors.itemName ? "border-red-500" : ""}`} {...register("itemName")} />
               {errors.itemName && <p className="bottom-0 absolute text-red-300 text-sm">{errors.itemName.message}</p>}
            </div>

            {/* SKU */}
            <div className="relative pb-5">
               <label htmlFor="item-sku" className="block mb-2 font-medium text-slate-300 text-sm">SKU / Barcode</label>
               <input type="text" className={`w-full input-dark ${errors.sku ? "border-red-500" : ""}`} {...register("sku")} />
               {errors.sku && <p className="bottom-0 absolute text-red-300 text-sm">{errors.sku.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block mb-2 font-medium text-slate-300 text-sm">Category</label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <CategorySelect
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.category?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>

            {/* Cost Price */}
            <div className="relative pb-5">
               <label htmlFor="cost-price" className="block mb-2 font-medium text-slate-300 text-sm">Cost Price (₱)</label>
               <input type="number" step="0.01" className={`w-full input-dark ${errors.costPrice ? "border-red-500" : ""}`} {...register("costPrice", { valueAsNumber: true })} />
               {errors.costPrice && <p className="bottom-0 absolute text-red-300 text-sm">{errors.costPrice.message}</p>}
            </div>

            {/* Low Stock Threshold */}
            <div className="relative pb-5">
               <label htmlFor="low-stock-threshold" className="block mb-2 font-medium text-slate-300 text-sm">
                 Low Stock Threshold
               </label>
               <input 
                 type="number" 
                 min="0"
                 // removed placeholder since it's now pre-filled
                 className={`w-full input-dark ${errors.lowStockThreshold ? "border-red-500" : ""}`} 
                 {...register("lowStockThreshold", { valueAsNumber: true })} 
               />
               {errors.lowStockThreshold && <p className="bottom-0 absolute text-red-300 text-sm">{errors.lowStockThreshold.message}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block mb-2 font-medium text-slate-300 text-sm">Description</label>
              <textarea rows={3} className="w-full input-dark" {...register("description")}></textarea>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 md:col-span-2">
               {isEditing && <button type="button" onClick={onCancelEditFromHook} className="flex items-center gap-2 bg-gray-500/30 hover:bg-gray-500/40 border-gray-500/50 btn-3d-glass"><XCircle className="w-5 h-5" /> Cancel</button>}
               <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-green-500/30 hover:bg-green-500/40 border-green-500/50 btn-3d-glass">
                 {isSubmitting ? <div className="border-white border-t-2 border-r-2 rounded-full w-5 h-5 animate-spin"></div> : isEditing ? "Update Item" : "Register Item"}
               </button>
            </div>
          </form>
        </div>
      )}

      {!isEditing && view === "batch" && (
         <div className="text-slate-400">
             <p className="mb-4 text-sm">Batch upload functionality is currently under development.</p>
         </div>
      )}
    </>
  );
};