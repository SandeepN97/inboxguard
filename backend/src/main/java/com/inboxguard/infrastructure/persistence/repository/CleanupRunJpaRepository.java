package com.inboxguard.infrastructure.persistence.repository;

import com.inboxguard.infrastructure.persistence.entity.CleanupRunJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CleanupRunJpaRepository extends JpaRepository<CleanupRunJpaEntity, UUID> {}