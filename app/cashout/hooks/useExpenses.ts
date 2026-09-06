import { useQuery, useQueryClient, useInfiniteQuery, keepPreviousData, InfiniteData } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import {
  fetchExpenses,
  fetchExpensesPaginated,
  createExpense,
  updateExpense,
  deleteExpense,
  fetchExpensesSummary,
  fetchUserPermissions,
  fetchCurrentBalance,
  CashoutInput,
  CashoutRecord,
  CashoutPermissions,
} from "../lib/cashout.api";

export interface DateRange {
  start: string;
  end: string;
}

// Extended type for optimistic UI
type OptimisticCashoutRecord = CashoutRecord & {
  _optimistic?: boolean;
  _syncing?: boolean;
};

interface CashoutPage {
  data: OptimisticCashoutRecord[];
  count: number;
  nextPage?: number;
}

// Shared query key prefix for all expense-related data
const EXPENSES_KEY = "expenses";

// Original hook for backwards compatibility
export function useExpenses(dateRange?: DateRange) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryKey = useMemo(
    () => [EXPENSES_KEY, "list", dateRange?.start, dateRange?.end],
    [dateRange?.start, dateRange?.end]
  );

  const { data: expenses, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchExpenses(dateRange?.start, dateRange?.end),
  });

  const addExpense = useCallback(
    async (data: CashoutInput) => {
      setIsSubmitting(true);

      // 1. Update Summary Cache
      const summaryKey = [EXPENSES_KEY, "summary", dateRange?.start, dateRange?.end];
      queryClient.setQueryData<{ totalAmount: number; totalCount: number }>(summaryKey, (old) => {
        if (!old) return old;
        return {
          totalAmount: old.totalAmount + data.amount,
          totalCount: old.totalCount + 1,
        };
      });

      // 2. Update Balance Cache
      const balanceKey = [EXPENSES_KEY, "balance"];
      queryClient.setQueryData<number>(balanceKey, (old) => {
        if (old === undefined) return old;
        return old - data.amount;
      });

      try {
        await createExpense(data);
        // Invalidate to ensure freshness
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
        await queryClient.invalidateQueries({ queryKey: ["stocks"] });
        await queryClient.invalidateQueries({ queryKey: ["inventory"] });
        await queryClient.invalidateQueries({ queryKey: ["daily-category-sales"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      } catch (error) {
        // Invalidate on error to restore correct data
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
        await queryClient.invalidateQueries({ queryKey: ["daily-category-sales"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient, dateRange]
  );

  const editExpense = useCallback(
    async (id: string, data: CashoutInput) => {
      setIsSubmitting(true);

      // Try to find the original amount from various caches to calculate the difference
      // This is a bit tricky since useExpenses doesn't know about infinite pages, 
      // but they share the same queryClient.
      const listData = queryClient.getQueryData<CashoutRecord[]>(queryKey);
      const originalRecord = listData?.find(e => e.id === id);
      
      // Also check infinite cache if not found in list
      let originalAmount = originalRecord?.amount;
      if (originalAmount === undefined) {
          const infiniteData = queryClient.getQueryData<InfiniteData<CashoutPage>>([EXPENSES_KEY, "infinite", 20, dateRange?.start, dateRange?.end]);
          originalAmount = infiniteData?.pages.flatMap(p => p.data).find(e => e.id === id)?.amount || 0;
      }
      
      const amountDiff = data.amount - originalAmount;

      // 1. Update Summary
      const summaryKey = [EXPENSES_KEY, "summary", dateRange?.start, dateRange?.end];
      queryClient.setQueryData<{ totalAmount: number; totalCount: number }>(summaryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          totalAmount: old.totalAmount + amountDiff,
        };
      });

      // 2. Update Balance
      const balanceKey = [EXPENSES_KEY, "balance"];
      queryClient.setQueryData<number>(balanceKey, (old) => {
        if (old === undefined) return old;
        return old - amountDiff;
      });

      try {
        await updateExpense(id, data);
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
        await queryClient.invalidateQueries({ queryKey: ["daily-category-sales"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      } catch (error) {
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
        await queryClient.invalidateQueries({ queryKey: ["daily-category-sales"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient, queryKey, dateRange]
  );

  const removeExpense = useCallback(
    async (id: string) => {
      // Find amount for summary/balance update
      const listData = queryClient.getQueryData<CashoutRecord[]>(queryKey);
      const originalRecord = listData?.find(e => e.id === id);
      
      let originalAmount = originalRecord?.amount;
      if (originalAmount === undefined) {
          const infiniteData = queryClient.getQueryData<InfiniteData<CashoutPage>>([EXPENSES_KEY, "infinite", 20, dateRange?.start, dateRange?.end]);
          originalAmount = infiniteData?.pages.flatMap(p => p.data).find(e => e.id === id)?.amount || 0;
      }

      // 1. Update Summary
      const summaryKey = [EXPENSES_KEY, "summary", dateRange?.start, dateRange?.end];
      queryClient.setQueryData<{ totalAmount: number; totalCount: number }>(summaryKey, (old) => {
        if (!old) return old;
        return {
          totalAmount: old.totalAmount - originalAmount,
          totalCount: old.totalCount - 1,
        };
      });

      // 2. Update Balance
      const balanceKey = [EXPENSES_KEY, "balance"];
      queryClient.setQueryData<number>(balanceKey, (old) => {
        if (old === undefined) return old;
        return old + originalAmount;
      });

      try {
        await deleteExpense(id);
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
        await queryClient.invalidateQueries({ queryKey: ["daily-category-sales"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      } catch (error) {
        console.error("Failed to delete expense:", error);
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
        await queryClient.invalidateQueries({ queryKey: ["daily-category-sales"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        throw error;
      }
    },
    [queryClient, queryKey, dateRange]
  );

  return {
    expenses: expenses || [],
    isLoading,
    isSubmitting,
    addExpense,
    editExpense,
    removeExpense,
    refresh: useCallback(
      () => {
        queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
        queryClient.invalidateQueries({ queryKey: ["daily-category-sales"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      },
      [queryClient]
    ),
  };
}

// New hook for infinite scroll with optimistic updates
export function useExpensesInfinite(pageSize: number = 30, dateRange?: DateRange) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryKey = useMemo(
    () => [EXPENSES_KEY, "infinite", pageSize, dateRange?.start, dateRange?.end],
    [pageSize, dateRange?.start, dateRange?.end]
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const result = await fetchExpensesPaginated(
        pageParam as number,
        pageSize,
        dateRange?.start,
        dateRange?.end
      );
      return {
        data: result.data,
        count: result.count,
        nextPage: result.data.length === pageSize ? (pageParam as number) + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  });

  // Flatten pages into a single list
  const expenses: OptimisticCashoutRecord[] = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  const totalRecords = data?.pages[0]?.count ?? 0;

  // Optimistic Add
  const addExpenseOptimistic = useCallback(
    async (input: CashoutInput) => {
      setIsSubmitting(true);
      const tempId = `temp-${Date.now()}`;
      // Basic optimistic record - simplified
      const optimistic: OptimisticCashoutRecord = {
        id: tempId,
        date: input.transaction_date,
        timestamp: new Date().toLocaleTimeString(),
        created_at: new Date().toISOString(),
        category: input.cashout_type,
        amount: input.amount,
        notes: input.notes,
        receiptNo: input.receipt_no,
        expenseCategory: input.expenseCategory, // approximate
        product: input.product || input.source, // approximate
        _optimistic: true,
        _syncing: true,
      };

      // 1. Update Infinite Query Cache
      queryClient.setQueryData<InfiniteData<CashoutPage>>(queryKey, (old) => {
        if (!old) return old;
        const newPages = [...old.pages];
        newPages[0] = {
          ...newPages[0],
          data: [optimistic, ...newPages[0].data],
        };
        return { ...old, pages: newPages };
      });

      // 2. Update Summary Query Cache
      const summaryKey = [EXPENSES_KEY, "summary", dateRange?.start, dateRange?.end];
      queryClient.setQueryData<{ totalAmount: number; totalCount: number }>(summaryKey, (old) => {
        if (!old) return old;
        return {
          totalAmount: old.totalAmount + input.amount,
          totalCount: old.totalCount + 1,
        };
      });

      // 3. Update Balance Query Cache
      const balanceKey = [EXPENSES_KEY, "balance"];
      queryClient.setQueryData<number>(balanceKey, (old) => {
        if (old === undefined) return old;
        return old - input.amount;
      });

      try {
        await createExpense(input);
        // Invalidate all expense queries to ensure freshness everywhere
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
        await queryClient.invalidateQueries({ queryKey: ["stocks"] });
        await queryClient.invalidateQueries({ queryKey: ["inventory"] });
        await queryClient.invalidateQueries({ queryKey: ["daily-category-sales"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      } catch (error) {
        // Rollback on error
        queryClient.setQueryData<InfiniteData<CashoutPage>>(queryKey, (old) => {
          if (!old) return old;
          const newPages = old.pages.map((page) => ({
            ...page,
            data: page.data.filter((e) => e.id !== tempId),
          }));
          return { ...old, pages: newPages };
        });
        // Invalidate summaries/balance on error to restore correct data
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
        await queryClient.invalidateQueries({ queryKey: ["daily-category-sales"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient, queryKey, dateRange]
  );

  // Optimistic Edit
  const editExpenseOptimistic = useCallback(
    async (id: string, input: CashoutInput) => {
      setIsSubmitting(true);
      
      // Get previous amount for calculations
      const pages = queryClient.getQueryData<InfiniteData<CashoutPage>>(queryKey)?.pages;
      const originalRecord = pages?.flatMap(p => p.data).find(e => e.id === id);
      const originalAmount = originalRecord?.amount || 0;
      const amountDiff = input.amount - originalAmount;

      // 1. Update Infinite Query
      queryClient.setQueryData<InfiniteData<CashoutPage>>(queryKey, (old) => {
        if (!old) return old;
        const newPages = old.pages.map((page) => ({
          ...page,
          data: page.data.map((e) =>
            e.id === id
              ? {
                  ...e,
                  date: input.transaction_date,
                  category: input.cashout_type,
                  amount: input.amount,
                  notes: input.notes,
                  receiptNo: input.receipt_no,
                  product: input.product,
                  manufacturer: input.manufacturer,
                  referenceNo: input.referenceNo,
                  subTypeLabel: input.subTypeLabel,
                  _syncing: true,
                }
              : e
          ),
        }));
        return { ...old, pages: newPages };
      });

      // 2. Update Summary
      const summaryKey = [EXPENSES_KEY, "summary", dateRange?.start, dateRange?.end];
      queryClient.setQueryData<{ totalAmount: number; totalCount: number }>(summaryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          totalAmount: old.totalAmount + amountDiff,
        };
      });

      // 3. Update Balance
      const balanceKey = [EXPENSES_KEY, "balance"];
      queryClient.setQueryData<number>(balanceKey, (old) => {
        if (old === undefined) return old;
        return old - amountDiff;
      });

      try {
        await updateExpense(id, input);
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
        await queryClient.invalidateQueries({ queryKey: ["daily-category-sales"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      } catch (error) {
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
        await queryClient.invalidateQueries({ queryKey: ["daily-category-sales"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient, queryKey, dateRange]
  );

  // Optimistic Delete
  const removeExpenseOptimistic = useCallback(
    async (id: string) => {
      setIsSubmitting(true);

      // Get amount for calculations
      const pages = queryClient.getQueryData<InfiniteData<CashoutPage>>(queryKey)?.pages;
      const originalRecord = pages?.flatMap(p => p.data).find(e => e.id === id);
      const originalAmount = originalRecord?.amount || 0;

      // 1. Update Infinite Query
      queryClient.setQueryData<InfiniteData<CashoutPage>>(queryKey, (old) => {
        if (!old) return old;
        const newPages = old.pages.map((page) => ({
          ...page,
          data: page.data.filter((e) => e.id !== id),
        }));
        return { ...old, pages: newPages };
      });

      // 2. Update Summary
      const summaryKey = [EXPENSES_KEY, "summary", dateRange?.start, dateRange?.end];
      queryClient.setQueryData<{ totalAmount: number; totalCount: number }>(summaryKey, (old) => {
        if (!old) return old;
        return {
          totalAmount: old.totalAmount - originalAmount,
          totalCount: old.totalCount - 1,
        };
      });

      // 3. Update Balance
      const balanceKey = [EXPENSES_KEY, "balance"];
      queryClient.setQueryData<number>(balanceKey, (old) => {
        if (old === undefined) return old;
        return old + originalAmount;
      });

      try {
        await deleteExpense(id);
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
        await queryClient.invalidateQueries({ queryKey: ["daily-category-sales"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      } catch (error) {
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
        await queryClient.invalidateQueries({ queryKey: ["daily-category-sales"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient, queryKey, dateRange]
  );

  return {
    expenses,
    isLoading,
    isSubmitting,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    totalRecords,
    addExpense: addExpenseOptimistic,
    editExpense: editExpenseOptimistic,
    removeExpense: removeExpenseOptimistic,
    refresh: useCallback(
      () => {
        queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
        queryClient.invalidateQueries({ queryKey: ["daily-category-sales"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      },
      [queryClient]
    ),
  };
}


// Hook for fetching permissions
export function useCashoutPermissions() {
  const { data: permissions, isLoading } = useQuery({
    queryKey: [EXPENSES_KEY, "permissions"],
    queryFn: fetchUserPermissions,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  return {
    permissions: permissions || { can_manage_expenses: false },
    isLoading,
  };
}


// Hook for summary cards
export function useExpensesSummary(dateRange?: DateRange) {
  const queryKey = useMemo(
    () => [EXPENSES_KEY, "summary", dateRange?.start, dateRange?.end],
    [dateRange?.start, dateRange?.end]
  );

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchExpensesSummary(dateRange?.start, dateRange?.end),
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 1000 * 15, // 15 seconds auto-refresh fallback
  });

  return {
    summary: data || { totalAmount: 0, totalCount: 0 },
    isLoading,
    isFetching,
    error,
    refetch,
  };
}


// Hook for current cash balance with date support & fast refresh
export function useCurrentBalance(date?: string) {
  const { data: balance = 0, isLoading, isFetching, refetch } = useQuery({
    queryKey: [EXPENSES_KEY, "balance", date],
    queryFn: () => fetchCurrentBalance(date),
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 1000 * 15, // 15 seconds auto-refresh fallback
  });

  return {
    balance: Number(balance) || 0,
    isLoading,
    isFetching,
    refetch,
  };
}
