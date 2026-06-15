package com.inboxguard.application.service;

import com.inboxguard.application.port.in.ManageSenderRulesUseCase;
import com.inboxguard.application.port.out.SenderRuleRepository;
import com.inboxguard.domain.model.SenderRule;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class SenderRuleService implements ManageSenderRulesUseCase {

    private final SenderRuleRepository repository;

    public SenderRuleService(SenderRuleRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<SenderRule> list() {
        return repository.findAll();
    }

    @Override
    public SenderRule create(String sender) {
        var rule = new SenderRule(UUID.randomUUID(), sender.strip(), true, Instant.now());
        return repository.save(rule);
    }

    @Override
    public SenderRule toggle(UUID id, boolean active) {
        var existing = repository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Rule not found: " + id));
        var updated = new SenderRule(existing.id(), existing.sender(), active, existing.createdAt());
        return repository.save(updated);
    }

    @Override
    public void delete(UUID id) {
        repository.deleteById(id);
    }
}