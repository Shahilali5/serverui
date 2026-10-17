"use client";

import { useState } from "react";
import {
  Database,
  Plus,
  Search,
  Server,
  Layers,
  HardDrive,
  Key,
  ShieldAlert,
  Play,
  RotateCw,
  Trash2,
  Table,
  CheckCircle2,
} from "lucide-react";
import { useSession } from "@/src/lib/session";

type DatabaseRecord = {
  id: string;
  name: string;
  type: "postgresql" | "mysql" | "sqlite" | "redis";
  size: string;
  tables: number;
  connections: number;
  status: "online" | "offline";
};

const SAMPLE_DBS: DatabaseRecord[] = [
  {
    id: "db_1",
    name: "serverui_production",
    type: "postgresql",
    size: "42.8 MB",
    tables: 14,
    connections: 6,
    status: "online",
  },
  {
    id: "db_2",
    name: "ecommerce_store",
    type: "postgresql",
    size: "184.2 MB",
    tables: 38,
    connections: 12,
    status: "online",
  },
  {
    id: "db_3",
    name: "user_session_cache",
    type: "redis",
    size: "16.5 MB",
    tables: 1,
    connections: 4,
    status: "online",
  },
  {
    id: "db_4",
    name: "analytics_archive",
    type: "mysql",
    size: "520.1 MB",
    tables: 22,
    connections: 2,
    status: "online",
  },
];

export function DatabasesApp() {
  const [databases, setDatabases] = useState<DatabaseRecord[]>(SAMPLE_DBS);
  const [filter, setFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<DatabaseRecord["type"]>("postgresql");

  const addDatabase = () => {
    if (!newName.trim()) return;
    const item: DatabaseRecord = {
      id: `db_${Date.now()}`,
      name: newName.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      type: newType,
      size: "0 MB",
      tables: 0,
      connections: 0,
      status: "online",
    };
    setDatabases((prev) => [item, ...prev]);
    setNewName("");
    setModalOpen(false);
  };

  const removeDb = (id: string) => {
    setDatabases((prev) => prev.filter((d) => d.id !== id));
  };

  const filtered = databases.filter(
    (d) =>
      d.name.toLowerCase().includes(filter.toLowerCase()) ||
      d.type.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col bg-[#0f1117] text-white font-sans select-none">
      {/* Top action bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-black/40 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
            <Database className="size-4" />
          </div>
          <span className="text-[13px] font-semibold tracking-tight text-white">
            Databases & Storage
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10.5px] font-medium text-white/70">
            {databases.length} Databases
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-44">
            <Search className="absolute left-2.5 top-2 size-3.5 text-white/40" />
            <input
              type="text"
              placeholder="Search databases…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-1 pl-8 pr-2.5 text-[11.5px] text-white placeholder-white/40 outline-none focus:border-indigo-400/50"
            />
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-[12px] font-semibold text-white transition-all hover:bg-indigo-400 active:scale-95"
          >
            <Plus className="size-3.5" />
            Create Database
          </button>
        </div>
      </div>

      {/* Database list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-3.5 transition-all hover:border-white/15 hover:bg-white/[0.05]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/70">
                <Database className="size-4.5 text-indigo-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13.5px] font-semibold text-white">
                    {item.name}
                  </span>
                  <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 text-[9.5px] font-mono font-medium uppercase text-indigo-300">
                    {item.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-white/45">
                  <span>Size: {item.size}</span>
                  <span>•</span>
                  <span>{item.tables} Tables</span>
                  <span>•</span>
                  <span>{item.connections} Active Connections</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                title="Delete Database"
                onClick={() => removeDb(item.id)}
                className="flex size-8 items-center justify-center rounded-xl text-white/40 transition-colors hover:bg-red-500/20 hover:text-red-400"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Database Modal */}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-zinc-900 p-5 shadow-2xl">
            <h3 className="text-[15px] font-semibold text-white">Create Database</h3>
            <p className="mt-1 text-[12px] text-white/50">
              Provision a database instance on your connected server.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Database Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. my_app_db"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12.5px] text-white placeholder-white/40 outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Engine Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as DatabaseRecord["type"])}
                  className="w-full rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-[12.5px] text-white outline-none focus:border-indigo-400"
                >
                  <option value="postgresql">PostgreSQL 16</option>
                  <option value="mysql">MySQL 8.0</option>
                  <option value="redis">Redis 7 (In-Memory Key/Value)</option>
                  <option value="sqlite">SQLite 3 (Embedded)</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl px-3 py-1.5 text-[12px] text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addDatabase}
                className="rounded-xl bg-indigo-500 px-4 py-1.5 text-[12px] font-semibold text-white transition-all hover:bg-indigo-400"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
