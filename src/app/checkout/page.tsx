"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/lib/store/cart";
import { createOrderAndPayment } from "@/actions/orders";
import { formatMnt, formatKg } from "@/lib/validations";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [redirecting, setRedirecting] = useState(false);

  const cartTotal = subtotal();

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
        clear();
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
        Нэвтрэх шаардлагагүй. Wire төлбөрийн системээр төлнө.
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
                placeholder="БЗД, 15-р хороо, ... байр, орц ..."
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

        <section className="rounded-md border border-line bg-surface p-5">
          <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
            Захиалга
          </h2>
          <ul className="mt-3 divide-y divide-line">
            {items.map((i) => (
              <li
                key={i.productId}
                className="flex justify-between py-2.5 text-sm"
              >
                <span className="text-bone">
                  {i.name}{" "}
                  <span className="text-mute">× {formatKg(i.quantityKg)}</span>
                </span>
                <span>{formatMnt(Math.round(i.pricePerKg * i.quantityKg))}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-line pt-3">
            <span className="text-sm font-semibold">Нийт дүн</span>
            <span className="font-display text-lg font-bold">
              {formatMnt(cartTotal)}
            </span>
          </div>
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
          {pending || redirecting
            ? "Төлбөр үүсгэж байна..."
            : "Wire төлбөрөөр төлөх"}
        </button>
        <p className="text-center text-[0.6875rem] text-mute">
          Таны карт болон банкины мэдээллийг бид хадгалдаггүй.
        </p>
      </form>
    </div>
  );
}
