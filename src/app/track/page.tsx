"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TrackPage() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim().toUpperCase();
    if (!v) {
      setError("Захиалгын дугаараа оруулна уу");
      return;
    }
    // ORD-YYYYMMDD-XXXXXX format, but allow any ORD- prefix for flexibility
    if (!/^ORD-[A-Z0-9-]+$/.test(v)) {
      setError("Дугаарын формат буруу байна. Жишээ: ORD-20260101-1A2B3C");
      return;
    }
    setError(null);
    router.push(`/track/${encodeURIComponent(v)}`);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16 md:py-24">
      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-blood">
        Хяналт
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
        Захиалга хайх
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-mute">
        Захиалга үүсгэхэд гарсан дугаараа оруулна уу. Жишээ:{" "}
        <span className="font-mono text-bone">ORD-20260101-1A2B3C</span>
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-md border border-line bg-surface p-5"
        noValidate
      >
        <label htmlFor="order_number" className="text-sm font-medium">
          Захиалгын дугаар
        </label>
        <input
          id="order_number"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          placeholder="ORD-..."
          autoComplete="off"
          autoFocus
          className="mt-2"
          required
        />
        {error && <p className="mt-2 text-sm text-blood">{error}</p>}
        <button type="submit" className="btn-primary mt-4 w-full">
          Хайх
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-mute">
        Дугаараа мартсан уу?{" "}
        <a href="tel:99112233" className="text-bone hover:text-cream hover:underline">
          9911-2233
        </a>{" "}
        руу залгана уу
      </p>

      <Link
        href="/products"
        className="mt-8 block text-center text-sm text-mute hover:text-cream"
      >
        Бүтээгдэхүүн рүү буцах →
      </Link>
    </div>
  );
}
