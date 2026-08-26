import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border surface-deep">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="text-display text-3xl">Монгол Мах</p>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Малчнаас шууд. Шинэ, чанартай мах Улаанбаатар хотод хүргэнэ. Килограммаар
            нарийн хэрчиж, хүйтэн хэлхээгээр тээвэрлэнэ.
          </p>
          <p className="mt-6 eyebrow text-primary">since 2026 · Ulaanbaatar</p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="eyebrow text-muted-foreground">Холбоо барих</p>
          <p className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
            </svg>
            9911-2233
          </p>
          <p className="flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary mt-0.5">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" />
            </svg>
            <span className="text-muted-foreground">Улаанбаатар хотод захиалгаа 24 цагийн дотор хүргэнэ.</span>
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="eyebrow text-muted-foreground">Хуудсууд</p>
          <Link href="/products" className="block text-muted-foreground hover:text-primary transition-colors">
            Бүтээгдэхүүн
          </Link>
          <Link href="/track" className="block text-muted-foreground hover:text-primary transition-colors">
            Захиалга хайх
          </Link>
          <Link href="/cart" className="block text-muted-foreground hover:text-primary transition-colors">
            Сагс
          </Link>
          <Link href="/about" className="block text-muted-foreground hover:text-primary transition-colors">
            Бидний тухай
          </Link>
          <Link href="/admin" className="block text-muted-foreground hover:text-primary transition-colors">
            Админ нэвтрэх
          </Link>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Монгол Мах · Бүх эрх хуулиар хамгаалагдсан
      </div>
    </footer>
  );
}
