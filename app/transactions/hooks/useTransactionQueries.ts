import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { TransactionItem, PaymentRecord } from "../types";

// --- Types for Raw Supabase Responses ---
interface TransactionRow {
  invoice_no: string;
  sku: string;
  item_name: string;
  cost_price: number;
  discount: number;
  quantity: number;
  total_price: number;
}

interface PaymentRow {
  invoice_no: string;
  transaction_time: string;
  costumer_name: string;
  amount_rendered: number;
  voucher: number;
  grand_total: number;
  change: number;
}

// --- 1. Hook for Line Items History ---
export const useTransactionHistory = () => {
  return useQuery({
    queryKey: ["transaction-items"], // Unique key for caching
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw new Error(error.message);

      // Map raw data to your frontend Type
      return (data as unknown as TransactionRow[]).map((item) => ({
        transactionNo: item.invoice_no || "N/A",
        barcode: item.sku,
        ItemName: item.item_name,
        unitPrice: item.cost_price,
        discount: item.discount,
        quantity: item.quantity,
        totalPrice: item.total_price,
      })) as TransactionItem[];
    },
  });
};

// --- 2. Hook for Payment/Header History ---
export const usePaymentHistory = () => {
  return useQuery({
    queryKey: ["payments"], // Unique key for caching
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("transaction_time", { ascending: false });

      if (error) throw new Error(error.message);

      // Map raw data to your frontend Type
      return (data as unknown as PaymentRow[]).map((p) => ({
        transactionNo: p.invoice_no,
        transactionTime: new Date(p.transaction_time).toLocaleString(),
        costumerName: p.costumer_name,
        amountRendered: p.amount_rendered,
        voucher: p.voucher,
        grandTotal: p.grand_total,
        change: p.change,
      })) as PaymentRecord[];
    },
  });
};
