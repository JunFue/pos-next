"use client";

import React, { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useTransactionHistory } from "../../hooks/useTransactionQueries";
import { ItemTablePagination } from "@/components/reusables/ItemTablePagination";
// Adjust this import path to where you placed the reusable component

export const TransactionHistoryTable = () => {
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // --- Fetch Data with Pagination Params ---
  const {
    data: queryResult,
    isLoading,
    isError,
    error,
  } = useTransactionHistory(currentPage, rowsPerPage);

  const transactions = queryResult?.data || [];
  const totalRows = queryResult?.count || 0;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  // --- Handlers ---
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRowsPerPageChange = (newSize: number) => {
    setRowsPerPage(newSize);
    setCurrentPage(1); // Reset to first page on size change
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10 rounded-lg glass-effect">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 p-10 rounded-lg text-red-400 glass-effect">
        <AlertCircle className="w-5 h-5" />
        <span>Error loading history: {(error as Error).message}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg h-full overflow-hidden glass-effect">
      {/* Scrollable Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-slate-300 text-sm text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 whitespace-nowrap">Invoice Ref</th>
              <th className="px-6 py-3 whitespace-nowrap">Barcode</th>
              <th className="px-6 py-3 whitespace-nowrap">Item Name</th>
              <th className="px-6 py-3 text-right whitespace-nowrap">
                Unit Price
              </th>
              <th className="px-6 py-3 text-right whitespace-nowrap">Qty</th>
              <th className="px-6 py-3 text-yellow-500 text-right whitespace-nowrap">
                Discount
              </th>
              <th className="px-6 py-3 font-bold text-white text-right whitespace-nowrap">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-slate-500 text-center"
                >
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((item, index) => (
                <tr
                  key={`${item.transactionNo}-${index}`}
                  className="hover:bg-slate-800/30 border-slate-700 border-b transition-colors"
                >
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {item.transactionNo}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-400">
                    {item.barcode}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {item.ItemName}
                  </td>
                  <td className="px-6 py-4 text-right">
                    ₱{item.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">{item.quantity}</td>
                  <td className="px-6 py-4 text-yellow-500 text-right">
                    {item.discount > 0 ? `-₱${item.discount.toFixed(2)}` : "-"}
                  </td>
                  <td className="px-6 py-4 font-bold text-cyan-400 text-right">
                    ₱{item.totalPrice.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Pagination Component --- */}
      <div className="mt-auto">
        <ItemTablePagination
          startRow={(currentPage - 1) * rowsPerPage}
          endRow={Math.min(currentPage * rowsPerPage, totalRows)}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          paginationOptions={[10, 20, 50, 100]}
          onRowsPerPageChange={handleRowsPerPageChange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};
