"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { productBundleSchema } from "@/lib/validations";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтэрнэ үү");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) throw new Error("Зөвшөөрөлгүй хандалт");
  return supabase;
}

function revalidateBundleViews() {
  revalidatePath("/admin/bundles");
  revalidatePath("/bundles");
  revalidatePath("/");
}

export async function saveProductBundle(
  bundleId: string | null,
  formData: FormData,
) {
  const supabase = await requireAdmin();
  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("items") ?? ""));
  } catch {
    return { error: "Багцын бүтээгдэхүүний мэдээлэл буруу байна" };
  }

  const parsed = productBundleSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    image_url: formData.get("image_url") ?? "",
    is_active: formData.get("is_active") === "on",
    sort_order: formData.get("sort_order"),
    items,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data, error } = await supabase.rpc("admin_save_product_bundle", {
    p_bundle_id: bundleId,
    p_name: parsed.data.name,
    p_description: parsed.data.description || null,
    p_image_url: parsed.data.image_url || null,
    p_is_active: parsed.data.is_active,
    p_sort_order: parsed.data.sort_order,
    p_items: parsed.data.items,
  });
  if (error || !data) {
    console.error("[bundles] save failed:", error);
    return { error: "Багц хадгалахад алдаа гарлаа" };
  }

  revalidateBundleViews();
  return { ok: true, id: data };
}

export async function toggleProductBundle(bundleId: string, active: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("product_bundles")
    .update({ is_active: active, updated_at: new Date().toISOString() })
    .eq("id", bundleId);
  if (error) return { error: "Багцын төлөв өөрчилж чадсангүй" };
  revalidateBundleViews();
  return { ok: true };
}

export async function deleteProductBundle(bundleId: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("product_bundles")
    .delete()
    .eq("id", bundleId);
  if (error) return { error: "Багц устгаж чадсангүй" };
  revalidateBundleViews();
  return { ok: true };
}