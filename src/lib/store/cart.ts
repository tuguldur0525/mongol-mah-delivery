"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  pricePerKg: number;
  imageUrl: string | null;
  stockKg: number;
  quantityKg: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantityKg">, quantityKg: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantityKg: number) => void;
  clear: () => void;
  totalKg: () => number;
  subtotal: () => number;
  count: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantityKg) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? {
                      ...i,
                      ...item,
                      quantityKg: Math.min(
                        Math.round((i.quantityKg + quantityKg) * 100) / 100,
                        item.stockKg,
                      ),
                    }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantityKg: Math.min(quantityKg, item.stockKg) },
            ],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      setQuantity: (productId, quantityKg) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? { ...i, quantityKg: Math.min(quantityKg, i.stockKg) }
                : i,
            )
            .filter((i) => i.quantityKg > 0),
        })),
      clear: () => set({ items: [] }),
      totalKg: () => get().items.reduce((s, i) => s + i.quantityKg, 0),
      subtotal: () =>
        get().items.reduce((s, i) => s + Math.round(i.pricePerKg * i.quantityKg), 0),
      count: () => get().items.length,
    }),
    { name: "mah-cart" },
  ),
);
