import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/queries";
import { AddToCartPanel } from "@/components/products/add-to-cart-panel";
import { ProductCard, ProductImage } from "@/components/products/product-card";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (
    await getProducts({ categorySlug: product.categories?.slug, limit: 4 })
  ).filter((p) => p.id !== product.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="mb-6 flex items-center gap-2 text-xs text-mute">
        <Link href="/" className="hover:text-cream">
          Нүүр
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-cream">
          Бүтээгдэхүүн
        </Link>
        <span>/</span>
        <Link
          href={`/products?cat=${product.categories?.slug}`}
          className="hover:text-cream"
        >
          {product.categories?.name}
        </Link>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-md bg-coal">
          <ProductImage
            src={product.image_url}
            alt={product.name}
            className="h-full w-full"
          />
        </div>

        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-blood">
            {product.categories?.name}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">
            {product.name}
          </h1>
          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-bone">
              {product.description}
            </p>
          )}
          <div className="mt-6">
            <AddToCartPanel product={product} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-blood">
            Хамааралтай
          </p>
          <h2 className="mt-2 font-display text-xl font-bold">
            Ижил төстэй бүтээгдэхүүн
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
