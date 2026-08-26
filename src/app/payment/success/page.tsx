import { getOrderByNumber } from "@/actions/orders";
import { formatMnt } from "@/lib/validations";
import { PAYMENT_STATUS_LABELS } from "@/components/order/status";
import { PaymentStatusPoller } from "@/components/order/payment-status-poller";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  const order = orderNumber ? await getOrderByNumber(orderNumber) : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Захиалга олдсонгүй</h1>
        <p className="mt-2 text-sm text-mute">
          Захиалгын дугаар буруу байж болно.
        </p>
      </div>
    );
  }

  const isPaid = order.payment_status === "paid";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center">
        {isPaid ? (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-fresh/15">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4a9c5c"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold">Төлбөр амжилттай</h1>
            <p className="mt-2 text-sm text-bone">
              Таны захиалгыг хүлээн авлаа. Бид махыг бэлтгэж хүргэх болно.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ember/15">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-ember border-t-transparent" />
            </div>
            <h1 className="font-display text-2xl font-bold">
              Төлбөрийг шалгаж байна...
            </h1>
            <p className="mt-2 text-sm text-bone">
              Хуудсыг бүү хаарай. Баталгаажуулалт хэдхэн секунд авна.
            </p>
          </>
        )}
      </div>

      {!isPaid && <PaymentStatusPoller orderNumber={order.order_number} />}

      <section className="mt-8 rounded-md border border-line bg-surface p-5">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-mute">Захиалгын дугаар</span>
            <span className="font-mono text-bone">{order.order_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-mute">Төлбөрийн төлөв</span>
            <span
              className={
                isPaid ? "font-semibold text-fresh" : "font-semibold text-ember"
              }
            >
              {PAYMENT_STATUS_LABELS[order.payment_status]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-mute">Нийт дүн</span>
            <span className="font-semibold">{formatMnt(order.total_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-mute">Хүлээн авагч</span>
            <span>
              {order.customer_name} · {order.phone}
            </span>
          </div>
        </div>
      </section>

      <p className="mt-4 text-center text-[0.6875rem] text-mute">
        Дараагийн алхам: бид захиалгыг баталгаажуулаад, таны утсанд хүргэлтийн
        цагийг мэдэгдэх болно.
      </p>
    </div>
  );
}
