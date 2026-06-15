package com.inboxguard.web.controller;

import com.inboxguard.application.port.in.RunCleanupUseCase;
import com.inboxguard.web.dto.CleanupRunResponse;
import com.inboxguard.web.dto.StartRunRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@RestController
@RequestMapping("/api/runs")
public class CleanupRunController {

    private final RunCleanupUseCase useCase;

    public CleanupRunController(RunCleanupUseCase useCase) {
        this.useCase = useCase;
    }

    @GetMapping
    public List<CleanupRunResponse> listAll() {
        return useCase.listAll().stream().map(CleanupRunResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<CleanupRunResponse> start(@RequestBody StartRunRequest req) {
        var run = useCase.start(req.mode());
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(CleanupRunResponse.from(run));
    }

    @GetMapping("/{id}")
    public CleanupRunResponse getById(@PathVariable UUID id) {
        return CleanupRunResponse.from(useCase.getById(id));
    }

    @ExceptionHandler(NoSuchElementException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public void handleNotFound() {}
}