import pg from "pg";

const [provider, authUserId, role] = process.argv.slice(2);
const connectionString = process.env.APP_ROLE_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Set APP_ROLE_DATABASE_URL to the application database before assigning a role.",
  );
}
if (provider !== "neon") {
  throw new Error("The role assignment provider must be 'neon'.");
}
if (!authUserId) {
  throw new Error("Pass the Neon Auth user ID from GET /api/me.");
}
if (role !== "admin" && role !== "customer") {
  throw new Error("The role must be 'admin' or 'customer'.");
}

const pool = new pg.Pool({ connectionString, max: 1 });

try {
  await pool.query(
    `INSERT INTO app_user_roles (auth_provider, auth_user_id, role)
     VALUES ('neon', $1, $2)
     ON CONFLICT (auth_provider, auth_user_id) DO UPDATE
     SET role = EXCLUDED.role, updated_at = now()`,
    [authUserId, role],
  );
  console.log(`Assigned ${role} role to Neon Auth user ${authUserId}.`);
} finally {
  await pool.end();
}
