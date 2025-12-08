-- Add indexes to improve performance of item lookups by SKU and Store ID
-- This directly addresses the timeout issues in insert_new_payment_and_transaction RPC

-- Index for looking up items by Store ID and SKU (Primary lookup pattern in RPC)
CREATE INDEX IF NOT EXISTS idx_items_store_sku ON public.items(store_id, sku);

-- Index for looking up items by SKU alone (Fallback)
CREATE INDEX IF NOT EXISTS idx_items_sku ON public.items(sku);

-- Index for looking up items by Store ID and Item Name (Used in inventory_monitor_view)
CREATE INDEX IF NOT EXISTS idx_items_store_name ON public.items(store_id, item_name);

-- Index for transactions by invoice_no (Used for joins)
CREATE INDEX IF NOT EXISTS idx_transactions_invoice_no ON public.transactions(invoice_no);

-- Index for transactions by item_name (Used in inventory_monitor_view)
CREATE INDEX IF NOT EXISTS idx_transactions_item_name ON public.transactions(item_name);
