export const APP_IDS = [
  "servers",
  "dashboard",
  "files",
  "terminal",
  "editor",
  "cpanel",
  "applications",
  "domains",
  "databases",
  "settings",
] as const;

export type DockAppId = (typeof APP_IDS)[number];
export type AppId = DockAppId | "about" | "viewer";

/** Apps that stay in the catalog but are not shown on the dock. */
export const DOCK_HIDDEN_IDS: ReadonlySet<DockAppId> = new Set([]);

export function visibleDockOrder(order: readonly DockAppId[]): DockAppId[] {
  return order.filter((id) => !DOCK_HIDDEN_IDS.has(id));
}

export type WindowChrome = "light" | "dark";

export const APP_META: Record<
  AppId,
  {
    title: string;
    width: number;
    height: number;
    available: boolean;
    chrome: WindowChrome;
    /** The app draws the traffic lights and drag region itself (Finder style). */
    unifiedTitlebar?: boolean;
  }
> = {
  servers: {
    title: "Servers",
    width: 1080,
    height: 700,
    available: true,
    chrome: "light",
    unifiedTitlebar: true,
  },
  dashboard: {
    title: "System Monitor",
    width: 1120,
    height: 720,
    available: true,
    chrome: "dark",
  },
  files: {
    title: "Files",
    width: 900,
    height: 600,
    available: true,
    chrome: "light",
    unifiedTitlebar: true,
  },
  terminal: {
    title: "Terminal",
    width: 800,
    height: 480,
    available: true,
    chrome: "dark",
  },
  editor: {
    title: "Editor",
    width: 960,
    height: 640,
    available: true,
    chrome: "dark",
  },
  cpanel: {
    title: "cPanel Suite",
    width: 1080,
    height: 680,
    available: true,
    chrome: "dark",
  },
  applications: {
    title: "Docker & Containers",
    width: 900,
    height: 600,
    available: true,
    chrome: "dark",
  },
  domains: {
    title: "Domains & Proxy",
    width: 860,
    height: 560,
    available: true,
    chrome: "dark",
  },
  databases: {
    title: "Databases",
    width: 900,
    height: 580,
    available: true,
    chrome: "dark",
  },
  settings: {
    title: "Settings",
    width: 750,
    height: 550,
    available: true,
    chrome: "light",
  },
  about: {
    title: "About",
    width: 740,
    height: 680,
    available: true,
    chrome: "dark",
  },
  viewer: {
    title: "Viewer",
    width: 880,
    height: 620,
    available: true,
    chrome: "light",
  },
};
