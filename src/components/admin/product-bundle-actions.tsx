"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteProductBundle, toggleProductBundle } from "@/actions/bundles";

export function ProductBundleActions({
  bundleId,
  active,
}: {
  bundleId: string;
  active: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center justify-end gap-3 whitespace-nowrap">
      <Link href={`/admin/bundles/${bundleId}`} className="text-xs font-medium text-primary hover:underline">
        Засах
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => {
          const result = await toggleProductBundle(bundleId, !active);
          if (!result.error) router.refresh();
        })}
        className="text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-40"
      >
        {active ? "Нуух" : "Харуулах"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Энэ багцыг бүр мөсөн устгах уу?")) return;
          start(async () => {
            const result = await deleteProductBundle(bundleId);
            if (!result.error) router.refresh();
          });
        }}
        className="text-xs font-medium text-destructive hover:underline disabled:opacity-40"
      >
        Устгах
      </button>
    </div>
  );
}