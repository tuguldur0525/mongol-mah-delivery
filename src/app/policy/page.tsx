export const metadata = { title: "Нууцлалын бодлого — Монгол Мах" };

export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="eyebrow text-primary">Хууль</p>
      <h1 className="mt-2 text-4xl text-display">Нууцлалын бодлого</h1>
      <p className="mt-3 text-sm text-muted-foreground">Сүүлд шинэчилсэн: 2026-01-01</p>

      <div className="mt-8 space-y-8 rounded-xl border border-border bg-card p-6 sm:p-8">
        <section>
          <h2 className="text-lg font-semibold">Бид юу цуглуулдаг вэ?</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Зөвхөн захиалгад шаардлагатай: нэр, утас (8 орон), хаяг, захиалсан бүтээгдэхүүн. Нэвтрэх шаардлагагүй, бүртгэл үүсгэхгүй.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Яаж ашигладаг вэ?</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Захиалгыг бэлтгэх, хүргэх, төлбөр баталгаажуулах</li>
            <li>Захиалгын явцыг утас/захиалгын дугаараар харуулах</li>
            <li>Маркетингийн мессеж илгээхгүй, гуравдагч этгээдэд зарахгүй</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Хадгалалт</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Захиалга Supabase (EU) дээр хадгалагдана, RLS хамгаалалттай. Төлбөрийг Wire боловсруулдаг — бид картын мэдээлэл хадгалдаггүй. Төлөгдөөгүй захиалга 10 минутын дараа автоматаар устна.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Таны эрх</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Та 9911-2233 эсвэл info@mongolmah.mn-ээр холбогдож мэдээллээ засах/устгах хүсэлт гаргаж болно.
          </p>
        </section>
      </div>
    </div>
  );
}
