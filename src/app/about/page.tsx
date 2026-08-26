import Link from "next/link";

export const metadata = {
  title: "Бидний тухай — Монгол Мах",
  description: "Монгол Мах - Малчнаас шууд. 2026 оноос Улаанбаатар хотод шинэ махыг хүйтэн хэлхээгээр 24 цагийн дотор хүргэдэг.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero - like mongol-mah surface-deep */}
      <section className="relative border-b border-border surface-deep">
        <div className="absolute inset-0 hairline-grid opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 lg:py-20">
          <p className="eyebrow text-primary">Бидний тухай</p>
          <h1 className="mt-3 text-4xl leading-[0.95] sm:text-5xl lg:text-6xl text-display">
            Малчнаас шууд —<br />
            <span className="text-primary">таны ширээнд.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Монгол Мах 2026 оноос Улаанбаатар хотын айл өрхөд өдөр бүрийн шинэ махыг
            хүйтэн хэлхээгээр, килограммаар нь нарийн хэрчиж хүргэж байна. Бид малчин,
            төхөөрөмж, тээвэр гурвыг нэг гинжин хэлхээнд нэгтгэсэн.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary">
              Бүтээгдэхүүн үзэх
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <Link href="/track" className="btn-secondary">
              Захиалга хайх
            </Link>
          </div>

          <dl className="mt-12 grid max-w-3xl grid-cols-3 gap-6 border-t border-border pt-8">
            <div>
              <dt className="text-display text-3xl text-primary">2026</dt>
              <dd className="mt-1 text-xs text-muted-foreground">оноос хойш</dd>
            </div>
            <div>
              <dt className="text-display text-3xl text-primary">24ц</dt>
              <dd className="mt-1 text-xs text-muted-foreground">хүргэлт</dd>
            </div>
            <div>
              <dt className="text-display text-3xl text-primary">100%</dt>
              <dd className="mt-1 text-xs text-muted-foreground">гарал тодорхой</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="eyebrow text-primary">Түүх</p>
            <h2 className="mt-2 text-3xl text-display">Яагаад бид энэ ажлыг хийдэг вэ?</h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Монголын малчны хотонд өдөр бүр шинэ мах бэлтгэгддэг. Гэвч хотын хэрэглэгч
                дэлгүүрт очсон хойноо хэд хоногийн өмнөх савласан мах л хардаг. Бид энэ
                завсрыг арилгахыг хүссэн.
              </p>
              <p>
                Өглөө эрт малчны гар дээрээс авсан махыг 2°C хүйтэн хэлхээгээр шууд цехэд
                хүргэж, тухайн өдөртөө кг-аар хэрчиж, савлаж, 24 цагийн дотор таны хаалган
                дээр авчирна. Хөлдөөхгүй, хатаахгүй.
              </p>
              <p>
                Үхэр, адуу, хонь, ямаа, тахиа — бүгд гарал үүсэл тодорхой. Мал, багц, огноо
                бүр бүртгэлтэй. Та захиалгын дугаараар яг аль сумаас, хэзээ бэлтгэгдсэнийг
                хянах боломжтой.
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://mongol-mah.lovable.app/__l5e/assets-v1/1893ad6f-8b62-495f-9ffa-9566efd44cb8/kitchen.webp"
              alt="Модон банзан дээрх шинэ мах"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="p-5">
              <p className="text-sm font-bold">Тухайн өдрийн бэлтгэл</p>
              <p className="mt-1 text-sm text-muted-foreground">Хөргөсөн, хөлдөөгүй, өдөртөө бэлтгэсэн.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values - like mongol-mah features */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <p className="eyebrow text-primary">Үнэт зүйл</p>
          <h2 className="mt-2 text-3xl text-display">Юуг эрхэмлэдэг вэ?</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-background p-6">
              <span className="grid size-10 place-items-center rounded-md bg-primary/12 text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4" /><path d="M12 18v4" /><path d="m4.93 4.93 2.83 2.83" /><path d="m16.24 16.24 2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="m4.93 19.07 2.83-2.83" /><path d="m16.24 7.76 2.83-2.83" />
                </svg>
              </span>
              <h3 className="mt-4 text-sm font-bold">Шинэхэн, хөргөсөн</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Өдөр бүрийн нядалгаа, 2°C хүйтэн хэлхээ, 24 цагийн эргэлт.</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-6">
              <span className="grid size-10 place-items-center rounded-md bg-primary/12 text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" />
                </svg>
              </span>
              <h3 className="mt-4 text-sm font-bold">Гарал тодорхой</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Багц бүр QR кодтой. Малчин, сум, огноо ил тод.</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-6">
              <span className="grid size-10 place-items-center rounded-md bg-primary/12 text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" />
                </svg>
              </span>
              <h3 className="mt-4 text-sm font-bold">Хурдан, найдвартай</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Улаанбаатартаа захиалснаас хойш 24 цагийн дотор.</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-6">
              <span className="grid size-10 place-items-center rounded-md bg-primary/12 text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                </svg>
              </span>
              <h3 className="mt-4 text-sm font-bold">Ил тод төлбөр</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Банкны шилжүүлэг, гүйлгээ баталгаажиж, баримт олгоно.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cold chain steps */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <p className="eyebrow text-primary">Хүйтэн хэлхээ</p>
        <h2 className="mt-2 text-3xl text-display">Мах яаж танд хүрдэг вэ?</h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <li className="rounded-xl border border-border bg-card p-6">
            <span className="text-display text-4xl text-primary/35">01</span>
            <p className="mt-3 font-bold">Малчнаас татан авалт</p>
            <p className="mt-1 text-sm text-muted-foreground">Өглөө 05:00–08:00, малын гаралтай хамт бүртгэнэ.</p>
          </li>
          <li className="rounded-xl border border-border bg-card p-6">
            <span className="text-display text-4xl text-primary/35">02</span>
            <p className="mt-3 font-bold">Хөргөлт, хэрчилт</p>
            <p className="mt-1 text-sm text-muted-foreground">2°C-д хөргөж, кг-аар жинлэн савлана.</p>
          </li>
          <li className="rounded-xl border border-border bg-card p-6">
            <span className="text-display text-4xl text-primary/35">03</span>
            <p className="mt-3 font-bold">Баталгаа, төлбөр</p>
            <p className="mt-1 text-sm text-muted-foreground">Захиалга баталгаажиж, Wire/банк баталгаа орно.</p>
          </li>
          <li className="rounded-xl border border-border bg-card p-6">
            <span className="text-display text-4xl text-primary/35">04</span>
            <p className="mt-3 font-bold">Хүргэлт</p>
            <p className="mt-1 text-sm text-muted-foreground">Тусгай хөргүүртэй машинаар 24 цагийн дотор.</p>
          </li>
        </ol>
      </section>

      {/* Contact */}
      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="rounded-2xl border border-border bg-card p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow text-primary">Холбоо барих</p>
              <h2 className="mt-2 text-2xl text-display">Асуух зүйл байна уу?</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Даваа–Ням 09:00–20:00. Хүргэлт, төлбөр, бүтээгдэхүүний талаар лавлана уу.
              </p>
              <div className="mt-6 space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                    <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
                  </svg>
                  <a href="tel:99112233" className="font-semibold hover:text-primary">
                    9911-2233
                  </a>
                </p>
                <p className="text-muted-foreground">Улаанбаатар хот · since 2026</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/products" className="btn-primary">
                Мах захиалах
              </Link>
              <Link href="/track" className="btn-secondary">
                Захиалга хайх
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA like mongol-mah */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="relative overflow-hidden rounded-2xl surface-blood px-6 py-12 text-center sm:px-10">
          <div className="absolute inset-0 grain-lines opacity-40" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-3xl text-display">Малчнаас шууд. Ил тод. Шинэхэн.</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm opacity-90">Таны гал тогоонд орж буй махны гарал, хүйтэн хэлхээ бүгд хянагдсан.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
