"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CurrencyCode } from "@/lib/utils/currency";

interface SettingsContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  lowStockThreshold: number;
  setLowStockThreshold: (threshold: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('pos-settings-currency');
    const savedThreshold = localStorage.getItem('pos-settings-low-stock-threshold');
    
    if (savedCurrency) {
      setCurrency(savedCurrency as CurrencyCode);
    }
    if (savedThreshold) {
      setLowStockThreshold(parseInt(savedThreshold, 10));
    }
    setMounted(true);
  }, []);

  const handleSetCurrency = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    localStorage.setItem('pos-settings-currency', newCurrency);
  };

  const handleSetLowStockThreshold = (newThreshold: number) => {
    setLowStockThreshold(newThreshold);
    localStorage.setItem('pos-settings-low-stock-threshold', newThreshold.toString());
  };

  // Prevent hydration mismatch by rendering children only after mount, 
  // or you could render a loading state. For simple settings, 
  // rendering with default and updating is often acceptable, 
  // but to avoid flash of wrong currency, we might wait.
  // However, for a better UX, we'll just render.
  // Ideally, we should use a more robust persistence strategy or server-side prefs.
  // For now, we'll stick to client-side effect.

  return (
    <SettingsContext.Provider value={{ 
      currency, 
      setCurrency: handleSetCurrency,
      lowStockThreshold,
      setLowStockThreshold: handleSetLowStockThreshold
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
