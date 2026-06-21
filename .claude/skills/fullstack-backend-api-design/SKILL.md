---
name: fullstack-backend-api-design
description: Curated prompts for backend API design — REST and GraphQL resource modeling, versioning, pagination, error handling. Use when designing or reviewing a backend API.
---

# Backend API Design — Prompt Library (Full Stack Developer)

API design decisions are some of the hardest to walk back once clients integrate against them, which is why 2026 full-stack work treats API contracts as products in their own right: versioned, documented in OpenAPI/Swagger from day one, and reviewed for backward compatibility before merge. Good API design means resource modeling that reflects the actual domain rather than database tables leaking through, a deliberate choice between REST, GraphQL, and gRPC based on client diversity and query shape (not fashion), consistent error responses (RFC 7807 problem details rather than ad hoc `{error: "string"}` shapes), and pagination that doesn't fall over past page 500. It also means idempotency keys on mutating endpoints so retries from flaky mobile networks don't double-charge a customer, and rate limiting designed around real traffic patterns (token bucket vs sliding window) rather than a single hardcoded number. This skill is for designing new endpoints, reviewing an existing API's contract, and reasoning through versioning and compatibility trade-offs before they become support tickets.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Explain how to model [orders that have line items, each with a product reference and a discount] as REST resources — what are the nested vs flat URL options and what are the trade-offs?
2. Compare REST, GraphQL, and gRPC for [a backend serving a web app, a mobile app, and a third-party partner integration] — which fits this specific mix of clients and why?
3. Explain URL-based versioning (`/v1/orders`) versus header-based versioning (`Accept: application/vnd.api+json;version=1`) for [a public API with external developers depending on it], and tell me which is more maintainable long-term.
4. Compare cursor-based pagination versus offset-based pagination for [an activity feed that gets new items inserted constantly while users scroll], and explain why one avoids skipped/duplicated rows.
5. Walk me through RFC 7807 (Problem Details for HTTP APIs) and show me how I'd restructure my current ad hoc error responses [`{ "error": "Invalid input" }`] to follow it.
6. Explain idempotency keys for [a `POST /payments` endpoint that mobile clients might retry after a timeout] — how do they work end-to-end, client to server to storage?
7. Compare token bucket versus sliding window rate limiting for [a public API tier offering 1000 requests/hour to free users and 100,000/hour to paid users].
8. Explain what backward-compatible schema evolution actually means for [a GraphQL API where I need to deprecate a field 200 clients currently query], step by step.
9. Walk me through designing OpenAPI/Swagger documentation for [an existing Express API with 30 undocumented endpoints] — what's the fastest path to accurate docs that don't drift from the code?
10. Explain the difference between PATCH and PUT semantics for [a `/users/:id` update endpoint] and which clients (web admin panel vs mobile app) should be using which.

## Implementation prompts (build & debug)

1. Design the REST resource model and endpoint list for [an order management system: orders, line items, shipments, refunds] — give me the full route table with HTTP verbs.
2. Write a consistent error-response middleware for [an Express/Fastify API] that converts thrown exceptions into RFC 7807 problem-details JSON with proper status codes.
3. Implement cursor-based pagination for [a `GET /api/posts` endpoint backed by PostgreSQL] using a `(created_at, id)` composite cursor, including the SQL query and the response envelope shape.
4. Debug why this [idempotency-key implementation] is letting duplicate payments through under concurrent retries — here's the code: [paste code].
5. Design and implement a token-bucket rate limiter for [an Express API] using Redis, supporting different limits per [API key tier], with the exact Redis commands used.
6. Write an OpenAPI 3.1 spec for [these 5 existing endpoints: paste route handlers] so I can generate a Swagger UI and a typed client from it.
7. Refactor this [GraphQL schema with a non-nullable field I now need to deprecate] into a backward-compatible version that doesn't break the 200 existing clients querying it.
8. Implement API versioning via URL path for [an existing unversioned `/api/*` Express app] without breaking current clients during the transition — show me the routing strategy.
9. Design the request/response contract for [a bulk import endpoint that accepts up to 10,000 rows] including partial-failure reporting — which rows succeeded, which failed, and why.
10. Write integration tests for [a `/api/orders` endpoint] that verify pagination, error shapes, and idempotency behavior, not just the happy path.

## Advanced prompts (architecture, optimization, edge cases)

1. Design an API gateway strategy for [12 microservices, each with its own internal API] that need to present one consistent, versioned external contract to clients.
2. Critique this [GraphQL schema for an e-commerce catalog] for N+1 query risk and propose a DataLoader-based batching strategy with concrete code.
3. Design a deprecation and sunset policy for [API v1, which 40 third-party integrators still use] — what headers, timelines, and communication strategy minimize breakage?
4. Walk me through designing idempotency for [a distributed system where the payment endpoint might be retried by a load balancer health check failover, not just the client] — where does the idempotency key get stored and checked?
5. Compare designing one unified GraphQL API versus separate REST APIs per client type (web, mobile, partner) for [a product with very different data needs per client] — which avoids over/under-fetching better at scale?
6. Design a strategy for evolving [a public REST API's response shape] when you need to add a required field that old mobile app versions in the wild can't handle.
7. Propose a rate-limiting strategy that accounts for [bursty webhook delivery traffic from a payment provider] without either dropping legitimate webhooks or letting abuse through.
8. Design the error-handling contract for [a long-running async job API] where the client submits a job, polls for status, and needs to distinguish "still processing," "failed validation," and "failed during execution."
9. Critique this API's authentication/authorization design for [mixing API keys, OAuth2 bearer tokens, and session cookies across different endpoints] and propose a more consistent model.
10. Design a contract-testing strategy (e.g., Pact) between [a frontend team and backend team shipping independently] so API changes that would break the consumer are caught in CI before deploy.

## Follow-up / chaining prompts

1. Now write the OpenAPI spec for the order management resource model you just designed, including request/response schemas for each endpoint.
2. Given the RFC 7807 error middleware you wrote, show me how validation errors from [Zod/Joi] should map into that same problem-details shape.
3. Take the cursor-based pagination implementation and show me how to add a `total_count` estimate without doing an expensive `COUNT(*)` on every request.
4. Based on the idempotency-key design, show me the exact database schema and TTL strategy for storing idempotency records so they don't grow unbounded.
5. You proposed an API gateway for the 12 microservices — now show me how versioning would be handled at the gateway layer versus at each individual service.
6. Given the deprecation/sunset policy you outlined for API v1, draft the actual `Deprecation` and `Sunset` HTTP headers and the changelog entry communicating it to integrators.

## Anti-patterns: prompts that get weak answers

**Weak:** "How do I design a good API?"
**Sharper:** "Model orders with line items, product references, and discounts as REST resources — show me the nested vs flat URL options and the trade-offs."

**Weak:** "Should I use REST or GraphQL?"
**Sharper:** "Compare REST, GraphQL, and gRPC for a backend serving a web app, a mobile app, and a third-party partner integration — which fits this client mix?"

**Weak:** "Fix my error handling."
**Sharper:** "Write an Express error-response middleware that converts thrown exceptions into RFC 7807 problem-details JSON with proper status codes."

**Weak:** "How do I prevent duplicate requests?"
**Sharper:** "My idempotency-key implementation is letting duplicate payments through under concurrent retries — here's the code, debug why."

**Weak:** "How should I version my API?"
**Sharper:** "Compare URL-based versioning (/v1/orders) versus header-based versioning for a public API with external developers depending on it — which is more maintainable long-term?"
