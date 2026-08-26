"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { productFormSchema } from "@/lib/validations";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Нэвтэрнэ үү");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) throw new Error("Зөвшөөрөлгүй хандалт");
  return supabase;
}

function slugify(name: string): string {
  const map: Record<string, string> = {
    ө: "o", а: "a", б: "b", в: "v", г: "g", д: "d",
    е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "i", к: "k", л: "l",
    м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
    ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "i",
    ь: "", э: "e", ю: "yu", я: "ya",
  };
  const base = name
    .toLowerCase()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "product"}-${Date.now().toString(36)}`;
}

export async function createProduct(formData: FormData) {
  const supabase = await requireAdmin();
  const parsed = productFormSchema.safeParse({
    name: formData.get("name"),
    category_id: formData.get("category_id"),
    description: formData.get("description") ?? "",
    price_per_kg: formData.get("price_per_kg"),
    stock_kg: formData.get("stock_kg"),
    low_stock_threshold: formData.get("low_stock_threshold"),
    image_url: formData.get("image_url") ?? "",
    is_available: formData.get("is_available") === "on" || formData.get("is_available") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: p } = parsed;
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: p.name,
      slug: slugify(p.name),
      category_id: p.category_id,
      description: p.description || null,
      price_per_kg: p.price_per_kg,
      stock_kg: p.stock_kg,
      low_stock_threshold: p.low_stock_threshold,
      image_url: p.image_url || null,
      is_available: p.is_available,
    })
    .select("id")
    .single();

  if (error) return { error: "Бүтээгдэхүүн нэмэхэд алдаа гарлаа" };

  // Record initial stock as a STOCK_IN transaction if > 0
  if (p.stock_kg > 0) {
    await supabase.from("inventory_transactions").insert({
      product_id: product.id,
      type: "STOCK_IN",
      quantity_kg: p.stock_kg,
      reference_type: "manual",
      note: "Анхны үлдэгдэл",
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true, id: product.id };
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await requireAdmin();
  const parsed = productFormSchema.safeParse({
    name: formData.get("name"),
    category_id: formData.get("category_id"),
    description: formData.get("description") ?? "",
    price_per_kg: formData.get("price_per_kg"),
    stock_kg: formData.get("stock_kg"),
    low_stock_threshold: formData.get("low_stock_threshold"),
    image_url: formData.get("image_url") ?? "",
    is_available: formData.get("is_available") === "on" || formData.get("is_available") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: existing } = await supabase
    .from("products")
    .select("stock_kg")
    .eq("id", productId)
    .single();
  if (!existing) return { error: "Бүтээгдэхүүн олдсонгүй" };

  const { data: p } = parsed;
  const { error } = await supabase
    .from("products")
    .update({
      name: p.name,
      category_id: p.category_id,
      description: p.description || null,
      price_per_kg: p.price_per_kg,
      low_stock_threshold: p.low_stock_threshold,
      image_url: p.image_url || null,
      is_available: p.is_available,
    })
    .eq("id", productId);

  if (error) return { error: "Хадгалахад алдаа гарлаа" };

  // Stock changes through the edit form go through the atomic RPC
  const delta = p.stock_kg - Number(existing.stock_kg);
  if (delta !== 0) {
    const { error: rpcError } = await supabase.rpc("admin_stock_change", {
      p_product_id: productId,
      p_delta: delta,
      p_type: delta > 0 ? "STOCK_IN" : "ADJUSTMENT",
      p_note: "Бүтээгдэхүүн засварласан",
    });
    if (rpcError) return { error: "Үлдэгдэл өөрчлөхөд алдаа гарлаа" };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true };
}

export async function toggleProductAvailability(productId: string, available: boolean) {
  const supabase = await requireAdmin();
  await supabase
    .from("products")
    .update({ is_available: available })
    .eq("id", productId);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true };
}
