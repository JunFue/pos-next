"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useDashboardStore } from "./store/useDashboardStore";
import CashOnHandCard from "./components/CashOnHandCard";
import ExpensesCard from "./components/ExpensesCard";

export default function DashboardPage() {
  // 1. Remove resetMetrics from destructuring
  const { fetchMetrics, metrics } = useDashboardStore();
  const { isLoading, error } = metrics;

  useEffect(() => {
    fetchMetrics();
    
    // 2. REMOVED the cleanup function:
    // return () => { resetMetrics(); };
    // We let the data persist in the store so it's instantly available 
    // when the user returns (Stale-While-Revalidate pattern).
  }, [fetchMetrics]);

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

      {/* Only show big spinner if we have NO data and we are loading */}
      {isLoading && metrics.cashFlow.length === 0 && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-8">
          Error: {error}
        </div>
      )}

      {/* Show content if we have data (even if refreshing) */}
      {/* This ensures the user always sees something if data exists */}
      {(metrics.cashFlow.length > 0 || (!isLoading && !error)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CashOnHandCard />
          <ExpensesCard />
        </div>
      )}
    </div>
  );
}