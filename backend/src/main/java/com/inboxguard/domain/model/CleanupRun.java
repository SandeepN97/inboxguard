package com.inboxguard.domain.model;

import java.time.Instant;
import java.util.UUID;

public record CleanupRun(
    UUID id,
    CleanupMode mode,
    CleanupStatus status,
    Instant startedAt,
    Instant completedAt,
    int emailsProcessed,
    int emailsDeleted
) {}