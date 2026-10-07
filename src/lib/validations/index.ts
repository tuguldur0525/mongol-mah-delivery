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

export const cartItemSchema = z.union([
  z.object({
    productId: z.string().uuid(),
    quantityKg: z.number().positive().max(1000),
  }),
  z.object({
    bundleId: z.string().uuid(),
    quantityKg: z.number().positive().max(1000).multipleOf(0.01),
  }),
]);

export const cartSchema = z.array(cartItemSchema).min(1, "Сагс хоосон байна");

export const promoCodeFormSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{3,32}$/, "Промо код 3–32 үсэг, тоо эсвэл зураас байна"),
  discount_per_kg: z.coerce
    .number()
    .int()
    .positive("Кг тутмын хямдрал 0-ээс их байх ёстой"),
  minimum_kg: z.coerce
    .number()
    .positive("Доод жинг 0-ээс их оруулна уу")
    .max(10000)
    .multipleOf(0.01),
});

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

export const productBundleSchema = z.object({
  name: z.string().trim().min(2, "Багцын нэр оруулна уу").max(100),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  image_url: z.string().trim().optional().or(z.literal("")),
  price_per_kg: z.coerce.number().int().positive("Кг-ийн үнэ 0-ээс их байх ёстой"),
  min_kg: z.coerce.number().positive("Хамгийн бага жинг оруулна уу").max(1000).multipleOf(0.01),
  max_kg: z.coerce.number().positive("Хамгийн их жинг оруулна уу").max(1000).multipleOf(0.01),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().min(0),
}).refine((bundle) => bundle.max_kg >= bundle.min_kg, {
  message: "Хамгийн их жин нь хамгийн бага жингээс бага байж болохгүй",
  path: ["max_kg"],
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

export function calculatePromoDiscount(
  subtotal: number,
  totalKg: number,
  discountPerKg: number,
): number {
  return Math.min(subtotal, Math.round(totalKg * discountPerKg));
}
