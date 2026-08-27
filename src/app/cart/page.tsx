"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/store/cart";
import { ProductImage } from "@/components/products/product-card";
import { formatMnt, formatKg } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { FREE_DELIVERY_THRESHOLD, getDeliveryFee } from "@/lib/delivery";

export default function CartPage() {
  const { items, removeItem, setQuantity, subtotal } = useCart();
  const total = subtotal();
  const [configuredFee, setConfiguredFee] = useState(5000);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("store_settings")
      .select("delivery_fee")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data?.delivery_fee != null) setConfiguredFee(data.delivery_fee);
      });
  }, []);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-line bg-surface">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-mute"
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </div>
        <p className="font-display text-xl font-bold">Сагс хоосон байна</p>
        <p className="mt-1 text-sm text-mute">
          Махныхаа дуртай сортыг сонгоод эхэлцгээе.
        </p>
        <Link href="/products" className="btn-primary mt-6">
          Бүтээгдэхүүн үзэх
        </Link>
      </div>
    );
  }

  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - total);
  const progress = Math.min(100, Math.round((total / FREE_DELIVERY_THRESHOLD) * 100));
  const isFree = total >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = getDeliveryFee(total, configuredFee);
  const totalWithDelivery = total + deliveryFee;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-display text-2xl">Сагс</h1>
        <span className="text-xs text-muted-foreground">{items.length} бүтээгдэхүүн</span>
      </div>

      {/* Free delivery progress - inspired by primeat banner, our palette */}
      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className={isFree ? "font-semibold text-green-600" : "text-muted-foreground"}>
            {isFree ? "✓ Хүргэлт үнэгүй боллоо!" : `Хүргэлт үнэгүй болоход ${formatMnt(remaining)} дутуу`}
          </span>
          <span className="text-xs text-muted-foreground">{formatMnt(total)} / {formatMnt(FREE_DELIVERY_THRESHOLD)}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        {!isFree && <p className="mt-2 text-xs text-muted-foreground">{formatMnt(FREE_DELIVERY_THRESHOLD)} дээш бол хүргэлт үнэгүй.</p>}
      </div>

      <div className="mt-6 divide-y divide-line">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.productId}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-4 py-5"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-coal"
              >
                <ProductImage src={item.imageUrl} alt={item.name} className="h-full w-full" />
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-sm font-medium text-cream hover:text-bone"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-mute">
                      {formatMnt(item.pricePerKg)} / кг
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="shrink-0 text-xs text-mute hover:text-blood"
                  >
                    Устгах
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={() => setQuantity(item.productId, item.quantityKg - 0.5)}
                      className="flex h-8 w-8 items-center justify-center border border-line text-sm text-bone hover:border-bone"
                    >
                      −
                    </button>
                    <span className="flex h-8 w-14 items-center justify-center border-y border-line text-xs font-semibold">
                      {formatKg(item.quantityKg)}
                    </span>
                    <button
                      onClick={() => setQuantity(item.productId, item.quantityKg + 0.5)}
                      disabled={item.quantityKg >= item.stockKg}
                      className="flex h-8 w-8 items-center justify-center border border-line text-sm text-bone hover:border-bone disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatMnt(Math.round(item.pricePerKg * item.quantityKg))}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 border-t border-border pt-5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Бүтээгдэхүүний дүн</span>
          <span className="font-medium">{formatMnt(total)}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-muted-foreground">Хүргэлтийн төлбөр</span>
          {isFree ? (
            <span className="font-semibold text-green-600">Үнэгүй</span>
          ) : (
            <span className="font-medium">{formatMnt(deliveryFee)}</span>
          )}
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3">
          <span className="text-sm font-semibold">Нийт</span>
          <span className="text-display text-lg font-bold">{formatMnt(totalWithDelivery)}</span>
        </div>
        {isFree && <p className="mt-1 text-right text-xs text-green-600">100&apos;000₮ дээш захиалга — хүргэлт үнэгүй</p>}
        <Link href="/checkout" className="btn-primary mt-4 block w-full">
          Захиалга үргэлжлүүлэх
        </Link>
        <Link
          href="/products"
          className="mt-3 block text-center text-xs text-mute hover:text-cream"
        >
          Үргэлжлүүлэн худалдан авах
        </Link>
      </div>
    </div>
  );
}
