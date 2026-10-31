import cors from "cors";
import { randomBytes } from "node:crypto";
import express, {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import { createRemoteJWKSet, errors, jwtVerify, type JWTPayload } from "jose";
import pg from "pg";
import Stripe from "stripe";
import {
  createLocalSession,
  getClearedSessionCookie,
  getLocalSessionToken,
  getSessionCookie,
  verifyLocalSession,
  hashPassword,
  verifyPassword,
  type AppRole,
} from "./local-auth.js";

declare const process: {
  env: Record<string, string | undefined>;
};

const { Pool } = pg;
type AuthPayload = JWTPayload & {
  sub: string;
  email?: unknown;
  username?: unknown;
  name?: unknown;
};
type AuthProvider = "local" | "neon";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
      authProvider?: AuthProvider;
    }
  }
}

type MenuRow = {
  category_name: string;
  item_id: string | null;
  item_name: string | null;
  item_description: string | null;
  item_price: number | null;
  image_url: string | null;
  image_alt: string | null;
};

interface MenuCategory {
  title: string;
  items: {
    id: string;
    imgUrl: string;
    imgAlt: string;
    itemName: string;
    itemDescription: string;
    itemPrice: number;
  }[];
}

const port = Number(process.env.PORT || 3000);
const isLocalDatabase = Boolean(process.env.LOCAL_DATABASE_URL);
const databaseUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;
const authBaseUrl = process.env.NEON_AUTH_BASE_URL;
const authJwksUrl = process.env.NEON_AUTH_JWKS_URL;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const isProduction = process.env.NODE_ENV === "production";
const localAuthEnabled =
  isLocalDatabase &&
  !isProduction &&
  process.env.LOCAL_AUTH_ENABLED !== "false";
const clientBaseUrl =
  process.env.CLIENT_BASE_URL ||
  (!isProduction && isLocalDatabase ? "http://localhost:5173" : undefined);

if (!databaseUrl) {
  throw new Error("LOCAL_DATABASE_URL or DATABASE_URL must be set");
}
if (process.env.LOCAL_AUTH_ENABLED === "true" && !localAuthEnabled) {
  throw new Error(
    "Local auth can only be enabled with LOCAL_DATABASE_URL outside production.",
  );
}
if ((!authBaseUrl || !authJwksUrl) && !localAuthEnabled) {
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
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;
const authJwks = authJwksUrl ? createRemoteJWKSet(new URL(authJwksUrl)) : null;
const authIssuer = authBaseUrl ? new URL(authBaseUrl).origin : null;
const localAuthSecret =
  process.env.LOCAL_AUTH_SECRET || randomBytes(32).toString("base64url");
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
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);

app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json", limit: "1mb" }),
  async (request, response, next) => {
    if (!stripe || !stripeWebhookSecret) {
      response.status(503).json({ error: "Stripe webhooks are not configured" });
      return;
    }

    const signature = request.get("stripe-signature");
    if (!signature || !Buffer.isBuffer(request.body)) {
      response.status(400).json({ error: "A valid Stripe signature is required" });
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        stripeWebhookSecret,
      );
    } catch (error) {
      if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
        response.status(400).json({ error: "Invalid Stripe signature" });
        return;
      }
      next(error);
      return;
    }

    if (
      event.type !== "checkout.session.completed" &&
      event.type !== "checkout.session.async_payment_succeeded"
    ) {
      response.json({ received: true });
      return;
    }

    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid" || session.mode !== "payment") {
      response.json({ received: true });
      return;
    }

    const orderId = session.metadata?.orderId;
    if (
      !orderId ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        orderId,
      ) ||
      session.client_reference_id !== orderId
    ) {
      response.status(400).json({ error: "Stripe session has invalid order metadata" });
      return;
    }

    const { rows } = await pool.query<{
      id: string;
      amount_total: string;
    }>(
      `SELECT
         orders.id,
         COALESCE(
           SUM((order_items.unit_price * 100)::bigint * order_items.quantity),
           0
         )::text AS amount_total
       FROM orders
       LEFT JOIN order_items ON order_items.order_id = orders.id
       WHERE orders.id = $1 AND orders.stripe_session_id = $2
       GROUP BY orders.id`,
      [orderId, session.id],
    );
    const order = rows[0];
    if (
      !order ||
      session.currency !== "usd" ||
      session.amount_total === null ||
      BigInt(order.amount_total) !== BigInt(session.amount_total)
    ) {
      response.status(400).json({ error: "Stripe session does not match an order" });
      return;
    }

    const updateResult = await pool.query(
      `UPDATE orders
       SET status = 'paid', paid_at = COALESCE(paid_at, now())
       WHERE id = $1 AND stripe_session_id = $2 AND status IN ('pending', 'paid')`,
      [orderId, session.id],
    );
    if (updateResult.rowCount !== 1) {
      response.status(409).json({ error: "Order is not eligible for payment" });
      return;
    }

    response.json({ received: true });
  },
);

app.use(express.json({ limit: "1mb" }));

function requireLocalAuth(
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (!localAuthEnabled) {
    response.status(404).json({ error: "Local authentication is disabled" });
    return;
  }
  next();
}

function getRole(provider: AuthProvider, userId: string): Promise<AppRole> {
  return pool
    .query<{ role: AppRole }>(
      `SELECT role
       FROM app_user_roles
       WHERE auth_provider = $1 AND auth_user_id = $2`,
      [provider, userId],
    )
    .then(({ rows }) => rows[0]?.role ?? "customer");
}

async function getLocalUser(userId: string) {
  const { rows } = await pool.query<{
    id: string;
    username: string;
    display_name: string;
  }>(
    `SELECT id, username, display_name
     FROM local_auth_users
     WHERE id = $1`,
    [userId],
  );
  const user = rows[0];
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    name: user.display_name,
    email: null,
    role: await getRole("local", user.id),
  };
}

function getStringField(body: unknown, key: string): string | null {
  if (typeof body !== "object" || body === null || !(key in body)) {
    return null;
  }
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

function priceToCents(price: string): number {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(price);
  if (!match) {
    throw new Error(`Invalid menu price in database: ${price}`);
  }

  const cents = Number(match[1]) * 100 + Number((match[2] || "").padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) {
    throw new Error("Menu price exceeds the supported checkout amount");
  }
  return cents;
}

function isValidMenuItemId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[1-9]\d*$/.test(value) &&
    value.length <= 19 &&
    BigInt(value) <= 9223372036854775807n
  );
}

function setLocalSession(response: Response, userId: string): Promise<void> {
  return createLocalSession(userId, localAuthSecret).then((token) => {
    response.setHeader("Set-Cookie", getSessionCookie(token));
  });
}

app.get("/api/auth/session", requireLocalAuth, async (request, response) => {
  const token = getLocalSessionToken(request.headers.cookie);
  if (!token) {
    response.json({ user: null });
    return;
  }

  try {
    const payload = await verifyLocalSession(token, localAuthSecret);
    const user = await getLocalUser(payload.sub);
    if (!user) {
      response.setHeader("Set-Cookie", getClearedSessionCookie());
    }
    response.json({ user });
  } catch (error) {
    if (error instanceof errors.JOSEError) {
      response.setHeader("Set-Cookie", getClearedSessionCookie());
      response.json({ user: null });
      return;
    }
    throw error;
  }
});

app.post(
  "/api/auth/sign-in",
  requireLocalAuth,
  async (request, response) => {
    const username = getStringField(request.body, "username")?.trim().toLowerCase();
    const password = getStringField(request.body, "password");
    if (!username || !password) {
      response.status(400).json({ error: "Username and password are required" });
      return;
    }

    const { rows } = await pool.query<{
      id: string;
      password_hash: string;
    }>(
      `SELECT id, password_hash
       FROM local_auth_users
       WHERE username = $1`,
      [username],
    );
    const user = rows[0];
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      response.status(401).json({ error: "Invalid username or password" });
      return;
    }

    await setLocalSession(response, user.id);
    response.json({ user: await getLocalUser(user.id) });
  },
);

app.post(
  "/api/auth/sign-up",
  requireLocalAuth,
  async (request, response) => {
    const name = getStringField(request.body, "name")?.trim();
    const username = getStringField(request.body, "username")?.trim().toLowerCase();
    const password = getStringField(request.body, "password");
    if (!name || !username || !password) {
      response
        .status(400)
        .json({ error: "Name, username, and password are required" });
      return;
    }
    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      response.status(400).json({
        error: "Username must be 3–32 characters using letters, numbers, dots, underscores, or hyphens",
      });
      return;
    }
    if (password.length < 8) {
      response.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }
    if (name.length > 100) {
      response.status(400).json({ error: "Name must be 100 characters or fewer" });
      return;
    }

    const passwordHash = await hashPassword(password);
    const client = await pool.connect();
    let userId: string;

    try {
      await client.query("BEGIN");
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO local_auth_users (username, display_name, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [username, name, passwordHash],
      );
      const id = rows[0]?.id;
      if (!id) {
        throw new Error("Unable to create the local account");
      }
      await client.query(
        `INSERT INTO app_user_roles (auth_provider, auth_user_id, role)
         VALUES ('local', $1, 'customer')`,
        [id],
      );
      await client.query("COMMIT");
      userId = id;
    } catch (error) {
      await client.query("ROLLBACK");
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "23505"
      ) {
        response.status(409).json({ error: "That username is already taken" });
        return;
      }
      throw error;
    } finally {
      client.release();
    }

    await setLocalSession(response, userId);
    response.status(201).json({ user: await getLocalUser(userId) });
  },
);

app.post(
  "/api/auth/sign-out",
  requireLocalAuth,
  (_request, response) => {
    response.setHeader("Set-Cookie", getClearedSessionCookie());
    response.status(204).end();
  },
);

app.get("/api/health", async (_request, response) => {
  await pool.query("SELECT 1");
  response.json({ status: "ok", database: "ok" });
});

app.get("/api/menu", async (_request, response) => {
  const { rows } = await pool.query<MenuRow>(`
    SELECT
      category.name AS category_name,
      item.id::text AS item_id,
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
  const categories: MenuCategory[] = [];

  for (const row of rows) {
    let category = categories.at(-1);

    if (!category || category.title !== row.category_name) {
      category = { title: row.category_name, items: [] };
      categories.push(category);
    }

    if (
      row.item_id !== null &&
      row.item_name !== null &&
      row.item_description !== null &&
      row.item_price !== null &&
      row.image_url !== null &&
      row.image_alt !== null
    ) {
      category.items.push({
        id: row.item_id,
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

app.post("/api/checkout-session", requireAuth, async (request, response) => {
  if (!stripe || !stripeWebhookSecret || !clientBaseUrl) {
    response.status(503).json({ error: "Stripe checkout is not configured" });
    return;
  }
  if (!request.auth?.sub || !request.authProvider) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(clientBaseUrl);
  } catch {
    response.status(503).json({ error: "CLIENT_BASE_URL is not a valid URL" });
    return;
  }
  if (baseUrl.protocol !== "http:" && baseUrl.protocol !== "https:") {
    response.status(503).json({ error: "CLIENT_BASE_URL must use HTTP or HTTPS" });
    return;
  }

  const body =
    typeof request.body === "object" && request.body !== null
      ? (request.body as Record<string, unknown>)
      : null;
  const rawItems = body?.items;
  if (!Array.isArray(rawItems) || rawItems.length < 1 || rawItems.length > 20) {
    response.status(400).json({ error: "Cart must contain between 1 and 20 items" });
    return;
  }

  const items: { menuItemId: string; quantity: number }[] = [];
  const seenIds = new Set<string>();
  for (const rawItem of rawItems) {
    if (typeof rawItem !== "object" || rawItem === null) {
      response.status(400).json({ error: "Each cart item must be an object" });
      return;
    }

    const item = rawItem as Record<string, unknown>;
    const menuItemId = item.menuItemId;
    const quantity = item.quantity;
    if (
      !isValidMenuItemId(menuItemId) ||
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 20
    ) {
      response.status(400).json({
        error: "Each cart item needs a valid menuItemId and a quantity from 1 to 20",
      });
      return;
    }
    if (seenIds.has(menuItemId)) {
      response.status(400).json({ error: "Cart item IDs must be unique" });
      return;
    }

    seenIds.add(menuItemId);
    items.push({ menuItemId, quantity });
  }

  const itemIds = items.map((item) => item.menuItemId);
  const { rows: menuRows } = await pool.query<{
    id: string;
    name: string;
    price: string;
  }>(
    `SELECT id::text, name, price::text
     FROM menu_items
     WHERE id = ANY($1::bigint[]) AND available = true`,
    [itemIds],
  );
  if (menuRows.length !== items.length) {
    response.status(400).json({ error: "Cart contains unavailable menu items" });
    return;
  }

  const menuById = new Map<
    string,
    { id: string; name: string; price: string; unitAmount: number }
  >();
  for (const menuItem of menuRows) {
    menuById.set(menuItem.id, {
      ...menuItem,
      unitAmount: priceToCents(menuItem.price),
    });
  }
  const database = await pool.connect();
  let orderId: string;
  try {
    await database.query("BEGIN");
    const { rows: orderRows } = await database.query<{ id: string }>(
      `INSERT INTO orders (customer_id)
       VALUES ($1)
       RETURNING id`,
      [`${request.authProvider}:${request.auth.sub}`],
    );
    const insertedOrderId = orderRows[0]?.id;
    if (!insertedOrderId) {
      throw new Error("Unable to create the order");
    }
    orderId = insertedOrderId;

    for (const item of items) {
      const menuItem = menuById.get(item.menuItemId);
      if (!menuItem) {
        throw new Error("A validated menu item is missing from the order");
      }
      await database.query(
        `INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, menuItem.id, menuItem.name, item.quantity, menuItem.price],
      );
    }
    await database.query("COMMIT");
  } catch (error) {
    try {
      await database.query("ROLLBACK");
    } catch (rollbackError) {
      throw new AggregateError(
        [error, rollbackError],
        "Order creation failed and the database transaction could not be rolled back",
      );
    }
    throw error;
  } finally {
    database.release();
  }

  const successUrl =
    `${new URL("/", baseUrl).toString()}?checkout=success` +
    "&session_id={CHECKOUT_SESSION_ID}";
  const cancelUrl = `${new URL("/", baseUrl).toString()}?checkout=cancelled`;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: orderId,
    metadata: { orderId },
    line_items: items.map((item) => {
      const menuItem = menuById.get(item.menuItemId);
      if (!menuItem) {
        throw new Error("A validated menu item is missing from the checkout");
      }
      return {
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: menuItem.unitAmount,
          product_data: { name: menuItem.name },
        },
      };
    }),
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  if (!session.url) {
    await stripe.checkout.sessions.expire(session.id);
    throw new Error("Stripe did not return a checkout URL");
  }

  const updateResult = await pool.query(
    `UPDATE orders
     SET stripe_session_id = $2
     WHERE id = $1 AND status = 'pending'`,
    [orderId, session.id],
  );
  if (updateResult.rowCount !== 1) {
    try {
      await stripe.checkout.sessions.expire(session.id);
    } catch (error) {
      console.error("Could not expire an unlinked Stripe checkout session", error);
    }
    throw new Error("Unable to associate the Stripe session with its order");
  }

  response.status(201).json({ orderId, checkoutUrl: session.url });
});

app.get(
  "/api/orders/by-session/:sessionId",
  requireAuth,
  async (request, response) => {
    if (!request.auth?.sub || !request.authProvider) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }

    const sessionId = request.params.sessionId;
    if (
      typeof sessionId !== "string" ||
      !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)
    ) {
      response.status(400).json({ error: "Invalid checkout session ID" });
      return;
    }

    const { rows } = await pool.query<{
      id: string;
      status: "pending" | "paid" | "failed" | "canceled";
      currency: string;
      paid_at: Date | null;
      total: string;
    }>(
      `SELECT
         orders.id,
         orders.status,
         orders.currency,
         orders.paid_at,
         COALESCE(
           SUM(order_items.unit_price * order_items.quantity),
           0
         )::text AS total
       FROM orders
       LEFT JOIN order_items ON order_items.order_id = orders.id
       WHERE orders.stripe_session_id = $1
         AND orders.customer_id = $2
       GROUP BY orders.id`,
      [sessionId, `${request.authProvider}:${request.auth.sub}`],
    );
    const order = rows[0];
    if (!order) {
      response.status(404).json({ error: "Order not found" });
      return;
    }

    const { rows: items } = await pool.query<{
      name: string;
      quantity: number;
      unit_price: string;
    }>(
      `SELECT item_name AS name, quantity, unit_price::text
       FROM order_items
       WHERE order_id = $1
       ORDER BY id`,
      [order.id],
    );

    response.json({
      order: {
        id: order.id,
        status: order.status,
        currency: order.currency,
        paidAt: order.paid_at,
        total: order.total,
        items,
      },
    });
  },
);

async function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const localToken = localAuthEnabled
    ? getLocalSessionToken(request.headers.cookie)
    : null;
  if (localToken) {
    try {
      const payload = await verifyLocalSession(localToken, localAuthSecret);
      const user = await getLocalUser(payload.sub);
      if (!user) {
        response.setHeader("Set-Cookie", getClearedSessionCookie());
        response.status(401).json({ error: "Invalid or expired session" });
        return;
      }
      request.auth = { sub: user.id, username: user.username, name: user.name };
      request.authProvider = "local";
      next();
      return;
    } catch (error) {
      if (error instanceof errors.JOSEError) {
        response.setHeader("Set-Cookie", getClearedSessionCookie());
        response.status(401).json({ error: "Invalid or expired session" });
        return;
      }
      next(error);
      return;
    }
  }

  const [scheme, token, ...extra] = (request.get("authorization") || "").split(
    " ",
  );

  if (scheme !== "Bearer" || !token || extra.length > 0) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  if (!authJwks || !authIssuer) {
    response.status(503).json({
      error: "Neon authentication is not configured for this API",
    });
    return;
  }

  try {
    const { payload } = await jwtVerify<AuthPayload>(token, authJwks, {
      issuer: authIssuer,
      requiredClaims: ["sub"],
    });
    request.auth = payload;
    request.authProvider = "neon";
    next();
  } catch (error) {
    if (error instanceof errors.JOSEError) {
      response.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    next(error);
  }
}

function requireRole(role: AppRole): RequestHandler {
  return async (request, response, next) => {
    if (!request.auth?.sub || !request.authProvider) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }

    if ((await getRole(request.authProvider, request.auth.sub)) !== role) {
      response.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}

app.get("/api/me", requireAuth, async (request, response) => {
  if (!request.auth?.sub) {
    response.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const role = await getRole(
    request.authProvider || "neon",
    request.auth.sub,
  );
  response.json({
    user: {
      id: request.auth.sub,
      email: typeof request.auth.email === "string" ? request.auth.email : null,
      username:
        typeof request.auth.username === "string"
          ? request.auth.username
          : null,
      name: typeof request.auth.name === "string" ? request.auth.name : null,
      role,
    },
  });
});

app.get(
  "/api/admin/check",
  requireAuth,
  requireRole("admin"),
  (_request, response) => {
    response.json({ access: "admin" });
  },
);

app.get(
  "/api/customer/check",
  requireAuth,
  requireRole("customer"),
  (_request, response) => {
    response.json({ access: "customer" });
  });

const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  console.error(error);
  response.status(500).json({ error: "Internal server error" });
};

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Restaurant API listening on port ${port}`);
});
