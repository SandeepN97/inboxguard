# ADR-002: Architecture Pattern — Hexagonal (Ports & Adapters)

**Status:** Accepted  
**Date:** 2026-06-14  
**Deciders:** Project author

---

## Context

The backend must integrate with two external systems (Gmail API, relational database)
and expose one inbound interface (REST API). These boundaries are the natural
integration points where coupling must be controlled.

The architecture choice determines:

- How easily the Gmail adapter can be swapped or mocked in tests
- Whether business rules can be tested without a running database or network
- How the package structure communicates intent to reviewers

### Alternatives considered

| Pattern                          | Summary                                                                   |
| -------------------------------- | ------------------------------------------------------------------------- |
| **Layered MVC**                  | Controller → Service → Repository. Familiar, low ceremony.                |
| **Hexagonal (Ports & Adapters)** | Domain + use cases at center; adapters at edges.                          |
| **Clean Architecture**           | Concentric rings: Entities → Use Cases → Interface Adapters → Frameworks. |

---

## Decision

**Use Hexagonal Architecture (Ports & Adapters).**

For the scale and complexity of InboxGuard, hexagonal provides the right level of
structural discipline without the ceremony overhead of full Clean Architecture. The
domain and its use cases are isolated from all infrastructure concerns through explicit
port interfaces, and adapters implement those ports.

### Package structure

```
backend/src/main/java/com/inboxguard/
├── domain/
│   ├── model/          # SenderRule, CleanupRun, CleanupResult — pure Java records
│   └── exception/      # Domain-specific exceptions (no Spring, no JPA)
├── application/
│   ├── port/
│   │   ├── in/         # Inbound ports (use case interfaces): ManageSenderRulesUseCase,
│   │   │               #   TriggerCleanupUseCase, QueryRunHistoryUseCase
│   │   └── out/        # Outbound ports: SenderRuleRepository, GmailPort, RunHistoryRepository
│   └── service/        # Use case implementations: CleanupService, SenderRuleService
├── infrastructure/
│   ├── gmail/          # GmailAdapter implements GmailPort; wraps google-api-services-gmail
│   ├── persistence/    # JPA entities, Spring Data repos, mappers (domain ↔ JPA entity)
│   └── config/         # Spring @Configuration beans, OAuth2 setup
└── web/
    ├── controller/     # REST controllers (thin — delegate to inbound ports only)
    └── dto/            # Request/response DTOs (no domain objects in HTTP layer)
```

### Dependency rule (strictly enforced)

```
web/          →  application/port/in/   (calls use cases)
infrastructure → application/port/out/  (implements outbound ports)
application/  →  domain/               (uses domain models)
domain/       →  nothing               (pure Java only)
```

`domain/` and `application/` must never import from `infrastructure/` or `web/`.
This is verifiable via ArchUnit tests (added in Phase 2).

### Why hexagonal over layered MVC?

In a layered architecture, there is nothing stopping a controller from injecting a
repository directly, or a service from importing a JPA annotation. These leaks are
common and go undetected until a test requires mocking an entire Spring context.

Hexagonal enforces the boundary through package structure and interface types.
`GmailPort` is declared in `application/port/out/`; `CleanupService` depends on
`GmailPort`, not on `GmailAdapter`. Tests replace `GmailAdapter` with a stub that
implements `GmailPort` — no Spring context, no network, sub-millisecond test cycle.

### Why hexagonal over full Clean Architecture?

Full Clean Architecture requires explicit Use Case input/output objects (Request/Response
models) in addition to domain models and DTOs. For a tool of this complexity, that
adds three layers of mapping for each operation without meaningful benefit. Hexagonal
achieves the same testability and boundary guarantees with less indirection. If
InboxGuard grows to include scheduling, user accounts, or multi-provider support,
Clean Architecture's stricter use case modeling can be layered in at that point.

---

## Consequences

**Positive:**

- `CleanupService` can be fully unit-tested by injecting a stub `GmailPort` and stub
  `SenderRuleRepository`. No Spring context, no database, no network needed.
- Adding a second email provider (e.g. Outlook) requires a new adapter only;
  domain and use cases are untouched.
- Package structure communicates architecture intent on first read.

**Negative:**

- More initial files and interfaces than a simple MVC app with three layers.
- Mapping between JPA entities and domain models adds a small amount of boilerplate.
  Justified by the testability gain.
- Reviewers unfamiliar with hexagonal need to understand the port/adapter pattern;
  README and package-level comments address this.

---

## Performance & Operational Impact

- **Zero runtime overhead:** Hexagonal is a compile-time/structural pattern. At
  runtime, the JVM sees normal method dispatch through interfaces — identical to MVC.
- **Test suite speed:** Because use case tests require no Spring context and no DB,
  the unit test suite runs in milliseconds. Integration tests (full context, H2)
  remain separate and run in CI only.
- **Maintainability:** ArchUnit rules enforcing the dependency rule run as part of the
  test suite, preventing future architectural drift silently accumulating over time.
