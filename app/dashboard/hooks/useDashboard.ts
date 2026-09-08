"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import {
  type DashboardStats,
  type InventoryStatsData,
  type ActivityItem,
} from "../lib/dashboardMockData";

import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { fetchDashboardStats, fetchDrawerMode, fetchLatestCategorySales } from "../lib/dashboard.api";
import { useExpenses } from "@/app/cashout/hooks/useExpenses";
import { createClient } from "@/utils/supabase/client";

export type FlipCardKey = "sales" | "profit" | "cash" | "cashout";
export type ExpenseCategory = "COGS" | "OPEX" | "REMIT";

export function useDashboard() {
  const { addExpense } = useExpenses();

  // ─── Date Filter ───────────────────────────────────────────────────────────
  const todayStr = dayjs().format("YYYY-MM-DD");
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const isHistorical = selectedDate !== todayStr;

  // ─── Core Data Fetching ────────────────────────────────────────────────────
  const { data: serverStats, isLoading, isFetching: isFetchingStats, refetch: refetchStats, dataUpdatedAt: statsUpdatedAt } = useQuery({
    queryKey: ["dashboard-stats", selectedDate],
    queryFn: () => fetchDashboardStats(selectedDate),
    staleTime: 1000 * 60 * 5, // 5 minutes (invalidated immediately on Supabase Realtime changes)
  });

  // ─── Drawer Mode ───────────────────────────────────────────────────────────
  const { data: drawerMode = "unified" } = useQuery({
    queryKey: ["drawer-mode"],
    queryFn: fetchDrawerMode,
    staleTime: 1000 * 60 * 30, // 30 minutes — rarely changes
  });

  const isMultiDrawer = drawerMode === "multiple";

  // ─── Categorical Cash Flow (only in multi-drawer mode) ─────────────────────
  const { data: categorySales = [], isFetching: isFetchingCategorySales, refetch: refetchCategorySales, dataUpdatedAt: categoryUpdatedAt } = useQuery({
    queryKey: ["daily-category-sales", selectedDate],
    queryFn: () => fetchLatestCategorySales(selectedDate),
    enabled: isMultiDrawer,
    staleTime: 1000 * 60 * 5,
  });

  // ─── Realtime Database & Broadcast Listener for Instant Cross-Computer Sync ────
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const handleSyncEvent = (source: string) => {
      console.log(`[Dashboard Realtime] ⚡ Sync event received via ${source} -> Refreshing metrics`);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        refetchStats();
        if (isMultiDrawer) {
          refetchCategorySales();
        }
      }, 50);
    };

    const channel = supabase
      .channel("store-live-events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        () => handleSyncEvent("postgres:expenses")
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => handleSyncEvent("postgres:payments")
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => handleSyncEvent("postgres:transactions")
      )
      .on("broadcast", { event: "TRANSACTION_COMPLETED" }, () =>
        handleSyncEvent("broadcast:TRANSACTION_COMPLETED")
      )
      .on("broadcast", { event: "CASHOUT_COMPLETED" }, () =>
        handleSyncEvent("broadcast:CASHOUT_COMPLETED")
      )
      .on("broadcast", { event: "DRAWER_UPDATED" }, () =>
        handleSyncEvent("broadcast:DRAWER_UPDATED")
      )
      .subscribe((status: string, err?: any) => {
        console.log(`[Dashboard Realtime] Channel status: ${status}`, err || "");
      });

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [selectedDate, refetchStats, isMultiDrawer, refetchCategorySales]);

  // Zeroed out stats as default instead of mock data
  const emptyStats: DashboardStats = {
    grossSales: 0,
    salesDiscount: 0,
    salesReturn: 0,
    salesAllowance: 0,
    netSales: 0,
    cashInDrawer: 0,
    cashout: {
      total: 0,
      cogs: 0,
      opex: 0,
      remittance: 0,
    },
    netProfit: 0,
  };

  const stats: DashboardStats = serverStats || emptyStats;
  const [inventoryStats] = useState<InventoryStatsData>({
    lowStock: [],
    mostStocked: { name: "N/A", qty: 0 },
    expiringSoon: [],
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  // ─── Flip Card State ───────────────────────────────────────────────────────
  const [flipped, setFlipped] = useState<Record<FlipCardKey, boolean>>({
    sales: false,
    profit: false,
    cash: false,
    cashout: false,
  });

  const toggleFlip = (card: FlipCardKey) => {
    setFlipped((prev) => ({ ...prev, [card]: !prev[card] }));
  };

  // ─── Expense / Cashout Modal State ─────────────────────────────────────────
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseReason, setExpenseReason] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>("OPEX");

  // ─── Derived Values ────────────────────────────────────────────────────────
  const CASH_LIMIT = 10000.0; // Hardcoded for now or fetch from settings
  const isHighRisk = !isHistorical && stats.cashInDrawer > CASH_LIMIT;

  // ─── Time State ────────────────────────────────────────────────────────────
  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleAddExpense = async (e: FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseReason || isHistorical) return;

    const amount = parseFloat(expenseAmount);
    const categoryMapped = expenseCategory === "REMIT" ? "REMITTANCE" : expenseCategory;

    const newActivity: ActivityItem = {
      id: Date.now(),
      type: expenseCategory,
      amount: -amount,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      desc: expenseReason,
    };

    setRecentActivity((prev) => [newActivity, ...prev].slice(0, 6));
    setIsExpenseModalOpen(false);
    setExpenseAmount("");
    setExpenseReason("");

    try {
      await addExpense({
        amount,
        notes: expenseReason,
        cashout_type: categoryMapped,
        transaction_date: selectedDate || todayStr,
      });
    } catch (err) {
      console.error("Failed to add expense from dashboard:", err);
    }
  };
  
  const handleManualRefresh = () => {
    refetchStats();
    if (isMultiDrawer) {
      refetchCategorySales();
    }
  };

  const isFetching = isFetchingStats || (isMultiDrawer && isFetchingCategorySales);
  const lastUpdatedAt = Math.max(statsUpdatedAt, isMultiDrawer ? categoryUpdatedAt : 0);

  return {
    // Date
    todayStr,
    selectedDate,
    setSelectedDate,
    isHistorical,
    time,

    // Data
    stats,
    inventoryStats,
    recentActivity,

    // Flip cards
    flipped,
    toggleFlip,

    // Expense modal
    isExpenseModalOpen,
    setIsExpenseModalOpen,
    expenseAmount,
    setExpenseAmount,
    expenseReason,
    setExpenseReason,
    expenseCategory,
    setExpenseCategory,
    handleAddExpense,

    // Derived
    isHighRisk,
    isLoading,
    isFetching,
    lastUpdatedAt,

    // Multi-drawer
    isMultiDrawer,
    categorySales,
    handleManualRefresh,
  };
}
