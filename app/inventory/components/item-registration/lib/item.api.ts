// app/inventory/components/item-registration/lib/item.api.ts

"use server";

import { createClient } from "@/utils/supabase/server";
import { Item } from "../utils/itemTypes";

const getSupabase = async () => {
  return await createClient();
};

// 1. Interface for the database row (snake_case)
// UPDATED: 'category' text column is gone, replaced by 'category_id'
interface ItemDbRow {
  id: string;
  item_name: string;
  sku: string;
  category_id: string | null; // Changed from 'category'
  cost_price: number;
  description: string | null;
  low_stock_threshold: number | null;
}

// 2. NEW: A specific type for the object we send to Supabase
type DbItemObject = Partial<ItemDbRow>;

// 3. FIX: 'toDatabaseObject' now maps JS 'category' (UUID) to DB 'category_id'
const toDatabaseObject = (item: Partial<Item>): DbItemObject => {
  const dbItem: DbItemObject = {};

  // Pass-through fields
  if (item.id !== undefined) dbItem.id = item.id;
  if (item.sku !== undefined) dbItem.sku = item.sku;

  // Mapped fields
  if (item.itemName !== undefined) dbItem.item_name = item.itemName;
  if (item.costPrice !== undefined) dbItem.cost_price = item.costPrice;

  // Mapped fields that handle 'undefined' -> 'null'
  
  // UPDATED: Map the JS 'category' field (which holds the ID) to 'category_id'
  if (item.category !== undefined) {
    dbItem.category_id = item.category ?? null;
  }
  
  if (item.description !== undefined) {
    dbItem.description = item.description ?? null;
  }
  if (item.lowStockThreshold !== undefined) {
    dbItem.low_stock_threshold = item.lowStockThreshold ?? null;
  }

  return dbItem;
};

// 4. 'fromDatabaseObject' maps DB 'category_id' back to JS 'category'
const fromDatabaseObject = (dbItem: ItemDbRow): Item => {
  // Destructure 'category_id' instead of 'category'
  const { item_name, cost_price, category_id, description, low_stock_threshold, ...rest } = dbItem;
  
  return {
    ...rest,
    itemName: item_name,
    costPrice: cost_price,
    // Map 'category_id' (DB) -> 'category' (JS) so the Select component gets the ID
    category: category_id ?? undefined,
    description: description ?? undefined,
    lowStockThreshold: low_stock_threshold ?? null,
  };
};

// --- API Functions ---

export const fetchItems = async (): Promise<Item[]> => {
  const supabase = await getSupabase();
  // UPDATED: Select 'category_id' instead of 'category'
  const { data, error } = await supabase
    .from("items")
    .select("id, sku, category_id, description, item_name, cost_price, low_stock_threshold");

  if (error) {
    console.error("Supabase fetch error:", error);
    throw new Error(error.message);
  }

  // @ts-ignore - Supabase types might not perfectly infer the alias mapping immediately
  return data.map(fromDatabaseObject);
};

export const insertItem = async (item: Item): Promise<Item> => {
  const supabase = await getSupabase();
  
  // UPDATED: Switched from RPC to standard insert. 
  // The old RPC likely expected a category NAME, which no longer exists.
  // Standard insert uses the ID mapping defined in 'toDatabaseObject'.
  
  const dbItem = toDatabaseObject(item);
  
  const { data, error } = await supabase
    .from("items")
    .insert(dbItem)
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error(error.message);
  }

  // @ts-ignore
  return fromDatabaseObject(data);
};

export const updateItem = async (item: Item): Promise<Item> => {
  if (!item.id) throw new Error("Item ID is required for update");

  const dbItem = toDatabaseObject(item); // Maps item.category -> dbItem.category_id

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("items")
    .update(dbItem)
    .eq("id", item.id)
    .select()
    .single();

  if (error) {
    console.error("Supabase update error:", error);
    throw new Error(error.message);
  }
  
  // @ts-ignore
  return fromDatabaseObject(data);
};

export const deleteItem = async (id: string): Promise<void> => {
  const supabase = await getSupabase();
  const { error } = await supabase.from("items").delete().eq("id", id);

  if (error) {
    console.error("Supabase delete error:", error);
    throw new Error(error.message);
  }
};

export const checkItemExistence = async (
  field: "itemName" | "sku",
  value: string,
  ignoreId?: string
): Promise<boolean> => {
  const dbField = field === "itemName" ? "item_name" : "sku";

  const supabase = await getSupabase();
  let query = supabase
    .from("items")
    .select("id", { count: "exact", head: true })
    .eq(dbField, value);

  if (ignoreId) {
    query = query.not("id", "eq", ignoreId);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Supabase check existence error:", error);
    throw new Error(error.message);
  }

  return (count ?? 0) > 0;
};

export const insertManyItems = async (items: Item[]): Promise<Item[]> => {
  const itemsToInsert = items.map((item) => {
    const { id, ...rest } = item;
    return toDatabaseObject(rest); // Correctly maps categories to IDs
  });

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("items")
    .insert(itemsToInsert)
    .select();

  if (error) {
    console.error("Supabase insertMany error:", error);
    throw new Error(error.message);
  }

  // @ts-ignore
  return data.map(fromDatabaseObject);
};