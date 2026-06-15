package com.inboxguard.application.port.out;

import com.inboxguard.domain.model.SenderRule;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SenderRuleRepository {
    List<SenderRule> findAll();
    List<SenderRule> findAllActive();
    Optional<SenderRule> findById(UUID id);
    SenderRule save(SenderRule rule);
    void deleteById(UUID id);
}