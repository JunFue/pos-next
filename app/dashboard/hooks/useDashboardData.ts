import { useEffect, useRef } from "react";
import { useDashboardStore } from "../store/useDashboardStore";

export type { DashboardMetrics, Transaction } from "../store/useDashboardStore";

export function useDashboardData() {
  const { metrics, isLoading, error, fetchMetrics, abortRequest } =
    useDashboardStore();
  const hasInitiatedFetch = useRef(false);

  useEffect(() => {
    // Prevent strict mode double-fetch
    if (hasInitiatedFetch.current) return;
    hasInitiatedFetch.current = true;

    fetchMetrics();

    // CLEANUP: Kill the request if the user leaves the page
    return () => {
      abortRequest();
      hasInitiatedFetch.current = false;
    };
  }, [fetchMetrics, abortRequest]);

  return { metrics, isLoading, error, refetch: () => fetchMetrics(true) };
}
