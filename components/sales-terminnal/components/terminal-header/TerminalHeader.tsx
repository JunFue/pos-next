"use client";

import { CustomerSearchModal } from "../../modals/CustomerSearchModal";
import { useTerminalHeader } from "./hooks/useTerminalHeader";
import { CashierInfo } from "./components/CashierInfo";
import { CustomerSelector } from "./components/CustomerSelector";
import { HeaderToolbar } from "./components/HeaderToolbar";
import { TimeDisplay } from "./components/TimeDisplay";
import { ProductDisplay } from "./components/ProductDisplay";

type TerminalHeaderProps = {
  liveTime: string;
  setCustomerId: (id: string | null) => void;
};

export const TerminalHeader = ({
  liveTime,
  setCustomerId,
}: TerminalHeaderProps) => {
  const {
    user,
    isSearchOpen,
    setIsSearchOpen,
    customerName,
    handleCustomerSelect,
    handleClearCustomer,
    currentProduct,
    isBackdating,
    customTransactionDate,
    setCustomTransactionDate,
  } = useTerminalHeader(setCustomerId);

  const statusColor = isBackdating ? "text-amber-400" : "text-cyan-400";
  const borderColor = isBackdating
    ? "border-amber-500/30"
    : "border-transparent";

  const isCustomerSelected =
    customerName && customerName !== "" && customerName !== "Walk-in Customer";

  return (
    <>
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
          <CashierInfo user={user} statusColor={statusColor} />

          <CustomerSelector
            customerName={customerName || ""}
            isCustomerSelected={!!isCustomerSelected}
            onSearchOpen={() => setIsSearchOpen(true)}
            onClearCustomer={handleClearCustomer}
          />

          <HeaderToolbar />
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="relative flex flex-col grow p-6">
          <TimeDisplay
            liveTime={liveTime}
            isBackdating={isBackdating}
            customTransactionDate={customTransactionDate}
            setCustomTransactionDate={setCustomTransactionDate}
          />

          <ProductDisplay
            currentProduct={currentProduct}
            isBackdating={isBackdating}
          />
        </div>
      </div>
    </>
  );
};

export default TerminalHeader;
