package com.inboxguard.domain.model;

import java.util.UUID;

public record CleanupRunResult(
    UUID id,
    UUID runId,
    String sender,
    int matchedCount,
    int archivedCount
) {}