"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createManualOrder } from "@/actions/inventory";
import { formatMnt, formatKg } from "@/lib/validations";

type P = {
  id: string;
  name: string;
  pricePerKg: number;
  stockKg: number;
  isAvailable: boolean;
};

export function ManualOrderForm({ products }: { products: P[] }) {
  const router = useRouter();
  const [items, setItems] = useState<{ product_id: string; quantity_kg: number }[]>([]);
  const [selected, setSelected] = useState("");
  const [qty, setQty] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const productMap = new Map(products.map((p) => [p.id, p]));

  const addItem = () => {
    if (!selected) return;
    const q = Number(qty);
    const p = productMap.get(selected);
    if (!p || q <= 0) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === selected);
      if (existing) {
        return prev.map((i) =>
          i.product_id === selected
            ? { ...i, quantity_kg: i.quantity_kg + q }
            : i,
        );
      }
      return [...prev, { product_id: selected, quantity_kg: q }];
    });
    setSelected("");
    setQty("1");
  };

  const subtotal = items.reduce((s, i) => {
    const p = productMap.get(i.product_id);
    return s + (p ? Math.round(p.pricePerKg * i.quantity_kg) : 0);
  }, 0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    start(async () => {
      const res = await createManualOrder(formData, JSON.stringify(items));
      if (res.error) setError(res.error);
      else if (res.orderId) router.push(`/admin/orders/${res.orderId}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <section className="rounded-md border border-line bg-surface p-5">
        <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
          Харилцагч
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label>Овог нэр</label>
            <input name="customer_name" required placeholder="Бат" />
          </div>
          <div>
            <label>Утас</label>
            <input name="phone" required inputMode="numeric" maxLength={8} placeholder="99112233" />
          </div>
          <div className="sm:col-span-2">
            <label>Хаяг</label>
            <textarea name="address" required rows={2} />
          </div>
          <div className="sm:col-span-2">
            <label>Тэмдэглэл</label>
            <textarea name="note" rows={2} placeholder="Заавал биш" />
          </div>
        </div>
      </section>

      <section className="rounded-md border border-line bg-surface p-5">
        <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
          Бүтээгдэхүүн
        </h2>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div className="min-w-48 flex-1">
            <label>Бүтээгдэхүүн</label>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">Сонгох...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatMnt(p.pricePerKg)}/кг
                </option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <label>кг</label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
          <button type="button" onClick={addItem} className="btn-secondary py-2.5 text-xs">
            + Нэмэх
          </button>
        </div>

        {items.length > 0 && (
          <ul className="mt-4 divide-y divide-line text-sm">
            {items.map((i) => {
              const p = productMap.get(i.product_id)!;
              return (
                <li key={i.product_id} className="flex items-center justify-between py-2.5">
                  <span>
                    {p.name} <span className="text-mute">× {i.quantity_kg} кг</span>
                  </span>
                  <span className="flex items-center gap-3">
                    {formatMnt(Math.round(p.pricePerKg * i.quantity_kg))}
                    <button
                      type="button"
                      onClick={() =>
                        setItems((prev) => prev.filter((x) => x.product_id !== i.product_id))
                      }
                      className="text-xs text-mute hover:text-blood"
                    >
                      Хасах
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        {items.length > 0 && (
          <div className="mt-3 flex justify-between border-t border-line pt-3 text-sm font-semibold">
            <span>Нийт</span>
            <span>{formatMnt(subtotal)}</span>
          </div>
        )}
      </section>

      <section className="rounded-md border border-line bg-surface p-5">
        <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
          Төлбөр
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label>Төлбөрийн арга</label>
            <select name="payment_method" defaultValue="cash">
              <option value="cash">Бэлэн мөнгө</option>
              <option value="wire">Wire</option>
              <option value="other">Бусад</option>
            </select>
          </div>
          <div>
            <label>Төлбөрийн төлөв</label>
            <select name="payment_status" defaultValue="pending">
              <option value="pending">Хүлээгдэж байна</option>
              <option value="paid">Төлөгдсөн</option>
            </select>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-sm border border-blood/30 bg-blood/10 px-4 py-3 text-sm text-cream">
          {error}
        </div>
      )}

      <button type="submit" disabled={pending || items.length === 0} className="btn-primary w-full">
        {pending ? "Үүсгэж байна..." : "Захиалга үүсгэх"}
      </button>
    </form>
  );
}
