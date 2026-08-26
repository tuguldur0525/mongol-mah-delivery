import Link from "next/link";
import { getCategories, getProducts } from "@/lib/queries";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/ui/fade-in";

export const dynamic = "force-dynamic";

const CATEGORY_STYLES: Record<string, string> = {
  uher: "bg-[#c8102e]/8",
  aduu: "bg-[#d4432a]/8",
  khon: "bg-[#c9a96e]/8",
  yamaa: "bg-[#4a9c5c]/8",
  takhia: "bg-[#6b8aad]/8",
};

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getProducts({ limit: 8, inStockOnly: false }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="hero-bg relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <FadeIn delay={0.1}>
            <div className="flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-blood">
              <span className="h-px w-8 bg-blood" />
              Малчны хотоос
            </div>
            <h1 className="mt-4 font-display text-4xl leading-[1.1] font-bold md:text-5xl lg:text-6xl">
              Шинэ
              <br />
              <span className="text-gradient-gold">чанартай махыг</span>
              <br />
              гэрт тань хүргэнэ.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-bone">
              Үхэр, адуу, хонь, ямаа, тахианы махыг өдөр бүр шинээр огтолж,
              кг-аар нь сонгоод онлайн захиалаарай.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                Бүтээгдэхүүн үзэх
              </Link>
              <Link href="/track" className="btn-secondary">
                Захиалга хайх
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 border-t border-line pt-6">
              {[
                { n: "5+", l: "төрлийн мах" },
                { n: "0.5кг", l: "эхлэх хэмжээ" },
                { n: "30мин", l: "хүргэлтийн хугацаа" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-display text-lg font-bold text-cream">
                    {s.n}
                  </p>
                  <p className="text-xs text-mute">{s.l}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.3} className="relative hidden md:block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-coal">
              <div className="absolute inset-0 bg-gradient-to-br from-blood/10 to-transparent" />
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="font-display text-6xl opacity-20">🥩</div>
                  <p className="mt-2 text-xs text-mute">
                    Өндөр чанартай зураг
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-md bg-surface p-4 shadow-lg">
              <p className="text-[0.6875rem] font-bold uppercase tracking-widest text-blood">
                Өдөр бүр шинэ
              </p>
              <p className="mt-1 text-xs text-bone">
                Аль хэдийг огтолсон шинэ махыг л хүргэдэг.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-blood">
              Ангилал
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">
              Махны төрлүүд
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm text-bone hover:text-cream"
          >
            Бүгдийг харах →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {categories.map((cat, i) => {
            const bg = CATEGORY_STYLES[cat.slug] ?? "bg-cream/5";
            return (
              <FadeIn key={cat.id} delay={i * 0.05}>
                <Link
                  href={`/products?cat=${cat.slug}`}
                  className="group block rounded-md border border-line bg-surface p-5 text-center transition-all hover:border-bone hover:bg-coal"
                >
                  <div
                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${bg} transition-transform group-hover:scale-110`}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-bone"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-cream">
                    {cat.name}
                  </p>
                  <p className="mt-0.5 text-xs text-mute">Мах</p>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-blood">
              Онцлох
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">
              Бидний сонголт
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm text-bone hover:text-cream"
          >
            Бүгдийг харах →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="mt-8 rounded-md border border-line bg-surface p-12 text-center">
            <p className="text-sm text-mute">
              Бүтээгдэхүүн хараахан нэмэгдээгүй байна.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Process strip */}
      <section className="border-y border-line bg-coal">
        <div className="mx-auto grid max-w-7xl divide-x divide-line md:grid-cols-3">
          {[
            {
              n: "01",
              t: "Сонгоно",
              d: "Махныхаа төрөл, хэмжээг сонгоно.",
            },
            {
              n: "02",
              t: "Төлнө",
              "d": "Wire-аар аюулгүй төлбөр хийнэ.",
            },
            {
              n: "03",
              t: "Хүлээнэ",
              "d": "30 минутын дотор хүргэж өгнө.",
            },
          ].map((s) => (
            <div key={s.n} className="px-6 py-8 md:px-10">
              <span className="font-display text-3xl font-bold text-line">
                {s.n}
              </span>
              <h3 className="mt-2 text-sm font-semibold text-cream">
                {s.t}
              </h3>
              <p className="mt-1 text-sm text-mute">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
