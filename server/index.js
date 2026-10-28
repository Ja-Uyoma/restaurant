import cors from "cors";
import express from "express";
import { createRemoteJWKSet, errors, jwtVerify } from "jose";
import pg from "pg";

const { Pool } = pg;
const port = Number(process.env.PORT || 3000);
const isLocalDatabase = Boolean(process.env.LOCAL_DATABASE_URL);
const databaseUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;
const authBaseUrl = process.env.NEON_AUTH_BASE_URL;
const authJwksUrl = process.env.NEON_AUTH_JWKS_URL;

if (!databaseUrl) {
  throw new Error("LOCAL_DATABASE_URL or DATABASE_URL must be set");
}
if ((!authBaseUrl || !authJwksUrl) && !isLocalDatabase) {
  throw new Error("NEON_AUTH_BASE_URL and NEON_AUTH_JWKS_URL must be set");
}
if (Boolean(authBaseUrl) !== Boolean(authJwksUrl)) {
  throw new Error(
    "NEON_AUTH_BASE_URL and NEON_AUTH_JWKS_URL must both be set when configuring Neon Auth",
  );
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});
const authJwks = authJwksUrl
  ? createRemoteJWKSet(new URL(authJwksUrl))
  : null;
const authIssuer = authBaseUrl ? new URL(authBaseUrl).origin : null;
const allowedOrigins = new Set(
  (process.env.CLIENT_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

const app = express();
app.disable("x-powered-by");

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.has(origin));
    },
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (_request, response) => {
  await pool.query("SELECT 1");
  response.json({ status: "ok", database: "ok" });
});

app.get("/api/menu", async (_request, response) => {
  const { rows } = await pool.query(`
    SELECT
      category.name AS category_name,
      item.name AS item_name,
      item.description AS item_description,
      item.price::float8 AS item_price,
      item.image_url,
      item.image_alt
    FROM menu_categories AS category
    LEFT JOIN menu_items AS item
      ON item.category_id = category.id AND item.available = true
    ORDER BY category.sort_order, item.sort_order
  `);
  const categories = [];

  for (const row of rows) {
    let category = categories.at(-1);

    if (!category || category.title !== row.category_name) {
      category = { title: row.category_name, items: [] };
      categories.push(category);
    }

    if (row.item_name) {
      category.items.push({
        imgUrl: row.image_url,
        imgAlt: row.image_alt,
        itemName: row.item_name,
        itemDescription: row.item_description,
        itemPrice: row.item_price,
      });
    }
  }

  response.json(categories);
});

async function requireAuth(request, response, next) {
  if (!authJwks || !authIssuer) {
    return response
      .status(503)
      .json({ error: "Authentication is not configured for this API" });
  }

  const [scheme, token, ...extra] = (request.get("authorization") || "").split(
    " ",
  );

  if (scheme !== "Bearer" || !token || extra.length > 0) {
    return response.status(401).json({ error: "Authentication required" });
  }

  try {
    const { payload } = await jwtVerify(token, authJwks, {
      issuer: authIssuer,
    });
    request.auth = payload;
    return next();
  } catch (error) {
    if (error instanceof errors.JOSEError) {
      return response.status(401).json({ error: "Invalid or expired token" });
    }

    return next(error);
  }
}

app.get("/api/me", requireAuth, (request, response) => {
  response.json({
    user: {
      id: request.auth.sub,
      email: request.auth.email || null,
    },
  });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Restaurant API listening on port ${port}`);
});
