"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function PaymentStatusPoller({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const attempts = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      attempts.current += 1;
      if (attempts.current > 20) {
        clearInterval(id);
        return;
      }
      router.refresh();
    }, 3000);
    return () => clearInterval(id);
  }, [router, orderNumber]);

  return null;
}
