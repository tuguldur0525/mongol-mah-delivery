import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 py-14 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="font-display text-xl font-bold text-cream">
              МАХ
              <span className="ml-1 text-[0.6em] font-normal tracking-widest text-mute">
                DELIVERY
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-mute">
              Шинэ, чанартай махыг малчны хотоос гэрт тань хүргэнэ.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
              Бүтээгдэхүүн
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/products?cat=uher", label: "Үхрийн мах" },
                { href: "/products?cat=aduu", label: "Адуугийн мах" },
                { href: "/products?cat=khon", label: "Хонины мах" },
                { href: "/products?cat=yamaa", label: "Ямааны мах" },
                { href: "/products?cat=takhia", label: "Тахианы мах" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-mute transition-colors hover:text-cream"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
              Холбоо барих
            </h3>
            <ul className="space-y-2 text-sm text-mute">
              <li>Утас: 9911-2233</li>
              <li>Хүргэлт: Улаанбаатар хот</li>
              <li>Цаг: 09:00 – 20:00</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
              Захиалга
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/order" className="text-sm text-mute hover:text-cream">
                  Захиалга хайх
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm text-mute hover:text-cream">
                  Сагс
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line py-6">
          <p className="text-xs text-mute">
            © {new Date().getFullYear()} МАХ ДЕЛІВЕРІ
          </p>
          <p className="text-xs text-mute">
            Төлбөрийн систем:{" "}
            <span className="font-semibold text-bone">Wire</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
