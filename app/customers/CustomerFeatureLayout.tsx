"use client";

import React from "react";
import { SWRConfig } from "swr";
import Link from "next/link";
import { ArrowBigLeft } from "lucide-react";

// Components
import { CustomerSidebar } from "./components/CustomerSidebar";
import { CustomerHeader } from "./components/CustomerHeader";
import { CustomerDetailHeader } from "./components/CustomerDetailHeader";
import { CustomerTable } from "./components/CustomerTable";
import { CustomerDetailView } from "./components/CustomerDetailView";
import { CreateGroupModal } from "./components/CreateGroupModal";
import { RegisterCustomerModal } from "./components/RegisterCustomerModal";
import { GuestTransactionsTable } from "./components/GuestTransactionsTable";

// State & Types
import { useCustomerStore } from "./store/useCustomerStore";
import { CustomerGroup, Customer, GuestTransaction } from "./lib/types";

interface Props {
  initialData: {
    groups: CustomerGroup[];
    customers: Customer[];
    guestTransactions: GuestTransaction[];
  };
}

export default function CustomerFeatureLayout({ initialData }: Props) {
  return (
    <SWRConfig value={{ fallback: { "customer-feature-data": initialData } }}>
      <div className="flex flex-col bg-gray-900 max-w-screen h-screen overflow-hidden font-sans text-gray-100">
        {/* Top Nav (Fixed) */}
        <div className="px-6 py-3 border-gray-700 border-b flex-shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <ArrowBigLeft size={20} />
            Back to Dashboard
          </Link>
        </div>

        {/* Content Grid */}
        <div className="flex-1 grid grid-cols-16 overflow-hidden">
          {/* Sidebar (Fixed) */}
          <div className="col-span-4 bg-gray-800 border-gray-700 border-r h-full overflow-hidden">
            <CustomerSidebar />
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col col-span-12 bg-gray-900 min-w-0 min-h-0 h-full">
            {/* Dynamic Header (Fixed) */}
            <div className="z-10 w-full h-fit bg-gray-900 flex-shrink-0 border-b border-gray-800">
              <HeaderSwitcher />
            </div>

            {/* Dynamic Content (Scrollable Container) */}
            {/* Removed p-6 here so scrollbars hit the edge of the screen */}
            <div className="relative flex-1 overflow-hidden bg-gray-900 min-h-0">
              <ContentSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateGroupModal />
      <RegisterCustomerModal />
    </SWRConfig>
  );
}

// ------------------------------------------------------------------
// Sub-components
// ------------------------------------------------------------------

const HeaderSwitcher = () => {
  const { viewMode } = useCustomerStore();
  return viewMode === "detail" ? <CustomerDetailHeader /> : <CustomerHeader />;
};

const ContentSwitcher = () => {
  const { selectedGroupId, viewMode } = useCustomerStore();

  // 1. Detail View - Handles its own scroll and padding internally
  if (viewMode === "detail") {
    return <CustomerDetailView />;
  }

  // 2. Table Views - Wrapped in a container to maintain the padding we removed from the layout
  return (
    <div className="h-full p-6 overflow-hidden">
      {selectedGroupId === "ungrouped" ? (
        <GuestTransactionsTable />
      ) : (
        <CustomerTable />
      )}
    </div>
  );
};