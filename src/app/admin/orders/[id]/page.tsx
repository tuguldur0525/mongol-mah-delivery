import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatMnt } from "@/lib/validations";
import {
  OrderTimeline,
  OrderItemsSummary,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/components/order/status";
import type { OrderPaymentStatus } from "@/types";
import { AdminOrderActions } from "@/components/admin/order-actions";
import { formatUBDateTime } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const { data: tx } = await supabase
    .from("inventory_transactions")
    .select("*, products(name)")
    .eq("reference_id", order.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-blood">
            Захиалга
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold">
            #{order.order_number}
          </h1>
        </div>
        <AdminOrderActions
          orderId={order.id}
          orderStatus={order.order_status}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {formatUBDateTime(order.created_at)} · Asia/Ulaanbaatar
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <section className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
              Бүтээгдэхүүн
            </h2>
            <OrderItemsSummary items={order.order_items} />
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
              Харилцагч
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex gap-3">
                <dt className="w-20 text-mute">Нэр</dt>
                <dd>{order.customer_name}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 text-mute">Утас</dt>
                <dd>{order.phone}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 text-mute">Хаяг</dt>
                <dd>{order.address}</dd>
              </div>
              {order.note && (
                <div className="flex gap-3">
                  <dt className="w-20 text-mute">Тэмдэглэл</dt>
                  <dd>{order.note}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
              Агуулахын нөлөө
            </h2>
            {tx && tx.length > 0 ? (
              <ul className="mt-3 divide-y divide-line text-sm">
                {tx.map((t) => (
                  <li key={t.id} className="flex justify-between py-2">
                    <span>{t.products?.name ?? "—"}</span>
                    <span
                      className={
                        Number(t.quantity_kg) < 0 ? "text-blood" : "text-fresh"
                      }
                    >
                      {Number(t.quantity_kg) > 0 ? "+" : ""}
                      {t.quantity_kg} кг · {t.type}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-mute">Хөдөлгөөн байхгүй</p>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
              Төлбөр
            </h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-mute">Төлөв</span>
                <span
                  className={
                    order.payment_status === "paid"
                      ? "font-semibold text-fresh"
                      : "text-ember"
                  }
                >
                  {PAYMENT_STATUS_LABELS[order.payment_status as OrderPaymentStatus]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mute">Арга</span>
                <span className="uppercase">{order.payment_method}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="shrink-0 text-mute">Wire ID</span>
                <span className="break-all font-mono text-xs text-bone">
                  {order.wire_payment_id ?? "—"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="shrink-0 text-mute">Reference</span>
                <span className="break-all font-mono text-xs text-bone">
                  {order.payment_reference}
                </span>
              </div>
              {order.paid_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Төлсөн</span>
                  <span>{formatUBDateTime(order.paid_at)}</span>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
              Явц
            </h2>
            <div className="mt-4">
              <OrderTimeline status={order.order_status} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
