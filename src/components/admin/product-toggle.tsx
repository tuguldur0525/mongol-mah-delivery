"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleProductAvailability } from "@/actions/products";

export function ProductToggle({
  productId,
  isAvailable,
}: {
  productId: string;
  isAvailable: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          await toggleProductAvailability(productId, !isAvailable);
          router.refresh();
        })
      }
      className="text-xs font-medium text-mute hover:text-cream disabled:opacity-40"
    >
      {isAvailable ? "Идэвхгүй" : "Идэвхтэй"}
    </button>
  );
}
