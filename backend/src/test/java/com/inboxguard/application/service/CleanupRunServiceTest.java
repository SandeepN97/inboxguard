package com.inboxguard.application.service;

import com.inboxguard.application.port.out.CleanupRunRepository;
import com.inboxguard.application.port.out.GmailPort;
import com.inboxguard.application.port.out.SenderRuleRepository;
import com.inboxguard.domain.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CleanupRunServiceTest {

    @Mock CleanupRunRepository runRepository;
    @Mock SenderRuleRepository ruleRepository;
    @Mock GmailPort gmailPort;

    CleanupRunService service;

    UUID runId = UUID.randomUUID();
    CleanupRun storedRun = new CleanupRun(runId, CleanupMode.DRY_RUN, CleanupStatus.RUNNING,
        Instant.now(), null, 0, 0);
    SenderRule activeRule = new SenderRule(UUID.randomUUID(), "news@example.com", true, Instant.now());

    @BeforeEach
    void setUp() {
        service = new CleanupRunService(runRepository, ruleRepository, gmailPort);
        when(runRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(runRepository.findById(runId)).thenReturn(Optional.of(storedRun));
        when(ruleRepository.findAllActive()).thenReturn(List.of(activeRule));
    }

    @Test
    void dry_run_finds_messages_but_never_archives() {
        when(gmailPort.findMessageIdsBySender("news@example.com")).thenReturn(List.of("msg1", "msg2"));

        service.executeCleanup(runId, CleanupMode.DRY_RUN);

        verify(gmailPort).findMessageIdsBySender("news@example.com");
        verify(gmailPort, never()).archiveMessages(any());
    }

    @Test
    void live_run_archives_found_messages() {
        when(gmailPort.findMessageIdsBySender("news@example.com")).thenReturn(List.of("msg1", "msg2"));

        service.executeCleanup(runId, CleanupMode.LIVE);

        verify(gmailPort).findMessageIdsBySender("news@example.com");
        verify(gmailPort).archiveMessages(List.of("msg1", "msg2"));
    }

    @Test
    void live_run_with_no_messages_skips_archive() {
        when(gmailPort.findMessageIdsBySender("news@example.com")).thenReturn(List.of());

        service.executeCleanup(runId, CleanupMode.LIVE);

        verify(gmailPort, never()).archiveMessages(any());
    }

    @Test
    void on_gmail_error_run_is_marked_failed() {
        when(gmailPort.findMessageIdsBySender(any()))
            .thenThrow(new RuntimeException("Gmail API unavailable"));

        service.executeCleanup(runId, CleanupMode.LIVE);

        verify(runRepository, atLeastOnce()).save(argThat(r -> r.status() == CleanupStatus.FAILED));
    }
}