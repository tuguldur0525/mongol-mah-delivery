"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/store/cart";
import { formatMnt, formatKg } from "@/lib/validations";
import type { ProductWithCategory } from "@/types";

export function ProductImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-coal ${className ?? ""}`}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-line"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 50vw, 25vw"
      className={`object-cover ${className ?? ""}`}
    />
  );
}

export function ProductCard({
  product,
  index = 0,
}: {
  product: ProductWithCategory;
  index?: number;
}) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const outOfStock = !product.is_available || product.stock_kg <= 0;
  const lowStock =
    !outOfStock && product.stock_kg <= product.low_stock_threshold;

  const handleAdd = () => {
    if (outOfStock) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        pricePerKg: product.price_per_kg,
        imageUrl: product.image_url,
        stockKg: product.stock_kg,
      },
      1,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.3) }}
    >
      <div className="group overflow-hidden rounded-md border border-line bg-surface transition-all hover:border-bone">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-coal">
            <ProductImage
              src={product.image_url}
              alt={product.name}
              className="h-full w-full transition-transform duration-500 group-hover:scale-105"
            />
            {outOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/75">
                <span className="tag tag-red">ДУУССАН</span>
              </div>
            )}
            {lowStock && !outOfStock && (
              <span className="absolute top-2 left-2 tag tag-gold">
                Тун удахгүй
              </span>
            )}
          </div>
        </Link>

        <div className="p-3.5">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-mute">
            {product.categories?.name ?? ""}
          </p>
          <Link
            href={`/products/${product.slug}`}
            className="mt-1 block text-sm font-medium text-cream transition-colors hover:text-bone"
          >
            {product.name}
          </Link>

          <div className="mt-2.5 flex items-end justify-between">
            <span className="font-display text-lg font-bold text-cream">
              {formatMnt(product.price_per_kg)}
              <span className="ml-0.5 text-[0.6875rem] font-normal text-mute">
                / кг
              </span>
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="mt-3 w-full rounded-sm bg-cream py-2 text-[0.75rem] font-bold uppercase tracking-wider text-ink transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            {added ? "Нэмэгдлээ ✓" : "Сагсанд нэмэх"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
