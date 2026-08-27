import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatMnt, formatKg } from "@/lib/validations";
import { EarningsChart, OrdersStatusChart } from "@/components/admin/dashboard-charts";

export const dynamic = "force-dynamic";

function formatUB(dateStr: string) {
  return new Date(dateStr).toLocaleString("mn-MN", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ubDateString(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Ulaanbaatar" });
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  // Fetch orders for charts + recent
  const [ordersRes, lowStockRes, recentRes] = await Promise.all([
    supabase.from("orders").select("payment_status, order_status, total_amount, created_at, order_number, customer_name, phone"),
    supabase.from("products").select("id, name, stock_kg, low_stock_threshold, is_available").filter("stock_kg", "lte", "low_stock_threshold"),
    supabase.from("orders").select("id, order_number, customer_name, phone, total_amount, payment_status, order_status, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const orders = (ordersRes.data ?? []) as { payment_status: string; order_status: string; total_amount: number; created_at: string; order_number?: string; customer_name?: string; phone?: string }[];
  const recentOrders = (recentRes.data ?? []) as { id: string; order_number: string; customer_name: string; phone: string; total_amount: number; payment_status: string; order_status: string; created_at: string }[];

  // Today in Ulaanbaatar
  const todayUBStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ulaanbaatar" });
  const todayOrders = orders.filter((o) => ubDateString(new Date(o.created_at)) === todayUBStr);
  const paidOrders = orders.filter((o) => o.payment_status === "paid");
  const todayPaid = todayOrders.filter((o) => o.payment_status === "paid");
  const totalSales = paidOrders.reduce((s, o) => s + o.total_amount, 0);
  const todaySales = todayPaid.reduce((s, o) => s + o.total_amount, 0);
  const pendingPayments = orders.filter((o) => o.payment_status === "pending").length;
  const preparing = orders.filter((o) => o.order_status === "preparing").length;
  const delivering = orders.filter((o) => o.order_status === "delivering").length;
  const lowStock = lowStockRes.data ?? [];

  const cards = [
    { label: "Өнөөдрийн захиалга", value: String(todayOrders.length) },
    { label: "Өнөөдрийн борлуулалт", value: formatMnt(todaySales) },
    { label: "Нийт борлуулалт", value: formatMnt(totalSales) },
    { label: "Хүлээж буй төлбөр", value: String(pendingPayments) },
    { label: "Бэлтгэж байна", value: String(preparing) },
    { label: "Хүргэлтэнд", value: String(delivering) },
  ];

  // Earnings last 7 days in UB
  const earningsByDay: { date: string; label: string; earnings: number; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const iso = d.toLocaleDateString("en-CA", { timeZone: "Asia/Ulaanbaatar" });
    const label = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Ulaanbaatar" })).toLocaleDateString("mn-MN", { timeZone: "Asia/Ulaanbaatar", month: "short", day: "numeric" });
    const dayOrders = orders.filter((o) => ubDateString(new Date(o.created_at)) === iso && o.payment_status === "paid");
    const earnings = dayOrders.reduce((s, o) => s + o.total_amount, 0);
    earningsByDay.push({ date: iso, label, earnings, orders: dayOrders.length });
  }

  const statusCounts = ["pending_payment", "confirmed", "preparing", "delivering", "delivered", "cancelled"].map((status) => ({
    status,
    count: orders.filter((o) => o.order_status === status).length,
  }));

  const nowUB = new Date().toLocaleString("mn-MN", { timeZone: "Asia/Ulaanbaatar", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <p className="eyebrow text-primary">Хяналтын самбар</p>
      <h1 className="mt-2 text-4xl text-display">Тойм</h1>
      <p className="mt-2 text-sm text-muted-foreground">Бүх цаг Улаанбаатарын цагаар (Asia/Ulaanbaatar) · {nowUB}</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-6 shadow-card">
            <p className="eyebrow text-muted-foreground">{c.label}</p>
            <p className="mt-3 text-display text-2xl">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="eyebrow">Сүүлийн 7 хоногийн орлого</h2>
          <p className="mt-1 text-xs text-muted-foreground">Улаанбаатарын цагаар, зөвхөн төлөгдсөн</p>
          <div className="mt-4">
            <EarningsChart data={earningsByDay} />
          </div>
        </section>
        <section className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="eyebrow">Захиалгын төлөв</h2>
          <p className="mt-1 text-xs text-muted-foreground">Бүх захиалгын хуваарилалт</p>
          <div className="mt-4">
            <OrdersStatusChart data={statusCounts} />
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="eyebrow">Сүүлийн захиалгууд</h2>
            <Link href="/admin/orders" className="text-xs font-medium text-primary hover:underline">
              Бүгдийг харах →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-6 rounded-lg bg-muted p-6 text-center text-sm text-muted-foreground">Захиалга байхгүй</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-medium hover:text-primary">
                      {o.order_number}
                    </Link>
                    <p className="truncate text-sm">
                      {o.customer_name} <span className="text-muted-foreground">· {o.phone}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{formatUB(o.created_at)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{formatMnt(o.total_amount)}</p>
                    <span className={`tag ${o.payment_status === "paid" ? "tag-green" : o.payment_status === "pending" ? "tag-gold" : "tag-red"} mt-1`}>{o.payment_status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="eyebrow">Бага үлдэгдэл</h2>
            <Link href="/admin/inventory" className="text-xs font-medium text-primary hover:underline">
              Бүгдийг харах →
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="mt-6 rounded-lg bg-muted p-6 text-center text-sm text-muted-foreground">Бүх үлдэгдэл хангалттай.</p>
          ) : (
            <ul className="mt-6 divide-y divide-border">
              {lowStock.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className={Number(p.stock_kg) <= 0 ? "tag tag-red" : "tag tag-gold"}>{Number(p.stock_kg) <= 0 ? "ДУУССАН" : `${formatKg(Number(p.stock_kg))}`}</span>
                </li>
              ))}
            </ul>
          )}
          <h3 className="eyebrow mt-8">Түүвэр</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between"><span className="text-muted-foreground">Нийт захиалга</span><span className="font-semibold">{orders.length}</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Төлөгдсөн</span><span className="font-semibold">{paidOrders.length}</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Дундаж дүн</span><span className="font-semibold">{paidOrders.length ? formatMnt(Math.round(totalSales / paidOrders.length)) : "—"}</span></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
