import { z } from "zod";

export const checkoutSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(2, "Нэрээ бүрэн оруулна уу"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{8}$/, "Утасны дугаар 8 оронтой тоо байх ёстой"),
  address: z.string().trim().min(5, "Хүргэлтийн хаягаа бүрэн оруулна уу"),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantityKg: z.number().positive().max(1000),
});

export const cartSchema = z.array(cartItemSchema).min(1, "Сагс хоосон байна");

export const productFormSchema = z.object({
  name: z.string().trim().min(2, "Нэр оруулна уу"),
  category_id: z.string().uuid("Ангилал сонгоно уу"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  price_per_kg: z.coerce.number().int().positive("Үнэ 0-ээс их байх ёстой"),
  stock_kg: z.coerce.number().min(0),
  low_stock_threshold: z.coerce.number().min(0),
  image_url: z.string().trim().optional().or(z.literal("")),
  is_available: z.boolean(),
});

export const stockChangeSchema = z.object({
  product_id: z.string().uuid(),
  quantity_kg: z.coerce.number().positive("Хэмжээгээ оруулна уу"),
  reason: z.string().trim().min(1, "Шалтгаан оруулна уу"),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const stockAdjustSchema = stockChangeSchema;

export const manualOrderSchema = z.object({
  customer_name: z.string().trim().min(2),
  phone: z.string().trim().regex(/^\d{8}$/, "8 оронтой утасны дугаар"),
  address: z.string().trim().min(5),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  payment_method: z.enum(["wire", "cash", "other"]),
  payment_status: z.enum(["pending", "paid"]),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity_kg: z.coerce.number().positive(),
      }),
    )
    .min(1, "Бүтээгдэхүүн сонгоно уу"),
});

export function formatMnt(amount: number): string {
  return `${new Intl.NumberFormat("mn-MN").format(amount)}₮`;
}

export function formatKg(kg: number): string {
  return `${new Intl.NumberFormat("mn-MN", {
    maximumFractionDigits: 2,
  }).format(kg)} кг`;
}
