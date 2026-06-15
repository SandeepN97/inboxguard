package com.inboxguard.infrastructure.gmail;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.UserCredentials;
import com.inboxguard.application.port.out.TokenRepository;
import org.springframework.stereotype.Component;

@Component
public class GmailClientFactory {

    private final GmailProperties properties;
    private final TokenRepository tokenRepository;
    private final TokenEncryptionService encryption;

    public GmailClientFactory(GmailProperties properties, TokenRepository tokenRepository,
                              TokenEncryptionService encryption) {
        this.properties = properties;
        this.tokenRepository = tokenRepository;
        this.encryption = encryption;
    }

    public Gmail build() {
        String encryptedToken = tokenRepository.load()
            .orElseThrow(() -> new IllegalStateException(
                "No OAuth token stored. Complete the OAuth2 flow first via GET /api/auth/google"));

        String refreshToken = encryption.decrypt(encryptedToken);

        try {
            UserCredentials credentials = UserCredentials.newBuilder()
                .setClientId(properties.clientId())
                .setClientSecret(properties.clientSecret())
                .setRefreshToken(refreshToken)
                .build();

            return new Gmail.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials)
            ).setApplicationName("InboxGuard").build();

        } catch (Exception e) {
            throw new RuntimeException("Failed to build Gmail client", e);
        }
    }
}