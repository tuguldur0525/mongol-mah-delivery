import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { login } from "@/actions/auth";
import { BrandLogo } from "@/components/brand-logo";

export const dynamic = "force-dynamic";

export const metadata = { title: "Нэвтрэх — Монгол Мах" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/admin");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <div className="text-center">
        <div className="mx-auto">
          <BrandLogo size={48} />
        </div>
        <h1 className="mt-4 text-display text-2xl">Монгол Мах</h1>
        <p className="eyebrow mt-1 text-primary">админ</p>
        <p className="mt-2 text-sm text-muted-foreground">Нэвтрэх мэдээллээ оруулна уу</p>
      </div>

      <form action={login} className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
        <div>
          <label htmlFor="email">И-мэйл</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password">Нууц үг</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
            И-мэйл эсвэл нууц үг буруу байна
          </div>
        )}
        <button type="submit" className="btn-primary w-full">
          Нэвтрэх
        </button>
      </form>
    </div>
  );
}
