// page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useDashboardMetrics } from "./hooks/useDashboardMetrics";
import { useDashboardLayout } from "./hooks/useDashboardLayout";
import { DashboardGrid } from "./components/DashboardGrid";

export default function DashboardPage() {
  // 1. Fetch Data
  const { data: metrics, isLoading, error } = useDashboardMetrics();
  
  // 2. Manage Sortable State
  const { items, updateOrder, isReady } = useDashboardLayout();

  // 3. Early return for loading
  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Navigation */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>
      
      <div className="mb-6">
        <h1 className="font-bold text-3xl">Dashboard</h1>
        <p className="text-slate-400">
          Personalize your view. Drag cards by the handle to reorder them.
        </p>
      </div>

      {/* Error handling */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-8">
          Error loading metrics: {(error as Error).message}
        </div>
      )}

      {/* The Dnd-Kit Grid */}
      {!error && metrics && (
        <DashboardGrid 
          metrics={metrics}
          items={items}
          onOrderChange={updateOrder}
        />
      )}
    </div>
  );
}