import Link from "next/link";
import { recipes } from "@/lib/recipes";

export const metadata = { title: "Жор — Монгол Мах", description: "Махны жор: цуйван, банш, стейк, хорхог. Өдрийн болон оройн хоолны санаа." };

export default function RecipesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="eyebrow text-primary">Жор</p>
      <h1 className="mt-2 text-4xl text-display">Хоолны жор</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Махаа авчихаад юу хийх вэ? primeat-ийн Жор-оос санаа авч, бид өөрсдийн маханд тохирсон 6 жорыг бэлтгэсэн — хуулбар биш, санаа.
      </p>

      <div className="mt-6 flex gap-2">
        <span className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground">Бүгд</span>
        <span className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">Өдрийн хоол</span>
        <span className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">Оройн зоог</span>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((r) => (
          <Link key={r.slug} href={`/recipes/${r.slug}`} className="group overflow-hidden rounded-xl border border-border bg-card hover:border-primary/40 transition-all hover:-translate-y-1 shadow-card">
            <div className="aspect-square overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.image} alt={r.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-4">
              <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{r.tagLabel}</span>
              <h3 className="mt-2 text-sm font-bold leading-snug group-hover:text-primary">{r.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.excerpt}</p>
              <span className="mt-3 inline-flex text-xs font-medium text-primary">Цааш үзэх →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
