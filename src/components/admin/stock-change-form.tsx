"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addStock, adjustStock } from "@/actions/inventory";

export function StockChangeForm({
  productId,
  mode,
}: {
  productId: string;
  mode: "in" | "adjust";
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, start] = useTransition();

  const isIn = mode === "in";
  const reasons = isIn
    ? ["Шинэ мах ирсэн", "Нийлүүлэгчийн хүргэлт", "Буцаалт", "Гараар"]
    : ["Жингийн зөрүү", "Гэмтсэн", "Дууссан", "Гараар"];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    formData.set("product_id", productId);
    start(async () => {
      const res = isIn ? await addStock(formData) : await adjustStock(formData);
      if (res.error) setError(res.error);
      else {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-line bg-surface p-5">
      <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
        {isIn ? "Үлдэгдэл нэмэх" : "Үлдэгдэл тохируулах"}
      </h2>
      <div className="mt-4 space-y-4">
        <div>
          <label>Хэмжээ (кг)</label>
          {isIn ? (
            <input name="quantity_kg" type="number" min={0.01} step={0.01} required />
          ) : (
            <div className="flex gap-2">
              <select name="direction" defaultValue="minus" className="!w-20">
                <option value="minus">−</option>
                <option value="plus">+</option>
              </select>
              <input name="quantity_kg" type="number" min={0.01} step={0.01} required />
            </div>
          )}
        </div>
        <div>
          <label>Шалтгаан</label>
          <select name="reason" required defaultValue={reasons[0]}>
            {reasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Тэмдэглэл</label>
          <input name="note" placeholder="Нэмэлт мэдээлэл" />
        </div>
      </div>
      {error && (
        <div className="mt-3 rounded-sm border border-blood/30 bg-blood/10 px-3 py-2 text-sm text-cream">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-3 rounded-sm border border-fresh/30 bg-fresh/10 px-3 py-2 text-sm text-cream">
          Амжилттай
        </div>
      )}
      <button type="submit" disabled={pending} className="btn-primary mt-4 w-full">
        {pending ? "Хадгалж байна..." : isIn ? "Нэмэх" : "Тохируулах"}
      </button>
    </form>
  );
}
