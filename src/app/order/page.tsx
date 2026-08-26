import { redirect } from "next/navigation";

// Legacy alias: /order → /track (reference site uses /track)
export default function OrderPage() {
  redirect("/track");
}
