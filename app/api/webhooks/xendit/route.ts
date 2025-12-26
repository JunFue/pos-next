import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("Xendit Webhook Received:", JSON.stringify(body, null, 2));

    // 1. Validate Status
    if (body.status === "PAID" || body.status === "SETTLED") {
      // 2. Extract Store ID (Try Metadata first, then External ID)
      let storeId = body.meta?.store_id;

      if (!storeId && body.external_id) {
        console.log(
          "Metadata missing, extracting Store ID from external_id..."
        );
        const parts = body.external_id.split("_");
        if (parts.length >= 2) storeId = parts[1]; // Get the UUID part
      }

      if (!storeId) {
        console.error("CRITICAL: No store_id found.");
        return NextResponse.json(
          { error: "Missing store_id" },
          { status: 400 }
        );
      }

      // 3. Recover Payer User ID (Optional but good for UI)
      let payerId = body.meta?.payer_user_id;

      // If Xendit stripped metadata, find user by email
      if (!payerId && body.payer_email) {
        const { data: user } = await supabaseAdmin
          .from("members") // Query your public.members table
          .select("user_id")
          .eq("email", body.payer_email)
          .single();

        if (user) payerId = user.user_id;
      }

      // 4. Update Subscription in Database
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30);

      const { error } = await supabaseAdmin.from("store_subscriptions").upsert(
        {
          store_id: storeId,
          xendit_invoice_id: body.id,
          status: "PAID",
          amount_paid: body.amount,
          payer_user_id: payerId || null,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          updated_at: new Date(),
        },
        { onConflict: "store_id" }
      );

      if (error) {
        console.error("Database Update Failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log(`SUCCESS: Subscription active for Store ${storeId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
