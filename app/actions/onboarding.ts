"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function linkUserToStore(enrollmentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("join_store", {
    provided_enrollment_id: enrollmentId,
  });

  if (error) {
    console.error("Error linking to store:", error);
    return { success: false, error: error.message };
  }

  // The RPC returns a JSON object with success/error fields
  // We need to cast it or check the properties
  const result = data as { success: boolean; error?: string; store_id?: string };

  if (!result.success) {
    return { success: false, error: result.error || "Failed to join store." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
