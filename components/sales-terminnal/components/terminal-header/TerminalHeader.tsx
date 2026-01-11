"use client";

import { useFormContext } from "react-hook-form";

import { useItems } from "@/app/inventory/hooks/useItems";
import { useMemo } from "react";
import { useInventory } from "@/app/dashboard/hooks/useInventory";
import { useAuthStore } from "@/store/useAuthStore";
import {
  CalendarClock,
  XCircle,
  User,
  Printer, // Placeholder
  HelpCircle, // Placeholder
} from "lucide-react";
import dayjs from "dayjs";

import { ShortcutsGuide } from "./ShortcutsGuide";
import { useTransactionStore } from "@/app/settings/backdating/stores/useTransactionStore";
import { PosFormValues } from "../../utils/posSchema";

type TerminalHeaderProps = {
  liveTime: string;
};

export const TerminalHeader = ({ liveTime }: TerminalHeaderProps) => {
  const { watch } = useFormContext<PosFormValues>();
  const { items: allItems } = useItems();
  const { inventory: inventoryData } = useInventory();
  const { user } = useAuthStore();

  const { customTransactionDate, setCustomTransactionDate } =
    useTransactionStore();

  const currentBarcode = watch("barcode");

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

  return (
    <div
      className={`glass-effect flex flex-row items-stretch mb-4 rounded-xl w-full min-h-[220px] text-white shadow-xl transition-all duration-300 border ${borderColor} overflow-hidden`}
    >
      {/* ================= LEFT COLUMN: Tools & Cashier Info (30% Width) ================= */}
      <div className="flex flex-col justify-between bg-slate-900/40 p-5 border-slate-700/50 border-r w-[30%] min-w-[250px]">
        {/* 1. Cashier Info (Smaller) */}
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

        {/* 2. Customer Name Placeholder */}
        <div className="flex flex-col my-3">
          <span className="mb-1 font-bold text-[10px] text-slate-500 uppercase tracking-widest">
            Customer
          </span>
          <div className="flex items-center gap-2 bg-slate-800/30 hover:bg-slate-800/50 px-3 py-2 border border-slate-700/30 hover:border-cyan-500/30 border-dashed rounded-lg text-slate-400 transition-colors cursor-not-allowed">
            <User className="opacity-50 w-4 h-4" />
            <span className="text-xs italic">Walk-in Customer</span>
          </div>
        </div>

        {/* 3. Toolbar (Shortcuts & Future Icons) */}
        <div className="mt-auto">
          <span className="block mb-2 font-bold text-[10px] text-slate-500 uppercase tracking-widest">
            Tools
          </span>
          <div className="flex items-center gap-2">
            {/* The Hotkeys Modal Trigger */}
            <ShortcutsGuide />

            {/* Placeholder 1: Printer/Reprint */}
            <button
              className="flex justify-center items-center bg-slate-800/30 hover:bg-slate-700 border border-slate-700/50 rounded-lg w-10 h-10 transition-colors"
              title="Reprint Last Receipt"
            >
              <Printer className="w-4 h-4 text-slate-400" />
            </button>

            {/* Placeholder 2: Help/Support */}
            <button
              className="flex justify-center items-center bg-slate-800/30 hover:bg-slate-700 border border-slate-700/50 rounded-lg w-10 h-10 transition-colors"
              title="Help"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: The "Display" (70% Width) ================= */}
      <div className="relative flex flex-col flex-grow p-6">
        {/* 1. Top Right: Time / Backdate Status */}
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
              {/* End Session Button */}
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

        {/* 2. Center: Item Information (The Big Display) */}
        {/* Adjusted Font Sizes: text-3xl/5xl instead of 4xl/6xl */}
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

        {/* 3. Bottom Right: Stock Status */}
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
  );
};

export default TerminalHeader;
