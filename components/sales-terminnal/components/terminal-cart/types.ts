export type DiscountType = 'flat' | 'percent';

export type CartItem = {
  id: string;
  sku: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  // Per-item discount
  discountType: DiscountType;   // 'flat' = ₱ amount, 'percent' = %
  discountValue: number;        // Raw input (e.g. 10 for 10% or ₱10)
  discount: number;             // Computed flat amount (backward compat with DB)
  total: number;
};

export type TerminalCartProps = {
  rows: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<CartItem>) => void;
  onItemDiscountClick?: (item: CartItem) => void;
};
