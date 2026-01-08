export type CustomerGroup = {
  id: string;
  name: string;
  is_shared: boolean;
  created_by: string;
  store_id: string;
};

export type Customer = {
  id: string;
  full_name: string;
  phone_number: string;
  group_id: string | null;
  group?: CustomerGroup;
  total_spent: number;
};

export type CustomerFormValues = {
  full_name: string;
  phone_number: string;
  group_id: string;
};