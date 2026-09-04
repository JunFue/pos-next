import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

/**
 * Subscribes to Supabase Realtime changes on `payments`, `transactions`, and `expenses` tables.
 * Whenever sales are made, deleted, or expenses are recorded, it immediately invalidates
 * the cashout balance, drawer breakdown, summaries, and dashboard stats for instant UI reflection.
 */
export const useRealtimeCashflow = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    const invalidateCashflow = () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["daily-category-sales"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    };

    const channel = supabase
      .channel("cashflow-realtime-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          invalidateCashflow();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => {
          invalidateCashflow();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        () => {
          invalidateCashflow();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
