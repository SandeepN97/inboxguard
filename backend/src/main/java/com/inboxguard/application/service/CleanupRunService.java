package com.inboxguard.application.service;

import com.inboxguard.application.port.in.RunCleanupUseCase;
import com.inboxguard.application.port.out.CleanupRunRepository;
import com.inboxguard.application.port.out.GmailPort;
import com.inboxguard.application.port.out.SenderRuleRepository;
import com.inboxguard.domain.model.CleanupMode;
import com.inboxguard.domain.model.CleanupRun;
import com.inboxguard.domain.model.CleanupRunResult;
import com.inboxguard.domain.model.CleanupStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class CleanupRunService implements RunCleanupUseCase {

    private static final Logger log = LoggerFactory.getLogger(CleanupRunService.class);

    private final CleanupRunRepository runRepository;
    private final SenderRuleRepository ruleRepository;
    private final GmailPort gmailPort;

    public CleanupRunService(
        CleanupRunRepository runRepository,
        SenderRuleRepository ruleRepository,
        GmailPort gmailPort
    ) {
        this.runRepository = runRepository;
        this.ruleRepository = ruleRepository;
        this.gmailPort = gmailPort;
    }

    @Override
    public CleanupRun start(CleanupMode mode) {
        var run = runRepository.save(new CleanupRun(
            UUID.randomUUID(), mode, CleanupStatus.RUNNING,
            Instant.now(), null, 0, 0
        ));
        // Virtual thread — runs cleanup in background; caller gets the RUNNING run immediately
        Thread.ofVirtual().name("cleanup-" + run.id()).start(() -> executeCleanup(run.id(), mode));
        return run;
    }

    @Override
    public CleanupRun getById(UUID id) {
        return runRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Run not found: " + id));
    }

    @Override
    public List<CleanupRun> listAll() {
        return runRepository.findAll();
    }

    void executeCleanup(UUID runId, CleanupMode mode) {
        int totalProcessed = 0;
        int totalDeleted = 0;
        try {
            var activeRules = ruleRepository.findAllActive();
            for (var rule : activeRules) {
                List<String> messageIds = gmailPort.findMessageIdsBySender(rule.sender());
                int count = messageIds.size();
                totalProcessed += count;
                if (mode == CleanupMode.LIVE && !messageIds.isEmpty()) {
                    gmailPort.archiveMessages(messageIds);
                    totalDeleted += count;
                }
                runRepository.saveResult(new CleanupRunResult(
                    UUID.randomUUID(), runId, rule.sender(),
                    count, mode == CleanupMode.LIVE ? count : 0
                ));
            }
            persist(runId, CleanupStatus.COMPLETED, totalProcessed, totalDeleted);
        } catch (Exception e) {
            log.error("Cleanup run {} failed", runId, e);
            persist(runId, CleanupStatus.FAILED, totalProcessed, totalDeleted);
        }
    }

    private void persist(UUID runId, CleanupStatus status, int processed, int deleted) {
        runRepository.findById(runId).ifPresent(run ->
            runRepository.save(new CleanupRun(
                run.id(), run.mode(), status,
                run.startedAt(), Instant.now(), processed, deleted
            ))
        );
    }
}