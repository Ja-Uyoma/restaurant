import cors from "cors";
import express from "express";
import { createRemoteJWKSet, errors, jwtVerify } from "jose";
import pg from "pg";

const { Pool } = pg;
const port = Number(process.env.PORT || 3000);
const databaseUrl = process.env.DATABASE_URL;
const authBaseUrl = process.env.NEON_AUTH_BASE_URL;
const authJwksUrl = process.env.NEON_AUTH_JWKS_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set");
}
if (!authBaseUrl || !authJwksUrl) {
  throw new Error("NEON_AUTH_BASE_URL and NEON_AUTH_JWKS_URL must be set");
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});
const authJwks = createRemoteJWKSet(new URL(authJwksUrl));
const authIssuer = new URL(authBaseUrl).origin;
const allowedOrigins = new Set(
  (process.env.CLIENT_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const staffUserIds = new Set(
  (process.env.STAFF_USER_IDS || "")
    .split(",")
    .map((id) => id.trim())
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

app.get(
  "/api/staff/menu/categories",
  requireAuth,
  requireStaff,
  async (_request, response) => {
    const { rows } = await pool.query(
      "SELECT name FROM menu_categories ORDER BY sort_order",
    );
    response.json(rows.map((row) => row.name));
  },
);

app.post(
  "/api/staff/menu/items",
  requireAuth,
  requireStaff,
  async (request, response) => {
    const { category, name, description, price, imageUrl, imageAlt } =
      request.body ?? {};
    const parsedPrice = Number(price);

    if (
      typeof category !== "string" ||
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 120 ||
      typeof description !== "string" ||
      !description.trim() ||
      description.trim().length > 1000 ||
      !/^\d{1,8}(?:\.\d{1,2})?$/.test(String(price)) ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0 ||
      typeof imageUrl !== "string" ||
      !imageUrl.trim() ||
      imageUrl.trim().length > 2048 ||
      typeof imageAlt !== "string" ||
      !imageAlt.trim() ||
      imageAlt.trim().length > 255
    ) {
      return response
        .status(400)
        .json({ error: "Enter valid menu item details." });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const categoryResult = await client.query(
        "SELECT id FROM menu_categories WHERE name = $1 FOR UPDATE",
        [category],
      );
      if (categoryResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return response.status(400).json({ error: "Choose a valid category." });
      }

      const { rows } = await client.query(
        `INSERT INTO menu_items (
          category_id,
          name,
          description,
          price,
          image_url,
          image_alt,
          sort_order
        )
        SELECT
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          COALESCE(MAX(sort_order), 0) + 1
        FROM menu_items
        WHERE category_id = $1
        RETURNING id, name`,
        [
          categoryResult.rows[0].id,
          name.trim(),
          description.trim(),
          parsedPrice,
          imageUrl.trim(),
          imageAlt.trim(),
        ],
      );

      await client.query("COMMIT");
      return response.status(201).json({ item: rows[0] });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") {
        return response.status(409).json({
          error: "An item with that name already exists in this category.",
        });
      }
      throw error;
    } finally {
      client.release();
    }
  },
);

async function requireAuth(request, response, next) {
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

function requireStaff(request, response, next) {
  if (staffUserIds.size === 0) {
    return response
      .status(503)
      .json({ error: "Staff access is not configured on the server." });
  }
  if (!staffUserIds.has(request.auth.sub)) {
    return response
      .status(403)
      .json({ error: "This account is not approved for staff access." });
  }
  return next();
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
