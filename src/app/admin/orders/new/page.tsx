import { createAdminClient } from "@/lib/supabase/admin";
import { ManualOrderForm } from "@/components/admin/manual-order-form";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price_per_kg, stock_kg, is_available")
    .order("name");

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-blood">
        Шинэ захиалга
      </p>
      <h1 className="mt-1 font-display text-2xl font-bold">
        Гараар захиалга үүсгэх
      </h1>
      <p className="mt-1 text-sm text-mute">
        Төлбөр «Төлөгдсөн» гэж үүсгэвэл үлдэгдэл шууд хасагдана.
      </p>
      <ManualOrderForm
        products={(products ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          pricePerKg: p.price_per_kg,
          stockKg: Number(p.stock_kg),
          isAvailable: p.is_available,
        }))}
      />
    </div>
  );
}
