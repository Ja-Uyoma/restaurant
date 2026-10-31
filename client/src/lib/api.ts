import { authClient, isLocalAuth } from "./auth";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

export function apiUrl(path: string): string {
  return `${apiBaseUrl}${path}`;
}

export async function authenticatedApiRequest(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!isLocalAuth) {
    if (!authClient) {
      throw new Error("Authentication is not configured.");
    }
    const tokenResult = await authClient.token();
    if (tokenResult.error) {
      throw new Error(tokenResult.error.message);
    }
    if (!tokenResult.data?.token) {
      throw new Error("Sign in before placing or checking an order.");
    }
    headers.set("Authorization", `Bearer ${tokenResult.data.token}`);
  }

  return fetch(apiUrl(path), {
    ...init,
    credentials: isLocalAuth ? "include" : "same-origin",
    headers,
  });
}
