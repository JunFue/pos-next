// useSettingsStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CurrencyCode } from '@/lib/utils/currency';

interface SettingsState {
  currency: CurrencyCode;
  lowStockThreshold: number;
  setCurrency: (currency: CurrencyCode) => void;
  setLowStockThreshold: (threshold: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'USD',
      // UPDATED: Hardcoded default to 100
      lowStockThreshold: 100, 
      setCurrency: (currency) => set({ currency }),
      setLowStockThreshold: (lowStockThreshold) => set({ lowStockThreshold }),
    }),
    {
      name: 'pos-settings-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (typeof window !== 'undefined') {
            const oldCurrency = localStorage.getItem('pos-settings-currency');
            const oldThreshold = localStorage.getItem('pos-settings-low-stock-threshold');
            // Migration logic if needed
        }
      }
    }
  )
);