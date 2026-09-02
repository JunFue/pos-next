import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSubscriptionExpiryAlertSms } from "@/lib/sms";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

// Supabase Service Role for querying all stores & subscriptions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET or POST /api/subscription/expiry-alerts
 * 
 * Scans active subscriptions (PAID, TRIAL, active) and identifies all stores
 * whose subscription expires within 7 days.
 * 
 * Optional query parameter: ?sendSms=true
 * If sendSms=true, attempts to send an SMS reminder to the owner's phone number.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const triggerSms = searchParams.get("sendSms") === "true";

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // Fetch active subscriptions with end_date between now and +7 days
    const { data: subscriptions, error } = await supabaseAdmin
      .from("store_subscriptions")
      .select(`
        id,
        store_id,
        status,
        plan_type,
        amount_paid,
        start_date,
        end_date,
        stores (
          store_name,
          user_id
        )
      `)
      .in("status", ["PAID", "TRIAL", "active", "paid", "trial"])
      .gte("end_date", now.toISOString())
      .lte("end_date", sevenDaysFromNow.toISOString())
      .order("end_date", { ascending: true });

    if (error) {
      console.error("Failed to query expiring subscriptions:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const expiringList = await Promise.all(
      (subscriptions || []).map(async (sub: any) => {
        const storeName = sub.stores?.store_name || `Store ${sub.store_id.slice(0, 8)}`;
        const ownerUserId = sub.stores?.user_id;
        
        let ownerPhone: string | null = null;
        let ownerEmail: string | null = null;
        let ownerName: string | null = null;

        if (ownerUserId) {
          const { data: owner } = await supabaseAdmin
            .from("users")
            .select("first_name, last_name, email, metadata")
            .eq("user_id", ownerUserId)
            .single();

          if (owner) {
            ownerName = `${owner.first_name || ""} ${owner.last_name || ""}`.trim();
            ownerEmail = owner.email;
            ownerPhone = (owner.metadata as any)?.phone || (owner.metadata as any)?.phone_number || null;
          }
        }

        const endDateObj = dayjs(sub.end_date);
        const daysRemaining = Math.max(0, endDateObj.diff(dayjs(), "day"));
        const expiryDateFormatted = endDateObj.format("MMM D, YYYY");

        let smsStatus = "not_requested";

        if (triggerSms && ownerPhone) {
          try {
            const smsRes = await sendSubscriptionExpiryAlertSms({
              storeName,
              recipientPhone: ownerPhone,
              planType: sub.plan_type || "monthly",
              daysRemaining,
              expiryDate: expiryDateFormatted,
            });
            smsStatus = smsRes.success ? "sent" : `failed: ${smsRes.error}`;
          } catch (e: any) {
            smsStatus = `error: ${e.message}`;
          }
        }

        return {
          subscriptionId: sub.id,
          storeId: sub.store_id,
          storeName,
          planType: sub.plan_type,
          endDate: sub.end_date,
          expiryDateFormatted,
          daysRemaining,
          ownerName,
          ownerEmail,
          ownerPhone,
          smsStatus,
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: expiringList.length,
      expiringSubscriptions: expiringList,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Expiry alerts error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
