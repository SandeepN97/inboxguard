ALTER TABLE cleanup_runs ADD COLUMN emails_processed INT NOT NULL DEFAULT 0;
ALTER TABLE cleanup_runs ADD COLUMN emails_deleted   INT NOT NULL DEFAULT 0;