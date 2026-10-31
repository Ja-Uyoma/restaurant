# Bella Tavola

The project is split into separate packages:

- `client/` — React, Vite, and Tailwind CSS frontend.
- `server/` — Express API backed by local PostgreSQL for development and Neon
  Postgres/Neon Auth in production.
- `neon.ts` — Neon service configuration for the linked `production` branch.

## Local development

Use Node.js 22.12 or newer.

Start the local PostgreSQL database with Docker Compose from the repository
root:

```sh
docker compose up -d db
```

The root `.env.local` contains `LOCAL_DATABASE_URL`, which points the server and
migrations at this local database. Keep that file private; it is ignored by Git.
When `LOCAL_DATABASE_URL` is set, local development uses cookie-based local auth
against PostgreSQL; production continues to use Neon Managed Auth.

Install frontend dependencies and start Vite:

```sh
cd client
pnpm install
pnpm dev
```

In another terminal, install the API dependencies, apply database migrations,
and start Express:

```sh
cd server
pnpm install
pnpm migrate
pnpm seed:local-users
pnpm dev
```

Vite proxies `/api` to Express on `http://localhost:3000`. The menu is read from
the `menu_categories` and `menu_items` tables; `pnpm migrate` creates and seeds
them, creates the auth/role tables, and creates the `orders` and `order_items`
tables. Each order belongs to a customer and records its payment status; each
order item snapshots the purchased item name, quantity, and unit price. The
server uses `LOCAL_DATABASE_URL` for local requests and migrations.
Without that setting, it uses pooled `DATABASE_URL` for requests and prefers
`DATABASE_URL_UNPOOLED` for migrations.

Local demo accounts:

| Role | Username | Default password |
| --- | --- | --- |
| Admin | `admin` | `admin123` |
| Customer | `customer` | `customer123` |

These are development-only credentials. Override them with
`LOCAL_AUTH_ADMIN_PASSWORD` and `LOCAL_AUTH_CUSTOMER_PASSWORD` in `.env.local`,
then rerun `pnpm seed:local-users` to update the stored password hashes. Local
sign-up creates customer accounts only. Passwords are stored as scrypt hashes;
the browser session is an HTTP-only cookie. Set `LOCAL_AUTH_SECRET` in
`.env.local` if local sessions should remain valid after restarting the API.
Never enable local auth in production.

The API returns each authenticated user's `admin` or `customer` role from the
`app_user_roles` table. Admin-only and customer-only checks are available at
`GET /api/admin/check` and `GET /api/customer/check`. Unmapped Neon Auth users
default to the customer role. To assign a role to a production Neon Auth user,
use that user's ID from `GET /api/me` and explicitly point the command at the
production application database:

```sh
APP_ROLE_DATABASE_URL='postgresql://…' pnpm --dir server set-role neon AUTH_USER_ID admin
```

The command only accepts an explicit `APP_ROLE_DATABASE_URL` to avoid changing
the wrong database accidentally.

Stop the local database with `docker compose down`; its named volume keeps the
database data between starts. To remove the local database and its data, use
`docker compose down -v`.

The header auth popover uses username/password sign-in for local accounts and
supports local customer sign-up and sign-out. In production, it uses Neon Auth
email/password sign-up, sign-in, and sign-out, and Express verifies Neon tokens
against the branch JWKS.

## Hosting configuration

The frontend GitHub Pages workflow reads these repository Actions variables:

- `NEON_AUTH_BASE_URL` — the public Neon Auth URL for the `production` branch.
- `RESTAURANT_API_URL` — the deployed Express API origin, without a trailing slash.

The Express host must provide `DATABASE_URL`, `NEON_AUTH_BASE_URL`, and
`NEON_AUTH_JWKS_URL`. Set `CLIENT_ORIGINS` to a comma-separated list containing
the deployed frontend origin so the browser can call the API. Deploy the API
separately from GitHub Pages. Add the deployed frontend origin (scheme and
hostname only) to Neon Auth's trusted domains before enabling production
sign-in. Run `pnpm migrate` against the production `DATABASE_URL` before
deploying the API so the menu and app-role tables exist. Production does not
need `LOCAL_DATABASE_URL`; the server continues to use the managed Neon
`DATABASE_URL`.

Build and start the compiled TypeScript API with `pnpm build` and `pnpm start`
from `server/`.
