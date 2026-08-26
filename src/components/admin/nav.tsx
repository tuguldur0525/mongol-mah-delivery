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
    <nav className="mx-auto flex max-w-7xl gap-0 overflow-x-auto border-b border-line">
      {links.map((l) => {
        const active =
          l.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-widest transition-colors ${
              active
                ? "border-b-2 border-blood text-cream"
                : "border-b-2 border-transparent text-mute hover:text-cream"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
