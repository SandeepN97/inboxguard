package com.inboxguard.web.controller;

import com.inboxguard.application.port.in.ManageSenderRulesUseCase;
import com.inboxguard.web.dto.CreateRuleRequest;
import com.inboxguard.web.dto.SenderRuleResponse;
import com.inboxguard.web.dto.ToggleRuleRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@RestController
@RequestMapping("/api/rules")
public class SenderRuleController {

    private final ManageSenderRulesUseCase useCase;

    public SenderRuleController(ManageSenderRulesUseCase useCase) {
        this.useCase = useCase;
    }

    @GetMapping
    public List<SenderRuleResponse> list() {
        return useCase.list().stream().map(SenderRuleResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<SenderRuleResponse> create(@RequestBody CreateRuleRequest req) {
        var rule = useCase.create(req.sender());
        return ResponseEntity.status(HttpStatus.CREATED).body(SenderRuleResponse.from(rule));
    }

    @PatchMapping("/{id}")
    public SenderRuleResponse toggle(@PathVariable UUID id, @RequestBody ToggleRuleRequest req) {
        return SenderRuleResponse.from(useCase.toggle(id, req.active()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        useCase.delete(id);
    }

    @ExceptionHandler(NoSuchElementException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public void handleNotFound() {}
}