import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order"),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-blood">
        Бүтээгдэхүүн засах
      </p>
      <h1 className="mt-1 font-display text-2xl font-bold">{product.name}</h1>
      <ProductForm categories={categories ?? []} product={product} />
    </div>
  );
}
