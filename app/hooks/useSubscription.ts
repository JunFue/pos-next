"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Subscription {
  id: string;
  store_id: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "active";
  amount_paid: number;
  plan_type: "monthly" | "annual";
  start_date: string;
  end_date: string;
  reference_notes?: string;
}

export interface SubscriptionRequest {
  id: string;
  store_id: string;
  requester_user_id: string;
  plan_type: "monthly" | "annual";
  payment_method: "gcash_to_gcash" | "otc_to_gcash";
  amount: number;
  status: "pending" | "approved" | "rejected";
  gcash_reference?: string;
  admin_notes?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface SubscriptionPayment {
  id: string;
  amount: number;
  status: string;
  plan_type: string;
  payment_method: string;
  gcash_reference?: string;
  created_at: string;
}

export function useSubscription() {
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useQuery({
    queryKey: ["subscription-data"],
    queryFn: async () => {
      const { fetchSubscriptionData } = await import(
        "@/app/actions/subscription"
      );
      const result = await fetchSubscriptionData();

      if (result.success) {
        return {
          storeId: result.storeId || null,
          subscription: result.subscription || null,
          pendingRequest: result.pendingRequest || null,
          payments: result.payments || [],
        };
      } else {
        console.error("fetchSubscriptionData failed:", result.error);
        return {
          storeId: null,
          subscription: null,
          pendingRequest: null,
          payments: [],
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes — check more often for approval status
    refetchOnWindowFocus: true,
  });

  const subscription = (data?.subscription as Subscription) || null;
  const pendingRequest =
    (data?.pendingRequest as SubscriptionRequest) || null;
  const payments = (data?.payments as SubscriptionPayment[]) || [];
  const storeId = data?.storeId || null;

  const submitRequest = async (
    planType: "monthly" | "annual",
    paymentMethod: "gcash_to_gcash" | "otc_to_gcash",
    gcashReference?: string
  ) => {
    if (!storeId) {
      throw new Error("Store ID not found. Please reload.");
    }

    const { submitSubscriptionRequest } = await import(
      "@/app/actions/subscription"
    );

    const result = await submitSubscriptionRequest(
      storeId,
      planType,
      paymentMethod,
      gcashReference
    );

    // Refetch subscription data to show pending state
    queryClient.invalidateQueries({ queryKey: ["subscription-data"] });

    return result;
  };

  return {
    subscription,
    pendingRequest,
    payments,
    loading,
    storeId,
    submitRequest,
  };
}
