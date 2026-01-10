"use client";

import { useFormContext } from "react-hook-form";
import { PosFormValues } from "../utils/posSchema";
import { useItems } from "@/app/inventory/hooks/useItems";
import { useMemo } from "react";
import { useInventory } from "@/app/dashboard/hooks/useInventory";
import { useAuthStore } from "@/store/useAuthStore";

import { CalendarClock, XCircle } from "lucide-react";
import dayjs from "dayjs";
import { useTransactionStore } from "@/app/settings/backdating/stores/useTransactionStore";

type TerminalHeaderProps = {
  liveTime: string;
};

export const TerminalHeader = ({ liveTime }: TerminalHeaderProps) => {
  const { watch } = useFormContext<PosFormValues>();
  const { items: allItems } = useItems();
  const { inventory: inventoryData } = useInventory();
  const { user } = useAuthStore();

  // Get Custom Date from Store
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

  // Status flags
  const isBackdating = !!customTransactionDate;
  const statusColor = isBackdating ? "text-amber-400" : "text-cyan-400";
  const borderColor = isBackdating
    ? "border-amber-500/30"
    : "border-transparent";

  return (
    <div
      className={`glass-effect relative flex flex-col mb-4 px-6 py-5 rounded-xl w-full min-h-[220px] text-white shadow-xl transition-all duration-300 border ${borderColor}`}
    >
      {/* --- TOP ROW: User & Time --- */}
      <div className="z-10 flex justify-between items-start w-full">
        {/* Left: User Name */}
        <div className="flex flex-col">
          <span
            className={`font-(family-name:--font-lexend) font-bold text-xl tracking-wider uppercase ${statusColor}`}
          >
            {user
              ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
              : "Initializing..."}
          </span>
          <span className="text-xs text-slate-400 font-(family-name:--font-lexend) uppercase tracking-widest mt-0.5">
            Cashier
          </span>
        </div>

        {/* Right: Time / Backdating Status */}
        <div className="flex flex-col items-end">
          {isBackdating ? (
            <div className="group relative flex flex-col items-end cursor-pointer">
              {/* Date Display */}
              <div className="flex items-center gap-2 group-hover:opacity-40 font-(family-name:--font-lexend) font-bold text-amber-400 text-lg tracking-wide transition-all animate-pulse group-hover:animate-none">
                <CalendarClock className="w-5 h-5" />
                <span>
                  {dayjs(customTransactionDate).format("MMM DD, YYYY h:mm A")}
                </span>
              </div>

              {/* Status Badge */}
              <div className="group-hover:hidden flex items-center bg-amber-950/60 mt-1 px-2 py-0.5 border border-amber-500/30 rounded">
                <span className="bg-amber-500 mr-2 rounded-full w-1.5 h-1.5 animate-ping"></span>
                <span className="font-bold text-[10px] text-amber-500 uppercase tracking-widest">
                  Backdating Active
                </span>
              </div>

              {/* End Session Button (Hover Overlay) */}
              <button
                onClick={() => setCustomTransactionDate(null)}
                className="hidden top-0 right-0 absolute group-hover:flex items-center gap-2 bg-red-500/90 hover:bg-red-600 shadow-lg backdrop-blur-sm px-4 py-1.5 rounded-lg font-medium text-white text-sm transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>End Session</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <span className="font-(family-name:--font-lexend) font-bold text-xl tracking-wider text-cyan-400">
                {liveTime}
              </span>
              <span className="text-xs text-cyan-400/50 font-(family-name:--font-lexend) uppercase tracking-widest mt-0.5">
                Live System Time
              </span>
            </div>
          )}
        </div>
      </div>

      {/* --- MIDDLE: Divider --- */}
      <div
        className={`w-full h-px my-4 transition-colors duration-300 ${
          isBackdating ? "bg-amber-500/20" : "bg-cyan-400/20"
        }`}
      ></div>

      {/* --- CENTER CONTENT: Item Name & Price --- */}
      <div className="flex flex-col justify-center items-center -mt-2 text-center grow">
        <h1
          className={`text-3xl md:text-4xl font-bold tracking-widest font-(family-name:--font-lexend) drop-shadow-lg transition-colors ${
            isBackdating ? "text-amber-100" : "text-cyan-100"
          }`}
        >
          {currentProduct.name}
        </h1>
        <p
          className={`text-3xl md:text-4xl mt-1 font-(family-name:--font-lexend) font-bold tracking-tighter transition-colors ${
            isBackdating ? "text-amber-300" : "text-cyan-300"
          }`}
        >
          {currentProduct.price}
        </p>
      </div>

      {/* --- BOTTOM: Stock Status --- */}
      <div className="mt-auto pt-2 w-full text-center">
        <p
          className={`text-lg font-medium tracking-widest font-(family-name:--font-lexend) ${
            currentProduct.stock === 0 ? "text-red-400" : "text-green-400"
          }`}
        >
          STOCKS AVAILABLE: {currentProduct.stock}
        </p>
      </div>
    </div>
  );
};

export default TerminalHeader;
