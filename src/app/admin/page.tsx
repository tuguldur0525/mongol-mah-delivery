import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatMnt, formatKg } from "@/lib/validations";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [ordersRes, todayRes, lowStockRes] = await Promise.all([
    supabase.from("orders").select("payment_status, order_status, total_amount, created_at"),
    supabase
      .from("orders")
      .select("total_amount, payment_status")
      .gte("created_at", startOfDay.toISOString()),
    supabase
      .from("products")
      .select("id, name, stock_kg, low_stock_threshold, is_available")
      .filter("stock_kg", "lte", "low_stock_threshold"),
  ]);

  const orders = ordersRes.data ?? [];
  const today = todayRes.data ?? [];

  const paidOrders = orders.filter((o) => o.payment_status === "paid");
  const totalSales = paidOrders.reduce((s, o) => s + o.total_amount, 0);
  const todaySales = today
    .filter((o) => o.payment_status === "paid")
    .reduce((s, o) => s + o.total_amount, 0);
  const pendingPayments = orders.filter((o) => o.payment_status === "pending").length;
  const preparing = orders.filter((o) => o.order_status === "preparing").length;
  const delivering = orders.filter((o) => o.order_status === "delivering").length;
  const lowStock = lowStockRes.data ?? [];

  const cards = [
    { label: "ӨНӨӨДРИЙН ЗАХИАЛГА", value: String(today.length), color: "text-cream" },
    { label: "ӨНӨӨДРИЙН БОРЛУУЛАЛТ", value: formatMnt(todaySales), color: "text-cream" },
    { label: "НИЙТ БОРЛУУЛАЛТ", value: formatMnt(totalSales), color: "text-cream" },
    { label: "ХҮЛЭЭГДЭЖ БУЙ ТӨЛБӨР", value: String(pendingPayments), color: "text-ember" },
    { label: "БЭЛТГЭЖ БАЙНА", value: String(preparing), color: "text-sun" },
    { label: "ХҮРГЭЛТЭНД", value: String(delivering), color: "text-fresh" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Хяналтын самбар</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-md border border-line bg-surface p-5">
            <p className="text-[0.625rem] font-bold uppercase tracking-widest text-mute">
              {c.label}
            </p>
            <p className={`mt-2 font-display text-2xl font-bold ${c.color}`}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <section className="rounded-md border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
              Бага үлдэгдэл
            </h2>
            <Link href="/admin/inventory" className="text-xs text-mute hover:text-cream">
              →
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-mute">Бүх үлдэгдэл хангалттай.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {lowStock.slice(0, 8).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span>{p.name}</span>
                  <span
                    className={
                      p.stock_kg <= 0
                        ? "tag tag-red"
                        : "tag tag-gold"
                    }
                  >
                    {p.stock_kg <= 0
                      ? "ДУУССАН"
                      : `${formatKg(Number(p.stock_kg))}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-md border border-line bg-surface p-5">
          <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
            Түүвэр
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li className="flex justify-between">
              <span className="text-mute">Нийт захиалга</span>
              <span>{orders.length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-mute">Төлөгдсөн</span>
              <span>{paidOrders.length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-mute">Дундаж дүн</span>
              <span>
                {paidOrders.length
                  ? formatMnt(Math.round(totalSales / paidOrders.length))
                  : "—"}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-mute">Бага үлдэгдэл</span>
              <span>{lowStock.length}</span>
            </li>
          </ul>
          <Link href="/admin/orders/new" className="btn-primary mt-5 block w-full">
            Гараар захиалга үүсгэх
          </Link>
        </section>
      </div>
    </div>
  );
}
