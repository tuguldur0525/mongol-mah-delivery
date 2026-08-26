import "server-only";
import type { WireEvent } from "@buildry-wire/wire";

/** Wire event types we care about. */
export const WIRE_EVENTS = {
  PAYMENT_SUCCEEDED: "payment_intent.succeeded",
  PAYMENT_FAILED: "payment_intent.payment_failed",
  PAYMENT_CANCELED: "payment_intent.canceled",
} as const;

export type WirePaymentLike = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  metadata?: Record<string, string>;
};

export function eventPaymentIntent(event: WireEvent): WirePaymentLike | null {
  const obj = event.data as { object?: WirePaymentLike } | undefined;
  if (obj?.object && typeof obj.object.id === "string") {
    return {
      id: obj.object.id,
      amount: Number(obj.object.amount),
      currency: String(obj.object.currency ?? "MNT"),
      status: String(obj.object.status ?? ""),
      metadata: obj.object.metadata,
    };
  }
  return null;
}
