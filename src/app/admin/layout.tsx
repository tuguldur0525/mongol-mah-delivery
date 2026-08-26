import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/nav";
import { LogoutButton } from "@/components/admin/logout-button";

export const dynamic = "force-dynamic";

export const metadata = { title: "Админ — МАХ ДЕЛІВЕРІ" };

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
        <h1 className="font-display text-2xl font-bold">Хандалт хориглосон</h1>
        <p className="mt-2 text-sm text-mute">Таньд админ эрх байхгүй.</p>
        <Link href="/" className="btn-secondary mt-6">
          Дэлгүүр рүү буцах
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink">
      <header className="bg-coal">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="4" fill="#c8102e" />
              <path
                d="M10 28 C10 14, 16 10, 20 10 C24 10, 30 14, 30 28"
                stroke="#f0ebe2"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <span className="font-display text-sm font-bold">
              МАХ АДМИН
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-mute hover:text-cream">
              Дэлгүүр үзэх
            </Link>
            <LogoutButton />
          </div>
        </div>
        <AdminNav />
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  );
}
