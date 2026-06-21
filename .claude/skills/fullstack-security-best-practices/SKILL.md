---
name: fullstack-security-best-practices
description: Curated prompts for application security — OWASP Top 10, input validation, secrets management, dependency vulnerabilities. Use when reviewing or hardening an application's security.
---

# Security Best Practices — Prompt Library (Full Stack Developer)

Application security in 2026 is no longer a separate phase bolted on before launch — it's a continuous discipline woven into every PR, dependency bump, and infrastructure change, driven by the reality that supply-chain attacks (compromised npm packages, typosquatted PyPI packages) now rival classic injection bugs as a breach vector. "Good" here means defaulting to deny (validate and allow-list input rather than block-list), treating every external input as hostile whether it comes from a form field, a query param, a file upload, or a third-party webhook, and never storing a secret in source control when a vault like AWS Secrets Manager or HashiCorp Vault is available. The OWASP Top 10 remains the baseline checklist (with broken access control and injection still topping real-world incident counts), but a 2026 review also has to cover dependency vulnerability scanning (Dependabot, Snyk, `npm audit`) as a recurring CI gate, secure headers and a real Content-Security-Policy rather than a copy-pasted one, and rate limiting that distinguishes abusive traffic from legitimate bursts. Security work pays off disproportionately when it's specific — a generic "is this secure?" review catches far less than a targeted audit against a named threat (SQLi, XSS, CSRF, IDOR) with the actual code in front of the reviewer.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Walk me through the current OWASP Top 10 and tell me which 3 are most relevant to [my app type: e.g. a multi-tenant B2B SaaS with file uploads and a public API], with a concrete example of how each could manifest in my stack.
2. Explain the difference between input validation, sanitization, and output encoding, and tell me exactly which one prevents [XSS vs SQL injection vs command injection] and why the others don't.
3. Compare storing secrets in environment variables versus a managed vault like [AWS Secrets Manager/HashiCorp Vault/Azure Key Vault] for [my deployment: e.g. containers on ECS] — what does the vault actually buy me beyond what `.env` + CI secrets already provide?
4. Explain how a CSRF attack actually works end-to-end against [my app: session-cookie-based vs token-based auth], and why SameSite cookies do or don't fully solve it on their own.
5. Walk me through what `npm audit`, Snyk, and Dependabot each actually check for, and why a dependency can be "vulnerable" in a scanner but not exploitable in my specific usage.
6. Explain what a Content-Security-Policy header actually restricts, and help me understand why `unsafe-inline` in my current CSP for [my app] defeats most of its XSS protection.
7. Compare rate limiting strategies — fixed window, sliding window, token bucket — for protecting [my login endpoint] from credential-stuffing versus protecting [my public API] from scraping.
8. Explain the difference between authentication and authorization failures in the context of [IDOR — insecure direct object reference] and show me a concrete example for [my resource type, e.g. /api/invoices/:id].
9. What's the real-world risk model for [a file upload feature accepting user avatars] — walk me through the attack surface from MIME-type spoofing to path traversal to stored XSS via SVG.
10. Explain what a blameless security incident response process looks like in practice, and what the first three things I should do in the first hour after discovering [a suspected credential leak] are.

## Implementation prompts (build & debug)

1. Review this [Express/Django/Spring Boot] endpoint for SQL injection risk and rewrite any string-concatenated queries as parameterized queries: [paste code].
2. Implement input validation for this API endpoint using [Zod/Joi/Pydantic] that rejects [malformed/oversized/wrong-type] input before it reaches my business logic: [paste current handler].
3. Audit this React component for XSS — specifically anywhere it uses `dangerouslySetInnerHTML` or renders unsanitized user content: [paste component], and fix it with [DOMPurify or safe alternatives].
4. Add CSRF protection to this [session-cookie-authenticated] form submission flow using [a CSRF token / SameSite=Strict cookies / double-submit cookie pattern] — show the server and client-side changes.
5. Move these hardcoded secrets out of the codebase into [AWS Secrets Manager/HashiCorp Vault] and show me the runtime code that fetches and caches them without re-fetching on every request: [paste code with secrets].
6. Implement rate limiting on this login endpoint using [express-rate-limit/Redis-backed token bucket] to block credential-stuffing while not locking out legitimate users behind a shared NAT/corporate IP.
7. Write secure file upload handling for [user avatar uploads] that validates real file type via magic bytes (not just extension), enforces a size limit, strips EXIF/metadata, and stores outside the web root.
8. Set up a CI gate using [Dependabot/Snyk/npm audit] that fails the build on [critical/high severity] vulnerabilities, and show me how to handle a false positive or an unfixable transitive dependency.
9. Debug this IDOR vulnerability — a user can change the `:id` in this URL and access another tenant's data: [paste route/controller code] — fix it by enforcing ownership checks server-side.
10. Write a strict Content-Security-Policy for [my app, e.g. a React SPA loading fonts from Google Fonts and analytics from a third party] that avoids `unsafe-inline` and `unsafe-eval`.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a security code-review checklist tailored to [my stack: e.g. Node/Express + PostgreSQL + React] that a reviewer can run through on every PR touching auth, payments, or user data.
2. Walk through a full OWASP Top 10 audit of [my app's architecture description], identifying which categories are mitigated, which are partially mitigated, and which are unaddressed.
3. Design a secrets-rotation strategy for [database credentials and third-party API keys stored in AWS Secrets Manager] so rotation happens without an app restart or downtime.
4. Critique this rate-limiting design for an API that needs to distinguish [a legitimate mobile app behind shared carrier NAT] from [a credential-stuffing botnet] — what signals beyond raw IP should it use?
5. Design defense-in-depth for [a multi-tenant database] so that even if application-layer tenant-isolation logic has a bug, a database-level control (e.g. row-level security in PostgreSQL) prevents cross-tenant data leakage.
6. Audit this dependency tree for supply-chain risk — flag any [npm/PyPI] packages with recent maintainer changes, low download counts relative to their permissions, or known typosquatting patterns: [paste package.json/requirements.txt].
7. Design an incident-response runbook for [a suspected leaked API key found in a public GitHub repo], covering detection, containment (key rotation), impact assessment, and the blameless postmortem that follows.
8. Walk through how I'd harden [a webhook receiver endpoint from a third-party payment provider] against replay attacks and payload forgery, including signature verification and idempotency.
9. Design a secure-by-default file storage architecture for [user-uploaded documents] so that even a misconfigured ACL on one object can't expose the whole bucket — think presigned URLs, bucket policies, and object-level encryption.
10. Compare the security trade-offs of rolling my own session management versus using a battle-tested auth library/provider for [my app's risk profile and team size], specifically around the OWASP categories I'm least confident defending against in-house.

## Follow-up / chaining prompts

1. Given the OWASP Top 10 audit above, generate a prioritized remediation backlog ranked by exploitability and blast radius for [my app].
2. Now that the SQL injection fix is in, write the regression test that proves the parameterized query can't be bypassed with [a specific malicious payload].
3. Take the CSP you designed above and tell me how to roll it out safely — should I deploy it in `Content-Security-Policy-Report-Only` first, and how do I monitor violation reports before enforcing?
4. Given the rate-limiting design above, now add an alert so my team gets paged when the limiter is triggered at a rate suggesting an active attack rather than normal usage.
5. Now that secrets are in [Vault/Secrets Manager], add audit logging so I can see exactly which service accessed which secret and when.
6. Take the incident-response runbook above and turn it into a tabletop exercise scenario my team can practice against before a real incident happens.

## Anti-patterns: prompts that get weak answers

**Weak:** "Is my app secure?"
**Sharper:** "Audit this Express login endpoint against OWASP A07 (identification and authentication failures) for rate limiting, password policy, and session fixation: [paste code]."

**Weak:** "How do I store secrets safely?"
**Sharper:** "Compare AWS Secrets Manager versus HashiCorp Vault for rotating database credentials on a containerized app running on ECS with 6 services — recommend one and show the rotation flow."

**Weak:** "Fix the XSS in my app."
**Sharper:** "Audit this React component for XSS via dangerouslySetInnerHTML, specifically whether user-submitted markdown is sanitized before render: [paste component]."

**Weak:** "Check my dependencies for vulnerabilities."
**Sharper:** "Run through this npm audit output and tell me which of these 12 vulnerabilities are actually reachable given that I only use the affected package's [specific function], versus which are noise."

**Weak:** "Add rate limiting."
**Sharper:** "Design a sliding-window rate limiter on my /api/login endpoint that allows 5 attempts per 15 minutes per account plus per IP, backed by Redis, with a clear lockout-and-unlock UX."
