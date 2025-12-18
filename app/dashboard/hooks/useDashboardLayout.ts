// hooks/useDashboardLayout.ts
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "dashboard_card_order_v1";

// The source of truth for all available card IDs
const DEFAULT_ORDER = [
  "cash-on-hand",
  "daily-gross",
  "daily-expenses",
  "monthly-gross",
];

export const useDashboardLayout = () => {
  const [items, setItems] = useState<string[]>(DEFAULT_ORDER);
  const [isReady, setIsReady] = useState(false);

  // Load order from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedOrder = JSON.parse(saved);
        
        // Safety: Ensure we aren't missing any new default cards that were added
        const mergedOrder = [
          ...parsedOrder,
          ...DEFAULT_ORDER.filter((id) => !parsedOrder.includes(id)),
        ];
        
        setItems(mergedOrder);
      }
    } catch (e) {
      console.error("Failed to load dashboard order", e);
    } finally {
      setIsReady(true);
    }
  }, []);

  // Save new order to LocalStorage
  const updateOrder = useCallback((newOrder: string[]) => {
    setItems(newOrder);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
    } catch (e) {
      console.error("Failed to save dashboard order", e);
    }
  }, []);

  return { items, updateOrder, isReady };
};