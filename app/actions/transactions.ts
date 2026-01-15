"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// --- 1. Domain Interfaces (Inputs) ---

export interface TransactionHeader {
  invoice_no?: string; // Optional - backend generates this
  customer_name: string | null;
  amount_rendered: number;
  voucher: number;
  grand_total: number;
  change: number;
  transaction_no?: string; // Optional - backend may generate this
  cashier_name: string;
  transaction_time?: string | null; // Optional - for backdating
  customer_id?: string | null; // Optional - for customer association
}

export interface TransactionItem {
  sku: string;
  item_name: string;
  cost_price: number;
  total_price: number;
  discount: number;
  quantity: number;
}

// --- 1b. Insert Type Interfaces ---

export interface PaymentInsert {
  customer_name: string | null;
  amount_rendered: number;
  voucher: number;
  grand_total: number;
  change: number;
  cashier_name: string;
  transaction_time?: string | null;
  customer_id?: string | null;
  // invoice_no is NOT sent - database handles it
}

export interface TransactionInsert {
  payment_id: string; // REQUIRED - UUID from payment
  sku: string;
  item_name: string;
  cost_price: number;
  total_price: number;
  discount: number;
  quantity: number;
  transaction_time?: string | null;
  // invoice_no is optional or not needed for insert
}

// --- 2. Database Row Interfaces (Outputs) ---

// Inferred from your 'transactions' table filters and select(*)
export interface TransactionRecord {
  id: string; // standard supabase id
  transaction_time: string;
  invoice_no: string;
  sku: string; // Mapped from 'barcode' filter
  item_name: string; // Mapped from 'ItemName' filter
  [key: string]: string | number | boolean | null; // Allow other DB columns
}

// Inferred from your 'payments' table filters and select(*)
export interface PaymentRecord {
  id: string;
  transaction_time: string;
  invoice_no: string;
  customer_name: string | null;
  [key: string]: string | number | boolean | null; // Allow other DB columns
}

// --- 3. Filter Interfaces ---

export interface TransactionFilters {
  startDate?: string | null;
  endDate?: string | null;
  transactionNo?: string;
  barcode?: string;
  ItemName?: string;
}

export interface PaymentFilters {
  startDate?: string | null;
  endDate?: string | null;
  transactionNo?: string;
  customerName?: string;
}

// --- 4. Shared Response Type ---

// Removed default 'any' to force explicit typing
export type ActionResponse<T> =
  | { success: true; data?: T; count?: number | null }
  | { success: false; error: string };

// --- 5. Server Actions ---

export async function processTransaction(
  header: TransactionHeader,
  items: TransactionItem[]
): Promise<ActionResponse<{ invoice_no: string; payment_id: string }>> {
  const supabase = await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return { success: false, error: "SESSION_EXPIRED_PLEASE_RELOAD" };
  }

  try {
    // Step A: Insert Payment (without invoice_no)
    const paymentPayload: PaymentInsert = {
      customer_name: header.customer_name,
      amount_rendered: header.amount_rendered,
      voucher: header.voucher,
      grand_total: header.grand_total,
      change: header.change,
      cashier_name: header.cashier_name,
      transaction_time: header.transaction_time,
      customer_id: header.customer_id,
    };

    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .insert(paymentPayload)
      .select("id, invoice_no")
      .single();

    if (paymentError || !paymentData) {
      console.error("Payment Insert Error:", paymentError);
      return { success: false, error: paymentError?.message || "Payment insertion failed" };
    }

    // Step B: Capture the returned payment ID
    const paymentId = paymentData.id;
    const invoiceNo = paymentData.invoice_no;

    // Step C: Map cart items to transaction objects with payment_id
    const transactionPayloads: TransactionInsert[] = items.map((item) => ({
      payment_id: paymentId,
      sku: item.sku,
      item_name: item.item_name,
      cost_price: item.cost_price,
      total_price: item.total_price,
      discount: item.discount,
      quantity: item.quantity,
      transaction_time: header.transaction_time,
    }));

    // Step D: Insert transactions
    const { error: transactionsError } = await supabase
      .from("transactions")
      .insert(transactionPayloads);

    if (transactionsError) {
      console.error("Transactions Insert Error:", transactionsError);
      return { success: false, error: transactionsError.message };
    }

    revalidatePath("/transactions");
    return { success: true, data: { invoice_no: invoiceNo, payment_id: paymentId } };
  } catch (error) {
    console.error("Transaction Processing Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

export async function getTransactionHistory(
  page: number,
  pageSize: number,
  filters: TransactionFilters
): Promise<ActionResponse<TransactionRecord[]>> {
  // Explicit Return Type
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("transactions").select("*", { count: "exact" });

  if (filters.startDate) {
    query = query.gte("transaction_time", `${filters.startDate}T00:00:00`);
  }
  if (filters.endDate) {
    query = query.lte("transaction_time", `${filters.endDate}T23:59:59`);
  }

  const columnMap: Record<string, string> = {
    transactionNo: "invoice_no",
    barcode: "sku",
    ItemName: "item_name",
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (value && key !== "startDate" && key !== "endDate") {
      const dbColumn = columnMap[key];
      if (dbColumn) {
        query = query.ilike(dbColumn, `%${value as string}%`);
      }
    }
  });

  // Supabase returns generic data, so we cast it to our defined type
  const { data, error, count } = await query
    .range(from, to)
    .order("transaction_time", { ascending: false })
    .returns<TransactionRecord[]>();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data || [], count };
}

export async function getPaymentHistory(
  page: number,
  pageSize: number,
  filters: PaymentFilters
): Promise<ActionResponse<PaymentRecord[]>> {
  // Explicit Return Type
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("payments").select("*", { count: "exact" });

  if (filters.startDate) {
    query = query.gte("transaction_time", `${filters.startDate}T00:00:00`);
  }
  if (filters.endDate) {
    query = query.lte("transaction_time", `${filters.endDate}T23:59:59`);
  }

  const columnMap: Record<string, string> = {
    transactionNo: "invoice_no",
    customerName: "customer_name",
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (value && key !== "startDate" && key !== "endDate") {
      const dbColumn = columnMap[key];
      if (dbColumn) {
        query = query.ilike(dbColumn, `%${value as string}%`);
      }
    }
  });

  const { data, error, count } = await query
    .range(from, to)
    .order("transaction_time", { ascending: false })
    .returns<PaymentRecord[]>();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data || [], count };
}
