package com.inboxguard.web.dto;

import com.inboxguard.domain.model.SenderRule;

import java.time.Instant;
import java.util.UUID;

public record SenderRuleResponse(UUID id, String sender, boolean active, Instant createdAt) {
    public static SenderRuleResponse from(SenderRule rule) {
        return new SenderRuleResponse(rule.id(), rule.sender(), rule.active(), rule.createdAt());
    }
}