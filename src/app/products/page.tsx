import Link from "next/link";
import { getCategories, getProducts } from "@/lib/queries";
import { ProductCard } from "@/components/products/product-card";

export const dynamic = "force-dynamic";

export const metadata = { title: "Бүтээгдэхүүн — Монгол Мах" };

type SearchParams = Promise<{
  cat?: string;
  sort?: string;
  stock?: string;
  category?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const cat = sp.cat ?? sp.category;
  const sort =
    sp.sort === "price_asc"
      ? "price_asc"
      : sp.sort === "price_desc"
        ? "price_desc"
        : "newest";

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug: cat,
      sort,
      inStockOnly: sp.stock === "1",
    }),
  ]);

  const buildHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged: Record<string, string | undefined> = { ...sp, ...patch };
    // normalize: drop cat if undefined and ensure category param not duplicated
    if (patch.cat === undefined) {
      delete merged.cat;
      delete merged.category;
    }
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    const qs = params.toString();
    return `/products${qs ? `?${qs}` : ""}`;
  };

  const sorts = [
    { key: "newest", label: "Шинэ" },
    { key: "price_asc", label: "Бага → Их" },
    { key: "price_desc", label: "Их → Бага" },
  ];

  const activeCategory = categories.find((c) => c.slug === cat);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <p className="eyebrow text-primary">Дэлгүүр</p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <h1 className="text-4xl text-display">
          {activeCategory ? `${activeCategory.name} мах` : "Бүх бүтээгдэхүүн"}
        </h1>
        <span className="text-sm text-muted-foreground">{products.length} ширхэг</span>
      </div>

      {/* Filters - pill style like mongol-mah */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Link
          href={buildHref({ cat: undefined, category: undefined })}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors border ${!cat ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"}`}
        >
          Бүгд
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={buildHref({ cat: c.slug })}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors border ${cat === c.slug ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"}`}
          >
            {c.name} мах
          </Link>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Link
          href={buildHref({ stock: sp.stock === "1" ? undefined : "1" })}
          className={`rounded-md px-3 py-1.5 text-xs font-medium border transition-colors ${sp.stock === "1" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
        >
          Байгаа
        </Link>
        <span className="mx-1 h-4 w-px bg-border" />
        {sorts.map((s) => (
          <Link
            key={s.key}
            href={buildHref({ sort: s.key })}
            className={`rounded-md px-3 py-1.5 text-xs font-medium border transition-colors ${sp.sort === s.key || (s.key === "newest" && !sp.sort) ? "bg-card border-border text-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Ийм шүүлтүүрт тохирох бүтээгдэхүүн олдсонгүй.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
