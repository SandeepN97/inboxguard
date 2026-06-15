package com.inboxguard.application.port.in;

import com.inboxguard.domain.model.CleanupMode;
import com.inboxguard.domain.model.CleanupRun;

import java.util.List;
import java.util.UUID;

public interface RunCleanupUseCase {
    CleanupRun start(CleanupMode mode);
    CleanupRun getById(UUID id);
    List<CleanupRun> listAll();
}