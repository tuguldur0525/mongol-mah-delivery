"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/actions/products";
import type { Category, Product } from "@/types";

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    start(async () => {
      const res = product
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);
      if (res.error) setError(res.error);
      else {
        router.push("/admin/products");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <section className="rounded-md border border-line bg-surface p-5">
        <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
          Ерөнхий мэдээлэл
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="name">Нэр</label>
            <input id="name" name="name" required defaultValue={product?.name} />
          </div>
          <div>
            <label htmlFor="category_id">Ангилал</label>
            <select id="category_id" name="category_id" required defaultValue={product?.category_id}>
              <option value="">Сонгох...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="description">Тайлбар</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={product?.description ?? ""}
            />
          </div>
        </div>
      </section>

      <section className="rounded-md border border-line bg-surface p-5">
        <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
          Үнэ ба үлдэгдэл
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="price_per_kg">Үнэ /кг (₮)</label>
            <input
              id="price_per_kg"
              name="price_per_kg"
              type="number"
              min={1}
              required
              defaultValue={product?.price_per_kg}
            />
          </div>
          <div>
            <label htmlFor="stock_kg">Үлдэгдэл (кг)</label>
            <input
              id="stock_kg"
              name="stock_kg"
              type="number"
              min={0}
              step={0.01}
              required
              defaultValue={product?.stock_kg ?? 0}
            />
          </div>
          <div>
            <label htmlFor="low_stock_threshold">Бага үлдэгдлийн босго</label>
            <input
              id="low_stock_threshold"
              name="low_stock_threshold"
              type="number"
              min={0}
              step={0.01}
              defaultValue={product?.low_stock_threshold ?? 5}
            />
          </div>
          <div>
            <label htmlFor="image_url">Зурагны URL</label>
            <input
              id="image_url"
              name="image_url"
              defaultValue={product?.image_url ?? ""}
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex cursor-pointer items-center gap-2 !mb-0">
            <input
              type="checkbox"
              name="is_available"
              defaultChecked={product?.is_available ?? true}
              className="h-4 w-4"
            />
            <span className="text-sm">Захиалах боломжтой</span>
          </label>
        </div>
      </section>

      {error && (
        <div className="rounded-md border border-blood/30 bg-blood/10 px-4 py-3 text-sm text-cream">
          {error}
        </div>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Хадгалж байна..." : product ? "Хадгалах" : "Нэмэх"}
      </button>
    </form>
  );
}
