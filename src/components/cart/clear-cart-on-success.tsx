"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/store/cart";

export function ClearCartOnSuccess({ isPaid }: { isPaid: boolean }) {
  const clear = useCart((s) => s.clear);
  const items = useCart((s) => s.items);

  useEffect(() => {
    if (isPaid && items.length > 0) {
      clear();
    }
  }, [isPaid, items.length, clear]);

  return null;
}
