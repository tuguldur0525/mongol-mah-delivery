"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProductBundle } from "@/actions/bundles";
import type { ProductBundle } from "@/types";

type BundleProductOption = {
  id: string;
  name: string;
  is_available: boolean;
};

type BundleItemForm = { product_id: string; quantity_kg: number };

export function ProductBundleForm({
  products,
  bundle,
}: {
  products: BundleProductOption[];
  bundle?: ProductBundle;
}) {
  const router = useRouter();
  const [items, setItems] = useState<BundleItemForm[]>(
    bundle?.product_bundle_items.map((item) => ({
      product_id: item.product_id,
      quantity_kg: Number(item.quantity_kg),
    })) ?? [],
  );
  const [selected, setSelected] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const productMap = new Map(products.map((product) => [product.id, product]));

  const addItem = () => {
    const amount = Number(quantity);
    if (!selected || !Number.isFinite(amount) || amount <= 0) return;
    setItems((current) => {
      const existing = current.find((item) => item.product_id === selected);
      return existing
        ? current.map((item) =>
            item.product_id === selected
              ? { ...item, quantity_kg: item.quantity_kg + amount }
              : item,
          )
        : [...current, { product_id: selected, quantity_kg: amount }];
    });
    setSelected("");
    setQuantity("1");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    formData.set("items", JSON.stringify(items));
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
        <h2 className="text-sm font-semibold">Багцын мэдээлэл</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name">Багцын нэр</label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={100}
              defaultValue={bundle?.name}
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
        <label className="mt-4 flex cursor-pointer items-center gap-2 !mb-0">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={bundle?.is_active ?? true}
            className="h-4 w-4"
          />
          <span className="text-sm">Дэлгүүрт харуулах</span>
        </label>
      </section>

      <section className="rounded-md border border-border bg-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Багцын бүрэлдэхүүн</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Нэг багцад орох бүтээгдэхүүн бүрийн хэмжээг кг-аар оруулна.
            </p>
          </div>
          <div className="flex w-full flex-wrap items-end gap-2 sm:w-auto">
            <div className="min-w-48 flex-1 sm:flex-none">
              <label htmlFor="component_product">Бүтээгдэхүүн</label>
              <select
                id="component_product"
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
              >
                <option value="">Сонгох...</option>
                {products
                  .filter(
                    (product) =>
                      !items.some((item) => item.product_id === product.id),
                  )
                  .map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                      {product.is_available ? "" : " · Идэвхгүй"}
                    </option>
                  ))}
              </select>
            </div>
            <div className="w-24">
              <label htmlFor="component_quantity">Кг</label>
              <input
                id="component_quantity"
                type="number"
                min={0.01}
                max={1000}
                step={0.01}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={addItem}
              disabled={!selected}
              className="btn-secondary py-2.5 text-xs disabled:opacity-40"
            >
              Бүрэлдэхүүн нэмэх
            </button>
          </div>
        </div>

        {items.length ? (
          <ul className="mt-4 divide-y divide-border">
            {items.map((item) => {
              const product = productMap.get(item.product_id);
              return (
                <li
                  key={item.product_id}
                  className="flex flex-wrap items-center gap-3 py-3"
                >
                  <span className="min-w-36 flex-1 text-sm font-medium">
                    {product?.name ?? "Бүтээгдэхүүн олдсонгүй"}
                  </span>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Кг</span>
                    <input
                      aria-label={`${product?.name ?? "Бүтээгдэхүүн"} кг`}
                      type="number"
                      min={0.01}
                      max={1000}
                      step={0.01}
                      value={item.quantity_kg}
                      onChange={(event) => {
                        const amount = Number(event.target.value);
                        setItems((current) =>
                          current.map((entry) =>
                            entry.product_id === item.product_id
                              ? { ...entry, quantity_kg: amount }
                              : entry,
                          ),
                        );
                      }}
                      className="!w-24"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setItems((current) =>
                        current.filter(
                          (entry) => entry.product_id !== item.product_id,
                        ),
                      )
                    }
                    className="text-xs text-destructive hover:underline"
                  >
                    Хасах
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
            Одоогоор бүтээгдэхүүн нэмээгүй байна.
          </p>
        )}
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
        disabled={pending || items.length === 0}
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
