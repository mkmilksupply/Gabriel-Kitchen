// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  login as apiLogin,
  loginWithUsername as apiLoginWithUsername,
  logout as apiLogout,
  me as apiMe,
  getStaffMembers as apiGetStaffMembers,
  type User,
} from "../lib/dataClient";

type LoginMethod = "email" | "username";

interface AuthState {
  user: User | null;
  role: string; // UI role picker (“Administrator”, etc.) – keep as string so your UI still works
  setRole: (r: string) => void;

  loginMethod: LoginMethod;
  setLoginMethod: (m: LoginMethod) => void;

  loading: boolean;
  error: string | null;

  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;

  // example that other screens may call
  getStaffMembers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // keep your UI role dropdown working – default "Administrator" like your screen
  const [role, setRole] = useState<string>("Administrator");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // bootstrap: if we have a token, ask backend who we are
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const u = await apiMe();
        setUser(u);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (identifier: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const u =
        loginMethod === "username"
          ? await apiLoginWithUsername(identifier, password)
          : await apiLogin(identifier, password);
      setUser(u);
    } catch (e: any) {
      setError(e?.message || "Login failed");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  const getStaffMembers = async () => {
    return await apiGetStaffMembers();
  };

  const value = useMemo<AuthState>(
    () => ({
      user,
      role,
      setRole,
      loginMethod,
      setLoginMethod,
      loading,
      error,
      login,
      logout,
      getStaffMembers,
    }),
    [user, role, loginMethod, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
