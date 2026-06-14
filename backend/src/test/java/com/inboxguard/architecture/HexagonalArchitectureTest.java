package com.inboxguard.architecture;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

/**
 * ArchUnit tests enforcing the hexagonal architecture dependency rule (ADR-002).
 * These run as part of the normal test suite — no Spring context needed.
 */
class HexagonalArchitectureTest {

    private static JavaClasses classes;

    @BeforeAll
    static void importClasses() {
        classes = new ClassFileImporter().importPackages("com.inboxguard");
    }

    @Test
    void domain_must_not_depend_on_infrastructure() {
        ArchRule rule = noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat()
            .resideInAPackage("..infrastructure..");
        rule.check(classes);
    }

    @Test
    void domain_must_not_depend_on_web() {
        ArchRule rule = noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat()
            .resideInAPackage("..web..");
        rule.check(classes);
    }

    @Test
    void application_must_not_depend_on_infrastructure() {
        ArchRule rule = noClasses()
            .that().resideInAPackage("..application..")
            .should().dependOnClassesThat()
            .resideInAPackage("..infrastructure..");
        rule.check(classes);
    }

    @Test
    void application_must_not_depend_on_web() {
        ArchRule rule = noClasses()
            .that().resideInAPackage("..application..")
            .should().dependOnClassesThat()
            .resideInAPackage("..web..");
        rule.check(classes);
    }

    @Test
    void gmail_api_types_must_only_appear_in_gmail_adapter() {
        ArchRule rule = noClasses()
            .that().resideOutsideOfPackage("..infrastructure.gmail..")
            .should().dependOnClassesThat()
            .resideInAPackage("com.google.api.services.gmail..");
        rule.check(classes);
    }

    @Test
    void jpa_annotations_must_not_appear_in_domain() {
        ArchRule rule = noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat()
            .resideInAPackage("jakarta.persistence..");
        rule.check(classes);
    }
}