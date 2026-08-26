import { createAdminClient } from "@/lib/supabase/admin";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = createAdminClient();
  const { data: settings } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Тохиргоо</h1>
      <p className="mt-1 text-sm text-mute">
        Wire төлбөрийн нууц түлхүүрүүд серверийн environment variable-д
        хадгалагдана.
      </p>
      <SettingsForm
        settings={{
          store_name: settings?.store_name ?? "МАХ ДЕЛІВЕРІ",
          contact_phone: settings?.contact_phone ?? "",
          delivery_fee: settings?.delivery_fee ?? 0,
          delivery_info: settings?.delivery_info ?? "",
        }}
      />
    </div>
  );
}
