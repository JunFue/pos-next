"use client";

import { SWRConfig } from "swr";
import { CustomerSidebar } from "./CustomerSidebar";
import { CustomerHeader } from "./CustomerHeader";
import { CustomerTable } from "./CustomerTable";
import { CreateGroupModal } from "./CreateGroupModal";
import { RegisterCustomerModal } from "./RegisterCustomerModal";

// Import types for fallback data
import { CustomerGroup, Customer, CustomerFormValues } from "../lib/types";

interface Props {
  initialData: {
    groups: CustomerGroup[];
    customers: Customer[];
  };
}

export default function CustomerFeatureLayout({ initialData }: Props) {
  return (
    // SWRConfig Hydrates the cache with server data immediately
    <SWRConfig value={{ fallback: { 'customer-feature-data': initialData } }}>
      <div className="grid grid-cols-16 h-screen max-w-screen bg-gray-900 text-gray-100 overflow-hidden font-sans">
        
        {/* Sidebar */}
        <div className="col-span-4 border border-red-700 bg-gray-800 h-full">
          <CustomerSidebar />
        </div>

        {/* Main Content */}
        <div className="col-span-12 border border-red-700 flex flex-col h-full min-w-0 bg-gray-900">
          <div className="h-20 w-full z-10">
            <CustomerHeader />
          </div>
          <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
            <CustomerTable />
          </div>
        </div>

        {/* Modals are self-contained now, connected via Zustand */}
        <CreateGroupModal /> 
        <RegisterCustomerModal />
      </div>
    </SWRConfig>
  );
}