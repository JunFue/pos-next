import { useQuery, useQueryClient, useInfiniteQuery, keepPreviousData, InfiniteData, QueryClient } from "@tanstack/react-query";
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
  CashoutType,
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

export type CategorySaleItem = {
  category: string;
  cash_in: number;
  balance: number;
  _optimistic?: boolean;
};

// Helper: Optimistically update drawer breakdown in cache
const updateDrawerBreakdownCache = (
  queryClient: QueryClient,
  amountDelta: number, // negative for deductions, positive for refunds/reversals
  categoryId?: string,
  drawerName?: string
) => {
  const drawers = queryClient.getQueryData<any[]>(["drawers"]) || [];
  const resolvedName = drawerName || drawers.find((d: any) => d.id === categoryId)?.category;

  queryClient.setQueriesData<CategorySaleItem[]>({ queryKey: ["daily-category-sales"] }, (old) => {
    if (!old || !Array.isArray(old)) return old;
    if (old.length === 1) {
      return [{
        ...old[0],
        balance: old[0].balance + amountDelta,
        _optimistic: true,
      }];
    }
    return old.map((d) => {
      const isMatch = (resolvedName && d.category.toLowerCase() === resolvedName.toLowerCase()) ||
                      (categoryId && d.category === categoryId);
      if (isMatch) {
        return {
          ...d,
          balance: d.balance + amountDelta,
          _optimistic: true,
        };
      }
      return d;
    });
  });
};

// Helper: Optimistically update dashboard stats in cache
const updateDashboardStatsCache = (
  queryClient: QueryClient,
  amountDelta: number, // positive when cashout increases (money leaves drawer), negative when cashout decreases (reversals/edits)
  category?: CashoutType
) => {
  const defaultStats = {
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

  queryClient.setQueriesData<any>({ queryKey: ["dashboard-stats"] }, (old: any) => {
    const base = old || defaultStats;
    
    const isCogs = category === "COGS";
    const isOpex = category === "OPEX";
    const isRemit = category === "REMITTANCE";

    const cogsDelta = isCogs ? amountDelta : 0;
    const opexDelta = isOpex ? amountDelta : 0;
    const remitDelta = isRemit ? amountDelta : 0;
    const profitDelta = (isCogs || isOpex) ? -amountDelta : 0;

    return {
      ...base,
      cashInDrawer: (base.cashInDrawer || 0) - amountDelta,
      cashout: {
        total: (base.cashout?.total || 0) + amountDelta,
        cogs: (base.cashout?.cogs || 0) + cogsDelta,
        opex: (base.cashout?.opex || 0) + opexDelta,
        remittance: (base.cashout?.remittance || 0) + remitDelta,
      },
      netProfit: (base.netProfit || 0) + profitDelta,
      _optimistic: true,
    };
  });
};

// Helper: Invalidate all cashflow/inventory queries after mutation settles
const invalidateCashoutQueries = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] }),
    queryClient.invalidateQueries({ queryKey: ["daily-category-sales"] }),
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
    queryClient.invalidateQueries({ queryKey: ["stocks"] }),
    queryClient.invalidateQueries({ queryKey: ["inventory"] }),
  ]);
};

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
      queryClient.setQueriesData<{ totalAmount: number; totalCount: number; _optimistic?: boolean }>(
        { queryKey: [EXPENSES_KEY, "summary"] },
        (old) => {
          if (!old) return old;
          return {
            totalAmount: old.totalAmount + data.amount,
            totalCount: old.totalCount + 1,
            _optimistic: true,
          };
        }
      );

      // 2. Update Balance Cache (Instant Total Cash Remaining update)
      queryClient.setQueriesData<number>({ queryKey: [EXPENSES_KEY, "balance"] }, (old) => {
        if (old === undefined) return old;
        return old - data.amount;
      });

      // 3. Update Drawer Breakdown Cache (Instant Backside update)
      updateDrawerBreakdownCache(queryClient, -data.amount, data.category_id);

      // 4. Update Dashboard Stats Cache (Instant Dashboard vitals update)
      updateDashboardStatsCache(queryClient, data.amount, data.cashout_type);

      try {
        await createExpense(data);
        await invalidateCashoutQueries(queryClient);
      } catch (error) {
        await invalidateCashoutQueries(queryClient);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient]
  );

  const editExpense = useCallback(
    async (id: string, data: CashoutInput) => {
      setIsSubmitting(true);

      const listData = queryClient.getQueryData<CashoutRecord[]>(queryKey);
      const originalRecord = listData?.find((e) => e.id === id);
      
      let originalAmount = originalRecord?.amount;
      if (originalAmount === undefined) {
        const infiniteData = queryClient.getQueryData<InfiniteData<CashoutPage>>([
          EXPENSES_KEY,
          "infinite",
          20,
          dateRange?.start,
          dateRange?.end,
        ]);
        originalAmount = infiniteData?.pages.flatMap((p) => p.data).find((e) => e.id === id)?.amount || 0;
      }
      
      const amountDiff = data.amount - originalAmount;

      // 1. Update Summary
      queryClient.setQueriesData<{ totalAmount: number; totalCount: number; _optimistic?: boolean }>(
        { queryKey: [EXPENSES_KEY, "summary"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            totalAmount: old.totalAmount + amountDiff,
            _optimistic: true,
          };
        }
      );

      // 2. Update Balance
      queryClient.setQueriesData<number>({ queryKey: [EXPENSES_KEY, "balance"] }, (old) => {
        if (old === undefined) return old;
        return old - amountDiff;
      });

      // 3. Update Drawer Breakdown
      updateDrawerBreakdownCache(queryClient, -amountDiff, data.category_id);

      // 4. Update Dashboard Stats
      updateDashboardStatsCache(queryClient, amountDiff, data.cashout_type);

      try {
        await updateExpense(id, data);
        await invalidateCashoutQueries(queryClient);
      } catch (error) {
        await invalidateCashoutQueries(queryClient);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient, queryKey, dateRange]
  );

  const removeExpense = useCallback(
    async (id: string) => {
      const listData = queryClient.getQueryData<CashoutRecord[]>(queryKey);
      const originalRecord = listData?.find((e) => e.id === id);
      
      let originalAmount = originalRecord?.amount;
      let categoryId = originalRecord?.categoryId;
      let originalCategory = originalRecord?.category;
      if (originalAmount === undefined) {
        const infiniteData = queryClient.getQueryData<InfiniteData<CashoutPage>>([
          EXPENSES_KEY,
          "infinite",
          20,
          dateRange?.start,
          dateRange?.end,
        ]);
        const found = infiniteData?.pages.flatMap((p) => p.data).find((e) => e.id === id);
        originalAmount = found?.amount || 0;
        categoryId = found?.categoryId;
        originalCategory = found?.category;
      }

      // 1. Update Summary
      queryClient.setQueriesData<{ totalAmount: number; totalCount: number; _optimistic?: boolean }>(
        { queryKey: [EXPENSES_KEY, "summary"] },
        (old) => {
          if (!old) return old;
          return {
            totalAmount: old.totalAmount - originalAmount,
            totalCount: old.totalCount - 1,
            _optimistic: true,
          };
        }
      );

      // 2. Update Balance
      queryClient.setQueriesData<number>({ queryKey: [EXPENSES_KEY, "balance"] }, (old) => {
        if (old === undefined) return old;
        return old + originalAmount;
      });

      // 3. Update Drawer Breakdown
      updateDrawerBreakdownCache(queryClient, originalAmount, categoryId);

      // 4. Update Dashboard Stats
      updateDashboardStatsCache(queryClient, -originalAmount, originalCategory);

      try {
        await deleteExpense(id);
        await invalidateCashoutQueries(queryClient);
      } catch (error) {
        console.error("Failed to delete expense:", error);
        await invalidateCashoutQueries(queryClient);
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
    refresh: useCallback(() => invalidateCashoutQueries(queryClient), [queryClient]),
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
      
      const drawers = queryClient.getQueryData<any[]>(["drawers"]) || [];
      const resolvedDrawer = drawers.find((d: any) => d.id === input.category_id);

      const optimistic: OptimisticCashoutRecord = {
        id: tempId,
        date: input.transaction_date,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        created_at: new Date().toISOString(),
        category: input.cashout_type,
        amount: input.amount,
        notes: input.notes,
        receiptNo: input.receipt_no,
        expenseCategory: input.expenseCategory,
        product: input.product || input.source,
        manufacturer: input.manufacturer,
        referenceNo: input.referenceNo,
        subTypeLabel: input.subTypeLabel,
        drawerName: resolvedDrawer?.category,
        categoryId: input.category_id,
        _optimistic: true,
        _syncing: true,
      };

      // 1. Update Infinite Query Cache
      queryClient.setQueriesData<InfiniteData<CashoutPage>>({ queryKey: [EXPENSES_KEY, "infinite"] }, (old) => {
        if (!old || !old.pages || old.pages.length === 0) return old;
        const newPages = [...old.pages];
        newPages[0] = {
          ...newPages[0],
          data: [optimistic, ...newPages[0].data],
          count: (newPages[0].count || 0) + 1,
        };
        return { ...old, pages: newPages };
      });

      // 2. Update Summary Query Cache
      queryClient.setQueriesData<{ totalAmount: number; totalCount: number; _optimistic?: boolean }>(
        { queryKey: [EXPENSES_KEY, "summary"] },
        (old) => {
          if (!old) return old;
          return {
            totalAmount: old.totalAmount + input.amount,
            totalCount: old.totalCount + 1,
            _optimistic: true,
          };
        }
      );

      // 3. Update Balance Query Cache (Instant Total Cash Remaining calculation)
      queryClient.setQueriesData<number>({ queryKey: [EXPENSES_KEY, "balance"] }, (old) => {
        if (old === undefined) return old;
        return old - input.amount;
      });

      // 4. Update Drawer Breakdown Cache (Instant Drawer Balance calculation)
      updateDrawerBreakdownCache(queryClient, -input.amount, input.category_id, resolvedDrawer?.category);

      // 5. Update Dashboard Stats Cache (Instant Dashboard vitals update)
      updateDashboardStatsCache(queryClient, input.amount, input.cashout_type);

      try {
        await createExpense(input);
        await invalidateCashoutQueries(queryClient);
      } catch (error) {
        // Rollback on error
        queryClient.setQueriesData<InfiniteData<CashoutPage>>({ queryKey: [EXPENSES_KEY, "infinite"] }, (old) => {
          if (!old) return old;
          const newPages = old.pages.map((page) => ({
            ...page,
            data: page.data.filter((e) => e.id !== tempId),
          }));
          return { ...old, pages: newPages };
        });
        await invalidateCashoutQueries(queryClient);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient]
  );

  // Optimistic Edit
  const editExpenseOptimistic = useCallback(
    async (id: string, input: CashoutInput) => {
      setIsSubmitting(true);
      
      const pages = queryClient.getQueryData<InfiniteData<CashoutPage>>(queryKey)?.pages;
      const originalRecord = pages?.flatMap((p) => p.data).find((e) => e.id === id);
      const originalAmount = originalRecord?.amount || 0;
      const amountDiff = input.amount - originalAmount;

      // 1. Update Infinite Query
      queryClient.setQueriesData<InfiniteData<CashoutPage>>({ queryKey: [EXPENSES_KEY, "infinite"] }, (old) => {
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
      queryClient.setQueriesData<{ totalAmount: number; totalCount: number; _optimistic?: boolean }>(
        { queryKey: [EXPENSES_KEY, "summary"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            totalAmount: old.totalAmount + amountDiff,
            _optimistic: true,
          };
        }
      );

      // 3. Update Balance
      queryClient.setQueriesData<number>({ queryKey: [EXPENSES_KEY, "balance"] }, (old) => {
        if (old === undefined) return old;
        return old - amountDiff;
      });

      // 4. Update Drawer Breakdown
      updateDrawerBreakdownCache(queryClient, -amountDiff, input.category_id);

      // 5. Update Dashboard Stats
      updateDashboardStatsCache(queryClient, amountDiff, input.cashout_type);

      try {
        await updateExpense(id, input);
        await invalidateCashoutQueries(queryClient);
      } catch (error) {
        await invalidateCashoutQueries(queryClient);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient, queryKey]
  );

  // Optimistic Delete
  const removeExpenseOptimistic = useCallback(
    async (id: string) => {
      setIsSubmitting(true);

      const pages = queryClient.getQueryData<InfiniteData<CashoutPage>>(queryKey)?.pages;
      const originalRecord = pages?.flatMap((p) => p.data).find((e) => e.id === id);
      const originalAmount = originalRecord?.amount || 0;
      const categoryId = originalRecord?.categoryId;
      const originalCategory = originalRecord?.category;

      // 1. Update Infinite Query
      queryClient.setQueriesData<InfiniteData<CashoutPage>>({ queryKey: [EXPENSES_KEY, "infinite"] }, (old) => {
        if (!old) return old;
        const newPages = old.pages.map((page) => ({
          ...page,
          data: page.data.filter((e) => e.id !== id),
        }));
        return { ...old, pages: newPages };
      });

      // 2. Update Summary
      queryClient.setQueriesData<{ totalAmount: number; totalCount: number; _optimistic?: boolean }>(
        { queryKey: [EXPENSES_KEY, "summary"] },
        (old) => {
          if (!old) return old;
          return {
            totalAmount: old.totalAmount - originalAmount,
            totalCount: old.totalCount - 1,
            _optimistic: true,
          };
        }
      );

      // 3. Update Balance
      queryClient.setQueriesData<number>({ queryKey: [EXPENSES_KEY, "balance"] }, (old) => {
        if (old === undefined) return old;
        return old + originalAmount;
      });

      // 4. Update Drawer Breakdown
      updateDrawerBreakdownCache(queryClient, originalAmount, categoryId);

      // 5. Update Dashboard Stats
      updateDashboardStatsCache(queryClient, -originalAmount, originalCategory);

      try {
        await deleteExpense(id);
        await invalidateCashoutQueries(queryClient);
      } catch (error) {
        await invalidateCashoutQueries(queryClient);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient, queryKey]
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
    refresh: useCallback(() => invalidateCashoutQueries(queryClient), [queryClient]),
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
    staleTime: 1000 * 60 * 5, // 5 minutes (invalidated immediately via Supabase Realtime in GlobalCashflowSync)
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
    staleTime: 1000 * 60 * 5, // 5 minutes (invalidated immediately via Supabase Realtime in GlobalCashflowSync)
  });

  return {
    balance: Number(balance) || 0,
    isLoading,
    isFetching,
    refetch,
  };
}
