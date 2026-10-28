# Bella Tavola

The project is split into separate packages:

- `client/` — React, Vite, and Tailwind CSS frontend.
- `server/` — Express API backed by Neon Postgres and Neon Auth.
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
The existing Neon `DATABASE_URL` remains available as a database fallback when
`LOCAL_DATABASE_URL` is unset, and the Neon Auth settings remain configured for
local sign-in.

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
pnpm dev
```

Vite proxies `/api` to Express on `http://localhost:3000`. The menu is read from
the `menu_categories` and `menu_items` tables; `pnpm migrate` creates and seeds
them. The server uses `LOCAL_DATABASE_URL` for local requests and migrations.
Without that setting, it uses pooled `DATABASE_URL` for requests and prefers
`DATABASE_URL_UNPOOLED` for migrations.

Stop the local database with `docker compose down`; its named volume keeps the
database data between starts. To remove the local database and its data, use
`docker compose down -v`.

The account panel supports Neon Auth email/password sign-up, sign-in, and
sign-out. Its protected API check obtains a Neon Auth JWT and verifies it in
Express against the branch JWKS. Authentication currently identifies users but
does not assign staff/customer roles or restrict staff-only operations.

## Hosting configuration

The frontend GitHub Pages workflow reads these repository Actions variables:

- `NEON_AUTH_BASE_URL` — the public Neon Auth URL for the `production` branch.
- `RESTAURANT_API_URL` — the deployed Express API origin, without a trailing slash.

The Express host must provide `DATABASE_URL`, `NEON_AUTH_BASE_URL`, and
`NEON_AUTH_JWKS_URL`. Set `CLIENT_ORIGINS` to a comma-separated list containing
the deployed frontend origin so the browser can call the API. Deploy the API
separately from GitHub Pages. Add the deployed frontend origin (scheme and
hostname only) to Neon Auth's trusted domains before enabling production
sign-in. Production does not need `LOCAL_DATABASE_URL`; the server continues to
use the managed Neon `DATABASE_URL`.
