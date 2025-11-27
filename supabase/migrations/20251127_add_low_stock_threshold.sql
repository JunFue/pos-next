-- Add low_stock_threshold to items table
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT NULL;

-- Update inventory_monitor_view to include low_stock_threshold
DROP VIEW IF EXISTS public.inventory_monitor_view;

CREATE VIEW public.inventory_monitor_view AS
SELECT
    i.id AS item_id,
    i.item_name,
    i.sku,
    i.category,
    i.cost_price,
    i.low_stock_threshold,
    COALESCE(stock_in.total, 0) AS quantity_in,
    COALESCE(stock_out.total, 0) AS quantity_out,
    COALESCE(sold.total, 0) AS quantity_sold,
    (COALESCE(stock_in.total, 0) - COALESCE(stock_out.total, 0) - COALESCE(sold.total, 0)) AS current_stock
FROM
    public.items i
LEFT JOIN
    (SELECT item_name, SUM(quantity) as total FROM public.stock_flow WHERE flow = 'stock-in' GROUP BY item_name) stock_in
    ON i.item_name = stock_in.item_name
LEFT JOIN
    (SELECT item_name, SUM(quantity) as total FROM public.stock_flow WHERE flow = 'stock-out' GROUP BY item_name) stock_out
    ON i.item_name = stock_out.item_name
LEFT JOIN
    (SELECT item_name, SUM(quantity) as total FROM public.transactions GROUP BY item_name) sold
    ON i.item_name = sold.item_name;
