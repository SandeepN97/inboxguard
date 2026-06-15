package com.inboxguard.infrastructure.persistence.adapter;

import com.inboxguard.application.port.out.CleanupRunRepository;
import com.inboxguard.domain.model.CleanupMode;
import com.inboxguard.domain.model.CleanupRun;
import com.inboxguard.domain.model.CleanupRunResult;
import com.inboxguard.domain.model.CleanupStatus;
import com.inboxguard.infrastructure.persistence.entity.CleanupRunJpaEntity;
import com.inboxguard.infrastructure.persistence.entity.CleanupRunResultJpaEntity;
import com.inboxguard.infrastructure.persistence.repository.CleanupRunJpaRepository;
import com.inboxguard.infrastructure.persistence.repository.CleanupRunResultJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class CleanupRunPersistenceAdapter implements CleanupRunRepository {

    private final CleanupRunJpaRepository runJpa;
    private final CleanupRunResultJpaRepository resultJpa;

    public CleanupRunPersistenceAdapter(CleanupRunJpaRepository runJpa,
                                        CleanupRunResultJpaRepository resultJpa) {
        this.runJpa = runJpa;
        this.resultJpa = resultJpa;
    }

    @Override
    public CleanupRun save(CleanupRun run) {
        var entity = runJpa.findById(run.id())
            .orElseGet(() -> new CleanupRunJpaEntity(
                run.id(), run.mode().name(), run.status().name(),
                run.startedAt(), run.completedAt(),
                run.emailsProcessed(), run.emailsDeleted()
            ));
        entity.setStatus(run.status().name());
        entity.setCompletedAt(run.completedAt());
        entity.setEmailsProcessed(run.emailsProcessed());
        entity.setEmailsDeleted(run.emailsDeleted());
        return toDomain(runJpa.save(entity));
    }

    @Override
    public Optional<CleanupRun> findById(UUID id) {
        return runJpa.findById(id).map(this::toDomain);
    }

    @Override
    public List<CleanupRun> findAll() {
        return runJpa.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public void saveResult(CleanupRunResult result) {
        resultJpa.save(new CleanupRunResultJpaEntity(
            result.id(), result.runId(), result.sender(),
            result.matchedCount(), result.archivedCount()
        ));
    }

    private CleanupRun toDomain(CleanupRunJpaEntity e) {
        return new CleanupRun(
            e.getId(),
            CleanupMode.valueOf(e.getMode()),
            CleanupStatus.valueOf(e.getStatus()),
            e.getStartedAt(),
            e.getCompletedAt(),
            e.getEmailsProcessed(),
            e.getEmailsDeleted()
        );
    }
}