"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FinancialReportItem } from "../../lib/types";

// Helper for currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const financialReportColumns: ColumnDef<FinancialReportItem>[] = [
  {
    accessorKey: "category",
    header: "Category",
    cell: (info) => <span className="font-medium text-slate-200">{info.getValue<string>()}</span>,
    footer: () => <span className="text-emerald-400 font-bold">TOTALS</span>,
  },
  {
    accessorKey: "cash_forwarded",
    header: () => <div className="text-right text-blue-300">Cash Forwarded</div>,
    cell: (info) => <div className="text-right text-slate-400">{formatCurrency(info.getValue<number>())}</div>,
    footer: ({ table }) => {
      const total = table.getFilteredRowModel().rows.reduce((sum, row) => sum + row.original.cash_forwarded, 0);
      return <div className="text-right text-blue-200 font-bold">{formatCurrency(total)}</div>;
    },
  },
  {
    accessorKey: "gross_income",
    header: () => <div className="text-right text-emerald-300">Gross Income</div>,
    cell: (info) => <div className="text-right text-emerald-100">{formatCurrency(info.getValue<number>())}</div>,
    footer: ({ table }) => {
      const total = table.getFilteredRowModel().rows.reduce((sum, row) => sum + row.original.gross_income, 0);
      return <div className="text-right text-emerald-200 font-bold">{formatCurrency(total)}</div>;
    },
  },
  {
    accessorKey: "expenses",
    header: () => <div className="text-right text-rose-300">Expenses</div>,
    cell: (info) => <div className="text-right text-rose-100">{formatCurrency(info.getValue<number>())}</div>,
    footer: ({ table }) => {
      const total = table.getFilteredRowModel().rows.reduce((sum, row) => sum + row.original.expenses, 0);
      return <div className="text-right text-rose-200 font-bold">{formatCurrency(total)}</div>;
    },
  },
  {
    accessorKey: "cash_on_hand",
    header: () => <div className="text-right font-bold text-white">Cash on Hand</div>,
    cell: (info) => <div className="text-right font-bold text-slate-100">{formatCurrency(info.getValue<number>())}</div>,
    footer: ({ table }) => {
      const total = table.getFilteredRowModel().rows.reduce((sum, row) => sum + row.original.cash_on_hand, 0);
      return (
        <div className="text-right text-xl text-white font-bold underline decoration-emerald-500 decoration-2 underline-offset-4">
          {formatCurrency(total)}
        </div>
      );
    },
  },
];