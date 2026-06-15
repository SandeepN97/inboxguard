package com.inboxguard.infrastructure.persistence.repository;

import com.inboxguard.infrastructure.persistence.entity.CleanupRunResultJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CleanupRunResultJpaRepository extends JpaRepository<CleanupRunResultJpaEntity, UUID> {}