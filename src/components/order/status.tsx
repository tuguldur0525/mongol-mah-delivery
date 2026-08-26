import { formatMnt } from "@/lib/validations";
import type { OrderStatus, OrderPaymentStatus } from "@/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Төлбөр хүлээгдэж байна",
  confirmed: "Баталгаажсан",
  preparing: "Бэлтгэж байна",
  delivering: "Хүргэлтэнд гарсан",
  delivered: "Хүргэгдсэн",
  cancelled: "Цуцлагдсан",
};

export const PAYMENT_STATUS_LABELS: Record<OrderPaymentStatus, string> = {
  pending: "Хүлээгдэж байна",
  processing: "Шалгаж байна",
  paid: "Төлөгдсөн",
  failed: "Амжилтгүй",
  cancelled: "Цуцлагдсан",
  refunded: "Буцаагдсан",
};

const TIMELINE: OrderStatus[] = [
  "pending_payment",
  "confirmed",
  "preparing",
  "delivering",
  "delivered",
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const currentIndex = TIMELINE.indexOf(status);
  const cancelled = status === "cancelled";

  return (
    <ol className="space-y-0">
      {TIMELINE.map((s, i) => {
        const done = !cancelled && i <= currentIndex;
        const isCurrent = !cancelled && i === currentIndex;
        return (
          <li key={s} className="relative flex gap-4 pb-5 last:pb-0">
            {i < TIMELINE.length - 1 && (
              <span
                className={`absolute top-[11px] left-[5px] h-full w-px ${
                  done && i < currentIndex ? "bg-blood" : "bg-line"
                }`}
              />
            )}
            <span
              className={`relative z-10 mt-0.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 ${
                done
                  ? "border-blood bg-blood"
                  : "border-line bg-ink"
              }`}
            />
            <div>
              <p
                className={`text-sm ${
                  isCurrent
                    ? "font-semibold text-cream"
                    : done
                      ? "text-bone"
                      : "text-mute"
                }`}
              >
                {ORDER_STATUS_LABELS[s]}
                {isCurrent && (
                  <span className="ml-2 inline-block h-1 w-1 animate-pulse rounded-full bg-blood" />
                )}
              </p>
            </div>
          </li>
        );
      })}
      {cancelled && (
        <li className="flex gap-4">
          <span className="mt-0.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-blood bg-blood/20" />
          <p className="text-sm font-semibold text-blood">Цуцлагдсан</p>
        </li>
      )}
    </ol>
  );
}

export function OrderItemsSummary({
  items,
}: {
  items: { product_name_snapshot: string; quantity_kg: number; price_per_kg: number; subtotal: number }[];
}) {
  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li
          key={item.product_name_snapshot}
          className="flex justify-between gap-3 py-3 text-sm"
        >
          <div>
            <p className="font-medium">{item.product_name_snapshot}</p>
            <p className="text-xs text-mute">
              {formatMnt(item.price_per_kg)} / кг × {item.quantity_kg} кг
            </p>
          </div>
          <span className="shrink-0 font-semibold">{formatMnt(item.subtotal)}</span>
        </li>
      ))}
    </ul>
  );
}
