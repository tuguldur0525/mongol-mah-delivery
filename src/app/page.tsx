import Link from "next/link";
import { getCategories, getProducts } from "@/lib/queries";
import { ProductCard } from "@/components/products/product-card";
import { recipes } from "@/lib/recipes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getProducts({ limit: 6, inStockOnly: false }),
  ]);

  return (
    <div>
      {/* Hero - like mongol-mah, with extra breathing room */}
      <section className="relative border-b border-border surface-deep">
        <div className="absolute inset-0 hairline-grid opacity-60" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28 lg:gap-16">
          <div>
            <p className="eyebrow text-primary">Малчнаас шууд · 9911-2233</p>
            <h1 className="mt-5 text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
              Шинэхэн монгол
              <br />
              <span className="text-primary">мах</span>, гэрийн
              <br />
              хаалган дээр.
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground">
              Үхэр, адуу, хонь, ямаа, тахианы мах килограммаар. Онлайнаар захиалж,
              банкаар төлөөд 24 цагийн дотор хүргэлтээ хүлээн авна.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                Мах захиалах
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <Link href="/track" className="btn-secondary">
                Захиалгаа шалгах
              </Link>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-6">
              <div>
                <dt className="text-display text-2xl text-primary">24ц</dt>
                <dd className="mt-1 text-xs text-muted-foreground">хүргэлт</dd>
              </div>
              <div>
                <dt className="text-display text-2xl text-primary">16+</dt>
                <dd className="mt-1 text-xs text-muted-foreground">төрөл</dd>
              </div>
              <div>
                <dt className="text-display text-2xl text-primary">100%</dt>
                <dd className="mt-1 text-xs text-muted-foreground">гарал тодорхой</dd>
              </div>
            </dl>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-border shadow-lift">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://mongol-mah.lovable.app/__l5e/assets-v1/1893ad6f-8b62-495f-9ffa-9566efd44cb8/kitchen.webp"
                alt="Модон банзан дээрх шинэ үхрийн мах"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-4 max-w-56 rounded-xl surface-cream p-4 shadow-lift sm:left-8">
              <p className="eyebrow text-primary">Онцлог</p>
              <p className="mt-2 text-sm font-bold leading-snug">
                Тухайн өдрийн бэлтгэл — хөргөсөн, хатаагаагүй шинэ мах.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features - breathing room, separated */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-primary/12 text-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4" /><path d="M12 18v4" /><path d="m4.93 4.93 2.83 2.83" /><path d="m16.24 16.24 2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="m4.93 19.07 2.83-2.83" /><path d="m16.24 7.76 2.83-2.83" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-bold">Шинэхэн, хөргөсөн</p>
              <p className="mt-1 text-sm text-muted-foreground">Тухайн өдрийн бэлтгэл, хүйтэн хэлхээгээр.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-primary/12 text-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-bold">Хурдан хүргэлт</p>
              <p className="mt-1 text-sm text-muted-foreground">Улаанбаатар хотод 24 цагийн дотор.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-primary/12 text-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-bold">Банкны шилжүүлэг</p>
              <p className="mt-1 text-sm text-muted-foreground">Дансаар төлж, гүйлгээний дугаараа бүртгэнэ.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-primary/12 text-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-bold">Чанарын хяналт</p>
              <p className="mt-1 text-sm text-muted-foreground">Мал бүрийн гарал үүсэл тодорхой.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories - extra white space, airy */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-primary">Төрлүүд</p>
            <h2 className="mt-2 text-4xl text-display">Ямар мах авах вэ?</h2>
          </div>
          <Link
            href="/products"
            className="inline-flex h-9 items-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Бүгдийг харах
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
          {categories.map((cat) => {
            const labelMap: Record<string, string> = {
              uher: "Үхрийн мах",
              aduu: "Адууны мах",
              khon: "Хонины мах",
              yamaa: "Ямааны мах",
              takhia: "Тахианы мах",
            };
            const greyImageMap: Record<string, string> = {
              uher: "https://nxbxkwjfzuujzdwqtnxa.supabase.co/storage/v1/object/public/category%20images/beef-grey.webp",
              aduu: "https://nxbxkwjfzuujzdwqtnxa.supabase.co/storage/v1/object/public/category%20images/horse-grey.jpeg",
              khon: "https://nxbxkwjfzuujzdwqtnxa.supabase.co/storage/v1/object/public/category%20images/lamb-grey.webp",
              yamaa: "https://nxbxkwjfzuujzdwqtnxa.supabase.co/storage/v1/object/public/category%20images/goat-meat.jpg",
              takhia: "https://nxbxkwjfzuujzdwqtnxa.supabase.co/storage/v1/object/public/category%20images/poultry-grey.webp",
            };
            const label = labelMap[cat.slug] ?? `${cat.name} мах`;
            const imgSrc = greyImageMap[cat.slug] ?? cat.image_url;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:-translate-y-0.5"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  {imgSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgSrc}
                      alt={label}
                      className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${cat.slug === "aduu" || cat.slug === "yamaa" ? "grayscale" : ""}`}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <span className="text-display text-2xl text-muted-foreground">{cat.name.slice(0, 1)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-border bg-card p-3 text-center">
                  <p className="text-sm font-medium">{label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured - airy, separated from categories */}
      <section className="mt-6 border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-primary">Онцлох</p>
              <h2 className="mt-2 text-4xl text-display">Хамгийн их захиалагддаг</h2>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
              Бүх бүтээгдэхүүн
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="mt-10 rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">Бүтээгдэхүүн хараахан нэмэгдээгүй байна.</p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {featured.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Steps - more whitespace before CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:py-28">
        <p className="eyebrow text-primary">Хэрхэн захиалах</p>
        <h2 className="mt-2 text-4xl text-display">Дөрвөн хялбар алхам</h2>
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {[
            { n: "01", t: "Мах сонгох", d: "Хүссэн махаа килограммаар сагсандаа нэмнэ." },
            { n: "02", t: "Хаяг бөглөх", d: "Нэр, утас, хүргэх хаягаа оруулна — бүртгэл шаардлагагүй." },
            { n: "03", t: "Банкаар төлөх", d: "Дансанд шилжүүлээд гүйлгээний дугаараа бүртгэнэ." },
            { n: "04", t: "Хүргэлт", d: "Төлбөр батлагдмагц бэлтгээд хаяг дээр хүргэнэ." },
          ].map((s) => (
            <li key={s.n} className="rounded-xl border border-border bg-card p-8">
              <span className="text-display text-4xl text-primary/35">{s.n}</span>
              <p className="mt-3 font-bold">{s.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Recipes teaser - inspired by primeat Жор, own content */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-primary">Жор</p>
              <h2 className="mt-2 text-4xl text-display">Юу хийж болох вэ?</h2>
              <p className="mt-2 text-sm text-muted-foreground">Махаар хийх 6 санаа — primeat-аас санаа авав, жор өөрсдийн.</p>
            </div>
            <Link href="/recipes" className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
              Бүх жор
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.slice(0, 3).map((r) => (
              <Link key={r.slug} href={`/recipes/${r.slug}`} className="group overflow-hidden rounded-xl border border-border bg-card hover:border-primary/40 transition-all">
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.image} alt={r.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <span className="tag tag-muted">{r.tagLabel}</span>
                  <h3 className="mt-2 font-semibold leading-snug group-hover:text-primary">{r.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - generous bottom whitespace */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 lg:pb-24">
        <div className="relative overflow-hidden rounded-2xl surface-blood px-6 py-16 text-center sm:px-14 lg:py-20">
          <div className="absolute inset-0 grain-lines opacity-40" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-4xl text-display">Өнөөдрийн бэлтгэл дууссаагүй байна</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm opacity-90">
              Захиалгаа өнөөдөр өгвөл маргааш гэртээ шинэ мах хүлээн авна.
            </p>
            <Link href="/products" className="mt-8 inline-flex h-10 items-center gap-2 rounded-md bg-white px-8 text-sm font-medium text-primary hover:bg-white/90 transition-colors">
              Одоо захиалах
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
