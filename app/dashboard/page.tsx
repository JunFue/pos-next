"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useDashboardMetrics } from "./hooks/useDashboardMetrics"; // Import the new hook
import CashOnHandCard from "./components/CashOnHandCard";
import ExpensesCard from "./components/ExpensesCard";

export default function DashboardPage() {
  // Use the hook instead of the store
  const { data: metrics, isLoading, error } = useDashboardMetrics();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>
      
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Dashboard</h1>
        <p className="text-slate-400">Overview of today's performance</p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-8">
          Error: {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pass data via props */}
          <CashOnHandCard 
            totalNetSales={metrics.totalNetSales} 
            cashFlow={metrics.cashFlow} 
          />
          <ExpensesCard 
            totalExpenses={metrics.totalExpenses} 
            cashFlow={metrics.cashFlow} 
          />
        </div>
      )}
    </div>
  );
}