# ISP Platform API

Laravel 13 API backend for the ISP management platform (two separate React/TS
SPAs, served same-origin at `/admin` and `/portal`, consume this API). MVP
scope only — see `app/Domain/*` for the domain-driven structure
(Subscribers, Plans, Billing, Network, Support, Staff, Auth, Shared).

### Auth

Two independent Sanctum SPA session guards — no bearer tokens are issued,
this is pure first-party session-cookie auth (`EnsureFrontendRequestsAreStateful`
via `$middleware->statefulApi()`), appropriate since both frontends are
served by this same app.

| Guard | Table | Powers | Login |
|---|---|---|---|
| `staff` | `users` | Admin/NOC console (`/admin`) | `POST /api/staff/login` |
| `subscriber` | `subscribers` | Customer portal (`/portal`) | `POST /api/portal/login` |

Both logins are rate-limited (`throttle:login`: 5/min per email+IP, 30/min
per IP). They take `{ "email": "...", "password": "..." }` and start a session
(remember to hit `GET /sanctum/csrf-cookie` first, then send the
`X-XSRF-TOKEN` header on the login POST, same as any Sanctum SPA).

Seeded dev login: `admin@latticefi.test` / `password` (role: `admin`). All
other seeded staff/subscribers also use password `password`.

### Routes

**Staff** (`auth:staff`, prefix `/api/staff`):

| Method | URI | Notes |
|---|---|---|
| POST | `/login` | public |
| POST | `/logout` | |
| GET | `/me` | |
| GET/POST/GET/PUT/DELETE | `/subscribers[/{id}]` | full CRUD |
| GET/POST/GET/PUT/DELETE | `/plans[/{id}]` | full CRUD |
| GET/POST/GET/DELETE | `/invoices[/{id}]` | no update — invoices aren't hand-edited, only created/paid/deleted |
| POST | `/invoices/{invoice}/payments` | records a manual payment via `PaymentGatewayContract` |
| GET/POST/GET/PUT/DELETE | `/network-nodes[/{id}]` | full CRUD |
| GET/POST/GET/PUT/DELETE | `/tickets[/{id}]` | full CRUD |
| GET/POST/GET/PUT/DELETE | `/staff[/{id}]` | full CRUD, **requires `role:admin`** |

**Subscriber** (`auth:subscriber`, prefix `/api/portal`):

| Method | URI | Notes |
|---|---|---|
| POST | `/login` | public |
| POST | `/logout` | |
| GET | `/me` | |
| GET | `/invoices` | scoped to the authenticated subscriber |
| GET/POST/GET | `/tickets[/{id}]` | index/store/show only, scoped to the authenticated subscriber |

Run `php artisan route:list --path=api` for the exact, current route table.

### Staff roles

Every staff role can **read** every list/detail endpoint (the console shows
all tabs). **Writes** are restricted in `routes/api.php`:

| Area | Roles allowed to write |
|---|---|
| Plans, invoices, payments, payment review, hotspot plans, reports | `admin`, `billing` |
| Subscriber create/update | `admin`, `billing`, `support` |
| Tickets create/update | `admin`, `support`, `noc` |
| Network nodes, technicians, work-order create/dispatch/delete | `admin`, `noc` |
| Work-order update (status/notes) | `admin`, `noc`, `technician` |
| Hotspot session grant/activate/revoke | `admin`, `billing`, `noc`, `support` |
| Deleting subscribers/invoices/tickets, staff accounts | `admin` |

### Payments

- **Staff** (`POST /api/staff/invoices/{id}/payments`) record *confirmed*
  payments. Partial payments are allowed; an invoice only becomes `paid`
  once confirmed payments cover its full amount. Overpaying or paying a
  paid invoice returns 422.
- **Subscribers** (`POST /api/portal/invoices/{id}/pay`, `reference`
  required) submit a *pending* claim. It does nothing to the invoice or
  account status until billing staff confirm it in the review queue
  (`GET /api/staff/payments`, `POST /api/staff/payments/{id}/confirm|reject`).
- A suspended/overdue subscriber is reactivated only once no past-due
  invoices remain. Changing plan is blocked while anything is overdue.

### Hotspot

`POST /api/hotspot/purchase` records a **pending** session; the device is
not authorized until staff verify the payment reference and call
`POST /api/staff/hotspot-sessions/{id}/activate` (the pass duration starts
then). Set `HOTSPOT_MAC_SIGNING_SECRET` in production and have the router's
login page redirect to `/hotspot?mac=<MAC>&sig=<hmac_sha256(UPPERCASE_MAC, secret)>`
so visitors can't submit someone else's MAC.

### Extension points (built as contracts, not hardcoded)

- **`App\Domain\Billing\Contracts\PaymentGatewayContract`** — bound to
  `ManualPaymentGateway` (records payments collected outside the system;
  cannot actively charge). `StripePaymentGateway` is a stub with TODOs —
  swap the binding in `BillingServiceProvider` once you're ready to take
  real payments.
- **`App\Domain\Network\Contracts\RadiusProvisionerContract`** — bound to
  `LogRadiusProvisioner`, which just logs `[RADIUS-STUB] ...` instead of
  talking to FreeRADIUS (not installed in this environment). Hooked in via
  `SubscriberObserver` → `SubscriberActivated`/`SubscriberSuspended` events →
  a queued listener, so subscriber status changes made anywhere in the app
  automatically trigger (de)provisioning once a real driver is bound.

### Background jobs

- `App\Domain\Billing\Jobs\GenerateInvoicesJob` — daily at 01:00, creates
  the next monthly invoice for every active subscriber whose last invoice
  was issued at least a month ago.
- `App\Domain\Billing\Jobs\SuspendOverdueSubscribersJob` — daily at 02:00,
  marks overdue invoices, moves subscribers to `overdue` then `suspended`
  after `BILLING_SUSPEND_GRACE_DAYS`. Reactivation happens automatically
  once confirmed payments settle every past-due invoice.

Both run on the `redis` queue connection. Run `php artisan schedule:list`
to confirm registration, and `php artisan queue:work redis` to process jobs
locally (Redis must be running — `redis-cli ping` should return `PONG`).

### Multi-tenancy (not yet, but ready)

Every core table has a nullable `tenant_id`, auto-filled to
`config('tenancy.default_id')` (env `TENANCY_DEFAULT_ID`, default `1`) via
the `App\Domain\Shared\Concerns\BelongsToTenant` trait, which also applies a
global scope. Going multi-tenant later is a matter of resolving this value
per-request instead of from config — no new migrations needed.

### Environment variables you'll need

| Variable | Purpose | Notes |
|---|---|---|
| `DB_*` | MySQL/MariaDB connection | already configured for local dev |
| `QUEUE_CONNECTION=redis`, `REDIS_*` | queue driver | requires `predis/predis` (installed) and a running Redis |
| `BROADCAST_CONNECTION` | Reverb scaffolding | set to `log` for now — actual broadcast events aren't implemented yet, flip to `reverb` (and run `php artisan reverb:start`) once they are |
| `REVERB_*`, `VITE_REVERB_*` | Reverb app credentials | placeholders are fine until real-time events are wired up |
| `TENANCY_DEFAULT_ID` | default tenant id | `1` |
| `BILLING_INVOICE_DUE_DAYS` | invoice due window | default `14` |
| `BILLING_SUSPEND_GRACE_DAYS` | suspension grace period | default `7` |
| `HOTSPOT_MAC_SIGNING_SECRET` | HMAC secret shared with the hotspot router | **set in production**; empty disables signature checks |
| `HOTSPOT_PENDING_TTL_MINUTES` | how long an unconfirmed purchase blocks another for the same MAC | default `30` |

### Explicitly out of scope this pass

GIS mapping, a fine-grained permission matrix (roles are coarse route
groups — see above),
reseller/partner APIs, regulatory reporting, promo codes, payment refunds,
and the real FreeRADIUS/Stripe integrations behind the two contracts above.

### Tests

Feature tests cover billing settlement, self-pay review, the billing
cycle, hotspot purchase/activation, plan-change guards, role access, login
throttling and WiFi-key encryption.

```bash
# phpunit.xml defaults to in-memory SQLite (needs pdo_sqlite). Against MySQL,
# point at a dedicated database — RefreshDatabase wipes whatever it targets:
DB_CONNECTION=mysql DB_DATABASE=isp_testing php artisan test
```
