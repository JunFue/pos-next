"use client";

import React, { useEffect, useState } from "react";
import { TransactionItem } from "../../types";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

// Define the shape of the raw Supabase data
interface TransactionRow {
  invoice_no: string;
  sku: string;
  item_name: string;
  cost_price: number;
  discount: number;
  quantity: number;
  total_price: number;
}

export const TransactionHistoryTable = () => {
  const [data, setData] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    // Removed setLoading(true) here to prevent synchronous update warning

    const { data: items, error } = await supabase
      .from("transactions")
      .select("*")
      .order("id", { ascending: false });

    if (!error && items) {
      // Cast items to the interface to avoid 'any' error
      const mappedData: TransactionItem[] = (
        items as unknown as TransactionRow[]
      ).map((item) => ({
        transactionNo: item.invoice_no || "N/A",
        barcode: item.sku,
        ItemName: item.item_name,
        unitPrice: item.cost_price,
        discount: item.discount,
        quantity: item.quantity,
        totalPrice: item.total_price,
      }));
      setData(mappedData);
    } else {
      console.error("Error fetching transactions:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Wrap in setTimeout to push execution to next tick (fixes 'synchronous setState' error)
    const timer = setTimeout(() => {
      fetchHistory();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg glass-effect">
      <div className="overflow-x-auto">
        <table className="w-full text-slate-300 text-sm text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 rounded-tl-lg">Invoice Ref</th>
              <th className="px-6 py-3">Barcode</th>
              <th className="px-6 py-3">Item Name</th>
              <th className="px-6 py-3 text-right">Unit Price</th>
              <th className="px-6 py-3 text-right">Qty</th>
              <th className="px-6 py-3 text-yellow-500 text-right">Discount</th>
              <th className="px-6 py-3 rounded-tr-lg font-bold text-white text-right">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
