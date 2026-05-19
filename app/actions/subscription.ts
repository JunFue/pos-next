"use server";

import { createClient } from "@/utils/supabase/server";

// ============================================================
// 1. Fetch subscription data + pending requests
// ============================================================
export async function fetchSubscriptionData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("store_id")
    .eq("user_id", user.id)
    .single();

  if (userError) {
    return { success: false, error: "Failed to fetch user data" };
  }

  if (!userData?.store_id) {
    return { success: false, error: "No store found" };
  }

  const storeId = userData.store_id;

  // Get current subscription
  const { data: subscription, error: subError } = await supabase
    .from("store_subscriptions")
    .select("*")
    .eq("store_id", storeId)
    .maybeSingle();

  if (subError) {
    console.error("Subscription query error:", subError);
  }

  // Get pending/recent requests
  const { data: requests, error: reqError } = await supabase
    .from("subscription_requests")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (reqError) {
    console.error("Subscription requests query error:", reqError);
  }

  // Build payment history from subscription + requests
  const payments = (requests || []).map((req) => ({
    id: req.id,
    amount: req.amount,
    status: req.status,
    plan_type: req.plan_type,
    payment_method: req.payment_method,
    gcash_reference: req.gcash_reference,
    created_at: req.created_at,
  }));

  return {
    success: true,
    storeId,
    subscription,
    pendingRequest:
      (requests || []).find((r) => r.status === "pending") || null,
    payments,
  };
}

// ============================================================
// 2. Submit a new subscription request
// ============================================================
export async function submitSubscriptionRequest(
  storeId: string,
  planType: "monthly" | "annual",
  paymentMethod: "gcash_to_gcash" | "otc_to_gcash",
  gcashReference?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Verify user belongs to this store
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("store_id, user_id, email, first_name, last_name")
    .eq("user_id", user.id)
    .single();

  if (userError || !userData) throw new Error("User not found");
  if (userData.store_id !== storeId) throw new Error("Unauthorized");

  // Calculate amount
  const amount = planType === "monthly" ? 500 : 5500;

  // Check for existing pending request
  const { data: existingPending } = await supabase
    .from("subscription_requests")
    .select("id")
    .eq("store_id", storeId)
    .eq("status", "pending")
    .maybeSingle();

  if (existingPending) {
    throw new Error(
      "You already have a pending subscription request. Please wait for it to be reviewed."
    );
  }

  // Insert the request
  const { data: newRequest, error: insertError } = await supabase
    .from("subscription_requests")
    .insert({
      store_id: storeId,
      requester_user_id: userData.user_id,
      plan_type: planType,
      payment_method: paymentMethod,
      amount,
      gcash_reference: gcashReference || null,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Failed to insert subscription request:", insertError);
    throw new Error("Failed to submit subscription request");
  }

  // Send email notification to admin (fire-and-forget)
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await fetch(`${siteUrl}/api/subscription/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId: newRequest.id,
        storeName: storeId,
        requesterName: `${userData.first_name || ""} ${userData.last_name || ""}`.trim(),
        requesterEmail: userData.email,
        planType,
        paymentMethod,
        amount,
        gcashReference: gcashReference || "Not provided",
      }),
    });
  } catch (emailError) {
    // Don't fail the request if email fails
    console.error("Email notification failed (non-blocking):", emailError);
  }

  return { success: true, request: newRequest };
}