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
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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

  // Validate session freshness (24 hour expiration rule)
  const checkSessionFreshness = useCallback((): boolean => {
    try {
      const sessionRaw = localStorage.getItem(STORAGE_KEY_AUTH);
      if (!sessionRaw) return false;
      const session = JSON.parse(sessionRaw);
      const now = Date.now();
      if (!session.timestamp || now - session.timestamp > SESSION_DURATION_MS) {
        // Session expired after 24 hours
        localStorage.removeItem(STORAGE_KEY_AUTH);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    try {
      const config = localStorage.getItem(STORAGE_KEY_CONFIG);
      const isFresh = checkSessionFreshness();

      if (!config) {
        setIsConfigured(false);
        setIsAuthenticated(false);
      } else {
        setIsConfigured(true);
        if (isFresh) {
          const sessionRaw = localStorage.getItem(STORAGE_KEY_AUTH);
          const parsed = sessionRaw ? JSON.parse(sessionRaw) : null;
          setIsAuthenticated(true);
          setUsername(parsed?.username || "admin");
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
  }, [checkSessionFreshness]);

  // Periodic interval check to automatically log out when 24h expires while tab is open
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      if (!checkSessionFreshness()) {
        setIsAuthenticated(false);
        setUsername(null);
      }
    }, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, [isAuthenticated, checkSessionFreshness]);

  const setupAdmin = useCallback((user: string, pass: string): boolean => {
    if (!user.trim() || !pass.trim()) return false;
    try {
      const config = {
        username: user.trim(),
        hash: hashPassword(pass.trim()),
        createdAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
      localStorage.setItem(
        STORAGE_KEY_AUTH,
        JSON.stringify({
          username: config.username,
          timestamp: Date.now(),
          expiresAt: Date.now() + SESSION_DURATION_MS,
        }),
      );
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
        localStorage.setItem(
          STORAGE_KEY_AUTH,
          JSON.stringify({
            username: config.username,
            timestamp: Date.now(),
            expiresAt: Date.now() + SESSION_DURATION_MS,
          }),
        );
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
      localStorage.removeItem(STORAGE_KEY_AUTH);
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
