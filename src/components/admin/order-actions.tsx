"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder, updateOrderStatus } from "@/actions/inventory";
import type { OrderStatus } from "@/types";

export function AdminOrderActions({
  orderId,
  orderStatus,
}: {
  orderId: string;
  orderStatus: OrderStatus;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok?: boolean; error?: string }>) => {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else router.refresh();
    });
  };

  const cancellable = orderStatus !== "cancelled" && orderStatus !== "delivered";
  const statusActions: { status: OrderStatus; label: string }[] = [
    { status: "preparing", label: "Бэлтгэж байна" },
    { status: "delivering", label: "Хүргэлтэнд" },
    { status: "delivered", label: "Хүргэгдсэн" },
  ].filter((a) => a.status !== orderStatus) as { status: OrderStatus; label: string }[];

  return (
    <div className="text-right">
      <div className="flex flex-wrap justify-end gap-2">
        {statusActions.map((a) => (
          <button
            key={a.status}
            disabled={pending || orderStatus === "cancelled"}
            onClick={() =>
              run(() =>
                updateOrderStatus(
                  orderId,
                  a.status as "preparing" | "delivering" | "delivered",
                ),
              )
            }
            className="rounded-sm border border-line px-3 py-1.5 text-xs font-medium text-bone transition-colors hover:border-bone hover:text-cream disabled:opacity-40"
          >
            {a.label}
          </button>
        ))}
        {cancellable && (
          <button
            disabled={pending}
            onClick={() => {
              if (
                confirm(
                  "Захиалгыг цуцлах уу? Төлөгдсөн бол үлдэгдэл буцна.",
                )
              )
                run(() => cancelOrder(orderId));
            }}
            className="rounded-sm border border-blood/50 px-3 py-1.5 text-xs font-medium text-blood transition-colors hover:bg-blood/10 disabled:opacity-40"
          >
            Цуцлах
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-blood">{error}</p>}
    </div>
  );
}
