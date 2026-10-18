"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Server,
  Globe,
  Database,
  Mail,
  ShieldCheck,
  FileCode,
  HardDrive,
  Cpu,
  Activity,
  Terminal,
  FolderOpen,
  Lock,
  Plus,
  Trash2,
  Play,
  RotateCw,
  Search,
  ExternalLink,
  Sliders,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Zap,
} from "lucide-react";
import { useSession } from "@/src/lib/session";
import { useWindowManager } from "@/src/components/window/window-context";

type ActiveTab =
  | "overview"
  | "websites"
  | "databases"
  | "email"
  | "cron"
  | "firewall"
  | "backups"
  | "system";

export function CPanelApp() {
  const { servers } = useSession();
  const { openWindow } = useWindowManager();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [search, setSearch] = useState("");

  // Persistent cPanel state
  const [websites, setWebsites] = useState<any[]>([]);
  const [databases, setDatabases] = useState<any[]>([]);
  const [emailAccounts, setEmailAccounts] = useState<any[]>([]);
  const [cronJobs, setCronJobs] = useState<any[]>([]);
  const [firewallRules, setFirewallRules] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);

  // Load from persistent local storage
  useEffect(() => {
    try {
      const savedWeb = localStorage.getItem("serverui-cpanel-websites");
      if (savedWeb) setWebsites(JSON.parse(savedWeb));

      const savedDbs = localStorage.getItem("serverui-databases");
      if (savedDbs) setDatabases(JSON.parse(savedDbs));

      const savedEmails = localStorage.getItem("serverui-cpanel-emails");
      if (savedEmails) setEmailAccounts(JSON.parse(savedEmails));

      const savedCron = localStorage.getItem("serverui-cpanel-cron");
      if (savedCron) setCronJobs(JSON.parse(savedCron));

      const savedFw = localStorage.getItem("serverui-cpanel-firewall");
      if (savedFw) {
        setFirewallRules(JSON.parse(savedFw));
      } else {
        // Default standard firewall rules
        const defaults = [
          { id: "fw_1", port: "22", proto: "TCP", desc: "SSH Access", action: "ALLOW" },
          { id: "fw_2", port: "80", proto: "TCP", desc: "HTTP Web Traffic", action: "ALLOW" },
          { id: "fw_3", port: "443", proto: "TCP", desc: "HTTPS SSL Web Traffic", action: "ALLOW" },
          { id: "fw_4", port: "3000", proto: "TCP", desc: "ServerUI Panel", action: "ALLOW" },
        ];
        setFirewallRules(defaults);
        localStorage.setItem("serverui-cpanel-firewall", JSON.stringify(defaults));
      }

      const savedBackups = localStorage.getItem("serverui-cpanel-backups");
      if (savedBackups) setBackups(JSON.parse(savedBackups));
    } catch {}
  }, []);

  // Save helpers
  const saveWebsites = (items: any[]) => {
    setWebsites(items);
    localStorage.setItem("serverui-cpanel-websites", JSON.stringify(items));
  };
  const saveEmails = (items: any[]) => {
    setEmailAccounts(items);
    localStorage.setItem("serverui-cpanel-emails", JSON.stringify(items));
  };
  const saveCron = (items: any[]) => {
    setCronJobs(items);
    localStorage.setItem("serverui-cpanel-cron", JSON.stringify(items));
  };
  const saveFirewall = (items: any[]) => {
    setFirewallRules(items);
    localStorage.setItem("serverui-cpanel-firewall", JSON.stringify(items));
  };
  const saveBackups = (items: any[]) => {
    setBackups(items);
    localStorage.setItem("serverui-cpanel-backups", JSON.stringify(items));
  };

  // Quick modals state
  const [modalType, setModalType] = useState<string | null>(null);
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [input3, setInput3] = useState("");

  const handleCreateWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input1.trim()) return;
    const item = {
      id: `site_${Date.now()}`,
      domain: input1.trim().toLowerCase(),
      root: input2.trim() || `/var/www/${input1.trim().toLowerCase()}`,
      phpVersion: input3 || "PHP 8.3",
      ssl: true,
      status: "Active",
      createdAt: new Date().toLocaleDateString(),
    };
    saveWebsites([item, ...websites]);
    setInput1("");
    setInput2("");
    setInput3("");
    setModalType(null);
  };

  const handleCreateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input1.trim() || !input2.trim()) return;
    const item = {
      id: `email_${Date.now()}`,
      address: `${input1.trim().toLowerCase()}@${input2.trim().toLowerCase()}`,
      quota: "1024 MB",
      used: "0 MB",
      createdAt: new Date().toLocaleDateString(),
    };
    saveEmails([item, ...emailAccounts]);
    setInput1("");
    setInput2("");
    setModalType(null);
  };

  const handleCreateCron = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input1.trim() || !input2.trim()) return;
    const item = {
      id: `cron_${Date.now()}`,
      schedule: input1.trim(),
      command: input2.trim(),
      status: "Enabled",
    };
    saveCron([item, ...cronJobs]);
    setInput1("");
    setInput2("");
    setModalType(null);
  };

  const handleCreateFirewall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input1.trim()) return;
    const item = {
      id: `fw_${Date.now()}`,
      port: input1.trim(),
      proto: input2 || "TCP",
      desc: input3.trim() || "Custom Service Rule",
      action: "ALLOW",
    };
    saveFirewall([...firewallRules, item]);
    setInput1("");
    setInput2("");
    setInput3("");
    setModalType(null);
  };

  const handleTriggerBackup = () => {
    const item = {
      id: `bak_${Date.now()}`,
      filename: `backup-${new Date().toISOString().slice(0, 10)}-full.tar.gz`,
      size: "42.5 MB",
      date: new Date().toLocaleString(),
      type: "Full System Snapshot",
    };
    saveBackups([item, ...backups]);
  };

  return (
    <div className="flex h-full bg-[#0a0d14] text-white font-sans select-none overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-56 shrink-0 border-r border-white/8 bg-black/40 flex flex-col backdrop-blur-xl">
        <div className="flex h-12 items-center gap-2.5 px-4 border-b border-white/8">
          <div className="flex size-7 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
            <Sliders className="size-4" />
          </div>
          <span className="text-[13px] font-bold tracking-tight text-white">cPanel Control</span>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {[
            { id: "overview", label: "Dashboard Overview", icon: Activity },
            { id: "websites", label: "Websites & VHosts", icon: Globe, count: websites.length },
            { id: "databases", label: "MySQL & PostgreSQL", icon: Database, count: databases.length },
            { id: "email", label: "Email Accounts", icon: Mail, count: emailAccounts.length },
            { id: "cron", label: "Cron Job Automation", icon: Clock, count: cronJobs.length },
            { id: "firewall", label: "Security & Firewall", icon: ShieldCheck, count: firewallRules.length },
            { id: "backups", label: "Backups & Restore", icon: HardDrive, count: backups.length },
            { id: "system", label: "Server Diagnostics", icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[12px] font-medium transition-all ${
                  active
                    ? "bg-orange-500 text-white font-semibold shadow-md shadow-orange-500/20"
                    : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="size-3.5" />
                  <span>{tab.label}</span>
                </div>
                {typeof tab.count === "number" && tab.count > 0 ? (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      active ? "bg-black/30 text-white" : "bg-white/10 text-white/60"
                    }`}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Quick Launch Buttons */}
        <div className="p-3 border-t border-white/8 space-y-1.5">
          <button
            type="button"
            onClick={() => openWindow("files")}
            className="flex w-full items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 px-3 py-1.5 text-[11.5px] text-white/80"
          >
            <FolderOpen className="size-3.5 text-sky-400" />
            <span>File Manager</span>
          </button>
          <button
            type="button"
            onClick={() => openWindow("terminal")}
            className="flex w-full items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 px-3 py-1.5 text-[11.5px] text-white/80"
          >
            <Terminal className="size-3.5 text-emerald-400" />
            <span>Terminal Shell</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/8 bg-black/20 px-6 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">cPanel</span>
            <span className="text-xs text-white/30">/</span>
            <span className="text-xs font-semibold capitalize text-white">{activeTab}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (activeTab === "websites") setModalType("website");
                else if (activeTab === "email") setModalType("email");
                else if (activeTab === "cron") setModalType("cron");
                else if (activeTab === "firewall") setModalType("firewall");
                else if (activeTab === "backups") handleTriggerBackup();
                else openWindow("servers");
              }}
              className="flex items-center gap-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 px-3 py-1 text-[11.5px] font-semibold text-white shadow-sm transition-colors"
            >
              <Plus className="size-3.5" />
              <span>
                {activeTab === "websites"
                  ? "Add Website"
                  : activeTab === "email"
                  ? "Create Account"
                  : activeTab === "cron"
                  ? "New Cron Job"
                  : activeTab === "firewall"
                  ? "Add Port Rule"
                  : activeTab === "backups"
                  ? "Create Backup"
                  : "Add Server"}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Switcher Views */}
        <div className="flex-1 p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Metrics Bento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between text-white/60 mb-2">
                    <span className="text-xs font-medium">Hosted Websites</span>
                    <Globe className="size-4 text-sky-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{websites.length}</div>
                  <div className="mt-1 text-[11px] text-white/40">Active Apache/Nginx vhosts</div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between text-white/60 mb-2">
                    <span className="text-xs font-medium">Databases</span>
                    <Database className="size-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{databases.length}</div>
                  <div className="mt-1 text-[11px] text-white/40">MySQL & PostgreSQL</div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between text-white/60 mb-2">
                    <span className="text-xs font-medium">Email Inboxes</span>
                    <Mail className="size-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{emailAccounts.length}</div>
                  <div className="mt-1 text-[11px] text-white/40">Custom domain mailboxes</div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between text-white/60 mb-2">
                    <span className="text-xs font-medium">Firewall Status</span>
                    <ShieldCheck className="size-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">ACTIVE</div>
                  <div className="mt-1 text-[11px] text-white/40">
                    {firewallRules.length} ports filtered
                  </div>
                </div>
              </div>

              {/* cPanel Feature Modules */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  onClick={() => setActiveTab("websites")}
                  className="group cursor-pointer rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] p-5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 group-hover:scale-105 transition-transform">
                      <Globe className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Domains & VHosts</h4>
                      <p className="text-xs text-white/50 mt-0.5">Manage domain virtual hosts & SSL</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => openWindow("files")}
                  className="group cursor-pointer rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] p-5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                      <FolderOpen className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">File Manager</h4>
                      <p className="text-xs text-white/50 mt-0.5">Upload, edit and zip server files</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => openWindow("databases")}
                  className="group cursor-pointer rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] p-5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
                      <Database className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Database Management</h4>
                      <p className="text-xs text-white/50 mt-0.5">Create MySQL/Postgres & phpMyAdmin</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("email")}
                  className="group cursor-pointer rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] p-5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Email Server</h4>
                      <p className="text-xs text-white/50 mt-0.5">IMAP/SMTP and Webmail forwarders</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("cron")}
                  className="group cursor-pointer rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] p-5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
                      <Clock className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Cron Jobs</h4>
                      <p className="text-xs text-white/50 mt-0.5">Scheduled shell and PHP automation</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("firewall")}
                  className="group cursor-pointer rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] p-5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Firewall & UFW</h4>
                      <p className="text-xs text-white/50 mt-0.5">Port security, IP banning & SSL</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "websites" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Hosted Websites & Virtual Hosts</h3>
                <button
                  type="button"
                  onClick={() => setModalType("website")}
                  className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-400"
                >
                  <Plus className="size-3.5" />
                  Add Virtual Host
                </button>
              </div>

              {websites.length === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-6 text-center">
                  <Globe className="size-9 text-white/20 mb-2" />
                  <p className="text-xs font-medium text-white/70">No websites created yet</p>
                  <p className="text-[11px] text-white/40 mt-1 max-w-sm">
                    Configure your first domain to create document roots and automatic SSL certificates.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {websites.map((site) => (
                    <div
                      key={site.id}
                      className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] p-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="size-5 text-sky-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{site.domain}</span>
                            <span className="rounded bg-white/10 px-1.5 py-0.2 text-[9.5px] font-mono text-emerald-400">
                              SSL Active
                            </span>
                          </div>
                          <div className="text-[11px] text-white/40 mt-0.5">
                            Root: {site.root} • {site.phpVersion}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => saveWebsites(websites.filter((s) => s.id !== site.id))}
                          className="p-1.5 text-white/40 hover:text-red-400"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "email" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Email Accounts (IMAP / SMTP)</h3>
                <button
                  type="button"
                  onClick={() => setModalType("email")}
                  className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-400"
                >
                  <Plus className="size-3.5" />
                  Create Mailbox
                </button>
              </div>

              {emailAccounts.length === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-6 text-center">
                  <Mail className="size-9 text-white/20 mb-2" />
                  <p className="text-xs font-medium text-white/70">No email accounts configured</p>
                  <p className="text-[11px] text-white/40 mt-1 max-w-sm">
                    Create secure custom email mailboxes with automatic DKIM, SPF, and DMARC records.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {emailAccounts.map((mail) => (
                    <div
                      key={mail.id}
                      className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] p-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="size-5 text-emerald-400" />
                        <div>
                          <span className="text-xs font-bold text-white">{mail.address}</span>
                          <div className="text-[11px] text-white/40 mt-0.5">
                            Quota: {mail.used} / {mail.quota}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => saveEmails(emailAccounts.filter((e) => e.id !== mail.id))}
                        className="p-1.5 text-white/40 hover:text-red-400"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "cron" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Cron Job Automation</h3>
                <button
                  type="button"
                  onClick={() => setModalType("cron")}
                  className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-400"
                >
                  <Plus className="size-3.5" />
                  New Cron Job
                </button>
              </div>

              {cronJobs.length === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-6 text-center">
                  <Clock className="size-9 text-white/20 mb-2" />
                  <p className="text-xs font-medium text-white/70">No scheduled tasks</p>
                  <p className="text-[11px] text-white/40 mt-1 max-w-sm">
                    Automate maintenance tasks, backup generation, or database synchronization.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cronJobs.map((cron) => (
                    <div
                      key={cron.id}
                      className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] p-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="size-5 text-purple-400" />
                        <div>
                          <span className="text-xs font-mono font-bold text-white">
                            {cron.schedule}
                          </span>
                          <div className="text-[11px] font-mono text-white/50 mt-0.5">
                            {cron.command}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => saveCron(cronJobs.filter((c) => c.id !== cron.id))}
                        className="p-1.5 text-white/40 hover:text-red-400"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "firewall" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Server Firewall (UFW / Iptables)</h3>
                <button
                  type="button"
                  onClick={() => setModalType("firewall")}
                  className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-400"
                >
                  <Plus className="size-3.5" />
                  Allow Port
                </button>
              </div>

              <div className="space-y-2">
                {firewallRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="size-5 text-emerald-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            Port {rule.port}/{rule.proto}
                          </span>
                          <span className="rounded bg-emerald-500/15 px-1.5 py-0.2 text-[9.5px] font-mono text-emerald-400">
                            {rule.action}
                          </span>
                        </div>
                        <div className="text-[11px] text-white/40 mt-0.5">{rule.desc}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => saveFirewall(firewallRules.filter((r) => r.id !== rule.id))}
                      className="p-1.5 text-white/40 hover:text-red-400"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "backups" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Full System & File Backups</h3>
                <button
                  type="button"
                  onClick={handleTriggerBackup}
                  className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-400"
                >
                  <Zap className="size-3.5" />
                  Generate Snapshot
                </button>
              </div>

              {backups.length === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-6 text-center">
                  <HardDrive className="size-9 text-white/20 mb-2" />
                  <p className="text-xs font-medium text-white/70">No backups generated yet</p>
                  <p className="text-[11px] text-white/40 mt-1 max-w-sm">
                    Create manual or scheduled archive snapshots of your server configurations and databases.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {backups.map((bak) => (
                    <div
                      key={bak.id}
                      className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] p-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <HardDrive className="size-5 text-amber-400" />
                        <div>
                          <span className="text-xs font-bold text-white">{bak.filename}</span>
                          <div className="text-[11px] text-white/40 mt-0.5">
                            {bak.size} • {bak.date}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => saveBackups(backups.filter((b) => b.id !== bak.id))}
                        className="p-1.5 text-white/40 hover:text-red-400"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "system" && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-white">Server Operating System Specs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                  <span className="text-[11px] text-white/40">Operating System</span>
                  <div className="text-sm font-semibold text-white mt-1">Linux x86_64 (Cloud VPS)</div>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                  <span className="text-[11px] text-white/40">Web Server Engine</span>
                  <div className="text-sm font-semibold text-white mt-1">Nginx Reverse Proxy & HTTP/2</div>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                  <span className="text-[11px] text-white/40">Database Engine</span>
                  <div className="text-sm font-semibold text-white mt-1">PostgreSQL 16 & MySQL 8</div>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                  <span className="text-[11px] text-white/40">PHP Versions Installed</span>
                  <div className="text-sm font-semibold text-white mt-1">PHP 8.2, PHP 8.3-FPM</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Creation Modal */}
      {modalType ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#141824] p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-white">
              {modalType === "website" && "Add Virtual Host"}
              {modalType === "email" && "Create Email Mailbox"}
              {modalType === "cron" && "Schedule Cron Job"}
              {modalType === "firewall" && "Add Firewall Port Rule"}
            </h3>

            <form
              onSubmit={(e) => {
                if (modalType === "website") handleCreateWebsite(e);
                else if (modalType === "email") handleCreateEmail(e);
                else if (modalType === "cron") handleCreateCron(e);
                else if (modalType === "firewall") handleCreateFirewall(e);
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="text-xs text-white/70">
                  {modalType === "website" && "Domain Name"}
                  {modalType === "email" && "Username / Mailbox"}
                  {modalType === "cron" && "Cron Schedule Expression"}
                  {modalType === "firewall" && "Port Number"}
                </label>
                <input
                  type="text"
                  placeholder={
                    modalType === "website"
                      ? "example.com"
                      : modalType === "email"
                      ? "support"
                      : modalType === "cron"
                      ? "0 * * * *"
                      : "8080"
                  }
                  value={input1}
                  onChange={(e) => setInput1(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-white/70">
                  {modalType === "website" && "Document Root"}
                  {modalType === "email" && "Domain"}
                  {modalType === "cron" && "Command to Execute"}
                  {modalType === "firewall" && "Protocol"}
                </label>
                <input
                  type="text"
                  placeholder={
                    modalType === "website"
                      ? "/var/www/example.com"
                      : modalType === "email"
                      ? "example.com"
                      : modalType === "cron"
                      ? "/usr/bin/php /var/www/cron.php"
                      : "TCP"
                  }
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-orange-500 focus:outline-none"
                />
              </div>

              {modalType === "website" && (
                <div>
                  <label className="text-xs text-white/70">PHP Version</label>
                  <select
                    value={input3}
                    onChange={(e) => setInput3(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="PHP 8.3">PHP 8.3-FPM</option>
                    <option value="PHP 8.2">PHP 8.2-FPM</option>
                    <option value="Node.js 22">Node.js 22 LTS</option>
                    <option value="Python 3.12">Python 3.12 WSGI</option>
                  </select>
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/60 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-400"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
