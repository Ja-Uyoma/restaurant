# Bella Tavola

The project is split into separate packages:

- `client/` — React, Vite, and Tailwind CSS frontend.
- `server/` — Express API backed by Neon Postgres and Neon Auth.
- `neon.ts` — Neon service configuration for the linked `production` branch.

## Local development

Use Node.js 22.12 or newer.

The Neon CLI writes local connection and Auth settings to the root `.env.local`.
Keep that file private; it is ignored by Git.

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
them. The server uses pooled `DATABASE_URL` for requests and prefers
`DATABASE_URL_UNPOOLED` for migrations.

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
sign-in.
