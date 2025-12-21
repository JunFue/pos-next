"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { fetchFinancialReport } from "../lib/dashboard.api"; 
import { FinancialReportItem } from "../lib/types";

export const useFinancialReport = (
  defaultStartDate = dayjs().startOf('month').format('YYYY-MM-DD'),
  defaultEndDate = dayjs().endOf('month').format('YYYY-MM-DD')
) => {
  const [dateRange, setDateRange] = useState({
    start: defaultStartDate,
    end: defaultEndDate
  });
  
  const [data, setData] = useState<FinancialReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchFinancialReport(dateRange.start, dateRange.end);
        setData(result);
      } catch (e) {
        console.error("Failed to load financial report:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dateRange.start, dateRange.end]);

  const updateDate = (key: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [key]: value }));
  };

  return {
    data,
    isLoading,
    dateRange,
    updateDate
  };
};