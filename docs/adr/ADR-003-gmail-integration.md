# ADR-003: Gmail API Integration — OAuth2 Flow, Token Storage, Retry Strategy

**Status:** Accepted  
**Date:** 2026-06-14  
**Deciders:** Project author

---

## Context

InboxGuard must act on behalf of a single authorized Google account to:

1. Search for messages matching sender rules
2. Modify those messages (archive, mark read)

This requires OAuth2 authorization with Gmail API scopes. The questions to resolve:

- **Authorization flow:** Installed-app flow (credentials.json → browser consent) vs.
  Service Account (no user consent, requires Workspace domain admin)?
- **Token storage:** File-based (Google's `FileDataStoreFactory`) vs. database?
- **Credentials file:** How is `credentials.json` handled at runtime without being
  committed to version control?
- **Rate limits & retries:** Gmail API has quota limits (250 quota units/user/second).
  How are transient failures and 429s handled?

---

## Decision

### OAuth2 flow: Installed-application flow (Authorization Code + PKCE)

Use Google's installed-app OAuth2 flow:

1. On first run, the application opens a browser URL pointing to Google's consent screen.
2. After user consent, Google returns an authorization code.
3. The application exchanges the code for an access token + refresh token.
4. Subsequent runs use the refresh token to obtain new access tokens silently.

**Why not a Service Account?**  
Service Accounts require Google Workspace domain-wide delegation to access a user's
inbox. This is not available on personal Gmail accounts. The installed-app flow is the
correct mechanism for a single authorized user acting on their own mailbox.

### Credentials file handling

- `credentials.json` (downloaded from Google Cloud Console) is placed in the project
  root at runtime.
- It is added to `.gitignore` — never committed.
- The path is configured via `GMAIL_CREDENTIALS_PATH` environment variable
  (default: `./credentials.json`). This makes it injectable in CI/CD without
  hardcoding paths.
- In the README, setup instructions document exactly how to obtain and place this file.

### Token storage: Database (encrypted column), not filesystem

The refresh token is persisted to the application database (see ADR-004) in an
encrypted column (`tokens` table), not via Google's `FileDataStoreFactory`.

**Why not `FileDataStoreFactory`?**  
File-based token storage works for local scripts but is not appropriate for a
server-side application:

- File permissions are easy to misconfigure (world-readable).
- No connection to the application's own data lifecycle (backups, migrations).
- Not portable across deployments.

**Token encryption:**  
The stored refresh token is encrypted at rest using AES-256-GCM. The encryption key
is provided via the `GMAIL_TOKEN_ENCRYPTION_KEY` environment variable and never stored
in the database or version control. Spring's `@ConfigurationProperties` binds this
at startup; if absent, the application fails fast with a clear error.

### Gmail API client

Use the official `google-api-services-gmail` v1 Java client library (`com.google.apis`
group). Wrap it behind the `GmailPort` outbound port interface so the domain and
application layers never import Google client types directly.

```
GmailPort (application/port/out/)
  └── GmailAdapter (infrastructure/gmail/)  ← only file that imports google-api-services-gmail
```

### Rate limiting and retry strategy

Gmail API quota: 250 quota units/second/user. `messages.list` costs 5 units;
`messages.modify` costs 5 units. A cleanup run over 100 messages costs ~1,000 units,
requiring at minimum 4 seconds of spread across API calls.

**Strategy:**

1. **Exponential backoff with jitter** using Spring Retry (`@Retryable`):
   - Max attempts: 3
   - Initial backoff: 1 second
   - Multiplier: 2.0
   - Max backoff: 30 seconds
   - Jitter: ±20% (prevents thundering herd if multiple runs overlap)

2. **Retryable exceptions:** `GoogleJsonResponseException` with HTTP 429 (rate limit)
   or 503 (backend error). 403 `userRateLimitExceeded` is also retried.

3. **Non-retryable exceptions:** 400 Bad Request, 401 Unauthorized (token revoked —
   triggers re-authorization flow instead of retry).

4. **Batch requests:** Use Gmail's batch API endpoint (`/batch/gmail/v1`) to group
   up to 100 `messages.modify` calls into a single HTTP request, reducing quota
   consumption and latency.

5. **Dry-run mode:** The `TriggerCleanupUseCase` accepts a `dryRun` flag. When true,
   the `GmailAdapter` executes `messages.list` but substitutes all `messages.modify`
   calls with a no-op log statement. No quota is consumed for modifications.

---

## Consequences

**Positive:**

- No credentials ever appear in version control or application logs.
- Database-stored tokens participate in the application's backup/restore lifecycle.
- Retry logic is transparent to the application service layer (handled in the adapter).
- Dry-run mode lets users verify rule matching before committing modifications.

**Negative:**

- Initial setup requires manual placement of `credentials.json` and a one-time
  browser consent step — this must be clearly documented.
- Encryption key management is the operator's responsibility. Lost key = lost token
  (user must re-authorize). Document this explicitly in the runbook.
- Batch API adds implementation complexity vs. sequential calls. Justified by
  quota savings on large inboxes.

---

## Performance & Operational Impact

- **Quota budget:** With batching, a 500-message cleanup run consumes ~500–600 quota
  units (batched `modify` calls share overhead). Well within the 250/second limit when
  spread across ~3 seconds of execution.
- **Latency:** A single cleanup run touching 100 messages takes approximately 2–5
  seconds of wall-clock time (dominated by network round trips to Gmail). This is
  acceptable for a manually-triggered admin operation.
- **Token refresh overhead:** Google access tokens expire after 1 hour. The Java
  client library handles silent refresh automatically before each API call — no
  additional application code required.
- **Retry worst case:** 3 attempts × 30-second max backoff = up to 90 seconds on
  sustained rate limiting. A timeout should be configured on the HTTP client (60s
  socket timeout) to prevent indefinite hangs on network failures.
