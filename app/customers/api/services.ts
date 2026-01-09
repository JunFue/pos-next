import { createClient } from "@/utils/supabase/client";
import { CustomerFormValues } from "../lib/types";

const supabase = createClient();

export const fetchCustomerFeatureData = async () => {
  const supabase = createClient();

  const [groupsRes, customersRes] = await Promise.all([
    supabase.from("customer_groups").select("*").order("name"),
    supabase
      .from("customers")
      .select("*, group:customer_groups(*)")
      .order("created_at", { ascending: false }),
  ]);

  return {
    groups: groupsRes.data || [],
    customers: customersRes.data || [],
  };
};
export const fetchDashboardData = async () => {
  const { data: groups } = await supabase
    .from("customer_groups")
    .select("*")
    .order("name");

  const { data: customers } = await supabase
    .from("customers")
    .select("*, group:customer_groups(*)")
    .order("created_at", { ascending: false });

  return { groups: groups || [], customers: customers || [] };
};

export const createGroup = async (name: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No user found");

  const role = user.user_metadata?.role || "user";
  const isAdmin = role === "admin";

  // Use triggers in DB to handle admin_id, or pass strictly if needed
  return await supabase.from("customer_groups").insert({
    name,
    store_id: user.user_metadata?.store_id,
    created_by: user.id,
    is_shared: isAdmin,
  });
};

export const deleteGroup = async (id: string) => {
  return await supabase.from("customer_groups").delete().eq("id", id);
};

export const createCustomer = async (formData: Partial<CustomerFormValues>) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No user found");

  return await supabase.from("customers").insert({
    full_name: formData.full_name,
    phone_number: formData.phone_number,
    group_id: formData.group_id === "" ? null : formData.group_id,
    store_id: user.user_metadata?.store_id,
  });
};

export const updateCustomerGroup = async (
  customerId: string,
  groupId: string
) => {
  const val = groupId === "ungrouped" ? null : groupId;
  return await supabase
    .from("customers")
    .update({ group_id: val })
    .eq("id", customerId);
};
