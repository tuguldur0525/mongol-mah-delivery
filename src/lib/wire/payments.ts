import "server-only";
import type { PaymentIntent } from "@buildry-wire/wire";
import { getWireClient, allowedOperators, mntToMinor } from "./client";

export type CreatePaymentResult = {
  paymentIntent: PaymentIntent;
  checkoutUrl: string;
  checkoutSessionId: string;
};

/**
 * Create a Wire PaymentIntent + hosted checkout session for an order.
 * Idempotency keys are derived from the order number so retries never
 * duplicate charges.
 */
export async function createOrderPayment(params: {
  orderId: string;
  orderNumber: string;
  attemptId: string;
  amountMnt: number;
  customerName: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<CreatePaymentResult> {
  const client = getWireClient();

  const pi = await client.paymentIntents.create({
    amount: mntToMinor(params.amountMnt),
    currency: "MNT",
    allowed_operators: allowedOperators(),
    metadata: {
      order_id: params.orderId,
      order_number: params.orderNumber,
    },
    idempotencyKey: `pi-${params.orderNumber}-${params.attemptId}`,
  });

  // Checkout sessions can only be created on requires_payment_method intents.
  const session = await client.request<{
    id: string;
    object: string;
    url: string;
    payment_intent: string;
  }>("POST", "/v1/checkout/sessions", {
    body: {
      payment_intent: pi.id,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    },
    idempotencyKey: `cs-${params.orderNumber}-${params.attemptId}`,
  });

  return {
    paymentIntent: pi,
    checkoutUrl: session.url,
    checkoutSessionId: session.id,
  };
}

/** Server-side double check: retrieve the PaymentIntent from Wire's API. */
export async function retrievePaymentIntent(id: string) {
  return getWireClient().paymentIntents.retrieve(id);
}
