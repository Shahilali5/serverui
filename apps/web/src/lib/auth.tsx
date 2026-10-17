"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY_AUTH = "serverui-admin-auth";
const STORAGE_KEY_CONFIG = "serverui-admin-config";

export type AuthState = {
  isConfigured: boolean;
  isAuthenticated: boolean;
  username: string | null;
  setupAdmin: (user: string, pass: string) => boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

function hashPassword(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return String(hash);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const config = localStorage.getItem(STORAGE_KEY_CONFIG);
      const session = sessionStorage.getItem(STORAGE_KEY_AUTH);

      if (!config) {
        setIsConfigured(false);
        setIsAuthenticated(false);
      } else {
        setIsConfigured(true);
        if (session) {
          const parsed = JSON.parse(session);
          setIsAuthenticated(true);
          setUsername(parsed.username || "admin");
        } else {
          setIsAuthenticated(false);
        }
      }
    } catch {
      setIsConfigured(false);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const setupAdmin = useCallback((user: string, pass: string): boolean => {
    if (!user.trim() || !pass.trim()) return false;
    try {
      const config = {
        username: user.trim(),
        hash: hashPassword(pass.trim()),
        createdAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
      sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ username: config.username }));
      setIsConfigured(true);
      setIsAuthenticated(true);
      setUsername(config.username);
      return true;
    } catch {
      return false;
    }
  }, []);

  const login = useCallback((user: string, pass: string): boolean => {
    try {
      const configRaw = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (!configRaw) return false;
      const config = JSON.parse(configRaw);
      if (
        config.username.toLowerCase() === user.trim().toLowerCase() &&
        config.hash === hashPassword(pass.trim())
      ) {
        sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ username: config.username }));
        setIsAuthenticated(true);
        setUsername(config.username);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY_AUTH);
    } catch {}
    setIsAuthenticated(false);
    setUsername(null);
  }, []);

  const value = useMemo(
    () => ({
      isConfigured,
      isAuthenticated,
      username,
      setupAdmin,
      login,
      logout,
    }),
    [isConfigured, isAuthenticated, username, setupAdmin, login, logout],
  );

  if (loading) {
    return <div className="h-screen w-screen bg-[#0c1017]" />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
