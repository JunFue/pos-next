import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import dayjs from 'dayjs';

// --- Types ---
export interface Transaction {
  invoice_no: string;
  customer_name: string;
  grand_total: number;
  transaction_time: string;
  [key: string]: any;
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

interface DashboardState {
  metrics: DashboardMetrics;
  isLoading: boolean;
  error: Error | null;
  lastFetched: number | null;
  abortController: AbortController | null; // Add this to track pending requests
  fetchMetrics: (force?: boolean) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  metrics: initialMetrics,
  isLoading: false,
  error: null,
  lastFetched: null,
  abortController: null,

  fetchMetrics: async (force = false) => {
    const { lastFetched, isLoading, abortController } = get();
    const now = Date.now();
    const STALE_TIME = 1000 * 60 * 2; // 2 minutes

    // 1. FRESHNESS CHECK
    // If we have data, it's fresh, and we aren't forcing, return early.
    // Note: We REMOVED "if (isLoading) return" to allow overriding stuck requests.
    if (!force && lastFetched && now - lastFetched < STALE_TIME) {
       return;
    }

    // 2. ABORT PREVIOUS REQUEST
    // If a request is currently running (stuck or otherwise), kill it.
    if (abortController) {
      abortController.abort();
    }

    // Create a new controller for this specific request
    const newController = new AbortController();
    set({ isLoading: true, error: null, abortController: newController });

    try {
      // 3. DEFINE SUPABASE REQUEST (with AbortSignal)
      const supabasePromise = (async () => {
        const supabase = createClient();
        
        // Chain .abortSignal() to the RPC call
        const { data, error } = await supabase
          .rpc('get_dashboard_metrics', { lookback_days: 30 })
          .abortSignal(newController.signal);

        if (error) throw new Error(error.message);
        return data;
      })();

      // 4. DEFINE TIMEOUT (10 Seconds)
      const timeoutPromise = new Promise((_, reject) => {
        const id = setTimeout(() => {
          reject(new Error("Request timed out"));
        }, 10000);
        // Clear timeout if the request completes or is aborted to prevent leaks
        newController.signal.addEventListener('abort', () => clearTimeout(id));
      });

      // 5. RACE
      const data = (await Promise.race([supabasePromise, timeoutPromise])) as any;

      // --- Process Data ---
      const { payments, transactions, expenses, inventory } = data;

      const invoiceDateMap = new Map<string, string>();
      payments.forEach((p: any) => {
        if (p.invoice_no && p.transaction_time) invoiceDateMap.set(p.invoice_no, p.transaction_time);
      });

      const today = dayjs();

      const todayPayments = payments.filter((p: any) => dayjs(p.transaction_time).isSame(today, 'day'));
      const todaySales = todayPayments.reduce((sum: number, p: any) => sum + (Number(p.grand_total) || 0), 0);

      const todayTransactions = transactions.filter((t: any) => {
        const time = invoiceDateMap.get(t.invoice_no);
        return time && dayjs(time).isSame(today, 'day');
      });
      const todayCOGS = todayTransactions.reduce(
        (sum: number, t: any) => sum + (Number(t.cost_price) || 0) * (Number(t.quantity) || 1),
        0
      );

      const todayExpenses = expenses
        .filter((e: any) => dayjs(e.transaction_date).isSame(today, 'day'))
        .reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

      const trendMap = new Map<string, { revenue: number; cost: number; expense: number }>();
      for (let i = 29; i >= 0; i--)
        trendMap.set(dayjs().subtract(i, 'day').format('YYYY-MM-DD'), { revenue: 0, cost: 0, expense: 0 });

      payments.forEach((p: any) => {
        const d = dayjs(p.transaction_time).format('YYYY-MM-DD');
        if (trendMap.has(d)) trendMap.get(d)!.revenue += Number(p.grand_total) || 0;
      });
      transactions.forEach((t: any) => {
        const time = invoiceDateMap.get(t.invoice_no);
        if (time) {
          const d = dayjs(time).format('YYYY-MM-DD');
          if (trendMap.has(d)) trendMap.get(d)!.cost += (Number(t.cost_price) || 0) * (Number(t.quantity) || 1);
        }
      });
      expenses.forEach((e: any) => {
        const d = dayjs(e.transaction_date).format('YYYY-MM-DD');
        if (trendMap.has(d)) trendMap.get(d)!.expense += Number(e.amount) || 0;
      });

      const profitTrend = Array.from(trendMap.entries()).map(([date, val]) => ({
        date: dayjs(date).format('MMM D'),
        revenue: Number(val.revenue.toFixed(2)),
        profit: Number((val.revenue - val.cost - val.expense).toFixed(2)),
      }));

      const categoryMap = new Map();
      const productMap = new Map();
      transactions.forEach((t: any) => {
        if (invoiceDateMap.has(t.invoice_no)) {
          const cat = t.category || 'Uncategorized';
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + (Number(t.total_price) || 0));
          productMap.set(t.item_name, (productMap.get(t.item_name) || 0) + (Number(t.quantity) || 0));
        }
      });

      const categorySales = Array.from(categoryMap.entries())
        .map(([name, value]: any) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const topProducts = Array.from(productMap.entries())
        .map(([item_name, quantity]: any) => ({ item_name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      const globalThreshold =
        typeof window !== 'undefined' ? parseInt(localStorage.getItem('pos-settings-low-stock-threshold') || '10', 10) : 10;
      const lowStockItems = inventory
        .filter((i: any) => i.current_stock < (i.low_stock_threshold ?? globalThreshold))
        .map((i: any) => ({
          id: i.item_id,
          item_name: i.item_name,
          stock: i.current_stock,
          threshold: i.low_stock_threshold ?? globalThreshold,
        }))
        .slice(0, 5);

      const recentTransactions = payments
        .sort((a: any, b: any) => dayjs(b.transaction_time).unix() - dayjs(a.transaction_time).unix())
        .slice(0, 5);

      const processedMetrics = {
        totalCustomers: new Set(payments.map((c: any) => c.customer_name)).size,
        dailySales: todaySales,
        netProfit: todaySales - todayCOGS - todayExpenses,
        recentTransactions,
        profitTrend,
        categorySales,
        lowStockItems,
        topProducts,
      };

      set({ metrics: processedMetrics, isLoading: false, lastFetched: now, abortController: null });
    
    } catch (error: any) {
      // 6. ERROR HANDLING
      // If the error is an AbortError (cancelled by new request), do NOT update state.
      // This leaves the loading state true for the NEW request that cancelled this one.
      if (error.name === 'AbortError' || error.message.includes('aborted')) {
         console.log('Previous fetch aborted');
         return; 
      }

      console.error("Dashboard Fetch Error:", error);
      set({ error, isLoading: false, abortController: null });
    }
  },
}));