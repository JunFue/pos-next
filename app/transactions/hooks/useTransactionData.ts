import { useTransactionStore } from '../store/useTransactionStore';
import { useTransactionHistory } from './useTransactionQueries';

export function useTransactionData() {
  const { currentPage, rowsPerPage, filters, setCurrentPage, setRowsPerPage, setFilters } = useTransactionStore();
  const { data, isLoading, error, refetch, isFetching } = useTransactionHistory(currentPage, rowsPerPage, filters);

  return {
    transactions: data?.data || [],
    totalRows: data?.count || 0,
    isLoading,
    isError: !!error,
    error,
    currentPage,
    rowsPerPage,
    filters,
    setCurrentPage,
    setRowsPerPage,
    setFilters,
    refresh: refetch,
    isValidating: isFetching,
  };
}
