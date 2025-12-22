import React from "react";
// Import your Expense type if needed, e.g. from api or hooks
import { ExpenseData } from "../../lib/expenses.api";

interface CashoutTableProps {
  expenses: ExpenseData[];
  isLoading: boolean;
}

export const CashoutTable = ({ expenses, isLoading }: CashoutTableProps) => {
  return (
    <div className="p-6 glass-effect">
      <h3 className="mb-4 font-semibold text-white text-lg">Recent Cashouts</h3>
      {isLoading ? (
        <div className="py-8 text-slate-400 text-center">
          Loading records...
        </div>
      ) : (
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-slate-300 text-sm text-left">
            <thead className="top-0 z-10 sticky bg-black/50 backdrop-blur-md">
              <tr className="border-slate-700 border-b">
                <th className="py-3">Date</th>
                <th className="py-3">Source</th>
                <th className="py-3">Classification</th>
                <th className="py-3">Receipt</th>
                <th className="py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-slate-500 text-center">
                    No expenses recorded yet.
                  </td>
                </tr>
              ) : (
                expenses.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3">{row.transaction_date}</td>
                    <td className="py-3 font-medium text-cyan-400">
                      {row.source}
                    </td>
                    <td className="py-3">{row.classification}</td>
                    <td className="py-3 text-slate-400">
                      {row.receipt_no || "-"}
                    </td>
                    <td className="py-3 text-red-400 text-right">
                      -₱
                      {Number(row.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
