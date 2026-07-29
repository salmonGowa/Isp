<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## ISP Platform API

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

Both logins take `{ "email": "...", "password": "..." }` and start a session
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
  the next invoice for every active subscriber without a current one.
- `App\Domain\Billing\Jobs\SuspendOverdueSubscribersJob` — daily at 02:00,
  marks overdue invoices, moves subscribers to `overdue` then `suspended`
  after `BILLING_SUSPEND_GRACE_DAYS`. Reactivation happens automatically
  when a payment is recorded.

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

### Explicitly out of scope this pass

Field ops/work orders, GIS mapping, full RBAC permission matrix (currently
just Sanctum guards + a simple `role` column + `role:` middleware),
reseller/partner APIs, regulatory reporting, promo codes, payment refunds,
and the real FreeRADIUS/Stripe integrations behind the two contracts above.

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

In addition, [Laracasts](https://laracasts.com) contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

You can also watch bite-sized lessons with real-world projects on [Laravel Learn](https://laravel.com/learn), where you will be guided through building a Laravel application from scratch while learning PHP fundamentals.

## Agentic Development

Laravel's predictable structure and conventions make it ideal for AI coding agents like Claude Code, Cursor, and GitHub Copilot. Install [Laravel Boost](https://laravel.com/docs/ai) to supercharge your AI workflow:

```bash
composer require laravel/boost --dev

php artisan boost:install
```

Boost provides your agent 15+ tools and skills that help agents build Laravel applications while following best practices.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
