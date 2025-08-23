// src/lib/api.ts
// Central API helper for token storage and authenticated requests

export const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";
export const TOKEN_KEY = "gk.jwt";

/** Read the stored JWT */
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Store a new JWT (or clear with null) */
export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
}

/** Convenience logout */
export function clearToken() {
  setToken(null);
}

/**
 * Fetch wrapper that:
 *  - prefixes with API_BASE
 *  - sends JSON
 *  - attaches Authorization: Bearer <token> when auth=true and token exists
 *  - throws on non-2xx with a normalized error { error: string }
 */
export async function api<T = any>(
  path: string,
  opts: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    auth?: boolean;
  } = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, auth = true } = opts;

  const h: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  const token = getToken();
  if (auth && token) {
    h.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: h,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // same-origin cookies not needed for our JWT header flow
  });

  const isJson =
    res.headers.get("content-type")?.includes("application/json") ?? false;

  const data = isJson ? await res.json().catch(() => ({})) : ({} as any);
  if (!res.ok) {
    // Normalize the error shape
    const msg =
      (data && (data.error || data.message)) ||
      `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data as T;
}
