package com.inboxguard.infrastructure.persistence.repository;

import com.inboxguard.infrastructure.persistence.entity.OAuthTokenJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OAuthTokenJpaRepository extends JpaRepository<OAuthTokenJpaEntity, UUID> {
    Optional<OAuthTokenJpaEntity> findTopByOrderByUpdatedAtDesc();
}