import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role for admin-level lookups
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      requestId,
      storeName,
      requesterName,
      requesterEmail,
      planType,
      paymentMethod,
      amount,
      gcashReference,
    } = body;

    // Look up actual store name
    let actualStoreName = storeName;
    if (storeName && storeName.length > 20) {
      // It's likely a store_id UUID, look up the actual name
      const { data: storeData } = await supabaseAdmin
        .from("stores")
        .select("store_name")
        .eq("store_id", storeName)
        .single();
      if (storeData?.store_name) {
        actualStoreName = storeData.store_name;
      }
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "junelfuentes.02@gmail.com";
    const superAdminUrl = process.env.SUPER_ADMIN_URL || "http://localhost:3002";

    // Format the email content as plain text for the edge function
    const subject = `🔔 New Subscription Request — ${actualStoreName}`;
    const htmlBody = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 16px; padding: 32px; color: #e2e8f0;">
          <h1 style="font-size: 24px; font-weight: 800; color: #3b82f6; margin: 0 0 8px;">
            New Subscription Request
          </h1>
          <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px;">
            A user has submitted a payment for review.
          </p>
          
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Store</td>
                <td style="padding: 8px 0; color: #f1f5f9; font-weight: 700; text-align: right; font-size: 13px;">${actualStoreName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Requester</td>
                <td style="padding: 8px 0; color: #f1f5f9; font-weight: 700; text-align: right; font-size: 13px;">${requesterName} (${requesterEmail})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Plan</td>
                <td style="padding: 8px 0; color: #f1f5f9; font-weight: 700; text-align: right; font-size: 13px; text-transform: capitalize;">${planType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Amount</td>
                <td style="padding: 8px 0; color: #10b981; font-weight: 800; text-align: right; font-size: 16px;">₱${Number(amount).toLocaleString()}.00</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Payment Method</td>
                <td style="padding: 8px 0; color: #f1f5f9; font-weight: 700; text-align: right; font-size: 13px;">${paymentMethod === "gcash_to_gcash" ? "GCash to GCash" : "Over-the-Counter"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">GCash Reference</td>
                <td style="padding: 8px 0; color: #f1f5f9; font-weight: 700; text-align: right; font-size: 13px; font-family: monospace;">${gcashReference}</td>
              </tr>
            </table>
          </div>

          <a href="${superAdminUrl}" style="display: block; background: #3b82f6; color: white; text-align: center; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">
            Review in Super Admin Dashboard →
          </a>

          <p style="color: #64748b; font-size: 11px; text-align: center; margin-top: 20px;">
            Request ID: ${requestId}
          </p>
        </div>
      </div>
    `;

    // Send email via Supabase Edge Function (or fallback)
    // For now, use the Supabase built-in auth.admin to send a custom email
    // via the edge function endpoint
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Try to call the edge function
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-notification-email`;
    
    const emailResponse = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        to: adminEmail,
        subject,
        html: htmlBody,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Edge function email failed:", emailResponse.status, errorText);
      // Don't fail the overall request — email is best-effort
      console.log("Email notification skipped — edge function not deployed yet.");
      console.log("Email would have been sent to:", adminEmail);
      console.log("Subject:", subject);
    } else {
      console.log("Email notification sent successfully to:", adminEmail);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification error:", error);
    // Don't fail — notification is best-effort
    return NextResponse.json({ success: true, note: "Email notification may have failed" });
  }
}
