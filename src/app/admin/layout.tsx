import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/nav";
import { LogoutButton } from "@/components/admin/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

export const metadata = { title: "Админ — Монгол Мах" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <>{children}</>;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="eyebrow text-primary">Хандалт хориглосон</p>
        <h1 className="mt-2 text-display text-2xl font-bold">Эрхгүй</h1>
        <p className="mt-2 text-sm text-muted-foreground">Таньд админ эрх байхгүй.</p>
        <Link href="/" className="btn-secondary mt-6">
          Дэлгүүр рүү буцах
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40">
        <div className="overflow-hidden border-b border-border surface-blood">
          <div className="marquee-track py-2">
            <div className="flex shrink-0 items-center">
              <span className="flex items-center gap-6 whitespace-nowrap px-6 eyebrow">Админ панел<span className="opacity-60">✦</span></span>
              <span className="flex items-center gap-6 whitespace-nowrap px-6 eyebrow">Захиалга · Бүтээгдэхүүн · Агуулах<span className="opacity-60">✦</span></span>
              <span className="flex items-center gap-6 whitespace-nowrap px-6 eyebrow">Монгол Мах<span className="opacity-60">✦</span></span>
            </div>
            <div className="flex shrink-0 items-center" aria-hidden="true">
              <span className="flex items-center gap-6 whitespace-nowrap px-6 eyebrow">Админ панел<span className="opacity-60">✦</span></span>
              <span className="flex items-center gap-6 whitespace-nowrap px-6 eyebrow">Захиалга · Бүтээгдэхүүн · Агуулах<span className="opacity-60">✦</span></span>
              <span className="flex items-center gap-6 whitespace-nowrap px-6 eyebrow">Монгол Мах<span className="opacity-60">✦</span></span>
            </div>
          </div>
        </div>
        <header className="border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-sm surface-blood text-display text-base">М</span>
              <span className="leading-none">
                <span className="text-display text-xl tracking-tight">Монгол Мах</span>
                <span className="mt-1 block eyebrow text-primary">админ</span>
              </span>
            </Link>
            <div className="ml-auto flex items-center gap-1">
              <Link href="/" className="hidden text-sm text-muted-foreground hover:text-foreground transition-colors sm:block">
                Дэлгүүр үзэх
              </Link>
              <span className="mx-2 hidden h-4 w-px bg-border sm:block" />
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
          <div className="border-t border-border bg-card/50">
            <div className="mx-auto max-w-7xl px-4">
              <AdminNav />
            </div>
          </div>
        </header>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 lg:py-12">{children}</div>
    </div>
  );
}
