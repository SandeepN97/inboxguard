-- V1: Initial schema — sender rules, cleanup runs, and OAuth token storage
-- Dialect: ANSI SQL (works on both H2 in PostgreSQL-compat mode and real PostgreSQL)
-- UUID PKs are always set by the application layer.

CREATE TABLE sender_rules (
    id          UUID                     NOT NULL,
    sender      VARCHAR(255)             NOT NULL,
    active      BOOLEAN                  NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT sender_rules_pkey PRIMARY KEY (id),
    CONSTRAINT sender_rules_sender_key UNIQUE (sender)
);

CREATE TABLE cleanup_runs (
    id           UUID                     NOT NULL,
    started_at   TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    mode         VARCHAR(10)              NOT NULL,
    status       VARCHAR(20)              NOT NULL,
    CONSTRAINT cleanup_runs_pkey PRIMARY KEY (id),
    CONSTRAINT cleanup_runs_mode_check   CHECK (mode   IN ('DRY_RUN', 'LIVE')),
    CONSTRAINT cleanup_runs_status_check CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED'))
);

CREATE TABLE cleanup_run_results (
    id             UUID         NOT NULL,
    run_id         UUID         NOT NULL,
    sender         VARCHAR(255) NOT NULL,
    matched_count  INT          NOT NULL DEFAULT 0,
    archived_count INT          NOT NULL DEFAULT 0,
    CONSTRAINT cleanup_run_results_pkey PRIMARY KEY (id),
    CONSTRAINT fk_run_results_run FOREIGN KEY (run_id) REFERENCES cleanup_runs(id) ON DELETE CASCADE
);

CREATE INDEX idx_cleanup_run_results_run_id ON cleanup_run_results(run_id);

-- Single-row table; only one user's token is ever stored (single-user admin tool)
CREATE TABLE oauth_tokens (
    id              UUID                     NOT NULL,
    encrypted_token TEXT                     NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT oauth_tokens_pkey PRIMARY KEY (id)
);