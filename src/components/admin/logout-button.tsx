"use client";

import { useTransition } from "react";
import { logout } from "@/actions/auth";

export function LogoutButton() {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => logout())}
      disabled={pending}
      className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
    >
      {pending ? "..." : "Гарах"}
    </button>
  );
}
