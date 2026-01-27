// Mobile Action Panel - QuickPick grid, Charge button, and collapsible numpad
"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { ChevronUp, ChevronDown, CreditCard, Keyboard, Calculator, Delete } from "lucide-react";
import { QuickPickGrid } from "./action-panel/quickpick-grid/QuickPickGrid";
import { PosFormValues } from "../utils/posSchema";

interface MobileActionPanelProps {
  onAddToCart: () => void;
  onCharge: () => void;
  activeField: "barcode" | "quantity" | null;
}

const KEYPAD_NUMBERS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "⌫"];

const QWERTY_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

export const MobileActionPanel = ({
  onAddToCart,
  onCharge,
  activeField,
}: MobileActionPanelProps) => {
  const { setValue, getValues, setFocus } = useFormContext<PosFormValues>();
  const [isNumpadExpanded, setIsNumpadExpanded] = useState(false);
  const [showQwerty, setShowQwerty] = useState(false);

  const handleQuickPickSelect = (item: any) => {
    setValue("barcode", item.sku, { shouldValidate: true });
    setFocus("quantity");
  };

  const handleKeyPress = (key: string) => {
    if (!activeField) return;

    if (key === "⌫") {
      const currentValue = getValues(activeField);
      if (activeField === "quantity") {
        const strVal = String(currentValue || "");
        const newVal = strVal.slice(0, -1);
        setValue(activeField, newVal ? Number(newVal) : 0, { shouldValidate: true });
      } else {
        const strVal = String(currentValue || "");
        setValue(activeField, strVal.slice(0, -1), { shouldValidate: true });
      }
      return;
    }

    const currentValue = getValues(activeField);
    const newValue = currentValue ? String(currentValue) + key : key;

    if (activeField === "quantity") {
      const numVal = Number(newValue.replace(/[^0-9]/g, ""));
      setValue(activeField, numVal, { shouldValidate: true });
    } else {
      setValue(activeField, newValue, { shouldValidate: true });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* QuickPick Grid - Main content area */}
      <div className="flex-1 min-h-0 overflow-hidden p-2">
        <QuickPickGrid onSelect={handleQuickPickSelect} />
      </div>

      {/* Charge Button - Fixed at bottom of main area */}
      <div className="p-2 shrink-0">
        <button
          type="button"
          onClick={onCharge}
          className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xl rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <CreditCard className="w-6 h-6" />
          CHARGE
        </button>
      </div>

      {/* Bottom Numpad Toggle */}
      <button
        onClick={() => setIsNumpadExpanded(!isNumpadExpanded)}
        className="w-full bg-slate-800 border-t border-slate-700 p-3 flex items-center justify-center gap-2 text-white font-medium shrink-0"
      >
        {isNumpadExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        {isNumpadExpanded ? "Hide Keypad" : "Show Keypad"}
      </button>

      {/* Collapsible Numpad/Qwerty */}
      <div
        className={`
          bg-[#0F172A] border-t border-slate-800 overflow-hidden transition-all duration-300
          ${isNumpadExpanded ? "max-h-[280px]" : "max-h-0"}
        `}
      >
        <div className="p-3">
          {/* Toggle between Numpad and Qwerty */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-bold">
              {showQwerty ? "QWERTY Keyboard" : "Numpad"}
            </span>
            <button
              onClick={() => setShowQwerty(!showQwerty)}
              className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title={showQwerty ? "Show Numpad" : "Show QWERTY"}
            >
              {showQwerty ? <Calculator className="w-4 h-4" /> : <Keyboard className="w-4 h-4" />}
            </button>
          </div>

          {showQwerty ? (
            // QWERTY Layout
            <div className="space-y-1">
              {QWERTY_ROWS.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-1">
                  {row.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleKeyPress(key)}
                      className={`
                        ${key === "⌫" ? "bg-red-500/10 text-red-400 border-red-500/30 px-4" : "bg-slate-800 text-white border-slate-700 w-8"}
                        h-10 font-bold text-sm rounded border active:bg-slate-600 transition-colors flex items-center justify-center
                      `}
                    >
                      {key === "⌫" ? <Delete className="w-4 h-4" /> : key}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            // Numpad Layout
            <div className="grid grid-cols-3 gap-2">
              {KEYPAD_NUMBERS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyPress(key)}
                  className={`
                    ${key === "⌫" ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30" : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"}
                    h-12 font-bold text-xl rounded-lg shadow-md border active:bg-slate-600 transition-colors flex items-center justify-center
                  `}
                >
                  {key === "⌫" ? <Delete className="w-5 h-5" /> : key}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileActionPanel;
