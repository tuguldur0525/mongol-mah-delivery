"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/lib/store/cart";
import { createOrderAndPayment } from "@/actions/orders";
import { formatMnt, formatKg } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { FREE_DELIVERY_THRESHOLD, getDeliveryFee } from "@/lib/delivery";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [redirecting, setRedirecting] = useState(false);
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

  const cartTotal = subtotal();
  const deliveryFee = getDeliveryFee(cartTotal, configuredFee);
  const totalWithDelivery = cartTotal + deliveryFee;
  const isFree = cartTotal >= FREE_DELIVERY_THRESHOLD;

  if (items.length === 0 && !redirecting) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="font-display text-xl font-bold">Сагс хоосон байна</p>
        <Link href="/products" className="btn-primary mt-6">
          Бүтээгдэхүүн үзэх
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const cartJson = JSON.stringify(
      items.map((i) => ({ productId: i.productId, quantityKg: i.quantityKg })),
    );

    startTransition(async () => {
      const result = await createOrderAndPayment(formData, cartJson);
      if (result.ok) {
        // Keep cart until payment is confirmed — do NOT clear here.
        // Success page will clear after webhook marks paid, cancel/failed keeps cart.
        setRedirecting(true);
        window.location.href = result.redirectUrl;
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Захиалга хийх</h1>
        <span className="text-xs text-mute">Алхам 2/2</span>
      </div>
      <p className="mt-1 text-sm text-mute">
        Нэвтрэх шаардлагагүй. Хүссэн банкны аппликейшин болон Qpay ашиглан төлөх
        боломжтой.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <section className="rounded-md border border-line bg-surface p-5">
          <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
            Хүргэлтийн мэдээлэл
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="customer_name">Овог нэр</label>
              <input
                id="customer_name"
                name="customer_name"
                required
                placeholder="Бат"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="phone">Утасны дугаар</label>
              <input
                id="phone"
                name="phone"
                required
                inputMode="numeric"
                pattern="\d{8}"
                maxLength={8}
                placeholder="99112233"
                autoComplete="tel"
              />
            </div>
            <div>
              <label htmlFor="address">Хүргэх хаяг</label>
              <textarea
                id="address"
                name="address"
                required
                rows={2}
                placeholder="СБД, 15-р хороо, ... байр, орц ..."
                autoComplete="street-address"
              />
            </div>
            <div>
              <label htmlFor="note">Нэмэлт тэмдэглэл</label>
              <textarea
                id="note"
                name="note"
                rows={2}
                placeholder="Заавал биш"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="eyebrow">Захиалга</h2>
          <ul className="mt-3 divide-y divide-border">
            {items.map((i) => (
              <li
                key={i.productId}
                className="flex justify-between py-2.5 text-sm"
              >
                <span>
                  {i.name}{" "}
                  <span className="text-muted-foreground">
                    × {formatKg(i.quantityKg)}
                  </span>
                </span>
                <span className="font-medium">
                  {formatMnt(Math.round(i.pricePerKg * i.quantityKg))}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Бүтээгдэхүүн</span>
              <span>{formatMnt(cartTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Хүргэлт</span>
              {isFree ? (
                <span className="font-semibold text-green-600">Үнэгүй</span>
              ) : (
                <span>{formatMnt(deliveryFee)}</span>
              )}
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <span>Нийт</span>
              <span className="text-display text-lg">
                {formatMnt(totalWithDelivery)}
              </span>
            </div>
          </div>
          {isFree ? (
            <p className="mt-2 text-xs text-green-600">
              ✓ {formatMnt(FREE_DELIVERY_THRESHOLD)} дээш — хүргэлт үнэгүй
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              {formatMnt(FREE_DELIVERY_THRESHOLD - cartTotal)} нэмбэл хүргэлт
              үнэгүй
            </p>
          )}
        </section>

        {error && (
          <div className="rounded-md border border-blood/30 bg-blood/10 px-4 py-3 text-sm text-cream">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending || redirecting}
          className="btn-primary w-full"
        >
          {pending || redirecting ? "Төлбөр үүсгэж байна..." : "Төлбөр төлөх"}
        </button>
        <p className="text-center text-[0.6875rem] text-mute">
          Таны карт болон банкины мэдээллийг бид хадгалдаггүй.
        </p>
      </form>
    </div>
  );
}
