"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePromoCode, togglePromoCode } from "@/actions/promos";
import { formatKg, formatMnt } from "@/lib/validations";

export type PromoCodeRecord = {
  id: string;
  code: string;
  discount_per_kg: number;
  minimum_kg: number;
  is_active: boolean;
};

function PromoCodeForm({ promo }: { promo?: PromoCodeRecord }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await savePromoCode(promo?.id ?? null, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (!promo) form.reset();
      setSuccess(true);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={`${promo?.id ?? "new"}-code`}>Промо код</label>
          <input
            id={`${promo?.id ?? "new"}-code`}
            name="code"
            required
            minLength={3}
            maxLength={32}
            pattern="[A-Za-z0-9_-]+"
            defaultValue={promo?.code ?? ""}
            placeholder="PROMO2026"
            autoCapitalize="characters"
          />
        </div>
        <div>
          <label htmlFor={`${promo?.id ?? "new"}-discount`}>
            Хямдрал (₮ / кг)
          </label>
          <input
            id={`${promo?.id ?? "new"}-discount`}
            name="discount_per_kg"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={promo?.discount_per_kg ?? ""}
          />
        </div>
        <div>
          <label htmlFor={`${promo?.id ?? "new"}-minimum`}>
            Доод хэмжээ (кг)
          </label>
          <input
            id={`${promo?.id ?? "new"}-minimum`}
            name="minimum_kg"
            type="number"
            min={0.01}
            max={10000}
            step={0.01}
            required
            defaultValue={promo?.minimum_kg ?? 50}
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-blood">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-fresh">
          Хадгалагдлаа
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-secondary">
        {pending
          ? "Хадгалж байна..."
          : promo
            ? "Өөрчлөлт хадгалах"
            : "Промо код нэмэх"}
      </button>
    </form>
  );
}

function PromoCodeRow({ promo }: { promo: PromoCodeRecord }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleToggle = () => {
    setError(null);
    startTransition(async () => {
      const result = await togglePromoCode(promo.id, !promo.is_active);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-xl font-bold">{promo.code}</h3>
          <span className={promo.is_active ? "tag tag-green" : "tag tag-muted"}>
            {promo.is_active ? "Идэвхтэй" : "Идэвхгүй"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {pending
            ? "Шинэчилж байна..."
            : promo.is_active
              ? "Идэвхгүй болгох"
              : "Идэвхжүүлэх"}
        </button>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        {formatMnt(promo.discount_per_kg)} / кг · доод хэмжээ{" "}
        {formatKg(promo.minimum_kg)}
      </p>
      <PromoCodeForm promo={promo} />
      {error && (
        <p role="alert" className="mt-3 text-sm text-blood">
          {error}
        </p>
      )}
    </article>
  );
}

export function PromoCodeManager({ promos }: { promos: PromoCodeRecord[] }) {
  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="mb-4 font-display text-xl font-bold">Шинэ промо код</h2>
        <PromoCodeForm />
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold">Бүртгэлтэй кодууд</h2>
        {promos.length ? (
          promos.map((promo) => <PromoCodeRow key={promo.id} promo={promo} />)
        ) : (
          <p className="rounded-xl border border-border py-10 text-center text-sm text-muted-foreground">
            Промо код бүртгэгдээгүй байна.
          </p>
        )}
      </section>
    </div>
  );
}
