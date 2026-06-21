---
name: fullstack-performance-optimization-caching
description: Curated prompts for performance optimization and caching — frontend/backend bottleneck diagnosis, caching layers, CDN strategy. Use when an application is slow and you need to diagnose or fix performance.
---

# Performance Optimization & Caching — Prompt Library (Full Stack Developer)

Performance work in 2026 spans Core Web Vitals (LCP, CLS, INP — INP having replaced FID as the responsiveness metric Google actually scores), backend latency under real concurrency, and the caching layers that sit between the two: browser cache, CDN edge cache, application-level caches like Redis, and database query caches. "Good" looks like a measured baseline before any change, a specific bottleneck identified with profiling data (flame graphs, APM traces, Lighthouse/WebPageTest reports) rather than guesswork, and a fix validated under realistic load with a tool like k6 or Locust rather than assumed from a code read. The hardest part of this work is usually not fixing the bottleneck once found — it's resisting the urge to optimize code that isn't actually on the hot path, and choosing the right caching strategy (cache-aside, write-through, TTL-based) for the specific staleness tolerance of the data, since a wrong invalidation strategy causes worse incidents than the slowness it was meant to fix. N+1 queries, missing indexes, unbounded connection pools, and unbundled/unsplit JS are still the most common root causes found in 2026 production apps, ahead of anything exotic.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Explain what LCP, CLS, and INP actually measure and which user interactions on [my page type, e.g. a product listing page with infinite scroll] are most likely to be hurting my INP score specifically.
2. Compare browser cache, CDN edge cache (e.g. CloudFront/Fastly/Cloudflare), and an application-level cache like Redis for [my use case: e.g. a personalized dashboard with per-user data] — which layer should own which kind of data?
3. Walk me through how a flame graph from [Node.js --prof / py-spy / Chrome DevTools Performance tab] is structured, and how I'd read one to find the actual bottleneck function versus just the deepest stack frame.
4. Explain the difference between cache-aside, write-through, and write-behind caching strategies, and recommend which fits [my data: e.g. user session state that must never be stale for more than a few seconds].
5. What's an N+1 query problem in practice, and how would I recognize one in [my ORM: e.g. Prisma, SQLAlchemy, ActiveRecord] query logs versus in raw SQL logs?
6. Compare TTL-based cache expiration versus explicit invalidation-on-write for [my data type: e.g. product inventory counts] — what's the staleness risk of each under [my read/write ratio]?
7. Explain what a connection pool actually does between my app and [PostgreSQL/MySQL], and how I'd reason about the right pool size given [my expected concurrent request count] and [number of app instances].
8. Walk me through how code splitting and lazy loading work in [Webpack/Vite/Next.js], and which of my routes are good candidates if [my bundle analyzer report shows a 2MB main chunk].
9. Explain the difference between an APM tool's "trace" view and "flame graph" view in [Datadog/New Relic/Grafana Tempo], and which one I should reach for first when a single endpoint is slow versus when the whole service is slow.
10. What's the actual cost-benefit of premature optimization here — given [describe a function/endpoint], is this worth optimizing now or should I wait until I have profiling data showing it's actually hot?

## Implementation prompts (build & debug)

1. Profile this [Express/FastAPI/Django] endpoint that's taking [X]ms at p95 and tell me where the time is actually going based on this trace: [paste APM trace or flame graph description].
2. Add a Redis cache-aside layer in front of this database query: [paste query/ORM call], including key design, TTL choice, and the cache-stampede protection if many requests miss simultaneously.
3. Debug this N+1 query pattern in [my ORM]: [paste model/query code] and rewrite it using eager loading / a join so it executes in one round trip.
4. Write a database migration to add the missing index that would speed up this slow query: [paste EXPLAIN/EXPLAIN ANALYZE output], and explain why the planner is currently doing a sequential scan.
5. Set up code splitting for this [React/Vue/Angular] route tree so [my heavy admin panel route] isn't in the initial bundle, and verify the resulting chunk sizes with [Webpack Bundle Analyzer/vite-bundle-visualizer].
6. Write a k6 load test script that ramps from [10 to 500] virtual users over [duration] against [my endpoint], and tell me what p95/p99 latency and error-rate thresholds I should assert as pass/fail criteria.
7. Debug why my CDN ([CloudFront/Cloudflare/Fastly]) is showing a low cache-hit ratio on [my static asset path] — review these response headers and cache-control config: [paste config/headers].
8. Implement cache invalidation for [a product catalog] so that updating a product in the database also evicts or updates the corresponding Redis key and any CDN-cached API response, without race conditions.
9. Tune the connection pool settings for [Prisma/SQLAlchemy/HikariCP] given that I'm seeing [connection pool exhausted / timeout] errors under [X concurrent requests against Y max pool size].
10. Debug this CLS regression that appeared after [a recent deploy/feature] — here's the Lighthouse report and the layout-shift culprits it flagged: [paste report excerpt].

## Advanced prompts (architecture, optimization, edge cases)

1. Design a multi-tier caching architecture (browser → CDN → Redis → DB query cache) for [my app type], specifying exactly what TTL and invalidation rule applies at each tier and why they're allowed to differ.
2. Critique this cache-stampede mitigation (or lack of one) for a [high-traffic cache key, e.g. homepage feed] that expires and gets hit by [thousands of concurrent requests] simultaneously: [describe current behavior].
3. Design a strategy for cache invalidation across [multiple service instances / a multi-region deployment] where a write in [region A] needs to invalidate a cached read in [region B] within [latency budget].
4. Walk through how I'd diagnose whether a slow [API response] is a frontend rendering problem, a network/CDN problem, or a backend/database problem, given only [a single Time to First Byte and Time to Interactive number] from a user complaint.
5. Design a read-replica strategy for [PostgreSQL/MySQL] to offload [reporting/analytics queries] from the primary, including how the application decides which queries are safe to route to a replica given [replication lag tolerance].
6. Compare optimizing this hot path by adding a cache versus optimizing the underlying algorithm/query for [describe the bottleneck] — when is caching masking a real inefficiency I should fix instead?
7. Design a CDN strategy for [a Next.js app with both static and personalized pages] so that static assets get long-TTL edge caching while personalized API responses bypass the CDN safely.
8. Audit this connection-pooling and retry configuration for cascading-failure risk under [a downstream database slowdown]: [paste config], specifically whether retries amplify load on an already-struggling dependency.
9. Design a load-testing plan with [k6 or Locust] that simulates [a realistic traffic pattern, e.g. flash-sale spike from 50 to 5000 RPS in 2 minutes] and identifies the first component to fall over.
10. Walk through the trade-offs of moving [a computation, e.g. PDF generation or image resizing] from synchronous request-time work to an async job queue ([BullMQ/Celery/SQS]) — what does this do to perceived latency versus total system throughput?

## Follow-up / chaining prompts

1. Given the flame graph analysis above, now show me the specific code change that collapses that hot function from [X]ms to a target of [Y]ms.
2. Now that the N+1 query is fixed, re-run the load test assumptions — does my connection pool size from before still make sense at the new, lower per-request DB load?
3. Take the Redis cache-aside design above and add metrics/logging so I can actually measure my cache hit ratio in [Datadog/Grafana] going forward.
4. Given the code-splitting plan above, now show me how to add a loading skeleton so the lazy-loaded chunk doesn't introduce a new CLS regression.
5. Now that I have a caching layer in front of the database, design the cache-warming step so a cold cache after a deploy doesn't cause a thundering-herd spike on the database.
6. Take the k6 load test results above and tell me whether the bottleneck that appeared at [X RPS] is the same one your earlier flame-graph analysis predicted, or something new.

## Anti-patterns: prompts that get weak answers

**Weak:** "My app is slow, how do I make it faster?"
**Sharper:** "My checkout API endpoint is at p95 800ms under 200 concurrent users — here's the APM trace showing 600ms in a single DB call: [paste trace]. Help me find why and fix it."

**Weak:** "Should I use caching?"
**Sharper:** "Compare cache-aside in Redis versus a CDN-level cache for this product-listing API that's read 100x more than it's written and tolerates 30 seconds of staleness — which fits better and what TTL would you set?"

**Weak:** "Optimize my React app."
**Sharper:** "My Lighthouse report shows LCP at 4.2s driven by a 1.8MB hero image and a render-blocking font — here's the report: [paste]. Give me the specific fixes ranked by expected LCP improvement."

**Weak:** "Is my database query slow?"
**Sharper:** "Here's the EXPLAIN ANALYZE output for a query taking 1.2s on a 5M-row table: [paste]. Tell me whether this needs an index, a query rewrite, or both."

**Weak:** "Load test my API."
**Sharper:** "Write a k6 script ramping from 20 to 800 virtual users over 5 minutes against my /api/orders POST endpoint, and tell me what p99 latency and error-rate I should treat as a failed test."
