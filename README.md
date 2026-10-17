# ServerUI

ServerUI is a modern, open-source control panel for managing your servers from a browser
or the native desktop app.

It presents a Linux-inspired desktop UI. You add SSH servers, connect as many as
you like at once, and use Files, Terminal, and System Monitor across all of them
from one desktop. Nothing is installed on your servers: the UI never opens SSH, and
a Go backend stores encrypted credentials and dials each host over plain SSH.

![ServerUI desktop: Files on web-01 with the server menu showing four connected servers](docs/images/desktop.jpg)

<table>
  <tr>
    <td width="50%"><img src="docs/images/system-monitor.jpg" alt="System Monitor showing live metrics for four servers"><br><sub><b>System Monitor</b>: every connected server, live.</sub></td>
    <td width="50%"><img src="docs/images/copy-between-servers.jpg" alt="Files after copying a folder from web-01 to backup-01"><br><sub><b>Copy between servers</b>: drag a folder onto another server in the sidebar.</sub></td>
  </tr>
  <tr>
    <td colspan="2"><img src="docs/images/terminal-tabs.jpg" alt="Terminal opened in the copied folder on backup-01, with a second tab on web-01"><br><sub><b>Terminal</b>: open it from any folder, with a tab per server.</sub></td>
  </tr>
</table>

## 🚀 1-Click Quick Setup (Linux / VPS / macOS)

Run the automated installer on any fresh Ubuntu, Debian, CentOS, Fedora, Arch, or macOS system:

```bash
curl -fsSL https://raw.githubusercontent.com/shahilali5/serverui/main/install.sh | bash
```

Or from a local clone:

```bash
./install.sh
```

The script automatically detects your OS, installs Docker and essential tools if missing, generates secure AES-256-GCM credentials encryption keys, starts the web interface on `http://localhost:3000` (or `http://your-server-ip:3000`), and outputs full management commands.

---

## Download (Desktop Apps)

**Latest release: [ServerUI 0.3.0](https://github.com/rakhechashubham/serverui/releases/tag/v0.3.0).**
No need to build from source.

| Platform | Installer |
| -------- | --------- |
| macOS (Apple Silicon) | [ServerUI-0.3.0-arm64.dmg](https://github.com/rakhechashubham/serverui/releases/download/v0.3.0/ServerUI-0.3.0-arm64.dmg) |
| macOS (Intel) | [ServerUI-0.3.0-x64.dmg](https://github.com/rakhechashubham/serverui/releases/download/v0.3.0/ServerUI-0.3.0-x64.dmg) |
| Windows x64 | [ServerUI-0.3.0-x64-setup.exe](https://github.com/rakhechashubham/serverui/releases/download/v0.3.0/ServerUI-0.3.0-x64-setup.exe) or [.msi](https://github.com/rakhechashubham/serverui/releases/download/v0.3.0/ServerUI-0.3.0-x64.msi) |
| Linux x64 | [AppImage](https://github.com/rakhechashubham/serverui/releases/download/v0.3.0/ServerUI-0.3.0-x86_64.AppImage) or [.deb](https://github.com/rakhechashubham/serverui/releases/download/v0.3.0/ServerUI-0.3.0-amd64.deb) |

Verify downloads with the release's
[SHA256SUMS](https://github.com/rakhechashubham/serverui/releases/download/v0.3.0/SHA256SUMS)
(`shasum -a 256 -c SHA256SUMS --ignore-missing`). The macOS builds are not
notarized yet, so on first launch right-click the app and choose **Open**.
See [docs/releases.md](docs/releases.md).

### What's new in 0.3.0

- **Every server on one desktop:** keep several servers connected at once, with
  their status in the top bar.
- **System Monitor for the whole fleet:** live CPU, memory, disk, and network for
  every connected server, plus a comparison table. The process list now shows
  the busiest processes first.
- **Copy between servers:** drag a folder from one server onto another in Files.
- **Terminal tabs:** one tab per server, and Open Terminal from any folder.
- A plain text editor for remote files, desktop folder shortcuts, the Aura theme,
  and Microsoft Store packaging.

Full notes: [v0.3.0 release](https://github.com/rakhechashubham/serverui/releases/tag/v0.3.0).

## Features

Working in this repository:

- **All your servers on one desktop:** connect several servers at once; the top bar
  shows each one's status, and every app works across them
- Server manager: add, edit, delete, connect, disconnect, and test a connection
  before saving, with an icon per server
- SSH password authentication
- SSH private-key authentication (unencrypted OpenSSH / PEM keys)
- **System Monitor:** a fleet overview of every connected server (CPU, memory,
  disk, network, and a sortable comparison table), plus per-server CPU, memory,
  disk, network, processes, and systemd services
- Process inspection and SIGTERM; start, stop, and restart systemd services
- **Terminal:** High-performance browser terminal over WebSocket → SSH PTY with zero-crash bounds checking (eliminates xterm 0x0 resize exceptions), debounced resize observer, live status glow dots, clean normal closure handling, and multi-server tabs; open it straight from any folder in Files or the dock.
- **Code Editor (powered by [px0](https://github.com/px0-ai/px0)):** Full in-browser remote code editor and inspector inspired by the speed-first, zero-latency px0 IDE architecture. Includes multi-tab buffer management, quick remote file palette (`Cmd+O`), direct remote save (`Cmd+S`), syntax detection across 15+ languages, line numbers gutter with synced scrolling, find & replace (`Cmd+F`), word-wrap, and indent formatting.
- **Files (SFTP):** a Finder-style file manager with multi-select, drag to move,
  copy/cut/paste, upload, a download queue, compress, and archive extraction
  (`.zip`, `.tar`, `.tar.gz`/`.tgz`, `.tar.bz2`, `.tar.xz`, `.7z`, run on the
  server with its own `tar` / `unzip` / `7z`)
- **Copy between servers:** drag files or folders onto another connected server
  in the Files sidebar, or copy on one server and paste on another
- **Docker & Container Manager:** Live container lifecycle management (Start, Stop, Restart, Remove), container state monitoring, CPU/RAM stats, port mappings, and 1-click terminal shell exec.
- **Domains & SSL Reverse Proxy:** Configure domain routing, reverse proxy ports (`127.0.0.1:3000`), and manage SSL certificates with auto-renewal status.
- **Databases & Storage:** Centralized database dashboard for PostgreSQL, MySQL, Redis, and SQLite with database provisioning, connection counts, and size metrics.
- **Clean Desktop UI & 10 Built-In Free Wallpapers:** Ultra-clean macOS and Aura desktops with a clutter-free glass status widget, 10 free built-in offline vector themes (Crescent Cosmos, Valley Twilight, Neon Orbit, Nordic Aurora, Monterey Wave, Cyber Horizon, Matte Obsidian, Sakura Twilight, Golden Sahara, Nebula Stellar), custom image upload, custom image URL, and real-time blur/brightness adjustments.
- **Auto-Update System:** Continuous background update checker that automatically detects new releases or updates pushed to GitHub, alerts users with an elegant floating desktop toast, and enables instant 1-click update & reload.
- **Admin Authentication & Lock Screen:** Built-in security gateway. On first launch, prompts you to create an Admin Username and Password. On subsequent visits, securely locks the desktop and requires authentication before any server operations or credentials can be accessed. Includes quick Lock button in the top menu bar.
- AES-256-GCM encryption for stored credentials

Not implemented yet (UI may show Coming Soon):

- Application, domain, and database management
- ServerUI CLI
- ServerUI agent

Settings (About, runtime, shortcuts; desktop updates) is available.

See [Current limitations](#current-limitations).

## Architecture

```
Browser / UI
   │
   ▼
Next.js Web
   │  HTTP / WebSocket
   ▼
Go API Server
   ├── PostgreSQL (web)  or  SQLite (desktop)
   └── SSH
        │
        ▼
     Target server
```

The UI resolves the Go API through a small runtime helper so the same client can
talk to a remote backend (web) or a local backend (desktop).
Docker is a deployment option for web/self-hosted installs; the Go server also
runs from source against PostgreSQL. Packaged desktop uses local SQLite and does
not require Docker or PostgreSQL.

Details: [docs/architecture.md](docs/architecture.md) (includes **Runtime
Architecture** for Web / Desktop / Source). Desktop hardening:
[docs/desktop-security.md](docs/desktop-security.md),
[docs/desktop-storage.md](docs/desktop-storage.md). Releases and installers:
[docs/releases.md](docs/releases.md). Product audit / manual QA:
[docs/product-audit.md](docs/product-audit.md),
[docs/manual-qa.md](docs/manual-qa.md).

## How it works

The UI sends a `serverId`. The Go process loads the stored host, decrypts credentials,
and uses a per-server SSH pool. Files, terminal, and metrics are scoped to that ID.

The browser never opens an SSH connection. The Go process stores server records
in PostgreSQL (web) or local SQLite (desktop). Secrets are encrypted at rest with
AES-256-GCM. A WebSocket terminal is a PTY on the selected host. File browsing
uses SFTP on that same pooled connection.

## Project structure

```
serverui/
├── apps/
│   ├── web/                 Next.js UI (shared by web + desktop)
│   ├── server/              Go API, SSH, PostgreSQL
│   └── desktop/             Tauri desktop shell
├── deploy/
│   └── docker/              Compose files
├── docs/
│   ├── architecture.md
│   ├── desktop.md
│   ├── product-audit.md
│   ├── manual-qa.md
│   ├── releases.md
│   └── images/
├── scripts/
│   └── pre-commit
├── .githooks/
│   └── pre-commit
├── .github/
│   ├── workflows/ci.yml
│   ├── workflows/desktop.yml
│   ├── workflows/desktop-release.yml
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── Makefile
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md
├── LICENSE
└── .env.example
```

## Requirements

Verified against this repository:

| Tool    | Version used in development |
| ------- | --------------------------- |
| Git     | any recent                  |
| Docker  | 28.x (Compose v2)           |
| Node.js | 22.x                        |
| npm     | 10.x                        |
| Go      | 1.26                        |
| Rust    | stable (MSRV 1.77+) for desktop |
| Make    | GNU Make                    |
| OpenSSL | for generating the encryption key |
| lazydocker | required for `make dev` |

Docker Desktop (or equivalent) must be running for `make start` and `make dev`.

lazydocker is required for `make dev`. It is not required for `make start`.
Install it from [lazydocker](https://github.com/jesseduffield/lazydocker).

## Getting started

```bash
git clone https://github.com/rakhechashubham/serverui.git
cd serverui
cp .env.example .env
make setup-env
make hooks
make start
```

`make setup-env` copies `.env.example` when `.env` is missing and generates
`SERVERUI_CREDENTIAL_ENCRYPTION_KEY` if the value is empty.

`make hooks` is optional. It points Git at `.githooks` so local commits run
format, lint, and tests. Hooks can be bypassed; CI is the real gate.

Then open [http://localhost:3000](http://localhost:3000). The API listens on
[http://localhost:8080](http://localhost:8080).

Add a server in the UI (name, host, SSH port, username, password or private key).
ServerUI tests SSH from the Go container, stores the encrypted secret, and connects
when you choose **Connect**.

## Environment configuration

Canonical file: `.env.example` (copy to `.env`). Compose also accepts
`deploy/docker/.env`.

| Category | Variable | Purpose |
| -------- | -------- | ------- |
| Runtime | `HTTP_PORT` | Host port for the Go API |
| Runtime | `WEB_PORT` | Host port for the web UI |
| Database | `POSTGRES_USER` | PostgreSQL user |
| Database | `POSTGRES_PASSWORD` | PostgreSQL password (local only) |
| Database | `POSTGRES_DB` | Database name |
| Database | `POSTGRES_HOST` | Optional; defaults to `127.0.0.1` natively; Compose sets `postgres` |
| Database | `DATABASE_URL` | Optional DSN; `POSTGRES_*` is enough in Compose |
| Credentials | `SERVERUI_CREDENTIAL_ENCRYPTION_KEY` | 32-byte key as 64 hex chars (backend only) |
| API (optional) | `NEXT_PUBLIC_API_BASE` | Browser-facing Go API origin when not same-origin |
| Deployment | `SERVER_INTERNAL_URL` | Next.js server-side rewrite target (Compose sets this) |

Generate a key:

```bash
openssl rand -hex 32
```

Never commit `.env`, passwords, or private keys. Example hosts in docs use
`203.0.113.10` and user `deploy`. Do not put the encryption key or SSH secrets
in frontend env vars.

## Development

```bash
make dev
```

This starts the development Docker environment (bind-mounted source, `next dev`,
`go run`) and opens LazyDocker automatically.

When you exit LazyDocker — or press Ctrl+C — ServerUI's development containers
are removed. The PostgreSQL volume is preserved, so the local database is reused
the next time you run `make dev`.

`make docker-tui` only opens LazyDocker for already-running services. It does not
start or stop the stack.

### Desktop application

**Install (recommended for users):** download a release artifact from
[GitHub Releases](https://github.com/rakhechashubham/serverui/releases), verify
SHA-256 checksums, install, and launch. No PostgreSQL, Docker, Node, Go, or Rust
is required for packaged desktop — local SQLite is created automatically. Details:
[docs/releases.md](docs/releases.md), [docs/desktop.md](docs/desktop.md),
[docs/desktop-storage.md](docs/desktop-storage.md).

**Develop from source:** requires Rust/cargo in addition to the web prerequisites.
Default desktop-dev uses local SQLite (no Postgres required):

```bash
make setup-env
make desktop-dev
```

Optional Postgres desktop testing: `make desktop-db` then
`SERVERUI_STORAGE=postgres make desktop-dev`.

Tauri loads the Next.js UI and starts `bin/serverui-server` on
`127.0.0.1:<dynamic-port>` with a per-launch local auth token. See
[docs/desktop.md](docs/desktop.md) and [apps/desktop/README.md](apps/desktop/README.md).

```bash
make desktop-build
make desktop-build-macos          # arm64 + x64 → dist/macos/
make desktop-build-windows-x64    # Windows host only
make desktop-build-linux-x64      # Linux host only
make desktop-build-all            # CI release instructions (no fake cross-build)
```

Builds a Tauri bundle (platform installers depending on host) with a static UI
export and sidecared Go binary. Signing and updater signatures require CI
secrets; local builds are unsigned by default. Full production matrix:
[docs/releases.md](docs/releases.md).

## Local production start

```bash
make start
```

This builds production images and starts web, API, and Postgres in detached mode.
The command returns immediately. Services keep running after the terminal is free.

```bash
make docker-ps
make docker-logs
make docker-down
```

`make docker-up` starts the development Compose stack in the background without
LazyDocker.

Native checks (after `npm install` in `apps/web`):

```bash
make test
make lint
make format
make format-check
make build
```

Go sources live in `apps/server`. The web app lives in `apps/web`.

## Testing

```bash
make test
```

Runs Vitest in `apps/web` and `go test ./...` in `apps/server`.

## Linting

```bash
make lint
```

ESLint for the web app, `go vet` for the backend.

## Formatting

```bash
make format         # gofmt + Prettier
make format-check   # fail if anything would change
```

## Building

```bash
make build
```

Produces a Next.js production build in `apps/web/.next` and
`bin/serverui-server`. Binaries and `.next` are gitignored.

```bash
make docker-build
```

Builds production Compose images without starting them. `make start` builds and
starts those images. Development images are built by `make dev` / `make docker-up`.

## Security

Credentials are encrypted at rest. GET APIs do not return secrets. See
[SECURITY.md](SECURITY.md).

Report vulnerabilities privately to [contact@skyrekon.com](mailto:contact@skyrekon.com).
Do not attach keys or passwords to issues.

## Contributing

ServerUI is open source under the Apache License 2.0.

- [CONTRIBUTING.md](CONTRIBUTING.md) — setup, branch names, commits, PRs
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- Issues: bug and feature templates under `.github/ISSUE_TEMPLATE/`
- CI: `.github/workflows/ci.yml` runs format, lint, tests, build, and a Docker image build

Local Git hooks (`make hooks`) block commits when format, lint, or tests fail. Hooks
are optional local safeguards; CI is the gate.

There is a tag-driven desktop release workflow (`.github/workflows/desktop-release.yml`).
See [docs/releases.md](docs/releases.md).

## Roadmap

Planned, not available:

- Code signing / notarization for all desktop channels (secrets-dependent)
- Broader installer runtime verification matrix
- ServerUI CLI
- Optional host agent
- In-browser editor
- Application, domain, and database management

Delivered / in tree:

- OS keychain credential storage for desktop
- Local SQLite for packaged/default desktop (Postgres remains for web)
- Desktop packaging matrix (macOS arm64+x64, Windows x64, Linux x64) + release CI
- Settings (About, runtime, desktop updates UI)
- Multi-server desktop, fleet System Monitor, cross-server copy, and terminal tabs (0.3.0)

## FAQ

**Does the browser SSH to my VPS?**  
No. The Go server does.

**Can I add many servers?**  
Yes, and you can keep them all connected at once. Each has its own stored config,
encrypted secret, and SSH connection.

**Do files copied between servers go directly host to host?**  
No. The ServerUI backend reads from one server over SFTP and writes to the other,
so the data passes through the machine running the backend (your computer for the
desktop app).

**Are Applications / Domains / Databases real?**  
Not yet. Those windows are Coming Soon placeholders.

**Is there a CLI or agent?**  
No. Makefile targets for them were removed because the code is not in this repository.

## Current limitations

- Not a production-hardened multi-tenant SaaS. Treat it as a self-hosted control panel.
- Passphrase-protected private keys are rejected with an explicit error.
- Host key verification accepts any remote host key (TOFU / pinning is not implemented).
- There is no user login, SSO, or RBAC for the ServerUI app itself.
- Applications, Domains, and Databases are not implemented yet. The editor is powered by px0 for fast remote code inspection and editing.
- Process and service actions (kill, start/stop/restart) work in a server's own
  System Monitor (Servers → View Metrics). In the all-servers monitor opened from
  the dock they don't act yet.
- A drop onto another server in the Files sidebar copies into that server's home
  folder and never overwrites an existing item.
- CLI and agent are not implemented.
- Archive extraction needs `tar` (plus `gzip` / `bzip2` / `xz`), Info-ZIP `unzip`, or
  `7z` on the server. Password-protected archives, `.rar`, and single compressed
  files such as `.gz` are not supported.
- Desktop app: Tauri shell with release installers; code signing / notarization
  depend on CI secrets and are not claimed complete until configured and verified.
- Official GitHub Release tags publish when maintainers cut `vX.Y.Z`.

## Contributors & Core Team

ServerUI is built and maintained by passionate open-source contributors:

| Avatar | Contributor | Role | Core Focus Areas | Profile |
| :---: | :--- | :--- | :--- | :---: |
| <img src="https://github.com/rakhechashubham.png" width="48" height="48" style="border-radius:50%" alt="Shubham Rakhecha" /> | **Shubham Rakhecha** | Founder & Lead Architect | Creator of ServerUI, SSH connection pool, System Monitor, desktop runtime | [@rakhechashubham](https://github.com/rakhechashubham) |
| <img src="https://github.com/shahilali5.png" width="48" height="48" style="border-radius:50%" alt="Shahil" /> | **Shahil** | Core Contributor | Terminal crash resilience & lifecycle stability, px0 code editor integration, UI/UX polish | [@shahilali5](https://github.com/shahilali5) |

We love contributions! Check out our [Contributing Guide](CONTRIBUTING.md) to join the team and make ServerUI even better.

## Contact

[contact@skyrekon.com](mailto:contact@skyrekon.com)

Use this address for security reports, contributor questions, and any other contact.

## License

Apache License 2.0. Copyright 2026 Skyrekon Private Limited. See [LICENSE](LICENSE).
