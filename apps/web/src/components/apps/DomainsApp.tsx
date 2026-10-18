"use client";

import { useState, useEffect } from "react";
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
  Terminal,
  Copy,
  CheckCircle2,
  Code2,
} from "lucide-react";
import { useSession } from "@/src/lib/session";
import { useWindowManager } from "@/src/components/window/window-context";

type DomainRecord = {
  id: string;
  domain: string;
  target: string;
  ssl: boolean;
  sslExpiry?: string;
  status: "active" | "pending" | "error";
};

const STORAGE_KEY = "serverui-custom-domains";

export function DomainsApp() {
  const { openWindow } = useWindowManager();
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [filter, setFilter] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newTarget, setNewTarget] = useState("127.0.0.1:3000");
  const [modalOpen, setModalOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [activeNginxSnippet, setActiveNginxSnippet] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setDomains(JSON.parse(saved));
      }
    } catch {
      // Empty by default
    }
  }, []);

  const saveDomains = (updated: DomainRecord[]) => {
    setDomains(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const generateNginxCommand = (domainName: string, targetAddr: string) => {
    return `cat << 'EOF' > /etc/nginx/sites-enabled/${domainName}
server {
    listen 80;
    server_name ${domainName};

    location / {
        proxy_pass http://${targetAddr};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
nginx -t && systemctl reload nginx && certbot --nginx -d ${domainName} --non-interactive --agree-tos -m admin@${domainName}`;
  };

  const addDomain = () => {
    const cleanDomain = newDomain.trim().toLowerCase();
    const cleanTarget = newTarget.trim() || "127.0.0.1:3000";
    if (!cleanDomain) return;

    const item: DomainRecord = {
      id: `dom_${Date.now()}`,
      domain: cleanDomain,
      target: cleanTarget,
      ssl: true,
      sslExpiry: "90 days left",
      status: "active",
    };

    saveDomains([item, ...domains]);
    setNewDomain("");
    setModalOpen(false);

    // Auto-generate instant SSL & Nginx proxy snippet
    const command = generateNginxCommand(cleanDomain, cleanTarget);
    setActiveNginxSnippet(command);
    setSuccessNotice(cleanDomain);
  };

  const removeDomain = (id: string) => {
    const next = domains.filter((d) => d.id !== id);
    saveDomains(next);
  };

  const toggleSsl = (id: string) => {
    const next = domains.map((d) =>
      d.id === id ? { ...d, ssl: !d.ssl, sslExpiry: !d.ssl ? "90 days left" : undefined } : d,
    );
    saveDomains(next);
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      {/* Auto-configured Domain Notice Banner */}
      {successNotice && activeNginxSnippet ? (
        <div className="mx-4 mt-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <CheckCircle2 className="size-5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">
                  Domain &apos;{successNotice}&apos; registered successfully!
                </h4>
                <p className="text-[11px] text-white/60">
                  Automatic Nginx vhost & Let&apos;s Encrypt SSL issuance script generated below:
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyCommand(activeNginxSnippet)}
                className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1 text-xs text-white"
              >
                {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                <span>{copied ? "Copied Command!" : "Copy One-Liner"}</span>
              </button>
              <button
                type="button"
                onClick={() => openWindow("terminal")}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3 py-1 text-xs font-semibold text-zinc-950"
              >
                <Terminal className="size-3.5" />
                <span>Run in Shell</span>
              </button>
              <button
                type="button"
                onClick={() => setSuccessNotice(null)}
                className="p-1 text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="mt-2.5 rounded-xl bg-black/60 p-2.5 font-mono text-[11px] text-emerald-400/90 overflow-x-auto border border-white/5">
            <pre>{activeNginxSnippet}</pre>
          </div>
        </div>
      ) : null}

      {/* Domain list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center">
            <Globe className="size-10 text-white/20 mb-3" />
            <h3 className="text-sm font-medium text-white/80">No custom domains configured</h3>
            <p className="mt-1 text-xs text-white/40 max-w-sm">
              Point your domain or subdomain to this server and enable automatic SSL reverse proxy.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-4 flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors"
            >
              <Plus className="size-3.5" />
              Add Custom Domain
            </button>
          </div>
        ) : (
          filtered.map((item) => (
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

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  title="View Nginx Command"
                  onClick={() => {
                    const cmd = generateNginxCommand(item.domain, item.target);
                    setActiveNginxSnippet(cmd);
                    setSuccessNotice(item.domain);
                  }}
                  className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70 hover:bg-white/10"
                >
                  <Code2 className="size-3" />
                  <span>Config</span>
                </button>

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
          ))
        )}
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
                  placeholder="e.g. vps.ffglory.xyz"
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
                Save & Auto-Deploy SSL
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
