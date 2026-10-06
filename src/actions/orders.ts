"use server";

import "server-only";
import { randomBytes } from "crypto";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOrderPayment } from "@/lib/wire/payments";
import { checkoutSchema, cartSchema } from "@/lib/validations";
import type { OrderWithItems, Product } from "@/types";

export type CheckoutResult =
  | { ok: true; redirectUrl: string; orderNumber: string }
  | { ok: false; error: string };

function siteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionUrl) return `https://${productionUrl}`;

  if (process.env.VERCEL_ENV === "production") {
    return "https://mongol-mah.vercel.app";
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl}`;

  return "http://localhost:3000";
}

function generateOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `ORD-${ymd}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

/**
 * Guest checkout: validate cart server-side, create pending order,
 * create Wire PaymentIntent + hosted checkout session.
 * Prices/stock are always taken from the database, never from the browser.
 */
export async function createOrderAndPayment(
  formData: FormData,
  cartJson: string,
): Promise<CheckoutResult> {
  const supabase = createAdminClient();

  // 1. Validate customer fields
  const parsedCustomer = checkoutSchema.safeParse({
    customer_name: formData.get("customer_name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    note: formData.get("note") ?? "",
  });
  if (!parsedCustomer.success) {
    return { ok: false, error: parsedCustomer.error.issues[0].message };
  }

  // 2. Validate cart structure
  let cart: z.infer<typeof cartSchema>;
  try {
    const raw = JSON.parse(cartJson);
    const parsed = cartSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Сагсны мэдээлэл буруу байна" };
    cart = parsed.data;
  } catch {
    return { ok: false, error: "Сагсны мэдээлэл буруу байна" };
  }

  // 3. Fetch authoritative product data
  const productCart = cart.filter(
    (item): item is Extract<(typeof cart)[number], { productId: string }> =>
      "productId" in item,
  );
  const bundleCart = cart.filter(
    (item): item is Extract<(typeof cart)[number], { bundleId: string }> =>
      "bundleId" in item,
  );
  const { data: products, error: productError } = productCart.length
    ? await supabase
        .from("products")
        .select("id, name, slug, price_per_kg, stock_kg, is_available")
        .in("id", productCart.map((item) => item.productId))
    : { data: [], error: null };
  const { data: bundles, error: bundleError } = bundleCart.length
    ? await supabase
        .from("product_bundles")
        .select(
          "id, name, price_per_kg, min_kg, max_kg, is_active",
        )
        .in("id", bundleCart.map((item) => item.bundleId))
    : { data: [], error: null };

  if (
    productError ||
    bundleError ||
    !products ||
    products.length !== productCart.length ||
    !bundles ||
    bundles.length !== bundleCart.length
  ) {
    return { ok: false, error: "Бүтээгдэхүүн олдсонгүй. Сагсаа шалгана уу." };
  }

  const productMap = new Map(products.map((p: Pick<Product, "id">) => [p.id, p]));
  const bundleMap = new Map(bundles.map((bundle) => [bundle.id, bundle]));

  let subtotal = 0;
  const items: {
    product_id: string | null;
    bundle_id: string | null;
    is_bundle: boolean;
    bundle_min_kg: number | null;
    bundle_max_kg: number | null;
    product_name_snapshot: string;
    quantity_kg: number;
    price_per_kg: number;
    subtotal: number;
  }[] = [];

  for (const item of cart) {
    if ("bundleId" in item) {
      const bundle = bundleMap.get(item.bundleId);
      if (!bundle || !bundle.is_active) {
        return { ok: false, error: "Багц захиалах боломжгүй байна. Сагсаа шалгана уу." };
      }
      const minKg = Number(bundle.min_kg);
      const maxKg = Number(bundle.max_kg);
      if (item.quantityKg < minKg || item.quantityKg > maxKg) {
        return {
          ok: false,
          error: `${bundle.name} ${minKg}–${maxKg} кг-ийн хооронд сонгоно уу`,
        };
      }
      const pricePerKg = Number(bundle.price_per_kg);
      const itemSubtotal = Math.round(pricePerKg * item.quantityKg);
      subtotal += itemSubtotal;
      items.push({
        product_id: null,
        bundle_id: bundle.id,
        is_bundle: true,
        bundle_min_kg: minKg,
        bundle_max_kg: maxKg,
        product_name_snapshot: bundle.name,
        quantity_kg: item.quantityKg,
        price_per_kg: pricePerKg,
        subtotal: itemSubtotal,
      });
    } else {
      const p = productMap.get(item.productId) as
        | Pick<Product, "id" | "name" | "price_per_kg" | "stock_kg" | "is_available">
        | undefined;
      if (!p) return { ok: false, error: "Бүтээгдэхүүн олдсонгүй" };
      if (!p.is_available) return { ok: false, error: `${p.name} одоогоор дууссан байна` };
      if (p.stock_kg < item.quantityKg) {
        return {
          ok: false,
          error: `${p.name} үлдэгдэл хүрэлцэхгүй байна (үлдсэн: ${p.stock_kg} кг)`,
        };
      }
      const itemSubtotal = Math.round(p.price_per_kg * item.quantityKg);
      subtotal += itemSubtotal;
      items.push({
        product_id: p.id,
        bundle_id: null,
        is_bundle: false,
        bundle_min_kg: null,
        bundle_max_kg: null,
        product_name_snapshot: p.name,
        quantity_kg: item.quantityKg,
        price_per_kg: p.price_per_kg,
        subtotal: itemSubtotal,
      });
    }
  }

  // 4. Delivery fee from store settings — free if >= 100,000₮
  const { data: settings } = await supabase
    .from("store_settings")
    .select("delivery_fee")
    .eq("id", 1)
    .single();
  const configuredFee = settings?.delivery_fee ?? 0;
  const deliveryFee = subtotal >= 100_000 ? 0 : configuredFee;
  const total = subtotal + deliveryFee;

  // 5. Create pending order + items
  const orderNumber = generateOrderNumber();
  const paymentAttemptId = randomBytes(12).toString("hex");
  const paymentReference = `Mongol Mah ${orderNumber}`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: parsedCustomer.data.customer_name,
      phone: parsedCustomer.data.phone,
      address: parsedCustomer.data.address,
      note: parsedCustomer.data.note || null,
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: total,
      currency: "MNT",
      payment_method: "wire",
      payment_attempt_id: paymentAttemptId,
      payment_status: "pending",
      order_status: "pending_payment",
      payment_reference: paymentReference,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { ok: false, error: "Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу." };
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(items.map((i) => ({ ...i, order_id: order.id })));

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { ok: false, error: "Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу." };
  }

  // 6. Create Wire payment
  try {
    const base = siteUrl();
    const payment = await createOrderPayment({
      orderId: order.id,
      orderNumber,
      attemptId: paymentAttemptId,
      amountMnt: total,
      description: paymentReference,
      customerName: parsedCustomer.data.customer_name,
      successUrl: `${base}/payment/success?order=${orderNumber}`,
      cancelUrl: `${base}/payment/cancel?order=${orderNumber}`,
    });

    const { error: paymentIdError } = await supabase
      .from("orders")
      .update({ wire_payment_id: payment.paymentIntent.id })
      .eq("id", order.id);

    if (paymentIdError) throw paymentIdError;

    return { ok: true, redirectUrl: payment.checkoutUrl, orderNumber };
  } catch (e) {
    console.error("[wire] payment creation failed:", e);
    await supabase
      .from("orders")
      .update({ payment_status: "failed" })
      .eq("id", order.id);
    return {
      ok: false,
      error: "Төлбөр үүсгэхэд алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу.",
    };
  }
}

/** Order lookup for the guest order status page (by order number). */
export async function getOrderByNumber(
  orderNumber: string,
): Promise<OrderWithItems | null> {
  if (!/^ORD-[A-Z0-9-]+$/.test(orderNumber)) return null;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", orderNumber)
    .maybeSingle();
  return (data as OrderWithItems) ?? null;
}

/** Lookup orders by phone — 8-digit Mongolian number. Returns newest first, max 10. */
export async function getOrdersByPhone(phone: string): Promise<OrderWithItems[]> {
  const cleaned = phone.replace(/\D/g, "").slice(-8);
  if (!/^\d{8}$/.test(cleaned)) return [];
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("phone", cleaned)
    .order("created_at", { ascending: false })
    .limit(10);
  return (data as OrderWithItems[]) ?? [];
}

/** Retry payment for an existing pending/failed order — no duplicate orders. */
export async function retryPayment(
  orderNumber: string,
): Promise<{ ok: boolean; redirectUrl?: string; error?: string }> {
  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, total_amount, currency, payment_status, customer_name")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) return { ok: false, error: "Захиалга олдсонгүй" };
  if (order.payment_status === "paid") {
    return { ok: false, error: "Энэ захиалга төлөгдсөн байна" };
  }
  if (order.payment_status === "refunded" || order.currency !== "MNT") {
    return { ok: false, error: "Төлбөр дахин үүсгэх боломжгүй" };
  }

  try {
    const base = siteUrl();
    const paymentAttemptId = randomBytes(12).toString("hex");
    const payment = await createOrderPayment({
      orderId: order.id,
      orderNumber: order.order_number,
      attemptId: paymentAttemptId,
      amountMnt: order.total_amount,
      description: `Mongol Mah ${order.order_number}`,
      customerName: order.customer_name,
      successUrl: `${base}/payment/success?order=${order.order_number}`,
      cancelUrl: `${base}/payment/cancel?order=${order.order_number}`,
    });

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        wire_payment_id: payment.paymentIntent.id,
        payment_attempt_id: paymentAttemptId,
        payment_status: "pending",
      })
      .eq("id", order.id);

    if (updateError) throw updateError;

    return { ok: true, redirectUrl: payment.checkoutUrl };
  } catch (e) {
    console.error("[wire] retry payment failed:", e);
    return { ok: false, error: "Төлбөр үүсгэж чадсангүй. Дахин оролдоно уу." };
  }
}
