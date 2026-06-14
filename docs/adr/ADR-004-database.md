# ADR-004: Database Choice — H2 (dev/test) + PostgreSQL (production)

**Status:** Accepted  
**Date:** 2026-06-14  
**Deciders:** Project author

---

## Context

InboxGuard needs persistent storage for:

1. **Sender rules** — sender domain/address, active flag, optional label
2. **Cleanup run history** — timestamp, mode (dry/live), per-sender result counts
3. **OAuth2 token** — encrypted refresh token (single row, single user)

The data volume is very low (tens to hundreds of rows). The schema is simple and
unlikely to require complex queries. However, the storage choice must:

- Support a realistic production path (demonstrate production awareness)
- Not over-engineer a tool that will run for a single user
- Fit cleanly into Spring Boot's JPA/Hibernate layer

### Alternatives considered

| Option                           | Notes                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **H2 (file-based, always)**      | Simple, zero-ops. No real production story.                                                                   |
| **SQLite**                       | True single-file embedded DB. Poor Spring/JPA ecosystem fit; connection pooling issues with multiple threads. |
| **H2 (dev) + PostgreSQL (prod)** | Industry-standard pattern for Spring Boot. Demonstrates environment-aware configuration.                      |
| **MongoDB**                      | Document DB adds no value for this schema; relational model is the natural fit.                               |

---

## Decision

**Use H2 for development/test profiles and PostgreSQL for the production profile.**

Spring Boot profiles (`application-dev.yml`, `application-test.yml`,
`application-prod.yml`) manage the datasource switch cleanly. No application code
changes between environments — only configuration.

### Schema overview

```sql
-- sender_rules
CREATE TABLE sender_rules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender      VARCHAR(255) NOT NULL UNIQUE,  -- e.g. "noreply@newsletter.com" or "@domain.com"
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- cleanup_runs
CREATE TABLE cleanup_runs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at  TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    mode        VARCHAR(10) NOT NULL CHECK (mode IN ('DRY_RUN', 'LIVE')),
    status      VARCHAR(20) NOT NULL  -- RUNNING, COMPLETED, FAILED
);

-- cleanup_run_results (per-sender breakdown within a run)
CREATE TABLE cleanup_run_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id          UUID NOT NULL REFERENCES cleanup_runs(id),
    sender          VARCHAR(255) NOT NULL,
    matched_count   INT NOT NULL DEFAULT 0,
    archived_count  INT NOT NULL DEFAULT 0
);

-- oauth_tokens (single row, single user)
CREATE TABLE oauth_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encrypted_token TEXT NOT NULL,  -- AES-256-GCM encrypted refresh token
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Migration strategy: Flyway

All schema changes are managed by Flyway (`org.flywaydb:flyway-core`). Migration
scripts live in `src/main/resources/db/migration/` following the naming convention
`V{version}__{description}.sql`.

- H2 compatibility mode (`spring.datasource.url=jdbc:h2:mem:inboxguard;MODE=PostgreSQL`)
  means the same migration SQL runs unchanged in dev and prod.
- Schema drift between environments is impossible — Flyway enforces version history.

### JPA / Hibernate

Spring Data JPA with Hibernate as the provider. JPA entities live in
`infrastructure/persistence/entity/` and are mapped to domain models by explicit
mapper classes — JPA annotations do not appear in `domain/model/` (see ADR-002).

```
domain/model/SenderRule.java      ← pure Java record, no JPA
  ↕ mapper
infrastructure/persistence/entity/SenderRuleEntity.java  ← @Entity, JPA annotations
infrastructure/persistence/repository/SenderRuleJpaRepository.java  ← extends JpaRepository
infrastructure/persistence/adapter/SenderRuleRepositoryAdapter.java ← implements SenderRuleRepository (port)
```

---

## Consequences

**Positive:**

- Zero setup for development: H2 starts in-memory with no external process.
- Production path is realistic: PostgreSQL is the industry-standard choice for
  Spring Boot applications; a reviewer sees a production-ready configuration.
- Flyway ensures the schema is versioned and reproducible across environments.
- JPA entity/domain separation keeps the domain layer free of persistence annotations.

**Negative:**

- Two datasource configurations to maintain (H2 and PostgreSQL connection strings,
  credentials, dialect settings). Managed by Spring profiles — low ongoing burden.
- SQLite would have been simpler for a truly single-user tool, but its Spring Boot
  ecosystem support (thread-safe connection pooling) is weaker than PostgreSQL and
  is not widely encountered in enterprise codebases reviewers will recognize.
- Flyway migrations must be written to be H2-compatible (no PG-specific syntax that
  H2's PostgreSQL mode doesn't support — enforced by running migration tests against H2
  in CI).

---

## Performance & Operational Impact

- **H2 (dev):** In-memory; schema creation and test teardown in milliseconds.
  Repository tests run without any external process.
- **PostgreSQL (prod):** HikariCP connection pool (Spring Boot default) with pool
  size 5–10 connections is more than sufficient for a single-user admin tool with
  infrequent API calls.
- **Query volume:** A cleanup run generates O(rules) queries for rule loading and O(1)
  inserts for the run record. No query optimization needed at this scale.
- **UUID primary keys:** Chosen over auto-increment integers to avoid exposing
  sequential IDs in REST API responses and to allow future distributed deployment
  without key collisions.
