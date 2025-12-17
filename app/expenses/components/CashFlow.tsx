"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { 
  fetchFlowCategories, 
  fetchCashFlowLedger, 
  DateRange,
  CashFlowEntry 
} from "../lib/cashflow.api"; 
import { Filter, Calendar, Loader2, Download } from "lucide-react";
import { DataGrid, Column } from "react-data-grid";
import "react-data-grid/lib/styles.css"; // Essential for the grid to render correctly

export function CashFlow() {
  // --- State Management ---
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Default to current month
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  });

  // --- 1. Fetch Categories ---
  const { data: categories = [] } = useSWR("flow-categories", fetchFlowCategories);

  // Auto-select first category
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  // --- 2. Fetch Ledger Data ---
  const { data: ledger = [], isLoading } = useSWR(
    selectedCategory ? ["cash-flow-ledger", selectedCategory, dateRange] : null,
    ([_, category, range]) => fetchCashFlowLedger(category, range)
  );

  // --- 3. Grid Configuration ---
  const headerClass = "bg-slate-900/80 text-slate-400 font-semibold uppercase text-xs flex items-center pl-4";
  const cellClass = "text-slate-300 text-sm flex items-center pl-4 h-full";

  const columns: Column<CashFlowEntry>[] = [
    {
      key: "date",
      name: "Date",
      headerCellClass: headerClass,
      cellClass: cellClass,
      width: 150,
      renderCell: ({ row }) => (
        <span>
          {new Date(row.date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      ),
    },
    {
      key: "forwarded",
      name: "Forwarded",
      headerCellClass: headerClass,
      cellClass: `${cellClass} font-mono text-slate-400 justify-end pr-6`,
      width: 150,
      renderCell: ({ row }) => (
        <span>₱{row.forwarded.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      key: "cash_in",
      name: "Cash In",
      headerCellClass: headerClass,
      cellClass: `${cellClass} font-mono text-green-400 justify-end pr-6`,
      width: 150,
      renderCell: ({ row }) => (
        <span>
            {row.cash_in > 0 ? `+₱${row.cash_in.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
        </span>
      ),
    },
    {
      key: "cash_out",
      name: "Cash Out",
      headerCellClass: headerClass,
      cellClass: `${cellClass} font-mono text-red-400 justify-end pr-6`,
      width: 150,
      renderCell: ({ row }) => (
        <span>
             {row.cash_out > 0 ? `-₱${row.cash_out.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
        </span>
      ),
    },
    {
      key: "balance",
      name: "Balance",
      headerCellClass: headerClass,
      cellClass: `${cellClass} font-mono font-bold text-white bg-slate-800/30 justify-end pr-6`,
      width: 180,
      renderCell: ({ row }) => (
        <span>₱{row.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* --- Controls Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-slate-900/50 p-4 border border-slate-800 rounded-xl glass-effect">
        
        {/* Left: Filters */}
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Category Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <Filter className="w-3 h-3" /> Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-48 p-2.5"
            >
              {categories.length === 0 && <option>Loading...</option>}
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <Calendar className="w-3 h-3" /> Date Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
              />
              <span className="text-slate-500">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
              />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors">
                <Download className="w-4 h-4" /> Export CSV
            </button>
        </div>
      </div>

      {/* --- Data Grid --- */}
      <div className="glass-effect rounded-xl border border-slate-800 overflow-hidden h-[600px] relative">
        {isLoading ? (
             <div className="absolute inset-0 flex justify-center items-center gap-2 text-slate-400 z-10 bg-slate-900/50">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Loading ledger data...</span>
             </div>
        ) : ledger.length === 0 ? (
            <div className="absolute inset-0 flex justify-center items-center text-slate-500 italic z-10">
                No transactions found for this period.
            </div>
        ) : null}

        <DataGrid
            columns={columns}
            rows={ledger}
            rowKeyGetter={(row) => `${row.date}-${row.category}`} 
            className="rdg-dark border-none h-full"
            rowClass={() => "hover:bg-slate-800/30 transition-colors"}
        />
      </div>
    </div>
  );
}