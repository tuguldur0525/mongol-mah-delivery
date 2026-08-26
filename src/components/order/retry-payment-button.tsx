"use client";

import { useState, useTransition } from "react";
import { retryPayment } from "@/actions/orders";

export function RetryPaymentButton({ orderNumber }: { orderNumber: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRetry = () => {
    setError(null);
    startTransition(async () => {
      const result = await retryPayment(orderNumber);
      if (result.ok && result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        setError(result.error ?? "Алдаа гарлаа");
      }
    });
  };

  return (
    <div className="mt-3">
      <button
        onClick={handleRetry}
        disabled={pending}
        className="btn-primary w-full"
      >
        {pending ? "Төлбөр үүсгэж байна..." : "Дахин төлбөр төлөх"}
      </button>
      {error && <p className="mt-2 text-sm text-blood">{error}</p>}
    </div>
  );
}
