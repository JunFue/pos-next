import { PosFormValues } from "@/components/sales-terminnal/utils/posSchema";
import { CartItem } from "../../TerminalCart";
import { supabase } from "@/lib/supabaseClient";

// Helper to prevent infinite hanging
const withTimeout = <T>(
  promise: PromiseLike<T>,
  ms: number,
  label: string
): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise), // Ensure it's a proper Promise
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms
      )
    ),
  ]) as Promise<T>; // Cast to Promise<T> because Promise.race can return Promise<any>
};

export const handleDone = async (
  data: PosFormValues,
  cartItems: CartItem[]
): Promise<boolean> => {
  console.log("--- [done.ts] Initiating Transaction Submission ---");

  try {
    // 1. Get User (Timeout after 5s)
    // Using getUser() verifies the token on the server, which is safer but slower.
    const { data: authData, error: authError } = await withTimeout(
      supabase.auth.getUser(),
      5000,
      "Auth Check"
    );

    if (authError || !authData.user) {
      console.error("Auth Error:", authError);
      alert("Session expired or invalid. Please log in again.");
      return false;
    }

    // 2. Prepare Header
    const headerPayload = {
      invoice_no: data.transactionNo,
      costumer_name: data.customerName,
      amount_rendered: data.payment,
      voucher: data.voucher || 0,
      grand_total: data.grandTotal,
      change: data.change,
      transaction_no: data.transactionNo,
      transaction_time: new Date().toISOString(),
      cashier_name: authData.user.id,
    };

    // 3. Prepare Items
    const itemsPayload = cartItems.map((item) => ({
      sku: item.sku,
      item_name: item.itemName,
      cost_price: item.unitPrice,
      total_price: item.total,
      discount: item.discount || 0,
      quantity: item.quantity,
    }));

    // 4. Execute RPC (Timeout after 10s)
    const { error } = await withTimeout(
      supabase.rpc("insert_new_payment_and_transaction", {
        header: headerPayload,
        items: itemsPayload,
      }),
      10000,
      "Transaction Save"
    );

    if (error) {
      console.error("Transaction RPC Error:", error.message);
      alert(`Transaction Failed: ${error.message}`);
      return false;
    }

    console.log("--- [done.ts] Transaction Saved Successfully ---");
    return true;
  } catch (err) {
    console.error("Unexpected error in handleDone:", err);
    alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    return false;
  }
};
