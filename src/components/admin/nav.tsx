"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Тойм" },
  { href: "/admin/orders", label: "Захиалга" },
  { href: "/admin/products", label: "Бүтээгдэхүүн" },
  { href: "/admin/inventory", label: "Агуулах" },
  { href: "/admin/settings", label: "Тохиргоо" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto py-2">
      {links.map((l) => {
        const active =
          l.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
