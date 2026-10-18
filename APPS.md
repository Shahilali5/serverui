# 🚀 ServerUI Applications & Suite Documentation (`APPS.md`)

ServerUI provides an all-in-one, Linux-desktop-styled browser environment to manage your entire server fleet from a single screen. Below is the complete specification, functionality breakdown, and architectural documentation for every built-in application in ServerUI.

---

## 📑 Application Index

| App Name | App ID | Category | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **cPanel Suite** | `cpanel` | Administration & Hosting | 1-Click App Store, VHosts, Nginx Proxy, Mail, Cron, Fail2ban, Backups |
| **Servers** | `servers` | Infrastructure | Add/edit SSH servers, test connection, credentials vault, multi-server connect |
| **System Monitor** | `dashboard` | Metrics & Health | Fleet-wide CPU, RAM, Disk, Network, Process inspector & Systemd manager |
| **Files** | `files` | Storage & SFTP | Finder-style file manager, cross-server drag & drop, remote extraction (`tar`/`zip`/`7z`) |
| **Terminal** | `terminal` | Shell Access | Multi-server tabs, WebSocket-to-PTY, zero-crash resize protection, live glow dots |
| **Code Editor (px0 & VS Code)** | `editor` | Development & IDE | Full-featured dual engine: px0 ultra-fast editor + Native Dark VS Code IDE |
| **Docker & Containers** | `applications` | Containerization | Docker container lifecycle, image pull/prune, logs inspection, restart policies |
| **Domains & Reverse Proxy** | `domains` | Networking & SSL | Domain mapping, automated Nginx config generator, 1-click Let's Encrypt SSL |
| **Databases** | `databases` | Storage Engines | PostgreSQL, MySQL, Redis, SQLite lifecycle, backup dump & Adminer GUI |
| **Settings** | `settings` | System Preferences | Session rules, theme switching (Dark/Light/Aura), security preferences |
| **About & Server Info** | `about` | System Info & Team | Version release details, technology attributions, and contributor profiles |
| **Viewer** | `viewer` | Media & Logs | Image, PDF, and remote log inspector |

---

## 1. 🎛️ cPanel Suite (`cpanel`)

An integrated, enterprise-grade control panel hub providing complete server administration without installing bloated proprietary agents:

* **1-Click Application Stacks:** Instant one-click deployment for:
  * WordPress (+ MySQL)
  * Ghost CMS
  * n8n Automation Engine
  * Adminer Database GUI
  * Nextcloud Cloud Hub
  * Plausible Privacy-First Analytics
* **Hosted Websites & Virtual Hosts:** Create Apache/Nginx vhosts, configure document roots, select runtime execution environments (PHP 8.2, PHP 8.3-FPM, Node.js 22, Python 3.12, Static HTML), and issue SSL certs.
* **Nginx Reverse-Proxy Generator:** Instant production config generator for `/etc/nginx/sites-available/` with SSL, HTTP/2, WebSocket upgrades, and gzip headers.
* **Database Management & Web Adminer:** Full lifecycle management for PostgreSQL, MySQL, Redis, and SQLite with database provisioning, user creation, and inspection.
* **Email Accounts & Mailboxes:** Provision custom-domain email inboxes with storage quota controls and IMAP/SMTP configurations.
* **Cron Job Automation:** Visual scheduler supporting minute/hour/daily presets or custom cron syntax with execution logs.
* **Firewall Shield & Fail2ban:** Control UFW rules (allow/deny ports) and configure Fail2ban brute-force protection for SSH and web ports.
* **Real-time Webhook Health Alerts:** Discord and Telegram notification alerts triggered on high CPU, RAM, disk pressure, or service failures.
* **Backups & S3 Remote Cloud Sync:** Schedule automated server archive backups with local storage or direct push to AWS S3 / Cloudflare R2 / MinIO object storage.
* **OS & System Diagnostics:** Real-time kernel info, system uptime, swap usage, and disk I/O metrics.

---

## 2. 🖥️ Servers Manager (`servers`)

* Multi-host management: add, edit, test, connect, and disconnect remote servers.
* Dual authentication modes: Secure SSH password or encrypted OpenSSH / PEM private keys.
* Client-side AES-256-GCM encrypted credential vault stored securely in the Go backend.
* Quick-connect status indicators in the desktop top-bar showing real-time ping and host state.

---

## 3. 📊 System Monitor (`dashboard`)

* **Fleet Overview:** Simultaneous live monitoring of CPU, RAM, Disk, and Network across all connected hosts.
* **Fleet Comparison Table:** Sort servers by heaviest CPU, memory, or network load to quickly diagnose bottlenecks.
* **Process Manager:** Real-time process explorer with top CPU/memory sorting, process details, and instant `SIGTERM` / `SIGKILL` signals.
* **Systemd Services Manager:** View all active and inactive system units; start, stop, restart, or inspect status logs in one click.

---

## 4. 📁 Files Manager (`files`)

* SFTP file manager with Finder/Explorer-like user experience.
* **Cross-Server Drag & Drop:** Drag files or entire folders between two different servers directly in the UI.
* Multi-select, copy, cut, paste, rename, duplicate, delete, and recursive permissions (`chmod`).
* Upload and background download queue with progress tracking.
* Server-side archive compression and extraction (`.zip`, `.tar`, `.tar.gz`/`.tgz`, `.tar.bz2`, `.tar.xz`, `.7z`) using the server's native utilities.

---

## 5. 💻 Terminal (`terminal`)

* High-performance browser terminal over WebSocket → SSH PTY powered by `@xterm/xterm`.
* **Zero-Crash Lifecycle:** Built-in geometric bounds checking and debounced `ResizeObserver` eliminating `0x0` dimension exceptions.
* Multi-server tabs: Open independent terminal sessions to different servers within a single window.
* Contextual launching: "Open Terminal here" from any directory inside the Files manager.

---

## 6. 📝 Code Editor & Native VS Code (`editor`)

Dual-mode remote development environment:
* **px0 Engine:** Zero-latency code editor inspired by the px0 architecture with multi-tab buffer management, quick file finder (`Cmd+O`), direct remote save (`Cmd+S`), regex find & replace (`Cmd+F`), line numbers gutter, and syntax detection for 15+ languages.
* **Native Dark VS Code IDE:** Embedded VS Code-styled dark environment with project explorer tree, activity bar, buffer tabs, line/column tracking, and one-click launch for VS Code Web.

---

## 7. 🐳 Docker & Applications (`applications`)

* Container lifecycle controls: Start, Stop, Restart, Pause, and Remove containers.
* Live container resource metrics (CPU, Memory limit/usage, Network I/O).
* Container logs streaming and interactive container console execution.
* Docker Image manager: pull images, inspect image layers, and prune dangling images.

---

## 8. 🌐 Domains & Reverse Proxy (`domains`)

* Visual domain mapping: point custom domains to internal ports or local services.
* **Automated Nginx VHost Generator:** Creates ready-to-use reverse proxy configs with WebSocket upgrade headers, real IP forwarding, and SSL hooks.
* **Automated Certbot SSL Integration:** 1-click Let's Encrypt SSL certificate issuance and automatic renewal setup.

---

## 9. 🗄️ Databases (`databases`)

* Manage local and remote database engines: PostgreSQL, MySQL, Redis, and SQLite.
* Create and drop databases, manage users, and grant privileges.
* Fast export/dump and import of `.sql` database snapshots.
* Direct launch to Adminer Web GUI for visual SQL querying.

---

## 10. ⚙️ Settings & Security (`settings`)

* **24-Hour Auto-Invalidation:** Strict 24-hour session security rules protecting against stale authorization.
* **Zero Data Loss Guarantee:** Persistent admin configurations, database mounts, and automated `.env` backup guards during upgrades.
* Theme engine: Switch between Modern Dark, Classic Light, and Aura themes.

---

## 11. ℹ️ About & Contributor Info (`about`)

* Version information and release history.
* Technology attributions for open-source libraries.
* **Core Contributors & Co-Developers:**
  * **Shahil (`@shahilali5`)**: Lead Contributor & Co-Developer (Full-Stack Architect · Core Security & Terminal Engineering).
  * Direct links to GitHub profile [github.com/shahilali5](https://github.com/shahilali5) and commit history.

---

## 12. 👁️ Viewer (`viewer`)

* Universal file previewer for images (`.png`, `.jpg`, `.svg`, `.webp`), PDFs, markdown, and raw logs without launching an editor.

---

*(c) ServerUI Team. Open source under the MIT License.*
