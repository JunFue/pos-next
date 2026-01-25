"use client";

import React from "react";
import { QuickPickGrid } from "./action-panel/quickpick-grid/QuickPickGrid";
import { ActionButtons } from "./action-panel/ActionButtons";
import { Numpad } from "./action-panel/Numpad";
import { CustomerIntelligence } from "./action-panel/CustomerIntelligence";


export default function ActionPanel() {
  const handleQuickPickSelect = (item: any) => {
    console.log("Selected:", item);
  };

  const handleNumpadPress = (key: string) => {
    console.log("Numpad:", key);
  };

  const handleClear = () => {
    console.log("Clear");
  };

  return (
    <div className="flex flex-col h-full bg-[#0F172A] border-l border-slate-800 p-4 gap-4 w-[450px] shrink-0">
      <h2 className="text-white font-lexend font-medium text-lg">Action Panel</h2>

      {/* 1. Quick Pick Grid */}
      <QuickPickGrid onSelect={handleQuickPickSelect} />

      {/* 2. Action Buttons */}
      <div className="shrink-0">
         <ActionButtons 
            onAdd={() => console.log("Add")}
            onDiscount={() => console.log("Discount")}
            onVoucher={() => console.log("Voucher")}
            onOpenDrawer={() => console.log("Open Drawer")}
            onCharge={() => console.log("Charge")}
            onIncreaseQty={() => console.log("Increase Qty")}
            onDecreaseQty={() => console.log("Decrease Qty")}
         />
      </div>

      {/* 3. Numpad & Customer Intelligence */}
      <div className="grid grid-cols-2 gap-4 h-[220px] shrink-0">
         {/* Numpad */}
         <div className="flex flex-col h-full">
            <Numpad onKeyPress={handleNumpadPress} onClear={handleClear} />
         </div>

         {/* Customer Intelligence */}
         <div className="flex flex-col h-full justify-end">
            <CustomerIntelligence />
         </div>
      </div>
    </div>
  );
}
