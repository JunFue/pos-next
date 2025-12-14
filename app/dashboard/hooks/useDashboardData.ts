import { useEffect, useRef } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';

export type { DashboardMetrics, Transaction } from '../store/useDashboardStore';

export function useDashboardData() {
  const { metrics, isLoading, error, fetchMetrics } = useDashboardStore();
  
  // Prevent strict mode double-fetch, but allow re-mounting to trigger logic
  const hasInitiatedFetch = useRef(false);

  useEffect(() => {
    if (hasInitiatedFetch.current) return;
    hasInitiatedFetch.current = true;

    // Just call fetch. The store will handle aborting previous stuck requests.
    fetchMetrics(); 
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refetch: () => fetchMetrics(true),
  };
}