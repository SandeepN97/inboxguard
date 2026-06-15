package com.inboxguard.application.port.out;

import java.util.List;

public interface GmailPort {
    List<String> findMessageIdsBySender(String sender);
    void archiveMessages(List<String> messageIds);
}