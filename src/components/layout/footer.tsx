import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M23 12s0-3.5-.5-5c-.3-1-1-1.5-2-1.7C18 5 12 5 12 5s-6 0-8.5.3c-1 .2-1.7.7-2 1.7C1 8.5 1 12 1 12s0 3.5.5 5c.3 1 1 1.5 2 1.7C6 19 12 19 12 19s6 0 8.5-.3c1-.2 1.7-.7 2-1.7.5-1.5.5-5 .5-5zM10 15V9l6 3-6 3z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M9 12a4 4 0 1 0 4 4V9a6 6 0 0 0 4 0" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border surface-deep">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 py-12 justify-between sm:grid-cols-3 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <BrandLogo size={32} />
              <p className="text-display text-xl">Монгол Мах</p>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Малчнаас шууд. Шинэ, чанартай мах Улаанбаатар хотод хүргэнэ.
              Килограммаар нарийн хэрчиж, хүйтэн хэлхээгээр тээвэрлэнэ.
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 hover:border-primary/40 hover:bg-primary hover:text-white transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <p className="mt-5 eyebrow text-primary">
              since 2026 · Ulaanbaatar
            </p>
          </div>

          {/* Legal */}
          <div className="px-30">
            <p className="eyebrow text-foreground">Үйлчилгээний нөхцөл</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary"
                >
                  Үйлчилгээний нөхцөл
                </Link>
              </li>
              <li>
                <Link
                  href="/policy"
                  className="text-muted-foreground hover:text-primary"
                >
                  Нууцлалын бодлого
                </Link>
              </li>
              <li>
                <Link
                  href="/delivery"
                  className="text-muted-foreground hover:text-primary"
                >
                  Хүргэлтийн нөхцөл
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-muted-foreground hover:text-primary"
                >
                  Админ нэвтрэх
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div className="px-30">
            <p className="eyebrow text-foreground">Тусламж</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/track"
                  className="text-muted-foreground hover:text-primary"
                >
                  Захиалга хайх
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-muted-foreground hover:text-primary"
                >
                  Сагс
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary"
                >
                  Бидний тухай
                </Link>
              </li>
              <li>
                <a
                  href="tel:99112233"
                  className="text-muted-foreground hover:text-primary"
                >
                  9911-2233
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@mongolmah.mn"
                  className="text-muted-foreground hover:text-primary"
                >
                  info@mongolmah.mn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} Монгол Мах · Бүх эрх хуулиар
            хамгаалагдсан
          </p>
        </div>
      </div>
    </footer>
  );
}
