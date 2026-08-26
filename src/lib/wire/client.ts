import "server-only";
import { Wire } from "@buildry-wire/wire";

let cached: Wire | null = null;

/** Server-only Wire API client. Secrets never reach the client bundle. */
export function getWireClient(): Wire {
  const apiKey = process.env.WIRE_API_KEY;
  if (!apiKey) {
    throw new Error("WIRE_API_KEY is not configured");
  }
  if (!cached) {
    cached = new Wire(apiKey);
  }
  return cached;
}

/** MNT is a zero-decimal currency in Wire: 9,000 MNT is sent as 9000. */
export function mntToMinor(amountMnt: number): number {
  return Math.round(amountMnt);
}

export function minorToMnt(minor: number): number {
  return Math.round(minor);
}

export function allowedOperators(): string[] | undefined {
  const operators = (process.env.WIRE_ALLOWED_OPERATORS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return operators.length > 0 ? operators : undefined;
}
