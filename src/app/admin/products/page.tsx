import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatMnt, formatKg } from "@/lib/validations";
import { ProductImage } from "@/components/products/product-card";
import { ProductToggle } from "@/components/admin/product-toggle";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-primary">Бүтээгдэхүүн</p>
          <h1 className="mt-2 text-4xl text-display">Бүтээгдэхүүн</h1>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          + Шинэ бүтээгдэхүүн
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left eyebrow text-muted-foreground">
              <th className="px-4 py-3">Бүтээгдэхүүн</th>
              <th className="px-4 py-3">Ангилал</th>
              <th className="px-4 py-3">Үнэ/кг</th>
              <th className="px-4 py-3">Үлдэгдэл</th>
              <th className="px-4 py-3">Төлөв</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => {
              const out = p.stock_kg <= 0 || !p.is_available;
              const low = !out && p.stock_kg <= p.low_stock_threshold;
              return (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                        <ProductImage src={p.image_url} alt={p.name} className="h-full w-full" />
                      </div>
                      <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-primary">
                        {p.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.categories?.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{formatMnt(p.price_per_kg)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={out ? "tag tag-red" : low ? "tag tag-gold" : "tag tag-green"}>
                      {formatKg(Number(p.stock_kg))}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={p.is_available ? "tag tag-green" : "tag tag-red"}>
                      {p.is_available ? "Идэвхтэй" : "Идэвхгүй"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <ProductToggle productId={p.id} isAvailable={p.is_available} />
                  </td>
                </tr>
              );
            })}
            {!products?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-sm text-muted-foreground">
                  Бүтээгдэхүүн байхгүй
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
