# ADR-001: Technology Stack — Spring Boot + React

**Status:** Accepted  
**Date:** 2026-06-14  
**Deciders:** Project author

---

## Context

InboxGuard is a single-user admin tool that must:

- Authorize against a Google account and call the Gmail API
- Persist configurable sender rules and run history
- Present a dashboard UI for managing rules, triggering cleanup runs, and viewing history

The stack must be defensible in a senior engineering code review — not just functional,
but idiomatic, testable, and representative of production-grade practices.

### Alternatives considered

| Option | Backend               | Frontend                | Notes                               |
| ------ | --------------------- | ----------------------- | ----------------------------------- |
| **A**  | Spring Boot (Java 21) | React + TypeScript      | This decision                       |
| **B**  | Node.js / Express     | React + TypeScript      | Single language, lighter runtime    |
| **C**  | Django + DRF          | React + TypeScript      | Python ecosystem, rapid prototyping |
| **D**  | Spring Boot           | Server-side (Thymeleaf) | No separate frontend build pipeline |

---

## Decision

**Use Spring Boot (Java 21) for the backend and React (TypeScript, Vite) for the
frontend, deployed as two separate applications communicating over HTTP/REST.**

### Rationale — Backend (Spring Boot)

- **Gmail API client maturity:** Google's official `google-api-services-gmail` Java
  library is the most complete and actively maintained Gmail client. OAuth2
  token refresh, retry, and pagination are handled natively.
- **Java 21 features:** Records (immutable domain models), sealed interfaces, virtual
  threads (Project Loom) for non-blocking Gmail API calls without reactive overhead,
  and text blocks for readable test fixtures.
- **Spring Security OAuth2:** Built-in support for Google's OAuth2 flow minimizes
  credential handling boilerplate while remaining auditable.
- **Testability:** Spring's DI container, combined with hexagonal architecture
  (ADR-002), makes unit-testing business logic without standing up the full context
  straightforward.
- **Industry prevalence:** Spring Boot is the dominant JVM web framework; the
  conventions and patterns here transfer directly to enterprise contexts reviewers
  will recognize.

### Why not Node.js / Express (Option B)?

Node has excellent Google API client support, but lacks the type safety and compile-time
guarantees of Java 21 without significant TypeScript overhead on the backend. Java's
stronger static typing catches more errors before runtime, and the Gmail Java client
library is more feature-complete than its JS counterpart.

### Why not Django (Option C)?

Django's Gmail ecosystem requires third-party packages (`google-auth-oauthlib`) that
add integration surface. Java's Spring + Google client library combination is
better documented for this exact use case.

### Rationale — Frontend (React + TypeScript + Vite)

- **TypeScript throughout:** End-to-end type safety; errors caught at build time, not
  runtime. API response shapes modeled as interfaces shared across components.
- **Vite:** Significantly faster HMR and build times vs. Create React App (now
  deprecated). Native ESM in dev mode eliminates bundle overhead during development.
- **Component ecosystem:** shadcn/ui (Radix primitives + Tailwind) gives accessible,
  unstyled-by-default components that look professional without fighting a design
  system.
- **Separation from backend:** Decoupled frontend allows independent deployment and
  independent test pipelines (CI can run backend tests and frontend lint/build in
  parallel — see ADR-002 and Phase 4).

---

## Consequences

**Positive:**

- Both layers can be tested, built, and deployed independently.
- Java type system + TypeScript gives the strongest type-safety story possible across
  the full stack.
- Google's first-party Java Gmail client library handles edge cases (token expiry,
  pagination) so the application layer doesn't have to.
- Familiar to the widest audience of senior Java/React engineers.

**Negative:**

- Two runtimes and two build systems (Maven + npm) add setup friction compared to a
  single-language stack.
- CORS configuration is required between the two applications.
- Cold start time for the JVM is higher than Node.js — acceptable for an admin tool
  with no latency SLA.

---

## Performance & Operational Impact

- **JVM startup:** Spring Boot with Java 21 and GraalVM native image compilation can
  reduce startup to <100ms if needed; not required for this use case.
- **Virtual threads (Project Loom):** Gmail API calls are I/O-bound. Using
  `spring.threads.virtual.enabled=true` (Spring Boot 3.2+) allows the server to
  handle concurrent requests without a large thread pool, with near-zero overhead.
- **Vite build:** Production bundle with tree-shaking and code splitting. First
  meaningful paint is fast even on a cold load because there is no SSR hydration cost.
- **CORS preflight:** One additional round-trip per distinct origin; acceptable for an
  admin tool where the user is the only consumer.
