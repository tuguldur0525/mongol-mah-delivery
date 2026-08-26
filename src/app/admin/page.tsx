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
    { label: "Өнөөдрийн захиалга", value: String(today.length) },
    { label: "Өнөөдрийн борлуулалт", value: formatMnt(todaySales) },
    { label: "Нийт борлуулалт", value: formatMnt(totalSales) },
    { label: "Хүлээж буй төлбөр", value: String(pendingPayments) },
    { label: "Бэлтгэж байна", value: String(preparing) },
    { label: "Хүргэлтэнд", value: String(delivering) },
  ];

  return (
    <div>
      <p className="eyebrow text-primary">Хяналтын самбар</p>
      <h1 className="mt-2 text-4xl text-display">Тойм</h1>
      <p className="mt-3 text-sm text-muted-foreground">Өнөөдрийн борлуулалт, захиалгын төлөв, үлдэгдэл нэг дор.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-6 shadow-card">
            <p className="eyebrow text-muted-foreground">{c.label}</p>
            <p className="mt-3 text-display text-2xl">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
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
              {lowStock.slice(0, 8).map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className={p.stock_kg <= 0 ? "tag tag-red" : "tag tag-gold"}>
                    {p.stock_kg <= 0 ? "ДУУССАН" : `${formatKg(Number(p.stock_kg))}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="eyebrow">Түүвэр</h2>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex justify-between">
              <span className="text-muted-foreground">Нийт захиалга</span>
              <span className="font-semibold">{orders.length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Төлөгдсөн</span>
              <span className="font-semibold">{paidOrders.length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Дундаж дүн</span>
              <span className="font-semibold">
                {paidOrders.length ? formatMnt(Math.round(totalSales / paidOrders.length)) : "—"}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Бага үлдэгдэл</span>
              <span className="font-semibold">{lowStock.length}</span>
            </li>
          </ul>
          <Link href="/admin/orders/new" className="btn-primary mt-6 w-full">
            Гараар захиалга үүсгэх
          </Link>
        </section>
      </div>
    </div>
  );
}
