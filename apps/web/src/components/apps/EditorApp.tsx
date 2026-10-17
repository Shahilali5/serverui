"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Code2,
  Copy,
  ExternalLink,
  FileCode,
  FilePlus,
  FolderOpen,
  Minus,
  Plus,
  RotateCcw,
  Save,
  Search,
  Server,
  Terminal,
  WrapText,
  X,
} from "lucide-react";
import { readFile, writeFile } from "@/src/lib/api/files";
import { ApiError } from "@/src/lib/api/client";
import { setCloseGuard, useWindowManager, type WindowPayload } from "@/src/components/window/window-context";
import { useSession } from "@/src/lib/session";
import { ServerIcon } from "@/src/components/servers/ServerIcon";
import { isSampleServer } from "@/src/lib/sample-servers";

const PX0_GITHUB = "https://github.com/px0-ai/px0";
const PX0_SITE = "https://px0.ai/";

type EditorTab = {
  id: string;
  name: string;
  path?: string;
  serverId: string;
  content: string;
  savedContent: string;
  dirty: boolean;
  writable: boolean;
  loading: boolean;
  error?: string;
};

const SUGGESTED_FILES = [
  { label: "Bash Configuration", path: "~/.bashrc" },
  { label: "Hosts File", path: "/etc/hosts" },
  { label: "Nginx Main Config", path: "/etc/nginx/nginx.conf" },
  { label: "SSH Client Config", path: "~/.ssh/config" },
  { label: "System Environment", path: "/etc/environment" },
  { label: "System Log", path: "/var/log/syslog" },
];

function detectLanguage(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "TypeScript";
  if (lower.endsWith(".js") || lower.endsWith(".jsx") || lower.endsWith(".mjs")) return "JavaScript";
  if (lower.endsWith(".go")) return "Go";
  if (lower.endsWith(".py")) return "Python";
  if (lower.endsWith(".rs")) return "Rust";
  if (lower.endsWith(".sh") || lower.endsWith(".bash") || lower.endsWith(".zsh")) return "Shell";
  if (lower.endsWith(".json")) return "JSON";
  if (lower.endsWith(".yaml") || lower.endsWith(".yml")) return "YAML";
  if (lower.endsWith(".html") || lower.endsWith(".htm") || lower.endsWith(".svg")) return "HTML";
  if (lower.endsWith(".css") || lower.endsWith(".scss") || lower.endsWith(".sass")) return "CSS";
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "Markdown";
  if (lower.endsWith(".sql")) return "SQL";
  if (lower === "dockerfile" || lower.endsWith(".dockerfile")) return "Dockerfile";
  if (lower.endsWith(".conf") || lower.endsWith(".ini") || lower.endsWith(".env")) return "Config";
  return "Plain Text";
}

function safeUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function makeScratchTab(serverId: string, index: number): EditorTab {
  const initialContent = `# px0 Zero-Latency Code Editor
# Ultra-fast, lightweight remote editor for ServerUI
# Connected server: ${serverId || "Local/Demo"}

echo "Hello from ServerUI Editor!"
`;
  return {
    id: `scratch_${safeUUID()}`,
    name: `untitled-${index}.sh`,
    serverId,
    content: initialContent,
    savedContent: initialContent,
    dirty: false,
    writable: true,
    loading: false,
  };
}

export function EditorApp({ payload, windowId }: { payload?: WindowPayload; windowId: string }) {
  const { servers } = useSession();
  const { openWindow, closeWindow } = useWindowManager();

  const connectedServers = useMemo(
    () => servers.filter((s) => s.connected || isSampleServer(s.id)),
    [servers],
  );

  const defaultServerId = payload?.serverId || connectedServers[0]?.id || "default";
  const [selectedServerId, setSelectedServerId] = useState(defaultServerId);

  const [tabs, setTabs] = useState<EditorTab[]>(() => {
    if (payload?.filePath) {
      const fileName = payload.fileName || payload.filePath.split("/").pop() || "file.txt";
      return [
        {
          id: `file_${payload.filePath}`,
          name: fileName,
          path: payload.filePath,
          serverId: payload.serverId || defaultServerId,
          content: "",
          savedContent: "",
          dirty: false,
          writable: true,
          loading: true,
        },
      ];
    }
    return [makeScratchTab(defaultServerId, 1)];
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0]?.id || "");
  const [quickOpenVisible, setQuickOpenVisible] = useState(false);
  const [quickOpenPath, setQuickOpenPath] = useState("");
  const [saveAsVisible, setSaveAsVisible] = useState(false);
  const [saveAsPath, setSaveAsPath] = useState("");
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; ok: boolean } | null>(null);

  // Editor settings
  const [wordWrap, setWordWrap] = useState(true);
  const [tabSize, setTabSize] = useState<2 | 4>(2);
  const [fontSize, setFontSize] = useState<12 | 13 | 14 | 16>(13);

  // Cursor position
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // Search & Replace
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) || tabs[0],
    [tabs, activeTabId],
  );

  const dirtyCount = useMemo(() => tabs.filter((t) => t.dirty).length, [tabs]);

  // Handle Close Guard for unsaved changes
  useEffect(() => {
    setCloseGuard(windowId, () => {
      if (dirtyCount === 0) return true;
      return window.confirm(`You have ${dirtyCount} file(s) with unsaved changes. Discard and close?`);
    });
    return () => {
      setCloseGuard(windowId, null);
    };
  }, [windowId, dirtyCount]);

  // Load file content when a tab requires loading
  useEffect(() => {
    const tabToLoad = tabs.find((t) => t.loading && t.path);
    if (!tabToLoad || !tabToLoad.path) return;

    let cancelled = false;
    const targetPath = tabToLoad.path;
    const targetServerId = tabToLoad.serverId;

    readFile(targetServerId, targetPath)
      .then((res) => {
        if (cancelled) return;
        setTabs((prev) =>
          prev.map((t) => {
            if (t.id !== tabToLoad.id) return t;
            return {
              ...t,
              content: res.content || "",
              savedContent: res.content || "",
              dirty: false,
              writable: res.writable !== false,
              loading: false,
              error: undefined,
            };
          }),
        );
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err instanceof ApiError ? err.message : "Failed to read file";
        setTabs((prev) =>
          prev.map((t) => {
            if (t.id !== tabToLoad.id) return t;
            return {
              ...t,
              content: "",
              savedContent: "",
              dirty: false,
              loading: false,
              error: msg,
            };
          }),
        );
      });

    return () => {
      cancelled = true;
    };
  }, [tabs]);

  // If a new payload arrives, add or switch to that file tab
  useEffect(() => {
    if (!payload?.filePath) return;
    const targetPath = payload.filePath;
    const existing = tabs.find((t) => t.path === targetPath);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }
    const fileName = payload.fileName || targetPath.split("/").pop() || "file.txt";
    const newTab: EditorTab = {
      id: `file_${targetPath}_${Date.now()}`,
      name: fileName,
      path: targetPath,
      serverId: payload.serverId || selectedServerId,
      content: "",
      savedContent: "",
      dirty: false,
      writable: true,
      loading: true,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [payload, selectedServerId]);

  // Notification timer
  useEffect(() => {
    if (!notification) return;
    const id = window.setTimeout(() => setNotification(null), 3000);
    return () => window.clearTimeout(id);
  }, [notification]);

  // Update cursor position on selection changes
  const updateCursorPos = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const textBefore = el.value.substring(0, el.selectionStart);
    const lines = textBefore.split("\n");
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    setCursorPos({ line, col });
  }, []);

  // Save current active tab
  const handleSave = useCallback(
    async (targetPath?: string) => {
      if (!activeTab || saving) return;
      const savePath = targetPath || activeTab.path;
      if (!savePath) {
        setSaveAsPath(`~/untitled-${Date.now().toString().slice(-4)}.sh`);
        setSaveAsVisible(true);
        return;
      }

      setSaving(true);
      try {
        await writeFile(activeTab.serverId, savePath, activeTab.content);
        const fileName = savePath.split("/").pop() || savePath;
        setTabs((prev) =>
          prev.map((t) => {
            if (t.id !== activeTab.id) return t;
            return {
              ...t,
              path: savePath,
              name: fileName,
              savedContent: activeTab.content,
              dirty: false,
            };
          }),
        );
        setNotification({ message: `Saved ${fileName}`, ok: true });
        setSaveAsVisible(false);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Save failed";
        setNotification({ message: `Save failed: ${msg}`, ok: false });
      } finally {
        setSaving(false);
      }
    },
    [activeTab, saving],
  );

  // Close a tab
  const handleCloseTab = useCallback(
    (tabId: string, event?: MouseEvent) => {
      event?.stopPropagation();
      const tab = tabs.find((t) => t.id === tabId);
      if (tab?.dirty) {
        const ok = window.confirm(`"${tab.name}" has unsaved changes. Discard?`);
        if (!ok) return;
      }

      if (tabs.length === 1) {
        // Keep at least one scratch tab
        const next = makeScratchTab(selectedServerId, 1);
        setTabs([next]);
        setActiveTabId(next.id);
        return;
      }

      const nextTabs = tabs.filter((t) => t.id !== tabId);
      setTabs(nextTabs);
      if (activeTabId === tabId) {
        setActiveTabId(nextTabs[nextTabs.length - 1].id);
      }
    },
    [activeTabId, selectedServerId, tabs],
  );

  // Open file from Quick Open
  const handleQuickOpen = useCallback(() => {
    if (!quickOpenPath.trim()) return;
    const path = quickOpenPath.trim();
    const existing = tabs.find((t) => t.path === path && t.serverId === selectedServerId);
    if (existing) {
      setActiveTabId(existing.id);
      setQuickOpenVisible(false);
      setQuickOpenPath("");
      return;
    }

    const fileName = path.split("/").pop() || path;
    const newTab: EditorTab = {
      id: `file_${path}_${Date.now()}`,
      name: fileName,
      path,
      serverId: selectedServerId,
      content: "",
      savedContent: "",
      dirty: false,
      writable: true,
      loading: true,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setQuickOpenVisible(false);
    setQuickOpenPath("");
  }, [quickOpenPath, selectedServerId, tabs]);

  // Global keydown listeners for shortcuts (Cmd+S, Cmd+O, Cmd+F)
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      const isMeta = event.metaKey || event.ctrlKey;
      if (isMeta && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void handleSave();
        return;
      }
      if (isMeta && event.key.toLowerCase() === "o") {
        event.preventDefault();
        setQuickOpenVisible((v) => !v);
        return;
      }
      if (isMeta && event.key.toLowerCase() === "f") {
        event.preventDefault();
        setSearchOpen((v) => !v);
        return;
      }
      if (event.key === "Tab" && !event.shiftKey && !isMeta) {
        event.preventDefault();
        const el = event.currentTarget;
        const indentStr = " ".repeat(tabSize);
        const start = el.selectionStart;
        const end = el.selectionEnd;
        el.setRangeText(indentStr, start, end, "end");
        const nextVal = el.value;
        setTabs((prev) =>
          prev.map((t) => {
            if (t.id !== activeTabId) return t;
            return { ...t, content: nextVal, dirty: nextVal !== t.savedContent };
          }),
        );
        updateCursorPos();
      }
    },
    [activeTabId, handleSave, tabSize, updateCursorPos],
  );

  // Search match count
  const searchMatches = useMemo(() => {
    if (!searchQuery || !activeTab) return 0;
    try {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "gi");
      const matches = activeTab.content.match(regex);
      return matches ? matches.length : 0;
    } catch {
      return 0;
    }
  }, [activeTab, searchQuery]);

  // Handle text replace all
  const handleReplaceAll = useCallback(() => {
    if (!searchQuery || !activeTab) return;
    try {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "g");
      const nextContent = activeTab.content.replace(regex, replaceQuery);
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id !== activeTab.id) return t;
          return { ...t, content: nextContent, dirty: nextContent !== t.savedContent };
        }),
      );
      setNotification({ message: `Replaced ${searchMatches} occurrences`, ok: true });
    } catch {
      setNotification({ message: "Replace error", ok: false });
    }
  }, [activeTab, replaceQuery, searchMatches, searchQuery]);

  const lineCount = activeTab ? activeTab.content.split("\n").length : 1;
  const currentLang = activeTab ? detectLanguage(activeTab.name) : "Plain Text";

  return (
    <div className="flex h-full flex-col bg-[#141416] text-[#e4e4e7] select-none font-sans overflow-hidden">
      {/* Top Header / px0 Brand & Action Bar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/10 bg-black/40 px-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          {/* px0 IDE Branding */}
          <a
            href={PX0_GITHUB}
            target="_blank"
            rel="noreferrer"
            title="px0 · Zero-latency Speed-first IDE (github.com/px0-ai/px0)"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold tracking-tight transition-colors hover:bg-white/10"
          >
            <span className="font-mono text-white/90">px</span>
            <span className="flex size-4 items-center justify-center rounded-sm bg-[#FFC107] text-[10px] font-bold text-black shadow-sm">
              0
            </span>
            <span className="hidden text-[11px] font-normal text-white/40 sm:inline">Editor</span>
          </a>

          <div className="h-4 w-px bg-white/10" />

          {/* Connected Server Selector */}
          <div className="flex items-center gap-1.5">
            <Server className="size-3 text-white/40" />
            <select
              value={selectedServerId}
              onChange={(e) => setSelectedServerId(e.target.value)}
              className="rounded bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/80 outline-none hover:bg-white/10 focus:ring-1 focus:ring-emerald-400"
            >
              {connectedServers.map((s) => (
                <option key={s.id} value={s.id} className="bg-zinc-900 text-white">
                  {s.name} ({s.host || "local"})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 text-[11px]">
          {/* Quick Open File */}
          <button
            type="button"
            onClick={() => setQuickOpenVisible(true)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title="Open Remote File (Cmd+O)"
          >
            <FolderOpen className="size-3.5" />
            <span className="hidden sm:inline">Open</span>
          </button>

          {/* New Scratch Buffer */}
          <button
            type="button"
            onClick={() => {
              const nextIndex = tabs.length + 1;
              const nextTab = makeScratchTab(selectedServerId, nextIndex);
              setTabs((prev) => [...prev, nextTab]);
              setActiveTabId(nextTab.id);
            }}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title="New Scratch File"
          >
            <FilePlus className="size-3.5" />
            <span className="hidden sm:inline">New</span>
          </button>

          {/* Search Toggle */}
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
              searchOpen ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
            title="Find & Replace (Cmd+F)"
          >
            <Search className="size-3.5" />
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!activeTab?.dirty || saving}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
              activeTab?.dirty
                ? "bg-emerald-500 text-black shadow-sm hover:bg-emerald-400"
                : "bg-white/5 text-white/40 cursor-not-allowed"
            }`}
            title="Save changes (Cmd+S)"
          >
            <Save className="size-3" />
            <span>{saving ? "Saving…" : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Tab Strip */}
      <div className="flex h-9 shrink-0 items-center overflow-x-auto border-b border-white/10 bg-black/25 px-2 text-[12px] no-scrollbar">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveTabId(tab.id)}
                className={`group relative flex h-7 items-center gap-2 rounded-t-lg px-3 cursor-pointer transition-colors ${
                  isActive
                    ? "bg-[#1e1e22] text-white font-medium shadow-sm border-t-2 border-emerald-400"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                <FileCode className={`size-3.5 ${isActive ? "text-emerald-400" : "opacity-50"}`} />
                <span className="max-w-[140px] truncate">{tab.name}</span>

                {tab.dirty ? (
                  <span
                    className="size-1.5 rounded-full bg-amber-400"
                    title="Unsaved changes"
                  />
                ) : null}

                <button
                  type="button"
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className="rounded p-0.5 opacity-40 hover:bg-white/10 hover:opacity-100"
                  title="Close Tab"
                >
                  <X className="size-3" />
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => {
              const nextIndex = tabs.length + 1;
              const nextTab = makeScratchTab(selectedServerId, nextIndex);
              setTabs((prev) => [...prev, nextTab]);
              setActiveTabId(nextTab.id);
            }}
            className="flex size-6 items-center justify-center rounded-md text-white/40 hover:bg-white/10 hover:text-white transition-colors"
            title="Add File Tab"
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        {/* px0 repo link pill */}
        <div className="ml-auto hidden items-center gap-2 sm:flex">
          <a
            href={PX0_GITHUB}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-white/40 hover:text-white/80 transition-colors"
          >
            <span>px0-ai/px0</span>
            <ExternalLink className="size-2.5" />
          </a>
        </div>
      </div>

      {/* Find & Replace Bar (Collapsible) */}
      {searchOpen ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-[#1a1a1d] px-3 py-2 text-[12px]">
          <div className="flex items-center gap-1.5 rounded-md bg-black/40 px-2 py-1 ring-1 ring-white/10">
            <Search className="size-3 text-white/40" />
            <input
              type="text"
              placeholder="Find in file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white outline-none placeholder:text-white/30 text-xs w-36 sm:w-48 font-mono"
            />
            {searchQuery ? (
              <span className="text-[10px] text-white/40">
                {searchMatches} match{searchMatches === 1 ? "" : "es"}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5 rounded-md bg-black/40 px-2 py-1 ring-1 ring-white/10">
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="bg-transparent text-white outline-none placeholder:text-white/30 text-xs w-36 sm:w-48 font-mono"
            />
          </div>

          <button
            type="button"
            onClick={handleReplaceAll}
            disabled={!searchMatches}
            className="rounded bg-white/10 px-2 py-1 text-xs font-medium text-white/80 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Replace All
          </button>

          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="ml-auto text-white/40 hover:text-white"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}

      {/* Editor Main Canvas */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        {activeTab?.loading ? (
          <div className="flex h-full items-center justify-center text-sm text-white/40">
            <div className="flex flex-col items-center gap-2">
              <div className="size-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              <span>Loading remote file from server…</span>
            </div>
          </div>
        ) : activeTab?.error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm">
            <AlertCircle className="size-8 text-red-400" />
            <p className="max-w-md text-white/80">{activeTab.error}</p>
            <button
              type="button"
              onClick={() => {
                setTabs((prev) =>
                  prev.map((t) => (t.id === activeTab.id ? { ...t, loading: true } : t)),
                );
              }}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="relative flex min-h-0 flex-1 font-mono text-[13px] leading-6 select-text overflow-hidden">
            {/* Line Numbers Gutter */}
            <div
              ref={gutterRef}
              aria-hidden
              className="shrink-0 select-none overflow-hidden bg-[#18181b]/50 py-3 pl-3 pr-3 text-right text-white/25 font-mono text-[12px] border-r border-white/5"
              style={{ fontSize: `${fontSize - 1}px` }}
            >
              {Array.from({ length: lineCount }, (_, i) => {
                const isCurrentLine = cursorPos.line === i + 1;
                return (
                  <div
                    key={i}
                    className={`leading-6 ${isCurrentLine ? "text-emerald-400 font-semibold" : ""}`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>

            {/* Textarea Code Canvas */}
            <textarea
              ref={textareaRef}
              aria-label={`Editor buffer: ${activeTab?.name}`}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              wrap={wordWrap ? "on" : "off"}
              readOnly={!activeTab?.writable}
              style={{
                tabSize,
                fontSize: `${fontSize}px`,
                lineHeight: "24px",
              }}
              className="min-h-0 flex-1 resize-none bg-transparent py-3 px-3 text-[#d1d5db] outline-none font-mono selection:bg-emerald-500/30"
              value={activeTab?.content || ""}
              onChange={(e) => {
                const nextVal = e.target.value;
                setTabs((prev) =>
                  prev.map((t) => {
                    if (t.id !== activeTab?.id) return t;
                    return {
                      ...t,
                      content: nextVal,
                      dirty: nextVal !== t.savedContent,
                    };
                  }),
                );
                updateCursorPos();
              }}
              onKeyUp={updateCursorPos}
              onClick={updateCursorPos}
              onKeyDown={handleKeyDown}
              onScroll={(e) => {
                if (gutterRef.current) {
                  gutterRef.current.scrollTop = e.currentTarget.scrollTop;
                }
              }}
            />
          </div>
        )}

        {/* Floating Notification Toast */}
        {notification ? (
          <div
            className={`absolute bottom-3 right-4 z-30 flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs shadow-2xl backdrop-blur-xl ${
              notification.ok
                ? "border-emerald-500/40 bg-black/85 text-emerald-300"
                : "border-red-500/40 bg-black/85 text-red-300"
            }`}
          >
            {notification.ok ? <Check className="size-3.5" /> : <AlertCircle className="size-3.5" />}
            <span>{notification.message}</span>
          </div>
        ) : null}
      </div>

      {/* Bottom Status Bar */}
      <div className="flex h-7 shrink-0 items-center justify-between border-t border-white/10 bg-[#0f0f12] px-3 text-[11px] text-white/50">
        <div className="flex items-center gap-3">
          <span className="font-mono text-white/70">
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span className="hidden sm:inline">
            {lineCount} lines · {activeTab ? activeTab.content.length : 0} chars
          </span>
          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
            {currentLang}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Word Wrap Toggle */}
          <button
            type="button"
            onClick={() => setWordWrap((w) => !w)}
            className={`flex items-center gap-1 hover:text-white transition-colors ${
              wordWrap ? "text-white/80" : "text-white/40"
            }`}
            title="Toggle Word Wrap"
          >
            <WrapText className="size-3" />
            <span className="hidden md:inline">Wrap: {wordWrap ? "On" : "Off"}</span>
          </button>

          {/* Indent Size */}
          <button
            type="button"
            onClick={() => setTabSize((s) => (s === 2 ? 4 : 2))}
            className="hover:text-white transition-colors"
            title="Toggle Indent (2 or 4 spaces)"
          >
            Spaces: {tabSize}
          </button>

          {/* Font Size */}
          <button
            type="button"
            onClick={() => {
              const sizes: Array<12 | 13 | 14 | 16> = [12, 13, 14, 16];
              const next = sizes[(sizes.indexOf(fontSize) + 1) % sizes.length];
              setFontSize(next);
            }}
            className="hover:text-white transition-colors"
            title="Toggle Font Size"
          >
            {fontSize}px
          </button>

          <span className="hidden sm:inline">UTF-8</span>

          <span
            className={`size-1.5 rounded-full ${
              activeTab?.writable ? "bg-emerald-400" : "bg-amber-400"
            }`}
            title={activeTab?.writable ? "Read & Write" : "Read Only"}
          />
        </div>
      </div>

      {/* Quick Open File Modal */}
      {quickOpenVisible ? (
        <div
          className="absolute inset-0 z-50 flex items-start justify-center bg-black/60 p-6 pt-16 backdrop-blur-md"
          onClick={() => setQuickOpenVisible(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#1c1c1f] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-sm font-semibold text-white">Open File on Remote Server</h4>
              <button
                type="button"
                onClick={() => setQuickOpenVisible(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="mt-2 text-xs text-white/50">
              Enter absolute or relative path to view/edit on server:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleQuickOpen();
              }}
              className="mt-3 flex gap-2"
            >
              <input
                type="text"
                autoFocus
                placeholder="e.g. /etc/nginx/nginx.conf or ~/.bashrc"
                value={quickOpenPath}
                onChange={(e) => setQuickOpenPath(e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                disabled={!quickOpenPath.trim()}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-medium text-black hover:bg-emerald-400 disabled:opacity-40"
              >
                Open
              </button>
            </form>

            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Quick Shortcuts
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {SUGGESTED_FILES.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => {
                      setQuickOpenPath(item.path);
                    }}
                    className="flex flex-col items-start rounded-lg bg-white/5 p-2 text-left hover:bg-white/10 transition-colors"
                  >
                    <span className="text-[11px] font-medium text-white/80">{item.label}</span>
                    <span className="font-mono text-[10px] text-white/40 truncate w-full">
                      {item.path}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Save As Modal */}
      {saveAsVisible ? (
        <div
          className="absolute inset-0 z-50 flex items-start justify-center bg-black/60 p-6 pt-20 backdrop-blur-md"
          onClick={() => setSaveAsVisible(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/15 bg-[#1c1c1f] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-sm font-semibold text-white">Save File As</h4>
              <button
                type="button"
                onClick={() => setSaveAsVisible(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="mt-2 text-xs text-white/50">
              Enter target path on server to save this buffer:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (saveAsPath.trim()) {
                  void handleSave(saveAsPath.trim());
                }
              }}
              className="mt-3 flex gap-2"
            >
              <input
                type="text"
                autoFocus
                placeholder="e.g. ~/my-script.sh"
                value={saveAsPath}
                onChange={(e) => setSaveAsPath(e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                disabled={!saveAsPath.trim() || saving}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-medium text-black hover:bg-emerald-400 disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
