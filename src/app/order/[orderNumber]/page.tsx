import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/actions/orders";
import { formatMnt } from "@/lib/validations";
import {
  OrderTimeline,
  OrderItemsSummary,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/components/order/status";
import type { OrderPaymentStatus } from "@/types";
import { RetryPaymentButton } from "@/components/order/retry-payment-button";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(decodeURIComponent(orderNumber));
  if (!order) notFound();

  const payable =
    order.payment_status === "pending" || order.payment_status === "failed";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-blood">
            Захиалга
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold">
            #{order.order_number}
          </h1>
        </div>
        <span
          className={`tag ${
            order.order_status === "cancelled"
              ? "tag-red"
              : order.order_status === "delivered"
                ? "tag-green"
                : order.order_status === "pending_payment"
                  ? "tag-gold"
                  : "tag-muted"
          }`}
        >
          {ORDER_STATUS_LABELS[order.order_status]}
        </span>
      </div>
      <p className="mt-1 text-xs text-mute">
        {new Date(order.created_at).toLocaleString("mn-MN")}
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_260px]">
        <div className="space-y-5">
          <section className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
              Бүтээгдэхүүн
            </h2>
            <div className="mt-3">
              <OrderItemsSummary items={order.order_items} />
            </div>
            <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
              <div className="flex justify-between text-bone">
                <span>Бүтээгдэхүүн</span>
                <span>{formatMnt(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-mute">
                <span>Хүргэлт</span>
                <span>{formatMnt(order.delivery_fee)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-semibold">
                <span>Нийт</span>
                <span className="font-display text-lg">
                  {formatMnt(order.total_amount)}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
              Хүргэлтийн мэдээлэл
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-mute">Нэр</dt>
                <dd>{order.customer_name}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-mute">Утас</dt>
                <dd>{order.phone}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-mute">Хаяг</dt>
                <dd>{order.address}</dd>
              </div>
              {order.note && (
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-mute">Тэмдэглэл</dt>
                  <dd>{order.note}</dd>
                </div>
              )}
            </dl>
          </section>

          {payable && (
            <section className="rounded-md border border-blood/30 bg-blood/10 p-5">
              <p className="text-sm text-cream">
                Төлбөрийн төлөв: {PAYMENT_STATUS_LABELS[order.payment_status]}.
                Дахин төлбөр үүсгэх боломжтой.
              </p>
              <RetryPaymentButton orderNumber={order.order_number} />
            </section>
          )}
        </div>

        <aside className="space-y-5">
          <section className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
              Явц
            </h2>
            <div className="mt-4">
              <OrderTimeline status={order.order_status} />
            </div>
          </section>
          <section className="rounded-md border border-line bg-surface p-5 text-sm">
            <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
              Төлбөр
            </h2>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between">
                <dt className="text-mute">Төлөв</dt>
                <dd
                  className={
                    order.payment_status === "paid"
                      ? "font-semibold text-fresh"
                      : "text-ember"
                  }
                >
                  {PAYMENT_STATUS_LABELS[order.payment_status]}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mute">Арга</dt>
                <dd className="uppercase">{order.payment_method}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="shrink-0 text-mute">Wire ID</dt>
                <dd className="break-all font-mono text-xs text-bone">
                  {order.wire_payment_id ?? "—"}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
