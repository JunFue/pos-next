import useSWR, { useSWRConfig } from "swr";
import { useState } from "react";
import { fetchExpenses, createExpense, ExpenseData, ExpenseInput } from "../lib/expenses.api";

export function useExpenses() {
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: expenses, isLoading } = useSWR("expenses", fetchExpenses);

  const addExpense = async (data: ExpenseInput) => {
    setIsSubmitting(true);
    try {
      await createExpense(data);
      mutate("expenses");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    expenses: expenses || [],
    isLoading,
    isSubmitting,
    addExpense,
    refresh: () => mutate("expenses"),
  };
}
