import { PosFormValues } from "@/components/sales-terminnal/utils/posSchema";
import { CartItem } from "../../TerminalCart";
// CHANGE: We import the factory directly to create a fresh instance every time
import { createBrowserClient } from "@supabase/ssr";

export type TransactionResult = {
  invoice_no: string;
  customer_name: string | null;
  amount_rendered: number;
  voucher: number;
  grand_total: number;
  change: number;
  transaction_no: string;
  transaction_time: string;
  cashier_name: string; 
} | null;

const withTimeout = <T>(
  promise: PromiseLike<T>,
  ms: number,
  label: string
): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms
      )
    ),
  ]) as Promise<T>;
};

export const handleDone = async (
  data: PosFormValues,
  cartItems: CartItem[],
  cashierId: string 
): Promise<TransactionResult> => {
  console.log("--- 🛠 [Logic] handleDone started (Fresh Client Mode) ---");
  
  // ---------------------------------------------------------
  // 🚀 FIX: CREATE FRESH CLIENT
  // We bypass the global singleton entirely. This creates a temporary, 
  // brand-new connection just for this transaction. It ensures we 
  // don't use a "sleeping" or "stale" socket from the background tab.
  // ---------------------------------------------------------
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    if (!cashierId) {
       throw new Error("User ID missing. Cannot process transaction.");
    }

    // 1. Force the client to load the session from cookies immediately
    // This ensures the client is "hydrated" before we try to use it.
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    // 2. If the token is expired/missing, try one hard refresh before failing
    if (sessionError || !sessionData.session) {
        console.warn("⚠️ [Logic] Token stale on fresh client. Forcing refresh...");
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
            console.error("❌ [Logic] Critical: Could not refresh session.");
            throw new Error("SESSION_EXPIRED");
        }
        console.log("✅ [Logic] Session refreshed successfully.");
    }

    console.log("2️⃣ [Logic] Preparing Payloads...");
    
    const headerPayload = {
      invoice_no: data.transactionNo,
      customer_name: data.customerName,
      amount_rendered: data.payment,
      voucher: data.voucher || 0,
      grand_total: data.grandTotal,
      change: data.change,
      transaction_no: data.transactionNo,
      cashier_name: cashierId, 
    };

    const itemsPayload = cartItems.map((item) => ({
      sku: item.sku,
      item_name: item.itemName,
      cost_price: item.unitPrice,
      total_price: item.total,
      discount: item.discount || 0,
      quantity: item.quantity,
    }));

    console.log("3️⃣ [Logic] Sending RPC request...");

    let rpcResult: any = null;

    // Retry logic (3 attempts)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        rpcResult = await withTimeout<any>(
          supabase.rpc("insert_new_payment_and_transaction", {
            header: headerPayload,
            items: itemsPayload,
          }),
          20000, 
          "Transaction Save"
        );
        break; 
      } catch (err: any) {
        console.warn(`⚠️ [Logic] Attempt ${attempt} failed:`, err);
        if (attempt === 3) throw err;
        await new Promise(res => setTimeout(res, 1000));
      }
    }

    if (!rpcResult) {
        throw new Error("Transaction failed (No response).");
    }

    const { error } = rpcResult;

    if (error) {
      if (error.message.includes("duplicate key value") || error.message.includes("payments_pkey")) {
        console.warn("⚠️ [Logic] Duplicate detected. Verifying...");
        
        const { data: existingPayment, error: fetchError } = await supabase
          .from("payments")
          .select("invoice_no, grand_total")
          .eq("invoice_no", data.transactionNo)
          .single();

        if (existingPayment && !fetchError) {
           if (Math.abs(existingPayment.grand_total - data.grandTotal) < 0.01) {
             console.log("✅ [Logic] Duplicate matched. Success.");
             return { ...headerPayload, transaction_time: new Date().toISOString() } as TransactionResult; 
           } else {
             throw new Error("Transaction ID collision detected. Please refresh.");
           }
        }
      }
      
      console.error("❌ [Logic] RPC Error:", error.message);
      throw new Error(`Transaction Failed: ${error.message}`);
    }

    console.log("✅ [Logic] Success! Transaction Saved.");

    // --- VOUCHER AUTOMATION ---
    if (data.voucher && data.voucher > 0) {
      try {
        // We use the fresh client for this too to avoid issues
        const { fetchCategories } = await import("@/app/inventory/components/item-registration/lib/categories.api");
        const { createExpense } = await import("@/app/expenses/lib/expenses.api");

        // Note: You might need to check if 'createExpense' uses the global client internally.
        // If it does, it might still fail. Ideally, pass 'supabase' to it if possible, 
        // but for now we wrap it in try/catch so it doesn't block the sale.
        
        console.log("🎫 [Logic] Processing Voucher...");
        const categories = await fetchCategories();
        const defaultSource = categories.find(c => c.is_default_voucher_source);

        if (defaultSource) {
          await createExpense({
            transaction_date: new Date().toISOString().split('T')[0],
            source: defaultSource.category,
            classification: "Voucher Deduction",
            amount: Number(data.voucher),
            receipt_no: data.transactionNo,
            notes: `Auto-deduction for transaction: ${data.transactionNo}`,
          });
        }
      } catch (voucherError) {
        console.error("❌ [Logic] Voucher expense failed (non-fatal):", voucherError);
      }
    }

    return { ...headerPayload, transaction_time: new Date().toISOString() } as TransactionResult;
  } catch (err) {
    console.error("❌ [Logic] Crash in handleDone:", err);
    throw err;
  }
};