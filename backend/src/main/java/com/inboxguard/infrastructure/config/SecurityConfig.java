package com.inboxguard.infrastructure.config;

import com.inboxguard.application.port.out.TokenRepository;
import com.inboxguard.infrastructure.gmail.TokenEncryptionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.util.List;

/**
 * Spring Security equivalent of Helmet.js for the REST API layer.
 * Sets CSP, HSTS, X-Frame-Options, Referrer-Policy, and Permissions-Policy
 * on every response — matching the secure header baseline Helmet.js provides
 * for Node/Express frontends.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.dev-auth:false}")
    private boolean devAuth;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           OAuth2AuthorizedClientService authorizedClientService,
                                           TokenRepository tokenRepository,
                                           TokenEncryptionService encryptionService) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Cookie-based CSRF: SPA reads XSRF-TOKEN cookie, echoes it as X-XSRF-TOKEN header.
            // CookieCsrfTokenRepository.withHttpOnlyFalse() makes the cookie JS-readable so Axios
            // can pick it up automatically via xsrfCookieName / xsrfHeaderName.
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                .ignoringRequestMatchers("/oauth2/**", "/login/**") // Spring Security's own OAuth endpoints
            )
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .headers(headers -> headers
                .contentSecurityPolicy(csp ->
                    csp.policyDirectives(
                        "default-src 'self'; " +
                        "frame-ancestors 'none'; " +
                        "object-src 'none'; " +
                        "base-uri 'self'"
                    ))
                .frameOptions(frame -> frame.deny())
                .contentTypeOptions(ct -> {})
                .httpStrictTransportSecurity(hsts -> hsts
                    .maxAgeInSeconds(31_536_000)
                    .includeSubDomains(true)
                    .preload(true))
                .referrerPolicy(referrer ->
                    referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .permissionsPolicy(permissions ->
                    permissions.policy("camera=(), microphone=(), geolocation=()"))
            )
            .authorizeHttpRequests(auth -> {
                auth.requestMatchers("/actuator/health", "/api/auth/**",
                                    "/oauth2/**", "/login/**").permitAll();
                if (devAuth) {
                    auth.anyRequest().permitAll();
                } else {
                    auth.anyRequest().authenticated();
                }
            })
            .oauth2Login(oauth2 -> oauth2
                .successHandler(new OAuthSuccessHandler(
                    frontendUrl, authorizedClientService, tokenRepository, encryptionService))
                .failureUrl(frontendUrl + "/?error=oauth_failed")
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://localhost:3000"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3_600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    static class OAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

        private final OAuth2AuthorizedClientService clientService;
        private final TokenRepository tokenRepository;
        private final TokenEncryptionService encryption;

        OAuthSuccessHandler(String frontendUrl,
                            OAuth2AuthorizedClientService clientService,
                            TokenRepository tokenRepository,
                            TokenEncryptionService encryption) {
            super(frontendUrl + "/?signing_in=1");
            this.clientService = clientService;
            this.tokenRepository = tokenRepository;
            this.encryption = encryption;
        }

        @Override
        public void onAuthenticationSuccess(HttpServletRequest request,
                                            HttpServletResponse response,
                                            Authentication auth) throws IOException, jakarta.servlet.ServletException {
            if (auth instanceof OAuth2AuthenticationToken token) {
                OAuth2AuthorizedClient client = clientService.loadAuthorizedClient(
                    token.getAuthorizedClientRegistrationId(), token.getName());
                if (client != null && client.getRefreshToken() != null) {
                    String encrypted = encryption.encrypt(client.getRefreshToken().getTokenValue());
                    tokenRepository.save(encrypted);
                }
            }
            super.onAuthenticationSuccess(request, response, auth);
        }
    }
}