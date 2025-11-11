// itemTypes.ts
// (Corrected to fix TypeScript error)

import { z } from "zod";

// 1. Define and export the Zod schema
export const itemSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().optional(),

  // --- START OF FIX ---
  // We refactor costPrice to handle validation without the constructor object.
  // The form's 'valueAsNumber: true' will send a number or NaN.
  // z.number() on its own will pass NaN, as NaN is of type 'number'.
  costPrice: z
    .number()
    // 1. We refine the number. !isNaN(NaN) is false, so this
    //    will fail for NaN and show your custom error message.
    .refine((val) => !isNaN(val), {
      message: "Cost price must be a number",
    })
    // 2. After confirming it's a valid number (not NaN), we *pipe* it
    //    to a new schema to check if it's 0 or more.
    .pipe(z.number().min(0, "Cost price must be zero or more")),
  // --- END OF FIX ---

  description: z.string().optional(),
});

// 2. Export the inferred Item type
export type Item = z.infer<typeof itemSchema>;

// 3. Export the default values for the form
export const defaultItemValues: Item = {
  itemName: "",
  sku: "",
  category: "",
  costPrice: 0.0,
  description: "",
};
