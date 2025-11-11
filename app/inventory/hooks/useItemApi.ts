import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Item } from "../utils/itemTypes";
import { supabase } from "@/lib/supabaseClient";

// Define the structure of the data we're sending to Supabase.
// This matches the table columns we created.
interface InsertItemPayload extends Item {
  admin_user_id: string;
  stores_id: string;
}

export const useInsertItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newItem: InsertItemPayload) => {
      // Map the frontend 'Item' structure to the database column names
      const { data, error } = await supabase
        .from("items")
        .insert([
          {
            item_name: newItem.itemName,
            sku: newItem.sku,
            category: newItem.category,
            cost_price: newItem.costPrice,
            description: newItem.description,
            admin_user_id: newItem.admin_user_id,
            stores_id: newItem.stores_id,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch items query to update the list immediately
      // (Assuming you will have a query with this key later)
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (error: Error) => {
      console.error("Error inserting item:", error.message);
      // You could trigger a toast notification here
    },
  });
};
