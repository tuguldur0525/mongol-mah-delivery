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
  q?: string;
  min?: string;
  max?: string;
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
        : "price_asc";

  const hasActiveFilter = !!(cat || sp.q || sp.stock || sp.min || sp.max);

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug: cat,
      sort,
      inStockOnly: sp.stock === "1",
      search: sp.q,
      minPrice: sp.min ? Number(sp.min) : undefined,
      maxPrice: sp.max ? Number(sp.max) : undefined,
    }),
  ]);

  const buildHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged: Record<string, string | undefined> = { ...sp, ...patch };
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
    { key: "price_asc", label: "Хямд нь эхэндээ" },
    { key: "price_desc", label: "Үнэтэй нь эхэндээ" },
  ];

  const activeCategory = categories.find((c) => c.slug === cat);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header + inline search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-primary">Дэлгүүр</p>
          <h1 className="mt-2 text-4xl text-display">
            {sp.q
              ? `Хайлт: "${sp.q}"`
              : activeCategory
                ? `${activeCategory.name} мах`
                : "Бүх бүтээгдэхүүн"}
          </h1>
        </div>
        <form
          action="/products"
          className="flex w-full max-w-sm gap-2 lg:shrink-0"
        >
          {/* preserve current filters as hidden */}
          {cat && <input type="hidden" name="category" value={cat} />}
          {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
          {sp.stock && <input type="hidden" name="stock" value={sp.stock} />}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.34-4.34" />
              </svg>
            </span>
            <input
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="      Мах хайх... цул, хавирга"
              className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm"
            />
          </div>
          <button
            type="submit"
            className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Хайх
          </button>
        </form>
      </div>

      {/* Filter bar — categories on left, sort on right */}
      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap">
          <Link
            href={buildHref({ cat: undefined, category: undefined })}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${!cat ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"}`}
          >
            Бүгд
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={buildHref({ cat: c.slug })}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${cat === c.slug ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"}`}
            >
              {c.name} мах
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1 border-t border-border pt-3 sm:border-0 sm:pt-0">
          <span className="mr-1 hidden text-xs text-muted-foreground sm:inline">
            Эрэмбэ:
          </span>
          {sorts.map((s) => (
            <Link
              key={s.key}
              href={buildHref({ sort: s.key })}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${sp.sort === s.key || (!sp.sort && s.key === "price_asc") ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilter && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {sp.q && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              “{sp.q}”
              <Link
                href={buildHref({ q: undefined })}
                className="ml-1 hover:text-destructive"
              >
                ×
              </Link>
            </span>
          )}
          {sp.stock === "1" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Байгаа
              <Link
                href={buildHref({ stock: undefined })}
                className="ml-1 hover:text-destructive"
              >
                ×
              </Link>
            </span>
          )}
          {(sp.min || sp.max) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {sp.min ?? "0"} — {sp.max ?? "∞"}₮
              <Link
                href={buildHref({ min: undefined, max: undefined })}
                className="ml-1 hover:text-destructive"
              >
                ×
              </Link>
            </span>
          )}
        </div>
      )}

      {products.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-sm font-medium">Илэрц олдсонгүй</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Шүүлтээ суллаж эсвэл өөр түлхүүр үгээр хайна уу.
          </p>
          <Link href="/products" className="btn-secondary mt-4">
            Шүүлт цэвэрлэх
          </Link>
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
