"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getOrdersByPhone } from "@/actions/orders";
import { formatMnt } from "@/lib/validations";
import { ORDER_STATUS_LABELS } from "@/components/order/status";
import type { OrderWithItems } from "@/types";

export default function TrackPage() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [phoneOrders, setPhoneOrders] = useState<OrderWithItems[] | null>(null);
  const [pending, startTransition] = useTransition();

  const isPhone = (v: string) => /^\d{8}$/.test(v.replace(/\D/g, "").slice(-8));
  const isOrder = (v: string) => /^ORD-[A-Z0-9-]+$/i.test(v);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = value.trim();
    if (!raw) {
      setError("Захиалгын дугаар эсвэл утасны дугаараа оруулна уу");
      return;
    }

    const cleanedPhone = raw.replace(/\D/g, "").slice(-8);
    const v = raw.toUpperCase();

    if (isOrder(v)) {
      setError(null);
      setPhoneOrders(null);
      router.push(`/track/${encodeURIComponent(v)}`);
      return;
    }

    if (isPhone(raw)) {
      setError(null);
      startTransition(async () => {
        const orders = await getOrdersByPhone(cleanedPhone);
        if (orders.length === 0) {
          setError("Энэ утсаар захиалга олдсонгүй");
          setPhoneOrders([]);
        } else if (orders.length === 1) {
          // Single order — go directly
          router.push(`/track/${encodeURIComponent(orders[0].order_number)}`);
        } else {
          setPhoneOrders(orders);
        }
      });
      return;
    }

    setError("Формат буруу. Жишээ: ORD-20260101-1A2B3C эсвэл 99112233");
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16 md:py-24">
      <p className="eyebrow text-primary">Хяналт</p>
      <h1 className="mt-2 text-display text-3xl tracking-tight md:text-4xl">
        Захиалга хайх
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Захиалгын дугаар
        <span className="font-mono text-foreground"> ORD-...</span> эсвэл{" "}
        <span className="font-medium text-foreground">
          захиалга хийх үед ашигласан гар утасны дугаараа
        </span>{" "}
        ашиглан захиалгын явцыг хянах боломжтой.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-xl border border-border bg-card p-5 shadow-card"
        noValidate
      >
        <label htmlFor="order_number" className="eyebrow">
          Захиалгын дугаар / Утас
        </label>
        <input
          id="order_number"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          placeholder="ORD-... эсвэл 99112233"
          autoComplete="off"
          autoFocus
          className="mt-2"
          required
        />
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="btn-primary mt-4 w-full"
        >
          {pending ? "Хайж байна..." : "Хайх"}
        </button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Жишээ: ORD-20260101-1A2B3C эсвэл 8 оронтой утас
        </p>
      </form>

      {phoneOrders && phoneOrders.length > 1 && (
        <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-card">
          <h2 className="eyebrow">Таны захиалгууд ({phoneOrders.length})</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Утасаар олдсон сүүлийн захиалгууд — дарж дэлгэрэнгүй харна уу.
          </p>
          <ul className="mt-4 divide-y divide-border">
            {phoneOrders.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/track/${o.order_number}`}
                    className="font-mono text-sm font-medium hover:text-primary"
                  >
                    {o.order_number}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString("mn-MN", {
                      timeZone: "Asia/Ulaanbaatar",
                    })}{" "}
                    · {formatMnt(o.total_amount)}
                  </p>
                </div>
                <span
                  className={`tag shrink-0 ${o.order_status === "cancelled" ? "tag-red" : o.order_status === "delivered" ? "tag-green" : "tag-muted"}`}
                >
                  {ORDER_STATUS_LABELS[o.order_status]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Дугаараа мартсан уу?{" "}
        <a
          href="tel:99112233"
          className="text-foreground hover:text-primary hover:underline"
        >
          9911-2233
        </a>{" "}
        руу залгана уу
      </p>

      <Link
        href="/products"
        className="mt-8 block text-center text-sm text-muted-foreground hover:text-foreground"
      >
        Бүтээгдэхүүн рүү буцах →
      </Link>
    </div>
  );
}
