-- V1: Initial schema — sender rules, cleanup runs, and OAuth token storage
-- Dialect: PostgreSQL (H2 PostgreSQL-compat mode used in dev/test — see ADR-004)

CREATE TABLE sender_rules (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sender      VARCHAR(255) NOT NULL UNIQUE,   -- e.g. "noreply@news.com" or "@domain.com"
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE cleanup_runs (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at   TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    mode         VARCHAR(10)  NOT NULL CHECK (mode IN ('DRY_RUN', 'LIVE')),
    status       VARCHAR(20)  NOT NULL CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED'))
);

CREATE TABLE cleanup_run_results (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id         UUID         NOT NULL REFERENCES cleanup_runs(id) ON DELETE CASCADE,
    sender         VARCHAR(255) NOT NULL,
    matched_count  INT          NOT NULL DEFAULT 0,
    archived_count INT          NOT NULL DEFAULT 0
);

CREATE INDEX idx_cleanup_run_results_run_id ON cleanup_run_results(run_id);

-- Single-row table; only one user's token is ever stored (single-user admin tool)
CREATE TABLE oauth_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encrypted_token TEXT        NOT NULL,   -- AES-256-GCM encrypted refresh token (see ADR-003)
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);