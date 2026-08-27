import Link from "next/link";

export const metadata = { title: "Хүргэлтийн нөхцөл — Монгол Мах" };

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="eyebrow text-primary">Хүргэлт</p>
      <h1 className="mt-2 text-4xl text-display">Хүргэлтийн нөхцөл</h1>
      <p className="mt-3 text-sm text-muted-foreground">Улаанбаатар хот · 09:00–20:00 · Asia/Ulaanbaatar</p>

      <div className="mt-8 grid gap-6">
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">Хугацаа</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Захиалга төлөгдсөнөөс хойш 24 цагийн дотор. Өглөөний бэлтгэлд орсон захиалгуудыг тухайн өдөртөө хүргэхийг хичээнэ.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-display text-xl text-primary">24ц</p>
              <p className="text-xs text-muted-foreground">хүргэлт</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-display text-xl text-primary">09–20</p>
              <p className="text-xs text-muted-foreground">цаг</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-display text-xl text-primary">2°C</p>
              <p className="text-xs text-muted-foreground">хүйтэн хэлхээ</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">Төлбөр</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>100&apos;000₮ дээш бол хүргэлт үнэгүй</li>
            <li>100&apos;000₮ доош бол тохиргоон дахь хүргэлтийн төлбөр (анх 5&apos;000₮) нэмэгдэнэ</li>
            <li>Төлбөр Wire &mdash; Интернэт банк</li>
            <li>Сагсанд 100&apos;000₮-д хэр дутуу байгааг харж болно</li>
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">Анхаарах</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Хаяг, утас зөв эсэхийг шалгана уу</li>
            <li>Хүргэлтийн үед утсаа нээлттэй байлгана уу</li>
            <li>Байршил Улаанбаатараас гадуур бол урьдчилж 9911-2233 руу залгана уу</li>
          </ul>
          <div className="mt-6 flex gap-3">
            <Link href="/products" className="btn-primary">
              Мах захиалах
            </Link>
            <Link href="/track" className="btn-secondary">
              Захиалга хайх
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
