import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Alias for transaction failed — reuse cancel page logic via redirect with order param
export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  redirect(`/payment/cancel${order ? `?order=${order}` : ""}`);
}
