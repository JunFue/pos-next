import React from "react";

const ItemReg = () => {
  return (
    // Use the glass-effect class from your globals.css
    <div className="p-6 glass-effect">
      <h2 className="mb-6 font-semibold text-xl">Register New Item</h2>
      <form className="gap-6 grid grid-cols-1 md:grid-cols-2">
        {/* Use the input-dark class from your globals.css */}
        <div>
          <label
            htmlFor="item-name"
            className="block mb-2 font-medium text-slate-300 text-sm"
          >
            Item Name
          </label>
          <input
            type="text"
            id="item-name"
            className="w-full input-dark"
            placeholder="e.g., 'Product A'"
          />
        </div>
        <div>
          <label
            htmlFor="item-sku"
            className="block mb-2 font-medium text-slate-300 text-sm"
          >
            SKU / Barcode
          </label>
          <input
            type="text"
            id="item-sku"
            className="w-full input-dark"
            placeholder="e.g., '12345-ABC'"
          />
        </div>
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
          />
        </div>
        <div>
          <label
            htmlFor="cost-price"
            className="block mb-2 font-medium text-slate-300 text-sm"
          >
            Cost Price ($)
          </label>
          <input
            type="number"
            id="cost-price"
            className="w-full input-dark"
            placeholder="0.00"
          />
        </div>
        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="block mb-2 font-medium text-slate-300 text-sm"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full input-dark"
            placeholder="A brief description..."
          ></textarea>
        </div>
        <div className="flex justify-end md:col-span-2">
          {/* Use the btn-3d-glass class */}
          <button
            type="submit"
            className="bg-green-500/30 hover:bg-green-500/40 border-green-500/50 btn-3d-glass"
          >
            Register Item
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemReg;
