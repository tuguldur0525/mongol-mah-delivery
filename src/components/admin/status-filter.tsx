"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function StatusFilter({ value }: { value?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCount = value ? 1 : 0;

  const onChange = (v: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (v) params.set("status", v);
    else params.delete("status");
    const qs = params.toString();
    router.push(`/admin/orders${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 rounded-full border border-border bg-card px-4 pr-8 text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Бүх төлөв</option>
          <option value="pending_payment">Төлбөр хүлээж</option>
          <option value="confirmed">Баталгаажсан</option>
          <option value="preparing">Бэлтгэж байна</option>
          <option value="delivering">Хүргэлтэнд</option>
          <option value="delivered">Хүргэгдсэн</option>
          <option value="cancelled">Цуцлагдсан</option>
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">▾</span>
      </div>
      {selectedCount > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          Filter by selected: {selectedCount}
        </span>
      )}
    </div>
  );
}
