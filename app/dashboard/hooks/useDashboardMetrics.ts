import { useQuery } from "@tanstack/react-query";
import { fetchDailyCashFlow } from "../lib/dashboard.api"; // Update path as needed
import dayjs from "dayjs";

export function useDashboardMetrics(date: string = dayjs().format("YYYY-MM-DD")) {
  return useQuery({
    queryKey: ["dashboard-metrics", date], // Unique key for caching
    queryFn: () => fetchDailyCashFlow(date),
    // We use 'select' to perform the calculations efficiently
    // This runs only when data changes, replacing your store's logic
    select: (cashFlow) => {
      const totalNetSales = cashFlow.reduce(
        (sum, entry) => sum + (Number(entry.balance) || 0),
        0
      );
      const totalExpenses = cashFlow.reduce(
        (sum, entry) => sum + (Number(entry.cash_out) || 0),
        0
      );

      return {
        cashFlow,
        totalNetSales,
        totalExpenses,
      };
    },
  });
}