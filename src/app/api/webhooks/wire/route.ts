import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhook, SIGNATURE_HEADER } from "@/lib/wire/webhook";
import { WIRE_EVENTS, eventPaymentIntent } from "@/lib/wire/types";
import { fulfillPaidOrder, markOrderPaymentState } from "@/actions/payments";

export const dynamic = "force-dynamic";

/**
 * Wire webhook endpoint.
 * - Verifies the WirePayment-Signature header (HMAC-SHA256 over "<t>.<body>").
 * - Idempotent: duplicate events are detected via webhook_events unique
 *   constraint (provider + external_event_id) and never re-processed.
 * - Fulfillment double-checks the PaymentIntent against Wire's API and
 *   deducts stock atomically inside a single DB transaction (RPC).
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get(SIGNATURE_HEADER) ?? undefined;

  const event = verifyWebhook(rawBody, signature);
  if (!event) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle endpoint verification ping the same way (it is a signed event).
  const supabase = createAdminClient();

  // Idempotency: claim the event via unique constraint.
  const { error: insertError } = await supabase
    .from("webhook_events")
    .insert({
      provider: "wire",
      external_event_id: event.id,
      event_type: event.type,
      payload_summary: { type: event.type, created: event.created, livemode: event.livemode },
    });

  if (insertError) {
    // Duplicate delivery — already claimed/processed.
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case WIRE_EVENTS.PAYMENT_SUCCEEDED: {
        const pi = eventPaymentIntent(event);
        if (!pi) break;

        // Find the order by stored Wire payment id, falling back to metadata.
        let orderId: string | null = null;
        const { data: byWireId } = await supabase
          .from("orders")
          .select("id")
          .eq("wire_payment_id", pi.id)
          .maybeSingle();
        if (byWireId) {
          orderId = byWireId.id;
        } else if (pi.metadata?.order_id) {
          const { data: byMeta } = await supabase
            .from("orders")
            .select("id")
            .eq("id", pi.metadata.order_id)
            .maybeSingle();
          orderId = byMeta?.id ?? null;
        }

        if (!orderId) {
          console.error("[webhook] no order found for payment", pi.id);
          break;
        }

        const result = await fulfillPaidOrder(orderId, pi.id);
        if (!result.ok) {
          console.error("[webhook] fulfillment failed:", result.error);
          // Leave event unprocessed so admins can investigate; Wire may retry.
          await supabase
            .from("webhook_events")
            .update({ processed_at: null, order_id: orderId })
            .eq("provider", "wire")
            .eq("external_event_id", event.id);
          return NextResponse.json({ received: true, processed: false });
        }
        break;
      }

      case WIRE_EVENTS.PAYMENT_FAILED:
      case WIRE_EVENTS.PAYMENT_CANCELED: {
        const pi = eventPaymentIntent(event);
        if (pi) {
          await markOrderPaymentState(
            pi.id,
            event.type === WIRE_EVENTS.PAYMENT_CANCELED ? "cancelled" : "failed",
          );
        }
        break;
      }

      default:
        // endpoint.verification and other event types: acknowledged.
        break;
    }

    await supabase
      .from("webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("provider", "wire")
      .eq("external_event_id", event.id);

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[webhook] processing error:", e);
    // Return 500 so Wire retries; the unique constraint keeps it idempotent.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
