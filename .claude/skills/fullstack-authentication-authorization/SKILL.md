---
name: fullstack-authentication-authorization
description: Curated prompts for authentication and authorization — session vs token auth, OAuth/OIDC, RBAC/ABAC, secure password handling. Use when implementing or reviewing auth in an application.
---

# Authentication & Authorization — Prompt Library (Full Stack Developer)

Authentication and authorization remain two of the highest-stakes surfaces in any 2026 full-stack application: get them wrong and you ship account takeover, privilege escalation, or silent data leaks rather than a slow page. Modern stacks lean on OAuth2/OIDC with PKCE even for first-party apps, passkeys/WebAuthn are now a baseline expectation rather than a novelty, and refresh-token rotation plus short-lived access tokens have replaced long-lived session cookies in most API-driven architectures. "Good" in this space means authorization decisions enforced server-side (never trusting a hidden UI button), passwords hashed with argon2id or bcrypt with appropriate cost factors, tokens that are short-lived and rotated, and a clear, auditable model (RBAC, ABAC, or a hybrid) that maps cleanly to your actual business permissions instead of being bolted on after the fact. Service-to-service auth (mTLS, signed service tokens, workload identity) deserves the same rigor as user-facing auth, since lateral movement inside a trusted network is a common real-world breach pattern. Because auth bugs are often invisible until exploited, this is also an area where deliberately asking an AI assistant to "attack" your own design is one of the highest-leverage prompts you can run.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Explain the practical trade-offs between server-side session cookies and JWT-based stateless auth for [my app: e.g. a multi-tenant SaaS with a separate mobile client], including how each handles logout, revocation, and horizontal scaling.
2. Walk me through the OAuth2 authorization code flow with PKCE step by step, and tell me exactly which steps change if my client is a [single-page app vs native mobile app vs server-rendered web app].
3. Compare RBAC and ABAC for [my domain: e.g. a healthcare scheduling app with patients, providers, and admins], and recommend which model fits better given that permissions depend on [specific contextual condition, e.g. whether the provider is assigned to that patient].
4. What's the actual difference between OIDC and plain OAuth2, and why would I need an ID token in addition to an access token in [my use case]?
5. Compare bcrypt, scrypt, and argon2id for password hashing in 2026 — what cost parameters should I use for [expected login throughput] and what's the migration path if I need to re-hash passwords on next login?
6. Explain how refresh-token rotation with reuse detection works, and what an attacker gains if they steal a refresh token from [my storage mechanism: httpOnly cookie vs localStorage vs mobile secure storage].
7. Compare implementing my own OAuth/OIDC provider versus integrating Auth0, Okta, or AWS Cognito for [my company size and compliance requirements, e.g. SOC2-bound B2B SaaS with 50 enterprise customers].
8. Explain how WebAuthn/passkeys actually work under the hood — what's stored on the device, what's stored on my server, and how does this eliminate phishing compared to TOTP-based MFA?
9. What does "authorization at the API layer vs the UI layer" mean in practice, and show me a concrete example of a permission check that's safe to skip in the UI but never safe to skip in the API for [my resource type].
10. Explain SAML vs OIDC for enterprise SSO — when would a customer's IT department insist on SAML in 2026, and what do I need to support both without duplicating my user-provisioning logic?

## Implementation prompts (build & debug)

1. Write a [Node.js/Express or FastAPI] middleware that validates a JWT access token, checks its expiry and signature, and attaches the decoded claims to the request — include the algorithm allowlist so it's not vulnerable to algorithm confusion attacks.
2. Design the database schema and rotation logic for refresh tokens in [my stack: e.g. PostgreSQL + Redis], including how I detect and respond to refresh-token reuse (a sign of token theft).
3. Implement a PKCE-based OAuth2 authorization code flow against [Auth0/Okta/Keycloak] for a [React SPA], including the code verifier/challenge generation and the token exchange call.
4. Debug why my RBAC middleware is letting a `[role name]` user access a `[protected resource]` endpoint it shouldn't — here's my permission-check function and route definitions: [paste code].
5. Write the TOTP setup and verification flow for MFA in [my backend language], including how I generate and securely store the QR-code secret and handle backup/recovery codes.
6. Implement WebAuthn registration and authentication endpoints for passkey login in [my stack], and explain how I should let users fall back to password+MFA if their device doesn't support passkeys.
7. Review this password-reset flow for vulnerabilities — specifically token predictability, expiry, and whether the reset link invalidates existing sessions: [paste code/flow description].
8. Write an ABAC policy-evaluation function that checks `[resource].ownerId === user.id OR user.role === 'admin' OR user.department === resource.department` and show how to structure this so it's testable independent of the HTTP layer.
9. Implement service-to-service authentication using mTLS between [service A] and [service B] in [Kubernetes/Docker Compose], including certificate rotation.
10. Debug why JWTs are showing up in my application logs at [logging point] — show me how to redact tokens and PII from [Winston/Pino/structured logging library] output without losing useful debug context.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a token-revocation strategy for stateless JWTs that lets me force-logout a compromised user immediately, given that JWTs are normally valid until expiry — compare a denylist in Redis versus shortening access-token TTL versus a hybrid approach.
2. Critique this multi-tenant authorization design for cross-tenant data leakage risks: [describe schema/middleware], specifically focusing on whether tenant ID is enforced at the query layer or only at the application layer.
3. Design an authorization caching layer so I'm not hitting the database on every request to resolve a user's roles/permissions, while keeping cache invalidation correct when an admin revokes a role mid-session.
4. Walk through how JWT algorithm confusion attacks work (RS256 vs HS256 key confusion) and audit this token-verification code for the vulnerability: [paste code].
5. Design a zero-trust internal architecture where every service-to-service call requires a signed, short-lived service token or mTLS, even inside our VPC — what's the operational cost of this versus trusting the network perimeter?
6. Compare storing access tokens in httpOnly cookies versus in-memory JS variables for an SPA, accounting for CSRF protection, XSS exposure, and the need to survive a page refresh.
7. Design an SSO provisioning flow (SCIM) so enterprise customers using [Okta/Azure AD] can auto-provision and de-provision users in my app, and explain the failure mode if de-provisioning silently fails.
8. Audit this OAuth redirect_uri validation logic for open-redirect or authorization-code-interception vulnerabilities: [paste code].
9. Design a privilege-escalation test suite — list the specific authorization edge cases (horizontal escalation between tenants, vertical escalation via role manipulation, IDOR on resource IDs) I should write automated tests for in [my app].
10. Design a graceful key-rotation strategy for the signing key used to issue JWTs, so that tokens issued under the old key remain valid until expiry while new tokens use the new key, without downtime.

## Follow-up / chaining prompts

1. Given the RBAC vs ABAC recommendation above, generate the concrete permission matrix for my actual roles: [list roles] and resources: [list resources].
2. Now that I have the OAuth2/PKCE flow working, add silent token refresh so the user isn't logged out when the access token expires mid-session.
3. Take the refresh-token rotation design above and add an admin-facing "active sessions" view where a user can see and revoke individual device sessions.
4. Now stress-test the authorization design you proposed: what happens if [a specific role is deleted while users are actively assigned to it]?
5. Convert the MFA/TOTP implementation above into a step-up-auth flow that only re-prompts for MFA when the user attempts a [high-risk action, e.g. changing their email or exporting data].
6. Given the service-to-service mTLS design, now write the certificate-rotation automation so certs renew without a deploy or downtime.

## Anti-patterns: prompts that get weak answers

**Weak:** "How do I do auth in my app?"
**Sharper:** "Compare session cookies vs JWT for a Next.js app with a separate mobile client that needs offline token refresh — recommend one and justify it against my revocation requirements."

**Weak:** "Is my login secure?"
**Sharper:** "Audit this login endpoint for timing attacks on user-enumeration, password-hash comparison method, and rate-limiting gaps: [paste code]."

**Weak:** "Add roles to my app."
**Sharper:** "Design an RBAC schema for a project-management app with Owner, Admin, Member, and Guest roles where Guests can only view tasks assigned to them — show the schema and the middleware enforcing it."

**Weak:** "What's OAuth?"
**Sharper:** "Walk through the OAuth2 authorization code flow with PKCE for a React SPA calling a FastAPI backend, and tell me exactly which tokens get stored where."

**Weak:** "Make passwords secure."
**Sharper:** "Recommend argon2id parameters (memory cost, iterations, parallelism) for a login system expecting 50 logins/second on a 2 vCPU container, and show the hashing/verification code in [language]."
