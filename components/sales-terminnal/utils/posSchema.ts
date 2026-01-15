// app/inventory/components/stock-management/utils/posSchema.ts
import { z } from "zod";

const pesoFormat = z
  .union([z.number(), z.nan()])
  .transform((val) => (isNaN(val) ? 0 : val))
  .refine((val) => val >= 0, "Value must be positive");

export const posSchema = z.object({
  payment: pesoFormat.nullable(),
  // Use nullable instead of optional so it's always part of the type
  customerName: z.string().nullable(),
  transactionNo: z.string().optional(),
  voucher: pesoFormat.nullable(),
  barcode: z.string(),
  grandTotal: z.number(),
  quantity: z.number().int().min(0).nullable(),
  discount: pesoFormat.nullable(),
  change: z.number(),
});

export type PosFormValues = z.infer<typeof posSchema>;

export const getDefaultFormValues = (): PosFormValues => ({
  payment: null,
  // Explicitly set to null to satisfy string | null
  customerName: null,
  transactionNo: "",
  voucher: null,
  barcode: "",
  grandTotal: 0,
  quantity: null,
  discount: null,
  change: 0,
});
