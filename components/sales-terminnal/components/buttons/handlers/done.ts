// app/inventory/components/stock-management/components/buttons/handlers/done.ts
import { PosFormValues } from "@/components/sales-terminnal/utils/posSchema";
import { CartItem } from "../../TerminalCart";
import { supabase } from "@/lib/supabaseClient";

export const handleDone = async (
  data: PosFormValues,
  cartItems: CartItem[]
): Promise<boolean> => {
  console.log("--- [done.ts] Initiating Transaction Submission ---");

  // 1. Get Current Authenticated User (Cashier)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("No active session found. Please log in.");
    return false;
  }

  // 2. Prepare the Header Payload
  // We ONLY send what the frontend knows. The Database handles the lookups.
  const headerPayload = {
    invoice_no: data.transactionNo,
    costumer_name: data.customerName,
    amount_rendered: data.payment,
    voucher: data.voucher || 0,
    grand_total: data.grandTotal,
    change: data.change,
    transaction_no: data.transactionNo,
    transaction_time: new Date().toISOString(),
    cashier_name: user.id, // The SQL function will use this to find store_id/admin_id
  };

  // 3. Prepare the Items Payload
  const itemsPayload = cartItems.map((item) => ({
    sku: item.sku,
    item_name: item.itemName,
    cost_price: item.unitPrice,
    total_price: item.total,
    discount: item.discount || 0,
    quantity: item.quantity,
  }));

  try {
    // 4. Call the new "All-in-One" RPC function
    const { error } = await supabase.rpc("insert_new_payment_and_transaction", {
      header: headerPayload,
      items: itemsPayload,
    });

    if (error) {
      console.error("Transaction Error:", error.message);
      alert(`Transaction Failed: ${error.message}`);
      return false;
    }

    console.log("--- [done.ts] Transaction Saved Successfully ---");
    return true;
  } catch (err) {
    console.error("Unexpected error in handleDone:", err);
    return false;
  }
};
