import Link from "next/link";
import { getCategories, getProducts } from "@/lib/queries";
import { ProductCard } from "@/components/products/product-card";

export const dynamic = "force-dynamic";

export const metadata = { title: "Бүтээгдэхүүн — МАХ ДЕЛІВЕРІ" };

type SearchParams = Promise<{
  cat?: string;
  sort?: string;
  stock?: string;
  min?: string;
  max?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const sort =
    sp.sort === "price_asc"
      ? "price_asc"
      : sp.sort === "price_desc"
        ? "price_desc"
        : "newest";

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug: sp.cat,
      sort,
      inStockOnly: sp.stock === "1",
      minPrice: sp.min ? Number(sp.min) : undefined,
      maxPrice: sp.max ? Number(sp.max) : undefined,
    }),
  ]);

  const buildHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { ...sp, ...patch };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    return `/products${qs ? `?${qs}` : ""}`;
  };

  const sorts = [
    { key: "newest", label: "Шинэ" },
    { key: "price_asc", label: "Бага → Их" },
    { key: "price_desc", label: "Их → Бага" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-blood">
            Бүтээгдэхүүн
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold">
            {sp.cat
              ? categories.find((c) => c.slug === sp.cat)?.name ?? "Бүтээгдэхүүн"
              : "Бүх бүтээгдэхүүн"}
          </h1>
        </div>
        <span className="text-xs text-mute">{products.length} ширхэг</span>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-line pb-5">
        <Link
          href={buildHref({ cat: undefined })}
          className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
            !sp.cat
              ? "bg-cream text-ink"
              : "text-bone hover:text-cream"
          }`}
        >
          Бүгд
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={buildHref({ cat: c.slug })}
            className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
              sp.cat === c.slug
                ? "bg-cream text-ink"
                : "text-bone hover:text-cream"
            }`}
          >
            {c.name}
          </Link>
        ))}

        <span className="mx-1 h-4 w-px bg-line" />

        <Link
          href={buildHref({ stock: sp.stock === "1" ? undefined : "1" })}
          className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
            sp.stock === "1"
              ? "bg-cream text-ink"
              : "text-bone hover:text-cream"
          }`}
        >
          Байгаа
        </Link>

        <span className="mx-1 h-4 w-px bg-line" />

        {sorts.map((s) => (
          <Link
            key={s.key}
            href={buildHref({ sort: s.key })}
            className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
              sp.sort === s.key || (s.key === "newest" && !sp.sort)
                ? "bg-cream text-ink"
                : "text-bone hover:text-cream"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="mt-8 rounded-md border border-line bg-surface p-12 text-center">
          <p className="text-sm text-mute">
            Ийм шүүлтүүрт тохирох бүтээгдэхүүн олдсонгүй.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
