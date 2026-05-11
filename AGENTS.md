# Toko Online — Agent Guide

Laravel 13 + React 18 / Inertia 2 SPA + Tailwind CSS 3 (DaisyUI via CDN).  
Indonesian e-commerce: Midtrans payments, RajaOngkir shipping, Bahasa Indonesia throughout.

## Dev Commands

| Command | What it does |
|---------|-------------|
| `composer dev` | Runs 4 parallel processes: `php artisan serve`, `queue:listen`, `pail` (logs), `npm run dev` (Vite) |
| `composer setup` | Full project init: `composer install` → copy `.env` → `key:generate` → `migrate` → `npm install` → `npm run build` |
| `npm run dev` | Vite dev server only (HMR for JS/CSS) |
| `npm run build` | Production Vite build |
| `npm run lint` | ESLint on `resources/js` + `--fix` |
| `php artisan test` | Run all Pest tests |
| `composer test` | `config:clear` then `php artisan test` |

## Architecture

**Dual auth system** — two completely separate auths:
- **Customers**: Standard Laravel `User` model, `auth` middleware, Breeze scaffolding (register/login/password reset/email verify). Google OAuth via Socialite.
- **Admins**: Custom `Pengguna` model + `Role` model, session-based auth (`pengguna.session` middleware checks `session('pengguna')`). Admin routes under `/admin/*` prefix.

**Two cart systems** coexist:
- `/keranjang/*` — public routes (no middleware), uses user ID as URL param. Controller in `app/Http/Controllers/app/` (lowercase `app` namespace).
- `/cart/*` — auth-gated (customer `User`), shared via Inertia props in `HandleInertiaRequests`.

**Controller namespace quirk**: `app/Http/Controllers/app/KeranjangController.php` and `app/Http/Controllers/app/ProfilController.php` use lowercased `app\` namespace. On case-sensitive filesystems (Linux), these will break. The other controllers use `App\` (uppercase).

**Typo in codebase**: `app/Http/Controllers/admin/ProdukCotroller.php` (missing `n` in "Controller"). Referenced in routes as `ProdukCotroller`.

**Inertia shared props** (from `HandleInertiaRequests`):
- `auth.user` — logged-in customer (`User` model)
- `pengguna` — logged-in admin (session data)
- `cart` — customer's cart items (eager-loaded with `produk.gambarproduk`)
- `flash.success` / `flash.error`

**CDN-loaded frontend deps** (not npm): DaisyUI, Tailwind CDN script, FontAwesome, Leaflet, DataTables, SweetAlert2 — all in `resources/views/app.blade.php`.

## Test

- **Pest PHP v4** with `phpunit.xml` config. Feature tests use `RefreshDatabase` trait + SQLite `:memory:`.
- `npm run lint` for JS/JSX (ESLint + Prettier).
- No PHP linter configured beyond defaults (Laravel Pint absent from `composer.json`, but StyleCI has `.styleci.yml`).

## Key Database Tables (non-default)

`kategoris`, `produks`, `gambarprodks`, `keranjangs`, `orders`, `order_items`, `pembayarans`, `roles`, `penggunas`, `profils`, `alamats`, `product_reviews`

## Infrastructure Notes

- Queue worker: `php artisan queue:listen` (included in `composer dev`).
- Vite entry: `resources/js/app.jsx` → React + Inertia.
- Blade root template: `resources/views/app.blade.php`.
- `.npmrc` sets `ignore-scripts=true` — `npm run build`/`dev` work, but `postinstall` hooks do not run.
- `.env` contains **live** credentials (Google OAuth, Midtrans). Do not commit.
