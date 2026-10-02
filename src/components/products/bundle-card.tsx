"use client";

import { useState } from "react";
import { useCart } from "@/lib/store/cart";
import { formatKg, formatMnt } from "@/lib/validations";
import type { ProductBundle } from "@/types";
import { ProductImage } from "@/components/products/product-card";

export function BundleCard({ bundle }: { bundle: ProductBundle }) {
  const cartItems = useCart((state) => state.items);
  const addItem = useCart((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const ingredients = bundle.product_bundle_items
    .filter((item) => item.products)
    .map((item) => ({ ...item, product: item.products! }));
  const total = ingredients.reduce(
    (sum, item) =>
      sum + Math.round(item.product.price_per_kg * Number(item.quantity_kg)),
    0,
  );
  const canAdd =
    ingredients.length > 0 &&
    ingredients.every((item) => {
      const existing = cartItems.find((cartItem) => cartItem.productId === item.product_id);
      return (
        item.product.is_available &&
        Number(item.product.stock_kg) >=
          Number(item.quantity_kg) + (existing?.quantityKg ?? 0)
      );
    });

  const handleAdd = () => {
    if (!canAdd) return;
    for (const item of ingredients) {
      addItem(
        {
          productId: item.product.id,
          slug: item.product.slug,
          name: item.product.name,
          pricePerKg: item.product.price_per_kg,
          imageUrl: item.product.image_url,
          stockKg: Number(item.product.stock_kg),
        },
        Number(item.quantity_kg),
      );
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="overflow-hidden rounded-md border border-border bg-card">
      <div className="relative aspect-[16/9] bg-muted">
        <ProductImage
          src={bundle.image_url ?? ingredients[0]?.product.image_url ?? null}
          alt={bundle.name}
          className="h-full w-full"
        />
        {!canAdd && (
          <span className="absolute right-3 top-3 rounded-sm bg-destructive px-2.5 py-1 text-xs font-semibold text-white">
            Одоогоор бүрдэхгүй
          </span>
        )}
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold">{bundle.name}</h2>
        {bundle.description && (
          <p className="mt-1 text-sm text-muted-foreground">{bundle.description}</p>
        )}
        <ul className="mt-4 divide-y divide-border border-y border-border text-sm">
          {ingredients.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 py-2">
              <span>{item.product.name}</span>
              <span className="shrink-0 text-muted-foreground">
                {formatKg(Number(item.quantity_kg))}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Багцын нийт үнэ</p>
            <p className="text-lg font-bold">{formatMnt(total)}</p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-45"
          >
            {added ? "Сагсанд нэмлээ" : "Багц авах"}
          </button>
        </div>
      </div>
    </article>
  );
}