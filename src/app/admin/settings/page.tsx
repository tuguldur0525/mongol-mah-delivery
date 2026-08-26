import { createAdminClient } from "@/lib/supabase/admin";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = createAdminClient();
  const { data: settings } = await supabase.from("store_settings").select("*").eq("id", 1).single();

  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow text-primary">Тохиргоо</p>
      <h1 className="mt-2 text-4xl text-display">Тохиргоо</h1>
      <p className="mt-3 text-sm text-muted-foreground">Дэлгүүрийн нэр, утас, хүргэлтийн төлбөр. Нууц түлхүүрүүд environment-д хадгалагдана.</p>
      <SettingsForm
        settings={{
          store_name: settings?.store_name ?? "Монгол Мах",
          contact_phone: settings?.contact_phone ?? "99112233",
          delivery_fee: settings?.delivery_fee ?? 5000,
          delivery_info: settings?.delivery_info ?? "",
        }}
      />
    </div>
  );
}
