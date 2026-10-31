import { createAuthClient } from "@neondatabase/auth";

export const isLocalAuth = import.meta.env.VITE_AUTH_MODE === "local";
export const authClient = isLocalAuth
  ? null
  : createAuthClient(import.meta.env.VITE_NEON_AUTH_URL);
