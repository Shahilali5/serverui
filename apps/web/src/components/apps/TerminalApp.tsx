"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import "@xterm/xterm/css/xterm.css";
import {
  AlertCircle,
  ChevronDown,
  Plus,
  RotateCw,
  Search,
  Terminal as TerminalIcon,
  Trash2,
  X,
} from "lucide-react";
import type { WindowPayload } from "@/src/components/window/window-context";
import { wsUrl } from "@/src/lib/api/origin";
import { getInjectedDesktopConfig, localAuthWSProtocols } from "@/src/lib/runtime/config";
import { ServerIcon } from "@/src/components/servers/ServerIcon";
import { useSession } from "@/src/lib/session";
import { isSampleServer } from "@/src/lib/sample-servers";
import type { Server } from "@/src/lib/servers";

function quotePath(value: string) {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

type Tab = {
  id: string;
  serverId: string;
  cwd?: string;
};

type SessionStatus = "connecting" | "connected" | "disconnected";

function safeUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // Fall through
    }
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function makeTab(serverId: string, cwd?: string): Tab {
  return { id: `${serverId}:${safeUUID()}`, serverId, cwd };
}

/** Live SSH sessions first, then preview hosts that the app marks connected. */
function openableServers(servers: Server[]) {
  if (!Array.isArray(servers)) return [];
  const live = servers.filter((server) => server && server.connected === true && !isSampleServer(server.id));
  const preview = servers.filter(
    (server) => server && server.connected === true && isSampleServer(server.id),
  );
  return [...live, ...preview];
}

/**
 * Safely calculates dimensions and resizes the terminal without throwing errors
 * when the container is hidden, detached, or during layout reflows.
 */
function safeFitAndResize(
  terminal: import("@xterm/xterm").Terminal | null,
  fitAddon: import("@xterm/addon-fit").FitAddon | null,
  container: HTMLElement | null,
  socket: WebSocket | null,
): { cols: number; rows: number } | null {
  if (!terminal || !fitAddon || !container) return null;
  if (!container.isConnected) return null;
  if (container.clientWidth < 20 || container.clientHeight < 20) return null;

  try {
    const dims = fitAddon.proposeDimensions();
    if (!dims || !Number.isFinite(dims.cols) || !Number.isFinite(dims.rows)) return null;
    if (dims.cols <= 0 || dims.rows <= 0 || dims.cols > 1000 || dims.rows > 1000) return null;

    if (terminal.cols !== dims.cols || terminal.rows !== dims.rows) {
      terminal.resize(dims.cols, dims.rows);
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "resize", cols: dims.cols, rows: dims.rows }));
    }
    return { cols: dims.cols, rows: dims.rows };
  } catch {
    return null;
  }
}

export function TerminalApp({ payload }: { payload?: WindowPayload }) {
  const { servers, connectServer } = useSession();
  const serverList = Array.isArray(servers) ? servers : [];
  const connected = openableServers(serverList);
  const payloadKey = `${payload?.serverId ?? ""}:${payload?.cwd ?? ""}`;

  // Initial state derived cleanly without render-phase setState calls
  const [tabs, setTabs] = useState<Tab[]>(() => {
    if (payload?.serverId) {
      const preferred = serverList.find((s) => s.id === payload.serverId);
      if (preferred) {
        return [makeTab(preferred.id, payload.cwd)];
      }
    }
    if (connected.length > 0) {
      const preferred = connected.find((server) => server.id === payload?.serverId) ?? connected[0];
      return [makeTab(preferred.id, preferred.id === payload?.serverId ? payload?.cwd : undefined)];
    }
    if (serverList.length > 0) {
      return [makeTab(serverList[0].id, payload?.cwd)];
    }
    return [];
  });
  const [activeId, setActiveId] = useState<string | null>(() => tabs[0]?.id ?? null);
  const [openedKey, setOpenedKey] = useState<string | null>(() => (tabs.length > 0 ? payloadKey : null));
  const [sessionStatuses, setSessionStatuses] = useState<Record<string, SessionStatus>>({});
  const [dimensions, setDimensions] = useState<Record<string, { cols: number; rows: number }>>({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  const terminalsRef = useRef<Record<string, import("@xterm/xterm").Terminal | null>>({});

  // Sync external window payload changes without render loops
  useEffect(() => {
    if (!payload?.serverId) return;
    if (openedKey === payloadKey) return;
    setOpenedKey(payloadKey);

    const exists = serverList.some((server) => server.id === payload.serverId);
    if (!exists) return;

    setTabs((current) => {
      const existing = current.find(
        (tab) => tab.serverId === payload.serverId && tab.cwd === payload.cwd,
      );
      if (existing) {
        setActiveId(existing.id);
        return current;
      }
      const serverId = payload.serverId || (serverList[0] ? serverList[0].id : "");
      if (!serverId) return current;
      const newTab = makeTab(serverId, payload.cwd);
      setActiveId(newTab.id);
      return [...current, newTab];
    });
  }, [payloadKey, payload?.serverId, payload?.cwd, serverList, openedKey]);

  // If initial load had 0 tabs and servers subsequently become available
  useEffect(() => {
    if (tabs.length === 0 && serverList.length > 0) {
      const preferred = connected.find((server) => server.id === payload?.serverId) ?? connected[0] ?? serverList[0];
      const tab = makeTab(preferred.id, preferred.id === payload?.serverId ? payload?.cwd : undefined);
      setTabs([tab]);
      setActiveId(tab.id);
      setOpenedKey(payloadKey);
    }
  }, [connected, serverList, payload?.serverId, payload?.cwd, payloadKey, tabs.length]);

  useEffect(() => {
    if (!pickerOpen) return;
    function onDown(event: MouseEvent | globalThis.MouseEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
        setPickerSearch("");
      }
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [pickerOpen]);

  const addTab = useCallback((serverId: string) => {
    const tab = makeTab(serverId);
    setTabs((current) => [...current, tab]);
    setActiveId(tab.id);
    setPickerOpen(false);
    setPickerSearch("");
  }, []);

  const closeTab = useCallback((id: string) => {
    delete terminalsRef.current[id];
    setSessionStatuses((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setDimensions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setTabs((current) => current.filter((tab) => tab.id !== id));
    setActiveId((active) => {
      if (active !== id) return active;
      const index = tabs.findIndex((tab) => tab.id === id);
      const next = tabs.filter((tab) => tab.id !== id);
      return next[Math.min(index, next.length - 1)]?.id ?? null;
    });
  }, [tabs]);

  const handleClear = useCallback(() => {
    if (activeId && terminalsRef.current[activeId]) {
      try {
        terminalsRef.current[activeId]?.clear();
        terminalsRef.current[activeId]?.focus();
      } catch {
        // Ignore
      }
    }
  }, [activeId]);

  const handleRegisterTerminal = useCallback((tabId: string, terminal: import("@xterm/xterm").Terminal | null) => {
    terminalsRef.current[tabId] = terminal;
  }, []);

  const handleStatusChange = useCallback((tabId: string, status: SessionStatus) => {
    setSessionStatuses((prev) => (prev[tabId] === status ? prev : { ...prev, [tabId]: status }));
  }, []);

  const handleDimensionsChange = useCallback((tabId: string, dims: { cols: number; rows: number }) => {
    setDimensions((prev) => ({ ...prev, [tabId]: dims }));
  }, []);

  const filteredConnected = connected.filter((s) => {
    if (!pickerSearch.trim()) return true;
    const q = pickerSearch.toLowerCase();
    const host = s.address || s.hostname || (s as unknown as { host?: string }).host || "";
    return s.name.toLowerCase().includes(q) || host.toLowerCase().includes(q);
  });

  const activeTab = tabs.find((t) => t.id === activeId);
  const activeServer = activeTab ? servers.find((s) => s.id === activeTab.serverId) : null;
  const activeDims = activeId ? dimensions[activeId] : null;

  return (
    <div className="sui-terminal flex h-full min-h-0 flex-col text-[#e6edf3]">
      {/* Sleek Chrome Tab Bar */}
      <div className="relative z-20 flex h-10 shrink-0 items-center justify-between border-b border-white/[0.08] bg-black/40 px-2 backdrop-blur-xl select-none">
        {/* Left: Tab list */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {tabs.map((tab) => {
            const server = servers.find((item) => item.id === tab.serverId);
            const active = tab.id === activeId;
            const name = server?.name || "Server";
            const tabStatus = sessionStatuses[tab.id] ?? "connecting";

            return (
              <div
                key={tab.id}
                className={`group relative flex h-7.5 max-w-[190px] min-w-[110px] items-center gap-1.5 rounded-lg px-2.5 transition-all ${
                  active
                    ? "bg-white/[0.12] text-white shadow-sm ring-1 ring-white/10"
                    : "text-white/60 hover:bg-white/[0.06] hover:text-white/90"
                }`}
              >
                {/* Active Indicator Top Accent */}
                {active ? (
                  <span className="absolute -top-[5px] left-3 right-3 h-[2px] rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                ) : null}

                {/* Status Dot */}
                <span
                  className={`size-1.5 shrink-0 rounded-full transition-colors ${
                    tabStatus === "connected"
                      ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]"
                      : tabStatus === "connecting"
                        ? "bg-amber-400 animate-pulse"
                        : "bg-red-400"
                  }`}
                  title={`Status: ${tabStatus}`}
                  aria-hidden
                />

                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-1.5 text-left outline-none"
                  aria-current={active ? "page" : undefined}
                  onClick={() => setActiveId(tab.id)}
                >
                  {server ? (
                    <ServerIcon
                      iconId={server.iconId}
                      customIcon={server.customIcon}
                      serverId={server.id}
                      updatedAt={server.updatedAt}
                      size={13}
                    />
                  ) : null}
                  <span className="truncate text-[12px] font-medium tracking-tight">{name}</span>
                  {tab.cwd ? (
                    <span className="truncate text-[10px] text-white/40">
                      {tab.cwd.split("/").filter(Boolean).pop() || "/"}
                    </span>
                  ) : null}
                </button>

                <button
                  type="button"
                  aria-label={`Close ${name}`}
                  className="flex size-4 shrink-0 items-center justify-center rounded-full text-white/40 opacity-70 transition-all outline-none hover:bg-white/20 hover:text-white hover:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-emerald-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                >
                  <X className="size-3" />
                </button>
              </div>
            );
          })}

          {/* New Tab Button */}
          <div ref={pickerRef} className="relative shrink-0">
            <button
              type="button"
              aria-label="New terminal tab"
              aria-expanded={pickerOpen}
              disabled={connected.length === 0}
              className="flex size-7 items-center justify-center rounded-lg text-white/60 transition-colors outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-30"
              onClick={() => setPickerOpen((open) => !open)}
            >
              <Plus className="size-3.5" />
            </button>

            {pickerOpen ? (
              <div
                role="menu"
                aria-label="Connected servers"
                className="absolute left-0 top-[calc(100%+6px)] z-50 w-64 overflow-hidden rounded-2xl border border-white/12 bg-zinc-950/95 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
              >
                {connected.length > 4 ? (
                  <div className="relative mb-1 px-1">
                    <Search className="absolute left-3 top-2.5 size-3.5 text-white/40" />
                    <input
                      type="text"
                      placeholder="Filter servers…"
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 py-1 pl-8 pr-2 text-[12px] text-white placeholder-white/40 outline-none focus:border-emerald-400/50"
                      autoFocus
                    />
                  </div>
                ) : null}

                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Select Server
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {filteredConnected.length === 0 ? (
                    <div className="px-3 py-2 text-center text-[12px] text-white/50">
                      No matching servers
                    </div>
                  ) : (
                    filteredConnected.map((server) => (
                      <button
                        key={server.id}
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left text-[12.5px] text-white/90 transition-colors outline-none hover:bg-white/10 focus-visible:bg-white/10"
                        onClick={() => addTab(server.id)}
                      >
                        <ServerIcon
                          iconId={server.iconId}
                          customIcon={server.customIcon}
                          serverId={server.id}
                          updatedAt={server.updatedAt}
                          size={15}
                        />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-medium">{server.name}</span>
                          <span className="truncate text-[10.5px] text-white/40">{server.address || server.hostname || (server as unknown as { host?: string }).host || "remote"}</span>
                        </div>
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: Quick Toolbar */}
        {activeTab && activeServer ? (
          <div className="flex shrink-0 items-center gap-2 pl-2">
            {activeDims ? (
              <span className="hidden select-none font-mono text-[10px] text-white/40 md:inline-block">
                {activeDims.cols}×{activeDims.rows}
              </span>
            ) : null}
            <button
              type="button"
              aria-label="Clear terminal buffer"
              title="Clear terminal (Ctrl+L)"
              onClick={handleClear}
              className="flex size-7 items-center justify-center rounded-lg text-white/50 transition-colors outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ) : null}
      </div>

      {/* Terminal Viewport Area */}
      <div className="relative min-h-0 flex-1 bg-[#0c1017]">
        {tabs.map((tab) => {
          const server = servers.find((item) => item.id === tab.serverId);
          if (!server) return null;
          return (
            <TerminalSession
              key={tab.id}
              tabId={tab.id}
              server={server}
              cwd={tab.cwd}
              active={tab.id === activeId}
              onConnect={() => void connectServer(server.id).catch(() => {})}
              onStatusChange={handleStatusChange}
              onDimensionsChange={handleDimensionsChange}
              onRegisterTerminal={handleRegisterTerminal}
            />
          );
        })}

        {tabs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/40 shadow-inner">
              <TerminalIcon className="size-7" />
            </div>
            <div className="flex max-w-sm flex-col gap-1">
              <h3 className="text-[15px] font-semibold text-white/90">
                {connected.length === 0 ? "No Connected Servers" : "No Active Terminal Sessions"}
              </h3>
              <p className="text-[13px] leading-5 text-white/55">
                {connected.length === 0
                  ? "Connect an SSH server to launch a live terminal shell."
                  : "Use the '+' icon above to open a terminal tab on a connected server."}
              </p>
            </div>
            {connected.length > 0 ? (
              <button
                type="button"
                onClick={() => addTab(connected[0].id)}
                className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-[13px] font-medium text-emerald-300 transition-all hover:border-emerald-400/50 hover:bg-emerald-500/25 active:scale-95"
              >
                <Plus className="size-4" />
                Open {connected[0].name}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TerminalSession({
  tabId,
  server,
  cwd,
  active,
  onConnect,
  onStatusChange,
  onDimensionsChange,
  onRegisterTerminal,
}: {
  tabId: string;
  server: Server;
  cwd?: string;
  active: boolean;
  onConnect: () => void;
  onStatusChange: (tabId: string, status: SessionStatus) => void;
  onDimensionsChange: (tabId: string, dims: { cols: number; rows: number }) => void;
  onRegisterTerminal: (tabId: string, terminal: import("@xterm/xterm").Terminal | null) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const fitRef = useRef<import("@xterm/addon-fit").FitAddon | null>(null);
  const termRef = useRef<import("@xterm/xterm").Terminal | null>(null);
  const [status, setStatus] = useState<SessionStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const serverId = server.id;
  const serverName = server.name;

  // Propagate status changes to parent tab
  useEffect(() => {
    onStatusChange(tabId, status);
  }, [tabId, status, onStatusChange]);

  // When tab becomes active, trigger safe resize and focus terminal
  useEffect(() => {
    if (!active) return;
    const rafId = window.requestAnimationFrame(() => {
      const dims = safeFitAndResize(termRef.current, fitRef.current, host.current, socketRef.current);
      if (dims) onDimensionsChange(tabId, dims);
      termRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [active, tabId, onDimensionsChange]);

  useEffect(() => {
    if (isSampleServer(serverId) || server.connected === false) return;
    const container = host.current;
    if (!container) return;

    // Clear stale terminal DOM nodes from previous reconnects
    container.innerHTML = "";

    let disposed = false;
    let socket: WebSocket | null = null;
    let terminal: import("@xterm/xterm").Terminal | null = null;
    let fitAddon: import("@xterm/addon-fit").FitAddon | null = null;
    let observer: ResizeObserver | null = null;
    let resizeRaf: number | null = null;

    async function connect() {
      try {
        const [{ Terminal }, { FitAddon }] = await Promise.all([
          import("@xterm/xterm"),
          import("@xterm/addon-fit"),
        ]);
        if (disposed || !host.current) return;

        terminal = new Terminal({
          cursorBlink: true,
          cursorStyle: "bar",
          cursorWidth: 2,
          fontFamily:
            'ui-monospace, "JetBrains Mono", "SF Mono", "Fira Code", Menlo, Monaco, Consolas, monospace',
          fontSize: 13,
          lineHeight: 1.25,
          letterSpacing: 0.3,
          smoothScrollDuration: 120,
          allowTransparency: true,
          theme: {
            background: "#00000000",
            foreground: "#e6edf3",
            cursor: "#58a6ff",
            cursorAccent: "#0d1117",
            selectionBackground: "rgba(56, 139, 253, 0.35)",
            selectionForeground: "#ffffff",
            black: "#21262d",
            red: "#ff7b72",
            green: "#3fb950",
            yellow: "#d29922",
            blue: "#58a6ff",
            magenta: "#bc8cff",
            cyan: "#39c5cf",
            white: "#b1bac4",
            brightBlack: "#484f58",
            brightRed: "#ffa198",
            brightGreen: "#56d364",
            brightYellow: "#e3b341",
            brightBlue: "#79c0ff",
            brightMagenta: "#d2a8ff",
            brightCyan: "#56d4dd",
            brightWhite: "#f0f6fc",
          },
        });

        fitAddon = new FitAddon();
        fitRef.current = fitAddon;
        termRef.current = terminal;
        onRegisterTerminal(tabId, terminal);

        terminal.loadAddon(fitAddon);
        try {
          terminal.open(host.current);
        } catch (openErr) {
          console.warn("[Terminal] Failed to open in DOM:", openErr);
        }

        // Safe initial fit
        const initialDims = safeFitAndResize(terminal, fitAddon, host.current, null);
        if (initialDims) onDimensionsChange(tabId, initialDims);

        socket = new WebSocket(
          wsUrl(`/ws/terminal?serverId=${encodeURIComponent(serverId)}`),
          localAuthWSProtocols(getInjectedDesktopConfig()?.localAuthToken),
        );
        socket.binaryType = "arraybuffer";
        socketRef.current = socket;

        const timeout = window.setTimeout(() => {
          if (disposed || socket?.readyState === WebSocket.OPEN) return;
          setError(
            "ServerUI could not open a terminal session. Check the server connection and retry.",
          );
          setStatus("disconnected");
          try {
            socket?.close();
          } catch {}
        }, 12000);

        socket.onopen = () => {
          window.clearTimeout(timeout);
          if (disposed || !terminal) return;
          setStatus("connected");
          setError(null);

          const dims = safeFitAndResize(terminal, fitAddon, host.current, socket);
          if (dims) onDimensionsChange(tabId, dims);
        };

        socket.onmessage = (event) => {
          if (disposed || !terminal) return;
          try {
            if (typeof event.data === "string") {
              try {
                const message = JSON.parse(event.data) as { type?: string; message?: string };
                if (message.type === "error") {
                  setError(
                    message.message
                      ? "Terminal session ended. Reconnect to continue."
                      : "Terminal disconnected",
                  );
                  setStatus("disconnected");
                  return;
                }
              } catch {
                terminal.write(event.data);
              }
              return;
            }
            terminal.write(new Uint8Array(event.data as ArrayBuffer));
          } catch {
            // Guard against writes to disposed terminal
          }
        };

        socket.onerror = () => {
          window.clearTimeout(timeout);
          if (disposed) return;
          setError("Terminal disconnected. Reconnect when the server is available.");
          setStatus("disconnected");
        };

        socket.onclose = () => {
          window.clearTimeout(timeout);
          if (disposed) return;
          setStatus("disconnected");
        };

        terminal.onData((data) => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(new TextEncoder().encode(data));
          }
        });

        // Debounced ResizeObserver to prevent layout thrashing and negative geometry crashes
        observer = new ResizeObserver(() => {
          if (disposed || !host.current) return;
          if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
          resizeRaf = window.requestAnimationFrame(() => {
            const dims = safeFitAndResize(terminal, fitAddon, host.current, socket);
            if (dims) onDimensionsChange(tabId, dims);
          });
        });
        observer.observe(host.current);
      } catch {
        if (!disposed) {
          setError("Unable to start the terminal. Retry or reopen the window.");
          setStatus("disconnected");
        }
      }
    }

    void connect();

    return () => {
      disposed = true;
      if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        try {
          if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
            socket.close();
          }
        } catch {}
        socket = null;
      }
      socketRef.current = null;
      fitRef.current = null;
      termRef.current = null;
      onRegisterTerminal(tabId, null);
      if (terminal) {
        try {
          terminal.dispose();
        } catch {}
        terminal = null;
      }
      if (host.current) {
        host.current.innerHTML = "";
      }
    };
  }, [nonce, server.connected, serverId, tabId, onDimensionsChange, onRegisterTerminal]);

  // Navigate to initial directory when requested
  useEffect(() => {
    if (status !== "connected" || !cwd || !socketRef.current) return;
    try {
      socketRef.current.send(new TextEncoder().encode(`cd ${quotePath(cwd)}\n`));
    } catch {}
  }, [cwd, status]);

  if (isSampleServer(serverId)) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center p-8"
        style={{
          visibility: active ? "visible" : "hidden",
          zIndex: active ? 10 : 0,
          pointerEvents: active ? "auto" : "none",
        }}
      >
        <div className="flex max-w-sm flex-col items-center gap-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-white/40">
            <TerminalIcon className="size-5" />
          </div>
          <p className="text-[13px] leading-5 text-white/60">
            <span className="font-medium text-white/90">{serverName}</span> is preview data and has
            no active shell. Open a tab on a live SSH host.
          </p>
        </div>
      </div>
    );
  }

  if (server.connected === false) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center"
        style={{
          visibility: active ? "visible" : "hidden",
          zIndex: active ? 10 : 0,
          pointerEvents: active ? "auto" : "none",
        }}
      >
        <ServerIcon
          iconId={server.iconId}
          customIcon={server.customIcon}
          serverId={server.id}
          updatedAt={server.updatedAt}
          size={28}
        />
        <div className="flex flex-col gap-1">
          <h2 className="text-[16px] font-semibold tracking-tight text-white">
            {serverName} is disconnected
          </h2>
          <p className="text-[12px] text-white/50">
            Connect the server to resume terminal access.
          </p>
        </div>
        <button
          type="button"
          onClick={onConnect}
          className="mt-1 rounded-full bg-white px-5 py-2 text-[13px] font-semibold text-zinc-900 shadow-md transition-all hover:bg-white/90 active:scale-95"
        >
          Connect Now
        </button>
      </div>
    );
  }

  const handleReconnect = () => {
    setStatus("connecting");
    setError(null);
    setNonce((value) => value + 1);
  };

  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{
        visibility: active ? "visible" : "hidden",
        zIndex: active ? 10 : 0,
        pointerEvents: active ? "auto" : "none",
      }}
    >
      {/* Floating Status / Error Notification (Doesn't eat terminal rows!) */}
      {status === "disconnected" ? (
        <div className="pointer-events-auto absolute left-1/2 top-4 z-30 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-red-500/25 bg-zinc-950/90 px-4 py-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-sheet-in">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
            <AlertCircle className="size-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[12px] font-medium text-white/95">
              {error || "Terminal session ended"}
            </span>
            <span className="text-[11px] text-white/50">Connection to {serverName} was closed</span>
          </div>
          <button
            type="button"
            onClick={handleReconnect}
            className="ml-2 flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white transition-all hover:bg-white/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <RotateCw className="size-3" />
            Reconnect
          </button>
        </div>
      ) : null}

      {/* Terminal Viewport */}
      <div ref={host} className="min-h-0 flex-1 px-2 pb-2" />
    </div>
  );
}
