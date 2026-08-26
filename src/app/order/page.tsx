"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OrderSearchPage() {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-blood">
        Захиалга
      </p>
      <h1 className="mt-1 font-display text-2xl font-bold">
        Захиалгаа хайх
      </h1>
      <p className="mt-2 text-sm text-mute">
        Захиалгын дугаараа оруулан төлөвийг нь үзнэ үү.
      </p>
      <form
        className="mt-6 rounded-md border border-line bg-surface p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const v = value.trim();
          if (v) router.push(`/order/${encodeURIComponent(v)}`);
        }}
      >
        <label htmlFor="order_number">Захиалгын дугаар</label>
        <input
          id="order_number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          placeholder="ORD-..."
        />
        <button type="submit" className="btn-primary mt-4 w-full">
          Хайх
        </button>
      </form>
      <Link
        href="/products"
        className="mt-6 block text-center text-sm text-mute hover:text-cream"
      >
        Бүтээгдэхүүн рүү буцах
      </Link>
    </div>
  );
}
