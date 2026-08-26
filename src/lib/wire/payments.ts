import "server-only";
import type { PaymentIntent, PaymentIntentCreateParams } from "@buildry-wire/wire";
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
  description: string;
  customerName: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<CreatePaymentResult> {
  const client = getWireClient();
  const operators = allowedOperators();

  const paymentIntentParams: PaymentIntentCreateParams & { description: string } = {
    amount: mntToMinor(params.amountMnt),
    currency: "MNT",
    description: params.description,
    ...(operators ? { allowed_operators: operators } : {}),
    metadata: {
      order_id: params.orderId,
      order_number: params.orderNumber,
      transaction_description: params.description,
    },
    idempotencyKey: `pi-${params.orderNumber}-${params.attemptId}`,
  };
  const pi = await client.paymentIntents.create(paymentIntentParams);

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
