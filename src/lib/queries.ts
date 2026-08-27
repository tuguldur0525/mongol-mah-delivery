import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Category, ProductWithCategory } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  return data ?? [];
}

export async function getProducts(options: {
  categorySlug?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  search?: string;
}): Promise<ProductWithCategory[]> {
  const supabase = await createClient();
  // Resolve category slug → id first (reliable vs foreign table filter)
  if (options.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .maybeSingle();
    if (!cat) return [];
    // filter by category_id directly
    let filtered = supabase
      .from("products")
      .select("*, categories(id, name, slug)")
      .eq("category_id", cat.id);
    if (options.search) filtered = filtered.ilike("name", `%${options.search}%`);
    if (options.inStockOnly) filtered = filtered.gt("stock_kg", 0).eq("is_available", true);
    if (options.minPrice != null) filtered = filtered.gte("price_per_kg", options.minPrice);
    if (options.maxPrice != null) filtered = filtered.lte("price_per_kg", options.maxPrice);
    switch (options.sort) {
      case "price_asc":
        filtered = filtered.order("price_per_kg", { ascending: true });
        break;
      case "price_desc":
        filtered = filtered.order("price_per_kg", { ascending: false });
        break;
      default:
        filtered = filtered.order("created_at", { ascending: false });
    }
    if (options.limit) filtered = filtered.limit(options.limit);
    const { data } = await filtered;
    return (data as ProductWithCategory[]) ?? [];
  }

  let query = supabase
    .from("products")
    .select("*, categories(id, name, slug)");
  if (options.search) {
    query = query.ilike("name", `%${options.search}%`);
  }
  if (options.inStockOnly) {
    query = query.gt("stock_kg", 0).eq("is_available", true);
  }
  if (options.minPrice != null) {
    query = query.gte("price_per_kg", options.minPrice);
  }
  if (options.maxPrice != null) {
    query = query.lte("price_per_kg", options.maxPrice);
  }
  switch (options.sort) {
    case "price_asc":
      query = query.order("price_per_kg", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price_per_kg", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }
  if (options.limit) query = query.limit(options.limit);

  const { data } = await query;
  return (data as ProductWithCategory[]) ?? [];
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithCategory | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("slug", slug)
    .maybeSingle();
  return (data as ProductWithCategory) ?? null;
}
