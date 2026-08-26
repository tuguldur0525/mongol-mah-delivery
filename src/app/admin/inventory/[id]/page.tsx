import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatKg } from "@/lib/validations";
import { StockChangeForm } from "@/components/admin/stock-change-form";

export const dynamic = "force-dynamic";

export default async function ProductInventoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const [{ data: product }, { data: tx }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, stock_kg, low_stock_threshold")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("inventory_transactions")
      .select("*")
      .eq("product_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-blood">
        Агуулах
      </p>
      <h1 className="mt-1 font-display text-2xl font-bold">{product.name}</h1>
      <p className="mt-1 text-sm text-mute">
        Одоогийн үлдэгдэл: {formatKg(Number(product.stock_kg))}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <StockChangeForm productId={product.id} mode="in" />
        <StockChangeForm productId={product.id} mode="adjust" />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Түүх</h2>
        <div className="card-surface mt-4 overflow-x-auto rounded-md">
          <ul className="divide-y divide-line text-sm">
            {(tx ?? []).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div>
                  <p className="font-medium">
                    {t.type}{" "}
                    <span
                      className={
                        Number(t.quantity_kg) < 0 ? "text-blood" : "text-fresh"
                      }
                    >
                      ({Number(t.quantity_kg) > 0 ? "+" : ""}
                      {t.quantity_kg} кг)
                    </span>
                  </p>
                  <p className="text-xs text-mute">
                    {t.note ?? "—"} · {new Date(t.created_at).toLocaleString("mn-MN")}
                  </p>
                </div>
              </li>
            ))}
            {!tx?.length && (
              <li className="px-5 py-10 text-center text-mute">Түүх хоосон</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
