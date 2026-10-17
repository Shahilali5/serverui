"use client";

import { useState, useMemo } from "react";
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

const SAMPLE_CONTAINERS: Container[] = [
  {
    id: "c1a938f2b",
    name: "nginx-reverse-proxy",
    image: "nginx:alpine",
    state: "running",
    status: "Up 4 days",
    ports: ["0.0.0.0:80->80/tcp", "0.0.0.0:443->443/tcp"],
    cpu: 1.2,
    memory: "24.5 MB",
    uptime: "4d 12h",
  },
  {
    id: "d83f12a9e",
    name: "postgres-main",
    image: "postgres:16-alpine",
    state: "running",
    status: "Up 4 days",
    ports: ["127.0.0.1:5432->5432/tcp"],
    cpu: 3.8,
    memory: "186.2 MB",
    uptime: "4d 12h",
  },
  {
    id: "e44c2198a",
    name: "redis-cache",
    image: "redis:7-alpine",
    state: "running",
    status: "Up 2 days",
    ports: ["127.0.0.1:6379->6379/tcp"],
    cpu: 0.4,
    memory: "18.1 MB",
    uptime: "2d 4h",
  },
  {
    id: "f99e32b1c",
    name: "serverui-web",
    image: "serverui-web:prod",
    state: "running",
    status: "Up 5 hours",
    ports: ["0.0.0.0:3000->3000/tcp"],
    cpu: 2.1,
    memory: "78.4 MB",
    uptime: "5h 18m",
  },
  {
    id: "b22a10f8d",
    name: "certbot-renew",
    image: "certbot/certbot:latest",
    state: "stopped",
    status: "Exited (0) 6 hours ago",
    ports: [],
    cpu: 0.0,
    memory: "0 MB",
    uptime: "Stopped",
  },
];

export function ApplicationsApp() {
  const { servers } = useSession();
  const { openWindow } = useWindowManager();
  const [containers, setContainers] = useState<Container[]>(SAMPLE_CONTAINERS);
  const [filter, setFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "running" | "stopped">("all");
  const [selectedServer, setSelectedServer] = useState(servers[0]?.id || "local");

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
    setContainers((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextState = c.state === "running" ? "stopped" : "running";
        return {
          ...c,
          state: nextState,
          status: nextState === "running" ? "Up just now" : "Exited (0) just now",
          cpu: nextState === "running" ? 1.5 : 0,
        };
      }),
    );
  };

  const removeContainer = (id: string) => {
    setContainers((prev) => prev.filter((c) => c.id !== id));
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
            onClick={() => openWindow("terminal")}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11.5px] font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            <Terminal className="size-3.5" />
            Shell Exec
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
        {filtered.map((item) => (
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
        ))}
      </div>
    </div>
  );
}
