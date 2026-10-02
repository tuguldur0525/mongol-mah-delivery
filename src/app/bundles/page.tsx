import { BundleCard } from "@/components/products/bundle-card";
import { getProductBundles } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Багц бүтээгдэхүүн — Монгол Мах" };

export default async function BundlesPage() {
  const bundles = await getProductBundles();
  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <p className="eyebrow text-primary">Нэг сонголтоор</p>
      <h1 className="mt-2 text-4xl text-display">Махны багцууд</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Өдөр тутмын хоол, баярын ширээнд зориулан бүрдүүлсэн багцууд.
      </p>
      {bundles.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      ) : (
        <p className="mt-10 border-y border-border py-10 text-sm text-muted-foreground">
          Багц бүтээгдэхүүн удахгүй нэмэгдэнэ.
        </p>
      )}
    </main>
  );
}
