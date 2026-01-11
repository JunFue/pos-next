"use client";

import { useState, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { PosFormValues } from "../../utils/posSchema";
import { useItems } from "@/app/inventory/hooks/useItems";
import { useInventory } from "@/app/dashboard/hooks/useInventory";
import { useAuthStore } from "@/store/useAuthStore";
import {
  CalendarClock,
  XCircle,
  User,
  Printer,
  HelpCircle,
  Search,
  Users,
} from "lucide-react";
import dayjs from "dayjs";

import { ShortcutsGuide } from "./ShortcutsGuide";
import {
  CustomerSearchModal,
  CustomerResult,
} from "../../modals/CustomerSearchModal";
import { useTransactionStore } from "@/app/settings/backdating/stores/useTransactionStore";

type TerminalHeaderProps = {
  liveTime: string;
  setCustomerId: (id: string | null) => void; // [NEW] Accept the setter
};

export const TerminalHeader = ({
  liveTime,
  setCustomerId,
}: TerminalHeaderProps) => {
  const { watch, setValue } = useFormContext<PosFormValues>();
  const { items: allItems } = useItems();
  const { inventory: inventoryData } = useInventory();
  const { user } = useAuthStore();
  const { customTransactionDate, setCustomTransactionDate } =
    useTransactionStore();

  // State for Modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Watch values
  const currentBarcode = watch("barcode");
  const customerName = watch("customerName");

  // [NEW] Hotkey Listener (Alt + F1)
  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "F1") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, []);

  // [NEW] Handle Selection
  const handleCustomerSelect = (customer: CustomerResult) => {
    setValue("customerName", customer.full_name, { shouldValidate: true });
    setCustomerId(customer.id);
  };

  // [NEW] Clear Customer
  const handleClearCustomer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue("customerName", "");
    setCustomerId(null);
  };

  const currentProduct = useMemo(() => {
    if (!currentBarcode) return { name: "NO ITEM", price: "₱0.00", stock: 0 };
    const item = allItems.find((item) => item.sku === currentBarcode);
    if (!item) return { name: "NOT FOUND", price: "₱0.00", stock: 0 };
    const stockInfo = inventoryData?.find((inv) => inv.sku === currentBarcode);
    return {
      name: item.itemName.toUpperCase(),
      price: `₱${item.costPrice.toFixed(2)}`,
      stock: stockInfo?.current_stock ?? 0,
    };
  }, [currentBarcode, allItems, inventoryData]);

  const isBackdating = !!customTransactionDate;
  const statusColor = isBackdating ? "text-amber-400" : "text-cyan-400";
  const borderColor = isBackdating
    ? "border-amber-500/30"
    : "border-transparent";

  // Check if a customer is actually linked (you might want to pass customerId as prop if you want strict visual feedback, but name check is usually enough for UI)
  const isCustomerSelected =
    customerName && customerName !== "" && customerName !== "Walk-in Customer";

  return (
    <>
      {/* Modal is strictly controlled by Header now */}
      <CustomerSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleCustomerSelect}
      />

      <div
        className={`glass-effect flex flex-row items-stretch mb-4 rounded-xl w-full min-h-[220px] text-white shadow-xl transition-all duration-300 border ${borderColor} overflow-hidden`}
      >
        {/* ================= LEFT COLUMN ================= */}
        <div className="flex flex-col justify-between bg-slate-900/40 p-5 border-slate-700/50 border-r w-[30%] min-w-[250px]">
          {/* 1. Cashier Info */}
          <div className="flex flex-col">
            <span className="mb-1 font-bold text-[10px] text-slate-500 uppercase tracking-widest">
              Current Cashier
            </span>
            <span
              className={`font-[family-name:var(--font-lexend)] font-medium text-sm truncate ${statusColor}`}
            >
              {user
                ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                : "Initializing..."}
            </span>
          </div>

          {/* 2. Customer Selector (Clickable) */}
          <div className="group flex flex-col my-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-[10px] text-slate-500 uppercase tracking-widest">
                Customer
              </span>
              <span className="hidden group-hover:inline-block text-[9px] text-cyan-500/50 animate-pulse">
                ALT + F1 to Search
              </span>
            </div>

            <button
              onClick={() => setIsSearchOpen(true)}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-dashed transition-all duration-200 text-left ${
                isCustomerSelected
                  ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-200"
                  : "bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/80 hover:border-cyan-500/30 hover:text-cyan-100"
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {isCustomerSelected ? (
                  <Users className="w-4 h-4 shrink-0" />
                ) : (
                  <User className="opacity-50 w-4 h-4 shrink-0" />
                )}
                <span
                  className={`text-xs font-medium truncate ${
                    isCustomerSelected ? "" : "italic"
                  }`}
                >
                  {customerName || "Walk-in Customer"}
                </span>
              </div>

              {isCustomerSelected ? (
                <div
                  role="button"
                  onClick={handleClearCustomer}
                  className="hover:bg-red-500/20 p-1 rounded-full text-cyan-500/50 hover:text-red-400 transition-colors"
                >
                  <XCircle className="w-3 h-3" />
                </div>
              ) : (
                <Search className="opacity-0 group-hover:opacity-50 w-3 h-3" />
              )}
            </button>
          </div>

          {/* 3. Toolbar */}
          <div className="mt-auto">
            <span className="block mb-2 font-bold text-[10px] text-slate-500 uppercase tracking-widest">
              Tools
            </span>
            <div className="flex items-center gap-2">
              <ShortcutsGuide />
              <button
                className="flex justify-center items-center bg-slate-800/30 hover:bg-slate-700 border border-slate-700/50 rounded-lg w-10 h-10 transition-colors"
                title="Reprint Last Receipt"
              >
                <Printer className="w-4 h-4 text-slate-400" />
              </button>
              <button
                className="flex justify-center items-center bg-slate-800/30 hover:bg-slate-700 border border-slate-700/50 rounded-lg w-10 h-10 transition-colors"
                title="Help"
              >
                <HelpCircle className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="relative flex flex-col flex-grow p-6">
          {/* Time / Backdate Status */}
          <div className="top-4 right-6 absolute text-right">
            {isBackdating ? (
              <div className="group relative flex flex-col items-end cursor-pointer">
                <div className="flex items-center gap-2 group-hover:opacity-60 font-bold text-amber-400 text-sm transition-all animate-pulse group-hover:animate-none">
                  <CalendarClock className="w-4 h-4" />
                  <span>
                    {dayjs(customTransactionDate).format("MMM DD, YYYY h:mm A")}
                  </span>
                </div>
                <span className="group-hover:hidden bg-amber-950/30 mt-1 px-2 py-0.5 rounded font-bold text-[10px] text-amber-500/80 uppercase tracking-widest">
                  Backdating Active
                </span>
                <button
                  onClick={() => setCustomTransactionDate(null)}
                  className="hidden top-0 right-0 absolute group-hover:flex items-center gap-2 bg-red-500/90 hover:bg-red-600 shadow-lg backdrop-blur-sm px-3 py-1 rounded font-medium text-white text-xs whitespace-nowrap transition-all"
                >
                  <XCircle className="w-3 h-3" />
                  <span>End Session</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-end">
                <span className="font-[family-name:var(--font-lexend)] font-bold text-cyan-400 text-lg tracking-wider">
                  {liveTime}
                </span>
                <span className="text-[10px] text-cyan-400/50 uppercase tracking-widest">
                  System Time
                </span>
              </div>
            )}
          </div>

          {/* Item Display */}
          <div className="flex flex-col justify-center items-end space-y-1 mt-4 h-full text-right">
            <h1
              className={`text-2xl md:text-4xl font-bold tracking-tight font-[family-name:var(--font-lexend)] drop-shadow-lg transition-colors line-clamp-2 max-w-[90%] ${
                isBackdating ? "text-amber-100" : "text-cyan-50"
              }`}
            >
              {currentProduct.name}
            </h1>
            <p
              className={`text-4xl md:text-5xl font-[family-name:var(--font-lexend)] font-black tracking-tighter transition-colors ${
                isBackdating ? "text-amber-300" : "text-cyan-300"
              }`}
            >
              {currentProduct.price}
            </p>
          </div>

          {/* Stock Status */}
          <div className="flex justify-end mt-auto pt-4">
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
                currentProduct.stock === 0
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}
            >
              STOCKS: {currentProduct.stock}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TerminalHeader;
