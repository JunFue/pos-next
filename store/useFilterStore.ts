import { create } from 'zustand';
import dayjs from 'dayjs';

export interface DateRange {
  start: string;
  end: string;
}

interface FilterState {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  resetDateRange: () => void;
}

const getToday = () => dayjs().format('YYYY-MM-DD');

export const useFilterStore = create<FilterState>((set) => ({
  dateRange: {
    start: getToday(),
    end: getToday(),
  },
  setDateRange: (range) => set({ dateRange: range }),
  resetDateRange: () => {
    const today = getToday();
    set({ dateRange: { start: today, end: today } });
  },
}));
