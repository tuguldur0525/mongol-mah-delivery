"use client";

import { useTransition } from "react";
import { logout } from "@/actions/auth";

export function LogoutButton() {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => logout())}
      disabled={pending}
      className="rounded-sm border border-line px-3 py-1.5 text-xs font-medium text-mute transition-colors hover:border-bone hover:text-cream"
    >
      {pending ? "..." : "Гарах"}
    </button>
  );
}
