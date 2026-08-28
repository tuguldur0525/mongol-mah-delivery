import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Vercel Cron / manual cleanup for abandoned Wire orders.
 * Deletes pending (gateway quit) and cancelled/failed orders after 24 hours
 * (keeps transaction history for 24h instead of 10 min).
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

  // Prefer RPC (handles index + returns count, 24h retention)
  const { data, error } = await supabase.rpc("cleanup_expired_pending_orders");

  if (error) {
    // Fallback direct delete if RPC not yet migrated (24h)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    // delete pending 24h+ and cancelled/failed 24h+
    const { error: delError, count } = await supabase
      .from("orders")
      .delete({ count: "exact" })
      .in("payment_status", ["pending", "cancelled", "failed"])
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
