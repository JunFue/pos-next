export type CustomerGroup = {
  id: string;
  name: string;
  is_shared: boolean;
  created_by: string;
  store_id: string;
};

import { z } from "zod";

export interface GuestTransaction {
  store_id: string;
  invoice_no: string;
  customer_name: string;
  grand_total: number;
  transaction_time: string; // ISO String from DB
  cashier_id: string;
}

export const customerSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone_number: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  remarks: z.string().optional().or(z.literal("")),
  group_id: z.string().min(1, "Customer group is required"),
  birthdate: z.string().min(1, "Birthdate is required"),
  date_of_registration: z.string().min(1, "Registration date is required"),
  civil_status: z.enum(["Single", "Married", "Widowed", "Divorced", "Separated"] as const, {
    message: "Civil status is required",
  }),
  gender: z.enum(["Male", "Female", "Not Specified"] as const, {
    message: "Gender is required",
  }),
});

// Derive the type from the schema
export type CustomerFormValues = z.infer<typeof customerSchema>;

export type Customer = {
  id: string;
  created_at: string; // timestamp
  store_id: string;
  full_name: string;
  phone_number: string | null;
  email: string | null;
  address: string | null;

  // These were missing or causing issues
  total_spent: number | null;
  visit_count: number | null;
  last_visit_at: string | null;
  remarks: string | null;
  group_id: string | null;
  admin_id: string | null;
  documents: string[] | null; // Array of strings (URLs)
  document_metadata: {
    folders: { id: string; name: string; filePaths: string[] }[];
    fileNames?: Record<string, string>;
    isLocked?: boolean;
  } | null;
  birthdate: string | null;
  date_of_registration: string | null;
  civil_status: "Single" | "Married" | "Widowed" | "Divorced" | "Separated" | null;
  gender: "Male" | "Female" | "Not Specified" | null;

  // Join fields (optional)
  group?: CustomerGroup;
};
