import { PromoCodeManager } from "@/components/admin/promo-code-manager";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("id, code, discount_per_kg, minimum_kg, is_active")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Промо кодын жагсаалт ачаалж чадсангүй");

  return (
    <div>
      <p className="eyebrow text-primary">Хямдрал</p>
      <h1 className="mt-2 text-4xl text-display">Промо код</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Кодын кг тутмын хямдрал болон үйлчлэх доод жинг тохируулна. Шинэ кодын
        доод хэмжээ анхдагчаар 50 кг байна.
      </p>
      <PromoCodeManager
        promos={(data ?? []).map((promo) => ({
          ...promo,
          discount_per_kg: Number(promo.discount_per_kg),
          minimum_kg: Number(promo.minimum_kg),
        }))}
      />
    </div>
  );
}
