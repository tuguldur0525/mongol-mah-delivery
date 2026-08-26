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
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Бүтээгдэхүүн</h1>
        <Link href="/admin/products/new" className="btn-primary py-2 text-xs">
          + Шинэ бүтээгдэхүүн
        </Link>
      </div>

      <div className="card-surface mt-6 overflow-x-auto rounded-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.6875rem] uppercase tracking-widest text-mute">
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
                <tr key={p.id} className="border-b border-line/50 hover:bg-coal/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-coal">
                        <ProductImage src={p.image_url} alt={p.name} className="h-full w-full" />
                      </div>
                      <Link href={`/admin/products/${p.id}`} className="hover:text-cream">
                        {p.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-mute">{p.categories?.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatMnt(p.price_per_kg)}</td>
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
                <td colSpan={6} className="px-4 py-12 text-center text-mute">
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
