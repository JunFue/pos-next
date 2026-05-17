"use server";

import { createClient } from "@/utils/supabase/server";

// --- Voucher Types ---

export interface Voucher {
  id: string;
  store_id: string;
  code: string;
  label: string | null;
  voucher_type: 'fixed' | 'percent';
  original_value: number;
  remaining_balance: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  times_used: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface VoucherLookupResult {
  success: boolean;
  voucher?: Voucher;
  applicableAmount?: number; // The actual amount that can be redeemed for this order
  error?: string;
}

interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

// --- Voucher Server Actions ---

/**
 * Lookup a voucher by code. Validates:
 * - Code exists and belongs to the store
 * - Voucher is active
 * - Not expired
 * - Usage limit not exceeded
 * - Remaining balance > 0
 * - Minimum order amount met
 * 
 * Returns the voucher details and the applicable amount for the given order total.
 */
export async function lookupVoucher(
  code: string,
  orderTotal: number
): Promise<VoucherLookupResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    // Get user's store
    const { data: userData } = await supabase
      .from("users")
      .select("store_id")
      .eq("user_id", user.id)
      .single();

    if (!userData?.store_id) {
      return { success: false, error: "Store not found" };
    }

    // Look up voucher
    const { data: voucher, error } = await supabase
      .from("vouchers")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("store_id", userData.store_id)
      .single();

    if (error || !voucher) {
      return { success: false, error: "Voucher code not found." };
    }

    // Validate: Active
    if (!voucher.is_active) {
      return { success: false, error: "This voucher has been deactivated." };
    }

    // Validate: Not expired
    if (voucher.valid_until && new Date(voucher.valid_until) < new Date()) {
      return { success: false, error: "This voucher has expired." };
    }

    // Validate: Not before valid_from
    if (voucher.valid_from && new Date(voucher.valid_from) > new Date()) {
      return { success: false, error: "This voucher is not yet active." };
    }

    // Validate: Usage limit
    if (voucher.usage_limit !== null && voucher.times_used >= voucher.usage_limit) {
      return { success: false, error: "This voucher has reached its usage limit." };
    }

    // Validate: Remaining balance
    if (voucher.remaining_balance <= 0) {
      return { success: false, error: "This voucher has no remaining balance." };
    }

    // Validate: Minimum order amount
    if (voucher.min_order_amount && orderTotal < voucher.min_order_amount) {
      return {
        success: false,
        error: `Minimum order of ₱${voucher.min_order_amount.toFixed(2)} required for this voucher.`,
      };
    }

    // Calculate applicable amount
    let applicableAmount: number;
    if (voucher.voucher_type === 'percent') {
      applicableAmount = Math.round(orderTotal * (voucher.original_value / 100) * 100) / 100;
      // Apply max discount cap if set
      if (voucher.max_discount_amount) {
        applicableAmount = Math.min(applicableAmount, voucher.max_discount_amount);
      }
    } else {
      // Fixed amount
      applicableAmount = voucher.remaining_balance;
    }

    // Cannot exceed order total or remaining balance
    applicableAmount = Math.min(applicableAmount, orderTotal, voucher.remaining_balance);

    return {
      success: true,
      voucher: voucher as Voucher,
      applicableAmount,
    };
  } catch (err: any) {
    console.error("❌ lookupVoucher Error:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

/**
 * Redeem a voucher: deduct balance and record the redemption.
 * Called AFTER a transaction is successfully processed.
 */
export async function redeemVoucher(
  voucherId: string,
  paymentId: string,
  amountRedeemed: number
): Promise<ActionResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    // 1. Deduct balance and increment usage count
    const { data: voucher, error: fetchError } = await supabase
      .from("vouchers")
      .select("remaining_balance, times_used")
      .eq("id", voucherId)
      .single();

    if (fetchError || !voucher) {
      return { success: false, error: "Voucher not found." };
    }

    const newBalance = Math.max(voucher.remaining_balance - amountRedeemed, 0);
    const newTimesUsed = (voucher.times_used || 0) + 1;

    const { error: updateError } = await supabase
      .from("vouchers")
      .update({
        remaining_balance: newBalance,
        times_used: newTimesUsed,
      })
      .eq("id", voucherId);

    if (updateError) {
      console.error("❌ Failed to update voucher balance:", updateError);
      return { success: false, error: updateError.message };
    }

    // 2. Record redemption in audit trail
    const { error: redemptionError } = await supabase
      .from("voucher_redemptions")
      .insert({
        voucher_id: voucherId,
        payment_id: paymentId,
        amount_redeemed: amountRedeemed,
        redeemed_by: user.id,
      });

    if (redemptionError) {
      console.error("❌ Failed to record redemption:", redemptionError);
      // Non-fatal: balance was already deducted. Log but don't fail.
    }

    return { success: true };
  } catch (err: any) {
    console.error("❌ redeemVoucher Error:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

/**
 * Create a new voucher (for admin/management UI).
 */
export async function createVoucher(data: {
  code: string;
  label?: string;
  voucher_type: 'fixed' | 'percent';
  original_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  valid_from?: string;
  valid_until?: string;
}): Promise<ActionResponse<Voucher>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const { data: userData } = await supabase
      .from("users")
      .select("store_id")
      .eq("user_id", user.id)
      .single();

    if (!userData?.store_id) {
      return { success: false, error: "Store not found" };
    }

    const { data: voucher, error } = await supabase
      .from("vouchers")
      .insert({
        store_id: userData.store_id,
        code: data.code.trim().toUpperCase(),
        label: data.label || null,
        voucher_type: data.voucher_type,
        original_value: data.original_value,
        remaining_balance: data.voucher_type === 'fixed' ? data.original_value : 0, // Percent vouchers don't have a "balance"
        min_order_amount: data.min_order_amount || 0,
        max_discount_amount: data.max_discount_amount || null,
        usage_limit: data.usage_limit || null,
        valid_from: data.valid_from || new Date().toISOString(),
        valid_until: data.valid_until || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: "A voucher with this code already exists." };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: voucher as Voucher };
  } catch (err: any) {
    console.error("❌ createVoucher Error:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

/**
 * List vouchers for management UI.
 */
export async function getVouchers(filters?: {
  isActive?: boolean;
  search?: string;
}): Promise<ActionResponse<Voucher[]>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const { data: userData } = await supabase
      .from("users")
      .select("store_id")
      .eq("user_id", user.id)
      .single();

    if (!userData?.store_id) {
      return { success: false, error: "Store not found" };
    }

    let query = supabase
      .from("vouchers")
      .select("*")
      .eq("store_id", userData.store_id)
      .order("created_at", { ascending: false });

    if (filters?.isActive !== undefined) {
      query = query.eq("is_active", filters.isActive);
    }

    if (filters?.search) {
      query = query.or(`code.ilike.%${filters.search}%,label.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data as Voucher[]) || [] };
  } catch (err: any) {
    console.error("❌ getVouchers Error:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}
