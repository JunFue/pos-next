import { createClient } from "@/utils/supabase/client";

/**
 * broadcastStoreEvent
 *
 * Broadcasts an instant store-wide synchronization event across all connected computers/tablets
 * over Supabase Realtime WebSockets.
 *
 * Broadcast operates with <50ms latency and does not depend on PostgreSQL WAL publication setup.
 */
let sharedBroadcastChannel: any = null;

function getBroadcastChannel() {
  if (!sharedBroadcastChannel) {
    const supabase = createClient();
    sharedBroadcastChannel = supabase.channel("store-live-events", {
      config: { broadcast: { self: false } },
    });
    sharedBroadcastChannel.subscribe((status: string) => {
      console.log(`[Realtime Broadcast] Status: ${status}`);
    });
  }
  return sharedBroadcastChannel;
}

export async function broadcastStoreEvent(
  event: "TRANSACTION_COMPLETED" | "CASHOUT_COMPLETED" | "DRAWER_UPDATED",
  payload: Record<string, any> = {}
) {
  try {
    const channel = getBroadcastChannel();
    await channel.send({
      type: "broadcast",
      event,
      payload: {
        ...payload,
        timestamp: Date.now(),
      },
    });
    console.log(`[Realtime Broadcast] Sent ${event}:`, payload);
  } catch (err) {
    console.warn("[Realtime Broadcast] Failed to send broadcast event:", err);
  }
}
