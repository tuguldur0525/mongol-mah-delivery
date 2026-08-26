import { createAdminClient } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = createAdminClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-blood">
        Шинэ бүтээгдэхүүн
      </p>
      <h1 className="mt-1 font-display text-2xl font-bold">
        Бүтээгдэхүүн нэмэх
      </h1>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
