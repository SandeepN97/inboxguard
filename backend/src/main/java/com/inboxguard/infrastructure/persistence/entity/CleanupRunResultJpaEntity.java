package com.inboxguard.infrastructure.persistence.entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "cleanup_run_results")
public class CleanupRunResultJpaEntity {

    @Id
    private UUID id;

    @Column(name = "run_id", nullable = false)
    private UUID runId;

    @Column(nullable = false)
    private String sender;

    @Column(name = "matched_count", nullable = false)
    private int matchedCount;

    @Column(name = "archived_count", nullable = false)
    private int archivedCount;

    protected CleanupRunResultJpaEntity() {}

    public CleanupRunResultJpaEntity(UUID id, UUID runId, String sender,
                                     int matchedCount, int archivedCount) {
        this.id = id;
        this.runId = runId;
        this.sender = sender;
        this.matchedCount = matchedCount;
        this.archivedCount = archivedCount;
    }

    public UUID getId() { return id; }
    public UUID getRunId() { return runId; }
    public String getSender() { return sender; }
    public int getMatchedCount() { return matchedCount; }
    public int getArchivedCount() { return archivedCount; }
}