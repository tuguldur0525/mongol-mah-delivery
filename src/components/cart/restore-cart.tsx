"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/store/cart";

type OrderItemSnapshot = {
  product_id: string | null;
  product_name_snapshot: string;
  quantity_kg: number;
  price_per_kg: number;
};

export function RestoreCart({ items }: { items: OrderItemSnapshot[] }) {
  const cartItems = useCart((s) => s.items);
  const addItem = useCart((s) => s.addItem);

  useEffect(() => {
    // If cart was cleared before (old flow) or user cleared, restore from order
    if (cartItems.length > 0) return;
    if (!items.length) return;

    // Restore each order item as cart item. slug/image not critical for checkout continuity;
    // user can adjust kg in cart before retry.
    for (const it of items) {
      if (!it.product_id) continue;
      addItem(
        {
          productId: it.product_id,
          slug: it.product_id,
          name: it.product_name_snapshot,
          pricePerKg: it.price_per_kg,
          imageUrl: null,
          stockKg: 100,
        },
        Number(it.quantity_kg),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
