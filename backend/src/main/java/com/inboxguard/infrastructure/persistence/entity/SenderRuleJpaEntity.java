package com.inboxguard.infrastructure.persistence.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sender_rules")
public class SenderRuleJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String sender;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected SenderRuleJpaEntity() {}

    public SenderRuleJpaEntity(UUID id, String sender, boolean active, Instant createdAt) {
        this.id = id;
        this.sender = sender;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getSender() { return sender; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }

    public void setActive(boolean active) { this.active = active; }
}