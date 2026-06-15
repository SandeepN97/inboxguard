package com.inboxguard.infrastructure.config;

import com.inboxguard.infrastructure.gmail.GmailProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(GmailProperties.class)
public class GmailConfig {}