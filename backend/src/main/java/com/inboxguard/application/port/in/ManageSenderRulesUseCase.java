package com.inboxguard.application.port.in;

import com.inboxguard.domain.model.SenderRule;

import java.util.List;
import java.util.UUID;

public interface ManageSenderRulesUseCase {
    List<SenderRule> list();
    SenderRule create(String sender);
    SenderRule toggle(UUID id, boolean active);
    void delete(UUID id);
}