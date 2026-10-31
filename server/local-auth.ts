import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const scryptAsync = promisify(scrypt);
const localIssuer = "restaurant-local-auth";
const sessionLifetime = "7d";

export type AppRole = "admin" | "customer";

export interface LocalAuthUser {
  id: string;
  username: string;
  display_name: string;
}

export interface LocalSessionPayload extends JWTPayload {
  sub: string;
}

function getSecretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  const [algorithm, salt, expectedHash] = passwordHash.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHash) {
    return false;
  }

  const expected = Buffer.from(expectedHash, "hex");
  if (expected.length !== 64) {
    return false;
  }
  const actual = (await scryptAsync(password, salt, expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createLocalSession(
  userId: string,
  secret: string,
): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(localIssuer)
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(sessionLifetime)
    .sign(getSecretKey(secret));
}

export async function verifyLocalSession(
  token: string,
  secret: string,
): Promise<LocalSessionPayload> {
  const { payload } = await jwtVerify<LocalSessionPayload>(
    token,
    getSecretKey(secret),
    {
      algorithms: ["HS256"],
      issuer: localIssuer,
      requiredClaims: ["sub"],
    },
  );
  return payload;
}

export function getSessionCookie(token: string): string {
  return `restaurant_local_session=${token}; HttpOnly; SameSite=Lax; Path=/api; Max-Age=604800`;
}

export function getClearedSessionCookie(): string {
  return "restaurant_local_session=; HttpOnly; SameSite=Lax; Path=/api; Max-Age=0";
}

export function getLocalSessionToken(cookieHeader: string | undefined): string | null {
  const cookie = cookieHeader
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith("restaurant_local_session="));
  return cookie?.slice("restaurant_local_session=".length) || null;
}
