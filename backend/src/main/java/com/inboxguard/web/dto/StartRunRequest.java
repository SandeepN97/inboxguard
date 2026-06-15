package com.inboxguard.web.dto;

import com.inboxguard.domain.model.CleanupMode;

public record StartRunRequest(CleanupMode mode) {}