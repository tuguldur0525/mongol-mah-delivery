"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/store/cart";
import { createOrderAndPayment } from "@/actions/orders";
import { validatePromoCode } from "@/actions/promos";
import type { PromoValidationResult } from "@/actions/promos";
import { calculatePromoDiscount, formatMnt, formatKg } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { FREE_DELIVERY_THRESHOLD, getDeliveryFee } from "@/lib/delivery";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [redirecting, setRedirecting] = useState(false);
  const [configuredFee, setConfiguredFee] = useState(5000);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Extract<
    PromoValidationResult,
    { ok: true }
  > | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [checkingPromo, startPromoCheck] = useTransition();

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
  const discountAmount = appliedPromo
    ? calculatePromoDiscount(
        cartTotal,
        appliedPromo.totalKg,
        appliedPromo.discountPerKg,
      )
    : 0;
  const totalWithDelivery = cartTotal - discountAmount + deliveryFee;
  const isFree = cartTotal >= FREE_DELIVERY_THRESHOLD;

  const getCartJson = () =>
    JSON.stringify(
      items.map((item) =>
        item.bundleId
          ? { bundleId: item.bundleId, quantityKg: item.quantityKg }
          : { productId: item.productId, quantityKg: item.quantityKg },
      ),
    );

  const handleApplyPromo = () => {
    setPromoError(null);
    setAppliedPromo(null);
    startPromoCheck(async () => {
      const result = await validatePromoCode(promoInput, getCartJson());
      if (!result.ok) {
        setPromoError(result.error);
        return;
      }
      setAppliedPromo(result);
    });
  };

  const handleRemovePromo = () => {
    setPromoInput("");
    setAppliedPromo(null);
    setPromoError(null);
  };

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
    const cartJson = getCartJson();

    startTransition(async () => {
      const result = await createOrderAndPayment(
        formData,
        cartJson,
        promoInput,
      );
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
                key={i.bundleId ?? i.productId}
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
          <div className="mt-4 border-t border-border pt-4">
            <label htmlFor="promo_code">Промо код</label>
            <div className="mt-1 flex gap-2">
              <input
                id="promo_code"
                value={promoInput}
                onChange={(event) => {
                  setPromoInput(event.target.value.toUpperCase());
                  setAppliedPromo(null);
                  setPromoError(null);
                }}
                placeholder="PROMOCODE2026"
                maxLength={32}
                autoCapitalize="characters"
                autoComplete="off"
                className="min-w-0 flex-1"
              />
              {appliedPromo ? (
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="btn-secondary shrink-0"
                >
                  Арилгах
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={checkingPromo || !promoInput.trim()}
                  className="btn-secondary shrink-0 disabled:opacity-50"
                >
                  {checkingPromo ? "Шалгаж байна..." : "Хэрэглэх"}
                </button>
              )}
            </div>
            {promoError && (
              <p role="alert" className="mt-2 text-xs text-blood">
                {promoError}
              </p>
            )}
            {appliedPromo && (
              <p role="status" className="mt-2 text-xs text-green-600">
                {appliedPromo.code} код — {formatKg(appliedPromo.totalKg)} ×{" "}
                {formatMnt(appliedPromo.discountPerKg)}/кг ={" "}
                {formatMnt(discountAmount)} хямдрал.
              </p>
            )}
          </div>
          <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Бүтээгдэхүүн</span>
              <span>{formatMnt(cartTotal)}</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-green-600">
                <span>Промо хямдрал ({appliedPromo.code})</span>
                <span>−{formatMnt(discountAmount)}</span>
              </div>
            )}
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
          disabled={
            pending ||
            redirecting ||
            (Boolean(promoInput.trim()) &&
              appliedPromo?.code !== promoInput.trim().toUpperCase())
          }
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
