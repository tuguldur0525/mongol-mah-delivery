# МАХ ДЕЛІВЕРІ — Meat Ordering Web App

Mongolian online meat ordering app with Wire payment gateway integration,
atomic inventory management and an admin dashboard.

- **Stack**: Next.js (App Router) · TypeScript · Tailwind CSS · framer-motion · Supabase (Postgres, Auth, RLS) · Wire payment gateway

## Features

### Customer

- Browse categories (Үхэр / Адуу / Хонь / Ямаа / Тахиа) and products
- Quantity in kg (0.5 presets + custom), stock-aware validation
- Guest checkout — no login required
- Wire hosted checkout payment (QR / bank deeplink)
- Order status tracking by order number, live "Төлбөрийг шалгаж байна..." polling
- Payment cancel page with retry (no duplicate orders)

### Admin (`/admin`)

- Dashboard: today's orders, sales, pending payments, low-stock alerts
- Order management: search/filter, status changes, cancel (auto stock restore)
- Manual order creation (paid orders deduct stock atomically)
- Product CRUD with availability toggle
- Inventory: add stock, adjustments, full transaction history

### Payment security model

- Order totals are always computed **server-side** from DB prices
- Payment success is confirmed **only** via verified Wire webhook + API
  double-check of the PaymentIntent (`status === "succeeded"`)
- Webhook signature verified (`WirePayment-Signature`, HMAC-SHA256 over `"<t>.<body>"`)
- Idempotent webhook processing (`webhook_events` unique on `provider + external_event_id`)
- Stock deduction is a single Postgres transaction (`process_paid_order` RPC) —
  concurrent orders can never oversell; duplicate webhooks never deduct twice
- Amount + currency (MNT) validated against the order before fulfillment

## Setup

### 1. Install

```bash
npm install
cp .env.example .env.local   # fill in values
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL migrations in order in the SQL editor:
   - `supabase/migrations/0001_schema.sql`
   - `supabase/migrations/0002_rpcs.sql`
   - `supabase/migrations/0003_rls.sql`
   - `supabase/migrations/0004_seed.sql`
3. Copy `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and
   `NEXT_PUBLIC_SUPABASE_SECRET_KEY` from Project Settings → API.

### 3. Admin user

1. Supabase Dashboard → Authentication → Users → **Add user** (email + password).
2. In the SQL editor:

```sql
insert into public.profiles (id, is_admin) values ('<user-uuid>', true);
```

3. Log in at `/admin/login`.

### 4. Wire payment gateway

1. Sign up at [wire.mn](https://wire.mn), create a project, copy the test key
   (`sk_test_...`) into `WIRE_API_KEY`.
2. Create a webhook endpoint (dashboard or API) pointing to
   `https://your-domain.com/api/webhooks/wire` with events
   `payment_intent.succeeded`, `payment_intent.payment_failed`,
   `payment_intent.canceled`. Copy the `whsec_...` secret into
   `WIRE_WEBHOOK_SECRET`.
3. `WIRE_ALLOWED_OPERATORS` is optional. Leave it empty to let Wire select an
   available operator, or set it to the exact operator slug(s) shown in your
   Wire project. Do not use `sandbox` with a live API key.
4. Set `NEXT_PUBLIC_SITE_URL` to your public HTTPS URL
   (`https://mongol-mah.vercel.app`) — it is used for Wire `success_url` /
   `cancel_url` redirects. Do not use a protected Vercel preview URL.

### 5. Run

```bash
npm run dev
```

## Payment flow

```
Checkout → server validates cart/prices/stock
        → creates order (pending) + order_items (price snapshot)
            → Wire PaymentIntent + checkout session (per-attempt idempotency keys)
        → redirect to pay.wire.mn hosted checkout
        → customer pays (QR / bank deeplink)
        → Wire webhook → signature verify → idempotency claim
        → PaymentIntent re-fetched from Wire API (double check)
        → process_paid_order RPC: marks paid + deducts stock atomically
        → /payment/success polls order status (UX only, never authoritative)
```

## Key files

| Path                                 | Purpose                                                 |
| ------------------------------------ | ------------------------------------------------------- |
| `src/lib/wire/`                      | Server-only Wire client, payments, webhook verification |
| `src/app/api/webhooks/wire/route.ts` | Verified + idempotent webhook handler                   |
| `src/actions/orders.ts`              | Guest order creation, retry payment                     |
| `src/actions/payments.ts`            | Payment fulfillment (RPC call)                          |
| `src/actions/inventory.ts`           | Stock ops, cancel, manual orders                        |
| `supabase/migrations/0002_rpcs.sql`  | Atomic stock/payment RPCs                               |

## Test cases covered

- Duplicate webhook → unique event constraint, no double deduction
- Invalid signature → 400, nothing processed
- Amount/currency mismatch → RPC raises `AMOUNT_MISMATCH`, order stays unpaid
- Insufficient stock at fulfillment → RPC raises `INSUFFICIENT_STOCK`, admin review
- Concurrent orders → row-level locking inside `process_paid_order`
- Cancelled paid order → `restore_paid_order_stock` + `RETURN` transaction
- Admin paid manual order → immediate atomic deduction
- Zero stock → "ДУУССАН", ordering disabled
