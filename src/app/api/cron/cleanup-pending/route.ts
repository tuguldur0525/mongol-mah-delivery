import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Vercel Cron / manual cleanup for abandoned pending Wire orders.
 * Deletes orders stuck in pending_payment/pending after 10 minutes
 * (user quit Wire gateway and cannot resume).
 * Call via: GET /api/cron/cleanup-pending
 * Protected by CRON_SECRET if set, otherwise service-role only.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    const urlSecret = req.nextUrl.searchParams.get("secret");
    if (auth !== `Bearer ${cronSecret}` && urlSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createAdminClient();

  // Prefer RPC (handles index + returns count)
  const { data, error } = await supabase.rpc("cleanup_expired_pending_orders");

  if (error) {
    // Fallback direct delete if RPC not yet migrated
    const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { error: delError, count } = await supabase
      .from("orders")
      .delete({ count: "exact" })
      .eq("payment_status", "pending")
      .eq("order_status", "pending_payment")
      .eq("stock_deducted", false)
      .lt("created_at", cutoff);

    if (delError) {
      console.error("[cron] cleanup failed:", delError.message);
      return NextResponse.json({ error: delError.message }, { status: 500 });
    }
    return NextResponse.json({ deleted: count ?? 0, via: "fallback", cutoff });
  }

  return NextResponse.json({ deleted: data ?? 0, via: "rpc" });
}

// Also allow POST for manual triggers
export async function POST(req: NextRequest) {
  return GET(req);
}
