export const metadata = { title: "Үйлчилгээний нөхцөл — Монгол Мах" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="eyebrow text-primary">Хууль</p>
      <h1 className="mt-2 text-4xl text-display">Үйлчилгээний нөхцөл</h1>
      <p className="mt-3 text-sm text-muted-foreground">Сүүлд шинэчилсэн: 2026-01-01 · Улаанбаатар · Asia/Ulaanbaatar</p>

      <div className="mt-8 space-y-8 rounded-xl border border-border bg-card p-6 sm:p-8">
        <section>
          <h2 className="text-lg font-semibold">1. Ерөнхий</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Монгол Мах (mongolmah.mn) нь хэрэглэгчдэд шинэхэн махыг килограммаар захиалж, Улаанбаатар хотод 24 цагийн дотор хүргэлтээр авах үйлчилгээг үзүүлдэг. Захиалга хийснээр та энэхүү нөхцөлийг зөвшөөрсөнд тооцно.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">2. Захиалга ба үнэ</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Үнэ нь 1 кг тутамд тооцогддог, сагсанд 0.5 кг-аар нэмнэ.</li>
            <li>Захиалга баталгаажихад Wire төлбөрийн холбоосоор төлнө. Төлбөр амжилттай болсны дараа л агуулахын үлдэгдэл хасагдана.</li>
            <li>100&apos;000₮ дээш захиалга хүргэлт үнэгүй, доош бол тохиргоон дахь хүргэлтийн төлбөр нэмэгдэнэ.</li>
            <li>Төлбөр 10 минут хүлээгдэнэ — хугацаа дуустал төлөөгүй захиалга автоматаар цуцлагдана.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold">3. Хүргэлт</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Хүргэлт Улаанбаатар хотод 24 цагийн дотор, 09:00–20:00. Хүйтэн хэлхээ 2°C. Хаяг буруу, утас холбогдохгүй бол хүргэлт хойшлохыг анхаарна уу.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">4. Буцаалт</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Шинэ махны онцлогоос шалтгаалан хүргэлтээс хойш 2 цагийн дотор 9911-2233 руу залгаж гомдол гаргана уу. Чанарын доголдол нотлогдвол солих эсвэл буцаан олголт хийнэ.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">5. Холбоо барих</h2>
          <p className="mt-2 text-sm text-muted-foreground">9911-2233 · info@mongolmah.mn · Улаанбаатар</p>
        </section>
      </div>
    </div>
  );
}
