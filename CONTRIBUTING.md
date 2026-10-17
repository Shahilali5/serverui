# Contributing to ServerUI

Thank you for your interest in contributing to ServerUI! Whether you're fixing bugs, adding new capabilities, writing documentation, or enhancing performance, we appreciate your help in building a modern open-source server control panel.

---

## Hall of Fame: Core Contributors

| Contributor | Role | Focus Areas | Profile |
| :---: | :--- | :--- | :---: |
| <img src="https://github.com/rakhechashubham.png" width="44" height="44" style="border-radius:50%" alt="Shubham Rakhecha" /> | **Shubham Rakhecha** | Founder & Lead Architect | Creator of ServerUI, SSH connection pooling, System Monitor, core architecture | [@rakhechashubham](https://github.com/rakhechashubham) |
| <img src="https://github.com/shahilali5.png" width="44" height="44" style="border-radius:50%" alt="Shahil" /> | **Shahil** | Core Contributor | Terminal crash resilience & lifecycle stability, px0 code editor integration, UI/UX polish | [@shahilali5](https://github.com/shahilali5) |

*All contributors are recognized in the repository and directly inside the ServerUI Info / About app.*

---

## Before You Start

- Read the [README](README.md) for overall architecture, feature set, and roadmap.
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md).
- **Security Vulnerabilities:** Report security vulnerabilities privately to [contact@skyrekon.com](mailto:contact@skyrekon.com). See [SECURITY.md](SECURITY.md). Never post public issues containing passwords, private keys, or credentials.
- **Scope note:** CLI and background agent daemons are currently out of scope. Please open an issue to discuss major architectural shifts before starting work.

---

## Step-by-Step Contribution Workflow

### 1. Fork the Repository
1. Visit [github.com/rakhechashubham/serverui](https://github.com/rakhechashubham/serverui) and click **Fork** (top right).
2. Clone your personal fork to your machine:
   ```bash
   git clone https://github.com/<your-username>/serverui.git
   cd serverui
   ```

### 2. Configure Git Identity
Ensure your commits reflect your GitHub profile:
```bash
git config user.name "Your Name"
git config user.email "your-github-email@users.noreply.github.com"
```

### 3. Set Up Upstream Remote
Keep your fork in sync with the upstream repository:
```bash
git remote add upstream https://github.com/rakhechashubham/serverui.git
git fetch upstream
```

### 4. Create a Feature Branch
Always branch off the latest `main`:
```bash
git checkout main
git pull upstream main
git checkout -b feature/my-enhancement
```

Recommended branch naming conventions:
- `feature/<name>` — New capabilities or UI improvements
- `fix/<name>` — Bug fixes or stability patches
- `docs/<name>` — Documentation additions or edits
- `refactor/<name>` — Code simplification or restructuring
- `test/<name>` — Test suite additions

---

## Development Setup

### Prerequisites
- **Node.js**: v20 or v22+ (`node -v`)
- **npm**: v10+ (`npm -v`)
- **Go**: v1.23+ (`go version`)
- **Docker & Docker Compose**: Optional for web/PostgreSQL stack
- **OpenSSL**: For credential key generation

### Quickstart (Local Development)

1. **Environment Setup:**
   ```bash
   cp .env.example .env
   # Or run:
   make setup-env
   ```

2. **Web Frontend (`apps/web`):**
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Go Backend (`apps/server`):**
   ```bash
   cd apps/server
   go run ./cmd/server
   ```

4. **Full Stack with Docker Compose:**
   ```bash
   make dev
   # Or:
   docker compose -f deploy/docker/docker-compose.yml up --build
   ```

---

## Repository Structure

```text
serverui/
├── apps/
│   ├── web/             Next.js 16 UI (React 19, Tailwind v4, xterm.js, px0 editor)
│   ├── server/          Go API server, SSH connection pool, SFTP, crypto
│   └── desktop/         Tauri v2 desktop shell (macOS, Windows, Linux)
├── deploy/
│   └── docker/          Docker Compose orchestration files
├── docs/                Architecture, security, release guides, and manual QA
└── scripts/             Development and pre-commit automation hooks
```

---

## Code Quality & Testing

Before submitting your pull request, ensure tests pass and code is formatted cleanly:

### Frontend (`apps/web`):
```bash
cd apps/web
npm test          # Run Vitest test suite
npm run lint      # Check ESLint rules
npm run format    # Format with Prettier
```

### Backend (`apps/server`):
```bash
cd apps/server
go test ./...     # Run Go unit and integration tests
gofmt -s -w .     # Format Go codebase
```

### Monorepo Validation:
```bash
make format-check
make lint
make test
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: add px0 code editor multi-tab workspace
fix: prevent terminal 0x0 crash during tab switching
docs: update setup instructions in README
refactor: streamline SSH session pool cleanup
test: add test suite for EditorApp component
```

Guidelines:
- Keep the subject line under 72 characters.
- Use imperative present tense ("add", "fix", "update").
- Never include credentials, tokens, or private keys in commit messages or diffs.

---

## Submitting a Pull Request

1. Push your branch to your GitHub fork:
   ```bash
   git push -u origin feature/my-enhancement
   ```
2. Go to your fork on GitHub and click **Compare & pull request**.
3. Fill out the PR template describing:
   - What changed
   - Why the change is needed
   - How it was tested (unit test or manual QA)
4. Maintainers will review your PR, provide constructive feedback, and merge once checks pass!

Thank you for contributing to make ServerUI the best open-source server control panel!
