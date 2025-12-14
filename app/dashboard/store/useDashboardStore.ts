import { create } from "zustand";
import { fetchDailyCashFlow, CashFlowEntry } from "../lib/dashboard.api";
import dayjs from "dayjs";

export interface DashboardMetrics {
  cashFlow: CashFlowEntry[];
  totalNetSales: number;
  totalExpenses: number;
  isLoading: boolean;
  error: string | null;
}

interface DashboardState {
  metrics: DashboardMetrics;
  fetchMetrics: (date?: string) => Promise<void>;
  resetMetrics: () => void;
}

const initialMetrics: DashboardMetrics = {
  cashFlow: [],
  totalNetSales: 0,
  totalExpenses: 0,
  isLoading: false,
  error: null,
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  metrics: initialMetrics,

  fetchMetrics: async (date = dayjs().format("YYYY-MM-DD")) => {
    // Always start loading. We do NOT check for cache here to ensure data is fresh.
    set((state) => ({
      metrics: { ...state.metrics, isLoading: true, error: null },
    }));

    try {
      // No AbortSignal passed here anymore
      const cashFlow = await fetchDailyCashFlow(date);

      const totalNetSales = cashFlow.reduce((sum, entry) => sum + (Number(entry.balance) || 0), 0);
      const totalExpenses = cashFlow.reduce((sum, entry) => sum + (Number(entry.cash_out) || 0), 0);

      // Simple update - no race condition checks needed because we aren't cancelling
      set({
        metrics: {
          cashFlow,
          totalNetSales,
          totalExpenses,
          isLoading: false,
          error: null,
        },
      });
    } catch (error: any) {
      console.error("Dashboard Store Error:", error);
      // Always turn off loading, even if there's an error
      set((state) => ({
        metrics: { ...state.metrics, isLoading: false, error: error.message },
      }));
    }
  },

  resetMetrics: () => {
    // Simply reset to initial state
    set({ metrics: initialMetrics });
  },
}));