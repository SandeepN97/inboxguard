package com.inboxguard.infrastructure.persistence.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "oauth_tokens")
public class OAuthTokenJpaEntity {

    @Id
    private UUID id;

    @Column(name = "encrypted_token", nullable = false, columnDefinition = "TEXT")
    private String encryptedToken;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected OAuthTokenJpaEntity() {}

    public OAuthTokenJpaEntity(UUID id, String encryptedToken, Instant updatedAt) {
        this.id = id;
        this.encryptedToken = encryptedToken;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public String getEncryptedToken() { return encryptedToken; }
    public Instant getUpdatedAt() { return updatedAt; }
}