 package com.inboxguard.application.service;

import com.inboxguard.application.port.out.SenderRuleRepository;
import com.inboxguard.domain.model.SenderRule;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SenderRuleServiceTest {

    @Mock
    SenderRuleRepository repository;

    @InjectMocks
    SenderRuleService service;

    @Test
    void list_delegates_to_repository() {
        var rule = new SenderRule(UUID.randomUUID(), "news@example.com", true, Instant.now());
        when(repository.findAll()).thenReturn(List.of(rule));

        var result = service.list();

        assertThat(result).containsExactly(rule);
    }

    @Test
    void create_generates_uuid_and_strips_whitespace() {
        var captor = ArgumentCaptor.forClass(SenderRule.class);
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = service.create("  news@example.com  ");

        verify(repository).save(captor.capture());
        assertThat(captor.getValue().sender()).isEqualTo("news@example.com");
        assertThat(captor.getValue().active()).isTrue();
        assertThat(captor.getValue().id()).isNotNull();
        assertThat(result.sender()).isEqualTo("news@example.com");
    }

    @Test
    void toggle_updates_active_flag() {
        var id = UUID.randomUUID();
        var existing = new SenderRule(id, "news@example.com", true, Instant.now());
        when(repository.findById(id)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = service.toggle(id, false);

        assertThat(result.active()).isFalse();
        assertThat(result.sender()).isEqualTo("news@example.com");
    }

    @Test
    void toggle_throws_when_rule_not_found() {
        var id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.toggle(id, false))
            .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void delete_calls_repository() {
        var id = UUID.randomUUID();
        service.delete(id);
        verify(repository).deleteById(id);
    }
}