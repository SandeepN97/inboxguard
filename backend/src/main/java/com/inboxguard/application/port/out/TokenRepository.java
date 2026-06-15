package com.inboxguard.application.port.out;

import java.util.Optional;

public interface TokenRepository {
    void save(String encryptedToken);
    Optional<String> load();
}