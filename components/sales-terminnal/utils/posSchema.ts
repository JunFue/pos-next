// app/inventory/components/stock-management/utils/posSchema.ts
import { z } from "zod";

// Format for peso/money values - accepts decimals and rounds to 2 decimal places
const pesoFormat = z
  .union([z.number(), z.nan()])
  .transform((val) => (isNaN(val) ? 0 : val))
  .transform((val) => Math.round(val * 100) / 100) // Round to 2 decimal places
  .refine((val) => val >= 0, "Value must be positive");

export const posSchema = z.object({
  payment: pesoFormat.nullable(),
  // Use nullable instead of optional so it's always part of the type
  customerName: z.string().nullable(),
  transactionNo: z.string().optional(),
  voucher: pesoFormat.nullable(), // LEGACY — kept for backward compat
  barcode: z.string(),
  grandTotal: pesoFormat,
  quantity: z.number().int().min(0).nullable(),
  discount: pesoFormat.nullable(),
  change: pesoFormat,
  // Order-level discount
  orderDiscountType: z.enum(['flat', 'percent']).nullable(),
  orderDiscountValue: pesoFormat.nullable(),
  orderDiscountAmount: pesoFormat.nullable(), // Computed flat deduction
  // Voucher (new system)
  voucherCode: z.string().nullable(),
  voucherAmount: pesoFormat.nullable(), // Computed redemption amount
  voucherId: z.string().nullable(),     // UUID of the voucher record
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
  // Order-level discount
  orderDiscountType: null,
  orderDiscountValue: null,
  orderDiscountAmount: null,
  // Voucher
  voucherCode: null,
  voucherAmount: null,
  voucherId: null,
});
