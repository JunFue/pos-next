// src/hooks/useStaffPermissions.ts
import { useAuthStore } from "@/store/useAuthStore"; // Assuming you have this
import { createClient } from "@/utils/supabase/client";

import useSWR from "swr";

export function useStaffPermissions() {
  const { user } = useAuthStore();
  const supabase = createClient();

  const fetcher = async () => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from("staff_permissions")
      .select("can_backdate")
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    return data;
  };

  const { data, isLoading } = useSWR(
    user?.id ? `permissions-${user.id}` : null,
    fetcher
  );

  return {
    canBackdate: data?.can_backdate ?? false,
    isLoading,
  };
}
