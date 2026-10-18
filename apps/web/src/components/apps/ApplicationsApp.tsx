"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Box,
  Play,
  Square,
  RotateCw,
  Trash2,
  Terminal,
  Activity,
  Layers,
  Search,
  Plus,
  RefreshCw,
  Cpu,
  Database,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X,
} from "lucide-react";
import { useSession } from "@/src/lib/session";
import { useWindowManager } from "@/src/components/window/window-context";

type Container = {
  id: string;
  name: string;
  image: string;
  state: "running" | "stopped" | "restarting";
  status: string;
  ports: string[];
  cpu: number;
  memory: string;
  uptime: string;
};

const STORAGE_KEY = "serverui-docker-containers";

export function ApplicationsApp() {
  const { servers } = useSession();
  const { openWindow } = useWindowManager();
  const [containers, setContainers] = useState<Container[]>([]);
  const [filter, setFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "running" | "stopped">("all");
  const [selectedServer, setSelectedServer] = useState(servers[0]?.id || "local");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newPort, setNewPort] = useState("");

  // Load from persistent local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setContainers(JSON.parse(saved));
      }
    } catch {
      // Empty by default
    }
  }, []);

  const saveContainers = (updated: Container[]) => {
    setContainers(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const filtered = useMemo(() => {
    return containers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(filter.toLowerCase()) ||
        c.image.toLowerCase().includes(filter.toLowerCase());
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "running" && c.state === "running") ||
        (activeTab === "stopped" && c.state === "stopped");
      return matchesSearch && matchesTab;
    });
  }, [containers, filter, activeTab]);

  const toggleState = (id: string) => {
    const next = containers.map((c) => {
      if (c.id !== id) return c;
      const nextState = c.state === "running" ? "stopped" : "running";
      return {
        ...c,
        state: nextState as "running" | "stopped",
        status: nextState === "running" ? "Up just now" : "Exited (0) just now",
        cpu: nextState === "running" ? 1.2 : 0,
        memory: nextState === "running" ? (c.memory !== "0 MB" ? c.memory : "24.5 MB") : "0 MB",
      };
    });
    saveContainers(next);
  };

  const removeContainer = (id: string) => {
    const next = containers.filter((c) => c.id !== id);
    saveContainers(next);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newImage.trim()) return;

    const shortId = Math.random().toString(16).substring(2, 10);
    const portsArray = newPort.trim() ? [newPort.trim()] : [];

    const item: Container = {
      id: shortId,
      name: newName.trim(),
      image: newImage.trim(),
      state: "running",
      status: "Up just now",
      ports: portsArray,
      cpu: 0.8,
      memory: "32.0 MB",
      uptime: "Just started",
    };

    saveContainers([item, ...containers]);
    setNewName("");
    setNewImage("");
    setNewPort("");
    setModalOpen(false);
  };

  return (
    <div className="flex h-full flex-col bg-[#0f1117] text-white font-sans select-none">
      {/* Top action bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-black/40 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
            <Box className="size-4" />
          </div>
          <span className="text-[13px] font-semibold tracking-tight text-white">
            Docker & Containers
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10.5px] font-medium text-white/70">
            {containers.filter((c) => c.state === "running").length} Running
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-2 size-3.5 text-white/40" />
            <input
              type="text"
              placeholder="Search containers…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-1 pl-8 pr-2.5 text-[11.5px] text-white placeholder-white/40 outline-none focus:border-sky-400/50"
            />
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-3 py-1 text-[11.5px] font-semibold text-white shadow-sm transition-colors"
          >
            <Plus className="size-3.5" />
            Deploy Container
          </button>

          <button
            type="button"
            onClick={() => openWindow("terminal")}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11.5px] font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            <Terminal className="size-3.5" />
            CLI
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/5 px-4 py-2 text-[12px]">
        {(["all", "running", "stopped"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-2.5 py-1 capitalize transition-all ${
              activeTab === tab
                ? "bg-white/15 font-semibold text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Containers list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center">
            <Box className="size-10 text-white/20 mb-3" />
            <h3 className="text-sm font-medium text-white/80">No active Docker containers</h3>
            <p className="mt-1 text-xs text-white/40 max-w-sm">
              Deploy your first containerized application or service to this server.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-4 flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors"
            >
              <Plus className="size-3.5" />
              Deploy Container Now
            </button>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="group flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-3.5 transition-all hover:border-white/15 hover:bg-white/[0.05]"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className={`size-2.5 shrink-0 rounded-full ${
                    item.state === "running"
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                      : "bg-zinc-600"
                  }`}
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-semibold text-white">
                      {item.name}
                    </span>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9.5px] font-mono text-white/60">
                      {item.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-white/45">
                    <span className="truncate font-mono">{item.image}</span>
                    <span>•</span>
                    <span>{item.status}</span>
                    {item.ports.length > 0 ? (
                      <>
                        <span>•</span>
                        <span className="truncate font-mono text-white/55">
                          {item.ports.join(", ")}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {item.state === "running" ? (
                  <div className="hidden sm:flex items-center gap-4 text-right text-[11px] font-mono text-white/60 pr-2">
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase">CPU</span>
                      {item.cpu}%
                    </div>
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase">RAM</span>
                      {item.memory}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title={item.state === "running" ? "Stop container" : "Start container"}
                    onClick={() => toggleState(item.id)}
                    className={`flex size-8 items-center justify-center rounded-xl transition-all ${
                      item.state === "running"
                        ? "text-amber-400 hover:bg-amber-400/20"
                        : "text-emerald-400 hover:bg-emerald-400/20"
                    }`}
                  >
                    {item.state === "running" ? (
                      <Square className="size-3.5 fill-current" />
                    ) : (
                      <Play className="size-3.5 fill-current" />
                    )}
                  </button>

                  <button
                    type="button"
                    title="Remove container"
                    onClick={() => removeContainer(item.id)}
                    className="flex size-8 items-center justify-center rounded-xl text-white/40 transition-colors hover:bg-red-500/20 hover:text-red-400"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Deploy Container Modal */}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#141824] p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Deploy New Container</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-white/70">Container Name</label>
                <input
                  type="text"
                  placeholder="e.g. redis-cache"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-white/70">Docker Image</label>
                <input
                  type="text"
                  placeholder="e.g. redis:alpine, nginx:latest"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-sky-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-white/70">Port Mapping (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 0.0.0.0:6379->6379/tcp"
                  value={newPort}
                  onChange={(e) => setNewPort(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-sky-500 focus:outline-none font-mono"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/60 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-sky-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-400"
                >
                  Launch Container
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
