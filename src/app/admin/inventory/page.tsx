import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatKg } from "@/lib/validations";
import { formatUBDateTime } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const supabase = createAdminClient();
  const [{ data: products }, { data: recentTx }] = await Promise.all([
    supabase.from("products").select("id, name, stock_kg, low_stock_threshold, is_available").order("name"),
    supabase.from("inventory_transactions").select("*, products(name)").order("created_at", { ascending: false }).limit(30),
  ]);

  return (
    <div>
      <p className="eyebrow text-primary">Агуулах</p>
      <h1 className="mt-2 text-4xl text-display">Агуулах</h1>
      <p className="mt-2 text-sm text-muted-foreground">Үлдэгдэл, босго, сүүлийн хөдөлгөөн.</p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left eyebrow text-muted-foreground">
              <th className="px-4 py-3">Бүтээгдэхүүн</th>
              <th className="px-4 py-3">Үлдэгдэл</th>
              <th className="px-4 py-3">Босго</th>
              <th className="px-4 py-3">Төлөв</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => {
              const stock = Number(p.stock_kg);
              const out = stock <= 0 || !p.is_available;
              const low = !out && stock <= p.low_stock_threshold;
              return (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={out ? "tag tag-red" : low ? "tag tag-gold" : "tag tag-green"}>{formatKg(stock)}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatKg(Number(p.low_stock_threshold))}</td>
                  <td className="px-4 py-3">
                    {out ? <span className="tag tag-red">ДУУССАН</span> : low ? <span className="tag tag-gold">БАГА</span> : <span className="tag tag-green">ХАНГАЛТТАЙ</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/inventory/${p.id}`} className="text-xs font-semibold text-primary hover:underline">
                      Засах →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="mt-12">
        <h2 className="text-display text-2xl">Үлдэгдлийн түүх</h2>
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left eyebrow text-muted-foreground">
                <th className="px-4 py-3">Огноо</th>
                <th className="px-4 py-3">Бүтээгдэхүүн</th>
                <th className="px-4 py-3">Төрөл</th>
                <th className="px-4 py-3">Хэмжээ</th>
                <th className="px-4 py-3">Тайлбар</th>
              </tr>
            </thead>
            <tbody>
              {(recentTx ?? []).map((t) => (
                <tr key={t.id} className="border-b border-border/50">
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">
                    {formatUBDateTime(t.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium">{t.products?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{t.type}</td>
                  <td className={`px-4 py-3 font-semibold whitespace-nowrap ${Number(t.quantity_kg) < 0 ? "text-destructive" : "text-green-600"}`}>
                    {Number(t.quantity_kg) > 0 ? "+" : ""}
                    {t.quantity_kg} кг
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{t.note ?? "—"}</td>
                </tr>
              ))}
              {!recentTx?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-sm text-muted-foreground">
                    Хөдөлгөөн бүртгэгдээгүй
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
