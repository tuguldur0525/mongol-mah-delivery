import "server-only";
import {
  SIGNATURE_HEADER,
  type WireEvent,
} from "@buildry-wire/wire";
import { getWireClient } from "./client";

export { SIGNATURE_HEADER };
export type { WireEvent };

/**
 * Verify a Wire webhook against the raw (unparsed) request body.
 * Signature: `WirePayment-Signature: t=...,v1=hmac_sha256(secret, "<t>.<body>")`
 */
export function verifyWebhook(
  rawBody: string | Buffer,
  signatureHeader: string | undefined,
): WireEvent | null {
  const secret = process.env.WIRE_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return null;

  try {
    return getWireClient().webhooks.verify(rawBody, signatureHeader, secret);
  } catch {
    return null;
  }
}
