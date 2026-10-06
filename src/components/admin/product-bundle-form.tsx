"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProductBundle } from "@/actions/bundles";
import type { ProductBundle } from "@/types";

export function ProductBundleForm({ bundle }: { bundle?: ProductBundle }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    start(async () => {
      const result = await saveProductBundle(bundle?.id ?? null, formData);
      if (result.error) setError(result.error);
      else {
        router.push("/admin/bundles");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <section className="rounded-md border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Бүтээгдэхүүний мэдээлэл</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name">Нэр</label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={100}
              defaultValue={bundle?.name}
              placeholder="Жишээ: Үхрийн гуя"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description">Тайлбар</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={bundle?.description ?? ""}
            />
          </div>
          <div>
            <label htmlFor="image_url">Зурагны URL</label>
            <input
              id="image_url"
              name="image_url"
              type="url"
              defaultValue={bundle?.image_url ?? ""}
              placeholder="https://..."
            />
          </div>
          <div>
            <label htmlFor="price_per_kg">Үнэ /кг (₮)</label>
            <input
              id="price_per_kg"
              name="price_per_kg"
              type="number"
              min={1}
              step={1}
              required
              defaultValue={bundle?.price_per_kg}
            />
          </div>
          <div>
            <label htmlFor="min_kg">Хамгийн бага жин (кг)</label>
            <input
              id="min_kg"
              name="min_kg"
              type="number"
              min={0.01}
              max={1000}
              step={0.01}
              required
              defaultValue={bundle?.min_kg}
            />
          </div>
          <div>
            <label htmlFor="max_kg">Хамгийн их жин (кг)</label>
            <input
              id="max_kg"
              name="max_kg"
              type="number"
              min={0.01}
              max={1000}
              step={0.01}
              required
              defaultValue={bundle?.max_kg}
            />
          </div>
          <div>
            <label htmlFor="sort_order">Харагдах дараалал</label>
            <input
              id="sort_order"
              name="sort_order"
              type="number"
              min={0}
              step={1}
              defaultValue={bundle?.sort_order ?? 0}
            />
          </div>
        </div>
        <label className="mt-4 mb-0! flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={bundle?.is_active ?? true}
            className="h-4 w-4"
          />
          <span className="text-sm">Дэлгүүрт харуулах</span>
        </label>
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full disabled:opacity-50"
      >
        {pending
          ? "Хадгалж байна..."
          : bundle
            ? "Багц хадгалах"
            : "Багц үүсгэх"}
      </button>
    </form>
  );
}
