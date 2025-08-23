// src/lib/dataClient.ts
// Central client for app data (API mode). Supabase is not required in production here.

import { api, setToken, clearToken, getToken } from "./api";

export type Role =
  | "admin"
  | "kitchen"
  | "inventory"
  | "delivery"
  | (string & {});

export interface User {
  id: string | number;
  email?: string;
  username?: string;
  role: Role;
  name?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

/** Email login */
export async function login(email: string, password: string): Promise<User> {
  const { token, user } = await api<LoginResponse>("/auth/login", {
    method: "POST",
    auth: false, // login itself is public
    body: { identifier: email, password }, // backend accepts "identifier"
  });
  setToken(token);
  return user;
}

/** Username login */
export async function loginWithUsername(
  username: string,
  password: string
): Promise<User> {
  const { token, user } = await api<LoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: { identifier: username, password },
  });
  setToken(token);
  return user;
}

/** Logout locally (invalidate token client-side) */
export function logout() {
  clearToken();
}

/** Simple session check – if token exists, ask backend who we are */
export async function me(): Promise<User | null> {
  if (!getToken()) return null;
  try {
    const user = await api<User>("/auth/me", { auth: true });
    return user;
  } catch {
    clearToken();
    return null;
  }
}

/** Example protected data call */
export async function getStaffMembers(): Promise<User[]> {
  // Your backend route should return rows from users (or staff) table
  const rows = await api<User[]>("/staff", { auth: true });
  return rows;
}
