import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import dayjs from 'dayjs';

export interface Subscription {
  id: string;
  store_id: string;
  status: 'active' | 'inactive' | 'past_due';
  current_period_start: string;
  current_period_end: string;
}

export interface SubscriptionPayment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  transaction_id: string;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found");
        return;
      }

      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .select("store_id")
        .eq("user_id", user.id)
        .single();

      if (memberError || !memberData) {
        console.log("No member data found", memberError);
        return;
      }
      
      setStoreId(memberData.store_id);

      // Fetch Subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('store_id', memberData.store_id)
        .maybeSingle();

      if (subError) {
          console.error("Error fetching subscription:", subError);
      }
      setSubscription(subData);

      // Fetch Payments
      const { data: payData, error: payError } = await supabase
        .from('subscription_payments')
        .select('*')
        .eq('store_id', memberData.store_id)
        .order('created_at', { ascending: false });

      if (payError) {
          console.error("Error fetching payments:", payError);
      }
      setPayments(payData || []);

    } catch (error) {
      console.error("Error in fetchSubscriptionData:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (): Promise<{ success: boolean; error?: string }> => {
    if (!storeId) {
      return { success: false, error: "Store ID not found. Please make sure you're logged in." };
    }

    try {
      setLoading(true);
      
      // 1. Mock Payment Delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const startDate = dayjs().toISOString();
      const endDate = dayjs().add(30, 'day').toISOString();

      // 2. Create or Update Subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          store_id: storeId,
          status: 'active',
          current_period_start: startDate,
          current_period_end: endDate,
          updated_at: new Date().toISOString()
        }, { onConflict: 'store_id' })
        .select()
        .single();

      if (subError) {
        console.error("Subscription upsert error:", subError);
        throw new Error(`Failed to create subscription: ${subError.message || JSON.stringify(subError)}`);
      }

      if (!subData) {
        throw new Error("No subscription data returned from database");
      }

      // 3. Record Payment
      const { error: payError } = await supabase
        .from('subscription_payments')
        .insert({
          subscription_id: subData.id,
          store_id: storeId,
          amount: 450.00,
          currency: 'PHP',
          status: 'succeeded',
          payment_method: 'mock_card',
          transaction_id: `txn_${Date.now()}`
        });

      if (payError) {
        console.error("Payment insert error:", payError);
        throw new Error(`Failed to record payment: ${payError.message || JSON.stringify(payError)}`);
      }

      // Refresh data
      await fetchSubscriptionData();
      return { success: true };

    } catch (error) {
      console.error("Subscription failed:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unknown error occurred. Please check the console for details.";
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { subscription, payments, loading, subscribe };
}
