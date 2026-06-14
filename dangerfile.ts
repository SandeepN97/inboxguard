import { danger, warn, fail, message } from "danger";

const modified = danger.git.modified_files;
const created = danger.git.created_files;
const allChanged = [...modified, ...created];
const additions = danger.github?.pr?.additions ?? 0;
const deletions = danger.github?.pr?.deletions ?? 0;

// ── PR size ────────────────────────────────────────────────────────────────
if (additions + deletions > 800) {
  warn(
    `This PR changes ${additions + deletions} lines. ` +
    "Consider splitting it into smaller, reviewable chunks."
  );
}

// ── ADR required for architectural changes ─────────────────────────────────
const architecturalMarkers = [
  "backend/pom.xml",
  "frontend/package.json",
  "application.yml",
  "application-prod.yml",
  "SecurityConfig",
];
const hasArchitecturalChange = allChanged.some((f) =>
  architecturalMarkers.some((m) => f.includes(m))
);
const hasNewAdr = created.some((f) => f.startsWith("docs/adr/"));

if (hasArchitecturalChange && !hasNewAdr) {
  warn(
    "An architectural file changed (pom.xml, package.json, SecurityConfig, or app config). " +
    "If this records a new technology or pattern decision, add an ADR under docs/adr/."
  );
}

// ── New application services must have tests ───────────────────────────────
const newServices = created.filter(
  (f) => f.includes("application/service/") && f.endsWith(".java")
);
const newTests = created.filter(
  (f) => f.includes("Test") && f.endsWith(".java")
);
if (newServices.length > 0 && newTests.length === 0) {
  fail(
    `New service class(es) added without test files: ${newServices.join(", ")}. ` +
    "All use-case services require unit tests."
  );
}

// ── Credential / secret file guard ─────────────────────────────────────────
const dangerousFiles = allChanged.filter(
  (f) =>
    f.endsWith("credentials.json") ||
    f.endsWith(".env") ||
    f.match(/\.env\.\w+$/)
);
if (dangerousFiles.length > 0) {
  fail(
    `Credential or env files detected in PR: ${dangerousFiles.join(", ")}. ` +
    "These must never be committed. Add to .gitignore and revoke/rotate the exposed secret."
  );
}

// ── Security config annotation ─────────────────────────────────────────────
const securityChanged = allChanged.some(
  (f) => f.includes("SecurityConfig") || f.includes("security")
);
if (securityChanged) {
  message(
    "Security configuration changed. Ensure the PR description explains " +
    "the security implications and that headers / CORS / auth rules were reviewed."
  );
}

// ── Gmail adapter isolation (path-level check; ArchUnit enforces at compile time) ──
const javaOutsideAdapter = created.filter(
  (f) => f.endsWith(".java") && !f.includes("infrastructure/gmail")
);
if (javaOutsideAdapter.some((f) => f.includes("gmail"))) {
  warn(
    "New Java file with 'gmail' in its path outside infrastructure/gmail/ detected. " +
    "Verify it does not import com.google.api.services.gmail — ArchUnit will catch it in CI."
  );
}