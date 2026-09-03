/**
 * SMS Notification Service
 * Supports Semaphore (Philippine SMS Gateway), Twilio, PhilSMS, and development fallback.
 */

export interface SendSmsParams {
  to?: string;
  message: string;
  senderName?: string;
}

export interface SendSmsResult {
  success: boolean;
  provider: string;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Clean phone number to Philippine standard format:
 * Examples:
 * - "09097215229" -> "09097215229"
 * - "+639097215229" -> "09097215229" (for Semaphore) or keep E.164 for Twilio
 */
export function formatPhoneNumber(phone: string, format: "local" | "e164" = "local"): string {
  let cleaned = phone.replace(/[^\d+]/g, "");

  if (format === "local") {
    if (cleaned.startsWith("+63")) {
      cleaned = "0" + cleaned.slice(3);
    } else if (cleaned.startsWith("63") && cleaned.length === 12) {
      cleaned = "0" + cleaned.slice(2);
    }
    return cleaned;
  } else {
    // E.164 format e.g. +639097215229
    if (cleaned.startsWith("09")) {
      cleaned = "+63" + cleaned.slice(1);
    } else if (cleaned.startsWith("9") && cleaned.length === 10) {
      cleaned = "+63" + cleaned;
    } else if (!cleaned.startsWith("+")) {
      cleaned = "+" + cleaned;
    }
    return cleaned;
  }
}

/**
 * Send an SMS message using the configured provider.
 */
export async function sendSms({ to, message, senderName }: SendSmsParams): Promise<SendSmsResult> {
  const recipient = to || process.env.ADMIN_PHONE_NUMBER || process.env.PERSONAL_PHONE_NUMBER || "09097215229";
  const provider = (process.env.SMS_PROVIDER || "semaphore").toLowerCase();

  // 1. Semaphore API (Standard Philippine SMS Gateway)
  if (provider === "semaphore") {
    const apiKey = process.env.SEMAPHORE_API_KEY || process.env.SMS_API_KEY;
    const localNumber = formatPhoneNumber(recipient, "local");
    const sender = senderName || process.env.SEMAPHORE_SENDER_NAME;

    if (!apiKey) {
      console.log("ℹ️ [SMS Semaphore Mock] (No SEMAPHORE_API_KEY configured):");
      console.log(`📱 To: ${localNumber}`);
      console.log(`💬 Message:\n${message}\n`);
      return {
        success: true,
        provider: "semaphore (simulated)",
        simulated: true,
      };
    }

    try {
      const payload: Record<string, string> = {
        apikey: apiKey,
        number: localNumber,
        message,
      };
      if (sender) payload.sendername = sender;

      const response = await fetch("https://api.semaphore.co/api/v4/messages", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(payload).toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Semaphore SMS error:", data);
        return {
          success: false,
          provider: "semaphore",
          error: Array.isArray(data) ? data[0]?.message : JSON.stringify(data),
        };
      }

      console.log("✅ SMS sent via Semaphore to:", localNumber);
      return {
        success: true,
        provider: "semaphore",
        messageId: Array.isArray(data) ? data[0]?.message_id?.toString() : undefined,
      };
    } catch (err: any) {
      console.error("Semaphore dispatch failed:", err.message);
      return { success: false, provider: "semaphore", error: err.message };
    }
  }

  // 2. Twilio API
  if (provider === "twilio") {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const e164Number = formatPhoneNumber(recipient, "e164");

    if (!accountSid || !authToken || !fromNumber) {
      console.log("ℹ️ [SMS Twilio Mock] (Missing Twilio credentials):");
      console.log(`📱 To: ${e164Number}`);
      console.log(`💬 Message:\n${message}\n`);
      return {
        success: true,
        provider: "twilio (simulated)",
        simulated: true,
      };
    }

    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        body: new URLSearchParams({
          To: e164Number,
          From: fromNumber,
          Body: message,
        }).toString(),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, provider: "twilio", error: data.message || response.statusText };
      }

      console.log("✅ SMS sent via Twilio to:", e164Number);
      return { success: true, provider: "twilio", messageId: data.sid };
    } catch (err: any) {
      console.error("Twilio dispatch failed:", err.message);
      return { success: false, provider: "twilio", error: err.message };
    }
  }

  // Fallback logger
  console.log(`ℹ️ [SMS Log] To: ${recipient}\n${message}`);
  return { success: true, provider: "mock", simulated: true };
}

/**
 * Send a notification via Telegram Bot API
 */
export async function sendTelegramMessage(text: string): Promise<{ success: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { success: false, error: "Telegram bot token or chat ID not set" };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Telegram API error:", err);
      return { success: false, error: err };
    }

    console.log("✅ Telegram alert dispatched to chat:", chatId);
    return { success: true };
  } catch (err: any) {
    console.error("Telegram dispatch exception:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Helper to format & send alerts (SMS + Telegram) when a user submits a new subscription or trial request.
 */
export async function sendSubscriptionNotificationSms({
  storeName,
  requesterName,
  requesterEmail,
  planType,
  amount,
  paymentMethod,
  gcashReference,
  recipientPhone,
}: {
  storeName: string;
  requesterName: string;
  requesterEmail?: string;
  planType: string;
  amount: number;
  paymentMethod?: string;
  gcashReference?: string;
  recipientPhone?: string;
}): Promise<SendSmsResult> {
  const planLabel = planType.toUpperCase();
  const superAdminUrl = process.env.SUPER_ADMIN_URL || "http://localhost:3002";
  const formattedAmount = Number(amount).toLocaleString();

  let message = `[PUNCH POS] 🔔 New Subscription Request!\n`;
  message += `Store: ${storeName}\n`;
  message += `Plan: ${planLabel} (₱${formattedAmount})\n`;
  message += `Requester: ${requesterName}${requesterEmail ? ` (${requesterEmail})` : ""}\n`;
  
  if (gcashReference && gcashReference !== "Not provided" && gcashReference !== "Free Trial Request") {
    message += `GCash Ref: ${gcashReference}\n`;
  }
  if (paymentMethod && paymentMethod !== "none") {
    message += `Method: ${paymentMethod === "gcash_to_gcash" ? "GCash" : "Over-The-Counter"}\n`;
  }
  
  message += `Review: ${superAdminUrl}`;

  // 1. Send instant Telegram push notification to owner
  sendTelegramMessage(message).catch((e) => console.error("Telegram notify failed:", e));

  // 2. Send SMS via configured SMS gateway (Semaphore / Twilio)
  return await sendSms({
    to: recipientPhone,
    message: message.trim(),
  });
}

/**
 * Helper to format & send 7-day subscription expiry reminder SMS to a store owner.
 */
export async function sendSubscriptionExpiryAlertSms({
  storeName,
  recipientPhone,
  planType,
  daysRemaining,
  expiryDate,
}: {
  storeName: string;
  recipientPhone: string;
  planType: string;
  daysRemaining: number;
  expiryDate: string;
}): Promise<SendSmsResult> {
  const planLabel = planType.toUpperCase();
  let urgency = `will expire in ${daysRemaining} days`;
  if (daysRemaining === 0) urgency = `expires TODAY`;
  else if (daysRemaining === 1) urgency = `expires TOMORROW`;

  let message = `[PUNCH POS] ⏳ Subscription Notice\n`;
  message += `Hello! The ${planLabel} subscription for ${storeName} ${urgency} on ${expiryDate}.\n`;
  message += `Please renew your subscription in POS Settings to ensure continuous service.\n`;
  message += `Thank you!`;

  // Send Telegram reminder if configured
  sendTelegramMessage(message).catch((e) => console.error("Telegram expiry alert failed:", e));

  return await sendSms({
    to: recipientPhone,
    message: message.trim(),
  });
}
