-- =========================================================================
-- Backfill Missing Category IDs into Transactions
-- =========================================================================
-- Description:
-- Updates any existing transactions where `category_id` is NULL by looking
-- up the master `items` record. It first tries matching by `sku` and 
-- falls back to matching by `item_name` for maximum accuracy, ensuring 
-- it stays strictly within the correct `store_id`.

-- 1. First Pass: Match by exact SKU and Store ID
UPDATE public.transactions t
SET category_id = i.category_id
FROM public.items i
WHERE t.category_id IS NULL
  AND t.store_id = i.store_id
  AND t.sku = i.sku
  AND i.category_id IS NOT NULL;

-- 2. Second Pass: For any remaining nulls, match by exact Item Name and Store ID
UPDATE public.transactions t
SET category_id = i.category_id
FROM public.items i
WHERE t.category_id IS NULL
  AND t.store_id = i.store_id
  AND t.item_name = i.item_name
  AND i.category_id IS NOT NULL;

-- 3. Output a simple notice indicating completion
DO $$
BEGIN
  RAISE NOTICE 'Category ID backfill completed successfully.';
END $$;
