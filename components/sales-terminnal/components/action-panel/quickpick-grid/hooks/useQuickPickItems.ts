import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Item } from '@/app/inventory/components/item-registration/utils/itemTypes';

export interface QuickPickItem {
  id: string;
  item_id: string;
  label: string;
  color: string;
  image_url?: string;
  position: number;
  item?: Item; // Joined item details
}

export const useQuickPickItems = () => {
  const [quickPickItems, setQuickPickItems] = useState<QuickPickItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchQuickPickItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quick_pick_items')
        .select(`
          *,
          item:items (
            id,
            item_name,
            sku,
            cost_price,
            description,
            category_id
          )
        `)
        .order('position', { ascending: true });

      if (error) throw error;

      // Map the joined data to match the expected structure if needed
      // Supabase returns joined data as an object or array depending on relationship
      // Here we expect a single item per quick pick entry
      const formattedData = data.map((qpi: any) => ({
        ...qpi,
        item: qpi.item ? {
           id: qpi.item.id,
           itemName: qpi.item.item_name,
           sku: qpi.item.sku,
           costPrice: qpi.item.cost_price,
           description: qpi.item.description,
           category: qpi.item.category_id // Note: category_id might need mapping to name if needed
        } : undefined
      }));

      setQuickPickItems(formattedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveQuickPickItems = async (items: Omit<QuickPickItem, 'id'>[]) => {
    setIsLoading(true);
    try {
      // For simplicity, we can delete all existing for this store (or just all if single store context) and re-insert
      // Or we can try to upsert. Given the requirement "automatically register it to the database" after done,
      // and the limit of 20, a full sync might be easiest if we want to handle reordering too.
      // However, to be safe, let's just insert new ones or update existing.
      
      // Strategy: 
      // 1. We receive the final list of items desired.
      // 2. We can delete everything and re-insert to ensure order and exact match.
      // This is destructive but simple for a small list (max 20).
      
      // First, get the store_id (assuming single store for now or from context)
      // For now, we'll assume the user is authenticated and RLS handles it, 
      // but we need store_id for the insert.
      // Let's fetch the current user's store or just use a placeholder if we can't get it easily here.
      // Actually, the `items` table has `store_id`. We should probably use that.
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // We need a store_id. Let's assume we can get it from the first item or fetch it.
      // A better way is to pass store_id to the hook or fetch it.
      // Let's fetch the user's store.
      const { data: storeData } = await supabase
        .from('users')
        .select('store_id')
        .eq('user_id', user.id)
        .single();
        
      const storeId = storeData?.store_id;
      if (!storeId) throw new Error("Store not found for user");

      // Delete all existing quick pick items for this store
      const { error: deleteError } = await supabase
        .from('quick_pick_items')
        .delete()
        .eq('store_id', storeId);

      if (deleteError) throw deleteError;

      // Prepare items for insertion
      const itemsToInsert = items.map((item, index) => ({
        item_id: item.item_id,
        store_id: storeId,
        label: item.label,
        color: item.color,
        image_url: item.image_url,
        position: index
      }));

      if (itemsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('quick_pick_items')
          .insert(itemsToInsert);

        if (insertError) throw insertError;
      }

      await fetchQuickPickItems();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickPickItems();
  }, []);

  return {
    quickPickItems,
    isLoading,
    error,
    saveQuickPickItems,
    refresh: fetchQuickPickItems
  };
};
