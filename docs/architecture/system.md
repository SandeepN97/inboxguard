# InboxGuard — Architecture Diagrams

Diagrams are rendered natively in GitHub markdown and Notion via Mermaid.js.
For complex multi-service diagrams see `system.d2` (D2 language, auto-layout).
For formal C4 model docs see `workspace.dsl` (Structurizr Lite).

---

## System Context

```mermaid
C4Context
  title System Context — InboxGuard

  Person(user, "Admin User", "Single authorized Gmail account owner")

  System_Boundary(ig, "InboxGuard") {
    System(frontend, "React SPA", "Dashboard: manage rules, trigger cleanup, view history")
    System(backend, "Spring Boot API", "Business logic, Gmail integration, rule evaluation")
  }

  System_Ext(gmail, "Gmail API (Google)", "message search + modify; OAuth2")
  System_Ext(postgres, "PostgreSQL", "sender_rules, cleanup_runs, oauth_tokens")

  Rel(user, frontend, "Uses", "HTTPS")
  Rel(frontend, backend, "REST API", "HTTPS / JSON")
  Rel(backend, gmail, "Search + archive messages", "HTTPS / OAuth2")
  Rel(backend, postgres, "Read / write", "JDBC / HikariCP")
```

---

## Container Diagram

```mermaid
C4Container
  title Container Diagram — InboxGuard

  Person(user, "Admin User")

  Container(frontend, "React Frontend", "React 18, TypeScript, Vite", "SPA served by Express + Helmet.js or Nginx")
  Container(backend, "Spring Boot API", "Java 21, Spring Boot 3.3", "Hexagonal architecture; virtual threads")
  ContainerDb(db, "PostgreSQL 16", "RDBMS", "sender_rules · cleanup_runs · oauth_tokens")
  System_Ext(gmail, "Gmail API")

  Rel(user, frontend, "HTTPS")
  Rel(frontend, backend, "/api/**  JSON", "HTTPS")
  Rel(backend, db, "JDBC / Flyway", "TCP 5432")
  Rel(backend, gmail, "OAuth2 / REST", "HTTPS 443")
```

---

## Hexagonal Architecture — Backend Package Layout

```mermaid
graph TD
    subgraph web["web/ — REST layer"]
        CTRL[controllers/]
        DTO[dto/]
    end

    subgraph app["application/ — use cases"]
        IN[port/in/ — inbound ports]
        OUT[port/out/ — outbound ports]
        SVC[service/ — implementations]
    end

    subgraph domain["domain/ — pure Java"]
        MODEL[model/  Records]
        EX[exception/]
    end

    subgraph infra["infrastructure/ — adapters"]
        GMAIL[gmail/ GmailAdapter]
        PERSIST[persistence/ JPA entities + repos]
        CONFIG[config/ Spring beans]
    end

    CTRL -->|calls| IN
    SVC -->|implements| IN
    SVC -->|depends on| OUT
    SVC -->|uses| MODEL
    GMAIL -->|implements| OUT
    PERSIST -->|implements| OUT

    style domain fill:#e8f5e9,stroke:#388e3c
    style app fill:#e3f2fd,stroke:#1976d2
    style web fill:#fff8e1,stroke:#f9a825
    style infra fill:#fce4ec,stroke:#c62828
```

---

## Cleanup Run — Sequence Diagram

```mermaid
sequenceDiagram
    actor U as Admin User
    participant F as React Frontend
    participant B as Spring Boot API
    participant G as Gmail API
    participant DB as PostgreSQL

    U->>F: Click "Run Cleanup" (LIVE mode)
    F->>B: POST /api/runs  {mode: "LIVE"}
    B->>DB: INSERT cleanup_runs (RUNNING)
    B-->>F: 202 Accepted {runId}
    F->>B: GET /api/runs/{runId}  (poll every 2s)

    loop for each active SenderRule
        B->>G: messages.list (q: from:sender)
        G-->>B: message IDs []
        B->>G: messages.batchModify (archive + mark read)
        G-->>B: 200 OK
        B->>DB: INSERT cleanup_run_results
    end

    B->>DB: UPDATE cleanup_runs SET status=COMPLETED
    B-->>F: GET /api/runs/{runId} → {status: "COMPLETED"}
    F-->>U: Show results table
```
