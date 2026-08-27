import Link from "next/link";
import { getOrderByNumber } from "@/actions/orders";
import { formatMnt } from "@/lib/validations";
import { RetryPaymentButton } from "@/components/order/retry-payment-button";
import { RestoreCart } from "@/components/cart/restore-cart";

export const dynamic = "force-dynamic";

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  const order = orderNumber ? await getOrderByNumber(orderNumber) : null;
  const paid = order?.payment_status === "paid";
  const failed = order?.payment_status === "failed";
  const cancelled = order?.payment_status === "cancelled";

  // If no order, show generic failed
  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="eyebrow text-destructive">Амжилтгүй</p>
        <h1 className="mt-2 text-display text-2xl">Гүйлгээ амжилтгүй</h1>
        <p className="mt-2 text-sm text-muted-foreground">Захиалга олдсонгүй. Сагс хадгалагдсан.</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/cart" className="btn-primary w-full">
            Сагс руу буцах
          </Link>
          <Link href="/products" className="btn-secondary w-full">
            Бүтээгдэхүүн үзэх
          </Link>
        </div>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-600/15">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p className="eyebrow text-primary">Амжилттай</p>
        <h1 className="mt-1 text-display text-2xl">Төлбөр амжилттай болсон</h1>
        <p className="mt-2 text-sm text-muted-foreground">Төлбөр баталгаажсан. Захиалга бэлтгэгдэж байна.</p>
        <section className="mt-6 rounded-xl border border-border bg-card p-5 text-left shadow-card">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Захиалга</span>
            <span className="font-mono font-medium">{order.order_number}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Нийт</span>
            <span className="font-semibold">{formatMnt(order.total_amount)}</span>
          </div>
        </section>
        <Link href={`/order/${order.order_number}`} className="btn-primary mt-6 w-full">
          Захиалгын явцыг харах
        </Link>
      </div>
    );
  }

  // Transaction failed / canceled — keep cart
  const title = failed ? "Гүйлгээ амжилтгүй" : cancelled ? "Төлбөр цуцлагдсан" : "Төлбөр цуцлагдсан";
  const desc = failed
    ? "Банк татгалзлаа. Карт, дансны үлдэгдэл эсвэл лимит шалгана уу. Сагс хэвээр хадгалагдсан."
    : "Төлбөр хийгдээгүй. Захиалга хадгалагдсан, сагс хэвээр байна. Дахин оролдоно уу.";

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      {/* Restore cart if it was cleared (old flow) */}
      <RestoreCart items={order.order_items} />

      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-destructive">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </div>
      <p className="eyebrow text-destructive">{failed ? "Татгалзсан" : "Цуцлагдсан"}</p>
      <h1 className="mt-1 text-display text-2xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>

      <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
        ✓ Сагс хадгалагдсан — юу ч алдаагүй. Дахин төлбөр үүсгэж болно.
      </div>

      <section className="mt-6 rounded-xl border border-border bg-card p-5 text-left shadow-card">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Захиалга</span>
            <span className="font-mono font-medium">{order.order_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Нийт</span>
            <span className="font-semibold">{formatMnt(order.total_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Төлөв</span>
            <span className="text-destructive font-medium">{failed ? "Татгалзсан" : "Цуцлагдсан"}</span>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <RetryPaymentButton orderNumber={order.order_number} />
        <p className="mt-2 text-xs text-muted-foreground">Дахин оролдох нь шинэ төлбөр үүсгэнэ, давхар тооцохгүй.</p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Link href="/cart" className="btn-secondary w-full">
          Сагс руу буцах — сагс хадгалагдсан
        </Link>
        <Link href={`/order/${order.order_number}`} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent text-center">
          Захиалгын төлөв харах
        </Link>
      </div>
    </div>
  );
}
