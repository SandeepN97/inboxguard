package com.inboxguard.infrastructure.persistence.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "cleanup_runs")
public class CleanupRunJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String mode;

    @Column(nullable = false)
    private String status;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "emails_processed", nullable = false)
    private int emailsProcessed;

    @Column(name = "emails_deleted", nullable = false)
    private int emailsDeleted;

    protected CleanupRunJpaEntity() {}

    public CleanupRunJpaEntity(UUID id, String mode, String status, Instant startedAt,
                               Instant completedAt, int emailsProcessed, int emailsDeleted) {
        this.id = id;
        this.mode = mode;
        this.status = status;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.emailsProcessed = emailsProcessed;
        this.emailsDeleted = emailsDeleted;
    }

    public UUID getId() { return id; }
    public String getMode() { return mode; }
    public String getStatus() { return status; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public int getEmailsProcessed() { return emailsProcessed; }
    public int getEmailsDeleted() { return emailsDeleted; }

    public void setStatus(String status) { this.status = status; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public void setEmailsProcessed(int emailsProcessed) { this.emailsProcessed = emailsProcessed; }
    public void setEmailsDeleted(int emailsDeleted) { this.emailsDeleted = emailsDeleted; }
}