import React from "react";
import { Package, TrendingDown, PackageX, DollarSign } from "lucide-react";

const StocksMonitor = () => {
  return (
    <div className="p-6 glass-effect">
      <h2 className="mb-6 font-semibold text-xl">Stocks Monitor</h2>

      {/* Stat Cards */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Card 1: Total SKU */}
        <div className="p-5 glass-effect">
          <div className="flex justify-between items-center">
            <p className="font-medium text-slate-400 text-sm">
              Total Unique Items (SKUs)
            </p>
            <Package className="w-5 h-5 text-slate-500" />
          </div>
          <p className="mt-2 font-bold text-3xl">1,240</p>
          <p className="mt-1 text-slate-400 text-xs">+15 new this week</p>
        </div>

        {/* Card 2: Low Stock */}
        <div className="p-5 glass-effect">
          <div className="flex justify-between items-center">
            <p className="font-medium text-slate-400 text-sm">
              Items Low on Stock
            </p>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="mt-2 font-bold text-red-400 text-3xl">82</p>
          <p className="mt-1 text-slate-400 text-xs">Below alert threshold</p>
        </div>

        {/* Card 3: Out of Stock */}
        <div className="p-5 glass-effect">
          <div className="flex justify-between items-center">
            <p className="font-medium text-slate-400 text-sm">Out of Stock</p>
            <PackageX className="w-5 h-5 text-slate-500" />
          </div>
          <p className="mt-2 font-bold text-3xl">17</p>
          <p className="mt-1 text-slate-400 text-xs">Action required</p>
        </div>

        {/* Card 4: Total Stock Value */}
        <div className="p-5 glass-effect">
          <div className="flex justify-between items-center">
            <p className="font-medium text-slate-400 text-sm">
              Total Stock Value (Cost)
            </p>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="mt-2 font-bold text-green-400 text-3xl">$82,450.00</p>
          <p className="mt-1 text-slate-400 text-xs">Based on cost price</p>
        </div>
      </div>

      {/* Placeholder for a chart */}
      <div className="p-6 glass-effect">
        <h3 className="mb-4 font-semibold text-lg">Stock Value Over Time</h3>
        <div className="flex justify-center items-center bg-slate-800/50 rounded-lg w-full h-64">
          <p className="text-slate-500">Stock value chart placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default StocksMonitor;
