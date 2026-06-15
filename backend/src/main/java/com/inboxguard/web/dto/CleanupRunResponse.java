package com.inboxguard.web.dto;

import com.inboxguard.domain.model.CleanupRun;

import java.time.Instant;
import java.util.UUID;

public record CleanupRunResponse(
    UUID id,
    String mode,
    String status,
    Instant startedAt,
    Instant completedAt,
    int emailsProcessed,
    int emailsDeleted
) {
    public static CleanupRunResponse from(CleanupRun run) {
        return new CleanupRunResponse(
            run.id(), run.mode().name(), run.status().name(),
            run.startedAt(), run.completedAt(),
            run.emailsProcessed(), run.emailsDeleted()
        );
    }
}