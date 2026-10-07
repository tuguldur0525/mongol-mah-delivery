"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { cartSchema, promoCodeFormSchema } from "@/lib/validations";

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

export type PromoValidationResult =
  | {
      ok: true;
      code: string;
      discountPerKg: number;
      minimumKg: number;
      totalKg: number;
    }
  | { ok: false; error: string };

export async function validatePromoCode(
  rawCode: string,
  cartJson: string,
): Promise<PromoValidationResult> {
  const code = rawCode.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
    return { ok: false, error: "Промо кодоо зөв оруулна уу" };
  }

  let rawCart: unknown;
  try {
    rawCart = JSON.parse(cartJson);
  } catch {
    return { ok: false, error: "Сагсны мэдээлэл буруу байна" };
  }
  const parsedCart = cartSchema.safeParse(rawCart);
  if (!parsedCart.success) {
    return { ok: false, error: "Сагсны мэдээлэл буруу байна" };
  }

  const supabase = createAdminClient();
  const { data: promo, error } = await supabase
    .from("promo_codes")
    .select("code, discount_per_kg, minimum_kg")
    .eq("code", code)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[promos] validation lookup failed:", error);
    return { ok: false, error: "Промо код шалгахад алдаа гарлаа. Дахин оролдоно уу." };
  }
  if (!promo) return { ok: false, error: "Промо код хүчингүй эсвэл идэвхгүй байна" };

  const totalKg =
    Math.round(
      parsedCart.data.reduce((sum, item) => sum + item.quantityKg, 0) * 100,
    ) / 100;
  const minimumKg = Number(promo.minimum_kg);
  if (totalKg < minimumKg) {
    return {
      ok: false,
      error: `${minimumKg} кг ба түүнээс дээш худалдан авалтад энэ код үйлчилнэ`,
    };
  }

  return {
    ok: true,
    code: promo.code,
    discountPerKg: Number(promo.discount_per_kg),
    minimumKg,
    totalKg,
  };
}

export async function savePromoCode(id: string | null, formData: FormData) {
  const supabase = await requireAdmin();
  if (id !== null && !/^[0-9a-f-]{36}$/i.test(id)) {
    return { error: "Промо кодын мэдээлэл буруу байна" };
  }

  const parsed = promoCodeFormSchema.safeParse({
    code: formData.get("code"),
    discount_per_kg: formData.get("discount_per_kg"),
    minimum_kg: formData.get("minimum_kg"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const query = id
    ? supabase
        .from("promo_codes")
        .update(parsed.data)
        .eq("id", id)
    : supabase.from("promo_codes").insert(parsed.data);
  const { error } = await query;
  if (error) {
    console.error("[promos] save failed:", error);
    return {
      error:
        error.code === "23505"
          ? "Ийм промо код бүртгэлтэй байна"
          : "Промо код хадгалахад алдаа гарлаа",
    };
  }

  revalidatePath("/admin/promos");
  revalidatePath("/checkout");
  return { ok: true };
}

export async function togglePromoCode(id: string, active: boolean) {
  const supabase = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return { error: "Промо кодын мэдээлэл буруу байна" };
  }

  const { error } = await supabase
    .from("promo_codes")
    .update({ is_active: active })
    .eq("id", id);
  if (error) {
    console.error("[promos] status update failed:", error);
    return { error: "Промо кодын төлөв өөрчилж чадсангүй" };
  }

  revalidatePath("/admin/promos");
  revalidatePath("/checkout");
  return { ok: true };
}
