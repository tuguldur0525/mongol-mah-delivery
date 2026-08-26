"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/store/cart";

const links = [
  { href: "/products", label: "Бүтээгдэхүүн" },
  { href: "/products?cat=uher", label: "Үхэр" },
  { href: "/products?cat=aduu", label: "Адуу" },
  { href: "/products?cat=khon", label: "Хонь" },
  { href: "/products?cat=yamaa", label: "Ямаа" },
  { href: "/products?cat=takhia", label: "Тахиа" },
];

export function Header() {
  const pathname = usePathname();
  const count = useCart((s) => s.items.length);
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 bg-ink/95 backdrop-blur">
      <div className="accent-line" />
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:h-16">
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="4" fill="#c8102e" />
            <path
              d="M10 28 C10 14, 16 10, 20 10 C24 10, 30 14, 30 28"
              stroke="#f0ebe2"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M14 26 C14 18, 17 15, 20 15 C23 15, 26 18, 26 26"
              fill="rgba(240,235,226,0.15)"
            />
          </svg>
          <div className="font-display text-lg font-bold tracking-wide text-cream">
            МАХ
            <span className="ml-1 text-[0.65em] font-normal tracking-widest text-mute">
              DELIVERY
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 text-[0.8125rem] font-medium transition-colors ${
                pathname === l.href || pathname.startsWith(l.href + "?")
                  ? "text-cream"
                  : "text-bone hover:text-cream"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/cart"
          className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm transition-colors hover:border-bone"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blood px-1.5 text-[11px] font-bold text-white">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
