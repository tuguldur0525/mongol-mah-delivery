"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/store/cart";
import { formatMnt } from "@/lib/validations";
import type { Product } from "@/types";

const PRESETS = [0.5, 1, 2, 5];

export function AddToCartPanel({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [custom, setCustom] = useState("");
  const [added, setAdded] = useState(false);

  const outOfStock = !product.is_available || product.stock_kg <= 0;
  const max = product.stock_kg;
  const effectiveQty = custom !== "" ? Number(custom) : qty;
  const subtotal = Math.round(product.price_per_kg * (effectiveQty || 0));

  const setQuantity = (v: number) => {
    setCustom("");
    setQty(Math.min(Math.max(v, 0.5), max));
  };

  const handleAdd = () => {
    if (outOfStock || effectiveQty <= 0 || effectiveQty > max) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        pricePerKg: product.price_per_kg,
        imageUrl: product.image_url,
        stockKg: max,
      },
      effectiveQty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (outOfStock) {
    return (
      <div className="rounded-md border border-line bg-surface p-6">
        <p className="text-center text-sm text-mute">
          Энэ бүтээгдэхүүн одоогоор дууссан байна.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-line bg-surface p-5">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-2xl font-bold">
          {formatMnt(product.price_per_kg)}
          <span className="ml-1 text-xs font-normal text-mute">/ кг</span>
        </span>
        <span className="text-xs text-mute">
          Үлдэгдэл: {product.stock_kg} кг
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setQuantity(p)}
            disabled={p > max}
            className={`rounded-sm border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-30 ${
              custom === "" && qty === p
                ? "border-blood bg-blood text-white"
                : "border-line text-bone hover:border-bone"
            }`}
          >
            {p} кг
          </button>
        ))}
        <div className="relative">
          <input
            type="number"
            min={0.5}
            step={0.5}
            max={max}
            placeholder="Бусад"
            value={custom}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v > max) return setCustom(String(max));
              setCustom(e.target.value);
            }}
            className="!w-24 text-sm"
          />
          {custom !== "" && (
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-mute">
              кг
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-line pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0">
            <button
              onClick={() => setQuantity(effectiveQty - 0.5)}
              className="flex h-10 w-10 items-center justify-center border border-line text-lg text-bone transition-colors hover:border-bone"
            >
              −
            </button>
            <span className="flex h-10 w-16 items-center justify-center border-y border-line text-sm font-semibold">
              {effectiveQty} кг
            </span>
            <button
              onClick={() => setQuantity(effectiveQty + 0.5)}
              disabled={effectiveQty >= max}
              className="flex h-10 w-10 items-center justify-center border border-line text-lg text-bone transition-colors hover:border-bone disabled:opacity-30"
            >
              +
            </button>
          </div>
          <div className="text-right">
            <p className="text-[0.6875rem] uppercase text-mute">Нийт</p>
            <p className="font-display text-xl font-bold">
              {formatMnt(subtotal)}
            </p>
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleAdd}
        disabled={effectiveQty <= 0 || effectiveQty > max}
        className="btn-primary mt-4 w-full"
      >
        {added ? "Сагсанд нэмэгдлээ ✓" : "Сагсанд нэмэх"}
      </motion.button>
    </div>
  );
}
