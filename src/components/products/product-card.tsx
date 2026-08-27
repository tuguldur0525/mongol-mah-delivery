"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/store/cart";
import { formatMnt } from "@/lib/validations";
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
      <div className={`flex items-center justify-center bg-card ${className ?? ""}`}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-border">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }
  return (
    <Image src={src} alt={alt} fill sizes="(max-width: 768px) 50vw, 25vw" className={`object-cover ${className ?? ""}`} />
  );
}

export function ProductCard({
  product,
}: {
  product: ProductWithCategory;
  index?: number;
}) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  const outOfStock = !product.is_available || product.stock_kg <= 0;
  const lowStock = !outOfStock && product.stock_kg <= product.low_stock_threshold;

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
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:border-primary/40 hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <ProductImage src={product.image_url} alt={product.name} className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
          {product.stock_kg > 20 && !outOfStock && (
            <span className="absolute left-3 top-3 rounded-sm bg-primary px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-primary-foreground">
              Онцлох
            </span>
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <span className="rounded-sm bg-destructive px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">Дууссан</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <p className="text-xs text-muted-foreground">{product.categories?.name ?? ""}</p>
        <Link href={`/products/${product.slug}`} className="mt-1 block text-sm font-semibold hover:text-primary transition-colors">
          {product.name}
        </Link>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-lg font-bold">{formatMnt(product.price_per_kg)}</span>
          <span className="text-xs text-muted-foreground">/ кг</span>
        </div>

        <p className={`mt-1 text-xs ${outOfStock ? "text-destructive font-medium" : lowStock ? "text-orange-400" : "text-muted-foreground"}`}>
          {outOfStock ? "Дууссан" : lowStock ? `Багахан үлдсэн · ${product.stock_kg} кг` : `Байгаа · ${product.stock_kg} кг`}
        </p>

        {!outOfStock && (
          <div className="mt-3 flex items-center justify-between rounded-md border border-border bg-background p-1">
            <button
              onClick={() => setQty((q) => Math.max(0.5, q - 0.5))}
              className="grid size-7 place-items-center rounded text-sm hover:bg-accent"
              aria-label="Хасах"
            >
              −
            </button>
            <span className="text-xs font-semibold">{qty} кг · {formatMnt(Math.round(product.price_per_kg * qty))}</span>
            <button
              onClick={() => setQty((q) => Math.min(product.stock_kg, q + 0.5))}
              className="grid size-7 place-items-center rounded text-sm hover:bg-accent"
              aria-label="Нэмэх"
            >
              +
            </button>
          </div>
        )}
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className={`mt-3 w-full rounded-md py-2 text-sm font-semibold transition-colors ${outOfStock ? "bg-muted text-muted-foreground cursor-not-allowed" : added ? "bg-green-600 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
        >
          {outOfStock ? "Дууссан" : added ? "Нэмэгдлээ ✓" : "Сагсанд нэмэх"}
        </button>
      </div>
    </div>
  );
}
