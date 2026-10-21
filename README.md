# Bella Tavola

The project is split into two standalone packages:

- `client/` — React, Vite, and Tailwind CSS frontend.
- `server/` — Express API.

## Development

Install the frontend dependencies and start Vite:

```sh
cd client
pnpm install
pnpm dev
```

In another terminal, install the API dependencies and start Express:

```sh
cd server
npm install
npm run dev
```

The client proxies `/api` requests to the Express server at `http://localhost:3000`.
The starter health endpoint is available at `/api/health`.
