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

/** Wire amounts are integer minor units: 50,000 = 500.00 MNT. */
export function mntToMinor(amountMnt: number): number {
  return Math.round(amountMnt * 100);
}

export function minorToMnt(minor: number): number {
  return Math.round(minor / 100);
}

export function allowedOperators(): string[] | undefined {
  const operators = (process.env.WIRE_ALLOWED_OPERATORS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return operators.length > 0 ? operators : undefined;
}
