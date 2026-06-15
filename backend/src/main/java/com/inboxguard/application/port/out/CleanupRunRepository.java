package com.inboxguard.application.port.out;

import com.inboxguard.domain.model.CleanupRun;
import com.inboxguard.domain.model.CleanupRunResult;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CleanupRunRepository {
    CleanupRun save(CleanupRun run);
    Optional<CleanupRun> findById(UUID id);
    List<CleanupRun> findAll();
    void saveResult(CleanupRunResult result);
}