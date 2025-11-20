// app/inventory/components/stock-management/components/buttons/handlers/addToCart.ts
import {
  UseFormGetValues,
  UseFormResetField,
  UseFormSetValue,
} from "react-hook-form";
import { PosFormValues } from "@/components/sales-terminnal/utils/posSchema";
import { Item } from "@/app/inventory/components/item-registration/utils/itemTypes";
import { CartItem } from "../../TerminalCart";

type AddToCartParams = {
  getValues: UseFormGetValues<PosFormValues>;
  setValue: UseFormSetValue<PosFormValues>;
  resetField: UseFormResetField<PosFormValues>;
  allItems: Item[];
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
};

export const handleAddToCart = ({
  getValues,
  resetField,
  allItems,
  cartItems,
  setCartItems,
}: AddToCartParams) => {
  console.log("--- [addToCart.ts] Executing Add to Cart Logic ---");

  // 1. Get values
  const { barcode, quantity, discount } = getValues();
  const discountValue = discount || 0; // Ensure 0 if undefined/null

  // 2. Validation
  if (!barcode) {
    alert("Please select an item first.");
    return;
  }
  if (!quantity || quantity <= 0) {
    alert("Please enter a valid quantity.");
    return;
  }

  const itemDetails = allItems.find((item) => item.sku === barcode);

  if (!itemDetails) {
    alert("Item not found. Please check the SKU/Barcode.");
    return;
  }

  // 3. Calculate Costs
  // Logic: (Qty * Price) - Discount
  const unitPrice = itemDetails.costPrice;
  const total = quantity * unitPrice - discountValue;

  // 4. Update Cart State
  const existingItemIndex = cartItems.findIndex((item) => item.sku === barcode);

  if (existingItemIndex !== -1) {
    // Update existing item
    setCartItems((prevCart) =>
      prevCart.map((item, index) => {
        if (index === existingItemIndex) {
          const newQuantity = item.quantity + quantity;
          // Request 1: Accumulate discount properly
          const newDiscount = (item.discount || 0) + discountValue;
          const newTotal = item.total + total;

          return {
            ...item,
            quantity: newQuantity,
            discount: newDiscount,
            total: newTotal,
          };
        }
        return item;
      })
    );
  } else {
    // Add new item
    const newCartItem: CartItem = {
      id: barcode,
      sku: barcode,
      itemName: itemDetails.itemName,
      unitPrice: unitPrice,
      discount: discountValue, // Request 1: Ensure discount is passed
      quantity: quantity,
      total: total,
    };
    setCartItems((prevCart) => [...prevCart, newCartItem]);
  }

  // 5. Reset Fields
  resetField("barcode");
  resetField("quantity");
  resetField("discount"); // Request 2: Clear discount field

  console.log("--- [addToCart.ts] Item added successfully ---");
};
