"use client";

import { useState } from "react";
import { useCart } from "@/lib/store/cart";
import { formatKg, formatMnt } from "@/lib/validations";
import type { ProductBundle } from "@/types";
import { ProductImage } from "@/components/products/product-card";

export function BundleCard({ bundle }: { bundle: ProductBundle }) {
  const addItem = useCart((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const [weight, setWeight] = useState(String(bundle.min_kg));
  const selectedWeight = Number(weight);
  const canAdd =
    Number.isFinite(selectedWeight) &&
    Number.isInteger(selectedWeight * 100) &&
    selectedWeight >= bundle.min_kg &&
    selectedWeight <= bundle.max_kg;
  const total = canAdd ? Math.round(bundle.price_per_kg * selectedWeight) : 0;

  const handleAdd = () => {
    if (!canAdd) return;
    addItem(
      {
        productId: `bundle:${bundle.id}`,
        bundleId: bundle.id,
        bundleMinKg: bundle.min_kg,
        slug: "bundles",
        name: bundle.name,
        pricePerKg: bundle.price_per_kg,
        imageUrl: bundle.image_url,
        stockKg: bundle.max_kg,
      },
      selectedWeight,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="overflow-hidden rounded-md border border-border bg-card">
      <div className="relative aspect-[16/9] bg-muted">
        <ProductImage
          src={bundle.image_url}
          alt={bundle.name}
          className="h-full w-full"
        />
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold">{bundle.name}</h2>
        {bundle.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {bundle.description}
          </p>
        )}
        <p className="mt-4 border-y border-border py-3 text-sm">
          <span className="font-semibold">
            {formatKg(bundle.min_kg)}–{formatKg(bundle.max_kg)}
          </span>
          {" · "}
          {" · "}
          <span className="font-semibold">
            {formatMnt(bundle.price_per_kg)}/кг
          </span>
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <label htmlFor={`bundle-weight-${bundle.id}`}>Жин (кг)</label>
            <input
              id={`bundle-weight-${bundle.id}`}
              type="number"
              min={bundle.min_kg}
              max={bundle.max_kg}
              step={0.01}
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              className="!w-32"
            />
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Нийт үнэ</p>
            <p className="text-lg font-bold">
              {canAdd ? formatMnt(total) : "Жинг шалгана уу"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-45"
          >
            {added ? "Сагсанд нэмлээ" : "Сагсанд нэмэх"}
          </button>
        </div>
      </div>
    </article>
  );
}
