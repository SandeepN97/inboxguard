# InboxGuard — Project Context

## What this is

A learning/portfolio project. The domain (Gmail inbox cleanup) is intentionally simple —
the goal is to practice enterprise-grade engineering: clean architecture, CI/CD, security
scanning, PR review, and documentation discipline.

**Read `docs/adr/` first** — every architectural decision and its rationale is documented
there. ADR-001 explains why this stack exists for a problem this size.

> `inbox-guard-scaffold/` is a prior-session scaffold — superseded by the project root.
> The canonical ADRs are `docs/adr/ADR-001` through `ADR-005`.

---

## Stack (all decisions in docs/adr/)

**Backend** — Spring Boot 3.3, Java 21, **Hexagonal Architecture** (Ports & Adapters),
Spring Security, Spring Retry, Flyway, H2 (dev) + PostgreSQL (prod). See ADR-001, ADR-002,
ADR-003, ADR-004.

**Frontend** — React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Motion (animations),
GSAP (timeline-based animations), TanStack Query (server state), Zustand (UI state).
See ADR-001, ADR-005.

**Security scanning** — Trivy (vulns + secrets + IaC), Gitleaks (secret scanning, pre-commit),
CodeQL (semantic SAST), Semgrep (fast SAST + custom rules), OWASP ZAP (DAST).

**PR/CI** — GitHub Actions, Danger JS (policy enforcement), Reviewdog (inline PR comments
from ESLint + Semgrep output).

**Code quality** — ESLint (flat config, ESLint 9), Prettier, Husky (pre-commit hooks),
Conventional Commits (commit-msg hook).

**Secure web baseline** — Spring Security (Helmet.js equivalent for API: CSP, HSTS,
X-Frame-Options, Referrer-Policy on all responses), Helmet.js (Express production
server for the SPA, `frontend/server.cjs`).

**Architecture docs** — Mermaid (primary, GitHub-native), D2 (complex diagrams),
Structurizr Lite (formal C4 model, `docs/architecture/workspace.dsl`), adr-tools.

---

## Hexagonal architecture — dependency rule (ADR-002)

```
web/          →  application/port/in/   (calls use cases via interfaces)
infrastructure → application/port/out/  (implements outbound ports)
application/  →  domain/               (uses domain models)
domain/       →  nothing               (pure Java, no Spring/JPA)
```

`HexagonalArchitectureTest.java` (ArchUnit) enforces this at test-time.
Gmail API types (`com.google.api.services.gmail.*`) must only appear in
`infrastructure/gmail/GmailAdapter` — enforced by both ArchUnit and a Semgrep rule.

---

## AI toolchain

Three tools extend the AI-assisted development loop:

| Tool        | Purpose                                            | Config                                | How to use                                                                                                                                                                                                               |
| ----------- | -------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **repomix** | Pack entire codebase into one AI-readable file     | `repomix.config.json`                 | `npm run pack` → `.repomix/inboxguard-context.md`; paste into any AI chat for full context. `npm run pack:clip` copies to clipboard.                                                                                     |
| **aider**   | AI pair programming in terminal with live repo map | `.aider.conf.yml`, `.aiderignore`     | `aider` (needs `ANTHROPIC_API_KEY`). Reads `CLAUDE.md` automatically. Auto-commits off — Husky hooks stay active.                                                                                                        |
| **Serena**  | Semantic LSP-backed code intelligence as MCP tools | `serena.yml`, `.claude/settings.json` | Runs as MCP server in Claude Code (`uvx serena .`). Provides `find_symbol`, `get_references`, `get_implementations` — semantic precision vs grep. Requires `jdtls` (Java) + `typescript-language-server` (TS) installed. |

**Layered context flow:**

```
repomix (full snapshot)  →  paste to AI chat / new conversation
aider   (live session)   →  terminal pair programming, file edits
Serena  (MCP server)     →  Claude Code tools panel, semantic lookups
```

**One-time setup (Python tools):**

```bash
pip install aider-chat                         # aider
pip install serena                             # serena (alternative to uvx)
npm install -g typescript-language-server      # Serena TypeScript LSP
brew install jdtls                             # Serena Java LSP
```

## Rule for every change

1. **SCOPE** — state which categories this touches: security, architecture, UI,
   code quality, backend/server config.
2. **CHECK** — simulate relevant checks:
   - Code changes → ESLint + Prettier
   - Dependencies/containers → Trivy
   - New secrets/config → Gitleaks
   - New endpoints/logic → Semgrep, CodeQL
   - Runtime auth/injection flows → note if ZAP scan is needed
   - New Java files in `application/service/` → unit tests required
3. **DOCUMENT ARCHITECTURE** — if this adds/removes a service, endpoint, data flow,
   or dependency: update `docs/architecture/system.md` (Mermaid, GitHub-native) or
   `system.d2` (D2 for complex diagrams). Significant decisions get a new ADR.
4. **SECURITY EXCEPTIONS** — if a finding can't be fixed now, log it in
   `docs/security/exceptions.md` (create if absent) with: finding, justification,
   owner, review date. Never silently ignore.
5. **SUMMARIZE** — end every response: what changed, what was checked, what docs
   were created/updated, anything flagged but unresolved.

---

## Enforcement chain

| Layer             | Catches                                              | Bypassable?                             |
| ----------------- | ---------------------------------------------------- | --------------------------------------- |
| Husky pre-commit  | Lint, format, Gitleaks secrets, Conventional Commits | Yes (`--no-verify`) — but CI catches it |
| GitHub Actions CI | Security scans, type-check, lint, build              | No (if branch protection requires it)   |
| Branch protection | Merge without passing checks                         | No (admin-locked in GitHub settings)    |
| Danger JS         | Missing tests, ADRs, credential files                | No (if added to required checks)        |

Required CI checks to enable in GitHub → Settings → Branches → main:
`backend`, `frontend`, `gitleaks`, `trivy-fs`, `semgrep`, `analyze`, `danger`

---

## Secrets required (GitHub repo secrets)

| Secret                                                     | Used by                                         |
| ---------------------------------------------------------- | ----------------------------------------------- |
| `SEMGREP_APP_TOKEN`                                        | `.github/workflows/security.yml` — Semgrep SAST |
| `DATABASE_URL` / `DATABASE_USERNAME` / `DATABASE_PASSWORD` | ZAP workflow, prod deployment                   |
| `GMAIL_TOKEN_ENCRYPTION_KEY`                               | Runtime — never commit, 32-byte AES key         |
| `GMAIL_CREDENTIALS_PATH`                                   | Runtime — path to downloaded credentials.json   |
