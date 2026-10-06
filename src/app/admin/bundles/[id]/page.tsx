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
  const { data: bundle } = await supabase
    .from("product_bundles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!bundle) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow text-primary">Багц засах</p>
      <h1 className="mt-2 text-3xl text-display">{bundle.name}</h1>
      <ProductBundleForm
        bundle={bundle as ProductBundle}
      />
    </div>
  );
}
