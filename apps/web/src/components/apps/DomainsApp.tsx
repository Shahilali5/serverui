"use client";

import { useState } from "react";
import {
  Globe,
  Lock,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Trash2,
  RefreshCw,
  Check,
  Sparkles,
} from "lucide-react";
import { useSession } from "@/src/lib/session";

type DomainRecord = {
  id: string;
  domain: string;
  target: string;
  ssl: boolean;
  sslExpiry?: string;
  status: "active" | "pending" | "error";
};

const SAMPLE_DOMAINS: DomainRecord[] = [
  {
    id: "dom_1",
    domain: "panel.example.com",
    target: "127.0.0.1:3000",
    ssl: true,
    sslExpiry: "82 days left",
    status: "active",
  },
  {
    id: "dom_2",
    domain: "api.example.com",
    target: "127.0.0.1:8080",
    ssl: true,
    sslExpiry: "82 days left",
    status: "active",
  },
  {
    id: "dom_3",
    domain: "staging.example.com",
    target: "127.0.0.1:4000",
    ssl: false,
    status: "active",
  },
];

export function DomainsApp() {
  const [domains, setDomains] = useState<DomainRecord[]>(SAMPLE_DOMAINS);
  const [filter, setFilter] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newTarget, setNewTarget] = useState("127.0.0.1:3000");
  const [modalOpen, setModalOpen] = useState(false);

  const addDomain = () => {
    if (!newDomain.trim()) return;
    const item: DomainRecord = {
      id: `dom_${Date.now()}`,
      domain: newDomain.trim().toLowerCase(),
      target: newTarget.trim(),
      ssl: true,
      sslExpiry: "90 days left",
      status: "active",
    };
    setDomains((prev) => [item, ...prev]);
    setNewDomain("");
    setModalOpen(false);
  };

  const removeDomain = (id: string) => {
    setDomains((prev) => prev.filter((d) => d.id !== id));
  };

  const toggleSsl = (id: string) => {
    setDomains((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ssl: !d.ssl, sslExpiry: !d.ssl ? "90 days left" : undefined } : d)),
    );
  };

  const filtered = domains.filter(
    (d) =>
      d.domain.toLowerCase().includes(filter.toLowerCase()) ||
      d.target.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col bg-[#0f1117] text-white font-sans select-none">
      {/* Top action bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-black/40 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <Globe className="size-4" />
          </div>
          <span className="text-[13px] font-semibold tracking-tight text-white">
            Domains & SSL Proxy
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10.5px] font-medium text-white/70">
            {domains.length} Configured
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-44">
            <Search className="absolute left-2.5 top-2 size-3.5 text-white/40" />
            <input
              type="text"
              placeholder="Search domains…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-1 pl-8 pr-2.5 text-[11.5px] text-white placeholder-white/40 outline-none focus:border-emerald-400/50"
            />
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-[12px] font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95"
          >
            <Plus className="size-3.5" />
            Add Domain
          </button>
        </div>
      </div>

      {/* Domain list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-3.5 transition-all hover:border-white/15 hover:bg-white/[0.05]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/70">
                <Globe className="size-4.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13.5px] font-semibold text-white">
                    {item.domain}
                  </span>
                  <a
                    href={`https://${item.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/40 hover:text-white"
                  >
                    <ExternalLink className="size-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-white/45">
                  <span>Proxying to:</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.2 font-mono text-white/70">
                    {item.target}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => toggleSsl(item.id)}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-medium transition-all ${
                  item.ssl
                    ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                    : "border border-white/10 bg-white/5 text-white/50 hover:text-white"
                }`}
              >
                <Lock className="size-3" />
                {item.ssl ? item.sslExpiry || "SSL Active" : "No SSL"}
              </button>

              <button
                type="button"
                title="Delete Domain"
                onClick={() => removeDomain(item.id)}
                className="flex size-8 items-center justify-center rounded-xl text-white/40 transition-colors hover:bg-red-500/20 hover:text-red-400"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Domain Modal */}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-zinc-900 p-5 shadow-2xl">
            <h3 className="text-[15px] font-semibold text-white">Add New Domain Proxy</h3>
            <p className="mt-1 text-[12px] text-white/50">
              Proxy external HTTP/HTTPS traffic to a local port with automatic SSL.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Domain Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. app.mycompany.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12.5px] text-white placeholder-white/40 outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Target Destination
                </label>
                <input
                  type="text"
                  placeholder="127.0.0.1:3000"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12.5px] text-white placeholder-white/40 outline-none focus:border-emerald-400"
                />
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
                onClick={addDomain}
                className="rounded-xl bg-emerald-500 px-4 py-1.5 text-[12px] font-semibold text-zinc-950 transition-all hover:bg-emerald-400"
              >
                Save & Issue SSL
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
