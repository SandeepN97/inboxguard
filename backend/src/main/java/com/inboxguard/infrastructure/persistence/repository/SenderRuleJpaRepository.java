package com.inboxguard.infrastructure.persistence.repository;

import com.inboxguard.infrastructure.persistence.entity.SenderRuleJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SenderRuleJpaRepository extends JpaRepository<SenderRuleJpaEntity, UUID> {
    List<SenderRuleJpaEntity> findAllByActiveTrue();
}