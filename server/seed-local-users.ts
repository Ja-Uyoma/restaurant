import pg from "pg";
import { hashPassword } from "./local-auth.js";

const connectionString = process.env.LOCAL_DATABASE_URL;

if (process.env.NODE_ENV === "production" || !connectionString) {
  throw new Error(
    "Set LOCAL_DATABASE_URL in a non-production environment to seed local users.",
  );
}

const pool = new pg.Pool({ connectionString, max: 1 });
const client = await pool.connect();
const users = [
  {
    username: "admin",
    displayName: "Local Admin",
    password: process.env.LOCAL_AUTH_ADMIN_PASSWORD || "admin123",
    role: "admin",
  },
  {
    username: "customer",
    displayName: "Local Customer",
    password: process.env.LOCAL_AUTH_CUSTOMER_PASSWORD || "customer123",
    role: "customer",
  },
] as const;

try {
  await client.query("BEGIN");
  for (const user of users) {
    const passwordHash = await hashPassword(user.password);
    const result = await client.query<{ id: string }>(
      `INSERT INTO local_auth_users (username, display_name, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO UPDATE
       SET display_name = EXCLUDED.display_name,
           password_hash = EXCLUDED.password_hash
       RETURNING id`,
      [user.username, user.displayName, passwordHash],
    );
    const id = result.rows[0]?.id;
    if (!id) {
      throw new Error(`Unable to seed the ${user.username} local account.`);
    }

    await client.query(
      `INSERT INTO app_user_roles (auth_provider, auth_user_id, role)
       VALUES ('local', $1, $2)
       ON CONFLICT (auth_provider, auth_user_id) DO UPDATE
       SET role = EXCLUDED.role, updated_at = now()`,
      [id, user.role],
    );
  }
  await client.query("COMMIT");
  console.log("Seeded local admin and customer accounts.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
