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
import { isDesktopRuntime } from "@/src/lib/runtime";

export const CURRENT_VERSION = "0.3.1";
const GITHUB_REPO = "rakhechashubham/serverui";
const CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const STORAGE_KEY_AUTO_CHECK = "serverui-autoupdate-enabled";
const STORAGE_KEY_LAST_CHECKED = "serverui-autoupdate-lastchecked";
const STORAGE_KEY_DISMISSED = "serverui-autoupdate-dismissed";

type UpdaterState = {
  currentVersion: string;
  latestVersion: string | null;
  updateAvailable: boolean;
  checking: boolean;
  lastChecked: number | null;
  releaseUrl: string;
  releaseNotes: string;
  autoCheck: boolean;
  setAutoCheck: (enabled: boolean) => void;
  checkForUpdates: (silent?: boolean) => Promise<boolean>;
  applyUpdate: () => void;
  dismissUpdate: () => void;
};

const UpdaterContext = createContext<UpdaterState | null>(null);

function compareSemver(v1: string, v2: string): number {
  const clean = (v: string) => v.replace(/^v/, "").trim().split(".").map(Number);
  const p1 = clean(v1);
  const p2 = clean(v2);
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export function AutoUpdaterProvider({ children }: { children: ReactNode }) {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(false);
  const [releaseUrl, setReleaseUrl] = useState(`https://github.com/${GITHUB_REPO}/releases/latest`);
  const [releaseNotes, setReleaseNotes] = useState("");
  const [lastChecked, setLastChecked] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LAST_CHECKED);
      return stored ? Number(stored) : null;
    } catch {
      return null;
    }
  });

  const [autoCheck, setAutoCheckState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTO_CHECK);
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });

  const setAutoCheck = useCallback((enabled: boolean) => {
    setAutoCheckState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_AUTO_CHECK, String(enabled));
    } catch {}
  }, []);

  const checkForUpdates = useCallback(
    async (silent = false): Promise<boolean> => {
      setChecking(true);
      try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        });

        const now = Date.now();
        setLastChecked(now);
        try {
          localStorage.setItem(STORAGE_KEY_LAST_CHECKED, String(now));
        } catch {}

        if (!res.ok) {
          return false;
        }

        const data = await res.json();
        const latestTag = (data.tag_name || "").trim();
        if (!latestTag) return false;

        setLatestVersion(latestTag);
        setReleaseUrl(data.html_url || `https://github.com/${GITHUB_REPO}/releases/latest`);
        setReleaseNotes(data.body || "Performance improvements and bug fixes.");

        const isNewer = compareSemver(latestTag, CURRENT_VERSION) > 0;

        // Check if user already dismissed this specific version
        let isDismissed = false;
        try {
          isDismissed = localStorage.getItem(STORAGE_KEY_DISMISSED) === latestTag;
        } catch {}

        if (isNewer && (!isDismissed || !silent)) {
          setUpdateAvailable(true);
          return true;
        } else {
          setUpdateAvailable(false);
          return false;
        }
      } catch (err) {
        if (!silent) console.warn("Failed to check for updates:", err);
        return false;
      } finally {
        setChecking(false);
      }
    },
    [],
  );

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
    if (latestVersion) {
      try {
        localStorage.setItem(STORAGE_KEY_DISMISSED, latestVersion);
      } catch {}
    }
  }, [latestVersion]);

  const applyUpdate = useCallback(() => {
    if (isDesktopRuntime()) {
      // In desktop runtime, open releases or launch updater
      window.open(releaseUrl, "_blank");
    } else {
      // In web runtime, bust caches and reload
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
      window.location.reload();
    }
  }, [releaseUrl]);

  // Periodic automatic update check
  useEffect(() => {
    if (!autoCheck) return;

    // Check on startup
    void checkForUpdates(true);

    // Check periodically
    const timer = window.setInterval(() => {
      void checkForUpdates(true);
    }, CHECK_INTERVAL_MS);

    // Check when user refocuses window
    const onFocus = () => {
      void checkForUpdates(true);
    };
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [autoCheck, checkForUpdates]);

  const value = useMemo(
    () => ({
      currentVersion: CURRENT_VERSION,
      latestVersion,
      updateAvailable,
      checking,
      lastChecked,
      releaseUrl,
      releaseNotes,
      autoCheck,
      setAutoCheck,
      checkForUpdates,
      applyUpdate,
      dismissUpdate,
    }),
    [
      autoCheck,
      checkForUpdates,
      checking,
      dismissUpdate,
      applyUpdate,
      lastChecked,
      latestVersion,
      releaseNotes,
      releaseUrl,
      setAutoCheck,
      updateAvailable,
    ],
  );

  return <UpdaterContext.Provider value={value}>{children}</UpdaterContext.Provider>;
}

export function useAutoUpdater() {
  const context = useContext(UpdaterContext);
  if (!context) {
    throw new Error("useAutoUpdater must be used within AutoUpdaterProvider");
  }
  return context;
}
