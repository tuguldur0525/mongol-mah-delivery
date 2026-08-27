"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatMnt } from "@/lib/validations";

type Result = { id: string; name: string; slug: string; price_per_kg: number; image_url: string | null };

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, price_per_kg, image_url")
        .ilike("name", `%${q.trim()}%`)
        .limit(8);
      setResults((data as Result[]) ?? []);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <button aria-label="Хаах" onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-lift mx-4 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.34-4.34" />
          </svg>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Мах хайх... жишээ: цул, хавирга"
            className="flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground focus:ring-0"
          />
          <button onClick={onClose} className="rounded-md p-1 hover:bg-accent text-muted-foreground">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-96 overflow-auto p-2">
          {loading && <p className="px-3 py-6 text-center text-sm text-muted-foreground">Хайж байна...</p>}
          {!loading && q.trim().length >= 2 && results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Илэрц олдсонгүй. Өөр үгээр оролдоно уу.</p>
          )}
          {!loading && q.trim().length < 2 && (
            <div className="px-3 py-4">
              <p className="eyebrow text-muted-foreground">Санал</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Үхрийн цул", "Хавирга", "Тахианы", "Адууны"].map((s) => (
                  <button key={s} onClick={() => setQ(s)} className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:bg-accent">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <ul className="space-y-1">
            {results.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/products/${r.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                    {r.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.image_url} alt={r.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full place-items-center text-xs text-muted-foreground">🥩</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{formatMnt(r.price_per_kg)} / кг</p>
                  </div>
                  <span className="text-xs text-primary">→</span>
                </Link>
              </li>
            ))}
          </ul>
          {q.trim().length >= 2 && (
            <Link
              href={`/products?q=${encodeURIComponent(q.trim())}`}
              onClick={onClose}
              className="mt-2 block rounded-lg border border-dashed border-border px-3 py-2 text-center text-sm hover:bg-accent"
            >
              Бүх үр дүнг харах “{q.trim()}” →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
