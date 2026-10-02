import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductBundleActions } from "@/components/admin/product-bundle-actions";

export const dynamic = "force-dynamic";

export default async function AdminBundlesPage() {
  const supabase = createAdminClient();
  const { data: bundles } = await supabase
    .from("product_bundles")
    .select("*, product_bundle_items(id, quantity_kg, products(name))")
    .order("sort_order")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-primary">Багцын худалдаа</p>
          <h1 className="mt-2 text-4xl text-display">Багц бүтээгдэхүүн</h1>
        </div>
        <Link href="/admin/bundles/new" className="btn-primary">+ Багц үүсгэх</Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left eyebrow text-muted-foreground">
              <th className="px-4 py-3">Нэр</th>
              <th className="px-4 py-3">Бүрэлдэхүүн</th>
              <th className="px-4 py-3">Төлөв</th>
              <th className="px-4 py-3 text-right">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {(bundles ?? []).map((bundle) => (
              <tr key={bundle.id} className="border-b border-border/50">
                <td className="px-4 py-4 font-semibold">{bundle.name}</td>
                <td className="min-w-64 px-4 py-4 text-muted-foreground">
                  {(bundle.product_bundle_items ?? []).map((item: { products: { name: string } | null; quantity_kg: number }) => `${item.products?.name ?? "Устсан бүтээгдэхүүн"} · ${item.quantity_kg} кг`).join(", ")}
                </td>
                <td className="px-4 py-4">
                  <span className={bundle.is_active ? "tag tag-green" : "tag tag-red"}>
                    {bundle.is_active ? "Идэвхтэй" : "Нуугдсан"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <ProductBundleActions bundleId={bundle.id} active={bundle.is_active} />
                </td>
              </tr>
            ))}
            {!bundles?.length && (
              <tr><td colSpan={4} className="px-4 py-16 text-center text-muted-foreground">Багц хараахан үүсгээгүй байна.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}