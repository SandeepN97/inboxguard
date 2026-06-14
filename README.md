# InboxGuard

A single-user Gmail inbox cleanup tool built as a **portfolio project** to demonstrate production-grade engineering practices: hexagonal architecture, a full DevSecOps CI/CD pipeline, semantic AI tooling, and thorough documentation discipline.

> The domain is intentionally simple. The engineering process is the point.

---

## Stack

| Layer        | Technology                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------- |
| **Backend**  | Java 21 · Spring Boot 3.3 · Hexagonal Architecture · Spring Security · Spring Retry · Flyway |
| **Frontend** | React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Motion · GSAP                      |
| **State**    | TanStack Query v5 (server) · Zustand v4 (UI)                                                 |
| **Database** | H2 (dev/test) · PostgreSQL 16 (prod)                                                         |
| **Auth**     | Google OAuth2 installed-app flow · AES-256-GCM encrypted refresh token                       |

---

## Architecture

InboxGuard uses **Hexagonal Architecture (Ports & Adapters)** on the backend. The dependency rule is enforced by ArchUnit tests on every CI run — no Spring/JPA types in the domain, no Google API types outside `infrastructure/gmail/`.

```
web/  →  application/port/in/   (REST controllers call use-case interfaces)
infra →  application/port/out/  (adapters implement outbound ports)
app/  →  domain/                (use cases use pure Java domain models)
domain → nothing                (no framework imports)
```

Full C4 diagrams live in [`docs/architecture/`](docs/architecture/):

| Format         | File                                               | How to view                                                                                            |
| -------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Mermaid        | [`system.md`](docs/architecture/system.md)         | Renders natively in GitHub                                                                             |
| D2             | [`system.d2`](docs/architecture/system.d2)         | `d2 docs/architecture/system.d2 out.svg`                                                               |
| Structurizr C4 | [`workspace.dsl`](docs/architecture/workspace.dsl) | `docker run -it --rm -p 8081:8080 -v $(pwd)/docs/architecture:/usr/local/structurizr structurizr/lite` |

Every significant architectural decision is recorded as an ADR in [`docs/adr/`](docs/adr/).

| ADR                                                      | Decision                                   |
| -------------------------------------------------------- | ------------------------------------------ |
| [ADR-001](docs/adr/ADR-001-tech-stack.md)                | Spring Boot + React                        |
| [ADR-002](docs/adr/ADR-002-architecture-pattern.md)      | Hexagonal Architecture                     |
| [ADR-003](docs/adr/ADR-003-gmail-integration.md)         | OAuth2 flow, token storage, retry strategy |
| [ADR-004](docs/adr/ADR-004-database.md)                  | H2 (dev) + PostgreSQL (prod) + Flyway      |
| [ADR-005](docs/adr/ADR-005-frontend-state-management.md) | TanStack Query + Zustand                   |

---

## Security toolchain

| Tool                                                | Slot                     | When it runs                                  |
| --------------------------------------------------- | ------------------------ | --------------------------------------------- |
| [Gitleaks](https://github.com/gitleaks/gitleaks)    | Secret scanning          | Pre-commit (Husky) + every push               |
| [Trivy](https://github.com/aquasecurity/trivy)      | Vulns · secrets · IaC    | Every push → GitHub Security tab              |
| [CodeQL](https://github.com/github/codeql)          | Semantic SAST            | Every push + weekly                           |
| [Semgrep](https://github.com/semgrep/semgrep)       | Fast SAST + custom rules | Every push → inline PR comments via Reviewdog |
| [OWASP ZAP](https://github.com/zaproxy/zaproxy)     | DAST (runtime)           | Push to main + weekly                         |
| [Danger JS](https://github.com/danger/danger-js)    | PR policy enforcement    | Every PR                                      |
| [Reviewdog](https://github.com/reviewdog/reviewdog) | Inline PR comments       | Every PR (ESLint + Semgrep output)            |

Enforcement is layered — Husky catches issues before commit; CI blocks merge if checks fail; branch protection prevents bypassing CI; Danger JS enforces documentation policy.

Spring Security sets `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` on every API response. [Helmet.js](https://github.com/helmetjs/helmet) does the same for the production SPA server (`frontend/server.cjs`).

---

## AI toolchain

| Tool                                            | Purpose                                            | How to use                                                                      |
| ----------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------- |
| [repomix](https://github.com/yamadashy/repomix) | Pack full codebase into one AI-readable file       | `npm run pack` → `.repomix/inboxguard-context.md` · `npm run pack:clip` to copy |
| [aider](https://github.com/Aider-AI/aider)      | AI pair programming in terminal with live repo map | `aider` (needs `ANTHROPIC_API_KEY`)                                             |
| [Serena](https://github.com/oraios/serena)      | Semantic LSP-backed code intelligence as MCP tools | Auto-starts in Claude Code via `.claude/settings.json`                          |

---

## Prerequisites

| Tool       | Version | Purpose                                              |
| ---------- | ------- | ---------------------------------------------------- |
| Java       | 21+     | Backend                                              |
| Maven      | 3.9+    | Backend build                                        |
| Node.js    | 20+     | Frontend + root tooling                              |
| PostgreSQL | 16+     | Production database                                  |
| Docker     | any     | Structurizr Lite diagrams, ZAP scans                 |
| Gitleaks   | any     | Pre-commit secret scanning — `brew install gitleaks` |

Optional (for AI toolchain):

```bash
pip install aider-chat serena
npm install -g typescript-language-server
brew install jdtls d2
```

---

## Quick start

### 1 — Clone and install

```bash
git clone https://github.com/SandeepN97/inboxguard.git
cd inboxguard
npm install                   # root: Husky, Danger JS, repomix
cd frontend && npm install    # React, Tailwind, Motion, GSAP, ESLint
```

### 2 — Google credentials

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable the **Gmail API**
3. Create an **OAuth 2.0 Client ID** (Desktop application)
4. Download `credentials.json` → place in project root (gitignored)

### 3 — Environment

```bash
export GMAIL_CREDENTIALS_PATH=./credentials.json
export GMAIL_TOKEN_ENCRYPTION_KEY=<32-byte-random-key>   # openssl rand -base64 32
```

### 4 — Run (dev profile — H2 in-memory, no Postgres needed)

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

```bash
cd frontend
npm run dev                   # Vite dev server on :5173, proxies /api → :8080
```

---

## Development workflow

```bash
# Lint (runs automatically on staged files via Husky)
cd frontend && npm run lint

# Format check
cd frontend && npm run format:check

# Backend tests (includes ArchUnit architecture checks)
cd backend && mvn test

# Pack codebase for AI context
npm run pack

# View architecture diagrams locally
docker run -it --rm -p 8081:8080 \
  -v $(pwd)/docs/architecture:/usr/local/structurizr \
  structurizr/lite
```

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) — enforced by the `commit-msg` Husky hook.

---

## Production

```bash
# Build frontend
cd frontend && npm run build

# Serve SPA with Helmet.js security headers
npm run serve                 # node server.cjs — Express + Helmet.js on :3000

# Build backend JAR
cd backend && mvn package -DskipTests

# Run with production profile
java -jar backend/target/*.jar \
  --spring.profiles.active=prod \
  --DATABASE_URL=jdbc:postgresql://... \
  --DATABASE_USERNAME=... \
  --DATABASE_PASSWORD=... \
  --GMAIL_CREDENTIALS_PATH=/secrets/credentials.json \
  --GMAIL_TOKEN_ENCRYPTION_KEY=...
```

---

## GitHub Actions secrets required

| Secret              | Used by                        |
| ------------------- | ------------------------------ |
| `SEMGREP_APP_TOKEN` | Semgrep SAST scan              |
| `DATABASE_URL`      | ZAP scan (starts real backend) |
| `DATABASE_USERNAME` | ZAP scan                       |
| `DATABASE_PASSWORD` | ZAP scan                       |

`GITHUB_TOKEN` is injected automatically — no configuration needed.

---

## Project structure

```
inboxguard/
├── .github/workflows/       # CI: ci, security, codeql, zap, danger
├── .husky/                  # pre-commit (lint + Gitleaks) · commit-msg (Conventional Commits)
├── .semgrep/rules.yml       # Custom Semgrep rules (Gmail isolation, hardcoded keys)
├── .zap/rules.tsv           # ZAP rule overrides
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/inboxguard/
│       ├── domain/          # Pure Java records — no Spring, no JPA
│       ├── application/     # Use-case services + port interfaces
│       ├── infrastructure/  # Gmail adapter · JPA adapters · Spring config
│       └── web/             # REST controllers + DTOs
├── frontend/
│   ├── server.cjs           # Express + Helmet.js production server
│   └── src/
│       ├── api/             # TanStack Query hooks + Axios client
│       ├── components/      # shadcn/ui components
│       ├── store/           # Zustand UI store
│       └── types/           # Shared API response types
├── docs/
│   ├── adr/                 # ADR-001 → ADR-005
│   └── architecture/        # Mermaid · D2 · Structurizr C4
├── CLAUDE.md                # Project conventions (read this before making changes)
├── dangerfile.ts            # Danger JS PR policy
├── repomix.config.json      # repomix codebase packer config
├── serena.yml               # Serena LSP config
└── .aider.conf.yml          # aider AI pair programming config
```
