import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { login } from "@/actions/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Нэвтрэх — Админ" };

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
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          className="mx-auto"
        >
          <rect width="40" height="40" rx="4" fill="#c8102e" />
          <path
            d="M10 28 C10 14, 16 10, 20 10 C24 10, 30 14, 30 28"
            stroke="#f0ebe2"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <h1 className="mt-4 font-display text-xl font-bold">МАХ АДМИН</h1>
        <p className="mt-1 text-xs text-mute">Нэвтрэх мэдээллээ оруулна уу</p>
      </div>

      <form action={login} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email">И-мэйл</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="password">Нууц үг</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        {error && (
          <div className="rounded-sm border border-blood/30 bg-blood/10 px-3 py-2 text-sm text-cream">
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
