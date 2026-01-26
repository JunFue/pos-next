import { usePaymentStore } from '../store/usePaymentStore';
import { usePaymentHistory } from './useTransactionQueries';

export function usePaymentData() {
  const { rowsPerPage, filters, setRowsPerPage, setFilters } = usePaymentStore();
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = usePaymentHistory(rowsPerPage, filters);

  const payments = data?.pages.flatMap((page) => page.data) || [];
  const totalRows = data?.pages[0]?.count || 0;

  return {
    payments,
    totalRows,
    isLoading,
    isError: !!error,
    error,
    rowsPerPage,
    filters,
    setRowsPerPage,
    setFilters,
    refresh: refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    // Keep currentPage for compatibility
    currentPage: 1,
    setCurrentPage: () => {}, // No-op
  };
}
