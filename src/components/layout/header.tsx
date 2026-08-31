"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/store/cart";
import { ThemeToggle } from "@/components/theme-toggle";
import dynamic from "next/dynamic";
import { BrandLogo, BrandWordmark } from "@/components/brand-logo";
import { useState } from "react";

const SearchModal = dynamic(
  () =>
    import("@/components/search-modal").then((module) => module.SearchModal),
  { ssr: false },
);

export function Header() {
  const pathname = usePathname();
  const count = useCart((s) => s.items.length);
  const [searchOpen, setSearchOpen] = useState(false);
  if (pathname.startsWith("/admin")) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return (
      pathname === href ||
      pathname.startsWith(href + "/") ||
      pathname.startsWith(href + "?")
    );
  };

  return (
    <div className="sticky top-0 z-40">
      {/* Marquee - like mongol-mah */}
      <div className="overflow-hidden border-b border-border surface-blood">
        <div className="marquee-track py-2">
          <div className="flex shrink-0 items-center">
            <span className="flex items-center gap-6 whitespace-nowrap px-6 eyebrow">
              Малчны хотоос шууд хүргэнэ<span className="opacity-60">✦</span>
            </span>
            <span className="flex items-center gap-6 whitespace-nowrap px-6 eyebrow">
              Улаанбаатар хотод 24 цагийн дотор хүргэлт
              <span className="opacity-60">✦</span>
            </span>
            <span className="flex items-center gap-6 whitespace-nowrap px-6 eyebrow">
              Баталгаат жин хэмжүүр
              <span className="opacity-60">✦</span>
            </span>
            <span className="flex items-center gap-6 whitespace-nowrap px-6 eyebrow">
              Банкны шилжүүлгээр хялбар төлбөр
              <span className="opacity-60">✦</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center" aria-hidden="true">
            <span className="flex items-center gap-6 whitespace-nowrap px-6 eyebrow">
              Малчны хотоос шууд хүргэнэ<span className="opacity-60">✦</span>
            </span>
            <span className="flex items-center gap-6 whitespace-nowrap px-6 eyebrow">
              Улаанбаатар хотод 24 цагийн дотор хүргэлт
              <span className="opacity-60">✦</span>
            </span>
            <span className="flex items-center gap-6 whitespace-nowrap px-6 eyebrow">
              Баталгаат жин хэмжүүр
              <span className="opacity-60">✦</span>
            </span>
            <span className="flex items-center gap-6 whitespace-nowrap px-6 eyebrow">
              Банкны шилжүүлгээр хялбар төлбөр
              <span className="opacity-60">✦</span>
            </span>
          </div>
        </div>
      </div>

      <header className="border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo size={36} />
            <BrandWordmark />
          </Link>

          <nav className="ml-8 hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Эхлэл
            </Link>
            <Link
              href="/products"
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${isActive("/products") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Бүтээгдэхүүн
            </Link>
            <Link
              href="/track"
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${isActive("/track") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Захиалга хайх
            </Link>
            <Link
              href="/about"
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${isActive("/about") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Бидний тухай
            </Link>
            <Link
              href="/recipes"
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${isActive("/recipes") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Жор
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <button
              aria-label="Бүтээгдэхүүн хайх"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.34-4.34" />
              </svg>
            </button>
            <SearchModal
              open={searchOpen}
              onClose={() => setSearchOpen(false)}
            />
            <Link
              href="/cart"
              className="inline-flex h-8 items-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m15 11-1 9" />
                <path d="m19 11-4-7" />
                <path d="M2 11h20" />
                <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
              </svg>
              <span className="hidden sm:inline">Сагс</span>
              {count > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-white text-[11px] font-bold text-primary">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}
