import { apiUrl } from "./api";

export type AppRole = "admin" | "customer";

export interface LocalAuthUser {
  id: string;
  username: string;
  name: string;
  email: null;
  role: AppRole;
}

interface LocalAuthResponse {
  user?: LocalAuthUser | null;
  error?: string;
}

async function request(
  path: string,
  init?: RequestInit,
): Promise<LocalAuthResponse> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  const response = await fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers,
  });
  if (response.status === 204) {
    return {};
  }

  const result = (await response.json()) as LocalAuthResponse;
  if (!response.ok) {
    throw new Error(result.error || "Local authentication request failed.");
  }
  return result;
}

export const localAuth = {
  async getSession(): Promise<LocalAuthUser | null> {
    const result = await request("/api/auth/session");
    return result.user ?? null;
  },

  async signIn(username: string, password: string): Promise<LocalAuthUser> {
    const result = await request("/api/auth/sign-in", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (!result.user) {
      throw new Error("The local auth server did not return an account.");
    }
    return result.user;
  },

  async signUp(
    name: string,
    username: string,
    password: string,
  ): Promise<LocalAuthUser> {
    const result = await request("/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify({ name, username, password }),
    });
    if (!result.user) {
      throw new Error("The local auth server did not return the new account.");
    }
    return result.user;
  },

  signOut(): Promise<LocalAuthResponse> {
    return request("/api/auth/sign-out", { method: "POST" });
  },
};
