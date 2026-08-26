"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stockChangeSchema, stockAdjustSchema } from "@/lib/validations";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтэрнэ үү");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) throw new Error("Зөвшөөрөлгүй хандалт");
  return supabase;
}

/** Add stock (STOCK_IN) — atomic via RPC. */
export async function addStock(formData: FormData) {
  const supabase = await requireAdmin();
  const parsed = stockChangeSchema.safeParse({
    product_id: formData.get("product_id"),
    quantity_kg: formData.get("quantity_kg"),
    reason: formData.get("reason"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: p } = parsed;
  const note = [p.reason, p.note].filter(Boolean).join(" — ");
  const { error } = await supabase.rpc("admin_stock_change", {
    p_product_id: p.product_id,
    p_delta: p.quantity_kg,
    p_type: "STOCK_IN",
    p_note: note,
  });

  if (error) return { error: "Үлдэгдэл нэмэхэд алдаа гарлаа" };
  revalidatePath("/admin/inventory");
  revalidatePath("/products");
  return { ok: true };
}

/** Manual stock correction (ADJUSTMENT, can be negative) — atomic via RPC. */
export async function adjustStock(formData: FormData) {
  const supabase = await requireAdmin();
  const parsed = stockAdjustSchema.safeParse({
    product_id: formData.get("product_id"),
    quantity_kg: formData.get("quantity_kg"),
    reason: formData.get("reason"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: p } = parsed;
  const direction = formData.get("direction") === "minus" ? -1 : 1;
  const note = [p.reason, p.note].filter(Boolean).join(" — ");
  const { error } = await supabase.rpc("admin_stock_change", {
    p_product_id: p.product_id,
    p_delta: direction * p.quantity_kg,
    p_type: "ADJUSTMENT",
    p_note: note,
  });

  if (error) {
    if (String(error.message).includes("INSUFFICIENT_STOCK")) {
      return { error: "Үлдэгдэл хасах боломжгүй — одоогийн үлдэгдэл хүрэлцэхгүй байна" };
    }
    return { error: "Тохируулга хийхэд алдаа гарлаа" };
  }
  revalidatePath("/admin/inventory");
  revalidatePath("/products");
  return { ok: true };
}

/** Cancel an order. Paid orders restore stock atomically. */
export async function cancelOrder(orderId: string) {
  const supabase = await requireAdmin();

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_status, payment_status, stock_deducted")
    .eq("id", orderId)
    .single();
  if (!order) return { error: "Захиалга олдсонгүй" };
  if (order.order_status === "cancelled") return { error: "Аль хэдийн цуцлагдсан" };

  // Cancel
  const { error: cancelError } = await supabase
    .from("orders")
    .update({
      order_status: "cancelled",
      payment_status:
        order.payment_status === "paid" ? "refunded" : "cancelled",
    })
    .eq("id", orderId);
  if (cancelError) return { error: "Цуцлахад алдаа гарлаа" };

  // Paid orders restore stock atomically (idempotent RPC)
  if (order.stock_deducted) {
    const { error: restoreError } = await supabase.rpc(
      "restore_paid_order_stock",
      { p_order_id: orderId },
    );
    if (restoreError) return { error: "Үлдэгдэл буцаахад алдаа гарлаа" };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/products");
  return { ok: true };
}

/** Update order status (preparing / delivering / delivered). */
export async function updateOrderStatus(
  orderId: string,
  status: "preparing" | "delivering" | "delivered",
) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("orders")
    .update({ order_status: status })
    .eq("id", orderId)
    .neq("order_status", "cancelled");
  if (error) return { error: "Төлөв шилжүүлэхэд алдаа гарлаа" };
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}

/** Admin manual order. Paid => stock deducted atomically at creation. */
export async function createManualOrder(formData: FormData, itemsJson: string) {
  const supabase = await requireAdmin();
  const admin = createAdminClient();

  let items: { product_id: string; quantity_kg: number }[];
  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { error: "Бүтээгдэхүүний мэдээлэл буруу" };
  }
  if (!items.length) return { error: "Бүтээгдэхүүн сонгоно уу" };

  const customer_name = String(formData.get("customer_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const payment_method = String(formData.get("payment_method") ?? "cash");
  const payment_status = String(formData.get("payment_status") ?? "pending");

  if (customer_name.length < 2) return { error: "Нэр оруулна уу" };
  if (!/^\d{8}$/.test(phone)) return { error: "8 оронтой утасны дугаар оруулна уу" };
  if (address.length < 5) return { error: "Хаяг оруулна уу" };

  // Fetch authoritative prices + validate stock when payment is paid
  const { data: products } = await admin
    .from("products")
    .select("id, name, price_per_kg, stock_kg, is_available")
    .in("id", items.map((i) => i.product_id));
  if (!products || products.length !== items.length) {
    return { error: "Бүтээгдэхүүн олдсонгүй" };
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  let subtotal = 0;
  const orderItems = [];
  for (const item of items) {
    const p = productMap.get(item.product_id);
    if (!p) return { error: "Бүтээгдэхүүн олдсонгүй" };
    if (payment_status === "paid" && p.stock_kg < item.quantity_kg) {
      return { error: `${p.name} үлдэгдэл хүрэлцэхгүй (${p.stock_kg} кг үлдсэн)` };
    }
    const itemSubtotal = Math.round(p.price_per_kg * item.quantity_kg);
    subtotal += itemSubtotal;
    orderItems.push({
      product_id: p.id,
      product_name_snapshot: p.name,
      quantity_kg: item.quantity_kg,
      price_per_kg: p.price_per_kg,
      subtotal: itemSubtotal,
    });
  }

  const { data: settings } = await admin
    .from("store_settings")
    .select("delivery_fee")
    .eq("id", 1)
    .single();
  const deliveryFee = settings?.delivery_fee ?? 0;

  const { data: { user } } = await supabase.auth.getUser();
  const orderNumber = `ORD-M-${Date.now().toString(36).toUpperCase()}`;

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name,
      phone,
      address,
      note: note || null,
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: subtotal + deliveryFee,
      currency: "MNT",
      payment_method,
      payment_status,
      order_status: payment_status === "paid" ? "confirmed" : "pending_payment",
      payment_reference: `MANUAL-${orderNumber}`,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (orderError || !order) return { error: "Захиалга үүсгэж чадсангүй" };

  const { error: itemsError } = await admin
    .from("order_items")
    .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));

  if (itemsError) {
    await admin.from("orders").delete().eq("id", order.id);
    return { error: "Захиалгын бүтээгдэхүүн хадгалахад алдаа гарлаа" };
  }

  // Paid manual orders deduct stock immediately (atomic + idempotent)
  if (payment_status === "paid") {
    const { error: rpcError } = await admin.rpc("process_paid_order", {
      p_order_id: order.id,
      p_amount: subtotal + deliveryFee,
      p_currency: "MNT",
      p_wire_payment_id: null,
    });
    if (rpcError) {
      await admin.from("orders").delete().eq("id", order.id);
      if (String(rpcError.message).includes("INSUFFICIENT_STOCK")) {
        return { error: "Үлдэгдэл хүрэлцэхгүй — захиалга үүссэнгүй" };
      }
      return { error: "Үлдэгдэл хасахад алдаа гарлаа — захиалга үүссэнгүй" };
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
  revalidatePath("/products");
  return { ok: true, orderId: order.id };
}
