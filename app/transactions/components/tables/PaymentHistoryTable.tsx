"use client";

import React, { useEffect, useState } from "react";
import { PaymentRecord } from "../../types";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

// Define the shape of the raw Supabase data
interface PaymentRow {
  invoice_no: string;
  transaction_time: string;
  costumer_name: string;
  amount_rendered: number;
  voucher: number;
  grand_total: number;
  change: number;
}

export const PaymentHistoryTable = () => {
  const [data, setData] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .order("transaction_time", { ascending: false });

    if (!error && payments) {
      // Cast payments to the interface
      const mappedData: PaymentRecord[] = (
        payments as unknown as PaymentRow[]
      ).map((p) => ({
        transactionNo: p.invoice_no,
        transactionTime: new Date(p.transaction_time).toLocaleString(),
        costumerName: p.costumer_name,
        amountRendered: p.amount_rendered,
        voucher: p.voucher,
        grandTotal: p.grand_total,
        change: p.change,
      }));
      setData(mappedData);
    } else if (error) {
      console.error("Error fetching payments:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Wrap in setTimeout to ensure async execution after render
    const timer = setTimeout(() => {
      fetchPayments();
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
              <th className="px-6 py-3 rounded-tl-lg">Invoice No</th>
              <th className="px-6 py-3">Date & Time</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3 text-right">Total</th>
              <th className="px-6 py-3 text-right">Payment</th>
              <th className="px-6 py-3 text-blue-400 text-right">Voucher</th>
              <th className="px-6 py-3 rounded-tr-lg text-green-400 text-right">
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((pay, index) => (
              <tr
                key={index}
                className="hover:bg-slate-800/30 border-slate-700 border-b transition-colors"
              >
                <td className="px-6 py-4 font-mono text-slate-400">
                  {pay.transactionNo}
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">
                  {pay.transactionTime}
                </td>
                <td className="px-6 py-4 font-medium text-white">
                  {pay.costumerName || (
                    <span className="opacity-50 italic">Walk-in</span>
                  )}
                </td>
                <td className="px-6 py-4 font-bold text-right">
                  ₱{pay.grandTotal.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right">
                  ₱{pay.amountRendered.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-blue-400 text-right">
                  {pay.voucher > 0 ? `₱${pay.voucher.toFixed(2)}` : "-"}
                </td>
                <td className="px-6 py-4 font-bold text-green-400 text-right">
                  ₱{pay.change.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
