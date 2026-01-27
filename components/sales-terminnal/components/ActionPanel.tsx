import React from "react";
import { useFormContext } from "react-hook-form";
import { QuickPickGrid } from "./action-panel/quickpick-grid/QuickPickGrid";
import { ActionButtons } from "./action-panel/ActionButtons";
import { Numpad } from "./action-panel/Numpad";
import { CustomerIntelligence } from "./action-panel/CustomerIntelligence";
import { PosFormValues } from "../utils/posSchema";

interface ActionPanelProps {
  onAddToCart: () => void;
  onClearAll: () => void;
  onCharge: () => void;
  activeField: "barcode" | "quantity" | null;
}

export default function ActionPanel({
  onAddToCart,
  onClearAll,
  onCharge,
  activeField,
}: ActionPanelProps) {
  const { setValue, getValues, setFocus, reset } = useFormContext<PosFormValues>();

  const handleQuickPickSelect = (item: any) => {
    console.log("Selected:", item);
    setValue("barcode", item.sku, { shouldValidate: true });
    setFocus("quantity");
  };

  const handleNumpadPress = (key: string) => {
    console.log("Numpad:", key);
    if (!activeField) return;

    const currentValue = getValues(activeField);
    const newValue = currentValue ? String(currentValue) + key : key;

    if (activeField === "quantity") {
      setValue(activeField, Number(newValue), { shouldValidate: true });
    } else {
      setValue(activeField, newValue, { shouldValidate: true });
    }
  };

  const handleClearInput = () => {
    if (activeField) {
        setValue(activeField, activeField === "quantity" ? 0 : "");
    }
  };

  const handleIncreaseQty = () => {
    const currentQty = getValues("quantity") || 0;
    setValue("quantity", currentQty + 1);
  };

  const handleDecreaseQty = () => {
    const currentQty = getValues("quantity") || 0;
    if (currentQty > 1) {
      setValue("quantity", currentQty - 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0F172A] border-l border-slate-800 p-4 gap-4 w-[450px] shrink-0">
      <h2 className="text-white font-lexend font-medium text-lg">Action Panel</h2>

      {/* 1. Quick Pick Grid */}
      <QuickPickGrid onSelect={handleQuickPickSelect} />

      {/* 2. Action Buttons */}
      <div className="shrink-0">
         <ActionButtons 
            onAdd={onAddToCart}
            onDiscount={() => console.log("Discount")}
            onVoucher={() => console.log("Voucher")}
            onOpenDrawer={() => console.log("Open Drawer")}
            onCharge={onCharge}
            onIncreaseQty={handleIncreaseQty}
            onDecreaseQty={handleDecreaseQty}
            onClearInput={() => reset({ barcode: "", quantity: null })}
            onClearAll={onClearAll}
         />
      </div>

      {/* 3. Numpad & Customer Intelligence */}
      <div className="grid grid-cols-2 gap-4 h-[220px] shrink-0">
         {/* Numpad */}
         <div className="flex flex-col h-full">
            <Numpad onKeyPress={handleNumpadPress} onClear={handleClearInput} />
         </div>

         {/* Customer Intelligence */}
         <div className="flex flex-col h-full justify-end">
            <CustomerIntelligence />
         </div>
      </div>
    </div>
  );
}
