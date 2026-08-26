import { redirect } from "next/navigation";

export const metadata = { title: "Бидний тухай — Монгол Мах" };

export default function BidniiTukhaiPage() {
  redirect("/about");
}
