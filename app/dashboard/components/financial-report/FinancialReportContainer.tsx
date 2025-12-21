"use client";

import dayjs from "dayjs";
import { useFinancialReport } from "../../hooks/useFinancialReport";
import { FinancialReportTable } from "./FinancialReportTable";

export const FinancialReportContainer = () => {
  const { data, isLoading, dateRange, updateDate } = useFinancialReport();

  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-800 space-y-6">
      
      {/* Controls Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-emerald-400">Financial Report</h2>
        
        <div className="flex items-center gap-4">
          <DateInput 
            label="From" 
            value={dateRange.start} 
            onChange={(val) => updateDate("start", val)} 
          />
          <DateInput 
            label="To" 
            value={dateRange.end} 
            onChange={(val) => updateDate("end", val)} 
          />
        </div>
      </div>

      {/* Presentational Table */}
      <FinancialReportTable data={data} isLoading={isLoading} />

      {/* Footer Legend */}
      <div className="text-xs text-slate-500 text-center flex flex-col sm:flex-row justify-center gap-2 sm:gap-6 mt-2">
         <span>Forwarded = Balance before {dayjs(dateRange.start).format("MMM D")}</span>
         <span className="font-mono text-emerald-500/80">
            (Total Forwarded + Total Gross) - Total Expenses = Total Cash on Hand
         </span>
      </div>
    </div>
  );
};

// Small internal helper for the date inputs to keep the main JSX clean
const DateInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
  <div className="flex items-center gap-2">
    <label className="text-sm text-slate-400">{label}</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
    />
  </div>
);