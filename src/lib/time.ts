export const UB_TZ = "Asia/Ulaanbaatar";

export function formatUB(dateStr: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(dateStr).toLocaleString("mn-MN", { timeZone: UB_TZ, ...opts });
}

export function formatUBDateTime(dateStr: string) {
  return formatUB(dateStr, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ubDateString(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: UB_TZ });
}
