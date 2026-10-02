import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductBundleForm } from "@/components/admin/product-bundle-form";

export const dynamic = "force-dynamic";

export default async function NewProductBundlePage() {
  const supabase = createAdminClient();
  const { data: products } = await supabase.from("products").select("id, name, is_available").order("name");

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/bundles" className="text-sm text-muted-foreground hover:text-foreground">← Багцууд</Link>
      <p className="mt-5 eyebrow text-primary">Шинэ багц</p>
      <h1 className="mt-2 text-3xl text-display">Багц бүтээгдэхүүн үүсгэх</h1>
      <ProductBundleForm products={products ?? []} />
    </div>
  );
}