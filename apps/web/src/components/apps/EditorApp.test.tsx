import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorApp } from "./EditorApp";

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
];

vi.mock("@/src/lib/session", () => ({
  useSession: () => ({
    servers: mockServers,
    connectServer: vi.fn(),
  }),
}));

vi.mock("@/src/components/window/window-context", () => ({
  useWindowManager: () => ({
    openWindow: vi.fn(),
    closeWindow: vi.fn(),
  }),
  setCloseGuard: vi.fn(),
}));

vi.mock("@/src/lib/api/files", () => ({
  readFile: vi.fn().mockResolvedValue({
    content: "test file content",
    path: "/test.txt",
    writable: true,
  }),
  writeFile: vi.fn().mockResolvedValue({ status: "ok" }),
}));

describe("EditorApp", () => {
  it("renders scratch editor with px0 branding and initial tab", () => {
    render(<EditorApp windowId="test-editor-win" />);
    expect(screen.getByText("px")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("untitled-1.sh")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("can add a new scratch tab", () => {
    render(<EditorApp windowId="test-editor-win" />);
    const addBtn = screen.getByTitle("Add File Tab");
    fireEvent.click(addBtn);
    expect(screen.getByText("untitled-2.sh")).toBeInTheDocument();
  });

  it("toggles find and replace panel", () => {
    render(<EditorApp windowId="test-editor-win" />);
    const searchBtn = screen.getByTitle("Find & Replace (Cmd+F)");
    fireEvent.click(searchBtn);
    expect(screen.getByPlaceholderText("Find in file...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Replace with...")).toBeInTheDocument();
  });
});
