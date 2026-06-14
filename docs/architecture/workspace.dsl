/*
 * Structurizr Lite — C4 Model for InboxGuard
 *
 * Run locally:
 *   docker run -it --rm -p 8081:8080 \
 *     -v $(pwd)/docs/architecture:/usr/local/structurizr \
 *     structurizr/lite
 *
 * Then open http://localhost:8081 to view and export diagrams.
 */

workspace "InboxGuard" "Gmail inbox cleanup administration tool" {

    model {
        user = person "Admin User" "Single authorized Gmail account owner who manages cleanup rules and triggers runs."

        inboxguard = softwareSystem "InboxGuard" "Automates Gmail inbox cleanup based on configurable sender rules." {

            frontend = container "React Frontend" {
                description "Single-page admin dashboard"
                technology "React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Motion · GSAP"

                apiClient  = component "API Client"      "Axios instance + TanStack Query hooks; typed against src/types/api.ts"
                uiStore    = component "UI Store"        "Zustand store for client-only state (run mode, sidebar)"
                dashboard  = component "Dashboard Page"  "Rule list, cleanup trigger, run history"
            }

            backend = container "Spring Boot API" {
                description "Business logic and Gmail API integration"
                technology "Java 21 · Spring Boot 3.3 · Hexagonal Architecture · Spring Retry"

                webLayer         = component "Web Layer"          "REST controllers and request/response DTOs. Thin — delegates to inbound ports only."  "Spring MVC"
                inboundPorts     = component "Inbound Ports"      "ManageSenderRulesUseCase · TriggerCleanupUseCase · QueryRunHistoryUseCase"           "Java interfaces"
                services         = component "Application Services" "CleanupService · SenderRuleService — pure business logic, no framework imports"    "Java 21"
                outboundPorts    = component "Outbound Ports"     "GmailPort · SenderRuleRepository · RunHistoryRepository"                             "Java interfaces"
                gmailAdapter     = component "Gmail Adapter"      "Implements GmailPort. Only file that imports google-api-services-gmail."             "Google API Client"
                persistenceAdapter = component "Persistence Adapter" "Implements repository ports. JPA entities mapped to domain records by mappers."  "Spring Data JPA · Flyway"
                securityConfig   = component "Security Config"    "Spring Security — HSTS, CSP, X-Frame-Options, Referrer-Policy. Helmet.js equivalent for the API layer." "Spring Security"
            }

            database = container "PostgreSQL 16" {
                description "Stores sender rules, cleanup run history, and AES-256-GCM encrypted OAuth2 tokens"
                technology "PostgreSQL 16 · HikariCP"
                tags "Database"
            }
        }

        gmail = softwareSystem "Gmail API" {
            description "Google's email service — messages.list + messages.batchModify"
            tags "External"
        }

        # Relationships
        user          -> frontend.dashboard        "Manages rules, triggers cleanup, views history"  "HTTPS"
        frontend.dashboard -> frontend.apiClient   "Calls"
        frontend.apiClient -> backend.webLayer     "REST JSON"                                       "HTTPS"
        frontend.uiStore   -> frontend.dashboard   "Provides UI state"

        backend.webLayer           -> backend.inboundPorts      "Calls use case interfaces"
        backend.services           -> backend.inboundPorts      "Implements"
        backend.services           -> backend.outboundPorts     "Depends on port interfaces"
        backend.services           -> backend.gmailAdapter      "Via GmailPort"
        backend.services           -> backend.persistenceAdapter "Via repository ports"
        backend.gmailAdapter       -> gmail                      "Search + modify messages"            "HTTPS · OAuth2"
        backend.persistenceAdapter -> database                   "Read / write"                        "JDBC 5432"
    }

    views {
        systemContext inboxguard "SystemContext" {
            include *
            autoLayout lr
            title "System Context"
        }

        container inboxguard "Containers" {
            include *
            autoLayout lr
            title "Container Diagram"
        }

        component backend "BackendComponents" {
            include *
            autoLayout tb
            title "Backend Component Diagram"
        }

        component frontend "FrontendComponents" {
            include *
            autoLayout tb
            title "Frontend Component Diagram"
        }

        styles {
            element "Person" {
                shape Person
                background #08427B
                color #ffffff
            }
            element "Software System" {
                background #1168BD
                color #ffffff
            }
            element "Container" {
                background #438DD5
                color #ffffff
            }
            element "Component" {
                background #85BBF0
                color #000000
            }
            element "Database" {
                shape Cylinder
                background #438DD5
                color #ffffff
            }
            element "External" {
                background #999999
                color #ffffff
            }
        }

        theme default
    }
}