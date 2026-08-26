export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  description: string | null;
  price_per_kg: number;
  stock_kg: number;
  low_stock_threshold: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductWithCategory = Product & {
  categories: Pick<Category, "id" | "name" | "slug"> | null;
};

export type OrderPaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "preparing"
  | "delivering"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  note: string | null;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  currency: string;
  payment_method: "wire" | "cash" | "other";
  payment_status: OrderPaymentStatus;
  order_status: OrderStatus;
  wire_payment_id: string | null;
  payment_reference: string;
  stock_deducted: boolean;
  paid_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  quantity_kg: number;
  price_per_kg: number;
  subtotal: number;
  created_at: string;
};

export type OrderWithItems = Order & { order_items: OrderItem[] };

export type InventoryTransactionType =
  | "STOCK_IN"
  | "STOCK_OUT"
  | "ADJUSTMENT"
  | "RETURN";

export type InventoryTransaction = {
  id: string;
  product_id: string;
  type: InventoryTransactionType;
  quantity_kg: number;
  reference_type: string | null;
  reference_id: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
};
