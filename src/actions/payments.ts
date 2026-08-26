"use server";

import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { retrievePaymentIntent } from "@/lib/wire/payments";
import { minorToMnt } from "@/lib/wire/client";

/**
 * Fulfill a successful payment:
 * 1. Double-check the PaymentIntent status against Wire's API.
 * 2. Atomically mark the order paid + deduct stock via DB RPC (idempotent).
 * Returns a friendly Mongolian error on validation failure.
 */
export async function fulfillPaidOrder(
  orderId: string,
  wirePaymentId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient();

  // Server-side double check against Wire API
  let pi;
  try {
    pi = await retrievePaymentIntent(wirePaymentId);
  } catch (e) {
    console.error("[wire] retrieve payment intent failed:", e);
    return { ok: false, error: "Төлбөрийн мэдээлэл шалгаж чадсангүй" };
  }

  if (pi.status !== "succeeded") {
    return { ok: false, error: "Төлбөр амжилтгүй байна" };
  }

  const amountMnt = minorToMnt(pi.amount);

  const { error } = await supabase.rpc("process_paid_order", {
    p_order_id: orderId,
    p_amount: amountMnt,
    p_currency: pi.currency,
    p_wire_payment_id: wirePaymentId,
  });

  if (error) {
    console.error("[payment] process_paid_order failed:", error.message);
    if (error.message.includes("AMOUNT_MISMATCH")) {
      return { ok: false, error: "Төлбөрийн дүн таарахгүй байна" };
    }
    if (error.message.includes("INSUFFICIENT_STOCK")) {
      return { ok: false, error: "Үлдэгдэл хүрэлцэхгүй — админ шалгана уу" };
    }
    return { ok: false, error: "Захиалгыг баталгаажуулж чадсангүй" };
  }

  return { ok: true };
}

/** Mark an order failed/cancelled (only while still pending). */
export async function markOrderPaymentState(
  wirePaymentId: string,
  paymentStatus: "failed" | "cancelled",
): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: paymentStatus,
      order_status:
        paymentStatus === "cancelled" ? "pending_payment" : "pending_payment",
    })
    .eq("wire_payment_id", wirePaymentId)
    .eq("payment_status", "pending");
  if (error) {
    console.error("[payment] payment state update failed:", error.message);
    return false;
  }
  return true;
}
