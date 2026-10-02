import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductBundleForm } from "@/components/admin/product-bundle-form";
import type { ProductBundle } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditProductBundlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const [{ data: bundle }, { data: products }] = await Promise.all([
    supabase
      .from("product_bundles")
      .select(
        "*, product_bundle_items(id, bundle_id, product_id, quantity_kg, products(id, name, slug, price_per_kg, stock_kg, image_url, is_available))",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("products").select("id, name, is_available").order("name"),
  ]);
  if (!bundle) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow text-primary">Багц засах</p>
      <h1 className="mt-2 text-3xl text-display">{bundle.name}</h1>
      <ProductBundleForm
        products={products ?? []}
        bundle={bundle as ProductBundle}
      />
    </div>
  );
}
