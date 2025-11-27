import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";
import { useAuth } from "@/context/AuthContext";

// --- Interfaces (Keep these same as before) ---
export interface Transaction {
  invoice_no: string;
  customer_name: string;
  grand_total: number;
  transaction_time: string;
}

export interface DashboardMetrics {
  totalCustomers: number;
  dailySales: number;
  netProfit: number;
  recentTransactions: Transaction[];
  profitTrend: { date: string; revenue: number; profit: number }[];
  categorySales: { name: string; value: number }[];
  lowStockItems: { id: string; item_name: string; stock: number; threshold?: number }[];
  topProducts: { item_name: string; quantity: number }[];
}

const initialMetrics: DashboardMetrics = {
  totalCustomers: 0,
  dailySales: 0,
  netProfit: 0,
  recentTransactions: [],
  profitTrend: [],
  categorySales: [],
  lowStockItems: [],
  topProducts: [],
};

export function useDashboardData() {
  const { isAuthReady } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics);

  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchDashboardData = useCallback(async (isRetry = false) => {
    // 1. Abort previous requests
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }

      // 2. CHECK CONNECTION FIRST
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error("No internet connection.");
      }

      // 3. AUTH CHECK
      // We rely on the global AuthContext to handle session recovery on wake-up.
      // Here we just ensure we have a user before proceeding.
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
         // If getUser fails, it might be the zombie connection issue, 
         // but AuthContext should be triggering a refresh in parallel if we just woke up.
         // We can try one simple retry or just fail.
         if (!isRetry) {
            console.warn("Auth check failed. Retrying once...");
            return fetchDashboardData(true);
         }
         throw new Error("Session expired or connection lost. Please refresh.");
      }

      // 4. FETCH DATA (Standard Logic)
      // 15s Timeout for DB operations
      const dbTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("DB_TIMEOUT")), 15000)
      );

      const dbOpPromise = async () => {
        const [payments, transactions, expenses, inventory] = await Promise.all([
          supabase.from("payments").select("invoice_no, customer_name, grand_total, transaction_time").abortSignal(controller.signal),
          supabase.from("transactions").select("item_name, total_price, cost_price, quantity, category, invoice_no").abortSignal(controller.signal),
          supabase.from("expenses").select("amount, transaction_date").abortSignal(controller.signal),
          supabase.from("inventory_monitor_view").select("item_id, item_name, current_stock, low_stock_threshold").order("current_stock", { ascending: true }).abortSignal(controller.signal)
        ]);
        
        if (controller.signal.aborted) throw new Error("ABORTED");
        if (payments.error) throw payments.error;
        if (transactions.error) throw transactions.error;
        if (expenses.error) throw expenses.error;
        if (inventory.error) throw inventory.error;

        return { 
          paymentsData: payments.data || [], 
          transactionsData: transactions.data || [], 
          expensesData: expenses.data || [], 
          inventoryData: inventory.data || [] 
        };
      };

      const result = await Promise.race([dbOpPromise(), dbTimeoutPromise]) as any;
      
      if (!isMounted.current) return;

      // --- PROCESS DATA ---
      const { paymentsData, transactionsData, expensesData, inventoryData } = result;

      // Invoice Date Map
      const invoiceDateMap = new Map<string, string>();
      paymentsData.forEach((p: any) => {
        if (p.invoice_no && p.transaction_time) invoiceDateMap.set(p.invoice_no, p.transaction_time);
      });

      // Calcs
      const uniqueCustomers = new Set(paymentsData.map((c: any) => c.customer_name).filter(Boolean)).size;
      const today = dayjs();
      
      const todayPayments = paymentsData.filter((p: any) => p.transaction_time && dayjs(p.transaction_time).isSame(today, 'day'));
      const todaySales = todayPayments.reduce((sum: number, p: any) => sum + (Number(p.grand_total) || 0), 0);

      const todayTransactions = transactionsData.filter((t: any) => {
        const time = invoiceDateMap.get(t.invoice_no);
        return time && dayjs(time).isSame(today, 'day');
      });
      const todayCOGS = todayTransactions.reduce((sum: number, t: any) => sum + ((Number(t.cost_price) || 0) * (Number(t.quantity) || 1)), 0);

      const todayExpenses = expensesData.filter((e: any) => dayjs(e.transaction_date).isSame(today, 'day'))
        .reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

      // Trend
      const trendMap = new Map<string, { revenue: number; cost: number; expense: number }>();
      for (let i = 29; i >= 0; i--) trendMap.set(dayjs().subtract(i, 'day').format('YYYY-MM-DD'), { revenue: 0, cost: 0, expense: 0 });
      
      paymentsData.forEach((p: any) => {
         if(!p.transaction_time) return;
         const d = dayjs(p.transaction_time).format('YYYY-MM-DD');
         if(trendMap.has(d)) trendMap.get(d)!.revenue += Number(p.grand_total) || 0;
      });
      transactionsData.forEach((t: any) => {
         const time = invoiceDateMap.get(t.invoice_no);
         if(time) {
            const d = dayjs(time).format('YYYY-MM-DD');
            if(trendMap.has(d)) trendMap.get(d)!.cost += (Number(t.cost_price) || 0) * (Number(t.quantity) || 1);
         }
      });
      expensesData.forEach((e: any) => {
         if(!e.transaction_date) return;
         const d = dayjs(e.transaction_date).format('YYYY-MM-DD');
         if(trendMap.has(d)) trendMap.get(d)!.expense += Number(e.amount) || 0;
      });
      const profitTrend = Array.from(trendMap.entries()).map(([date, val]) => ({
         date: dayjs(date).format('MMM D'),
         revenue: Number(val.revenue.toFixed(2)),
         profit: Number((val.revenue - val.cost - val.expense).toFixed(2))
      }));

      // Cats & Products
      const categoryMap = new Map();
      const productMap = new Map();
      transactionsData.forEach((t: any) => {
         categoryMap.set(t.category || "Uncategorized", (categoryMap.get(t.category || "Uncategorized") || 0) + (Number(t.total_price) || 0));
         productMap.set(t.item_name, (productMap.get(t.item_name) || 0) + (Number(t.quantity) || 0));
      });
      const categorySales = Array.from(categoryMap.entries()).map(([name, value]: any) => ({ name, value })).sort((a, b) => b.value - a.value);
      const topProducts = Array.from(productMap.entries()).map(([item_name, quantity]: any) => ({ item_name, quantity })).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

      // Low Stock
      const globalThreshold = typeof window !== 'undefined' ? parseInt(localStorage.getItem('pos-settings-low-stock-threshold') || '10', 10) : 10;
      const lowStockItems = inventoryData.filter((i: any) => i.current_stock < (i.low_stock_threshold ?? globalThreshold))
        .map((i: any) => ({ id: i.item_id, item_name: i.item_name, stock: i.current_stock, threshold: i.low_stock_threshold ?? globalThreshold })).slice(0, 5);
      
      const recentTransactions = paymentsData.sort((a: any, b: any) => dayjs(b.transaction_time).unix() - dayjs(a.transaction_time).unix()).slice(0, 5);

      setMetrics({
        totalCustomers: uniqueCustomers,
        dailySales: todaySales,
        netProfit: todaySales - todayCOGS - todayExpenses,
        recentTransactions,
        profitTrend,
        categorySales,
        lowStockItems,
        topProducts
      });
    } catch (err: any) {
      if (err.message === "ABORTED") return;
      console.error("Dashboard Fetch Error:", err);
      if (isMounted.current) {
         setError(err.message === "DB_TIMEOUT" ? "Connection slow. Please retry." : err.message);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []); // Intentionally empty deps to avoid loops, we call it manually

  // --- EFFECT 1: Initial Load & Auth Watchdog ---
  useEffect(() => {
    isMounted.current = true;
    if (isAuthReady) {
      fetchDashboardData();
    }
    return () => { isMounted.current = false; };
  }, [isAuthReady, fetchDashboardData]);

  // --- EFFECT 2: Handle Tab Sleep / Visibility Change ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If user comes back to the tab (visible) and it's been idle
      if (document.visibilityState === 'visible' && isAuthReady) {
        console.log("Tab woke up. Refreshing data...");
        fetchDashboardData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthReady, fetchDashboardData]);

  return { metrics, loading, error, refetch: () => fetchDashboardData() };
}