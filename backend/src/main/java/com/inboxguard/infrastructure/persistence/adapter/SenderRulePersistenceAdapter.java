package com.inboxguard.infrastructure.persistence.adapter;

import com.inboxguard.application.port.out.SenderRuleRepository;
import com.inboxguard.domain.model.SenderRule;
import com.inboxguard.infrastructure.persistence.entity.SenderRuleJpaEntity;
import com.inboxguard.infrastructure.persistence.repository.SenderRuleJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class SenderRulePersistenceAdapter implements SenderRuleRepository {

    private final SenderRuleJpaRepository jpa;

    public SenderRulePersistenceAdapter(SenderRuleJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public List<SenderRule> findAll() {
        return jpa.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public List<SenderRule> findAllActive() {
        return jpa.findAllByActiveTrue().stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<SenderRule> findById(UUID id) {
        return jpa.findById(id).map(this::toDomain);
    }

    @Override
    public SenderRule save(SenderRule rule) {
        var entity = jpa.findById(rule.id())
            .orElseGet(() -> new SenderRuleJpaEntity(rule.id(), rule.sender(), rule.active(), rule.createdAt()));
        entity.setActive(rule.active());
        return toDomain(jpa.save(entity));
    }

    @Override
    public void deleteById(UUID id) {
        jpa.deleteById(id);
    }

    private SenderRule toDomain(SenderRuleJpaEntity e) {
        return new SenderRule(e.getId(), e.getSender(), e.isActive(), e.getCreatedAt());
    }
}