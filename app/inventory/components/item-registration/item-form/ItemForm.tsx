"use client";

import React from "react";
import { XCircle } from "lucide-react";
import { Item } from "../utils/itemTypes";
import { useItemForm } from "./hooks/useItemForm"; // Adjust path as needed

interface ItemFormProps {
  itemToEdit?: Item;
  onFormSubmit: (data: Item) => void;
  onCancelEdit: () => void;
}

export const ItemForm: React.FC<ItemFormProps> = ({
  itemToEdit,
  onFormSubmit,
  onCancelEdit,
}) => {
  // 2. Call the hook to get all state and handlers
  const {
    isEditing,
    register,
    handleRHFSubmit,
    handleKeyDown,
    errors,
    isSubmitting,
    onCancelEdit: onCancelEditFromHook, // Renamed to avoid prop-shadowing
  } = useItemForm({
    itemToEdit,
    onFormSubmit,
    onCancelEdit,
  });

  // 3. The JSX is now purely presentational
  return (
    <div>
      <h2 className="mb-6 font-semibold text-xl">
        {isEditing ? "Edit Item" : "Register New Item"}
      </h2>
      <form
        onSubmit={handleRHFSubmit} // Use the handler from the hook
        onKeyDown={handleKeyDown} // Use the handler from the hook
        className="gap-6 grid grid-cols-1 md:grid-cols-2"
      >
        {/* Item Name */}
        <div className="relative pb-5">
          <label
            htmlFor="item-name"
            className="block mb-2 font-medium text-slate-300 text-sm"
          >
            Item Name
          </label>
          <input
            type="text"
            id="item-name"
            className={`w-full input-dark ${
              errors.itemName ? "border-red-500" : ""
            }`}
            placeholder="e.g., 'Product A'"
            {...register("itemName")} // From hook
          />
          {errors.itemName && ( // From hook
            <p className="bottom-0 absolute text-red-300 text-sm">
              {errors.itemName.message}
            </p>
          )}
        </div>
        {/* SKU / Barcode */}
        <div className="relative pb-5">
          <label
            htmlFor="item-sku"
            className="block mb-2 font-medium text-slate-300 text-sm"
          >
            SKU / Barcode
          </label>
          <input
            type="text"
            id="item-sku"
            className={`w-full input-dark ${
              errors.sku ? "border-red-500" : ""
            }`}
            placeholder="e.g., '12345-ABC'"
            {...register("sku")} // From hook
          />
          {errors.sku && ( // From hook
            <p className="bottom-0 absolute text-red-300 text-sm">
              {errors.sku.message}
            </p>
          )}
        </div>
        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block mb-2 font-medium text-slate-300 text-sm"
          >
            Category
          </label>
          <input
            type="text"
            id="category"
            className="w-full input-dark"
            placeholder="e.g., 'Electronics'"
            {...register("category")} // From hook
          />
        </div>
        {/* Cost Price */}
        <div className="relative pb-5">
          <label
            htmlFor="cost-price"
            className="block mb-2 font-medium text-slate-300 text-sm"
          >
            Cost Price (₱)
          </label>
          <input
            type="number"
            id="cost-price"
            className={`w-full input-dark ${
              errors.costPrice ? "border-red-500" : ""
            }`}
            placeholder="0.00"
            step="0.01"
            {...register("costPrice", {
              valueAsNumber: true,
            })} // From hook
          />
          {errors.costPrice && ( // From hook
            <p className="bottom-0 absolute text-red-300 text-sm">
              {errors.costPrice.message}
            </p>
          )}
        </div>
        {/* Description */}
        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="block mb-2 font-medium text-slate-300 text-sm"
          >
            Description
            <span className="ml-2 text-slate-500 text-xs">
              (Press Shift+Enter to submit)
            </span>
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full input-dark"
            placeholder="A brief description..."
            {...register("description")} // From hook
          ></textarea>
        </div>
        {/* Buttons */}
        <div className="flex justify-end gap-4 md:col-span-2">
          {isEditing && ( // From hook
            <button
              type="button"
              onClick={onCancelEditFromHook} // From hook
              className="flex items-center gap-2 bg-gray-500/30 hover:bg-gray-500/40 border-gray-500/50 btn-3d-glass"
              disabled={isSubmitting} // From hook
            >
              <XCircle className="w-5 h-5" />
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 bg-green-500/30 hover:bg-green-500/40 border-green-500/50 btn-3d-glass"
            disabled={isSubmitting} // From hook
          >
            {isSubmitting ? ( // From hook
              <div className="border-white border-t-2 border-r-2 rounded-full w-5 h-5 animate-spin"></div>
            ) : isEditing ? (
              "Update Item"
            ) : (
              "Register Item"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
