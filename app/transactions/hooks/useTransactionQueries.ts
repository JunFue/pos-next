import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { TransactionItem, PaymentRecord } from "../types";

// --- Types for Raw Supabase Responses ---
interface TransactionRow {
  invoice_no: string; // Ensure this matches your DB column (sometimes it's transaction_no)
  sku: string;
  item_name: string;
  cost_price: number;
  discount: number;
  quantity: number;
  total_price: number;
  created_at?: string; // Optional: Good to have for sorting
  id?: number;
}

interface PaymentRow {
  invoice_no: string;
  transaction_time: string;
  customer_name: string;
  amount_rendered: number;
  voucher: number;
  grand_total: number;
  change: number;
}

// --- 1. Hook for Line Items History (WITH PAGINATION) ---
export const useTransactionHistory = (page: number, pageSize: number) => {
  return useQuery({
    queryKey: ["transaction-items", page, pageSize],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // CHECK DB: Ensure 'transactions' table has these columns
      const { data, error, count } = await supabase
        .from("transactions")
        .select("*", { count: "exact" })
        .range(from, to)
        // Prefer sorting by created_at if available, otherwise fallback to id
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching transaction history:", error);
        throw new Error(error.message);
      }

      const formattedData = (data as unknown as TransactionRow[]).map(
        (item) => ({
          transactionNo: item.invoice_no || "N/A",
          barcode: item.sku,
          ItemName: item.item_name,
          unitPrice: item.cost_price,
          discount: item.discount,
          quantity: item.quantity,
          totalPrice: item.total_price,
        })
      ) as TransactionItem[];

      return {
        data: formattedData,
        count: count || 0,
      };
    },
  });
};

// --- 2. Hook for Payment/Header History ---
export const usePaymentHistory = () => {
  return useQuery({
    queryKey: ["payments"], // Consider adding a limit key here if you paginate later
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("transaction_time", { ascending: false })
        .limit(50); // <--- CRITICAL FIX: Added limit to prevent crashing

      if (error) {
        console.error("Error fetching payment history:", error);
        throw new Error(error.message);
      }

      return (data as unknown as PaymentRow[]).map((p) => ({
        transactionNo: p.invoice_no,
        transactionTime: new Date(p.transaction_time).toLocaleString(),
        customerName: p.customer_name,
        amountRendered: p.amount_rendered,
        voucher: p.voucher,
        grandTotal: p.grand_total,
        change: p.change,
      })) as PaymentRecord[];
    },
  });
};
