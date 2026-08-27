import Link from "next/link";
import { getOrderByNumber } from "@/actions/orders";
import { formatMnt } from "@/lib/validations";
import { PAYMENT_STATUS_LABELS } from "@/components/order/status";
import { PaymentStatusPoller } from "@/components/order/payment-status-poller";
import { ClearCartOnSuccess } from "@/components/cart/clear-cart-on-success";
import { fulfillPaidOrder } from "@/actions/payments";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  let order = orderNumber ? await getOrderByNumber(orderNumber) : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="eyebrow text-primary">Алдаа</p>
        <h1 className="mt-2 text-display text-2xl">Захиалга олдсонгүй</h1>
        <p className="mt-2 text-sm text-muted-foreground">Захиалгын дугаар буруу байж болно.</p>
        <Link href="/products" className="btn-primary mt-6">
          Дэлгүүр рүү
        </Link>
      </div>
    );
  }

  // Fallback sync: if webhook failed/missed, verify directly with Wire on each refresh.
  // This makes /payment/success become successful even if webhook URL not configured.
  let isPaid = order.payment_status === "paid";
  if (!isPaid && order.wire_payment_id) {
    try {
      const res = await fulfillPaidOrder(order.id, order.wire_payment_id);
      if (res.ok) {
        const refreshed = await getOrderByNumber(order.order_number);
        if (refreshed) {
          order = refreshed;
          isPaid = refreshed.payment_status === "paid";
        }
      }
    } catch {
      // ignore — poller will retry
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      {/* Order successful: clear cart once paid */}
      <ClearCartOnSuccess isPaid={isPaid} />

      <div className="text-center">
        {isPaid ? (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-600/15">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="eyebrow text-primary">Амжилттай</p>
            <h1 className="mt-1 text-display text-2xl">Захиалга амжилттай!</h1>
            <p className="mt-2 text-sm text-muted-foreground">Төлбөр баталгаажлаа. Бид махыг бэлтгэж хүргэх болно.</p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
            <p className="eyebrow text-primary">Шалгаж байна</p>
            <h1 className="mt-1 text-display text-2xl">Төлбөрийг шалгаж байна...</h1>
            <p className="mt-2 text-sm text-muted-foreground">Хуудсыг бүү хаарай. Баталгаажуулалт хэдхэн секунд авна.</p>
          </>
        )}
      </div>

      {!isPaid && <PaymentStatusPoller orderNumber={order.order_number} />}

      <section className="mt-8 rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Захиалгын дугаар</span>
            <span className="font-mono font-medium">{order.order_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Төлбөрийн төлөв</span>
            <span className={isPaid ? "font-semibold text-green-600" : "font-semibold text-primary"}>{PAYMENT_STATUS_LABELS[order.payment_status]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Нийт дүн</span>
            <span className="font-semibold">{formatMnt(order.total_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Хүлээн авагч</span>
            <span>
              {order.customer_name} · {order.phone}
            </span>
          </div>
        </div>
      </section>

      {isPaid ? (
        <div className="mt-6 flex flex-col gap-2">
          <Link href={`/order/${order.order_number}`} className="btn-primary w-full">
            Захиалгын явцыг харах
          </Link>
          <Link href="/products" className="btn-secondary w-full">
            Үргэлжлүүлэн худалдан авах
          </Link>
        </div>
      ) : (
        <p className="mt-4 text-center text-xs text-muted-foreground">Дараагийн алхам: бид захиалгыг баталгаажуулаад, таны утсанд хүргэлтийн цагийг мэдэгдэх болно.</p>
      )}
    </div>
  );
}
