import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TerminalApp } from "./TerminalApp";

// Mock xterm and addon-fit
vi.mock("@xterm/xterm", () => {
  return {
    Terminal: vi.fn().mockImplementation(() => ({
      loadAddon: vi.fn(),
      open: vi.fn(),
      resize: vi.fn(),
      write: vi.fn(),
      onData: vi.fn(),
      clear: vi.fn(),
      focus: vi.fn(),
      dispose: vi.fn(),
      cols: 80,
      rows: 24,
    })),
  };
});

vi.mock("@xterm/addon-fit", () => {
  return {
    FitAddon: vi.fn().mockImplementation(() => ({
      fit: vi.fn(),
      proposeDimensions: vi.fn().mockReturnValue({ cols: 100, rows: 30 }),
    })),
  };
});

const mockServers = [
  {
    id: "srv_1",
    name: "Production Web",
    host: "192.168.1.10",
    port: 22,
    username: "ubuntu",
    authType: "password" as const,
    connected: true,
    createdAt: 1000,
    updatedAt: 1000,
  },
  {
    id: "srv_2",
    name: "Database Master",
    host: "192.168.1.20",
    port: 22,
    username: "postgres",
    authType: "key" as const,
    connected: true,
    createdAt: 1000,
    updatedAt: 1000,
  },
];

vi.mock("@/src/lib/session", () => ({
  useSession: () => ({
    servers: mockServers,
    connectServer: vi.fn(),
    loadingServers: false,
    serversError: null,
  }),
}));

vi.mock("@/src/lib/api/origin", () => ({
  wsUrl: (path: string) => `ws://localhost:8080${path}`,
}));

vi.mock("@/src/lib/runtime/config", () => ({
  getInjectedDesktopConfig: () => null,
  localAuthWSProtocols: () => undefined,
}));

describe("TerminalApp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Stub ResizeObserver
    global.ResizeObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    };
    // Stub WebSocket
    global.WebSocket = class {
      static OPEN = 1;
      static CONNECTING = 0;
      static CLOSING = 2;
      static CLOSED = 3;
      readyState = 1;
      send = vi.fn();
      close = vi.fn();
      addEventListener = vi.fn();
      removeEventListener = vi.fn();
      binaryType = "blob";
      onopen: (() => void) | null = null;
      onmessage: ((e: unknown) => void) | null = null;
      onerror: (() => void) | null = null;
      onclose: (() => void) | null = null;
    } as unknown as typeof WebSocket;
  });

  it("renders with initial connected server tab without throwing", () => {
    render(<TerminalApp />);
    expect(screen.getByText("Production Web")).toBeDefined();
  });

  it("allows switching tabs and opening new tabs", () => {
    render(<TerminalApp />);
    const newTabBtn = screen.getByLabelText("New terminal tab");
    expect(newTabBtn).toBeDefined();

    fireEvent.click(newTabBtn);
    expect(screen.getByRole("menu", { name: "Connected servers" })).toBeDefined();

    const dbServerBtn = screen.getByText("Database Master");
    fireEvent.click(dbServerBtn);

    expect(screen.getAllByText("Database Master").length).toBeGreaterThan(0);
  });

  it("allows closing a tab cleanly", () => {
    render(<TerminalApp />);
    const closeBtn = screen.getByLabelText("Close Production Web");
    fireEvent.click(closeBtn);
    expect(screen.queryByText("Production Web")).toBeNull();
  });
});
