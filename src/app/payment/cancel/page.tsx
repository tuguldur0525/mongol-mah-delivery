import Link from "next/link";
import { getOrderByNumber } from "@/actions/orders";
import { formatMnt } from "@/lib/validations";
import { RetryPaymentButton } from "@/components/order/retry-payment-button";

export const dynamic = "force-dynamic";

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  const order = orderNumber ? await getOrderByNumber(orderNumber) : null;
  const paid = order?.payment_status === "paid";

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blood/15">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c8102e"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </div>

      <h1 className="font-display text-2xl font-bold">
        {paid ? "Төлбөр амжилттай болсон" : "Төлбөр цуцлагдсан"}
      </h1>

      {paid ? (
        <p className="mt-2 text-sm text-bone">
          Төлбөр амжилттай баталгаажсан байна.
        </p>
      ) : (
        <p className="mt-2 text-sm text-bone">
          Төлбөр хийгдээгүй байна. Захиалга тань хадгалагдсан тул дахин төлбөр
          үүсгэж болно.
        </p>
      )}

      {order && (
        <section className="mt-6 rounded-md border border-line bg-surface p-5 text-left">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-mute">Захиалгын дугаар</span>
              <span className="font-mono">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mute">Нийт дүн</span>
              <span className="font-semibold">
                {formatMnt(order.total_amount)}
              </span>
            </div>
          </div>
        </section>
      )}

      {order && !paid && (
        <div className="mt-6">
          <RetryPaymentButton orderNumber={order.order_number} />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {order && (
          <Link
            href={`/order/${order.order_number}`}
            className="btn-secondary w-full"
          >
            Захиалгын төлөв харах
          </Link>
        )}
        <Link href="/products" className="text-sm text-mute hover:text-cream">
          Бүтээгдэхүүн рүү буцах
        </Link>
      </div>
    </div>
  );
}
