package com.inboxguard.infrastructure.persistence.adapter;

import com.inboxguard.application.port.out.TokenRepository;
import com.inboxguard.infrastructure.persistence.entity.OAuthTokenJpaEntity;
import com.inboxguard.infrastructure.persistence.repository.OAuthTokenJpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Component
public class TokenPersistenceAdapter implements TokenRepository {

    private final OAuthTokenJpaRepository jpa;

    public TokenPersistenceAdapter(OAuthTokenJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    @Transactional
    public void save(String encryptedToken) {
        jpa.deleteAll();
        jpa.save(new OAuthTokenJpaEntity(UUID.randomUUID(), encryptedToken, Instant.now()));
    }

    @Override
    public Optional<String> load() {
        return jpa.findTopByOrderByUpdatedAtDesc().map(OAuthTokenJpaEntity::getEncryptedToken);
    }
}