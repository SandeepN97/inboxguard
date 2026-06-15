package com.inboxguard.domain.model;

import java.time.Instant;
import java.util.UUID;

public record SenderRule(
    UUID id,
    String sender,
    boolean active,
    Instant createdAt
) {}