import Link from "next/link";
import { notFound } from "next/navigation";
import { recipes } from "@/lib/recipes";

export async function generateStaticParams() {
  return recipes.map((r) => ({ slug: r.slug }));
}

export default async function RecipeDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = recipes.find((x) => x.slug === slug);
  if (!r) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/recipes" className="text-xs text-muted-foreground hover:text-primary">← Жор руу буцах</Link>
      <p className="eyebrow mt-4 text-primary">{r.tagLabel} · {r.time}</p>
      <h1 className="mt-2 text-4xl text-display">{r.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{r.excerpt}</p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={r.image} alt={r.title} className="aspect-video w-full object-cover" />
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="eyebrow">Орц</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {r.ingredients.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="eyebrow">Алхам</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
            {r.steps.map((s) => <li key={s}>{s}</li>)}
          </ol>
        </div>
      </div>

      {r.productSlug && (
        <div className="mt-8 rounded-xl surface-blood p-6 text-center">
          <p className="text-sm font-bold">Энэ жороор хийх мах</p>
          <Link href={`/products/${r.productSlug}`} className="mt-3 inline-flex rounded-md bg-white px-6 py-2 text-sm font-medium text-primary hover:bg-white/90">
            Мах үзэх →
          </Link>
        </div>
      )}
    </div>
  );
}
