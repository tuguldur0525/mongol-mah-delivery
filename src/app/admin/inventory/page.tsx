import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatKg } from "@/lib/validations";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const supabase = createAdminClient();
  const [{ data: products }, { data: recentTx }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, stock_kg, low_stock_threshold, is_available")
      .order("name"),
    supabase
      .from("inventory_transactions")
      .select("*, products(name)")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Агуулах</h1>

      <section className="mt-6 overflow-x-auto">
        <div className="card-surface rounded-md">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[0.6875rem] uppercase tracking-widest text-mute">
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
                  <tr key={p.id} className="border-b border-line/50 hover:bg-coal/50">
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={out ? "tag tag-red" : low ? "tag tag-gold" : "tag tag-green"}>
                        {formatKg(stock)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-mute">
                      {formatKg(Number(p.low_stock_threshold))}
                    </td>
                    <td className="px-4 py-3">
                      {out ? (
                        <span className="tag tag-red">ДУУССАН</span>
                      ) : low ? (
                        <span className="tag tag-gold">БАГА</span>
                      ) : (
                        <span className="tag tag-green">ХАНГАЛТТАЙ</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/inventory/${p.id}`}
                        className="text-xs font-semibold text-blood hover:underline"
                      >
                        Засах →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Үлдэгдлийн түүх</h2>
        <div className="card-surface mt-4 overflow-x-auto rounded-md">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[0.6875rem] uppercase tracking-widest text-mute">
                <th className="px-4 py-3">Огноо</th>
                <th className="px-4 py-3">Бүтээгдэхүүн</th>
                <th className="px-4 py-3">Төрөл</th>
                <th className="px-4 py-3">Хэмжээ</th>
                <th className="px-4 py-3">Тайлбар</th>
              </tr>
            </thead>
            <tbody>
              {(recentTx ?? []).map((t) => (
                <tr key={t.id} className="border-b border-line/50">
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-mute">
                    {new Date(t.created_at).toLocaleString("mn-MN")}
                  </td>
                  <td className="px-4 py-3">{t.products?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-bone">{t.type}</td>
                  <td
                    className={`px-4 py-3 font-semibold whitespace-nowrap ${
                      Number(t.quantity_kg) < 0 ? "text-blood" : "text-fresh"
                    }`}
                  >
                    {Number(t.quantity_kg) > 0 ? "+" : ""}
                    {t.quantity_kg} кг
                  </td>
                  <td className="px-4 py-3 text-xs text-mute">{t.note ?? "—"}</td>
                </tr>
              ))}
              {!recentTx?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-mute">
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
