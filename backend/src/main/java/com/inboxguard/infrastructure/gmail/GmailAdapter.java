package com.inboxguard.infrastructure.gmail;

import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.BatchModifyMessagesRequest;
import com.google.api.services.gmail.model.ListMessagesResponse;
import com.google.api.services.gmail.model.Message;
import com.inboxguard.application.port.out.GmailPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class GmailAdapter implements GmailPort {

    private static final Logger log = LoggerFactory.getLogger(GmailAdapter.class);
    private static final String ME = "me";
    private static final int BATCH_SIZE = 1000;

    private final GmailClientFactory factory;

    public GmailAdapter(GmailClientFactory factory) {
        this.factory = factory;
    }

    @Override
    @Retryable(retryFor = UncheckedIOException.class, maxAttempts = 3,
               backoff = @Backoff(delay = 1000, multiplier = 2, random = true))
    public List<String> findMessageIdsBySender(String sender) {
        try {
            Gmail gmail = factory.build();
            List<String> ids = new ArrayList<>();
            String pageToken = null;

            do {
                ListMessagesResponse response = gmail.users().messages()
                    .list(ME)
                    .setQ("from:" + sender)
                    .setPageToken(pageToken)
                    .setMaxResults(500L)
                    .execute();

                if (response.getMessages() != null) {
                    response.getMessages().stream().map(Message::getId).forEach(ids::add);
                }
                pageToken = response.getNextPageToken();
            } while (pageToken != null);

            log.debug("Found {} messages from {}", ids.size(), sender);
            return ids;

        } catch (IOException e) {
            log.warn("Gmail API error querying sender {}: {}", sender, e.getMessage());
            throw new UncheckedIOException(e);
        }
    }

    @Override
    @Retryable(retryFor = UncheckedIOException.class, maxAttempts = 3,
               backoff = @Backoff(delay = 1000, multiplier = 2, random = true))
    public void archiveMessages(List<String> messageIds) {
        if (messageIds.isEmpty()) return;
        try {
            Gmail gmail = factory.build();
            for (int i = 0; i < messageIds.size(); i += BATCH_SIZE) {
                List<String> batch = messageIds.subList(i, Math.min(i + BATCH_SIZE, messageIds.size()));
                gmail.users().messages().batchModify(ME, new BatchModifyMessagesRequest()
                    .setIds(batch)
                    .setRemoveLabelIds(List.of("INBOX"))
                ).execute();
                log.debug("Archived batch of {} messages", batch.size());
            }
        } catch (IOException e) {
            log.warn("Gmail API error archiving messages: {}", e.getMessage());
            throw new UncheckedIOException(e);
        }
    }
}
