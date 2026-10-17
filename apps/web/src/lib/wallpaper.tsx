"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { Theme } from "@/src/lib/theme";

export type BuiltInWallpaperId =
  | "crescent"
  | "valley"
  | "orbit"
  | "aurora"
  | "monterey"
  | "cyberpunk"
  | "minimal"
  | "sakura"
  | "dunes"
  | "deepspace";

export type WallpaperId = BuiltInWallpaperId | "custom";

export type WallpaperOption = {
  id: BuiltInWallpaperId;
  name: string;
  category: "Space" | "Nature" | "Abstract" | "Minimal";
  src: string;
  thumbnailSrc?: string;
};

// 10 Free Built-in Dark Wallpapers (Ultra-crisp vector SVG gradients + visual art)
const DARK_WALLPAPERS: readonly WallpaperOption[] = [
  {
    id: "crescent",
    name: "Crescent Cosmos",
    category: "Space",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3CradialGradient id='g1' cx='75%25' cy='25%25' r='60%25'%3E%3Cstop offset='0%25' stop-color='%23382bf0' stop-opacity='0.45'/%3E%3Cstop offset='100%25' stop-color='%23090a10'/%3E%3C/radialGradient%3E%3CradialGradient id='g2' cx='20%25' cy='80%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='%2310b981' stop-opacity='0.25'/%3E%3Cstop offset='100%25' stop-color='%23050608' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%23090a10'/%3E%3Crect width='100%25' height='100%25' fill='url(%23g1)'/%3E%3Crect width='100%25' height='100%25' fill='url(%23g2)'/%3E%3Ccircle cx='1400' cy='320' r='180' fill='none' stroke='%23818cf8' stroke-width='2' opacity='0.3'/%3E%3Ccircle cx='1380' cy='300' r='170' fill='%230b0d18'/%3E%3C/svg%3E",
  },
  {
    id: "valley",
    name: "Valley Twilight",
    category: "Nature",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='sky' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%231e1136'/%3E%3Cstop offset='50%25' stop-color='%234c1d95'/%3E%3Cstop offset='80%25' stop-color='%23f59e0b'/%3E%3Cstop offset='100%25' stop-color='%23111827'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23sky)'/%3E%3Cpath d='M0 800 Q 480 650 960 760 T 1920 700 L 1920 1080 L 0 1080 Z' fill='%23130d24' opacity='0.8'/%3E%3Cpath d='M0 870 Q 560 780 1120 840 T 1920 820 L 1920 1080 L 0 1080 Z' fill='%230a0614'/%3E%3C/svg%3E",
  },
  {
    id: "orbit",
    name: "Neon Orbit",
    category: "Space",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3CradialGradient id='core' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='%2306b6d4' stop-opacity='0.4'/%3E%3Cstop offset='50%25' stop-color='%238b5cf6' stop-opacity='0.2'/%3E%3Cstop offset='100%25' stop-color='%23030712'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%23030712'/%3E%3Crect width='100%25' height='100%25' fill='url(%23core)'/%3E%3Cellipse cx='960' cy='540' rx='600' ry='220' fill='none' stroke='%2306b6d4' stroke-width='2.5' opacity='0.45' transform='rotate(-22 960 540)'/%3E%3Cellipse cx='960' cy='540' rx='720' ry='260' fill='none' stroke='%23ec4899' stroke-width='1.5' opacity='0.35' transform='rotate(-15 960 540)'/%3E%3C/svg%3E",
  },
  {
    id: "aurora",
    name: "Nordic Aurora",
    category: "Nature",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23020617'/%3E%3Cstop offset='100%25' stop-color='%23064e3b'/%3E%3C/linearGradient%3E%3Cfilter id='blur'%3E%3CfeGaussianBlur stdDeviation='60'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg)'/%3E%3Cpath d='M-100 400 Q 400 150 960 380 T 2020 200 L 2020 600 L -100 600 Z' fill='%2310b981' opacity='0.45' filter='url(%23blur)'/%3E%3Cpath d='M-100 500 Q 500 280 1100 480 T 2020 350 L 2020 700 L -100 700 Z' fill='%2306b6d4' opacity='0.35' filter='url(%23blur)'/%3E%3C/svg%3E",
  },
  {
    id: "monterey",
    name: "Monterey Wave",
    category: "Abstract",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='m1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%231e1b4b'/%3E%3Cstop offset='40%25' stop-color='%234338ca'/%3E%3Cstop offset='70%25' stop-color='%23db2777'/%3E%3Cstop offset='100%25' stop-color='%23fbbf24'/%3E%3C/linearGradient%3E%3Cfilter id='mb'%3E%3CfeGaussianBlur stdDeviation='80'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%230f172a'/%3E%3Cpath d='M0 300 C 600 100 1200 600 1920 200 L 1920 1080 L 0 1080 Z' fill='url(%23m1)' opacity='0.7' filter='url(%23mb)'/%3E%3C/svg%3E",
  },
  {
    id: "cyberpunk",
    name: "Cyber Horizon",
    category: "Abstract",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='cg' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23090014'/%3E%3Cstop offset='55%25' stop-color='%234a044e'/%3E%3Cstop offset='70%25' stop-color='%23f43f5e'/%3E%3Cstop offset='100%25' stop-color='%230f021a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23cg)'/%3E%3Ccircle cx='960' cy='580' r='160' fill='%23fb7185' opacity='0.85'/%3E%3Crect y='580' width='1920' height='500' fill='%23090014' opacity='0.9'/%3E%3Cpath d='M0 580 L 1920 580 M0 620 L 1920 620 M0 680 L 1920 680 M0 760 L 1920 760 M0 880 L 1920 880 M0 1040 L 1920 1040' stroke='%23d946ef' stroke-width='1.5' opacity='0.4'/%3E%3C/svg%3E",
  },
  {
    id: "minimal",
    name: "Matte Obsidian",
    category: "Minimal",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3CradialGradient id='darkspot' cx='50%25' cy='40%25' r='55%25'%3E%3Cstop offset='0%25' stop-color='%2327272a'/%3E%3Cstop offset='100%25' stop-color='%2309090b'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23darkspot)'/%3E%3Ccircle cx='960' cy='480' r='380' fill='%23ffffff' opacity='0.015'/%3E%3C/svg%3E",
  },
  {
    id: "sakura",
    name: "Sakura Twilight",
    category: "Nature",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='sakuraG' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%231f132b'/%3E%3Cstop offset='45%25' stop-color='%234c1d68'/%3E%3Cstop offset='85%25' stop-color='%23be185d'/%3E%3Cstop offset='100%25' stop-color='%23fda4af'/%3E%3C/linearGradient%3E%3Cfilter id='sf'%3E%3CfeGaussianBlur stdDeviation='70'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23sakuraG)'/%3E%3Ccircle cx='400' cy='300' r='280' fill='%23f472b6' opacity='0.25' filter='url(%23sf)'/%3E%3C/svg%3E",
  },
  {
    id: "dunes",
    name: "Golden Sahara",
    category: "Nature",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='dg' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230f172a'/%3E%3Cstop offset='40%25' stop-color='%2378350f'/%3E%3Cstop offset='80%25' stop-color='%23d97706'/%3E%3Cstop offset='100%25' stop-color='%23451a03'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23dg)'/%3E%3Cpath d='M0 650 Q 420 520 960 640 T 1920 580 L 1920 1080 L 0 1080 Z' fill='%2378350f' opacity='0.7'/%3E%3Cpath d='M0 760 Q 640 660 1280 740 T 1920 720 L 1920 1080 L 0 1080 Z' fill='%23291205'/%3E%3C/svg%3E",
  },
  {
    id: "deepspace",
    name: "Nebula Stellar",
    category: "Space",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3CradialGradient id='sg1' cx='30%25' cy='30%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='%236366f1' stop-opacity='0.45'/%3E%3Cstop offset='100%25' stop-color='%23020617'/%3E%3C/radialGradient%3E%3CradialGradient id='sg2' cx='70%25' cy='65%25' r='45%25'%3E%3Cstop offset='0%25' stop-color='%23a855f7' stop-opacity='0.4'/%3E%3Cstop offset='100%25' stop-color='%23020617' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%23020617'/%3E%3Crect width='100%25' height='100%25' fill='url(%23sg1)'/%3E%3Crect width='100%25' height='100%25' fill='url(%23sg2)'/%3E%3Ccircle cx='960' cy='540' r='1.5' fill='%23ffffff' opacity='0.8'/%3E%3Ccircle cx='420' cy='220' r='2' fill='%23ffffff' opacity='0.6'/%3E%3Ccircle cx='1320' cy='780' r='1.5' fill='%23ffffff' opacity='0.7'/%3E%3Ccircle cx='1540' cy='280' r='2.5' fill='%23ffffff' opacity='0.9'/%3E%3C/svg%3E",
  },
];

// 10 Free Built-in Light Wallpapers
const LIGHT_WALLPAPERS: readonly WallpaperOption[] = [
  {
    id: "valley",
    name: "Sunrise Valley",
    category: "Nature",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='lsky' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23e0f2fe'/%3E%3Cstop offset='60%25' stop-color='%23fed7aa'/%3E%3Cstop offset='100%25' stop-color='%23fef08a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23lsky)'/%3E%3Cpath d='M0 720 Q 500 580 1000 700 T 1920 640 L 1920 1080 L 0 1080 Z' fill='%23cbd5e1' opacity='0.6'/%3E%3Cpath d='M0 820 Q 600 710 1200 800 T 1920 760 L 1920 1080 L 0 1080 Z' fill='%2394a3b8'/%3E%3C/svg%3E",
  },
  {
    id: "crescent",
    name: "Nordic Fjord",
    category: "Nature",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='fjordG' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23f1f5f9'/%3E%3Cstop offset='50%25' stop-color='%23bae6fd'/%3E%3Cstop offset='100%25' stop-color='%23e2e8f0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23fjordG)'/%3E%3Ccircle cx='1200' cy='350' r='300' fill='%2338bdf8' opacity='0.15'/%3E%3C/svg%3E",
  },
  {
    id: "orbit",
    name: "Alpine Snow",
    category: "Nature",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='ag' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23f8fafc'/%3E%3Cstop offset='70%25' stop-color='%23e2e8f0'/%3E%3Cstop offset='100%25' stop-color='%23cbd5e1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23ag)'/%3E%3Cpath d='M0 600 L 400 350 L 900 650 L 1400 380 L 1920 620 L 1920 1080 L 0 1080 Z' fill='%2394a3b8' opacity='0.4'/%3E%3C/svg%3E",
  },
  {
    id: "aurora",
    name: "Emerald Stream",
    category: "Nature",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='es' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23f0fdf4'/%3E%3Cstop offset='50%25' stop-color='%23a7f3d0'/%3E%3Cstop offset='100%25' stop-color='%23ccfbf1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23es)'/%3E%3C/svg%3E",
  },
  {
    id: "monterey",
    name: "Monterey Daylight",
    category: "Abstract",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='mdG' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23e0e7ff'/%3E%3Cstop offset='50%25' stop-color='%23fbcfe8'/%3E%3Cstop offset='100%25' stop-color='%23fef3c7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23mdG)'/%3E%3C/svg%3E",
  },
  {
    id: "cyberpunk",
    name: "Pastel Sunset",
    category: "Abstract",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='psG' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fff1f2'/%3E%3Cstop offset='60%25' stop-color='%23fed7aa'/%3E%3Cstop offset='100%25' stop-color='%23fecdd3'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23psG)'/%3E%3C/svg%3E",
  },
  {
    id: "minimal",
    name: "Matte Chalk",
    category: "Minimal",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect width='100%25' height='100%25' fill='%23f4f4f5'/%3E%3Ccircle cx='960' cy='540' r='400' fill='%23000000' opacity='0.02'/%3E%3C/svg%3E",
  },
  {
    id: "sakura",
    name: "Cherry Blossom Day",
    category: "Nature",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='cbd' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fff1f2'/%3E%3Cstop offset='50%25' stop-color='%23fce7f3'/%3E%3Cstop offset='100%25' stop-color='%23ede9fe'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23cbd)'/%3E%3C/svg%3E",
  },
  {
    id: "dunes",
    name: "Ivory Sands",
    category: "Nature",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='isG' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fef3c7'/%3E%3Cstop offset='60%25' stop-color='%23ffedd5'/%3E%3Cstop offset='100%25' stop-color='%23fde68a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23isG)'/%3E%3C/svg%3E",
  },
  {
    id: "deepspace",
    name: "Cosmic Sky",
    category: "Space",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='csG' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23f5f3ff'/%3E%3Cstop offset='50%25' stop-color='%23e0e7ff'/%3E%3Cstop offset='100%25' stop-color='%23c7d2fe'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23csG)'/%3E%3C/svg%3E",
  },
];

export function wallpapersFor(theme: Theme): readonly WallpaperOption[] {
  return theme === "light" ? LIGHT_WALLPAPERS : DARK_WALLPAPERS;
}

const THEME_EVENT = "serverui-theme";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribeTheme(onStoreChange: () => void) {
  window.addEventListener(THEME_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

const DEFAULT_WALLPAPER_ID: BuiltInWallpaperId = "crescent";
const LIGHT_DEFAULT_WALLPAPER_ID: BuiltInWallpaperId = "valley";

const STORAGE_KEY = "serverui-wallpaper";
const LIGHT_STORAGE_KEY = "serverui-wallpaper-light";
const CUSTOM_URL_KEY = "serverui-wallpaper-url";
const BLUR_KEY = "serverui-wallpaper-blur";
const BRIGHTNESS_KEY = "serverui-wallpaper-brightness";
const CUSTOM_EVENT = "serverui-wallpaper";
const DB_NAME = "serverui";
const DB_STORE = "prefs";
const CUSTOM_KEY = "wallpaper-custom";

type WallpaperContextValue = {
  wallpaperId: WallpaperId;
  wallpaperSrc: string;
  wallpapers: readonly WallpaperOption[];
  customSrc: string | null;
  hasCustom: boolean;
  blur: number;
  brightness: number;
  setWallpaper: (id: WallpaperId) => void;
  setCustomWallpaper: (file: File) => Promise<void>;
  setCustomWallpaperUrl: (url: string) => void;
  clearCustomWallpaper: () => Promise<void>;
  setBlur: (val: number) => void;
  setBrightness: (val: number) => void;
};

const WallpaperContext = createContext<WallpaperContextValue | null>(null);

function isWallpaperId(value: string | null): value is WallpaperId {
  return (
    value === "custom" ||
    DARK_WALLPAPERS.some((item) => item.id === value) ||
    LIGHT_WALLPAPERS.some((item) => item.id === value)
  );
}

function defaultWallpaperId(theme: Theme): BuiltInWallpaperId {
  return theme === "light" ? LIGHT_DEFAULT_WALLPAPER_ID : DEFAULT_WALLPAPER_ID;
}

function storageKey(theme: Theme) {
  return theme === "light" ? LIGHT_STORAGE_KEY : STORAGE_KEY;
}

function readStoredId(theme: Theme = readTheme()): WallpaperId {
  try {
    const value = localStorage.getItem(storageKey(theme));
    if (isWallpaperId(value)) return value;
  } catch {
    // Ignore private-mode failures
  }
  return defaultWallpaperId(theme);
}

function writeStoredId(id: WallpaperId, theme: Theme = readTheme()) {
  try {
    localStorage.setItem(storageKey(theme), id);
  } catch {
    // Ignore
  }
  window.dispatchEvent(new Event(CUSTOM_EVENT));
}

function builtInSrc(id: WallpaperId, theme: Theme): string {
  const options = wallpapersFor(theme);
  if (id === "custom") return options[0].src;
  return options.find((item) => item.id === id)?.src ?? options[0].src;
}

function openPrefsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open wallpaper storage"));
  });
}

async function saveCustomBlob(blob: Blob) {
  const db = await openPrefsDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Unable to save wallpaper"));
    tx.objectStore(DB_STORE).put(blob, CUSTOM_KEY);
  });
  db.close();
}

async function loadCustomBlob(): Promise<Blob | null> {
  const db = await openPrefsDb();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const request = tx.objectStore(DB_STORE).get(CUSTOM_KEY);
    request.onsuccess = () => {
      const value = request.result;
      resolve(value instanceof Blob ? value : null);
    };
    request.onerror = () => reject(request.error ?? new Error("Unable to load wallpaper"));
  });
  db.close();
  return blob;
}

async function deleteCustomBlob() {
  const db = await openPrefsDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Unable to remove wallpaper"));
    tx.objectStore(DB_STORE).delete(CUSTOM_KEY);
  });
  db.close();
}

export function WallpaperProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "dark" as Theme);
  const wallpapers = wallpapersFor(theme);
  const [wallpaperId, setWallpaperId] = useState<WallpaperId>(() => readStoredId(readTheme()));
  const [themeForId, setThemeForId] = useState<Theme>(theme);

  const [customBlob, setCustomBlob] = useState<Blob | null>(null);
  const [customUrl, setCustomUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CUSTOM_URL_KEY);
    } catch {
      return null;
    }
  });

  const [blur, setBlurState] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(BLUR_KEY) || 0);
    } catch {
      return 0;
    }
  });

  const [brightness, setBrightnessState] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(BRIGHTNESS_KEY) || 100);
    } catch {
      return 100;
    }
  });

  if (themeForId !== theme) {
    setThemeForId(theme);
    setWallpaperId(readStoredId(theme));
  }

  useEffect(() => {
    let cancelled = false;
    loadCustomBlob()
      .then((blob) => {
        if (!cancelled) setCustomBlob(blob);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const customObjectUrl = useMemo(() => {
    if (customBlob) return URL.createObjectURL(customBlob);
    return customUrl;
  }, [customBlob, customUrl]);

  useEffect(() => {
    return () => {
      if (customObjectUrl && customBlob) {
        URL.revokeObjectURL(customObjectUrl);
      }
    };
  }, [customBlob, customObjectUrl]);

  const hasCustom = Boolean(customBlob || customUrl);

  const wallpaperSrc = useMemo(() => {
    if (wallpaperId === "custom" && customObjectUrl) {
      return customObjectUrl;
    }
    return builtInSrc(wallpaperId, theme);
  }, [customObjectUrl, theme, wallpaperId]);

  const setWallpaper = useCallback(
    (id: WallpaperId) => {
      setWallpaperId(id);
      writeStoredId(id, theme);
    },
    [theme],
  );

  const setCustomWallpaper = useCallback(
    async (file: File) => {
      await saveCustomBlob(file);
      setCustomBlob(file);
      setWallpaper("custom");
    },
    [setWallpaper],
  );

  const setCustomWallpaperUrl = useCallback(
    (url: string) => {
      try {
        localStorage.setItem(CUSTOM_URL_KEY, url);
      } catch {}
      setCustomUrl(url);
      setWallpaper("custom");
    },
    [setWallpaper],
  );

  const clearCustomWallpaper = useCallback(async () => {
    await deleteCustomBlob();
    try {
      localStorage.removeItem(CUSTOM_URL_KEY);
    } catch {}
    setCustomBlob(null);
    setCustomUrl(null);
    setWallpaper(defaultWallpaperId(theme));
  }, [setWallpaper, theme]);

  const setBlur = useCallback((val: number) => {
    setBlurState(val);
    try {
      localStorage.setItem(BLUR_KEY, String(val));
    } catch {}
  }, []);

  const setBrightness = useCallback((val: number) => {
    setBrightnessState(val);
    try {
      localStorage.setItem(BRIGHTNESS_KEY, String(val));
    } catch {}
  }, []);

  const value = useMemo(
    () => ({
      wallpaperId,
      wallpaperSrc,
      wallpapers,
      customSrc: customObjectUrl,
      hasCustom,
      blur,
      brightness,
      setWallpaper,
      setCustomWallpaper,
      setCustomWallpaperUrl,
      clearCustomWallpaper,
      setBlur,
      setBrightness,
    }),
    [
      blur,
      brightness,
      clearCustomWallpaper,
      customObjectUrl,
      hasCustom,
      setBlur,
      setBrightness,
      setCustomWallpaper,
      setCustomWallpaperUrl,
      setWallpaper,
      wallpaperId,
      wallpaperSrc,
      wallpapers,
    ],
  );

  return <WallpaperContext.Provider value={value}>{children}</WallpaperContext.Provider>;
}

export function useWallpaper() {
  const context = useContext(WallpaperContext);
  if (!context) {
    throw new Error("useWallpaper must be used within WallpaperProvider");
  }
  return context;
}

export function WallpaperBackdrop({
  className = "pointer-events-none absolute inset-0 bg-cover bg-center",
  opacity,
}: {
  className?: string;
  opacity?: number;
}) {
  const { wallpaperSrc, blur, brightness } = useWallpaper();
  return (
    <div
      aria-hidden
      className={className}
      style={{
        backgroundImage: `url("${wallpaperSrc}")`,
        filter: `blur(${blur}px) brightness(${brightness}%)`,
        transform: blur > 0 ? "scale(1.04)" : "scale(1)",
        transition: "filter 0.3s ease, transform 0.3s ease",
        ...(opacity === undefined ? {} : { opacity }),
      }}
    />
  );
}
