import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatMnt } from "@/lib/validations";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/components/order/status";
import type { Order, OrderStatus, OrderPaymentStatus } from "@/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  payment?: string;
  status?: string;
}>;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const supabase = createAdminClient();

  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (sp.q) {
    const q = sp.q.trim();
    if (/^ORD-/i.test(q)) {
      query = query.ilike("order_number", `%${q}%`);
    } else if (/^[\d+]+$/.test(q)) {
      query = query.like("phone", `%${q}%`);
    } else {
      query = query.ilike("customer_name", `%${q}%`);
    }
  }
  if (sp.payment) query = query.eq("payment_status", sp.payment);
  if (sp.status) query = query.eq("order_status", sp.status);

  const { data: orders } = await query;
  const list = (orders as Order[]) ?? [];

  const paymentFilters: { key: string; label: string }[] = [
    { key: "", label: "Бүгд" },
    { key: "pending", label: "Хүлээгдэж" },
    { key: "paid", label: "Төлөгдсөн" },
    { key: "failed", label: "Амжилтгүй" },
  ];
  const statusFilters: { key: string; label: string }[] = [
    { key: "", label: "Бүх төлөв" },
    { key: "pending_payment", label: "Төлбөр хүлээж" },
    { key: "confirmed", label: "Баталгаажсан" },
    { key: "preparing", label: "Бэлтгэж байна" },
    { key: "delivering", label: "Хүргэлтэнд" },
    { key: "delivered", label: "Хүргэгдсэн" },
    { key: "cancelled", label: "Цуцлагдсан" },
  ];

  const buildHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { ...sp, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Захиалга</h1>
        <Link href="/admin/orders/new" className="btn-primary py-2 text-xs">
          + Шинэ захиалга
        </Link>
      </div>

      <form className="mt-5 flex gap-2" action="/admin/orders">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Дугаар, нэр, утас..."
          className="max-w-xs"
        />
        {sp.payment && <input type="hidden" name="payment" value={sp.payment} />}
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <button type="submit" className="btn-secondary py-2 text-xs">
          Хайх
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {paymentFilters.map((f) => (
          <Link
            key={f.key || "all"}
            href={buildHref({ payment: f.key || undefined })}
            className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
              (sp.payment ?? "") === f.key
                ? "bg-cream text-ink"
                : "text-bone hover:text-cream"
            }`}
          >
            {f.label}
          </Link>
        ))}
        <span className="mx-1 h-4 w-px self-center bg-line" />
        {statusFilters.map((f) => (
          <Link
            key={f.key || "all"}
            href={buildHref({ status: f.key || undefined })}
            className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
              (sp.status ?? "") === f.key
                ? "bg-cream text-ink"
                : "text-bone hover:text-cream"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="card-surface mt-6 overflow-x-auto rounded-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.6875rem] uppercase tracking-widest text-mute">
              <th className="px-4 py-3">Дугаар</th>
              <th className="px-4 py-3">Харилцагч</th>
              <th className="px-4 py-3">Дүн</th>
              <th className="px-4 py-3">Төлбөр</th>
              <th className="px-4 py-3">Төлөв</th>
              <th className="px-4 py-3">Огноо</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-mute">
                  Захиалга олдсонгүй
                </td>
              </tr>
            )}
            {list.map((o) => (
              <tr key={o.id} className="border-b border-line/50 hover:bg-coal/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-mono text-xs text-bone hover:text-cream"
                  >
                    {o.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {o.customer_name}
                  <span className="block text-xs text-mute">{o.phone}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatMnt(o.total_amount)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`tag ${
                      o.payment_status === "paid"
                        ? "tag-green"
                        : o.payment_status === "pending"
                          ? "tag-gold"
                          : "tag-red"
                    }`}
                  >
                    {PAYMENT_STATUS_LABELS[o.payment_status as OrderPaymentStatus]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-bone">
                  {ORDER_STATUS_LABELS[o.order_status as OrderStatus]}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap text-mute">
                  {new Date(o.created_at).toLocaleString("mn-MN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
