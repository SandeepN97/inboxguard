"use strict";

/**
 * Production static-file server with Helmet.js security headers.
 * Spring Boot (SecurityConfig.java) covers the API side; this covers the SPA side.
 * Run with: node server.cjs  (after `npm run build`)
 * Alternative: replace with Nginx — the Helmet CSP directives below map 1-1 to
 * `add_header Content-Security-Policy` in nginx.conf.
 */

const express = require("express");
const helmet = require("helmet");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.VITE_API_URL || "http://localhost:8080";
const DIST_DIR = path.join(__dirname, "dist");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind generates inline styles
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", API_URL],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    // Required false: React dev tools and some browser extensions use COEP
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31_536_000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    permittedCrossDomainPolicies: false,
  })
);

app.use(express.static(DIST_DIR, { index: false }));

// SPA fallback — all routes serve index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`InboxGuard frontend on port ${PORT}`);
});